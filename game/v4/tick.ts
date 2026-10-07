import {resolveCommercialManagement} from './commercial-management.ts';
import {resolveWorkforce} from './workforce.ts';
import {portfolioFixed,globalWeeklyReview}from './global.ts';
import {supplyMinimumFixed} from './supply-agreements.ts';
import {teamFixed} from './teams.ts';
import {activeEmployee,retainedSiteFixed} from './site-recovery.ts';
import {machineLeaseFixed} from './machine-orders.ts';
import {prepareEquipmentOperations,closeEquipmentOperations,maintenanceFixed} from './maintenance.ts';
import {resolveOvertime} from './overtime.ts';
import {resolveFranchiseSupply} from './franchise-supply.ts';
import {simulationCopy} from './simulation-copy.ts';
import {resolveFranchises} from './franchise-operations.ts';
import {franchiseFixed} from './franchise.ts';
import{consumerFixed}from'./channels.ts';
import {delegationPlan} from './delegation.ts';
import {finishTravel} from './travel.ts';
import {publishUpdates} from './updates.ts';
import {regionForCity} from './content/regions.ts';
import type {V4State,WeekIntent,WeekOutcome,DomainEvent} from './model.ts';
import {accountBalance,post,debit,credit,serviceLoan,checkLedger,financialSummary,classifyCashFlow} from './finance.ts';
import {prepareOpening} from './opening.ts';
import {resolveSales} from './sales.ts';
import {commitProduction} from './production.ts';
import {expireLots,checkInventory} from './inventory.ts';
/** One close order: mature due cash; published market; protected procurement;
 * production; commitments then retail; financial obligations/expiry; snapshot.
 * Sourcing/production/sales hooks are introduced in B2–B4 at those boundaries. */
