import test from 'node:test';
import assert from 'node:assert/strict';
import {newV4,serializeV4} from '../game/v4/saves.ts';
import {applyCommand} from '../game/v4/commands.ts';
import {resolveWeek} from '../game/v4/tick.ts';
import {accountBalance,checkLedger} from '../game/v4/finance.ts';
import {checkInventory} from '../game/v4/inventory.ts';
const act=(s,c)=>{const r=applyCommand(s,c);assert.equal(r.ok,true,r.error);return r.state;};
function setup(){let s=newV4({founder:'B',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'});s=act(s,{id:'line',type:'select-equipment',package:'balanced'});for(const employeeId of ['sam','mira'])s=act(s,{id:'hire-'+employeeId,type:'hire',employeeId,factoryId:'sf-workshop'});s=act(s,{id:'process',type:'commission',factoryId:'sf-workshop',recipeRevisionId:'embar62:r1',mode:'assisted',controls:[.7,.7,.7]});for(const [varietyId,quantityGrams]of [['cocoa-ecuador',70000],['sugar-refined',60000]])s=act(s,{id:'stock-'+varietyId,type:'purchase',request:{supplierId:'rafi',varietyId,quantityGrams,grade:'standard',warehouseId:'sf-storage'}});s=act(s,{id:'wrappers',type:'purchase-packaging',request:{supplierId:'rafi',packagingId:'ordinary-wrap',quantityUnits:4000,warehouseId:'sf-storage'}});return s;}
const planned=(s,cases)=>act(s,{id:'plan',type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases}]}});
test('contracts allocate before retail and recognize deposits only when delivered, with delayed balance cash',()=>{
 let s=setup();s=act(s,{id:'order',type:'accept-order',orderId:'ferry'});s=planned(s,40);const r=resolveWeek(s,{tickId:'week1',expectedWeek:1});assert.equal(r.ok,true,r.error);s=r.state;
 assert.equal(s.lastSales.contracts[0].deliveredCases,35);assert.equal(s.contracts[0].status,'fulfilled');assert.equal(accountBalance(s,'customer-deposits'),0);assert.equal(accountBalance(s,'contract-revenue'),-77000);assert.equal(accountBalance(s,'receivables'),57750);assert.ok(s.lastSales.retail[0].soldCases<10);assert.deepEqual(checkInventory(s),[]);assert.deepEqual(checkLedger(s),[]);assert.doesNotThrow(()=>serializeV4(s));
 const next=resolveWeek(s,{tickId:'week2',expectedWeek:2});assert.equal(next.ok,true,next.error);assert.equal(accountBalance(next.state,'receivables'),0);assert.equal(next.state.receivables[0].collected,true);
});
test('unconstrained asking prices can produce no sales and stock reservations explain a demand miss',()=>{
 let s=planned(setup(),30);s=act(s,{id:'price',type:'set-price',recipeRevisionId:'embar62:r1',priceCents:1000000});let r=resolveWeek(s,{tickId:'week1',expectedWeek:1});assert.equal(r.ok,true,r.error);assert.equal(r.state.lastSales.retail[0].demandCases,0);assert.equal(r.state.lastSales.retail[0].soldCases,0);
 s=r.state;s=act(s,{id:'order',type:'accept-order',orderId:'ferry'});s=act(s,{id:'reserve',type:'reserve-lot',lotId:s.inventory.find(l=>l.kind==='finished').id,contractId:'ferry',quantity:s.inventory.find(l=>l.kind==='finished').quantity});s=act(s,{id:'price2',type:'set-price',recipeRevisionId:'embar62:r1',priceCents:2000});s.factories[0].plan=[];s.contracts[0].dueStart=3;
 r=resolveWeek(s,{tickId:'week2',expectedWeek:2});assert.equal(r.ok,true,r.error);assert.ok(r.state.lastSales.retail[0].demandCases>0);assert.equal(r.state.lastSales.retail[0].soldCases,0);assert.equal(r.state.lastSales.retail[0].reason,'Reserved stock');
});
test('expiry occurs after the contractual delivery boundary and closing a week cannot duplicate sales',()=>{
 let s=planned(setup(),40);s=act(s,{id:'high',type:'set-price',recipeRevisionId:'embar62:r1',priceCents:1000000});let r=resolveWeek(s,{tickId:'week1',expectedWeek:1});assert.equal(r.ok,true,r.error);s=r.state;const lot=s.inventory.find(l=>l.kind==='finished');s.factories[0].plan=[];while(s.week<lot.expiryWeek){r=resolveWeek(s,{tickId:'week'+s.week,expectedWeek:s.week});assert.equal(r.ok,true,r.error);s=r.state;}const boundary=s.week;s=act(s,{id:'order',type:'accept-order',orderId:'ferry'});r=resolveWeek(s,{tickId:'week'+boundary,expectedWeek:boundary});assert.equal(r.ok,true,r.error);assert.equal(r.state.contracts[0].status,'fulfilled');assert.equal(r.state.inventory.filter(l=>l.kind==='finished').length,0);const before=serializeV4(r.state);const replay=resolveWeek(r.state,{tickId:'week'+boundary,expectedWeek:boundary});assert.equal(replay.ok,true);assert.equal(serializeV4(replay.state),before);
});
test('zero-delay contract balances settle at delivery and missed contracts release reservations and refund unearned deposits',()=>{
 let s=planned(setup(),40);s=act(s,{id:'order',type:'accept-order',orderId:'ferry'});s.contracts[0].settlementDelay=0;let r=resolveWeek(s,{tickId:'week1',expectedWeek:1});assert.equal(r.ok,true,r.error);assert.equal(accountBalance(r.state,'receivables'),0);assert.equal(r.state.receivables.length,0);
 s=setup();s=act(s,{id:'order',type:'accept-order',orderId:'ferry'});for(let week=1;week<=3;week++){r=resolveWeek(s,{tickId:'week'+week,expectedWeek:week});assert.equal(r.ok,true,r.error);s=r.state;}
 assert.equal(s.contracts[0].status,'failed');assert.equal(accountBalance(s,'customer-deposits'),0);assert.equal(accountBalance(s,'fees'),5000);assert.deepEqual(checkLedger(s),[]);assert.doesNotThrow(()=>serializeV4(s));
});
test('forged historical sales cannot be imported as ledger-backed actuals',async()=>{
 const {deserializeV4}=await import('../game/v4/saves.ts');let s=resolveWeek(newV4({founder:'B',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'}),{tickId:'week1',expectedWeek:1}).state;
 s.salesHistory[0].retail=[{offerId:'fake',recipeRevisionId:'embar62:r1',priceCents:2000,demandCases:999,soldCases:999,revenueCents:1998000,cogsCents:1,unservedCases:0,reason:'Demand served'}];assert.equal(deserializeV4(JSON.stringify(s)).ok,false);
});
test('weekly cash preview gives a sampled range without exposing the committed demand stream',async()=>{
 const {previewWeek}=await import('../game/v4/tick.ts');const s=planned(setup(),80),before=serializeV4(s),p=previewWeek(s,{tickId:'week1',expectedWeek:1});assert.equal(p.basis,'sampled weekly outlook');assert.ok(p.highCashCents>p.lowCashCents);assert.equal(serializeV4(s),before);assert.deepEqual(previewWeek(s,{tickId:'week1',expectedWeek:1}),p);
});
