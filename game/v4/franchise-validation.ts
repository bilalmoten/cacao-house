import {economicPriceFactor,economicFreightFactor} from './global.ts';
import {spotSupplierUsage} from './supplier-usage.ts';
import {teamsBefore,fieldTeamMinutes} from './teams.ts';
import {finishedQuantityHistory} from './finished-quantities.ts';
import {franchiseSupplyQuote,deliverFranchiseSupply} from './franchise-supply.ts';
import type {V4State,DomainEvent,FranchiseCohort,FranchiseWeek,LedgerScope,Posting,Loan,InventoryLot,FranchiseSupplyOrder,FranchiseSupplyDelivery,ConsumerOrder} from './model.ts';
import {initialFranchiseCohort} from './franchise-cohorts.ts';
import {franchisePartners} from './content/franchise-partners.ts';
import {regionForCity} from './content/regions.ts';
import {staffBefore} from './staff-history.ts';
import {franchiseTerms} from './franchise.ts';
import {issuedLegacyFranchiseClose} from './legacy-development-franchise.ts';
import {franchiseBrandFactor} from './franchise-brand.ts';
import {operatePartner} from './partner-week.ts';
import {franchiseFundingAt} from './franchise-funding-history.ts';
import {debit,credit,serviceLoan,starterLoan,installment} from './finance.ts';
import {facilities,type FacilityId} from './commercial-finance.ts';
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
const uint=(n:unknown):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
/** Replay private physical operations from signed intake and dated paid support.
 * Partner turnover and capital never establish group income. */
