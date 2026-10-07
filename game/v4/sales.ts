import {economicDemandFactor,portfolioDemand}from './global.ts';
import {orderOffers}from './content/orders.ts';
import {franchiseBrandFactor} from './franchise-brand.ts';
import{resolveConsumerSales}from'./consumer-sales.ts';import{consumerReservedQuantity}from'./channel-stock.ts';
import {regionForCity} from './content/regions.ts';
import type {V4State,DomainEvent,InventoryLot,ProductOffer,SalesResult} from './model.ts';
import {catalog} from './catalog.ts';
import {debit,credit,post} from './finance.ts';
import {forecastMarket,realizeMarket,sampleMarket} from './demand.ts';
function local(state:V4State,lot:InventoryLot,cityId:string):boolean {return state.warehouses.some(w=>w.cityId===cityId&&(lot.locationId===w.id||lot.locationId==='overflow:'+w.id))||state.factories.some(f=>f.cityId===cityId&&f.id===lot.locationId);}
function eligible(state:V4State,recipeId:string,cityId:string,quality:number,contractId?:string):InventoryLot[]{return state.inventory.filter(l=>l.kind==='finished'&&state.recipeRevisions.some(r=>r.id===l.recipeRevisionId&&r.recipeId===recipeId)&&(local(state,l,cityId)||!!contractId&&l.locationId==='buyer:'+contractId&&state.contracts.some(c=>c.id===contractId&&c.cityId===cityId))&&l.arrivalWeek<=state.week&&l.expiryWeek>=state.week&&l.quality*l.condition/100>=quality&&l.quantity>l.reservations.filter(r=>r.contractId!==contractId).reduce((n,r)=>n+r.quantity,0)+consumerReservedQuantity(state,l.id)).sort((a,b)=>a.expiryWeek-b.expiryWeek||a.id.localeCompare(b.id));}
function allocate(lots:InventoryLot[],target:number,contractId?:string,state?:V4State):{quantity:number;costCents:number;allocations:{factoryId:string;quantity:number;costCents:number}[]} {
 let quantity=0,costCents=0;const allocations=new Map<string,{factoryId:string;quantity:number;costCents:number}>();
 for(const lot of lots){const available=lot.quantity-lot.reservations.filter(r=>r.contractId!==contractId).reduce((n,r)=>n+r.quantity,0)-(state?consumerReservedQuantity(state,lot.id):0),taken=Math.min(target-quantity,available);if(taken<=0)continue;
 const cost=taken===lot.quantity?lot.costCents:Math.floor(lot.costCents*taken/lot.quantity);lot.quantity-=taken;lot.costCents-=cost;quantity+=taken;costCents+=cost;const part=allocations.get(lot.factoryId!)??{factoryId:lot.factoryId!,quantity:0,costCents:0};part.quantity+=taken;part.costCents+=cost;allocations.set(part.factoryId,part);
 let reservedTake=taken;for(const r of lot.reservations.filter(r=>r.contractId===contractId)){const used=Math.min(reservedTake,r.quantity);r.quantity-=used;reservedTake-=used;}lot.reservations=lot.reservations.filter(r=>r.quantity>0);if(quantity===target)break;
 }
 return {quantity,costCents,allocations:[...allocations.values()]};
}
export function resolveSales(state:V4State,event:DomainEvent,previewSample?:number):SalesResult {
 const result:SalesResult={tickId:event.id,week:state.week,contracts:[],retail:[],forecast:null,market:null};
 for(const contract of state.contracts.filter(c=>c.status==='accepted').sort((a,b)=>a.dueEnd-b.dueEnd||a.id.localeCompare(b.id))){
  if(state.week<contract.dueStart)continue;
  if(state.week<=contract.dueEnd){
   const offer=orderOffers.find(o=>o.id===contract.offerId),weeklyLimit=offer?.kind==='framework'?Math.min(contract.cases-contract.fulfilledCases,Math.ceil(contract.cases/52)):contract.cases-contract.fulfilledCases,remaining=weeklyLimit,lots=eligible(state,contract.recipeId,contract.cityId,contract.minimumQuality,contract.id).filter(l=>(!contract.packagingId||l.packagingId===contract.packagingId)&&l.expiryWeek-state.week+1>=(contract.minimumShelfWeeks??1)),delivery=allocate(lots,remaining,contract.id,state);
   if(delivery.quantity){const before=contract.fulfilledCases;contract.fulfilledCases+=delivery.quantity;
    const revenueCents=delivery.quantity*contract.priceCents,depositReleasedCents=Math.floor(contract.depositCents*contract.fulfilledCases/contract.cases)-Math.floor(contract.depositCents*before/contract.cases),receivableCents=revenueCents-depositReleasedCents;
    if(receivableCents<0)throw Error('Contract deposit exceeds its earned delivery value.');
    let cumulative=before;
    for(const part of delivery.allocations){
     const partRevenue=part.quantity*contract.priceCents,partDeposit=Math.floor(contract.depositCents*(cumulative+part.quantity)/contract.cases)-Math.floor(contract.depositCents*cumulative/contract.cases),partReceivable=partRevenue-partDeposit,scope={factoryId:part.factoryId,regionId:regionForCity(contract.cityId),channelId:'wholesale'};cumulative+=part.quantity;
     post(state,event,'Contract delivery recognized; deposit released and balance receivable',[debit('customer-deposits',partDeposit,contract.id),debit('receivables',partReceivable,contract.id),credit('contract-revenue',partRevenue,contract.id)],contract.id+':delivery:'+part.factoryId,scope,'contract-delivery');
     if(part.costCents)post(state,event,'Contract finished-goods acquisition cost sold',[debit('cogs',part.costCents,contract.id),credit('finished-inventory',part.costCents)],contract.id+':cogs:'+part.factoryId,scope,'contract-cogs');
     if(partReceivable&&contract.settlementDelay===0)post(state,event,'Immediate contractual balance received',[debit('cash',partReceivable),credit('receivables',partReceivable,contract.id)],contract.id+':immediate-cash:'+part.factoryId,scope);
     if(partReceivable&&contract.settlementDelay>0)state.receivables.push({id:event.id+':'+contract.id+':'+part.factoryId,contractId:contract.id,dueWeek:state.week+contract.settlementDelay,amountCents:partReceivable,collected:false,scope});
    }
    result.contracts.push({contractId:contract.id,deliveredCases:delivery.quantity,revenueCents,depositReleasedCents,receivableCents});
    if(contract.fulfilledCases===contract.cases){contract.status='fulfilled';for(const lot of state.inventory)lot.reservations=lot.reservations.filter(r=>r.contractId!==contract.id);}
   }
  }
  if(contract.status==='accepted'&&state.week>=contract.dueEnd){
   contract.status='failed';const refund=contract.depositCents-Math.floor(contract.depositCents*contract.fulfilledCases/contract.cases),refundPaid=Math.min(state.cashCents,refund),refundDue=refund-refundPaid;
   if(refund)post(state,event,'Unfulfilled customer deposit refunded or transferred to refund payable',[debit('customer-deposits',refund,contract.id),credit('cash',refundPaid),credit('arrears',refundDue,contract.id)],contract.id+':refund');
   if(refundDue)state.unpaidObligations.push({id:event.id+':'+contract.id+':refund',account:'customer-deposits',cents:refundDue,sinceWeek:state.week});
   const penaltyPaid=Math.min(state.cashCents,contract.penaltyCents),penaltyDue=contract.penaltyCents-penaltyPaid;
   if(contract.penaltyCents)post(state,event,'Disclosed service penalty for missed delivery',[debit('fees',contract.penaltyCents,contract.id),credit('cash',penaltyPaid),credit('arrears',penaltyDue,contract.id)],contract.id+':penalty');
   if(penaltyDue)state.unpaidObligations.push({id:event.id+':'+contract.id+':penalty',account:'fees',cents:penaltyDue,sinceWeek:state.week});
   for(const lot of state.inventory)lot.reservations=lot.reservations.filter(r=>r.contractId!==contract.id);
   if(refundDue+penaltyDue)state.campaign.status='recovery';
  }
 }
 resolveConsumerSales(state,event,previewSample);
 // Opening direct retail is local SF. Owned stores and ecommerce add dated
 // channel contexts later, sharing these same external-sale allocation rules.
 const cityId='sf',offers:ProductOffer[]=state.recipeRevisions.filter(r=>r.released&&(!state.directAssortment||state.directAssortment.includes(r.id))).flatMap(revision=>{
  const recipe=catalog.recipes.find(r=>r.id===revision.recipeId)!,allLots=state.inventory.filter(l=>l.kind==='finished'&&l.recipeRevisionId===revision.id&&local(state,l,cityId)),families=[...new Set([revision.packagingId,...allLots.map(l=>l.packagingId!)])];
  return families.map(packagingId=>{const id=packagingId==='ordinary-wrap'?revision.id:revision.id+':'+packagingId,lots=eligible(state,recipe.id,cityId,0).filter(l=>l.recipeRevisionId===revision.id&&l.packagingId===packagingId),physical=allLots.filter(l=>l.packagingId===packagingId),stock=lots.length?lots:physical,quantity=stock.reduce((n,l)=>n+l.quantity,0),quality=quantity?stock.reduce((n,l)=>n+l.quantity*l.quality*l.condition/100,0)/quantity:state.marketMemory[id]?.quality??65;
   return {id,recipeRevisionId:revision.id,priceCents:state.prices[revision.id]??recipe.referencePriceCents,quality,flavor:quantity?recipe.flavor.map((_,i)=>stock.reduce((n,l)=>n+l.quantity*(l.flavor?.[i]??recipe.flavor[i]),0)/quantity) as ProductOffer['flavor']:recipe.flavor,packagingId};});
 });
 if(offers.length){
  const stores=(state.consumerChannels??[]).filter(c=>c.active&&c.kind==='owned-retail'&&c.cityId==='sf'&&c.readyWeek<=state.week).length;const context={economicFactor:economicDemandFactor(state),...(stores?{segmentShares:{value:1/(stores+1),gifting:1/(stores+1),enthusiast:1/(stores+1),online:0}}:{}),cityId,week:state.week,seed:state.random.seed,cursor:state.random.cursor,trust:state.brandTrust*franchiseBrandFactor(state,cityId),service:state.serviceTrust,awareness:Math.min(1,state.brandAwareness+portfolioDemand(state,cityId))};
  result.forecast=forecastMarket(context,offers);result.market=previewSample===undefined?realizeMarket(context,offers):sampleMarket(context,offers,previewSample);state.random.cursor++;
  for(const offer of offers){const recipe=state.recipeRevisions.find(r=>r.id===offer.recipeRevisionId)!,demandCases=result.market.offers.find(o=>o.id===offer.id)!.demandCases,lots=eligible(state,recipe.recipeId,cityId,0).filter(l=>l.recipeRevisionId===recipe.id&&l.packagingId===offer.packagingId),reserved=state.inventory.some(l=>l.recipeRevisionId===recipe.id&&l.reservations.length),sale=allocate(lots,demandCases,undefined,state),revenueCents=sale.quantity*offer.priceCents;
   for(const part of sale.allocations){const scope={factoryId:part.factoryId,regionId:regionForCity(cityId),channelId:'direct'};
    if(part.quantity)post(state,event,'External direct retail sale',[debit('cash',part.quantity*offer.priceCents),credit('retail-revenue',part.quantity*offer.priceCents,offer.id)],offer.id+':retail:'+part.factoryId,scope,'retail-sale');
    if(part.costCents)post(state,event,'Retail finished-goods acquisition cost sold',[debit('cogs',part.costCents,offer.id),credit('finished-inventory',part.costCents)],offer.id+':retail-cogs:'+part.factoryId,scope,'retail-cogs');
   }
   result.retail.push({offerId:offer.id,recipeRevisionId:offer.recipeRevisionId,packagingId:offer.packagingId,priceCents:offer.priceCents,demandCases,soldCases:sale.quantity,revenueCents,cogsCents:sale.costCents,unservedCases:demandCases-sale.quantity,reason:demandCases===0?'Price or offer resistance':sale.quantity<demandCases?reserved?'Reserved stock':'Insufficient eligible stock':'Demand served'});
   state.marketMemory[offer.id]={quality:offer.quality};
  }
 }
 state.inventory=state.inventory.filter(l=>l.quantity>0);return result;
}
