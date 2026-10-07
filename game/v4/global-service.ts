import type {V4State} from './model.ts';
import {orderOffers} from './content/orders.ts';

/** Annual allocations mature once, with a bounded final remainder. A grace
 * window is delivery flexibility, never extra promised annual volume. */
export function contractService(s:V4State,from:number,to:number){
 let promised=0,delivered=0;
 for(const c of s.contracts){
  const framework=orderOffers.find(o=>o.id===c.offerId)?.kind==='framework';
  if(framework){
   const cumulative=(week:number)=>Math.min(c.cases,Math.max(0,Math.min(52,week-c.dueStart+1))*Math.ceil(c.cases/52));
   const scheduled=cumulative(Math.min(to,c.dueEnd))-cumulative(Math.min(from-1,c.dueEnd));
   if(scheduled<=0)continue;
   promised+=scheduled;
   delivered+=Math.min(scheduled,s.salesHistory.filter(w=>w.week>=from&&w.week<=to).flatMap(w=>w.contracts).filter(r=>r.contractId===c.id).reduce((n,r)=>n+r.deliveredCases,0));
  }else if(c.dueEnd>=from&&c.dueEnd<=to){
   promised+=c.cases;
   delivered+=Math.min(c.cases,s.salesHistory.filter(w=>w.week<=c.dueEnd).flatMap(w=>w.contracts).filter(r=>r.contractId===c.id).reduce((n,r)=>n+r.deliveredCases,0));
  }
 }
 return promised?Math.min(1,delivered/promised):s.serviceTrust;
}