export function franchiseCohortEvidenceErrors(s:V4State):string[]{try{return replay(s)}catch{return ['Invalid franchise cohort authority or physical operating history'];}}
function replay(s:V4State){
 const errors:string[]=[],orders:FranchiseSupplyOrder[]=[],consumerOrders=new Map<string,ConsumerOrder>();let centralInventory:InventoryLot[]=[];const live=s.franchiseCohorts??[],history=s.franchiseHistory??[];
 if(!Array.isArray(live)||!Array.isArray(history))return ['Invalid franchise operating collections'];
 if(!live.length&&!history.length&&!s.events.some(e=>['open-franchise-cohort','franchise-cohort-policy','franchise-supply-order'].includes(e.type)||e.details.franchiseActuals!==undefined)&&!s.ledger.some(j=>j.postings.some(p=>p.account==='royalty-revenue'||p.account==='supply-revenue'||p.entityId?.startsWith('cohort:'))))return [];
 const finishedHistory=s.events.some(e=>e.type==='franchise-supply-order')?finishedQuantityHistory(s):undefined;
 const cashPrefixes=[0];for(const j of s.ledger)cashPrefixes.push(cashPrefixes.at(-1)!+j.postings.filter(p=>p.account==='cash').reduce((n,p)=>n+p.debitCents-p.creditCents,0));
 const cohorts:FranchiseCohort[]=[],weeks:FranchiseWeek[]=[],known=new Set(['rafi']),packs=new Map<string,string>(),seen=new Set<string>(),prior:DomainEvent[]=[],validatedJournal=new Set<string>(),visited=new Set(['sf']),loans:Loan[]=[starterLoan()];
 const exact=(e:DomainEvent,suffix:string,scope:LedgerScope,postings:Posting[])=>{const j=s.ledger.filter(j=>j.id===e.id+':'+suffix);return j.length===1&&j[0].eventId===e.id&&j[0].week===e.week&&same(j[0].scope,scope)&&same(j[0].postings,postings);};
 for(const [index,e]of s.events.entries()){
  if(e.type==='travel'&&Number(e.details.elapsedWeeks)===0)visited.add(e.entityIds[0]);
  if(e.type==='select-funding'&&JSON.parse(e.signature).package==='leveraged')loans[0]=starterLoan(true);
  if(e.type==='take-loan'){const id=e.entityIds[0],terms=facilities[e.details.facility as FacilityId],principal=Number(e.details.principalCents);if(!terms)throw Error('Loan terms');loans.push({id,principalCents:principal,weeklyRateBps:terms.rate,installmentCents:installment(principal,terms.rate,terms.term),remainingWeeks:terms.term,nextDueWeek:e.week,arrearsCents:0,arrearsPrincipalCents:0,arrearsInterestCents:0,feesCents:0,arrearsSinceWeek:null,status:'active',bridge:false});}
  if(e.type==='finance-recovery'){if(e.details.option==='restructure')for(const loan of loans)Object.assign(loan,{status:'settled',principalCents:0,arrearsCents:0,feesCents:0,arrearsInterestCents:0,arrearsPrincipalCents:0});loans.push({id:String(e.details.loanId),principalCents:Number(e.details.principalCents),weeklyRateBps:Number(e.details.weeklyRateBps),installmentCents:Number(e.details.installmentCents),remainingWeeks:Number(e.details.termWeeks),nextDueWeek:e.week,arrearsCents:0,arrearsPrincipalCents:0,arrearsInterestCents:0,feesCents:0,arrearsSinceWeek:null,status:'active',bridge:e.details.option==='bridge'});}
  if(e.type==='discover-supplier')known.add(e.entityIds[0]);
  if(e.type==='select-packaging')packs.set(String(e.details.recipeRevisionId),String(e.details.packagingId));
  if(e.type==='open-franchise-cohort'){
   const p=JSON.parse(e.signature),standard=s.franchiseStandards?.find(q=>q.id===p.standardId),hub=s.franchiseSupportHubs?.find(q=>q.id===p.hubId),partner=franchisePartners.find(q=>q.id===p.partnerId);
   if(!standard||!hub||!partner||!visited.has(partner.cityId)||partner.stage>s.campaign.stage||p.id!==e.id||p.type!==e.type||seen.has(p.partnerId)||!uint(p.stores)||p.stores<1||p.stores>partner.maximumStores||!uint(p.priceFactorBps)||p.priceFactorBps<7000||p.priceFactorBps>16000||p.grade!==undefined&&!['standard','premium'].includes(p.grade)||hub.readyWeek>e.week||regionForCity(hub.cityId)!==regionForCity(partner.cityId)||!prior.some(ev=>ev.id===standard.id.slice(9))||!prior.some(ev=>ev.id===hub.id.slice(8)))throw Error('Intake authority');
   const openingStage=prior.filter(q=>q.type==='review-chapter').at(-1)?.details.stage;if(openingStage!==undefined&&partner.stage>Number(openingStage))throw Error('Partner stage');
   if(standard.supply==='local'&&p.warehouseId!==undefined||standard.supply==='central'&&!s.warehouses.some(w=>w.id===p.warehouseId&&(w.id==='sf-storage'||prior.some(ev=>ev.entityIds.includes(w.id)))))throw Error('Supply authority');
   const past=staffBefore(s,hub.leaderId,e),capacity=past&&past.employee.departedWeek===undefined&&['manager','commercial'].includes(past.employee.role)&&past.employee.skills.management>=75?Math.floor((past.employee.contractedMinutes*(past.training?.5:1)+fieldTeamMinutes({...s,week:e.week,cohortTeams:teamsBefore(s,e)},hub.id))/franchiseTerms.supportMinutesPerStore):0,reserved=cohorts.filter(c=>c.hubId===hub.id),cost=reserved.reduce((n,c)=>n+c.stores*s.franchiseStandards!.find(q=>q.id===c.standardId)!.weeklySupportCents,0);
   if(reserved.reduce((n,c)=>n+c.stores,0)+p.stores>capacity||cost+p.stores*standard.weeklySupportCents>hub.weeklyBudgetCents)throw Error('Intake capacity');
   const c=initialFranchiseCohort(p,standard,e.id,e.week),scope={regionId:regionForCity(partner.cityId),channelId:'franchise-royalties'};
   if(!same(e.entityIds,[c.id,partner.id,standard.id,hub.id])||e.details.cohort!==JSON.stringify(c)||e.details.partnerCapitalCents!==partner.capitalPerStoreCents*c.stores||e.details.partnerFitoutCents!==partner.fitoutPerStoreCents*c.stores||s.ledger.filter(j=>j.eventId===e.id).length!==1||!exact(e,'partner-advance',scope,[debit('cash',c.feeRemainingCents),credit('customer-deposits',c.feeRemainingCents,c.id)]))throw Error('Opening payment');
   validatedJournal.add(e.id+':partner-advance');seen.add(partner.id);cohorts.push(c);
  }
  if(e.type==='franchise-cohort-policy'){
   const p=JSON.parse(e.signature),c=cohorts.find(c=>c.id===p.cohortId);
   if(!c||p.id!==e.id||p.type!==e.type||typeof p.paused!=='boolean'||!uint(p.priceFactorBps)||p.priceFactorBps<7000||p.priceFactorBps>16000||!uint(p.extraTrainingWeeks)||p.extraTrainingWeeks<c.extraTrainingWeeks||p.extraTrainingWeeks>12||p.grade!==undefined&&!['standard','premium'].includes(p.grade)||!same(e.entityIds,[c.id])||e.details.policy!==JSON.stringify({cohortId:p.cohortId,paused:p.paused,priceFactorBps:p.priceFactorBps,extraTrainingWeeks:p.extraTrainingWeeks,...(p.grade!==undefined?{grade:p.grade}:{})})||s.ledger.some(j=>j.eventId===e.id))throw Error('Operating policy');
   c.paused=p.paused;c.priceFactorBps=p.priceFactorBps;c.extraTrainingWeeks=p.extraTrainingWeeks;c.grade=p.grade??c.grade;
  }
  if(e.type==='transfer-lot'){const p=JSON.parse(e.signature),lot=centralInventory.find(l=>l.id===p.lotId);if(lot)lot.locationId=p.toLocationId;}
  if(e.type==='ship-lot'){const p=JSON.parse(e.signature),lot=centralInventory.find(l=>l.id===p.lotId);if(lot)lot.locationId=Number(e.details.arrivalWeek)===e.week?p.warehouseId:'transit:'+e.id+':shipment';}
  if(e.type==='reserve-lot'){const p=JSON.parse(e.signature),lot=centralInventory.find(l=>l.id===p.lotId);if(lot)lot.reservations.push({contractId:p.contractId,quantity:p.quantity});}
  if(e.type==='franchise-supply-order'){
   const p=JSON.parse(e.signature),quote=franchiseSupplyQuote({...s,week:e.week,inventory:centralInventory,franchiseCohorts:cohorts,franchiseSupplyOrders:orders,consumerOrders:[...consumerOrders.values()]},p),order={id:'supply:'+e.id,...quote};
   if(p.id!==e.id||p.type!==e.type||!same(e.entityIds,[order.id,order.cohortId,order.warehouseId])||e.details.order!==JSON.stringify(order)||s.ledger.some(j=>j.eventId===e.id))throw Error('Central dispatch authority');orders.push(order);
  }
  const deliveries:FranchiseSupplyDelivery[]=[];
  if(e.origin==='tick'&&orders.length){for(const o of orders.filter(o=>o.status==='pending'&&o.dueWeek<=e.week)){const c=cohorts.find(c=>c.id===o.cohortId)!,standard=s.franchiseStandards!.find(p=>p.id===c.standardId)!,partner=franchisePartners.find(p=>p.id===c.partnerId)!,d=deliverFranchiseSupply(c,o,centralInventory,e.week,standard.minimumQuality);if(!d)continue;const scope={regionId:regionForCity(partner.cityId),channelId:'partner-supply'},cost=d.consumed.reduce((n,a)=>n+a.costCents,0);
    const entries:[string,Posting[]][]=[[o.id+':supply-sale',[debit('cash',d.revenueCents+d.shippingCents),credit('supply-revenue',d.revenueCents,o.id),credit('shipping',d.shippingCents,o.id)]],[o.id+':carrier',[debit('shipping',d.shippingCents,o.id),credit('cash',d.shippingCents)]]];if(cost)entries.push([o.id+':supply-cogs',[debit('cogs',cost,o.id),credit('finished-inventory',cost)]]);for(const [suffix,postings]of entries){if(!exact(e,suffix,scope,postings))throw Error('Delivered supply journal');validatedJournal.add(e.id+':'+suffix);}deliveries.push(d);
   }
   if(e.details.franchiseSupplyDeliveries!==JSON.stringify(deliveries)||e.details.franchiseSupplyOrders!==JSON.stringify(orders))throw Error('Delivered central physical authority');
  }else if(e.origin==='tick'&&(e.details.franchiseSupplyDeliveries!==undefined||e.details.franchiseSupplyOrders!==undefined))throw Error('Future supply evidence');
  if(e.origin==='tick'&&cohorts.length){
   const actual:FranchiseWeek=JSON.parse(String(e.details.franchiseActuals)),stage=Number(e.details.franchiseStage),datedStage=prior.filter(q=>q.type==='review-chapter').at(-1)?.details.stage;
   if((e.details.franchiseBrandModel!==1||![2,3,4,5].includes(Number(e.details.franchiseServiceModel)))&&!issuedLegacyFranchiseClose(e)||!uint(stage)||stage<5||stage>s.campaign.stage||datedStage!==undefined&&stage!==datedStage||actual.tickId!==e.id||actual.week!==e.week||!Array.isArray(actual.cohorts)||actual.cohorts.length!==cohorts.length)throw Error('Weekly coverage');
   const marker:DomainEvent={...e,id:e.id+':after-partner-close'},dated={...s,events:[...s.events.slice(0,index+1),marker]},capacities=new Map<string,number>(),budgets=new Map<string,number>(),used=spotSupplierUsage(prior,e.week,Number(e.details.franchiseServiceModel)>=5);
   for(const h of s.franchiseSupportHubs??[]){const past=staffBefore(dated,h.leaderId,marker);capacities.set(h.id,h.readyWeek<=e.week&&past&&past.employee.departedWeek===undefined&&['commercial','manager'].includes(past.employee.role)&&past.employee.skills.management>=75?Math.floor((past.employee.contractedMinutes*(past.training?.5:1)+fieldTeamMinutes({...s,week:e.week,cohortTeams:teamsBefore(dated,marker)},h.id))/franchiseTerms.supportMinutesPerStore):0);budgets.set(h.id,h.weeklyBudgetCents);}
   const revisions=s.recipeRevisions.map(r=>({...r,packagingId:packs.get(r.id)??'ordinary-wrap'})),replayed:FranchiseWeek={tickId:e.id,week:e.week,cohorts:[]},expectedEntries=new Set<string>(),funding=franchiseFundingAt(s,e,loans,cashPrefixes);
   let availableCash=funding.cashCents;
   for(const [ci,c]of cohorts.entries()){
    const row=actual.cohorts[ci],standard=s.franchiseStandards!.find(q=>q.id===c.standardId)!,partner=franchisePartners.find(q=>q.id===c.partnerId)!,scope={regionId:regionForCity(partner.cityId),channelId:'franchise-royalties'},supportCost=c.stores*standard.weeklySupportCents;
    const supported=!c.paused&&(capacities.get(c.hubId)??0)>=c.stores&&(budgets.get(c.hubId)??0)>=supportCost&&availableCash>=funding.protectedCents+supportCost;
    if(row?.supportedStores!==(supported?c.stores:0))throw Error('Deterministic support funding');
    if(!row||row.cohortId!==c.id||![0,c.stores].includes(row.supportedStores)||row.supportCents!==(row.supportedStores?supportCost:0)||row.supportedStores&&(c.paused||(capacities.get(c.hubId)??0)<c.stores||(budgets.get(c.hubId)??0)<supportCost))throw Error('Support allocation');
    if(row.supportedStores){availableCash-=supportCost;capacities.set(c.hubId,capacities.get(c.hubId)!-c.stores);budgets.set(c.hubId,budgets.get(c.hubId)!-supportCost);expectedEntries.add(e.id+':'+c.id+':field-support');if(!exact(e,c.id+':field-support',scope,[debit('support',supportCost,c.id),credit('cash',supportCost)]))throw Error('Unpaid field work');}
    const result=operatePartner(c,standard,partner,{cityId:partner.cityId,week:e.week,stage,grade:c.grade,allowedSupplierIds:[...known],used,seed:s.random.seed,centralProcurementCents:deliveries.filter(d=>d.cohortId===c.id).reduce((n,d)=>n+d.revenueCents+d.shippingCents,0),...([2,3,4,5].includes(Number(e.details.franchiseServiceModel))?{serviceModel:Number(e.details.franchiseServiceModel) as 2|3|4|5}:{}),sharedPackagingCapacity:Number(e.details.franchiseServiceModel)>=5,cocoaPriceFactor:Number(e.details.franchiseServiceModel)>=5?economicPriceFactor({...dated,week:e.week},'cocoa'):1,freightPriceFactor:Number(e.details.franchiseServiceModel)>=5?economicFreightFactor({...dated,week:e.week}):1,brandFactor:e.details.franchiseBrandModel===1?franchiseBrandFactor({...s,franchiseCohorts:cohorts,franchiseHistory:weeks},partner.cityId,e.week):1,tickId:e.id,revisions,supportedStores:row.supportedStores,supportCents:row.supportCents});
    availableCash+=result.row.royaltyCents;
    if(!same(row,result.row))throw Error('Private operating replay');cohorts[ci]=result.cohort;replayed.cohorts.push(result.row);
    if(row.royaltyCents){expectedEntries.add(e.id+':'+c.id+':royalty');if(!exact(e,c.id+':royalty',scope,[debit('cash',row.royaltyCents),credit('royalty-revenue',row.royaltyCents,c.id)]))throw Error('Royalty settlement');}
    if(row.feeEarnedCents){expectedEntries.add(e.id+':'+c.id+':service-fee');if(!exact(e,c.id+':service-fee',scope,[debit('customer-deposits',row.feeEarnedCents,c.id),credit('royalty-revenue',row.feeEarnedCents,c.id)]))throw Error('Unearned opening fees');}
   }
   if(s.ledger.some(j=>j.eventId===e.id&&j.postings.some(p=>p.account==='royalty-revenue'||p.entityId&&cohorts.some(c=>c.id===p.entityId))&&!expectedEntries.has(j.id)))throw Error('Unwitnessed partner journal');for(const id of expectedEntries)validatedJournal.add(id);weeks.push(replayed);
  }else if(e.origin==='tick'&&e.details.franchiseActuals!==undefined)throw Error('Future partner evidence');
  if(e.origin==='tick'){for(const loan of loans){if(loan.status==='settled'||loan.nextDueWeek>e.week)continue;const at=s.ledger.findIndex(j=>j.eventId===e.id&&j.id.startsWith(e.id+':'+loan.id+'-'));if(at<0)throw Error('Missing debt service');const debtState={...s,week:e.week,cashCents:cashPrefixes[at],ledger:[],campaign:{...s.campaign}};serviceLoan(debtState,loan,e);}if(e.details.arrivedCityId)visited.add(String(e.details.arrivedCityId));}
  if(e.origin==='tick'){centralInventory=structuredClone(finishedHistory?.get(e.id)??s.snapshots.find(w=>w.tickId===e.id)?.inventory.lots??[]);if(e.details.consumerOrders)for(const o of JSON.parse(String(e.details.consumerOrders)))consumerOrders.set(o.id,o);}
  prior.push(e);
 }
 if(s.ledger.some(j=>j.postings.some(p=>p.account==='royalty-revenue'||p.account==='supply-revenue'||p.entityId&&(cohorts.some(c=>c.id===p.entityId)||orders.some(o=>o.id===p.entityId)))&&!validatedJournal.has(j.id)))errors.push('Franchise financial posting lacks exact signed or earned authority');
 if(!same(s.franchiseSupplyOrders??[],orders))errors.push('Central supply orders differ from signed physical promises and actual delivery');
 if(!same(live,cohorts)||!same(history,weeks))errors.push('Franchise cards or history differ from dated physical operations and earned service');
 return errors;
}
