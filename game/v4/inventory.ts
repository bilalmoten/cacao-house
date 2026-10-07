import {freightDestination} from './freight-destinations.ts';
import {packagingFamilies} from './content/packaging.ts';
import type {V4State,StorageClass,DomainEvent,InventoryLot} from './model.ts';
import {catalog} from './catalog.ts';
import {accountBalance,post,debit,credit} from './finance.ts';
export function volumeMilliliters(varietyId:string,grams:number):number {
  const variety=catalog.ingredients.find(i=>i.id===varietyId);if(!variety)throw Error('Unknown ingredient volume.');
  return Math.ceil(grams*1000/variety.gramsPerLiter);
}
export function lotVolumeMilliliters(lot:InventoryLot):number {if(lot.kind==='ingredient')return volumeMilliliters(lot.varietyId!,lot.quantity);const family=packagingFamilies.find(p=>p.id===lot.packagingId);return lot.quantity*(lot.kind==='packaging'?(family?.unitVolumeMilliliters??0):(family?.finishedCaseMilliliters??1800));}
const empty=():Record<StorageClass,number>=>({dry:0,controlled:0,cold:0});
export function storageOccupancy(state:V4State,id:string):Record<StorageClass,number> {
  const result=empty();for(const l of state.inventory)if(l.locationId===id)result[l.storageClass]+=lotVolumeMilliliters(l);
  return result;
}
export function projectedOccupancy(state:V4State,id:string,arrivalWeek:number):Record<StorageClass,number> {
  const result=storageOccupancy(state,id);
  for(const shipment of state.shipments)if(shipment.warehouseId===id&&['in-transit','delayed'].includes(shipment.status)&&shipment.arrivalWeek<=arrivalWeek){const lot=state.inventory.find(l=>l.id===shipment.lotId);if(lot)result[lot.storageClass]+=lotVolumeMilliliters(lot);}
  return result;
}
export function capacityAt(state:V4State,id:string,week:number):Record<StorageClass,number> {
  const w=state.warehouses.find(w=>w.id===id);if(!w)return empty();const result={...w.capacityMilliliters};
  for(const u of w.upgrades)if(u.readyWeek<=week)result[u.storageClass]+=u.milliliters;
  return result;
}
export function receiveShipments(state:V4State,event:DomainEvent):string[] {
  const alerts:string[]=[];
  for(const warehouse of state.warehouses){for(const upgrade of warehouse.upgrades.filter(u=>u.readyWeek<=state.week))warehouse.capacityMilliliters[upgrade.storageClass]+=upgrade.milliliters;warehouse.upgrades=warehouse.upgrades.filter(u=>u.readyWeek>state.week);}
  for(const shipment of state.shipments.filter(s=>['in-transit','delayed'].includes(s.status)&&s.arrivalWeek<=state.week)){
    const lot=state.inventory.find(l=>l.id===shipment.lotId),warehouse=state.warehouses.find(w=>w.id===shipment.warehouseId);if(shipment.kind==='customer'){const destination=freightDestination(state,shipment.warehouseId);if(!lot||lot.kind!=='finished'||!destination?.contract)throw Error('Customer freight needs its documented finished goods and buyer.');lot.locationId=destination.id;lot.arrivalWeek=state.week;shipment.status='arrived';continue;}if(!lot||!warehouse)throw Error('Shipment has no receiving lot or warehouse.');
    const occupancy=storageOccupancy(state,warehouse.id),volume=lotVolumeMilliliters(lot);
    if(occupancy[lot.storageClass]+volume<=warehouse.capacityMilliliters[lot.storageClass]){lot.locationId=warehouse.id;lot.arrivalWeek=state.week;shipment.status='arrived';continue;}
    if(warehouse.arrivalPolicy==='overflow'&&warehouse.overflowBudgetCents>=10000&&state.cashCents>=10000){post(state,event,'Paid overflow receiving',[debit('rent',10000,warehouse.id),credit('cash',10000)],shipment.id+'-overflow');warehouse.overflowBudgetCents-=10000;lot.locationId='overflow:'+warehouse.id;shipment.status='arrived';alerts.push('Shipment entered paid overflow storage.');}
    else if(warehouse.arrivalPolicy==='reject'){const refund=shipment.kind==='internal'?0:Math.floor(lot.costCents*.9),loss=lot.costCents-refund;post(state,event,'Rejected freight with disclosed 10% landed-cost loss',[debit('cash',refund),debit('shipping',loss,warehouse.id),credit(lot.kind==='finished'?'finished-inventory':lot.kind==='packaging'?'packaging-inventory':'raw-inventory',lot.costCents,lot.id)],shipment.id+'-reject');state.inventory=state.inventory.filter(l=>l.id!==lot.id);shipment.status='rejected';alerts.push(shipment.kind==='internal'?'Owned freight rejected; acquisition value written off.':'Shipment rejected; 90% of landed value refunded.');}
    else{shipment.arrivalWeek++;shipment.delayCount++;shipment.status='delayed';lot.arrivalWeek=shipment.arrivalWeek;lot.condition=Math.max(0,lot.condition-2);alerts.push('Freight delayed for receiving space; ingredient condition reduced.');}
  }
  return alerts;
}
export function expireLots(state:V4State,event:DomainEvent):void {
  for(const lot of state.inventory.filter(l=>l.expiryWeek<=state.week)){
    if(lot.costCents)post(state,event,'Expired inventory acquisition value written off',[debit('cogs',lot.costCents,lot.id),credit(lot.kind==='ingredient'?'raw-inventory':lot.kind==='packaging'?'packaging-inventory':'finished-inventory',lot.costCents,lot.id)],lot.id+'-expiry',state.ledger.find(e=>e.postings.some(p=>p.entityId===lot.id&&p.account===(lot.kind==='ingredient'?'raw-inventory':lot.kind==='packaging'?'packaging-inventory':'finished-inventory')&&p.debitCents>0))?.scope,'inventory-expiry');
    state.inventory=state.inventory.filter(l=>l.id!==lot.id);
    for(const shipment of state.shipments)if(shipment.lotId===lot.id&&['in-transit','delayed'].includes(shipment.status))shipment.status='expired';
  }
}
export function checkInventory(state:V4State):string[]{
  const errors:string[]=[];
  // Index the exact supplied history once; historical snapshots still receive
  // their own ledger/snapshot prefix, so future evidence cannot validate a lot.
  const finishedSources=new Map<string,{row:V4State['lastProduction'][number]['rows'][number];week:number}>(),packConsumed=new Map<string,{quantity:number;costCents:number}>(),packSources=new Map<string,V4State['events'][number]>(),packPaid=new Map<string,number>();
  for(const snapshot of state.snapshots)for(const factory of snapshot.production)for(const [index,row]of factory.rows.entries()){const id=`${snapshot.tickId}:${factory.factoryId}:${index}`;if(!finishedSources.has(id))finishedSources.set(id,{row,week:snapshot.week});for(const used of row.packagingConsumed??[]){const total=packConsumed.get(used.lotId)??{quantity:0,costCents:0};total.quantity+=used.quantity;total.costCents+=used.costCents;packConsumed.set(used.lotId,total);}}
  for(const e of state.events)if(e.type==='purchase-packaging'&&!packSources.has(e.id+':packaging'))packSources.set(e.id+':packaging',e);
  for(const entry of state.ledger)if(entry.kind==='packaging-purchase')for(const posting of entry.postings)if(posting.account==='packaging-inventory'&&posting.entityId===entry.eventId+':packaging')packPaid.set(posting.entityId,(packPaid.get(posting.entityId)??0)+posting.debitCents-posting.creditCents);

  if(new Set(state.inventory.map(l=>l.id)).size!==state.inventory.length)errors.push('Duplicate lot identity');
  for(const lot of state.inventory){
    if(!['ingredient','finished','packaging'].includes(lot.kind)||!['dry','controlled','cold'].includes(lot.storageClass)||!Number.isSafeInteger(lot.quantity)||lot.quantity<=0||!Number.isSafeInteger(lot.costCents)||lot.costCents<0||!Number.isFinite(lot.quality)||lot.quality<0||lot.quality>100||!Number.isFinite(lot.condition)||lot.condition<0||lot.condition>100)errors.push('Invalid lot quantity, value or condition');
    if(![lot.bornWeek,lot.arrivalWeek,lot.expiryWeek].every(n=>Number.isSafeInteger(n)&&n>=1)||lot.arrivalWeek<lot.bornWeek||lot.expiryWeek<lot.bornWeek)errors.push('Invalid lot dates');
    if(!(lot.kind==='finished'&&freightDestination(state,lot.locationId)?.contract)&&!state.warehouses.some(w=>lot.locationId===w.id||lot.locationId==='overflow:'+w.id)&&!state.factories.some(f=>f.id===lot.locationId)&&!state.shipments.some(s=>lot.locationId==='transit:'+s.id&&s.lotId===lot.id&&['in-transit','delayed'].includes(s.status)))errors.push('Unknown physical inventory location');
    if(lot.kind==='finished'&&(!state.recipeRevisions.some(r=>r.id===lot.recipeRevisionId)||!state.factories.some(f=>f.id===lot.factoryId)||!lot.flavor||lot.flavor.length!==4||lot.flavor.some(n=>!Number.isFinite(n))||!state.processProfiles.some(p=>p.id===lot.processProfileId&&p.factoryId===lot.factoryId&&p.recipeRevisionId===lot.recipeRevisionId)))errors.push('Invalid finished batch provenance');
    if(lot.kind==='finished'){
      const source=finishedSources.get(lot.id),row=source?.row,revision=state.recipeRevisions.find(r=>r.id===lot.recipeRevisionId),family=packagingFamilies.find(p=>p.id===lot.packagingId),batchWeek=source?.week;
      if(!row||lot.quantity>row.goodCases||lot.quality!==row.quality||JSON.stringify(lot.flavor)!==JSON.stringify(row.flavor)||lot.bornWeek!==batchWeek||lot.expiryWeek!==Number(batchWeek)+Math.min(revision?.shelfWeeks??0,family?.maximumShelfWeeks??0)-1||row.recipeRevisionId!==lot.recipeRevisionId||row.packagingId!==lot.packagingId||row.brandVersion!==lot.brandVersion||!packagingFamilies.some(p=>p.id===lot.packagingId)||!Number.isSafeInteger(lot.brandVersion)||Number(lot.brandVersion)<1||Number(lot.brandVersion)>state.brandVersion)errors.push('Finished packaging differs from its paid batch provenance');
    }
    if(lot.kind==='packaging'&&(!packagingFamilies.some(p=>p.id===lot.packagingId)||!Number.isSafeInteger(lot.brandVersion)||Number(lot.brandVersion)<1||Number(lot.brandVersion)>state.brandVersion||lot.storageClass!=='dry'))errors.push('Invalid physical packaging identity or brand edition');
    if(lot.kind==='packaging'){
      const source=packSources.get(lot.id);let request:Record<string,unknown>|undefined;try{request=JSON.parse(source?.signature??'{}').request;}catch{}
      const consumed=packConsumed.get(lot.id)??{quantity:0,costCents:0},paid=packPaid.get(lot.id)??0;
      if(!source||!request||source.origin!=='action'||source.week!==lot.bornWeek||request.packagingId!==lot.packagingId||request.quantityUnits!==source.details.quantityUnits||request.supplierId!==source.details.supplierId||source.details.packagingId!==lot.packagingId||source.details.brandVersion!==lot.brandVersion||lot.quantity!==Number(request.quantityUnits)-consumed.quantity||lot.costCents!==paid-consumed.costCents||paid!==Number(source.details.goodsCents)+Number(source.details.freightCents))errors.push('Packaging stock differs from paid procurement and dated consumption');
    }

    if(lot.kind==='ingredient'&&!catalog.ingredients.some(i=>i.id===lot.varietyId))errors.push('Unknown ingredient lot');
    if(!Array.isArray(lot.reservations)||lot.reservations.some(r=>!Number.isSafeInteger(r.quantity)||r.quantity<=0||!state.contracts.some(c=>c.id===r.contractId))||lot.reservations.reduce((n,r)=>n+r.quantity,0)>lot.quantity)errors.push('Invalid or excessive lot reservations');
  }
  if(accountBalance(state,'raw-inventory')!==state.inventory.filter(l=>l.kind==='ingredient').reduce((n,l)=>n+l.costCents,0))errors.push('Raw inventory value does not reconcile');
  if(accountBalance(state,'finished-inventory')!==state.inventory.filter(l=>l.kind==='finished').reduce((n,l)=>n+l.costCents,0))errors.push('Finished inventory value does not reconcile');
  if(accountBalance(state,'packaging-inventory')!==state.inventory.filter(l=>l.kind==='packaging').reduce((n,l)=>n+l.costCents,0))errors.push('Packaging inventory value does not reconcile');
  return errors;
}
