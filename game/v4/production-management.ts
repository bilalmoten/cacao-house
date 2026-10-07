import type {V4State,DelegationPolicy,FactoryPlanItem} from './model.ts';
import {catalog} from './catalog.ts';
import {scheduleProduction} from './production.ts';
import {orderOffers} from './content/orders.ts';
import {processEquipmentSignature} from './equipment.ts';

/** A local manager proposes only the founder's released, certified assortment.
 * This is an inspectable due-date/contribution heuristic, not an optimizer or
 * new contractual authority. Existing physical scheduling remains authoritative. */
export function productionAuthorityErrors(s:V4State,p:DelegationPolicy):string[]{
 const a=p.production;if(a===undefined)return [];
 const f=s.factories.find(f=>f.id===p.factoryId);
 if(!f||!['commitments-first','contribution'].includes(a.priority)||!Number.isFinite(a.minimumQuality)||a.minimumQuality<0||a.minimumQuality>100||!Array.isArray(a.assortment)||a.assortment.length>24||new Set(a.assortment.map(i=>i.recipeRevisionId)).size!==a.assortment.length)return ['Choose a distinct approved production assortment, priority and quality floor.'];
 if(a.assortment.some(i=>!Number.isSafeInteger(i.maximumCases)||i.maximumCases<1||!Number.isSafeInteger(i.stockTargetCases)||i.stockTargetCases<0||!s.recipeRevisions.some(r=>r.id===i.recipeRevisionId&&r.released)))return ['Production authority needs released recipes and explicit whole-case weekly/stock limits.'];
 return [];
}
export function managedProduction(s:V4State,p:DelegationPolicy){
 const a=p.production,items:FactoryPlanItem[]=[],exceptions:string[]=[];
 if(!a)return {items:s.factories.find(f=>f.id===p.factoryId)?.plan??[],exceptions};
 const f=s.factories.find(f=>f.id===p.factoryId)!;
 const locations=new Set(s.warehouses.filter(w=>w.cityId===f.cityId).map(w=>w.id));locations.add(f.id);
 const remaining=new Map(a.assortment.map(i=>[i.recipeRevisionId,i.maximumCases]));
 const covered=new Map<string,number>();
 const available=(revisionId:string,minimumQuality:number,shelf=1,packagingId?:string,contractId?:string,claim=Infinity)=>{let quantity=0;for(const l of s.inventory.filter(l=>l.kind==='finished'&&l.recipeRevisionId===revisionId&&locations.has(l.locationId)&&l.arrivalWeek<=s.week&&l.expiryWeek-s.week+1>=shelf&&l.quality*l.condition/100>=minimumQuality&&(!packagingId||l.packagingId===packagingId))){const free=Math.max(0,l.quantity-l.reservations.filter(r=>r.contractId!==contractId).reduce((n,r)=>n+r.quantity,0)-(covered.get(l.id)??0)),use=Math.min(free,claim-quantity);quantity+=use;if(Number.isFinite(claim))covered.set(l.id,(covered.get(l.id)??0)+use);if(quantity>=claim)break;}return quantity;};
 const certified=(revisionId:string)=>{const r=s.recipeRevisions.find(r=>r.id===revisionId)!;return s.processProfiles.find(profile=>profile.factoryId===f.id&&profile.recipeRevisionId===r.id&&profile.equipmentSignature===processEquipmentSignature(f,r.recipeId));};
 const append=(revisionId:string,desired:number,contractId?:string,packagingId?:string,minimumQuality=a.minimumQuality)=>{
  if(desired<=0)return;
  const commitment=contractId?s.contracts.find(c=>c.id===contractId):undefined,revision=s.recipeRevisions.find(r=>r.id===revisionId)!;if(commitment&&(commitment.minimumShelfWeeks??1)>revision.shelfWeeks){exceptions.push('Shelf-life evidence cannot meet '+contractId+'; review the recipe or signed promise.');return;}
  const profile=certified(revisionId);if(!profile){exceptions.push('Recommission '+revisionId+' at '+f.id+' before delegated production.');return;}
  const maximum=remaining.get(revisionId)??0,cases=Math.min(maximum,Math.ceil(desired/Math.max(.1,profile.expectedYield)));
  if(cases<=0)return;
  const candidate:FactoryPlanItem={recipeRevisionId:revisionId,cases,...(contractId?{contractId}:{}),...(packagingId?{packagingId}:{})};
  const trial=scheduleProduction({state:s,factoryId:f.id},{factoryId:f.id,items:[...items,candidate]}).rows.at(-1)!;
  if(trial.quality<minimumQuality&&trial.inputCases>0){exceptions.push('Quality floor holds '+revisionId+'; inspect inputs, team or method.');return;}
  if(trial.goodCases<=0){exceptions.push('No feasible delegated batch for '+revisionId+': '+trial.constraints.join(', '));return;}
  items.push({...candidate,cases:trial.inputCases});remaining.set(revisionId,maximum-trial.inputCases);
  if(contractId&&trial.goodCases<desired)exceptions.push('Committed output is below its due allocation for '+contractId+'; inspect the physical bottleneck.');
 };
 const commitments=s.contracts.filter(c=>c.status==='accepted'&&c.cityId===f.cityId&&c.dueStart<=s.week&&a.assortment.some(i=>s.recipeRevisions.find(r=>r.id===i.recipeRevisionId)?.recipeId===c.recipeId)).sort((x,y)=>x.dueEnd-y.dueEnd||x.id.localeCompare(y.id));
 for(const c of commitments){const approved=a.assortment.find(i=>s.recipeRevisions.find(r=>r.id===i.recipeRevisionId)?.recipeId===c.recipeId)!;
  const framework=orderOffers.find(o=>o.id===c.offerId)?.kind==='framework',due=framework?Math.min(Math.ceil(c.cases/52),c.cases-c.fulfilledCases):c.cases-c.fulfilledCases,minimumQuality=Math.max(a.minimumQuality,c.minimumQuality),physical=available(approved.recipeRevisionId,minimumQuality,c.minimumShelfWeeks??1,c.packagingId,c.id,due);
  append(approved.recipeRevisionId,Math.max(0,due-physical),c.id,c.packagingId,minimumQuality);
 }
 const contribution=(revisionId:string)=>{const trial=scheduleProduction({state:s,factoryId:f.id},{factoryId:f.id,items:[{recipeRevisionId:revisionId,cases:10}]}).rows[0],r=s.recipeRevisions.find(r=>r.id===revisionId)!,recipe=catalog.recipes.find(x=>x.id===r.recipeId)!;
  if(!trial.goodCases)return -Infinity;const net=trial.goodCases*(s.prices[revisionId]??recipe.referencePriceCents)-trial.materialCents-trial.packagingCents-trial.conversionCents-trial.allocatedLaborCents;
  return net/Math.max(1,...Object.values(trial.stationMinutes));
 };
 const discretionary=[...a.assortment];if(a.priority==='contribution')discretionary.sort((x,y)=>contribution(y.recipeRevisionId)-contribution(x.recipeRevisionId)||x.recipeRevisionId.localeCompare(y.recipeRevisionId));
 for(const i of discretionary){const already=items.filter(row=>row.recipeRevisionId===i.recipeRevisionId&&!row.contractId).reduce((n,row)=>n+row.cases,0),held=available(i.recipeRevisionId,a.minimumQuality);append(i.recipeRevisionId,Math.max(0,i.stockTargetCases-held-already));}
 return {items,exceptions};
}
