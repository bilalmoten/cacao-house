import {cohortOperators} from './teams.ts';
import {activeEmployee} from './site-recovery.ts';
import {laborCapacity} from './overtime.ts';
import type {V4State,Employee} from './model.ts';
export function operatorTeam(state:V4State,factoryId:string):Employee[] {return [...state.employees.filter(e=>activeEmployee(e)&&e.factoryId===factoryId&&e.role==='operator'),...cohortOperators(state).filter(e=>e.factoryId===factoryId)];}
export function availableLaborMinutes(state:V4State,factoryId:string):number {
  return operatorTeam(state,factoryId).reduce((n,e)=>n+Object.values(laborCapacity(e,state.training.some(t=>t.employeeId===e.id&&t.readyWeek>state.week),(state.overtimeBookings??[]).find(b=>b.employeeId===e.id&&b.bookedWeek===state.week)?.minutes??0)).reduce((n,v)=>n+v,0),0);
}
export function teamCompetency(state:V4State,factoryId:string):number {
  const team=operatorTeam(state,factoryId);return team.length?team.reduce((n,e)=>n+e.skills.production*(1-e.fatigue/500)*(e.cohortHeadcount??1),0)/team.reduce((n,e)=>n+(e.cohortHeadcount??1),0):0;
}
export function finishTraining(state:V4State):void {
  for(const t of state.training.filter(t=>t.readyWeek<=state.week)){const e=state.employees.find(e=>e.id===t.employeeId);if(e)e.skills[t.skill]=Math.min(100,e.skills[t.skill]+t.improvement);}
  state.training=state.training.filter(t=>t.readyWeek>state.week);
}
