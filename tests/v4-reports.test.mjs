import {catalog} from '../game/v4/catalog.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {newV4,serializeV4,deserializeV4} from '../game/v4/saves.ts';
import {applyCommand} from '../game/v4/commands.ts';
import {resolveWeek} from '../game/v4/tick.ts';
import {financeReport,overviewReport,obligationsReport,supplyReport,salesReport} from '../game/v4/reports.ts';
const fresh=()=>newV4({founder:'B',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'});
const act=(s,c)=>{const r=applyCommand(s,c);assert.equal(r.ok,true,r.error);return r.state;};
test('Reports Centre uses source ledger actuals and reconciles statements including investments, principal and deposits',()=>{
 let s=act(fresh(),{id:'line',type:'select-equipment',package:'balanced'});s=act(s,{id:'order',type:'accept-order',orderId:'ferry'});s=resolveWeek(s,{tickId:'week1',expectedWeek:1}).state;
 const f=financeReport(s,{fromWeek:1,toWeek:1});assert.equal(f.basis,'closed actuals');assert.equal(f.cash.openingCents+f.cash.operatingCents+f.cash.investingCents+f.cash.financingCents,f.cash.closingCents);assert.equal(f.pnl.revenueCents,0);assert.equal(f.pnl.operatingExpenseCents,35000);assert.equal(f.balance.totalAssetsCents,f.balance.totalLiabilitiesCents+f.balance.equityCents);assert.equal(f.balance.customerDepositsCents,19250);assert.ok(f.trace.some(t=>t.eventId==='line'&&t.locationId==='sf-workshop'));assert.ok(obligationsReport(s).some(o=>o.kind==='loan'&&o.locationId==='office'));
});
test('closed history survives changing current prices, recipes and save round-trip',()=>{
 let s=act(fresh(),{id:'line',type:'select-equipment',package:'balanced'});s=resolveWeek(s,{tickId:'week1',expectedWeek:1}).state;const before=financeReport(s,{fromWeek:1,toWeek:1});s.identity.business='New Brand';s=resolveWeek(s,{tickId:'week2',expectedWeek:2}).state;assert.deepEqual(financeReport(s,{fromWeek:1,toWeek:1}),before);const loaded=deserializeV4(serializeV4(s));assert.equal(loaded.ok,true);assert.deepEqual(financeReport(loaded.state,{fromWeek:1,toWeek:1}),before);
});
test('missing history is labelled and forecasts are not presented as historical sales',()=>{
 const s=fresh();assert.equal(financeReport(s,{fromWeek:1,toWeek:1}).basis,'no closed history');assert.equal(salesReport(s,{fromWeek:1,toWeek:1}).basis,'no closed history');assert.equal(overviewReport(s).latestActual,null);assert.deepEqual(supplyReport(s).lots,[]);assert.equal(financeReport(s,{fromWeek:0,toWeek:2}).basis,'invalid period');
});
test('report query contract validates scope and carries immutable metric provenance and an additive cash explanation',async()=>{
 const {buildReport,explainMetric}=await import('../game/v4/reports.ts');let s=act(fresh(),{id:'line',type:'select-equipment',package:'balanced'});s=resolveWeek(s,{tickId:'week1',expectedWeek:1}).state;
 const query={asOfWeek:1,periodStart:1,periodEnd:1,scopeType:'company',category:'finance'},report=buildReport(s,query);assert.equal(report.schemaVersion,1);assert.equal(report.generatedFromTickId,'week1');const cash=report.metrics.find(m=>m.id==='closing-cash');assert.equal(cash.basis,'actual');assert.equal(cash.unit,'cents');assert.ok(cash.sourceEventIds.includes('line'));assert.deepEqual(cash.period,{start:1,end:1});const explanation=explainMetric(s,{query,metricId:'closing-cash'});assert.equal(explanation.baseline+explanation.drivers.reduce((n,d)=>n+d.contribution,0)+explanation.remainder,explanation.currentValue);assert.ok(explanation.actions.some(a=>a.locationId==='sf-workshop'));
 assert.ok(buildReport(s,{...query,scopeType:'factory',scopeId:'missing'}).alerts.some(a=>a.includes('scope')));assert.equal(buildReport(s,{...query,scopeType:'factory',scopeId:'sf-workshop'}).metrics.some(m=>m.id==='closing-cash'),false);
});
test('historical payroll attribution does not move when current staff assignments change',async()=>{
 const {buildReport}=await import('../game/v4/reports.ts');let s=act(fresh(),{id:'line',type:'select-equipment',package:'balanced'});s=act(s,{id:'sam',type:'hire',employeeId:'sam',factoryId:'sf-workshop'});s=resolveWeek(s,{tickId:'week1',expectedWeek:1}).state;const query={asOfWeek:1,periodStart:1,periodEnd:1,scopeType:'factory',scopeId:'sf-workshop',category:'finance'},before=buildReport(s,query);assert.equal(before.metrics.find(m=>m.id==='operating-expense').value,53000);s.employees[0].factoryId=null;assert.deepEqual(buildReport(s,query),before);
 const missing=buildReport(fresh(),{asOfWeek:1,periodStart:1,periodEnd:1,scopeType:'company',category:'finance'});assert.ok(missing.metrics.every(m=>m.value===null));
});
test('expiry removes the same scoped inventory value and records the scoped loss',async()=>{
 const {buildReport}=await import('../game/v4/reports.ts');let s=act(fresh(),{id:'stock',type:'purchase',request:{supplierId:'rafi',varietyId:'cocoa-ecuador',quantityGrams:1000,grade:'standard',warehouseId:'sf-storage'}});const value=s.inventory[0].costCents,expiry=s.inventory[0].expiryWeek;for(let week=1;week<=expiry;week++){const r=resolveWeek(s,{tickId:'week:'+week,expectedWeek:week});assert.equal(r.ok,true,r.error);s=r.state;}
 const query={asOfWeek:expiry,periodStart:expiry,periodEnd:expiry,scopeType:'region',scopeId:'north-america',category:'supply'};assert.equal(buildReport(s,query).metrics.find(m=>m.id==='raw-inventory').value,0);assert.equal(buildReport(s,{...query,category:'finance'}).metrics.find(m=>m.id==='cogs').value,value);
});
test('production totals carry the complete requested closed period',async()=>{
 const {preparedHouse,action}=await import('./helpers/v4-house.mjs');const {buildReport}=await import('../game/v4/reports.ts');let s=preparedHouse();for(let week=1;week<=2;week++){s=action(s,{id:'plan:'+week,type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:20}]}});const r=resolveWeek(s,{tickId:'week:'+week,expectedWeek:week});assert.equal(r.ok,true,r.error);s=r.state;}
 const view=buildReport(s,{asOfWeek:2,periodStart:1,periodEnd:2,scopeType:'company',category:'production'});assert.deepEqual(view.metrics.find(m=>m.id==='good-cases').period,{start:1,end:2});assert.equal(view.rows.filter(r=>Array.isArray(r.rows)).length,2);
});
test('invalid deferred attribution cannot import and later poison collection or obligation settlement',async()=>{
 const {preparedHouse,action}=await import('./helpers/v4-house.mjs');let s=preparedHouse();s=action(s,{id:'order',type:'accept-order',orderId:'ferry'});s=action(s,{id:'plan',type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:40}]}});s=resolveWeek(s,{tickId:'week1',expectedWeek:1}).state;const corrupt=structuredClone(s);corrupt.receivables[0].scope={...corrupt.receivables[0].scope,factoryId:'missing'};assert.equal(deserializeV4(JSON.stringify(corrupt)).ok,false);
});
test('production and physical stock actuals retain every closed week rather than the latest state',async()=>{
 const {preparedHouse,action}=await import('./helpers/v4-house.mjs');const {buildReport}=await import('../game/v4/reports.ts');let s=preparedHouse(),total=0;
 for(let week=1;week<=3;week++){s=action(s,{id:'plan:'+week,type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:week*6}]}});const r=resolveWeek(s,{tickId:'week:'+week,expectedWeek:week});assert.equal(r.ok,true,r.error);s=r.state;total+=s.lastProduction.flatMap(p=>p.rows).reduce((n,row)=>n+row.goodCases,0);}
 const query={asOfWeek:3,periodStart:1,periodEnd:3,scopeType:'company',category:'production'},report=buildReport(s,query);assert.equal(report.metrics.find(m=>m.id==='good-cases').value,total);assert.equal(report.rows.filter(r=>Array.isArray(r.rows)).length,3);assert.deepEqual(report.metrics.find(m=>m.id==='good-cases').period,{start:1,end:3});
 const oldQuery={...query,asOfWeek:1,periodEnd:1},old=buildReport(s,oldQuery);assert.equal(old.rows.filter(r=>Array.isArray(r.rows)).length,1);assert.equal(s.snapshots[0].inventory.lots.length>0,true);const loaded=deserializeV4(serializeV4(s));assert.equal(loaded.ok,true,loaded.error);assert.deepEqual(buildReport(loaded.state,oldQuery),old);s.lastProduction=[];s.inventory[0].condition=12;assert.deepEqual(buildReport(s,oldQuery),old);
});
test('forged operational snapshots and output counters cannot become imported actuals',async()=>{
 const {preparedHouse,action}=await import('./helpers/v4-house.mjs');let s=preparedHouse();s=action(s,{id:'plan',type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:10}]}});s=resolveWeek(s,{tickId:'week1',expectedWeek:1}).state;
 for(const mutate of [draft=>draft.snapshots[0].production[0].rows[0].goodCases++,draft=>draft.snapshots[0].inventory.rawCents++,draft=>draft.snapshots[0].sales.retail[0].soldCases++,draft=>draft.recipeRevisions[0].producedCases++]){const draft=structuredClone(s);mutate(draft);assert.equal(deserializeV4(JSON.stringify(draft)).ok,false);}
});
test('historic stock drill-down includes physical factory and freight locations',async()=>{
 const {buildReport}=await import('../game/v4/reports.ts');let s=act(fresh(),{id:'line',type:'select-equipment',package:'balanced'});s=act(s,{id:'stock',type:'purchase',request:{supplierId:'rafi',varietyId:'cocoa-ecuador',quantityGrams:1000,grade:'standard',warehouseId:'sf-storage'}});const id=s.inventory[0].id;s=act(s,{id:'move',type:'transfer-lot',lotId:id,toLocationId:'sf-workshop'});s=resolveWeek(s,{tickId:'week1',expectedWeek:1}).state;
 const query={asOfWeek:1,periodStart:1,periodEnd:1,scopeType:'region',scopeId:'north-america',category:'supply'};assert.equal(buildReport(s,query).rows[0].id,id);assert.equal(buildReport(s,{...query,scopeType:'factory',scopeId:'sf-workshop'}).rows[0].id,id);
});
test('matching imported event summaries do not authorize physically impossible batch evidence',async()=>{
 const {preparedHouse,action}=await import('./helpers/v4-house.mjs');let s=preparedHouse();s=action(s,{id:'plan',type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:10}]}});s=resolveWeek(s,{tickId:'week1',expectedWeek:1}).state;
 for(const mutate of [row=>row.consumed[0].quantity=-1,row=>row.consumed[0].quantity++,row=>row.consumed[0].varietyId='missing']){const draft=structuredClone(s),snapshot=draft.snapshots[0];mutate(snapshot.production[0].rows[0]);draft.events.find(e=>e.id===snapshot.tickId).details.operatingActuals=JSON.stringify({production:snapshot.production,inventory:snapshot.inventory,obligations:snapshot.obligations});assert.equal(deserializeV4(JSON.stringify(draft)).ok,false);}
});
test('freight arrival cannot invalidate the historical in-transit stock of an earlier close',()=>{
 let s=act(fresh(),{id:'importer',type:'discover-supplier',supplierId:'bay-import'});s=act(s,{id:'freight',type:'purchase',request:{supplierId:'bay-import',varietyId:'cocoa-ecuador',quantityGrams:10000,grade:'standard',warehouseId:'sf-storage'}});
 for(let week=1;week<=4;week++){const r=resolveWeek(s,{tickId:'week:'+week,expectedWeek:week});assert.equal(r.ok,true,r.error);s=r.state;assert.doesNotThrow(()=>serializeV4(s));assert.equal(deserializeV4(serializeV4(s)).ok,true);}
 assert.equal(s.snapshots[0].inventory.lots[0].locationId.startsWith('transit:'),true);assert.equal(s.shipments[0].status,'arrived');
});
test('rejected or expired freight preserves the earlier dated transit evidence',()=>{
 for(const outcome of ['rejected','expired']){let s=act(fresh(),{id:'importer',type:'discover-supplier',supplierId:'bay-import'});s=act(s,{id:'freight',type:'purchase',request:{supplierId:'bay-import',varietyId:outcome==='expired'?'vanilla':'cocoa-ecuador',quantityGrams:10000,grade:'standard',warehouseId:'sf-storage'}});const expiry=s.inventory[0].expiryWeek;
  for(const varietyId of ['cocoa-ecuador','cocoa-ghana'])s=act(s,{id:'fill-'+varietyId,type:'purchase',request:{supplierId:'rafi',varietyId,quantityGrams:90000,grade:'standard',warehouseId:'sf-storage'}});const varietyId=outcome==='expired'?'cocoa-ghana':'vanilla',filler=catalog.ingredients.find(i=>i.id===varietyId),occupied=s.inventory.filter(l=>l.locationId==='sf-storage').reduce((n,l)=>n+l.quantity*1000/catalog.ingredients.find(i=>i.id===l.varietyId).gramsPerLiter,0);s=act(s,{id:'fill-space',type:'purchase',request:{supplierId:'rafi',varietyId,quantityGrams:Math.floor((199990-occupied)*filler.gramsPerLiter/1000),grade:'standard',warehouseId:'sf-storage'}});s=act(s,{id:'policy',type:'arrival-policy',warehouseId:'sf-storage',policy:outcome==='rejected'?'reject':'delay',budgetCents:0});
  const finalWeek=outcome==='rejected'?3:expiry;for(let week=1;week<=finalWeek;week++){const r=resolveWeek(s,{tickId:'week:'+week,expectedWeek:week});assert.equal(r.ok,true,r.error);s=r.state;assert.doesNotThrow(()=>serializeV4(s));assert.equal(deserializeV4(serializeV4(s)).ok,true);}
  assert.equal(s.shipments[0].status,outcome);assert.equal(s.snapshots[0].inventory.shipments[0].status,'in-transit');
 }
});
