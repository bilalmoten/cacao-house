import type {V4State,DomainEvent,HouseUpdate} from './model.ts';
import {catalog} from './catalog.ts';
import {seasonalYield} from './sourcing.ts';
export function welcomeUpdate():HouseUpdate{return {id:'welcome',author:'Nadia',kind:'guidance',topic:'opening',title:'Your name above the door',body:'Welcome, {founder}. {brand} has working capital and a weekly loan payment. Inspect the waterfront workshop, compare the station limits, and hire a small named team. Start guided or Explore myself; either path keeps the same business promises.',publishedWeek:1,effectiveWeek:1,sourceEventId:'founding-equity',locationIds:['workshop','office'],cityIds:['sf'],entityIds:['house']};}
function inHarvest(id:string,week:number){const variety=catalog.ingredients.find(v=>v.id===id)!;const yearWeek=(week-1)%52+1;return variety.harvest.some(([a,b])=>yearWeek>=a&&yearWeek<=b);}
/** Publish known, actionable calendar changes ahead of the same spot-price rule. */
function updatesFor(state:V4State,event:DomainEvent,interruptions:string[]):HouseUpdate[]{
 const publishedWeek=state.week+1,items:HouseUpdate[]=[];
 const add=(topic:string,title:string,body:string,locations:string[],entities:string[],effectiveWeek=publishedWeek,author='Operations desk',kind:HouseUpdate['kind']='information')=>{const id=topic==='harvest'?`harvest:${entities[0]}:${effectiveWeek}`:`update:${event.id}:${topic}`;if(!state.updates.some(u=>u.id===id)&&!items.some(u=>u.id===id))items.push({id,author,kind,topic,title,body,publishedWeek,effectiveWeek,sourceEventId:event.id,locationIds:locations,cityIds:[...new Set(locations.flatMap(id=>{const factory=state.factories.find(f=>f.id===id),warehouse=state.warehouses.find(w=>w.id===id);return factory?[factory.cityId]:warehouse?[warehouse.cityId]:catalog.cities.filter(c=>c.id===id||c.hotspots.includes(id)).map(c=>c.id);}))],entityIds:entities});};
 if(event.details.globalNews){const n=JSON.parse(String(event.details.globalNews));add('global-economics',n.title,n.body,['executive-floor','supply-yard'],['global-economics'],n.effective,'Regional economics desk');}
 if(state.week===1)add('first-report','The first close is ready','{brand} has closed its first operating week. Open Reports in the office: opening cash plus operating, investing and financing flows equals closing cash. Profit measures earned revenue and expenses; loan principal, equipment and customer deposits explain why cash moves differently. Follow a source entry before choosing the next investment.',['office'],['house'],publishedWeek,'Nadia','guidance');
 const knownSuppliers=catalog.suppliers.filter(s=>state.knownSuppliers.includes(s.id)&&s.stage<=state.campaign.stage),knownVarieties=new Set(knownSuppliers.flatMap(s=>s.varietyIds));
 for(const variety of catalog.ingredients.filter(v=>knownVarieties.has(v.id)&&v.stage<=state.campaign.stage)){
  const effectiveWeek=publishedWeek+3;
  if(inHarvest(variety.id,effectiveWeek)===inHarvest(variety.id,effectiveWeek-1))continue;
  const before=seasonalYield(variety,effectiveWeek-1),after=seasonalYield(variety,effectiveWeek),suppliers=knownSuppliers.filter(s=>s.varietyIds.includes(variety.id));
  add('harvest',variety.name+' — harvest outlook',`Fictional game calendar: ${variety.name} changes harvest phase in week ${effectiveWeek}. Expected supplier output moves from ${Math.round(before*100)}% to ${Math.round(after*100)}% of baseline. New spot offers adjust price and available quantity; already paid freight keeps its terms. Compare buying now with holding cost, expiry, receiving space and supplier lead time.`,suppliers.map(s=>s.cityId),[variety.id,...suppliers.map(s=>s.id)],effectiveWeek);
 }
 if(interruptions.length)add('operating-exceptions','Decisions needing attention',interruptions.join('\n'),['office',...state.factories.map(f=>f.id)],['house']);
 for(const contract of state.lastSales?.contracts??[])if(contract.deliveredCases)add('delivery:'+contract.contractId,'A customer promise moved forward',`Delivered ${contract.deliveredCases} cases. $${(contract.revenueCents/100).toFixed(2)} of revenue were earned; $${(contract.depositReleasedCents/100).toFixed(2)} of deposit were released and $${(contract.receivableCents/100).toFixed(2)} remain in a dated customer balance. Review the contract and settlement timeline before treating revenue as cash.`,['ferry-cafe','office'],[contract.contractId]);
 if(state.researchProjects.some(p=>p.findings.some(f=>f.completionEventId===event.id)))add('research-findings','Paid lab findings are ready','Review the completed pilot, taste or stability evidence in the Recipe Lab. Revise the formula, reduce ambition, continue testing or retain the findings while paused. A report does not release an unqualified recipe.',['office'],state.researchProjects.filter(p=>p.findings.some(f=>f.completionEventId===event.id)).map(p=>p.id),publishedWeek,'Dev Mehta');
 return items;
}
interface UpdateContext {stage:V4State['campaign']['stage'];knownSuppliers:string[];factoryIds:string[];interruptions:string[]}
export function publishUpdates(state:V4State,event:DomainEvent,interruptions:string[]):void{
 const context:UpdateContext={stage:state.campaign.stage,knownSuppliers:[...state.knownSuppliers],factoryIds:state.factories.map(f=>f.id),interruptions:[...interruptions]},items=updatesFor(state,event,interruptions);
 state.updates.push(...items);event.details.publishedUpdates=JSON.stringify(items);event.details.updateContext=JSON.stringify(context);
}
export function updateFeed(state:V4State,asOfWeek=state.week){return state.updates.filter(u=>u.publishedWeek<=asOfWeek).map(u=>({...structuredClone(u),body:u.body.replaceAll('{brand}',state.identity.business).replaceAll('{founder}',state.identity.founder),read:u.readWeek!==undefined&&u.readWeek<=asOfWeek})).sort((a,b)=>b.publishedWeek-a.publishedWeek||a.id.localeCompare(b.id));}
export function updateErrors(state:V4State):string[]{
 const errors:string[]=[];
 if(!Array.isArray(state.updates)||new Set(state.updates.map(u=>u.id)).size!==state.updates.length)return ['Invalid update history'];
 for(const update of state.updates){
  if(!update||!['guidance','information','offer','commitment'].includes(update.kind)||![update.publishedWeek,update.effectiveWeek].every(n=>Number.isSafeInteger(n)&&n>=1)||update.publishedWeek>state.week||update.effectiveWeek<update.publishedWeek||![update.id,update.author,update.topic,update.title,update.body].every(s=>typeof s==='string'&&s.length>0)||!Array.isArray(update.locationIds)||!Array.isArray(update.cityIds)||update.cityIds.some(id=>!catalog.cities.some(c=>c.id===id))||!Array.isArray(update.entityIds)||update.locationIds.some(id=>typeof id!=='string')||update.entityIds.some(id=>typeof id!=='string')||update.readWeek!==undefined&&(!Number.isSafeInteger(update.readWeek)||update.readWeek<update.publishedWeek||update.readWeek>state.week)){errors.push('Invalid dated update');continue;}
  const source=state.events.find(e=>e.id===update.sourceEventId);if(!source||update.publishedWeek!==source.week+(source.origin==='tick'?1:0))errors.push('Update publication lacks its dated source');let published:HouseUpdate[]=[];try{published=JSON.parse(String(source?.details.publishedUpdates??'[]'));}catch{errors.push('Unreadable published update evidence');}
  const {readWeek:_,...original}=update;if(!Array.isArray(published)||!published.some(u=>JSON.stringify(u)===JSON.stringify(original)))errors.push('Update differs from its source publication');
  if(update.readWeek!==undefined&&!state.events.some(e=>e.type==='read-update'&&e.week===update.readWeek&&e.entityIds.includes(update.id)))errors.push('Update read state lacks its action');
 }
 if(!state.updates.some(u=>u.id==='welcome'&&JSON.stringify((({readWeek:_,...original})=>original)(u))===JSON.stringify(welcomeUpdate())))errors.push('Founding guidance history is incomplete');
 for(const event of state.events.filter(e=>state.completedTicks.includes(e.id))){
  let context:UpdateContext;try{context=JSON.parse(String(event.details.updateContext));}catch{errors.push('Missing dated publication context');continue;}
  if(!context||![1,2,3,4,5,6].includes(context.stage)||!Array.isArray(context.knownSuppliers)||context.knownSuppliers.some(id=>!state.knownSuppliers.includes(id))||!Array.isArray(context.factoryIds)||context.factoryIds.some(id=>!state.factories.some(f=>f.id===id))||!Array.isArray(context.interruptions)||context.interruptions.some(s=>typeof s!=='string')){errors.push('Invalid dated publication context');continue;}
  const historical={...state,week:event.week,campaign:{...state.campaign,stage:context.stage},knownSuppliers:context.knownSuppliers,factories:state.factories.filter(f=>context.factoryIds.includes(f.id)),updates:state.updates.filter(u=>u.publishedWeek<=event.week),lastSales:state.salesHistory.find(s=>s.tickId===event.id)??null};
  const expected=updatesFor(historical,event,context.interruptions),actual=state.updates.filter(u=>u.sourceEventId===event.id).map(({readWeek:_,...original})=>original);
  if(JSON.stringify(actual)!==JSON.stringify(expected)||event.details.publishedUpdates!==JSON.stringify(expected))errors.push('Publications differ from dated operational facts or required history');
 }
 return errors;
}
