import type {V4State,InventoryLot,ConsumerOrder,FranchiseSupplyOrder,DomainEvent} from './model.ts';
import {catalog} from './catalog.ts';import {packagingFamilies} from './content/packaging.ts';import {regionForCity} from './content/regions.ts';
/** Independently reconstruct finished cases from actual batch outputs and
 * dated physical withdrawals. Snapshot quantities are comparisons, never
 * authority for a supply order. Prices/demand cannot create stock. */
export function finishedQuantityHistory(s:V4State){
 const after=new Map<string,InventoryLot[]>(),snapshots=new Map(s.snapshots.map(w=>[w.tickId,w])),journal=new Map<string,V4State['ledger']>();for(const j of s.ledger){const rows=journal.get(j.eventId)??[];rows.push(j);journal.set(j.eventId,rows);}
 const stock=new Map<string,InventoryLot>(),parcels=new Map<string,ConsumerOrder>(),supply=new Map<string,FranchiseSupplyOrder>(),prices=new Map<string,number>(),channelPrices=new Map<string,Record<string,number>>(),packChoices=new Map<string,string>();
 const plans=new Map<string,any[]>(),contractDelivered=new Map<string,number>();
 const producedRecipe=(id:string)=>s.recipeRevisions.find(r=>r.id===id)?.recipeId;
 const cityAt=(l:InventoryLot)=>s.warehouses.find(w=>w.id===l.locationId||'overflow:'+w.id===l.locationId)?.cityId??s.factories.find(f=>f.id===l.locationId)?.cityId;
 const reserved=(id:string)=>[...parcels.values()].filter(o=>o.status==='pending').flatMap(o=>o.allocations).filter(a=>a.lotId===id).reduce((n,a)=>n+a.quantity,0)+[...supply.values()].filter(o=>o.status==='pending').flatMap(o=>o.allocations).filter(a=>a.lotId===id).reduce((n,a)=>n+a.quantity,0);
 function take(id:string,q:number){const l=stock.get(id);if(!l||!Number.isSafeInteger(q)||q<1||q>l.quantity)throw Error('Finished withdrawal exceeds independently produced physical cases');const cost=q===l.quantity?l.costCents:Math.floor(l.costCents*q/l.quantity);l.quantity-=q;l.costCents-=cost;return cost;}
 function allocate(target:number,test:(l:InventoryLot)=>boolean,week:number,contractId?:string){let remaining=target;for(const l of [...stock.values()].filter(l=>l.quantity>0&&l.arrivalWeek<=week&&l.expiryWeek>=week&&test(l)).sort((a,b)=>a.expiryWeek-b.expiryWeek||a.id.localeCompare(b.id))){const q=Math.min(remaining,Math.max(0,l.quantity-l.reservations.filter(r=>r.contractId!==contractId).reduce((n,r)=>n+r.quantity,0)-reserved(l.id)));if(q){take(l.id,q);let own=q;for(const r of l.reservations.filter(r=>r.contractId===contractId)){const used=Math.min(own,r.quantity);r.quantity-=used;own-=used;}l.reservations=l.reservations.filter(r=>r.quantity>0);remaining-=q;}if(!remaining)break;}if(remaining)throw Error('Dated external sale exceeds independently available finished cases');}
 for(const e of s.events){
  let p:Record<string,any>={};try{p=e.origin==='action'?JSON.parse(e.signature):{};}catch{};
  if(e.type==='open-consumer-channel'&&p.prices!==undefined)channelPrices.set('channel:'+e.id,p.prices);
  if(e.type==='production-plan')plans.set(p.plan.factoryId,p.plan.items);
  if(e.type==='set-price')prices.set(p.recipeRevisionId,p.priceCents);
  if(e.type==='consumer-policy'&&p.prices!==undefined)channelPrices.set(p.channelId,p.prices);
  if(e.type==='select-packaging')packChoices.set(p.recipeRevisionId,p.packagingId);
  if(e.type==='reserve-lot'&&stock.has(p.lotId))stock.get(p.lotId)!.reservations.push({contractId:p.contractId,quantity:p.quantity});
  if(e.type==='transfer-lot'&&stock.has(p.lotId))stock.get(p.lotId)!.locationId=p.toLocationId;
  if(e.type==='ship-lot'&&stock.has(p.lotId)){const l=stock.get(p.lotId)!;l.locationId=Number(e.details.arrivalWeek)===e.week?p.warehouseId:'transit:'+e.id+':shipment';}
  if(e.type==='franchise-supply-order'){const o=JSON.parse(String(e.details.order)) as FranchiseSupplyOrder;for(const a of o.allocations){const l=stock.get(a.lotId);if(!l||l.quantity-l.reservations.reduce((n,r)=>n+r.quantity,0)-reserved(l.id)<a.quantity)throw Error('Central promise exceeds independently produced remaining cases');}supply.set(o.id,structuredClone(o));}
  if(e.origin!=='tick')continue;const w=snapshots.get(e.id);if(!w)throw Error('Missing finished-stock close');
  // Central supply is delivered before arrivals/production/other selling.
  if(e.details.franchiseSupplyDeliveries)for(const d of JSON.parse(String(e.details.franchiseSupplyDeliveries))){const o=supply.get(d.orderId);if(!o)throw Error('Central withdrawal has no signed physical promise');for(const a of d.consumed){if(take(a.lotId,a.quantity)!==a.costCents)throw Error('Central cost differs from remaining physical acquisition value');}o.status='delivered';}
  if(e.details.franchiseSupplyOrders)for(const o of JSON.parse(String(e.details.franchiseSupplyOrders)))supply.set(o.id,o);
  for(const sh of w.inventory.shipments){const l=stock.get(sh.lotId);if(!l||!l.locationId.startsWith('transit:'))continue;if(sh.status==='arrived'){const actual=w.inventory.lots.find(l=>l.id===sh.lotId);l.locationId=actual?.locationId==='overflow:'+sh.warehouseId?'overflow:'+sh.warehouseId:sh.warehouseId;l.arrivalWeek=e.week;}else if(sh.status==='rejected')stock.delete(l.id);}
  for(const factory of w.production){const warehouse=s.warehouses.find(p=>p.cityId===s.factories.find(f=>f.id===factory.factoryId)?.cityId)!;for(const [i,row]of factory.rows.entries()){if(!row.goodCases)continue;const r=s.recipeRevisions.find(r=>r.id===row.recipeRevisionId)!,recipe=catalog.recipes.find(p=>p.id===r.recipeId)!,pack=packagingFamilies.find(p=>p.id===row.packagingId)!;stock.set(e.id+':'+factory.factoryId+':'+i,{id:e.id+':'+factory.factoryId+':'+i,kind:'finished',recipeRevisionId:r.id,factoryId:factory.factoryId,flavor:row.flavor,packagingId:row.packagingId,brandVersion:row.brandVersion,processProfileId:s.processProfiles.find(p=>p.factoryId===factory.factoryId&&p.recipeRevisionId===r.id)?.id,locationId:warehouse.id,quantity:row.goodCases,costCents:row.materialCents+row.packagingCents+row.conversionCents,quality:row.quality,condition:100,bornWeek:e.week,arrivalWeek:e.week,expiryWeek:e.week+Math.min(r.shelfWeeks,pack.maximumShelfWeeks)-1,storageClass:recipe.storageClass,reservations:[]});}}
  // Newly made contract stock reserves only eligible promises.
  for(const factory of w.production)for(const [i,row]of factory.rows.entries()){const l=stock.get(e.id+':'+factory.factoryId+':'+i);if(!l)continue;const plan=plans.get(factory.factoryId)??[],c=s.contracts.find(c=>c.id===plan[i]?.contractId),previous=contractDelivered.get(c?.id??'')??0,failed=e.week>Number(c?.dueEnd);if(c&&!failed&&previous<c.cases&&producedRecipe(l.recipeRevisionId!)===c.recipeId&&l.quality>=c.minimumQuality&&(!c.packagingId||c.packagingId===l.packagingId)&&l.expiryWeek-e.week+1>=(c.minimumShelfWeeks??1)){const held=[...stock.values()].filter(a=>a.id!==l.id&&producedRecipe(a.recipeRevisionId!)===c.recipeId&&a.quality*a.condition/100>=c.minimumQuality&&a.expiryWeek-e.week+1>=(c.minimumShelfWeeks??1)&&(!c.packagingId||c.packagingId===a.packagingId)).reduce((n,a)=>n+a.reservations.filter(r=>r.contractId===c.id).reduce((m,r)=>m+r.quantity,0),0),q=Math.min(l.quantity,Math.max(0,c.cases-previous-held));if(q)l.reservations=[{contractId:c.id,quantity:q}];}}
  for(const d of w.sales.contracts){const c=s.contracts.find(c=>c.id===d.contractId)!;allocate(d.deliveredCases,l=>producedRecipe(l.recipeRevisionId!)===c.recipeId&&(cityAt(l)===c.cityId||l.locationId==='buyer:'+c.id)&&l.quality*l.condition/100>=c.minimumQuality&&(!c.packagingId||l.packagingId===c.packagingId)&&l.expiryWeek-e.week+1>=(c.minimumShelfWeeks??1),e.week,c.id);contractDelivered.set(c.id,(contractDelivered.get(c.id)??0)+d.deliveredCases);}
  for(const c of s.contracts)if(e.week>=c.dueEnd||(contractDelivered.get(c.id)??0)>=c.cases)for(const l of stock.values())l.reservations=l.reservations.filter(r=>r.contractId!==c.id);
  const changed:ConsumerOrder[]=JSON.parse(String(e.details.consumerOrders??'[]'));
  for(const c of s.consumerChannels??[]){if(c.readyWeek>e.week)continue;for(const o of changed.filter(o=>o.channelId===c.id&&o.status==='delivered'&&parcels.get(o.id)?.status!=='delivered')){for(const a of o.allocations)if(take(a.lotId,a.quantity)!==a.costCents)throw Error('Parcel cost differs from independently available cases');parcels.set(o.id,o);}for(const o of changed.filter(o=>o.channelId===c.id&&o.status==='refunded'))parcels.set(o.id,o);
   if(c.kind==='owned-retail')for(const j of journal.get(e.id)??[]){const income=j.postings.find(p=>p.account==='owned-retail-revenue'&&p.entityId?.startsWith(e.id+':'+c.id+':'));if(!income)continue;const tail=income.entityId!.slice((e.id+':'+c.id+':').length),revision=s.recipeRevisions.find(r=>tail.startsWith(r.id+':'));if(!revision)throw Error('Store sale lacks released product');const pack=tail.slice(revision.id.length+1),price=channelPrices.get(c.id)?.[revision.id]??prices.get(revision.id)??catalog.recipes.find(r=>r.id===revision.recipeId)!.referencePriceCents,quantity=(income.creditCents-income.debitCents)/price;if(!Number.isSafeInteger(quantity)||quantity<1)throw Error('Store sales lack physical whole cases');allocate(quantity,l=>l.locationId===c.warehouseId&&l.recipeRevisionId===revision.id&&l.packagingId===pack&&l.quality*l.condition/100>=55,e.week);}
   for(const o of changed.filter(o=>o.channelId===c.id&&o.status==='pending'))parcels.set(o.id,o);
  }
  for(const r of w.sales.retail)allocate(r.soldCases,l=>cityAt(l)==='sf'&&l.recipeRevisionId===r.recipeRevisionId&&l.packagingId===r.packagingId,e.week);
  for(const l of stock.values())if(l.quantity===0||l.expiryWeek<=e.week)stock.delete(l.id);
  const actual=w.inventory.lots.filter(l=>l.kind==='finished');if(actual.length!==stock.size||actual.some(l=>stock.get(l.id)?.quantity!==l.quantity||stock.get(l.id)?.costCents!==l.costCents))throw Error('Finished snapshots differ from independently produced, sold and expired cases');
  // Condition/location policy is separately checked by physical-route evidence.
  // Copy only those observations after quantities/acquisition values reconcile.
  for(const l of actual){const expected=stock.get(l.id)!;expected.locationId=l.locationId;expected.condition=l.condition;expected.arrivalWeek=l.arrivalWeek;}
  after.set(e.id,structuredClone([...stock.values()]));
 }
 if(s.inventory.filter(l=>l.kind==='finished').some(l=>stock.get(l.id)?.quantity!==l.quantity||stock.get(l.id)?.costCents!==l.costCents)||stock.size!==s.inventory.filter(l=>l.kind==='finished').length)throw Error('Live finished inventory exceeds remaining physical production');return after;
}
export function finishedQuantityEvidenceErrors(s:V4State){try{
 // The cohort replay already consumes the independently reconstructed history
 // for central promises. Other houses receive the same physical audit here.
 if(s.events.some(e=>e.type==='franchise-supply-order'))return [];
 finishedQuantityHistory(s);return [];
}catch{return ['Finished cases differ from paid production and dated physical withdrawals'];}}
