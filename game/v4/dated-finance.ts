import type {V4State,DomainEvent,Loan} from './model.ts';
import {starterLoan,installment,serviceLoan} from './finance.ts';
import {facilities,type FacilityId} from './commercial-finance.ts';
/** Replay contracted debt through one actual event, never today's debt card. */
export function loansAt(s:V4State,boundary:DomainEvent):Loan[]{
 const loans=[starterLoan()],cashAt=new Map<string,number>();let cash=0;
 for(const j of s.ledger){cashAt.set(j.id,cash);cash+=j.postings.filter(p=>p.account==='cash').reduce((n,p)=>n+p.debitCents-p.creditCents,0);}
 for(const e of s.events.slice(0,s.events.indexOf(boundary)+1)){
  let p:any={};try{p=JSON.parse(e.signature)}catch{}
  if(e.type==='select-funding'&&p.package==='leveraged')loans[0]=starterLoan(true);
  if(e.type==='take-loan'){const product=e.details.facility as FacilityId,t=facilities[product],principalCents=Number(e.details.principalCents);if(!t)throw Error('Unknown historical credit terms');loans.push({id:'facility:'+product,product,principalCents,weeklyRateBps:t.rate,installmentCents:installment(principalCents,t.rate,t.term),remainingWeeks:t.term,nextDueWeek:e.week,arrearsCents:0,arrearsPrincipalCents:0,arrearsInterestCents:0,feesCents:0,arrearsSinceWeek:null,status:'active',bridge:false});}
  if(e.type==='finance-recovery'){if(e.details.option==='restructure')for(const l of loans)Object.assign(l,{principalCents:0,remainingWeeks:0,arrearsCents:0,arrearsPrincipalCents:0,arrearsInterestCents:0,feesCents:0,arrearsSinceWeek:null,status:'settled'});const principalCents=Number(e.details.principalCents),weeklyRateBps=Number(e.details.weeklyRateBps),remainingWeeks=Number(e.details.termWeeks);loans.push({id:String(e.details.loanId),principalCents,weeklyRateBps,remainingWeeks,installmentCents:installment(principalCents,weeklyRateBps,remainingWeeks),nextDueWeek:e.week,arrearsCents:0,arrearsPrincipalCents:0,arrearsInterestCents:0,feesCents:0,arrearsSinceWeek:null,status:'active',bridge:e.details.option==='bridge'});}
  if(e.origin==='tick')for(const l of loans.filter(l=>l.status!=='settled'&&l.nextDueWeek<=e.week)){const j=s.ledger.find(j=>j.eventId===e.id&&j.id.startsWith(e.id+':'+l.id+'-'));if(!j)throw Error('Missing dated contracted debt service');serviceLoan({...s,week:e.week,cashCents:cashAt.get(j.id)!,ledger:[],campaign:{...s.campaign}},l,e);}
 }
 return loans;
}
