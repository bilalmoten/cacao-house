import {activeEmployee} from './site-recovery.ts';
import {processEquipmentSignature,historicalProcessSignature} from './equipment.ts';
import type {V4State,DomainEvent,V4Command} from './model.ts';
import {standardCycleMinutes,commissioningProfile} from './process.ts';
import {post,debit,credit} from './finance.ts';
import {protectedCash} from './sourcing.ts';
import {operatorTeam} from './people.ts';
import {regionForCity} from './content/regions.ts';
export const ENGINEERING_FEE_CENTS=20000;
export const ENGINEERING_MINUTES=600;
export function bookEngineering(state:V4State,command:Extract<V4Command,{type:'engineer-commission'}>,event:DomainEvent):void{
 const factory=state.factories.find(f=>f.id===command.factoryId&&f.active),revision=state.recipeRevisions.find(r=>r.id===command.recipeRevisionId&&r.released),employee=state.employees.find(e=>activeEmployee(e)&&e.id===command.employeeId&&e.role==='engineer'&&e.factoryId===factory?.id);
 if(state.campaign.stage<3||!factory||!revision||!employee||employee.skills.setup<75||!operatorTeam(state,factory.id).length)throw Error('An operating line, released recipe and qualified site engineer are required from the production-network stage.');
 if(state.engineeringJobs.some(j=>j.status==='booked'&&j.factoryId===factory.id&&j.recipeRevisionId===revision.id))throw Error('This factory recipe already has a booked engineering trial.');
 const available=Math.floor(employee.contractedMinutes*(state.training.some(t=>t.employeeId===employee.id)?.5:1)*(1-employee.fatigue/200)),booked=state.engineeringJobs.filter(j=>j.employeeId===employee.id&&j.bookedWeek===state.week).reduce((n,j)=>n+j.minutes,0);
 if(booked+ENGINEERING_MINUTES>available)throw Error('The engineer has no remaining contracted time for this paid trial.');
 if(ENGINEERING_FEE_CENTS+protectedCash(state)>state.cashCents)throw Error('Engineer commissioning would consume protected operating obligations.');
 const competence=(.7*employee.skills.setup+.3*employee.skills.quality)/100,profile=commissioningProfile(state,factory.id,revision.id,'assisted',[competence,competence,competence]);profile.provenance='engineer';
 post(state,event,'Paid specialist process commissioning',[debit('commissioning',ENGINEERING_FEE_CENTS,command.id),credit('cash',ENGINEERING_FEE_CENTS)],'',{factoryId:factory.id,regionId:regionForCity(factory.cityId)},'engineering-booking');
 state.engineeringJobs.push({id:command.id,bookingEventId:event.id,employeeId:employee.id,factoryId:factory.id,recipeRevisionId:revision.id,equipmentSignature:profile.equipmentSignature,bookedWeek:state.week,dueWeek:state.week+1,feeCents:ENGINEERING_FEE_CENTS,minutes:ENGINEERING_MINUTES,status:'booked',profile});
 event.entityIds=[employee.id,factory.id,revision.id];event.details={minutes:ENGINEERING_MINUTES,feeCents:ENGINEERING_FEE_CENTS,dueWeek:state.week+1,setupSkill:employee.skills.setup,qualitySkill:employee.skills.quality,result:JSON.stringify(profile)};
}
export function finishEngineering(state:V4State,event:DomainEvent):string[]{
 const alerts:string[]=[];
 for(const job of state.engineeringJobs.filter(j=>j.status==='booked'&&j.dueWeek<=state.week)){
  const factory=state.factories.find(f=>f.id===job.factoryId),revision=state.recipeRevisions.find(r=>r.id===job.recipeRevisionId&&r.released),engineer=state.employees.find(e=>activeEmployee(e)&&e.id===job.employeeId&&e.role==='engineer'&&e.factoryId===job.factoryId);
  job.completionEventId=event.id;
  if(!factory?.active||(!revision||processEquipmentSignature(factory,revision.recipeId)!==job.equipmentSignature)||!revision||!engineer){job.status='interrupted';alerts.push('Engineering trial interrupted by a changed line, recipe or staff assignment; the earlier valid method is retained.');}
  else {const previous=state.processProfiles.find(p=>p.id===job.profile.id);if(!previous)state.processProfiles.push(structuredClone(job.profile));else if(job.profile.expectedYield>=previous.expectedYield&&job.profile.cycleMinutes<=previous.cycleMinutes)Object.assign(previous,structuredClone(job.profile));job.status='completed';}
  event.details['engineering:'+job.id]=job.status;
 }
 return alerts;
}
export function engineeringEvidenceErrors(state:V4State):string[]{
 const errors:string[]=[];
 if(!Array.isArray(state.engineeringJobs)||new Set(state.engineeringJobs.map(j=>j.id)).size!==state.engineeringJobs.length)return ['Invalid engineering history'];
 for(const job of state.engineeringJobs){
  const source=state.events.find(e=>e.id===job.bookingEventId),postings=state.ledger.filter(e=>e.eventId===job.bookingEventId),completion=state.events.find(e=>e.id===job.completionEventId);
  if(!source||source.type!=='engineer-commission'||source.week!==job.bookedWeek||job.id!==job.bookingEventId||job.dueWeek!==job.bookedWeek+1||job.feeCents!==ENGINEERING_FEE_CENTS||job.minutes!==ENGINEERING_MINUTES||!state.factories.some(f=>f.id===job.factoryId)||!state.recipeRevisions.some(r=>r.id===job.recipeRevisionId)||!state.employees.some(e=>e.id===job.employeeId)||!['booked','completed','interrupted'].includes(job.status)||source.details.feeCents!==job.feeCents||source.details.minutes!==job.minutes||postings.reduce((n,e)=>n+e.postings.filter(p=>p.account==='commissioning'&&p.entityId===job.id).reduce((m,p)=>m+p.debitCents-p.creditCents,0),0)!==job.feeCents||postings.reduce((n,e)=>n+e.postings.filter(p=>p.account==='cash').reduce((m,p)=>m+p.creditCents-p.debitCents,0),0)!==job.feeCents)errors.push('Engineering booking lacks its paid source evidence');
  let command:Record<string,unknown>={};try{command=JSON.parse(source?.signature??'{}');}catch{errors.push('Unreadable engineering source command');}
  if(command.type!=='engineer-commission'||command.id!==job.id||command.employeeId!==job.employeeId||command.factoryId!==job.factoryId||command.recipeRevisionId!==job.recipeRevisionId||source?.details.result!==JSON.stringify(job.profile)||!Number.isFinite(source?.details.setupSkill)||Number(source?.details.setupSkill)<75||Number(source?.details.setupSkill)>100||!Number.isFinite(source?.details.qualitySkill)||Number(source?.details.qualitySkill)<0||Number(source?.details.qualitySkill)>100)errors.push('Engineering identity or competence differs from its source booking');
  const p=job.profile;
  const score=p?(p.consistency-60)/35:NaN,recipe=state.recipeRevisions.find(r=>r.id===job.recipeRevisionId);
  const historical=recipe?historicalProcessSignature(state,job.factoryId,recipe.recipeId,job.bookingEventId):undefined;if(job.factoryId==='sf-workshop'&&!historical||historical&&historical!==job.equipmentSignature)errors.push('Engineering calibration differs from purchased equipment at booking.');
  if(!p||Math.abs(score-(.7*Number(source?.details.setupSkill)+.3*Number(source?.details.qualitySkill))/100)>1e-10||p.methodVersion!==1||!recipe||Math.abs(p.expectedYield-(.9+.08*score))>1e-10||Math.abs(p.requiredCompetency-(40+40*score))>1e-10||p.cycleMinutes!==Math.ceil(standardCycleMinutes(recipe.recipeId)*(1.15-.35*score))||p.id!==`${job.factoryId}/${job.recipeRevisionId}/${job.equipmentSignature}`||p.factoryId!==job.factoryId||p.recipeRevisionId!==job.recipeRevisionId||p.equipmentSignature!==job.equipmentSignature||p.provenance!=='engineer'||!Number.isSafeInteger(p.cycleMinutes)||p.cycleMinutes<=0||![p.expectedYield,p.consistency,p.requiredCompetency].every(Number.isFinite)||p.expectedYield<.9||p.expectedYield>.98||p.consistency<60||p.consistency>95||p.requiredCompetency<40||p.requiredCompetency>80)errors.push('Invalid commissioned engineering result');
  if(job.status==='booked'&&(job.completionEventId!==undefined||job.dueWeek<state.week)||job.status!=='booked'&&(!completion||completion.origin!=='tick'||completion.week<job.dueWeek||completion.details['engineering:'+job.id]!==job.status))errors.push('Engineering completion lacks its dated checkpoint');
 }
 for(const profile of state.processProfiles.filter(p=>p.provenance==='engineer'))if(!state.engineeringJobs.some(j=>j.status==='completed'&&JSON.stringify(j.profile)===JSON.stringify(profile)&&state.events.some(e=>e.id===j.completionEventId&&e.origin==='tick'&&e.week>=j.dueWeek&&e.week<state.week&&e.details['engineering:'+j.id]==='completed')))errors.push('Installed engineer method lacks its paid completed job');
 return errors;
}
