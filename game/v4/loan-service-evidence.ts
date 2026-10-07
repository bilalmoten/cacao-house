import {accountBalance,serviceLoan,installment} from './finance.ts';
import {facilities,type FacilityId} from './commercial-finance.ts';
import type {V4State,Loan} from './model.ts';
/** Replay contracted debt service at the actual ledger position after payroll
 * and earlier loans. Cash scarcity must create the same arrears and late fee. */
export function commercialServiceErrors(s:V4State):string[]{
 const errors:string[]=[];
 for(const actual of s.loans.filter(l=>l.product)){
  const origin=s.events.find(e=>e.type==='take-loan'&&e.entityIds.includes(actual.id));if(!origin)continue;
  const terms=facilities[actual.product as FacilityId];if(!terms)continue;
  const principal=Number(origin.details.principalCents);
  const replay:Loan={id:actual.id,product:actual.product,principalCents:principal,weeklyRateBps:terms.rate,installmentCents:installment(principal,terms.rate,terms.term),remainingWeeks:terms.term,nextDueWeek:origin.week,arrearsCents:0,arrearsPrincipalCents:0,arrearsInterestCents:0,feesCents:0,arrearsSinceWeek:null,status:'active',bridge:false};
  for(const event of s.events.slice(s.events.indexOf(origin)+1)){
   if(event.type==='finance-recovery'&&event.details.option==='restructure'){
    Object.assign(replay,{principalCents:0,remainingWeeks:0,arrearsCents:0,arrearsPrincipalCents:0,arrearsInterestCents:0,feesCents:0,arrearsSinceWeek:null,status:'settled'});continue;
   }
   if(event.origin!=='tick'||replay.status==='settled')continue;
   const entries=s.ledger.filter(e=>e.eventId===event.id&&e.id.startsWith(event.id+':'+actual.id+'-'));
   const first=s.ledger.findIndex(e=>e.eventId===event.id&&e.id.startsWith(event.id+':'+actual.id+'-'));
   if(first<0){errors.push('Commercial service has no scheduled installment evidence');continue;}
   const draft={...s,week:event.week,cashCents:accountBalance(s,'cash',s.ledger.slice(0,first)),ledger:[],campaign:{...s.campaign}};
   try{serviceLoan(draft,replay,event);}catch{errors.push('Commercial service cannot replay its available cash');continue;}
   if(JSON.stringify(draft.ledger)!==JSON.stringify(entries))errors.push('Commercial service differs from actual contracted principal, interest or late fees');
  }
  for(const field of ['principalCents','remainingWeeks','nextDueWeek','arrearsCents','arrearsPrincipalCents','arrearsInterestCents','feesCents','arrearsSinceWeek','status'] as const)if(actual[field]!==replay[field])errors.push('Commercial loan balance or recovery status differs from replayed installments');
 }
 return errors;
}
