import {catalog} from './catalog.ts';
import {buildReport} from './reports.ts';
import type {V4State} from './model.ts';
import {candidates} from './content/people.ts';
export const guideStepIds=['identity','inspect','equipment','staff','trial','supplier','buyer','plan','preview','close','outcome'] as const;
export type GuideStepId=typeof guideStepIds[number];
/** Guidance observes committed business actions; help never completes story gates. */
export function openingGuide(state:V4State){
 const has=(type:string,test:(e:V4State['events'][number])=>boolean=()=>true)=>state.events.some(e=>e.type===type&&test(e));
 const data:[GuideStepId,string,string,string,boolean][]=[
 ['identity','Your house',`${state.identity.founder}, ${state.identity.business} starts with your name and choices.`,'office',true],
 ['inspect','Inspect the workshop',`Nadia: Walk inside the empty waterfront workshop for ${state.identity.business}. Look at receiving, cooling and packing before choosing a line.`,'workshop',has('visit-location',e=>e.details.cityId==='sf'&&e.details.locationId==='workshop')],
 ['equipment','Choose a line','Nadia: Compare purchase cost and station minutes. A fast process line still waits for its cooling and packing stations.','workshop',has('select-equipment')],
 ['staff','Hire your first team','Nadia: Hire two named operators. Their contracted hours and production skill matter separately from machine time.','workshop',new Set(state.events.filter(e=>e.type==='hire'&&candidates.some(c=>c.role==='operator'&&e.entityIds.includes(c.id))).flatMap(e=>e.entityIds.filter(id=>candidates.some(c=>c.id===id&&c.role==='operator')))).size>=2],
 ['trial','Commission the method','Nadia: Try the line for each of the two opening recipes. Practice is free; only a paid saved trial changes routine production.','workshop',['embar62','velvet-milk'].every(id=>state.processProfiles.some(p=>p.factoryId==='sf-workshop'&&state.recipeRevisions.some(r=>r.id===p.recipeRevisionId&&r.recipeId===id)))],
 ['supplier','Meet Rafi','Nadia: Visit Rafi’s pantry. Compare landed cost, ingredient quality and receiving space before buying.','rafi-pantry',has('visit-location',e=>e.details.cityId==='sf'&&e.details.locationId==='rafi-pantry')],
 ['buyer','Understand Leda’s order','Nadia: Meet Leda at the ferry café and review her quantity, quality, deposit and delivery window. Accept only the promise you can keep.','ferry-cafe',has('accept-order',e=>e.entityIds.includes('ferry'))],
 ['plan','Plan a real batch','Nadia: Save a positive case target. The feasible output preview explains stock, cooling, packing and skilled labor limits.','workshop',has('production-plan',e=>{try{return JSON.parse(e.signature).plan.items.some((i:{cases:number})=>i.cases>0);}catch{return false;}})],
 ['preview','Review next week','Nadia: Preview commitments before closing. Cash is a sampled range; wages, rent and installments still need funding.','office',has('preview-week')],
 ['close','Close the operating week','Nadia: Advance the week when you are ready. Deliveries run before retail and expiry; each obligation is booked once.','office',state.completedTicks.length>0],
 ['outcome','Read the outcome','Nadia: Open the first closed finance report. Compare profit with cash and follow a source entry back to its place.','office',has('view-report',e=>typeof e.details.actualClosedWeek==='number'&&e.details.actualClosedWeek>=1)],
 ];
 const steps=data.map(([id,title,prompt,targetLocationId,complete])=>({id,title,prompt,targetLocationId,complete})),currentStep=steps.find(s=>!s.complete)??null,focus=steps.find(s=>s.id===state.guide.replayStepId)??currentStep;
 return {mode:state.guide.mode,steps,currentStep,focus,complete:currentStep===null,showPrompt:state.guide.mode==='guided'&&focus!==null&&(state.campaign.stage===1||state.guide.replayStepId!==undefined)};
}
export function visibleSystems(state:V4State):string[]{return ['identity','supplies','production','people','finance','reports',...(state.campaign.stage>=2?['research']:[]),...(state.campaign.stage>=3?['network','delegation']:[]),...(state.campaign.stage>=4?['owned-retail','ecommerce','marketing']:[]),...(state.campaign.stage>=5?['franchise']:[]),...(state.campaign.stage>=6?['executives','portfolio']:[])];}
export function guidanceErrors(state:V4State):string[]{
 const errors:string[]=[];
 if(!state.guide||!['guided','explore','paused'].includes(state.guide.mode)||state.guide.replayStepId!==undefined&&!guideStepIds.includes(state.guide.replayStepId))errors.push('Invalid opening guidance settings');
 for(const event of state.events.filter(e=>['visit-location','view-report','preview-week'].includes(e.type))){
  let command:Record<string,any>;try{command=JSON.parse(event.signature);}catch{errors.push('Invalid guidance source action');continue;}
  if(command.type!==event.type||command.id!==event.id)errors.push('Guidance observation differs from its source command');
  if(event.type==='visit-location'){
   const city=catalog.cities.find(c=>c.id===command.cityId);if(!city||!state.visitedCities.includes(city.id)||!city.hotspots.includes(command.locationId)||event.details.cityId!==command.cityId||event.details.locationId!==command.locationId)errors.push('World observation differs from an available local action');
  }
  if(event.type==='view-report'){
   if(!command.query){errors.push('Missing report observation source');continue;}
   const historical={...state,week:event.week,snapshots:state.snapshots.filter(s=>s.week<event.week)},view=buildReport(historical,command.query),closed=view.metrics.some(m=>m.basis==='actual'&&m.value!==null)&&['finance','overview'].includes(command.query.category),snapshot=historical.snapshots.find(s=>s.tickId===view.generatedFromTickId);
   if(event.details.category!==command.query.category||event.details.actualClosedWeek!==(closed&&snapshot?snapshot.week:0))errors.push('Report observation differs from its available closed outcome');
  }
  if(event.type==='preview-week'&&(event.details.expectedWeek!==event.week||!Number.isSafeInteger(event.details.lowCashCents)||Number(event.details.lowCashCents)<0||!Number.isSafeInteger(event.details.highCashCents)||Number(event.details.highCashCents)<Number(event.details.lowCashCents)||event.details.basis!=='sampled weekly outlook'))errors.push('Invalid sampled commitment-preview observation');
 }
 return errors;
}
