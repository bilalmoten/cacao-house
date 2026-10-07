import test from 'node:test';
import assert from 'node:assert/strict';
import {newV4,serializeV4,deserializeV4} from '../game/v4/saves.ts';
import {applyCommand} from '../game/v4/commands.ts';
import {resolveWeek,previewWeek} from '../game/v4/tick.ts';
import {accountBalance,financialSummary,checkLedger} from '../game/v4/finance.ts';
const fresh=()=>newV4({founder:'Bilal',business:'Cacao House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'},42);
const apply=(s,c)=>{const r=applyCommand(s,c);assert.equal(r.ok,true,r.error);return r.state;};
test('founder equity and term borrowing reconcile cash without becoming revenue',()=>{
  let s=fresh();assert.equal(s.cashCents,600000);assert.equal(s.loans[0].principalCents,300000);
  assert.equal(financialSummary(s).revenueCents,0);assert.deepEqual(checkLedger(s),[]);
  s=apply(s,{id:'funding',type:'select-funding',package:'leveraged'});
  assert.equal(s.cashCents,800000);assert.equal(s.loans[0].principalCents,500000);
  assert.equal(financialSummary(s).revenueCents,0);assert.equal(financialSummary(s).profitCents,0);
  assert.equal(applyCommand(s,{id:'funding-again',type:'select-funding',package:'leveraged'}).ok,false);
});
test('a customer deposit is a liability until delivery and duplicate commands cannot book twice',()=>{
  let s=fresh();const original=serializeV4(s);
  const command={id:'accept-ferry',type:'accept-order',orderId:'ferry'};
  const first=applyCommand(s,command);assert.equal(first.ok,true);s=first.state;
  assert.equal(s.cashCents,619250);assert.equal(accountBalance(s,'customer-deposits'),-19250);
  assert.equal(financialSummary(s).revenueCents,0);assert.equal(financialSummary(s).profitCents,0);
  assert.equal(serializeV4(fresh()),original);
  const replay=applyCommand(s,command);assert.equal(replay.ok,true);assert.equal(replay.state,s);assert.equal(replay.events.length,0);
  assert.equal(applyCommand(s,{...command,type:'select-funding',package:'leveraged'}).ok,false);
  assert.deepEqual(checkLedger(s),[]);
});
test('investment buys an asset and disclosed commissioning expense without double charging',()=>{
  const s=apply(fresh(),{id:'line',type:'select-equipment',package:'balanced'});
  assert.equal(s.cashCents,320000);assert.equal(accountBalance(s,'equipment'),220000);
  assert.equal(accountBalance(s,'premises-deposit'),40000);
  assert.equal(financialSummary(s).operatingExpenseCents,20000);
  assert.equal(s.factories.length,1);assert.equal(applyCommand(s,{id:'line-2',type:'select-equipment',package:'automated'}).ok,false);
});
test('weekly close is idempotent, preserves source state and separates interest from principal',()=>{
  const s=fresh(),before=serializeV4(s),intent={tickId:'week:1',expectedWeek:1};
  const p=previewWeek(s,intent);assert.equal(serializeV4(s),before);
  const r=resolveWeek(s,intent);assert.equal(r.ok,true);assert.equal(serializeV4(s),before);
  assert.equal(r.state.week,2);assert.equal(r.state.cashCents,p.closingCashCents);
  const snap=r.state.snapshots[0];assert.equal(snap.interestCents,900);
  assert.equal(snap.profitCents,-900);assert.equal(snap.revenueCents,0);
  assert.equal(snap.openingCashCents+snap.operatingFlowCents+snap.investingFlowCents+snap.financingFlowCents,snap.closingCashCents);
  assert.deepEqual(checkLedger(r.state),[]);
  const retry=resolveWeek(r.state,intent);assert.equal(retry.ok,true);assert.equal(retry.state,r.state);assert.equal(retry.ledgerEntries.length,0);
  assert.equal(resolveWeek(r.state,{tickId:'other',expectedWeek:1}).ok,false);
  assert.deepEqual(deserializeV4(serializeV4(r.state)).state,r.state);
});
test('52 installments settle the term with a rounding-adjusted final principal payment',()=>{
  let s=fresh();for(let w=1;w<=52;w++){const r=resolveWeek(s,{tickId:'week:'+w,expectedWeek:w});assert.equal(r.ok,true);s=r.state;assert.deepEqual(checkLedger(s),[]);}
  assert.equal(s.loans[0].principalCents,0);assert.equal(s.loans[0].remainingWeeks,0);assert.equal(s.loans[0].status,'settled');
  assert.equal(accountBalance(s,'loan-principal'),0);assert.equal(s.snapshots.length,52);
});
test('invalid IDs, impossible numerical timing and unknown targets reject without mutation',()=>{
  const s=fresh(),before=serializeV4(s);
  for(const c of [{id:'x',type:'accept-order',orderId:'missing'},{id:'x',type:'transfer-lot',lotId:'missing',toLocationId:'sf-workshop'},{id:'',type:'select-funding',package:'standard'},{id:'bad',type:'select-equipment',package:'nonexistent'}]){const r=applyCommand(s,c);assert.equal(r.ok,false);assert.equal(r.state,s);assert.equal(serializeV4(s),before);}
  for(const expectedWeek of [NaN,Infinity,-1,1.5]){const r=resolveWeek(s,{tickId:'bad',expectedWeek});assert.equal(r.ok,false);assert.equal(r.state,s);}
});
test('the weekly report includes planning cash, investment and expenses before the close',()=>{
  let s=apply(fresh(),{id:'funding',type:'select-funding',package:'leveraged'});
  s=apply(s,{id:'line',type:'select-equipment',package:'balanced'});
  s=apply(s,{id:'order',type:'accept-order',orderId:'ferry'});
  const closed=resolveWeek(s,{tickId:'week:1',expectedWeek:1});assert.equal(closed.ok,true);
  const report=closed.state.snapshots[0];
  assert.equal(report.openingCashCents,600000);assert.equal(report.investingFlowCents,-260000);
  assert.equal(report.operatingExpenseCents,35000); // commissioning + rent
  assert.equal(report.openingCashCents+report.operatingFlowCents+report.investingFlowCents+report.financingFlowCents,report.closingCashCents);
  assert.ok(report.sourceEventIds.includes('line'));assert.ok(report.sourceEventIds.includes('order'));
});
