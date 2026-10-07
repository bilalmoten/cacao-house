import {weeklyFixed} from './campaign.ts';
import {portfolioFixed} from './global.ts';
import {supplyMinimumFixed} from './supply-agreements.ts';
import {consumerFixed} from './channels.ts';
import {franchiseFixed} from './franchise.ts';
import {teamFixed} from './teams.ts';
import {activeEmployee,retainedSiteFixed} from './site-recovery.ts';
import {machineLeaseFixed} from './machine-orders.ts';
import {maintenanceFixed} from './maintenance.ts';
import{consumerEntryChannel}from'./channels.ts';
import {updateFeed} from './updates.ts';
import type {V4State,LedgerEntry} from './model.ts';
import {accountBalance,classifyCashFlow,financialSummary} from './finance.ts';
import {catalog} from './catalog.ts';
import {storageOccupancy,capacityAt} from './inventory.ts';
import {protectedCash} from './sourcing.ts';
export interface ReportPeriod {fromWeek:number;toWeek:number}
function periodBasis(state:V4State,period:ReportPeriod):'closed actuals'|'no closed history'|'invalid period' {
 if(!Number.isSafeInteger(period.fromWeek)||!Number.isSafeInteger(period.toWeek)||period.fromWeek<1||period.toWeek<period.fromWeek)return 'invalid period';
 return state.snapshots.some(s=>s.week>=period.fromWeek&&s.week<=period.toWeek)?'closed actuals':'no closed history';
}
function location(state:V4State,entry:LedgerEntry):string {
 if(entry.scope?.factoryId)return entry.scope.factoryId;
 const consumer=consumerEntryChannel(state,entry);if(consumer)return consumer;
 for(const id of [...entry.postings.flatMap(p=>p.entityId?[p.entityId]:[]),...(state.events.find(e=>e.id===entry.eventId)?.entityIds??[])]){
  if(state.franchiseCohorts?.some(c=>c.id===id)||state.franchiseSupportHubs?.some(h=>h.id===id)||state.franchiseSupplyOrders?.some(o=>o.id===id))return id;
  if(state.factories.some(f=>f.id===id)||state.warehouses.some(w=>w.id===id))return id;
  if(catalog.suppliers.some(s=>s.id===id))return id;
  if(state.contracts.some(c=>c.id===id))return state.contracts.find(c=>c.id===id)!.cityId==='sf'?'ferry-cafe':state.contracts.find(c=>c.id===id)!.cityId;
 }
 return 'office';
}
export function financeReport(state:V4State,period:ReportPeriod){
 const basis=periodBasis(state,period),snapshots=state.snapshots.filter(s=>s.week>=period.fromWeek&&s.week<=period.toWeek),last=snapshots.at(-1),toWeek=last?.week??0;
 const journal=state.ledger.filter(e=>e.week<=toWeek),entries=state.ledger.slice(2).filter(e=>e.week>=period.fromWeek&&e.week<=toWeek),balance=(account:Parameters<typeof accountBalance>[1])=>accountBalance(state,account,journal),pnl=financialSummary(state,entries);
 const cash={openingCents:snapshots[0]?.openingCashCents??null,closingCents:last?.closingCashCents??null,operatingCents:0,investingCents:0,financingCents:0};
 for(const entry of entries){const kind=classifyCashFlow(entry),amount=accountBalance(state,'cash',[entry]);cash[kind==='operating'?'operatingCents':kind==='investing'?'investingCents':'financingCents']+=amount;}
 const assets={cashCents:balance('cash'),packagingInventoryCents:balance('packaging-inventory'),rawInventoryCents:balance('raw-inventory'),finishedInventoryCents:balance('finished-inventory'),receivablesCents:balance('receivables'),equipmentCents:balance('equipment')+balance('accumulated-depreciation'),premisesDepositCents:balance('premises-deposit')};
 const liabilities={loanPrincipalCents:-balance('loan-principal'),customerDepositsCents:-balance('customer-deposits'),accruedObligationsCents:-balance('arrears')};
 const equityCents=-balance('equity')+financialSummary(state,journal).profitCents;
 return {basis,period:{fromWeek:period.fromWeek,toWeek},cash,pnl,balance:{...assets,...liabilities,equityCents,totalAssetsCents:Object.values(assets).reduce((n,v)=>n+v,0),totalLiabilitiesCents:Object.values(liabilities).reduce((n,v)=>n+v,0)},trace:entries.map(entry=>({entryId:entry.id,eventId:entry.eventId,week:entry.week,description:entry.description,locationId:location(state,entry),postings:structuredClone(entry.postings)}))};
}
export function overviewReport(state:V4State){
 const latestActual=state.snapshots.at(-1)??null,weeklyObligations=weeklyFixed(state);
 return {basis:'current planning position' as const,week:state.week,cashCents:state.cashCents,protectedCashCents:protectedCash(state),discretionaryCashCents:Math.max(0,state.cashCents-protectedCash(state)),runwayWeeks:weeklyObligations?state.cashCents/weeklyObligations:null,runwayBasis:'Cash divided by current weekly fixed obligations; excludes future sales and variable procurement',latestActual:latestActual?structuredClone(latestActual):null,locations:state.factories.map(f=>({id:f.id,cityId:f.cityId,active:f.active}))};
}
export function obligationsReport(state:V4State){
 const loan=state.loans.filter(l=>l.status!=='settled').map(l=>({id:l.id,kind:'loan',label:'Loan installment',week:l.nextDueWeek,cents:l.installmentCents,arrearsCents:l.arrearsCents,locationId:'office'}));
 const payroll=state.employees.filter(activeEmployee).map(e=>({id:e.id,kind:'payroll',label:e.name,week:state.week,cents:e.wageCents,arrearsCents:0,locationId:e.factoryId??'office'}));
 const rent=state.factories.filter(f=>f.active).map(f=>({id:f.id,kind:'rent',label:'Premises rent',week:state.week,cents:f.rentCents,arrearsCents:0,locationId:f.id}));
 const contracts=state.contracts.filter(c=>c.status==='accepted').map(c=>({id:c.id,kind:'contract',label:c.buyer,week:c.dueEnd,cents:(c.cases-c.fulfilledCases)*c.priceCents,arrearsCents:0,locationId:c.cityId==='sf'?'ferry-cafe':c.cityId}));
 const unpaid=state.unpaidObligations.map(o=>({id:o.id,kind:'overdue',label:o.account,week:o.sinceWeek,cents:0,arrearsCents:o.cents,locationId:'office'}));
 const engineering=state.engineeringJobs.filter(j=>j.status==='booked').map(j=>({id:j.id,kind:'engineering',label:'Paid engineer trial — '+state.employees.find(e=>e.id===j.employeeId)?.name,week:j.dueWeek,cents:0,arrearsCents:0,locationId:j.factoryId}));
 const upkeep=[...teamFixed(state),...retainedSiteFixed(state),...machineLeaseFixed(state),...maintenanceFixed(state)].filter(f=>f.amount).map(f=>({id:'upkeep:'+f.entityId,kind:'maintenance',label:f.label,week:state.week,cents:f.amount,arrearsCents:0,locationId:'factoryId' in f.scope?f.scope.factoryId:'office'}));
 const regional=[...portfolioFixed(state),...supplyMinimumFixed(state)].map(f=>({id:'regional:'+f.entityId,kind:'regional-commitment',label:f.label,week:state.week,cents:f.amount,arrearsCents:0,locationId:state.supplyAgreements?.find(a=>a.id===f.entityId)?.warehouseId??regionCities[f.scope.regionId??'']?.[0]??'office'}));
 const commercial=consumerFixed(state).flatMap(({channel:c,rentCents,staffCents})=>[{id:c.id+':rent',kind:'rent',label:'Consumer premises/platform rent',week:state.week,cents:rentCents,arrearsCents:0,locationId:c.id},{id:c.id+':payroll',kind:'payroll',label:'Consumer operating team payroll',week:state.week,cents:staffCents,arrearsCents:0,locationId:c.id}]);
 const field=franchiseFixed(state).map(({hub:h,rentCents})=>({id:h.id+':rent',kind:'rent',label:'Regional support office rent',week:state.week,cents:rentCents,arrearsCents:0,locationId:h.id}));
 const receiving=state.warehouses.filter(w=>w.rentCents).map(w=>({id:w.id+':rent',kind:'rent',label:'Receiving premises rent',week:state.week,cents:w.rentCents!,arrearsCents:0,locationId:w.id}));
 const support=(state.franchiseCohorts??[]).filter(c=>!c.paused).map(c=>({id:c.id+':support',kind:'planned-support',label:'Planned cohort support; paid only when coverage is funded',week:state.week,cents:c.stores*(state.franchiseStandards?.find(p=>p.id===c.standardId)?.weeklySupportCents??0),arrearsCents:0,locationId:c.id}));
 return [...regional,...commercial,...field,...receiving,...support,...upkeep,...loan,...payroll,...rent,...contracts,...unpaid,...engineering].sort((a,b)=>a.week-b.week||a.id.localeCompare(b.id));
}
export function supplyReport(state:V4State){return {basis:'current dated stock' as const,lots:state.inventory.map(l=>({...structuredClone(l),daysToGameExpiry:(l.expiryWeek-state.week+1)*7,locationId:l.locationId,sourceEventId:state.events.find(e=>e.entityIds.includes(l.id))?.id??state.ledger.find(e=>e.postings.some(p=>p.entityId===l.id))?.eventId??null})),warehouses:state.warehouses.map(w=>({id:w.id,cityId:w.cityId,occupancyMilliliters:storageOccupancy(state,w.id),capacityMilliliters:capacityAt(state,w.id,state.week),upgrades:structuredClone(w.upgrades)})),shipments:structuredClone(state.shipments),availableSuppliers:catalog.suppliers.filter(s=>state.knownSuppliers.includes(s.id)).map(s=>({id:s.id,name:s.name,cityId:s.cityId,leadWeeks:s.leadWeeks}))};}
export function salesReport(state:V4State,period:ReportPeriod){
 const basis=periodBasis(state,period),history=state.salesHistory.filter(s=>s.week>=period.fromWeek&&s.week<=period.toWeek);
 return {basis,period:structuredClone(period),weeks:history.map(s=>({week:s.week,actualRetail:structuredClone(s.retail),actualContracts:structuredClone(s.contracts),forecast:s.forecast?structuredClone(s.forecast):null,demand:s.market?structuredClone(s.market):null})),partnerTurnover:(state.franchiseHistory??[]).filter(w=>w.week>=period.fromWeek&&w.week<=period.toWeek).reduce((n,w)=>n+w.cohorts.reduce((m,c)=>m+c.partnerRevenueCents,0),0),partnerTurnoverBasis:'Third-party till receipts; excluded from group-recognized revenue'};
}
export function productionReport(state:V4State){return {basis:'latest closed production' as const,week:state.week>1?state.week-1:null,factories:structuredClone(state.lastProduction).map(s=>({factoryId:s.factoryId,rows:s.rows,stationUsedMinutes:s.stationUsedMinutes,laborUsedMinutes:s.laborUsedMinutes,laborAvailableMinutes:s.laborAvailableMinutes,changeoverMinutes:s.changeoverMinutes,constraints:s.constraints})),currentStaff:structuredClone(state.employees),processProfiles:structuredClone(state.processProfiles)};}

