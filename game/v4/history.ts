import type {V4State} from './model.ts';
import {catalog} from './catalog.ts';
import {checkInventory} from './inventory.ts';
import {accountBalance} from './finance.ts';
import {regionForCity} from './content/regions.ts';
const uint=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>=0;
/** Closed operating evidence stays attached to its tick and original journal. */
export function validateOperatingHistory(state:V4State):string[]{
 const errors:string[]=[];
 for(const snapshot of state.snapshots){
  const event=state.events.find(e=>e.id===snapshot.tickId),journal=state.ledger.filter(e=>e.week<=snapshot.week),tickEntries=journal.filter(e=>e.eventId===snapshot.tickId);
  const rawSources=new Set(journal.flatMap(e=>e.postings.filter(p=>p.account==='raw-inventory'&&p.debitCents>0).map(p=>p.entityId))),packagingSources=new Set(journal.flatMap(e=>e.postings.filter(p=>p.account==='packaging-inventory'&&p.debitCents>0).map(p=>p.entityId)));
  if(!Array.isArray(snapshot.production)||!snapshot.inventory||!Array.isArray(snapshot.inventory.lots)||!Array.isArray(snapshot.inventory.shipments)||!snapshot.obligations||!snapshot.sales){errors.push('Missing closed operating history');continue;}
  if(event?.details.operatingActuals!==JSON.stringify({production:snapshot.production,inventory:snapshot.inventory,obligations:snapshot.obligations}))errors.push('Operating summary differs from committed tick evidence');
  if(JSON.stringify(snapshot.sales)!==JSON.stringify(state.salesHistory.find(s=>s.tickId===snapshot.tickId)))errors.push('Snapshot sales differ from source sales history');
  const inventory=snapshot.inventory;
  if(checkInventory({...state,inventory:inventory.lots,shipments:inventory.shipments,ledger:journal,snapshots:state.snapshots.filter(s=>s.week<=snapshot.week)}).length)errors.push('Invalid historical lot provenance or physical structure');
  if(inventory.packagingCents!==accountBalance(state,'packaging-inventory',journal)||inventory.packagingCents!==inventory.lots.filter(l=>l.kind==='packaging').reduce((n,l)=>n+l.costCents,0)||inventory.rawCents!==accountBalance(state,'raw-inventory',journal)||inventory.finishedCents!==accountBalance(state,'finished-inventory',journal)||inventory.rawCents!==inventory.lots.filter(l=>l.kind==='ingredient').reduce((n,l)=>n+l.costCents,0)||inventory.finishedCents!==inventory.lots.filter(l=>l.kind==='finished').reduce((n,l)=>n+l.costCents,0)||new Set(inventory.lots.map(l=>l.id)).size!==inventory.lots.length||inventory.lots.some(l=>!uint(l.quantity)||l.quantity<=0||!uint(l.costCents)))errors.push('Historical physical stock does not reconcile');
  if(snapshot.obligations.receivableCents!==accountBalance(state,'receivables',journal)||snapshot.obligations.depositCents!==-accountBalance(state,'customer-deposits',journal)||snapshot.obligations.arrearsCents!==-accountBalance(state,'arrears',journal))errors.push('Historical obligations do not reconcile');
  if(new Set(snapshot.production.map(p=>p.factoryId)).size!==snapshot.production.length)errors.push('Duplicate historical production site');
  for(const factory of snapshot.production){
   const owned=state.factories.find(f=>f.id===factory.factoryId);
   if(!owned||factory.regionId!==regionForCity(owned.cityId)||!Array.isArray(factory.rows)){errors.push('Invalid historical production site');continue;}
   if(![factory.laborUsedMinutes,factory.laborAvailableMinutes,factory.changeoverMinutes,...Object.values(factory.stationUsedMinutes)].every(uint)||!['preparation','processing','tempering','cooling','packing'].every(k=>uint(factory.stationUsedMinutes[k as keyof typeof factory.stationUsedMinutes]))||factory.laborUsedMinutes!==factory.rows.reduce((n,r)=>n+r.laborMinutes,0)||factory.laborUsedMinutes>factory.laborAvailableMinutes||factory.changeoverMinutes>factory.laborUsedMinutes||Object.entries(factory.stationUsedMinutes).some(([station,minutes])=>minutes!==factory.rows.reduce((n,r)=>n+r.stationMinutes[station as keyof typeof r.stationMinutes],0)))errors.push('Invalid historical production resources');
   for(const row of factory.rows){
    const revision=state.recipeRevisions.find(r=>r.id===row.recipeRevisionId),recipe=catalog.recipes.find(r=>r.id===revision?.recipeId);
    if(!Array.isArray(row.consumed)||row.consumed.some(c=>!uint(c.quantity)||c.quantity<=0||!uint(c.costCents)||!Number.isFinite(c.quality)||c.quality<0||c.quality>100||!catalog.ingredients.some(i=>i.id===c.varietyId)||!rawSources.has(c.lotId)))errors.push('Invalid historical physical input');
    else if(recipe&&revision){
     const required:Record<string,number>={};for(const role of recipe.roles)required[revision.formula[role.role]]=(required[revision.formula[role.role]]??0)+role.gramsPerCase*row.inputCases;
     const consumed:Record<string,number>={};for(const input of row.consumed)consumed[input.varietyId]=(consumed[input.varietyId]??0)+input.quantity;
     if([...new Set([...Object.keys(required),...Object.keys(consumed)])].some(id=>(required[id]??0)!==(consumed[id]??0)))errors.push('Historical formula input mass does not conserve');
    }

    if(!Array.isArray(row.packagingConsumed)||row.packagingConsumed.some(c=>!uint(c.quantity)||c.quantity<=0||!uint(c.costCents)||c.packagingId!==row.packagingId||c.brandVersion!==row.brandVersion||!uint(c.brandVersion)||c.brandVersion<1||!packagingSources.has(c.lotId))||row.packagingConsumed.reduce((n,c)=>n+c.quantity,0)!==row.inputCases*20||row.packagingConsumed.reduce((n,c)=>n+c.costCents,0)!==row.packagingCents)errors.push('Invalid historical packaging consumption');
    if(!state.recipeRevisions.some(r=>r.id===row.recipeRevisionId)||![row.plannedCases,row.inputCases,row.goodCases,row.rejectedCases,row.materialCents,row.packagingCents,row.conversionCents,row.allocatedLaborCents,row.laborMinutes,...Object.values(row.stationMinutes)].every(uint)||row.goodCases+row.rejectedCases!==row.inputCases||row.inputCases>row.plannedCases||row.consumed.reduce((n,c)=>n+c.costCents,0)!==row.materialCents||!Number.isFinite(row.quality)||row.quality<0||row.quality>100||!Array.isArray(row.flavor)||row.flavor.length!==4||row.flavor.some(n=>!Number.isFinite(n)))errors.push('Invalid historical batch actual');
   }
   const entries=tickEntries.filter(e=>e.scope?.factoryId===factory.factoryId);
   if(factory.rows.reduce((n,r)=>n+r.packagingCents,0)!==accountBalance(state,'finished-inventory',entries.filter(e=>e.kind==='manufacturing-packaging')))errors.push('Historical packaging differs from conversion ledger');
   if(factory.rows.reduce((n,r)=>n+r.materialCents,0)!==accountBalance(state,'finished-inventory',entries.filter(e=>e.kind==='manufacturing-materials'))||factory.rows.reduce((n,r)=>n+r.conversionCents,0)!==accountBalance(state,'finished-inventory',entries.filter(e=>e.kind==='manufacturing-conversion')))errors.push('Historical production differs from conversion ledger');
  }
 }
 for(const revision of state.recipeRevisions)if(revision.producedCases!==state.snapshots.flatMap(s=>s.production??[]).flatMap(p=>p.rows).filter(r=>r.recipeRevisionId===revision.id).reduce((n,r)=>n+r.goodCases,0))errors.push('Recipe lifetime output differs from closed production');
 return errors;
}
