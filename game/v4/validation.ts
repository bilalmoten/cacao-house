import {workforceEvidenceErrors} from './workforce.ts';
import{consumerLeadErrors}from './commercial-leads.ts';
import {relationshipEvidenceErrors}from './relationships.ts';
import {globalEvidenceErrors}from './global.ts';
import {supplyAgreementErrors} from './supply-agreements.ts';
import {teamStateErrors} from './teams.ts';
import {machineOrderErrors} from './machine-orders.ts';
import {maintenanceStateErrors} from './maintenance.ts';
import {overtimeEvidenceErrors} from './overtime.ts';
import {finishedQuantityEvidenceErrors} from './finished-quantities.ts';
import {franchiseEvidenceErrors} from './franchise.ts';
import {franchiseCohortEvidenceErrors} from './franchise-validation.ts';
import{marketingEvidenceErrors}from'./marketing.ts';
import{consumerEvidenceErrors}from'./consumer-validation.ts';
import {supplierRouteEvidenceErrors}from'./supplier-routes.ts';
import {delegationEvidenceErrors} from './delegation.ts';
import {employmentEvidenceErrors} from './employment.ts';
import {commercialServiceErrors} from './loan-service-evidence.ts';
import {commercialLoanEvidenceErrors} from './commercial-finance.ts';
import {networkEvidenceErrors} from './network.ts';
import {contractEvidenceErrors} from './orders.ts';
import {campaignEvidenceErrors} from './campaign.ts';
import {processEvidenceErrors} from './process-validation.ts';
import {inspectLayout,floorEvidenceErrors} from './layout.ts';
import {recoveryEvidenceErrors} from './recovery.ts';
import {packagingFamilies} from './content/packaging.ts';
import {updateErrors} from './updates.ts';
import {guidanceErrors} from './onboarding.ts';
import {engineeringEvidenceErrors} from './engineering.ts';
import {validateOperatingHistory} from './history.ts';
import {validScope} from './scope.ts';
import {researchEvidenceErrors} from './research.ts';
import {validateSalesHistory} from './sales-validation.ts';
import type {V4State} from './model.ts';
import {accountBalance,checkLedger,classifyCashFlow,financialSummary} from './finance.ts';
import {catalog} from './catalog.ts';
import {checkInventory} from './inventory.ts';
const uint=(n:unknown):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const unique=(values:unknown[])=>values.every(v=>typeof v==='string')&&new Set(values).size===values.length;
export function validateEconomicState(state:V4State):string[] {
  const errors=[...workforceEvidenceErrors(state),...consumerLeadErrors(state),...relationshipEvidenceErrors(state),...globalEvidenceErrors(state),...supplyAgreementErrors(state),...teamStateErrors(state),...machineOrderErrors(state),...maintenanceStateErrors(state),...overtimeEvidenceErrors(state),...finishedQuantityEvidenceErrors(state),...franchiseCohortEvidenceErrors(state),...franchiseEvidenceErrors(state),...consumerEvidenceErrors(state),...marketingEvidenceErrors(state),...supplierRouteEvidenceErrors(state),...delegationEvidenceErrors(state),...employmentEvidenceErrors(state),...recoveryEvidenceErrors(state),...checkLedger(state),...checkInventory(state),...validateSalesHistory(state),...validateOperatingHistory(state),...engineeringEvidenceErrors(state),...guidanceErrors(state),...updateErrors(state)];
  const listing=state.events.filter(e=>e.type==='retail-assortment').at(-1);let selected:string[]=['embar62:r1','velvet-milk:r1'];try{if(listing)selected=JSON.parse(listing.signature).recipeRevisionIds;}catch{errors.push('Invalid retail assortment source');}if((listing||state.directAssortment!==undefined)&&(!Array.isArray(state.directAssortment)||!Array.isArray(selected)||JSON.stringify(state.directAssortment)!==JSON.stringify(selected)||new Set(selected).size!==selected.length||selected.some(id=>!state.recipeRevisions.some(r=>r.id===id))))errors.push('Local display differs from its actual merchandising choice');
  if(!uint(state.brandVersion)||state.brandVersion<1)errors.push('Invalid house brand edition');
  if(!uint(state.reserveCents)||!catalog.cities.some(c=>c.id===state.currentCityId)||!unique(state.visitedCities)||state.visitedCities.some(id=>!catalog.cities.some(c=>c.id===id))||!unique(state.knownSuppliers)||state.knownSuppliers.some(id=>!catalog.suppliers.some(s=>s.id===id)))errors.push('Invalid company discoveries or cash authority');
  if(!unique(state.warehouses.map(w=>w.id))||state.warehouses.some(w=>!record(w.capacityMilliliters)||!Object.values(w.capacityMilliliters).every(uint)||!['dry','controlled','cold'].every(k=>uint(w.capacityMilliliters[k as keyof typeof w.capacityMilliliters]))||!Array.isArray(w.upgrades)||w.upgrades.some(u=>!['dry','controlled','cold'].includes(u.storageClass)||!uint(u.milliliters)||!uint(u.readyWeek))||!['delay','overflow','reject'].includes(w.arrivalPolicy)||!uint(w.overflowBudgetCents)))errors.push('Invalid warehouse capacity or arrival policy');
  if(!unique(state.shipments.map(s=>s.id))||state.shipments.some(s=>!uint(s.arrivalWeek)||!uint(s.promisedWeek)||!uint(s.delayCount)||!['in-transit','arrived','delayed','rejected','expired'].includes(s.status)||!(s.kind==='customer'?state.contracts.some(c=>'buyer:'+c.id===s.warehouseId):state.warehouses.some(w=>w.id===s.warehouseId))||!(['internal','customer'].includes(s.kind??'')?s.supplierId==='':catalog.suppliers.some(p=>p.id===s.supplierId))||['in-transit','delayed'].includes(s.status)&&!state.inventory.some(l=>l.id===s.lotId)))errors.push('Invalid incoming freight references');
  if(!uint(state.weekOpeningCashCents)||!uint(state.weekLedgerStartIndex)||state.weekLedgerStartIndex>state.ledger.length)errors.push('Invalid week-opening accounting markers');
  else{
    if(accountBalance(state,'cash',state.ledger.slice(0,state.weekLedgerStartIndex))!==state.weekOpeningCashCents)errors.push('Week-opening cash does not reconcile');
    const expectedStart=state.week===1?2:state.ledger.findIndex(e=>e.week===state.week);
    if(expectedStart>=0&&state.weekLedgerStartIndex!==expectedStart||expectedStart<0&&state.weekLedgerStartIndex!==state.ledger.length)errors.push('Weekly ledger boundary is invalid');
  }
  if(!unique(state.events.map(e=>e.id))||state.events.some(e=>!record(e)||!uint(e.week)||e.week<1||e.week>state.week||!['action','tick'].includes(e.origin)||typeof e.signature!=='string'||!e.signature||!Array.isArray(e.entityIds)||!record(e.details)))errors.push('Invalid domain event history');
  if(state.ledger.some(e=>!validScope(state,e.scope))||state.receivables.some(r=>!validScope(state,r.scope))||state.unpaidObligations.some(o=>!validScope(state,o.scope)))errors.push('Invalid historical or deferred attribution scope');
  if(state.ledger.some(e=>!uint(e.week)||e.week<1||e.week>state.week))errors.push('Invalid ledger chronology');
  if(!unique(state.loans.map(l=>l.id)))errors.push('Duplicate loan identity');
  for(const l of state.loans){
    if(!record(l)||![l.principalCents,l.weeklyRateBps,l.installmentCents,l.remainingWeeks,l.nextDueWeek,l.arrearsCents,l.arrearsPrincipalCents,l.arrearsInterestCents,l.feesCents].every(uint)||l.nextDueWeek<1||l.weeklyRateBps>10000||!['active','settled','recovery'].includes(l.status)||typeof l.bridge!=='boolean'||l.arrearsSinceWeek!==null&&(!uint(l.arrearsSinceWeek)||l.arrearsSinceWeek<1||l.arrearsSinceWeek>state.week)){errors.push('Invalid loan terms');continue;}
    if(l.arrearsCents!==l.arrearsPrincipalCents+l.arrearsInterestCents+l.feesCents||l.arrearsPrincipalCents>l.principalCents||l.status==='settled'&&(l.principalCents!==0||l.arrearsCents!==0)||l.arrearsCents>0&&(l.status!=='recovery'||l.arrearsSinceWeek===null)||l.arrearsCents===0&&l.arrearsSinceWeek!==null)errors.push('Invalid loan recovery state');
  }
  if(!unique(state.unpaidObligations.map(o=>o.id))||state.unpaidObligations.some(o=>!['payroll','rent','maintenance','energy','fees','customer-deposits','marketing','research','support'].includes(o.account)||!uint(o.cents)||o.cents<1||!uint(o.sinceWeek)||o.sinceWeek<1||o.sinceWeek>state.week))errors.push('Invalid unpaid operating obligations');
  if(!record(state.prices)||Object.entries(state.prices).some(([id,price])=>!state.recipeRevisions.some(r=>r.id===id)||!uint(price)||price<1)||!record(state.marketMemory)||![state.brandTrust,state.serviceTrust,state.brandAwareness].every(n=>Number.isFinite(n)&&n>=0&&n<=1))errors.push('Invalid price or brand/service evidence');
  if(!unique(state.contracts.map(c=>c.id))||state.contracts.some(c=>!catalog.cities.some(city=>city.id===c.cityId)||!catalog.recipes.some(r=>r.id===c.recipeId)||![c.cases,c.priceCents,c.minimumQuality,c.depositCents,c.dueStart,c.dueEnd,c.settlementDelay,c.penaltyCents,c.fulfilledCases].every(uint)||c.cases<1||c.priceCents<1||c.minimumQuality>100||c.depositCents>c.cases*c.priceCents||c.dueStart<1||c.dueEnd<c.dueStart||c.fulfilledCases>c.cases||!['accepted','fulfilled','failed'].includes(c.status)||c.status==='fulfilled'&&c.fulfilledCases!==c.cases))errors.push('Invalid contract terms or delivery state');
  errors.push(...contractEvidenceErrors(state),...networkEvidenceErrors(state),...commercialLoanEvidenceErrors(state),...commercialServiceErrors(state));
  if(!unique(state.receivables.map(r=>r.id))||state.receivables.some(r=>!state.contracts.some(c=>c.id===r.contractId)||!uint(r.dueWeek)||r.dueWeek<1||!uint(r.amountCents)||typeof r.collected!=='boolean'))errors.push('Invalid customer settlement schedule');
  if(Object.entries(state.marketMemory).some(([id,m])=>!state.recipeRevisions.some(r=>r.id===id||packagingFamilies.some(p=>id===r.id+':'+p.id))||!record(m)||!Number.isFinite(m.quality)||m.quality<0||m.quality>100)||state.salesHistory.length!==state.week-1||state.salesHistory.some((s,i)=>s.week!==i+1))errors.push('Invalid demand observation history');
  if(!unique(state.knownRecipeBriefs)||state.knownRecipeBriefs.some(id=>!catalog.recipes.some(r=>r.id===id))||!unique(state.researchProjects.map(p=>p.id))||state.researchProjects.some(p=>{
    const recipe=catalog.recipes.find(r=>r.id===p.recipeId);
    return !recipe||!state.knownRecipeBriefs.includes(p.recipeId)||!state.employees.some(e=>e.id===p.researcherId)||!uint(p.revision)||p.revision<1||!record(p.formula)||Object.keys(p.formula).length!==recipe.roles.length||recipe.roles.some(role=>!role.allowedVarietyIds.includes(p.formula[role.role]))||!record(p.brief)||!Number.isFinite(p.brief.minimumQuality)||p.brief.minimumQuality<0||p.brief.minimumQuality>100||!uint(p.brief.shelfWeeks)||p.brief.shelfWeeks<recipe.minimumShelfWeeks||!['value','gifting','enthusiast','online'].includes(p.brief.segment)||!['concept','pilot','taste','stability'].includes(p.phase)||!['active','waiting','paused','failed','ready','released','abandoned'].includes(p.status)||![p.paidCents,p.budgetCents,p.remainingCents].every(uint)||!Array.isArray(p.paidStages)||!unique(p.paidStages)||p.paidStages.some(s=>!['concept','pilot','taste','stability'].includes(s))||!Array.isArray(p.findings)||p.dueWeek!==null&&(!uint(p.dueWeek)||p.dueWeek<1)||!Array.isArray(p.pilotFailures)||p.pilotFailures.some(f=>typeof f!=='string')||p.pilotQuality!==null&&(!Number.isFinite(p.pilotQuality)||p.pilotQuality<0||p.pilotQuality>100)||p.testedShelfWeeks!==null&&!uint(p.testedShelfWeeks)||p.status==='released'&&!state.recipeRevisions.some(r=>r.id===p.releasedRevisionId&&r.released);
  }))errors.push('Invalid lab brief, formula or paid project evidence');
  for(const project of state.researchProjects){
    errors.push(...researchEvidenceErrors(state,project));
    const actualCost=state.ledger.reduce((n,e)=>n+e.postings.filter(p=>p.account==='research'&&p.entityId===project.id).reduce((m,p)=>m+p.debitCents-p.creditCents,0),0);
    if(project.paidCents!==actualCost||project.paidStages.some(phase=>!state.events.some(e=>e.type==='research-stage'&&e.entityIds.includes(project.id)&&e.details.phase===phase&&(phase==='concept'||e.details.revision===project.revision))))errors.push('Research sunk cost or paid stage lacks source evidence');
    if(['ready','released'].includes(project.status)&&(['concept','pilot','taste','stability'].some(phase=>!project.paidStages.includes(phase as typeof project.phase))||project.pilotFailures.length>0||project.pilotQuality===null||project.pilotQuality<project.brief.minimumQuality||project.testedShelfWeeks===null||project.testedShelfWeeks<project.brief.shelfWeeks))errors.push('Research release has no qualified paid evidence');
  }
  for(const revision of state.recipeRevisions.filter(r=>r.released&&catalog.recipes.find(c=>c.id===r.recipeId)!.stage>1))if(!state.researchProjects.some(p=>p.status==='released'&&p.releasedRevisionId===revision.id&&p.recipeId===revision.recipeId&&p.revision===revision.version&&p.testedShelfWeeks===revision.shelfWeeks&&JSON.stringify(p.formula)===JSON.stringify(revision.formula)))errors.push('Commercial recipe release lacks its paid research project');
  const skills=['production','setup','quality','maintenance','research','management'];
  if(!unique(state.employees.map(e=>e.id))||state.employees.some(e=>!record(e.skills)||!uint(e.wageCents)||!uint(e.contractedMinutes)||!Number.isFinite(e.fatigue)||e.fatigue<0||e.fatigue>100||skills.some(k=>!Number.isFinite(e.skills[k as keyof typeof e.skills])||e.skills[k as keyof typeof e.skills]<0||e.skills[k as keyof typeof e.skills]>100)||!['operator','quality','engineer','researcher','manager','commercial'].includes(e.role)||e.factoryId!==null&&!state.factories.some(f=>f.id===e.factoryId)))errors.push('Invalid staff authority, hours or competence');
  if(!unique(state.recipeRevisions.map(r=>r.id))||state.recipeRevisions.some(r=>{
    const recipe=catalog.recipes.find(c=>c.id===r.recipeId);
    return !recipe||!uint(r.version)||r.version<1||!record(r.formula)||recipe.roles.some(role=>!role.allowedVarietyIds.includes(r.formula[role.role]))||typeof r.released!=='boolean'||!uint(r.shelfWeeks)||r.shelfWeeks<1||!uint(r.producedCases);
  }))errors.push('Invalid recipe revision or ingredient compatibility');
  for(const f of state.factories.filter(f=>f.plan.some(i=>i.packagingId!==undefined))){const event=state.events.filter(e=>e.type==='production-plan'&&e.entityIds.includes(f.id)).at(-1);let command;try{command=JSON.parse(event?.signature??'')}catch{}if(!event||JSON.stringify(command?.plan?.items)!==JSON.stringify(f.plan))errors.push('Saved production plan differs from its approved schedule');}
  if(!unique(state.factories.map(f=>f.id))||state.factories.some(f=>!catalog.cities.some(c=>c.id===f.cityId)||typeof f.active!=='boolean'||typeof f.equipmentSignature!=='string'||!f.equipmentSignature||!uint(f.rentCents)||!uint(f.changeoverTier)||f.changeoverTier>3||!record(f.stations)||!['preparation','processing','tempering','cooling','packing'].every(k=>{const station=f.stations[k as keyof typeof f.stations];return station&&uint(station.minutes)&&uint(station.tier)&&station.tier>0;})||!Array.isArray(f.plan)||f.plan.some(i=>i.packagingId!==undefined&&!packagingFamilies.some(p=>p.id===i.packagingId&&p.stage<=state.campaign.stage&&p.compatibleStorageClasses.includes(catalog.recipes.find(r=>r.id===state.recipeRevisions.find(r=>r.id===i.recipeRevisionId)?.recipeId)?.storageClass!))||!uint(i.cases)||!state.recipeRevisions.some(r=>r.id===i.recipeRevisionId&&r.released)||i.contractId&&!state.contracts.some(c=>c.id===i.contractId))))errors.push('Invalid production line or saved schedule');
  if(state.factories.some(f=>f.layout!==undefined&&(!record(f.layout)||!Array.isArray(f.layout.modules)||inspectLayout(f.layout).errors.length)))errors.push('Invalid physical floor configuration');
  errors.push(...floorEvidenceErrors(state));
  errors.push(...processEvidenceErrors(state));
  if(!unique(state.processProfiles.map(p=>p.id))||state.processProfiles.some(p=>!state.factories.some(f=>f.id===p.factoryId)||!state.recipeRevisions.some(r=>r.id===p.recipeRevisionId)||typeof p.equipmentSignature!=='string'||!uint(p.methodVersion)||p.methodVersion<1||!Number.isFinite(p.cycleMinutes)||p.cycleMinutes<=0||!Number.isFinite(p.expectedYield)||p.expectedYield<=0||p.expectedYield>1||![p.consistency,p.requiredCompetency].every(n=>Number.isFinite(n)&&n>=0&&n<=100)||!['timed','assisted','engineer'].includes(p.provenance)))errors.push('Invalid factory recipe process profile');
  if(!unique(state.training.map(t=>t.employeeId))||state.training.some(t=>!state.employees.some(e=>e.id===t.employeeId)||!skills.includes(t.skill)||!uint(t.readyWeek)||t.readyWeek<state.week||!uint(t.improvement)||t.improvement>100))errors.push('Invalid staff training');
  if(state.trip&&(!record(state.trip)||!catalog.cities.some(c=>c.id===state.trip!.cityId&&c.stage<=state.campaign.stage)||!uint(state.trip.departureWeek)||state.trip.departureWeek!==state.week||state.trip.arrivalWeek!==state.week+1||!state.events.some(e=>e.id===state.trip!.sourceEventId&&e.type==='travel'&&e.entityIds.includes(state.trip!.cityId))))errors.push('Invalid current travel commitment.');
  const campaign=state.campaign;
  if(!record(campaign)||![1,2,3,4,5,6].includes(campaign.stage)||!uint(campaign.chapter)||campaign.chapter>42||!['playing','recovery','bankrupt','won','sandbox'].includes(campaign.status)||!record(campaign.flags)||Object.values(campaign.flags).some(v=>typeof v!=='string')||!Array.isArray(campaign.completedChapters)||!unique(campaign.completedChapters))errors.push('Invalid campaign progress');
  if(Array.isArray(campaign.completedChapters))errors.push(...campaignEvidenceErrors(state));
  if(state.snapshots.length!==state.week-1||state.completedTicks.length!==state.snapshots.length||!unique(state.completedTicks))errors.push('Incomplete weekly history');
  let previousCash=accountBalance(state,'cash',state.ledger.slice(0,2));
  for(const [index,s]of state.snapshots.entries()){
    if(!record(s)||s.week!==index+1||s.tickId!==state.completedTicks[index]||!state.events.some(e=>e.id===s.tickId&&e.origin==='tick'&&e.week===s.week)){errors.push('Invalid snapshot chronology');continue;}
    const money=[s.openingCashCents,s.closingCashCents,s.operatingFlowCents,s.investingFlowCents,s.financingFlowCents,s.revenueCents,s.cogsCents,s.operatingExpenseCents,s.interestCents,s.profitCents];
    if(money.some(n=>!Number.isSafeInteger(n))||s.openingCashCents<0||s.closingCashCents<0||s.openingCashCents!==previousCash||s.openingCashCents+s.operatingFlowCents+s.investingFlowCents+s.financingFlowCents!==s.closingCashCents)errors.push('Snapshot cash bridge does not reconcile');
    const entries=state.ledger.slice(2).filter(e=>e.week===s.week),summary=financialSummary(state,entries),flows={operating:0,investing:0,financing:0};
    for(const entry of entries)flows[classifyCashFlow(entry)]+=accountBalance(state,'cash',[entry]);
    if(s.operatingFlowCents!==flows.operating||s.investingFlowCents!==flows.investing||s.financingFlowCents!==flows.financing||Object.entries(summary).some(([key,value])=>s[key as keyof typeof summary]!==value))errors.push('Snapshot actuals disagree with source ledger');
    if(!Array.isArray(s.sourceEventIds)||!unique(s.sourceEventIds)||s.sourceEventIds.some(id=>!state.events.some(e=>e.id===id)))errors.push('Snapshot source events are invalid');
    previousCash=s.closingCashCents;
  }
  return errors;
}