import type {ReportQuery,ReportView,ReportMetric,MetricRef,MetricExplanation} from './model.ts';
import {regionCities,regionForCity} from './content/regions.ts';
const channels=['direct','wholesale','owned-retail','ecommerce','franchise-royalties','partner-supply'];
function inScope(entry:LedgerEntry,query:ReportQuery){return query.scopeType==='company'||entry.scope?.[query.scopeType==='factory'?'factoryId':query.scopeType==='region'?'regionId':'channelId']===query.scopeId;}
function queryErrors(state:V4State,query:ReportQuery):string[]{
 const errors:string[]=[];
 if(!Number.isSafeInteger(query.asOfWeek)||query.asOfWeek<1||query.asOfWeek>state.week||!Number.isSafeInteger(query.periodStart)||!Number.isSafeInteger(query.periodEnd)||query.periodStart<1||query.periodEnd<query.periodStart||query.periodEnd>query.asOfWeek)errors.push('Choose a valid dated report period.');
 if(!['company','factory','region','channel'].includes(query.scopeType)||query.scopeType==='factory'&&!state.factories.some(f=>f.id===query.scopeId)||query.scopeType==='region'&&!Object.hasOwn(regionCities,query.scopeId??'')||query.scopeType==='channel'&&!channels.includes(query.scopeId??'')||query.scopeType==='company'&&query.scopeId!==undefined)errors.push('Choose an available report scope.');
 if(!['overview','news','finance','sales','supply','production','obligations'].includes(query.category))errors.push('Choose an available report category.');return errors;
}
export function buildReport(state:V4State,query:ReportQuery):ReportView {
 const alerts=queryErrors(state,query),view:ReportView={schemaVersion:1,generatedFromTickId:null,query:structuredClone(query),metrics:[],series:[],rows:[],alerts,availableDrilldowns:[]};if(alerts.length)return view;
 const snapshots=state.snapshots.filter(s=>s.week>=query.periodStart&&s.week<=query.periodEnd&&s.week<=query.asOfWeek),latest=snapshots.at(-1),period={start:query.periodStart,end:latest?.week??query.periodEnd};view.generatedFromTickId=latest?.tickId??null;
 const entries=state.ledger.slice(2).filter(e=>e.week>=query.periodStart&&e.week<=period.end&&e.week<state.week&&inScope(e,query)),sources=[...new Set(entries.map(e=>e.eventId))],entities=[...new Set(entries.flatMap(e=>[...e.postings.flatMap(p=>p.entityId?[p.entityId]:[]),...(e.scope?.factoryId?[e.scope.factoryId]:[])]))];
 const metric=(id:string,label:string,value:number|null,unit:ReportMetric['unit']='cents',basis:ReportMetric['basis']='actual'):ReportMetric=>({id,label,value,unit,basis,period:{...period},sourceEventIds:[...sources],sourceEntityIds:[...entities]});
 if(!latest&&query.category!=='news')view.alerts.push('Insufficient closed history for this period.');
 for(const entry of entries){const locationId=location(state,entry);if(!view.availableDrilldowns.some(d=>d.locationId===locationId))view.availableDrilldowns.push({id:entry.eventId,label:entry.description,locationId});}
 if(query.category==='finance'||query.category==='overview'){
  const pnl=financialSummary(state,entries);
  view.metrics.push(metric('revenue','External revenue',latest?pnl.revenueCents:null),metric('cogs','Acquisition cost of goods sold',latest?pnl.cogsCents:null),metric('gross-profit','Gross profit',latest?pnl.revenueCents-pnl.cogsCents:null),metric('operating-expense','Assigned operating expenses',latest?pnl.operatingExpenseCents:null),metric('operating-profit',query.scopeType==='company'?'Operating profit':'Operating contribution before unallocated house costs',latest?pnl.revenueCents-pnl.cogsCents-pnl.operatingExpenseCents:null));
  if(query.scopeType==='company'){
   const report=financeReport(state,{fromWeek:query.periodStart,toWeek:query.periodEnd});view.metrics.push(metric('opening-cash','Opening house cash',report.cash.openingCents),metric('closing-cash','Closing house cash',report.cash.closingCents),metric('operating-flow','Operating cash flow',latest?report.cash.operatingCents:null),metric('investing-flow','Investing cash flow',latest?report.cash.investingCents:null),metric('financing-flow','Financing cash flow',latest?report.cash.financingCents:null),metric('interest','Loan interest',latest?pnl.interestCents:null),metric('profit','Pretax profit',latest?pnl.profitCents:null));
   if(latest)view.rows.push({...report.balance,label:'House balance sheet',basis:'actual',week:period.end});
  }else view.alerts.push('House cash, borrowing and unallocated central costs are reported at company scope; this scope is an operating attribution.');
  view.series=snapshots.map(s=>({metricId:'revenue',week:s.week,value:financialSummary(state,state.ledger.filter(e=>e.week===s.week&&inScope(e,query))).revenueCents}));
 }
 if(query.category==='sales'){
  const revenue=-accountBalance(state,'retail-revenue',entries)-accountBalance(state,'contract-revenue',entries)-accountBalance(state,'royalty-revenue',entries)-accountBalance(state,'owned-retail-revenue',entries)-accountBalance(state,'ecommerce-revenue',entries)-accountBalance(state,'supply-revenue',entries);view.metrics.push(metric('revenue','Group-recognized external sales',latest?revenue:null));
  if(query.scopeType==='company')for(const s of state.salesHistory.filter(s=>s.week>=period.start&&s.week<=period.end)){view.rows.push({week:s.week,basis:'actual',retail:structuredClone(s.retail),contracts:structuredClone(s.contracts),market:structuredClone(s.market)});if(s.forecast){const f=metric('forecast-demand:'+s.week,'Sampled market opportunities before stock limits',s.forecast.expectedCases,'cases','forecast');f.period={start:s.week,end:s.week};f.forecast={lower:s.forecast.lowCases,central:s.forecast.expectedCases,upper:s.forecast.highCases,intervalLabel:'Sampled 10th–90th percentiles',assumptions:s.forecast.drivers,modelVersion:'market-4.1'};f.sourceEventIds=[s.tickId];view.metrics.push(f);}}
  else view.rows=entries.filter(e=>e.postings.some(p=>['retail-revenue','contract-revenue','owned-retail-revenue','ecommerce-revenue','royalty-revenue','supply-revenue','cogs'].includes(p.account))).map(e=>({week:e.week,eventId:e.eventId,basis:'actual',description:e.description,scope:structuredClone(e.scope),postings:structuredClone(e.postings)}));
 }
 if(query.category==='sales')for(const w of state.consumerHistory??[])if(w.week>=period.start&&w.week<=period.end){const channels=w.channels.filter(c=>query.scopeType==='company'||query.scopeType==='channel'&&c.kind===query.scopeId||query.scopeType==='region'&&regionForCity(c.cityId)===query.scopeId);if(channels.length)view.rows.push({week:w.week,basis:'actual',consumerChannels:structuredClone(channels)});}
 if(query.category==='sales')for(const w of state.franchiseHistory??[])if(w.week>=period.start&&w.week<=period.end)for(const c of w.cohorts)if(query.scopeType==='company'||query.scopeType==='channel'&&query.scopeId==='franchise-royalties'||query.scopeType==='region'&&regionForCity(c.cityId)===query.scopeId)view.rows.push({week:w.week,basis:'actual',cohortId:c.cohortId,partnerId:c.partnerId,cityId:c.cityId,partnerTurnoverBasis:'Third-party turnover outside group revenue',partnerRevenueCents:c.partnerRevenueCents,partnerCogsCents:c.partnerCogsCents,partnerFixedCents:c.partnerFixedCents,closingCashCents:c.closingCashCents,closingPartnerArrearsCents:c.closingPartnerArrearsCents,royaltyCents:c.royaltyCents,feeEarnedCents:c.feeEarnedCents,feeRemainingCents:c.feeRemainingCents,supportCents:c.supportCents,supportedStores:c.supportedStores,...(c.demandCases!==undefined?{demandCases:c.demandCases,soldCases:c.soldCases,unservedCases:c.unservedCases,viable:c.viable}:{}),compliant:c.compliant,exception:c.exception});
 if(query.category==='supply'){
  const history=state.ledger.filter(e=>e.week<=period.end&&inScope(e,query));
  if(query.scopeType==='company'||query.scopeType==='region')view.metrics.push(metric('raw-inventory','Raw inventory book value',latest?accountBalance(state,'raw-inventory',history):null),metric('packaging-inventory','Packaging stock book value',latest?accountBalance(state,'packaging-inventory',history):null),metric('finished-inventory','Finished inventory book value',latest?accountBalance(state,'finished-inventory',history):null));
  if(query.scopeType==='factory')view.metrics.push(metric('raw-inputs-consumed','Input value converted at this factory',latest?-accountBalance(state,'raw-inventory',entries):null),metric('finished-inventory','Factory-produced goods book value',latest?accountBalance(state,'finished-inventory',history):null));
  if(query.scopeType==='channel')view.alerts.push('Stock is physically held at world locations; channel sales do not create a separate stock asset.');

  const lotInScope=(lot:V4State['inventory'][number])=>{
   if(query.scopeType==='company')return true;
   if(query.scopeType==='factory')return lot.locationId===query.scopeId||lot.kind==='finished'&&lot.factoryId===query.scopeId;
   const warehouse=state.warehouses.find(w=>lot.locationId===w.id||lot.locationId==='overflow:'+w.id||state.shipments.some(sh=>sh.warehouseId===w.id&&lot.locationId==='transit:'+sh.id)),factory=state.factories.find(f=>f.id===lot.locationId);
   return regionCities[query.scopeId!]?.includes(warehouse?.cityId??factory?.cityId??'')??false;
  };
  if(query.scopeType!=='channel'){
   if(query.asOfWeek===state.week)view.rows=state.inventory.filter(lotInScope).map(l=>({...structuredClone(l),basis:'planned',week:state.week}));
   else if(latest)view.rows=latest.inventory.lots.filter(lotInScope).map(l=>({...structuredClone(l),basis:'actual',week:latest.week,tickId:latest.tickId}));
  }

 }
 if(query.category==='supply'&&(query.scopeType==='company'||query.scopeType==='region'||query.scopeType==='channel'&&['franchise-royalties','partner-supply'].includes(query.scopeId!))){
  const w=(state.franchiseHistory??[]).filter(w=>w.week<=query.asOfWeek).at(-1);if(w)for(const c of w.cohorts)if(query.scopeType!=='region'||regionForCity(c.cityId)===query.scopeId)view.rows.push({cohortId:c.cohortId,cityId:c.cityId,basis:'actual',week:w.week,ownershipBasis:'Separate partner-owned stock; excluded from group inventory assets',partnerStock:structuredClone(c.closingStock),partnerExpiryCents:c.partnerExpiryCents});
 }
 if(query.category==='obligations'&&query.asOfWeek===state.week&&(query.scopeType==='company'||query.scopeType==='channel'&&query.scopeId==='partner-supply'))for(const o of state.franchiseSupplyOrders??[])if(o.status==='pending')view.rows.push({...structuredClone(o),basis:'planned',paymentBasis:'Partner pays actual delivered supply and carrier cost; no advance or recognized revenue yet'});
 if(query.category==='production'){
  if(query.scopeType==='channel')view.alerts.push('Factory station and labor resources are not assigned directly to a sales channel.');
  else if(latest){
   for(const snapshot of snapshots)for(const factory of snapshot.production)if(query.scopeType==='company'||query.scopeType==='factory'&&factory.factoryId===query.scopeId||query.scopeType==='region'&&factory.regionId===query.scopeId)view.rows.push({...structuredClone(factory),basis:'actual',week:snapshot.week,tickId:snapshot.tickId});
   const output=metric('good-cases','Saleable output',view.rows.reduce((n,r)=>n+(r.rows as V4State['lastProduction'][number]['rows']).reduce((m,row)=>m+row.goodCases,0),0),'cases');output.sourceEventIds=snapshots.map(s=>s.tickId);output.sourceEntityIds=[...new Set(view.rows.map(r=>r.factoryId as string))];view.metrics.push(output);
   view.series=snapshots.map(s=>({metricId:'good-cases',week:s.week,value:view.rows.filter(r=>r.week===s.week).reduce((n,r)=>n+(r.rows as V4State['lastProduction'][number]['rows']).reduce((m,row)=>m+row.goodCases,0),0)}));
  }
 }
 if(query.category==='production'&&query.scopeType!=='channel')for(const e of state.events)if(e.origin==='tick'&&e.week>=period.start&&e.week<=period.end&&e.details.overtimeActuals)for(const r of JSON.parse(String(e.details.overtimeActuals)))if(query.scopeType==='company'||query.scopeType==='factory'&&query.scopeId===r.factoryId||query.scopeType==='region'&&regionForCity(state.factories.find(f=>f.id===r.factoryId)?.cityId??'sf')===query.scopeId)view.rows.push({...r,basis:'actual',week:e.week,staffHoursBasis:'Base salary charged once; extra time reserved and paid separately'});
 if(query.category==='production'&&query.scopeType!=='channel')for(const e of state.events)if(e.origin==='tick'&&e.week>=period.start&&e.week<=period.end&&e.details.equipmentOperationsOpening)for(const r of JSON.parse(String(e.details.equipmentOperationsOpening)))if(query.scopeType==='company'||query.scopeType==='factory'&&query.scopeId===r.factoryId||query.scopeType==='region'&&regionForCity(state.factories.find(f=>f.id===r.factoryId)?.cityId??'sf')===query.scopeId)view.rows.push({...r,basis:'actual',week:e.week,equipmentBasis:'Owned station capacity, actual availability and paid care are distinct'});
 if(query.category==='obligations'){
  if(query.asOfWeek===state.week&&query.scopeType==='company')view.rows=obligationsReport(state).map(o=>({...o,basis:'planned'}));
  else view.rows=entries.filter(e=>e.postings.some(p=>['payroll','rent','maintenance','energy','interest','fees','arrears','receivables','customer-deposits'].includes(p.account))).map(e=>({week:e.week,basis:'actual',eventId:e.eventId,description:e.description,postings:structuredClone(e.postings)}));
 }
 if(query.category==='news'){view.rows=updateFeed(state,query.asOfWeek).filter(u=>u.publishedWeek>=query.periodStart&&u.publishedWeek<=query.periodEnd&&(query.scopeType==='company'||query.scopeType==='factory'&&u.locationIds.includes(query.scopeId!)||query.scopeType==='region'&&u.cityIds.some(id=>regionCities[query.scopeId!]?.includes(id)))).map(u=>({...u,basis:'published',week:u.publishedWeek}));for(const u of view.rows)for(const locationId of u.locationIds as string[])if(!view.availableDrilldowns.some(d=>d.locationId===locationId))view.availableDrilldowns.push({id:u.id as string,label:u.title as string,locationId});if(query.scopeType==='channel')view.alerts.push('No channel-specific published updates in this system yet.');}
 return view;
}
export function explainMetric(state:V4State,ref:MetricRef):MetricExplanation {
 const view=buildReport(state,ref.query),metric=view.metrics.find(m=>m.id===ref.metricId),missing:MetricExplanation={baseline:null,currentValue:metric?.value??null,drivers:[],remainder:0,basis:'Insufficient source history for an additive explanation.',actions:view.availableDrilldowns.map(d=>({label:d.label,locationId:d.locationId}))};
 if(!metric||metric.value===null||metric.basis!=='actual')return missing;
 if(ref.metricId!=='closing-cash')return {...missing,basis:'Source-backed actual. Expand the journal rows; causal attribution is not inferred.'};
 const finance=financeReport(state,{fromWeek:ref.query.periodStart,toWeek:ref.query.periodEnd});if(finance.cash.openingCents===null||finance.cash.closingCents===null)return missing;
 const grouped=new Map<string,{label:string;contribution:number;sourceEventIds:string[];locationId:string}>();
 for(const entry of state.ledger.slice(2).filter(e=>e.week>=ref.query.periodStart&&e.week<=finance.period.toWeek)){
  const contribution=accountBalance(state,'cash',[entry]);if(!contribution)continue;const key=entry.description,driver=grouped.get(key)??{label:key,contribution:0,sourceEventIds:[],locationId:location(state,entry)};driver.contribution+=contribution;if(!driver.sourceEventIds.includes(entry.eventId))driver.sourceEventIds.push(entry.eventId);grouped.set(key,driver);
 }
 const drivers=[...grouped.values()].sort((a,b)=>Math.abs(b.contribution)-Math.abs(a.contribution)).slice(0,3),remainder=finance.cash.closingCents-finance.cash.openingCents-drivers.reduce((n,d)=>n+d.contribution,0);
 return {baseline:finance.cash.openingCents,currentValue:finance.cash.closingCents,drivers,remainder,basis:'Exact additive cash bridge from journal postings; other changes form the remainder.',actions:view.availableDrilldowns.map(d=>({label:d.label,locationId:d.locationId}))};
}
