import{fundedPortfolio}from './global.ts';
import {activeEmployee} from './site-recovery.ts';
import type {V4State,ResearchProject,ResearchCommand,ResearchPhase,DomainEvent,ResearchBrief} from './model.ts';
import {catalog} from './catalog.ts';
import {recipeLeadCities} from './content/research-leads.ts';
import {protectedCash,supplierEligible} from './sourcing.ts';
import {debit,credit,post} from './finance.ts';
const phases:ResearchPhase[]=['concept','pilot','taste','stability'];
const fees:Record<ResearchPhase,number>={concept:.25,pilot:.10,taste:.20,stability:.30};
function validBrief(recipeId:string,brief:ResearchBrief){const r=catalog.recipes.find(r=>r.id===recipeId);return !!r&&Number.isFinite(brief.minimumQuality)&&brief.minimumQuality>=0&&brief.minimumQuality<=100&&Number.isSafeInteger(brief.shelfWeeks)&&brief.shelfWeeks>=r.minimumShelfWeeks&&['value','gifting','enthusiast','online'].includes(brief.segment);}
function validFormula(recipeId:string,formula:Record<string,string>):boolean {const recipe=catalog.recipes.find(r=>r.id===recipeId);return !!recipe&&!!formula&&recipe.roles.every(role=>role.allowedVarietyIds.includes(formula[role.role]))&&Object.keys(formula).length===recipe.roles.length;}
function eligibleResearcher(state:V4State,id:string){return state.employees.find(e=>activeEmployee(e)&&e.id===id&&['researcher','quality'].includes(e.role)&&e.skills.research>=55&&e.contractedMinutes>=600);}
function quotedRemaining(project:ResearchProject){return phases.filter(phase=>!project.paidStages.includes(phase)).reduce((n,phase)=>n+Math.round(project.budgetCents*fees[phase]),0);}
export function researchCommand(state:V4State,command:ResearchCommand,event:DomainEvent):void {
 if(command.type==='introduce-recipe'){
  const recipe=catalog.recipes.find(r=>r.id===command.recipeId);
  if(!recipe||recipe.stage>state.campaign.stage||!recipeLeadCities[recipe.id].some(city=>state.visitedCities.includes(city))||state.knownRecipeBriefs.includes(recipe.id))throw Error('Follow the named regional brief before opening this development project.');
  if(recipe.roles.some(role=>!role.allowedVarietyIds.some(id=>catalog.suppliers.some(s=>supplierEligible(state,s.id)&&s.varietyIds.includes(id)))))throw Error('Meet the ingredient contacts needed for this brief first.');
  state.knownRecipeBriefs.push(recipe.id);event.entityIds=[recipe.id];return;
 }
 if(command.type==='start-research'){
  const recipe=catalog.recipes.find(r=>r.id===command.recipeId);
  if(!recipe||!state.knownRecipeBriefs.includes(recipe.id)||!validFormula(recipe.id,command.formula)||!validBrief(recipe.id,command.brief)||!eligibleResearcher(state,command.researcherId)||!/^[a-zA-Z0-9:_-]{1,96}$/.test(command.projectId)||state.researchProjects.some(p=>p.id===command.projectId||p.recipeId===recipe.id&&!['released','abandoned'].includes(p.status)))throw Error('Choose an introduced brief, compatible formula and qualified available researcher.');
  if(Object.values(command.formula).some(id=>!catalog.suppliers.some(s=>supplierEligible(state,s.id)&&s.varietyIds.includes(id))))throw Error('The proposed formula lacks a discovered ingredient supply route.');
  const project:ResearchProject={id:command.projectId,recipeId:recipe.id,revision:1+Math.max(0,...state.recipeRevisions.filter(r=>r.recipeId===recipe.id).map(r=>r.version)),researcherId:command.researcherId,formula:structuredClone(command.formula),brief:structuredClone(command.brief),phase:'concept',status:'active',dueWeek:null,paidCents:0,budgetCents:Math.max(100000,recipe.researchBudgetCents),paidStages:[],findings:[],pilotQuality:null,pilotFailures:[],testedShelfWeeks:null,remainingCents:0};project.remainingCents=quotedRemaining(project);state.researchProjects.push(project);event.entityIds=[project.id,recipe.id];return;
 }
 const project=state.researchProjects.find(p=>p.id===command.projectId);if(!project)throw Error('Research project is unavailable.');event.entityIds=[project.id,project.recipeId];
 if(command.type==='research-status'){
  if(['released','abandoned'].includes(project.status))throw Error('A closed project cannot resume.');
  if(command.status==='paused'){if(project.status!=='active'&&project.status!=='waiting')throw Error('This project has no active work to pause.');project.pausedFrom=project.status;project.status='paused';}
  else if(command.status==='abandoned'){project.status='abandoned';project.dueWeek=null;}
  else{if(project.status!=='paused')throw Error('Only a paused project can resume.');project.status=project.pausedFrom??'active';delete project.pausedFrom;if(project.status==='waiting')project.dueWeek=Math.max(state.week,project.dueWeek??state.week);}
  return;
 }
 if(command.type==='revise-research'){
  if(!['active','failed','ready'].includes(project.status)||!validFormula(project.recipeId,command.formula)||!validBrief(project.recipeId,command.brief))throw Error('Revise a completed finding with an eligible formula and commercial brief.');
  const material=Object.entries(command.formula).some(([role,id])=>project.formula[role]!==id);
  if(command.repeatFrom&&(!['pilot','taste','stability'].includes(command.repeatFrom)||phases.slice(0,phases.indexOf(command.repeatFrom)).some(phase=>!project.paidStages.includes(phase))))throw Error('Choose a valid paid stage to repeat.');project.brief=structuredClone(command.brief);
  if(material||command.repeatFrom){project.formula=structuredClone(command.formula);if(material)project.revision++;project.phase=material?(project.paidStages.includes('concept')?'pilot':'concept'):command.repeatFrom!;project.paidStages=project.paidStages.filter(p=>phases.indexOf(p)<phases.indexOf(project.phase));if(project.phase==='pilot'){project.pilotQuality=null;project.pilotFailures=[];}project.testedShelfWeeks=null;project.status='active';project.dueWeek=null;}
  else project.status=project.testedShelfWeeks!==null&&project.pilotQuality!==null&&project.testedShelfWeeks>=project.brief.shelfWeeks&&project.pilotQuality>=project.brief.minimumQuality&&!project.pilotFailures.length?'ready':project.testedShelfWeeks!==null?'failed':'active';
  project.remainingCents=quotedRemaining(project);return;
 }
 if(command.type==='release-research'){
  if(researchEvidenceErrors(state,project).length||project.status!=='ready'||project.pilotFailures.length||phases.some(p=>!project.paidStages.includes(p))||project.pilotQuality===null||project.testedShelfWeeks===null||project.pilotQuality<project.brief.minimumQuality||project.testedShelfWeeks<project.brief.shelfWeeks)throw Error('Complete and pay for the formula’s pilot, taste and stability evidence before release.');
  const id=project.recipeId+':r'+project.revision;if(state.recipeRevisions.some(r=>r.id===id))throw Error('This formula revision is already documented.');
  state.recipeRevisions.push({id,recipeId:project.recipeId,version:project.revision,formula:structuredClone(project.formula),released:true,shelfWeeks:project.testedShelfWeeks,packagingId:'ordinary-wrap',producedCases:0});project.status='released';project.releasedRevisionId=id;event.entityIds.push(id);return;
 }
 if(command.type==='research-stage'){
  if(project.status!=='active'||project.paidStages.includes(project.phase))throw Error('This stage is waiting, paused, completed or needs revision.');
  const researcher=eligibleResearcher(state,project.researcherId);if(!researcher)throw Error('Assign a qualified researcher with contracted lab time.');
  const bookedMinutes=state.events.filter(e=>e.week===state.week&&e.type==='research-stage'&&e.details.researcherId===researcher.id).reduce((n,e)=>n+Number(e.details.labMinutes??0),0);
  if(bookedMinutes+600>researcher.contractedMinutes*(state.training.some(t=>t.employeeId===researcher.id)?.5:1))throw Error('This researcher’s contracted lab hours are already booked.');
  const cost=Math.round(project.budgetCents*fees[project.phase]);if(cost+protectedCash(state)>state.cashCents)throw Error('Lab booking would consume protected operating obligations.');
  if(project.phase==='pilot'){
   const recipe=catalog.recipes.find(r=>r.id===project.recipeId)!,warehouse=state.warehouses.find(w=>w.cityId==='sf');let weightedQuality=0,totalWeight=0;
   for(const role of recipe.roles){let need=role.gramsPerCase*2;const lots=state.inventory.filter(l=>l.kind==='ingredient'&&l.varietyId===project.formula[role.role]&&l.locationId===warehouse?.id&&l.arrivalWeek<=state.week&&l.expiryWeek>=state.week&&l.quality*l.condition/100>=role.minimumQuality&&!l.reservations.length).sort((a,b)=>a.expiryWeek-b.expiryWeek||a.id.localeCompare(b.id));
    if(lots.reduce((n,l)=>n+l.quantity,0)<need)throw Error('The paid pilot needs two cases of eligible unreserved lab ingredients.');
    let quality=0,rawCost=0;for(const lot of lots){const take=Math.min(need,lot.quantity),value=take===lot.quantity?lot.costCents:Math.floor(lot.costCents*take/lot.quantity);quality+=take*lot.quality*lot.condition/100;lot.quantity-=take;lot.costCents-=value;rawCost+=value;if(value)post(state,event,'Physical research pilot ingredients consumed',[debit('research',value,project.id),credit('raw-inventory',value,lot.id)],project.id+':'+role.role+':'+lot.id,state.ledger.find(e=>e.postings.some(p=>p.account==='raw-inventory'&&p.entityId===lot.id&&p.debitCents>0))?.scope,'research-materials');need-=take;if(!need)break;}
    const roleQuality=quality/(role.gramsPerCase*2);if(roleQuality<role.minimumQuality)project.pilotFailures.push(role.role+' below its critical input grade');weightedQuality+=roleQuality*role.qualityWeight;totalWeight+=role.qualityWeight;project.paidCents+=rawCost;
   }
   state.inventory=state.inventory.filter(l=>l.quantity>0);project.pilotQuality=Math.min(100,.7*weightedQuality/totalWeight+.3*researcher.skills.research+(fundedPortfolio(state,'innovation',state.factories.find(f=>f.id===researcher.factoryId)?.cityId??state.currentCityId)?2:0));
  }
  post(state,event,'Paid '+project.phase+' lab stage',[debit('research',cost,project.id),credit('cash',cost)],project.id+':lab');project.paidCents+=cost;project.paidStages.push(project.phase);project.remainingCents=quotedRemaining(project);project.status='waiting';project.bookingEventId=event.id;project.dueWeek=state.week;event.details={completionWeeks:1,researcherId:researcher.id,labMinutes:600,phase:project.phase,revision:project.revision,feeCents:cost};return;
 }
}
export function finishResearch(state:V4State,event:DomainEvent):void {
 for(const project of state.researchProjects.filter(p=>p.status==='waiting'&&p.dueWeek!==null&&p.dueWeek<=state.week)){
  const researcher=state.employees.find(e=>e.id===project.researcherId),recipe=catalog.recipes.find(r=>r.id===project.recipeId)!;
  if(!researcher){project.status='paused';project.pausedFrom='waiting';continue;}
  let result='';
  if(project.phase==='concept')result='Technique, ingredient compatibility and customer brief documented.';
  if(project.phase==='pilot')result=`Paid physical pilot quality ${Math.round(project.pilotQuality??0)}; material and process risks retained.`;
  if(project.phase==='taste')result=`${project.brief.segment} panel: ${project.pilotQuality!==null&&project.pilotQuality>=project.brief.minimumQuality?'quality target supported':'quality target needs a revised formula'}.`;
  if(project.phase==='stability'){project.testedShelfWeeks=Math.floor(recipe.shelfWeeks*(.9+.15*researcher.skills.research/100));result=`Game-model stability evidence supports ${project.testedShelfWeeks} weeks; brief requires ${project.brief.shelfWeeks}.`;}
  project.findings.push({phase:project.phase,revision:project.revision,week:state.week,result,stageEventId:project.bookingEventId!,completionEventId:event.id,...(project.phase==='pilot'||project.phase==='taste'?{value:project.pilotQuality??0}:project.phase==='stability'?{value:project.testedShelfWeeks??0}:{})});project.dueWeek=null;
  if(project.phase==='stability')project.status=(project.pilotQuality??0)>=project.brief.minimumQuality&&(project.testedShelfWeeks??0)>=project.brief.shelfWeeks&&!project.pilotFailures.length?'ready':'failed';
  else{project.phase=phases[phases.indexOf(project.phase)+1];project.status='active';}
 }
}

