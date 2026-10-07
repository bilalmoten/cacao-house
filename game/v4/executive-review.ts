import type {V4State} from './model.ts';
import {financialSummary} from './finance.ts';
import {protectedCash} from './sourcing.ts';
import {regionCities,regionForCity} from './content/regions.ts';
import {executives,enterpriseValue,portfolioPlans,recurringOperatingFlow,economicOutlook} from './global.ts';
import {managedProduction} from './production-management.ts';

const dollars=(cents:number)=>'$'+(cents/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});

export function regionalPerformance(s:V4State){
 const to=s.week-1,from=Math.max(1,to-12);
 return Object.entries(regionCities).map(([id,cities])=>{
  const entries=s.ledger.filter(j=>j.week>=from&&j.week<=to&&j.scope?.regionId===id),p=financialSummary(s,entries);
  const cashFlowCents=entries.reduce((n,j)=>n+j.postings.filter(p=>p.account==='cash').reduce((m,p)=>m+p.debitCents-p.creditCents,0),0);
  const production=s.snapshots.filter(w=>w.week>=from&&w.week<=to).flatMap(w=>w.production).filter(f=>f.regionId===id).flatMap(f=>f.rows);
  const goodCases=production.reduce((n,r)=>n+r.goodCases,0),quality=goodCases?production.reduce((n,r)=>n+r.quality*r.goodCases,0)/goodCases:null;
  const partnerRows=(s.franchiseHistory??[]).filter(w=>w.week>=from&&w.week<=to).flatMap(w=>w.cohorts).filter(r=>cities.includes(r.cityId));
  return {id,from,to,closedWeeks:s.snapshots.filter(w=>w.week>=from&&w.week<=to).length,...p,cashFlowCents,goodCases,quality,partnerCompliance:partnerRows.length?partnerRows.filter(r=>r.compliant).length/partnerRows.length:null,allocations:portfolioPlans(s).filter(p=>p.regionId===id),active:s.factories.some(f=>f.active&&cities.includes(f.cityId))||(s.consumerChannels??[]).some(c=>c.active&&cities.includes(c.cityId))||(s.franchiseCohorts??[]).some(c=>partnerRows.some(r=>r.cohortId===c.id))};
 });
}

export function executiveReview(s:V4State){
 const value=enterpriseValue(s),from=Math.max(1,s.week-13),flow=recurringOperatingFlow(s,from,s.week-1),cover=protectedCash(s),news=economicOutlook(s);
 const exceptions:{id:string;priority:'urgent'|'review';title:string;body:string;worldId:string}[]=[];
 if(s.unpaidObligations.length||s.loans.some(l=>l.arrearsCents))exceptions.push({id:'arrears',priority:'urgent',title:'Restore current obligations',body:'Payroll, suppliers or debt are overdue. New growth competes with recovery cash.',worldId:'office'});
 if(s.cashCents<cover)exceptions.push({id:'cash',priority:'urgent',title:'Protect the operating envelope',body:'Cash is below your reserve and next fixed commitments. Reconsider discretionary procurement and media.',worldId:'office'});
 for(const c of s.franchiseCohorts??[]){const row=s.franchiseHistory?.at(-1)?.cohorts.find(r=>r.cohortId===c.id);if(row&&!row.compliant&&!c.paused)exceptions.push({id:c.id,priority:'review',title:'Partner service needs attention',body:row.exception||'Inspect local stock, support and the operating standard.',worldId:c.id});}
 for(const p of (s.delegationPolicies??[]).filter(p=>p.enabled&&p.production))for(const [i,body] of managedProduction(s,p).exceptions.entries())exceptions.push({id:p.factoryId+':'+i,priority:'review',title:'Manager production exception',body,worldId:p.factoryId});
 for(const c of s.contracts.filter(c=>c.status==='accepted'&&c.dueEnd<=s.week+2))exceptions.push({id:c.id,priority:'review',title:'Customer deadline approaching',body:`${c.cases-c.fulfilledCases} cases remain due by week ${c.dueEnd}. Inspect physical stock and the signed keeping/quality terms.`,worldId:c.id});
 for(const p of portfolioPlans(s).filter(p=>p.endWeek<=s.week+1))exceptions.push({id:p.id,priority:'review',title:'Regional allocation closes soon',body:`${p.regionId} ${p.priority} authority ends in week ${p.endWeek}. Review actual results before approving another commitment.`,worldId:regionCities[p.regionId]?.[0]??'office'});
 const regions=regionalPerformance(s);
 const recommendations=executives(s).map(a=>{
  const name=s.employees.find(p=>p.id===a.employeeId)!.name;
  if(a.role==='finance')return {name,role:a.role,title:flow<=0?'Repair recurring cash before expansion':'Keep a downside cash reserve',body:`The last ${s.snapshots.filter(w=>w.week>=from&&w.week<s.week).length} closed weeks produced ${dollars(flow)} of recurring operating cash, excluding advances. Approved reserve and fixed commitments require ${dollars(cover)}.`,assumption:'Based on closed cash flows and current signed commitments; future sales are uncertain.',worldId:'office'};
  if(a.role==='operations')return {name,role:a.role,title:value.service<.95?'Repair service before taking another allocation':'Compare capacity with the next allocation',body:`Observed service is ${(value.service*100).toFixed(1)}%; production quality is ${value.quality.toFixed(1)}. ${exceptions.filter(e=>e.title.includes('Partner')||e.title.includes('production')).length} partner/production exceptions require inspection.`,assumption:'Additional machines need paid people, sources and certified methods; installed capacity alone does not guarantee deliveries.',worldId:s.factories.find(f=>f.active&&f.packageId.startsWith('industrial-'))?.id??'office'};
  return {name,role:a.role,title:value.service<.95?'Protect the name before adding reach':'Compare regional retention with contribution',body:`${regions.filter(r=>r.active&&r.profitCents>0).length} operating regions have positive recognized thirteen-week profit. ${news?.announced?news.title+' changes the upcoming window.':'Review local consideration and the next launch window.'}`,assumption:'Marketing competes for finite demand. Partner till receipts remain outside recognized group revenue.',worldId:'singapore'};
 });
 return {exceptions,recommendations,regions,value};
}
