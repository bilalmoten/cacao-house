import {packagingFamilies} from './content/packaging.ts';
import type {V4State,Account,LedgerEntry} from './model.ts';
import {accountBalance} from './finance.ts';
const uint=(n:unknown):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
const unique=(ids:string[])=>new Set(ids).size===ids.length;
function entityBalance(entries:LedgerEntry[],account:Account,id:string){return entries.reduce((n,e)=>n+e.postings.filter(p=>p.account===account&&p.entityId===id).reduce((m,p)=>m+p.debitCents-p.creditCents,0),0);}
export function validateSalesHistory(state:V4State):string[]{
 const errors:string[]=[];
 for(const [index,s]of state.salesHistory.entries()){
  if(s.week!==index+1||s.tickId!==state.completedTicks[index]||!Array.isArray(s.retail)||!Array.isArray(s.contracts)||!unique(s.retail.map(r=>r.offerId))||!unique(s.contracts.map(c=>c.contractId))){errors.push('Invalid sales source chronology or entity identity');continue;}
  const entries=state.ledger.filter(e=>e.week===s.week),deliveries=entries.filter(e=>e.kind==='contract-delivery');
  for(const r of s.retail){
   if(!state.recipeRevisions.some(p=>p.id===r.recipeRevisionId)||!packagingFamilies.some(p=>p.id===r.packagingId)||r.offerId!==(r.packagingId==='ordinary-wrap'?r.recipeRevisionId:r.recipeRevisionId+':'+r.packagingId)||![r.priceCents,r.demandCases,r.soldCases,r.revenueCents,r.cogsCents,r.unservedCases].every(uint)||r.priceCents<1||r.soldCases>r.demandCases||r.unservedCases!==r.demandCases-r.soldCases||r.revenueCents!==r.soldCases*r.priceCents||typeof r.reason!=='string'||!s.market?.offers.some(o=>o.id===r.offerId&&o.demandCases===r.demandCases))errors.push('Invalid historical retail quantities or observation');
   if(-entityBalance(entries,'retail-revenue',r.offerId)!==r.revenueCents||entityBalance(entries,'cogs',r.offerId)!==r.cogsCents)errors.push('Historical retail actuals disagree with source postings');
  }
  for(const c of s.contracts){
   const contract=state.contracts.find(p=>p.id===c.contractId);
   if(!contract||![c.deliveredCases,c.revenueCents,c.depositReleasedCents,c.receivableCents].every(uint)||c.deliveredCases<1||c.revenueCents!==c.deliveredCases*contract.priceCents||c.depositReleasedCents+c.receivableCents!==c.revenueCents)errors.push('Invalid historical contractual milestone');
   if(-entityBalance(entries,'contract-revenue',c.contractId)!==c.revenueCents||entityBalance(deliveries,'customer-deposits',c.contractId)!==c.depositReleasedCents||entityBalance(deliveries,'receivables',c.contractId)!==c.receivableCents)errors.push('Historical contractual actuals disagree with source postings');
  }
  if(s.retail.reduce((n,r)=>n+r.revenueCents,0)!==-accountBalance(state,'retail-revenue',entries)||s.contracts.reduce((n,c)=>n+c.revenueCents,0)!==-accountBalance(state,'contract-revenue',entries))errors.push('Incomplete recorded external sales');
  if(s.market){
   const m=s.market;if(m.week!==s.week||![m.opportunityCases,m.totalDemand,m.noPurchaseCases,m.rivalCases].every(uint)||m.totalDemand+m.noPurchaseCases+m.rivalCases!==m.opportunityCases||!Array.isArray(m.offers)||!unique(m.offers.map(o=>o.id))||m.offers.some(o=>!uint(o.demandCases))||m.offers.reduce((n,o)=>n+o.demandCases,0)!==m.totalDemand||!Array.isArray(m.segments)||m.segments.some(segment=>![segment.opportunityCases,segment.ownDemandCases,segment.noPurchaseCases,segment.rivalCases].every(uint)||segment.ownDemandCases+segment.noPurchaseCases+segment.rivalCases!==segment.opportunityCases)||m.segments.reduce((n,x)=>n+x.opportunityCases,0)!==m.opportunityCases)errors.push('Invalid finite-market historical observation');
  }else if(s.retail.length)errors.push('Sales actuals have no market observation');
  if(s.forecast){const f=s.forecast;if(f.week!==s.week||f.basis!=='sampled demand before stock constraints'||![f.lowCases,f.expectedCases,f.highCases,f.samples].every(uint)||f.samples<1||f.lowCases>f.expectedCases||f.expectedCases>f.highCases||!Array.isArray(f.offers)||f.offers.some(o=>![o.lowCases,o.expectedCases,o.highCases].every(uint)||o.lowCases>o.expectedCases||o.expectedCases>o.highCases))errors.push('Invalid stored forecast basis or interval');}
 }
 for(const c of state.contracts)if(state.salesHistory.reduce((n,s)=>n+s.contracts.filter(r=>r.contractId===c.id).reduce((m,r)=>m+r.deliveredCases,0),0)!==c.fulfilledCases)errors.push('Contract deliveries disagree with historical milestones');
 if(JSON.stringify(state.lastSales)!==JSON.stringify(state.salesHistory.at(-1)??null))errors.push('Latest sales actuals disagree with closed history');
 return errors;
}