/** Fees and completed findings are source evidence, not editable stage badges. */
export function researchEvidenceErrors(state:V4State,project:ResearchProject):string[]{
 const errors:string[]=[];
 for(const phase of project.paidStages){
  const bookings=state.events.filter(e=>e.type==='research-stage'&&e.entityIds.includes(project.id)&&e.details.phase===phase&&(phase==='concept'||e.details.revision===project.revision));
  const booking=bookings.at(-1),fee=Math.round(project.budgetCents*fees[phase]);
  const entry=booking?state.ledger.find(e=>e.id===booking.id+':'+project.id+':lab'&&e.eventId===booking.id):undefined;
  if(!booking||booking.details.feeCents!==fee||booking.details.labMinutes!==600||!entry||entry.postings.filter(p=>p.account==='research'&&p.entityId===project.id).reduce((n,p)=>n+p.debitCents-p.creditCents,0)!==fee||entry.postings.filter(p=>p.account==='cash').reduce((n,p)=>n+p.creditCents-p.debitCents,0)!==fee){errors.push('Research stage lacks its individually paid fee');continue;}
  if(['ready','released'].includes(project.status)){
   const finding=project.findings.find(f=>f.phase===phase&&f.stageEventId===booking.id&&(phase==='concept'||f.revision===project.revision));
   if(!finding||!state.events.some(e=>e.id===finding.completionEventId&&e.origin==='tick'&&e.week===finding.week)||finding.week<booking.week+(booking.details.completionWeeks===1?0:1))errors.push('Research stage lacks its completed dated finding');
   if(finding&&phase==='pilot'&&finding.value!==project.pilotQuality||finding&&phase==='stability'&&finding.value!==project.testedShelfWeeks)errors.push('Research release disagrees with observed findings');
  }
 }
 return errors;
}