function closeWeek(state:V4State,intent:WeekIntent,previewSample?:number):WeekOutcome {
  const reject=(error:string):WeekOutcome=>({ok:false,state,error});
  if(!intent||typeof intent.tickId!=='string'||!/^[a-zA-Z0-9:_-]{1,96}$/.test(intent.tickId)||!Number.isSafeInteger(intent.expectedWeek)||intent.expectedWeek<1)return reject('Invalid weekly checkpoint.');
  const signature=JSON.stringify(intent),previous=state.events.find(e=>e.id===intent.tickId);
  if(previous)return previous.origin==='tick'&&previous.signature===signature?{ok:true,state,ledgerEntries:[],interruptions:[]}:reject('Checkpoint identity already used.');
  if(intent.expectedWeek!==state.week)return reject('This weekly checkpoint is stale.');
  if(!['playing','recovery','sandbox'].includes(state.campaign.status))return reject('Resolve the campaign outcome before advancing.');
  if(checkLedger(state).length)return reject('The saved ledger does not reconcile.');
  let draft=previewSample===undefined?structuredClone(state):simulationCopy(state);const start=draft.ledger.length,openingCashCents=state.weekOpeningCashCents,interruptions:string[]=[];
  const event:DomainEvent={id:intent.tickId,origin:'tick' as const,week:state.week,type:'weekly-close',signature,entityIds:['house'],details:{}};
  try{
    // 1. Receivables mature at opening; deliveries cannot collect twice.
    for(const r of draft.receivables)if(!r.collected&&r.dueWeek<=state.week){post(draft,event,'Scheduled customer balance received',[debit('cash',r.amountCents),credit('receivables',r.amountCents,r.contractId)],r.id,r.scope);r.collected=true;}
    resolveFranchiseSupply(draft,event);
    interruptions.push(...prepareOpening(draft,event));
    prepareEquipmentOperations(draft,event,previewSample??0);
    const commercial=resolveCommercialManagement(draft,event);draft=commercial.state;interruptions.push(...commercial.interruptions);
    const delegated=delegationPlan(draft,intent.tickId,event,previewSample!==undefined);draft=delegated.state;interruptions.push(...delegated.interruptions);
    draft.lastProduction=commitProduction(draft,event);
    closeEquipmentOperations(draft,event);
    resolveOvertime(draft,event);
    draft.lastSales=resolveSales(draft,event,previewSample);draft.salesHistory.push(structuredClone(draft.lastSales));
    interruptions.push(...resolveFranchises(draft,event,previewSample));
    // 2–5. Published markets, procurement, production and sales are integrated
    // by their owning phase without introducing a second weekly clock.
    // 6. Payroll is charged once; labor allocation never charges it again.
    for(const obligation of draft.unpaidObligations){
      const paid=Math.min(draft.cashCents,obligation.cents);
      if(paid)post(draft,event,'Earlier operating obligation settled',[debit('arrears',paid,obligation.id),credit('cash',paid)],obligation.id+'-settled',obligation.scope);
      obligation.cents-=paid;
    }
    draft.unpaidObligations=draft.unpaidObligations.filter(o=>o.cents>0);
    const fixed=[...portfolioFixed(draft),...supplyMinimumFixed(draft,true),...teamFixed(draft),...retainedSiteFixed(draft),...machineLeaseFixed(draft),...maintenanceFixed(draft),...franchiseFixed(draft).map(({hub:h,rentCents})=>({label:'Regional field-support office rent',account:'rent' as const,amount:rentCents,entityId:h.id,scope:{regionId:regionForCity(h.cityId),channelId:'franchise-royalties'}})),...consumerFixed(draft).flatMap(({channel:c,rentCents,staffCents})=>[{label:'Consumer location/platform rent',account:'rent' as const,amount:rentCents,entityId:c.id,scope:{regionId:regionForCity(c.cityId),channelId:c.kind}},{label:'Consumer operating cohort payroll',account:'payroll' as const,amount:staffCents,entityId:c.id,scope:{regionId:regionForCity(c.cityId),channelId:c.kind}}]),...draft.warehouses.filter(w=>w.rentCents).map(w=>({label:'Receiving premises rent',account:'rent' as const,amount:w.rentCents!,entityId:w.id,scope:{regionId:regionForCity(w.cityId)}})),...draft.employees.filter(activeEmployee).map(e=>({label:'Payroll — '+e.name,account:'payroll' as const,amount:e.wageCents,entityId:e.id,scope:e.factoryId?{factoryId:e.factoryId,regionId:regionForCity(draft.factories.find(f=>f.id===e.factoryId)!.cityId)}:undefined})),...draft.factories.filter(f=>f.active).map(f=>({label:'Premises rent',account:'rent' as const,amount:f.rentCents,entityId:f.id,scope:{factoryId:f.id,regionId:regionForCity(f.cityId)}}))];
    for(const {label,account,amount,entityId,scope}of fixed){
      const paid=Math.min(amount,draft.cashCents),unpaid=amount-paid,id=event.id+':'+account+':'+entityId;
      if(amount)post(draft,event,label,[debit(account,amount,entityId),credit('cash',paid),credit('arrears',unpaid,entityId)],account+':'+entityId,scope);
      if(unpaid){draft.unpaidObligations.push({id,account,cents:unpaid,sinceWeek:state.week,scope});draft.campaign.status='recovery';interruptions.push(`${label} has unpaid obligations; review the recovery plan.`);}
    }
    for(const loan of draft.loans){serviceLoan(draft,loan,event);if(loan.arrearsCents)interruptions.push(loan.arrearsSinceWeek!==null&&state.week>=loan.arrearsSinceWeek+2?'Recovery window expired: review restructuring.':'Installment arrears: two-week recovery window.');}
    interruptions.push(...resolveWorkforce(draft,event));
    expireLots(draft,event);
    if(draft.campaign.status==='recovery'&&draft.loans.every(l=>l.arrearsCents===0)&&draft.unpaidObligations.length===0)draft.campaign.status='playing';
    // 7. Immutable actual snapshot contains this close only; no later quotes
    // or balance model may rewrite historical actuals.
    draft.events.push(event);draft.completedTicks.push(event.id);
    const entries=draft.ledger.slice(state.weekLedgerStartIndex),summary=financialSummary(draft,entries),flows={operating:0,investing:0,financing:0};
    for(const e of entries)flows[classifyCashFlow(e)]+=e.postings.filter(p=>p.account==='cash').reduce((n,p)=>n+p.debitCents-p.creditCents,0);
    const production=draft.lastProduction.map(({remainingInventory:_,...result})=>({...structuredClone(result),regionId:regionForCity(draft.factories.find(f=>f.id===result.factoryId)!.cityId)!}));
    const inventory={rawCents:accountBalance(draft,'raw-inventory'),finishedCents:accountBalance(draft,'finished-inventory'),packagingCents:accountBalance(draft,'packaging-inventory'),lots:structuredClone(draft.inventory),shipments:structuredClone(draft.shipments)};
    const obligations={receivableCents:accountBalance(draft,'receivables'),depositCents:Math.max(0,-accountBalance(draft,'customer-deposits')),arrearsCents:Math.max(0,-accountBalance(draft,'arrears'))};
    event.details.operatingActuals=JSON.stringify({production,inventory,obligations});
    draft.snapshots.push({production,inventory,obligations,sales:structuredClone(draft.lastSales),tickId:event.id,week:state.week,openingCashCents,closingCashCents:draft.cashCents,operatingFlowCents:flows.operating,investingFlowCents:flows.investing,financingFlowCents:flows.financing,...summary,sourceEventIds:[...new Set([...entries.map(e=>e.eventId),event.id])]});
    globalWeeklyReview(draft,event,interruptions);
    finishTravel(draft,event);
    publishUpdates(draft,event,interruptions);
    draft.week++;draft.weekOpeningCashCents=draft.cashCents;draft.weekLedgerStartIndex=draft.ledger.length;
    const errors=[...checkLedger(draft),...checkInventory(draft)];if(errors.length)return reject(errors.join('; '));
    return {ok:true,state:draft,ledgerEntries:draft.ledger.slice(start),interruptions};
  }catch(error){return reject(error instanceof Error?error.message:'The week could not be committed.');}
}
export function resolveWeek(state:V4State,intent:WeekIntent):WeekOutcome {return closeWeek(state,intent);}
export function previewWeek(state:V4State,intent:WeekIntent){
  const samples=Array.from({length:24},(_,i)=>closeWeek(state,intent,i)),valid=samples.filter((s):s is Extract<WeekOutcome,{ok:true}>=>s.ok);
  if(!valid.length)return {closingCashCents:state.cashCents,lowCashCents:state.cashCents,highCashCents:state.cashCents,blocked:true,reasons:samples.flatMap(s=>s.ok?[]:[s.error]),basis:'sampled weekly outlook' as const};
  const cash=valid.map(s=>s.state.cashCents).sort((a,b)=>a-b);
  return {closingCashCents:Math.round(cash.reduce((n,c)=>n+c,0)/cash.length),lowCashCents:cash[Math.floor((cash.length-1)*.1)],highCashCents:cash[Math.floor((cash.length-1)*.9)],blocked:false,reasons:[...new Set(valid.flatMap(s=>s.interruptions))],basis:'sampled weekly outlook' as const};
}
