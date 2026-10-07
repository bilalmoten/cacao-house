import test from 'node:test';
import assert from 'node:assert/strict';
import {newV4,serializeV4} from '../game/v4/saves.ts';
import {applyCommand} from '../game/v4/commands.ts';
import {resolveWeek} from '../game/v4/tick.ts';
import {scheduleProduction} from '../game/v4/production.ts';
import {storageOccupancy,checkInventory} from '../game/v4/inventory.ts';
import {accountBalance,checkLedger} from '../game/v4/finance.ts';
const act=(s,c)=>{const r=applyCommand(s,c);assert.equal(r.ok,true,r.error);return r.state;};
function prepared(){
 let s=newV4({founder:'B',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'});
 s=act(s,{id:'line',type:'select-equipment',package:'balanced'});
 for(const employeeId of ['sam','mira'])s=act(s,{id:'hire-'+employeeId,type:'hire',employeeId,factoryId:'sf-workshop'});
 for(const recipeRevisionId of ['embar62:r1','velvet-milk:r1'])s=act(s,{id:'trial-'+recipeRevisionId,type:'commission',factoryId:'sf-workshop',recipeRevisionId,mode:'assisted',controls:[.7,.7,.7]});
 for(const [varietyId,quantityGrams]of [['cocoa-ecuador',70000],['sugar-refined',60000],['milk-powder',20000]])s=act(s,{id:'stock-'+varietyId,type:'purchase',request:{supplierId:'rafi',varietyId,quantityGrams,grade:'standard',warehouseId:'sf-storage'}});
 for(const recipeRevisionId of ['embar62:r1','velvet-milk:r1'])s=act(s,{id:'price-'+recipeRevisionId,type:'set-price',recipeRevisionId,priceCents:1000000});
s=act(s,{id:'wrappers',type:'purchase-packaging',request:{supplierId:'rafi',packagingId:'ordinary-wrap',quantityUnits:4000,warehouseId:'sf-storage'}}); return s;
}
const plan=cases=>({factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases}]});
test('ingredient and machine constraints reduce actual output while preserving the saved target',()=>{
 const s=prepared(),before=serializeV4(s),preview=scheduleProduction({state:s,factoryId:'sf-workshop'},plan(1000));
 assert.ok(preview.rows[0].goodCases>0&&preview.rows[0].goodCases<3000);assert.ok(preview.constraints.length);assert.equal(serializeV4(s),before);
 const p=act(s,{id:'plan',type:'production-plan',plan:plan(1000)}),r=resolveWeek(p,{tickId:'week:1',expectedWeek:1});assert.equal(r.ok,true,r.error);
 assert.equal(r.state.factories[0].plan[0].cases,1000);assert.equal(r.state.lastProduction[0].rows[0].goodCases,preview.rows[0].goodCases);
 assert.deepEqual(checkInventory(r.state),[]);assert.deepEqual(checkLedger(r.state),[]);
});
test('adding equally skilled staff cannot increase a cooling-limited machine envelope',()=>{
 const s=prepared();s.factories[0].stations.cooling.minutes=100;
 const first=scheduleProduction({state:s,factoryId:'sf-workshop'},plan(100));
 const more=structuredClone(s);more.employees.push({...more.employees[0],id:'extra',name:'Extra operator'});
 const second=scheduleProduction({state:more,factoryId:'sf-workshop'},plan(100));
 assert.equal(second.rows[0].goodCases,first.rows[0].goodCases);assert.ok(first.constraints.some(x=>x.includes('cooling')));
});
test('untrained or absent crews do not create extra human hours or free output',()=>{
 const s=prepared();s.employees=[];const result=scheduleProduction({state:s,factoryId:'sf-workshop'},plan(20));assert.equal(result.rows[0].goodCases,0);assert.equal(result.laborAvailableMinutes,0);
 const limited=prepared();limited.employees.forEach(e=>e.contractedMinutes=5);const p=scheduleProduction({state:limited,factoryId:'sf-workshop'},plan(100));assert.ok(p.laborUsedMinutes<=10);assert.ok(p.constraints.some(x=>x.includes('labor')));
});
test('conversion preserves lot acquisition pennies and salaries are charged once',()=>{
 let s=prepared();s=act(s,{id:'plan',type:'production-plan',plan:plan(20)});
 const rawBefore=accountBalance(s,'raw-inventory'),r=resolveWeek(s,{tickId:'week:1',expectedWeek:1});assert.equal(r.ok,true,r.error);
 const row=r.state.lastProduction[0].rows[0];assert.equal(rawBefore-accountBalance(r.state,'raw-inventory'),row.materialCents);
 assert.equal(accountBalance(r.state,'finished-inventory'),row.materialCents+row.packagingCents+row.conversionCents);assert.equal(accountBalance(r.state,'payroll'),38000);
 assert.ok(row.allocatedLaborCents>0);assert.ok(row.goodCases<=row.inputCases);assert.deepEqual(checkInventory(r.state),[]);
});
test('gradual changeover tiers and saved sequence consume real station budgets',()=>{
 let s=prepared();const mixed={factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:5},{recipeRevisionId:'velvet-milk:r1',cases:5}]};
 const p=scheduleProduction({state:s,factoryId:'sf-workshop'},mixed);assert.equal(p.changeoverMinutes,480);
 // Isolate the sequential tier schedule without inventing free capital.
 s.factories[0].changeoverTier=1;assert.equal(scheduleProduction({state:s,factoryId:'sf-workshop'},mixed).changeoverMinutes,300);
 s.factories[0].changeoverTier=2;assert.equal(scheduleProduction({state:s,factoryId:'sf-workshop'},mixed).changeoverMinutes,180);
 s.factories[0].changeoverTier=3;assert.equal(scheduleProduction({state:s,factoryId:'sf-workshop'},mixed).changeoverMinutes,90);
});
test('practice is free and unsuccessful repeated trials preserve the best factory formula profile',()=>{
 const s=prepared(),before=serializeV4(s);
 const p=act(s,{id:'practice',type:'commission',factoryId:'sf-workshop',recipeRevisionId:'embar62:r1',mode:'timed',controls:[1,1,1],practice:true});assert.equal(serializeV4(p),before);
 const worse=act(s,{id:'worse',type:'commission',factoryId:'sf-workshop',recipeRevisionId:'embar62:r1',mode:'timed',controls:[0,0,0]});assert.deepEqual(worse.processProfiles,s.processProfiles);assert.equal(s.cashCents-worse.cashCents,8000);
});
test('damaged crew and factory process records cannot be imported',async()=>{
 const {deserializeV4}=await import('../game/v4/saves.ts');
 for(const corrupt of [s=>s.employees[0].contractedMinutes=-1,s=>s.processProfiles[0].expectedYield=2,s=>s.recipeRevisions[0].formula.cocoa='milk-powder',s=>s.factories[0].changeoverTier=99]){
  const s=prepared();corrupt(s);assert.equal(deserializeV4(JSON.stringify(s)).ok,false);
 }
});
test('limited finished storage admits a smaller feasible batch rather than cancelling production',()=>{
 const s=prepared();s.warehouses[0].capacityMilliliters.controlled=storageOccupancy(s,'sf-storage').controlled+15000;
 const preview=scheduleProduction({state:s,factoryId:'sf-workshop'},plan(100));
 assert.ok(preview.rows[0].goodCases>0);assert.ok(preview.rows[0].goodCases<30);assert.ok(preview.constraints.some(x=>x.includes('storage')));
});
test('uncovered wages accrue recoverable obligations and do not prevent an atomic weekly close',()=>{
 const s=prepared();
 // Spend cash on real ingredient assets, using a deliberate reserve override.
 let depleted=s;let i=0;
 while(depleted.cashCents>10000){const request={supplierId:'rafi',varietyId:'sugar-refined',quantityGrams:20000,grade:'standard',warehouseId:'sf-storage'};const r=applyCommand(depleted,{id:'deplete-'+i++,type:'purchase',request,overrideReserve:true});if(!r.ok)break;depleted=r.state;}
 // Restrict the crew's payable cash with an authorized capital purchase fixture.
 const {cashCents}=depleted;
 const entry={id:'cash-spend',eventId:'cash-spend',week:1,description:'Capital fixture',postings:[{account:'equipment',debitCents:cashCents,creditCents:0},{account:'cash',debitCents:0,creditCents:cashCents}]};
 depleted.ledger.push(entry);depleted.events.push({id:'cash-spend',origin:'action',week:1,type:'capital',signature:'fixture',entityIds:[],details:{}});depleted.cashCents=0;
 const r=resolveWeek(depleted,{tickId:'week:1',expectedWeek:1});assert.equal(r.ok,true,r.error);assert.equal(r.state.week,2);assert.equal(r.state.campaign.status,'recovery');assert.equal(r.state.unpaidObligations.reduce((n,o)=>n+o.cents,0),53000);assert.deepEqual(checkLedger(r.state),[]);assert.equal(accountBalance(r.state,'payroll'),38000);
});
test('a deliberate cash reserve also constrains conversion and paid training remains savable at its due boundary',()=>{
 let s=prepared();s=act(s,{id:'reserve',type:'set-reserve',cents:s.cashCents});assert.equal(scheduleProduction({state:s,factoryId:'sf-workshop'},plan(20)).rows[0].goodCases,0);
 s=prepared();s=act(s,{id:'training',type:'train',employeeId:'sam',skill:'production'});
 for(let week=1;week<=3;week++){const r=resolveWeek(s,{tickId:'week:'+week,expectedWeek:week});assert.equal(r.ok,true,r.error);s=r.state;assert.doesNotThrow(()=>serializeV4(s));}
 assert.equal(s.employees.find(e=>e.id==='sam').skills.production,70);assert.equal(s.training.length,0);
});
function foreignReceiving(s){s.campaign.stage=2;s.currentCityId='paris';s.visitedCities.push('paris');s.cashCents+=500000;s.events.push({id:'network-fixture-equity',origin:'action',week:s.week,type:'equity',signature:'explicit-integration-fixture',entityIds:['house'],details:{}});s.ledger.push({id:'network-fixture-equity',eventId:'network-fixture-equity',week:s.week,description:'Explicit regional integration fixture equity',postings:[{account:'cash',debitCents:500000,creditCents:0},{account:'equity',debitCents:0,creditCents:500000}]});return act(s,{id:'regional-depot',type:'open-depot',cityId:'paris'});}
test('a factory cannot consume another city’s warehouse or invented physical stock location',async()=>{
 const {deserializeV4}=await import('../game/v4/saves.ts');let s=foreignReceiving(prepared());const ids=s.inventory.map(l=>l.id);for(const lotId of ids)s=act(s,{id:'move:'+lotId,type:'ship-lot',lotId,warehouseId:'paris-depot'});for(let i=0;i<2;i++){const r=resolveWeek(s,{tickId:'foreign-arrival:'+i,expectedWeek:s.week});assert.equal(r.ok,true,r.error);s=r.state;}assert.doesNotThrow(()=>serializeV4(s));assert.equal(scheduleProduction({state:s,factoryId:'sf-workshop'},plan(20)).rows[0].goodCases,0);
 s.inventory[0].locationId='nonexistent-place';assert.equal(deserializeV4(JSON.stringify(s)).ok,false);
});
test('process certification belongs to one factory and one recipe revision',()=>{
 const s=prepared();s.factories.push({...structuredClone(s.factories[0]),id:'other-line',equipmentSignature:'other:balanced:1'});s.employees.forEach(e=>e.factoryId='other-line');const p=scheduleProduction({state:s,factoryId:'other-line'},{factoryId:'other-line',items:plan(20).items});assert.equal(p.rows[0].goodCases,0);assert.ok(p.constraints.some(c=>c.includes('certified process')));
 const missing=prepared();missing.processProfiles=missing.processProfiles.filter(p=>p.recipeRevisionId!=='velvet-milk:r1');const other=scheduleProduction({state:missing,factoryId:'sf-workshop'},{factoryId:'sf-workshop',items:[{recipeRevisionId:'velvet-milk:r1',cases:10}]});assert.equal(other.rows[0].goodCases,0);
});
test('production outlook includes due arrivals and training using the same opening boundary as the close',async()=>{
 const {previewProduction}=await import('../game/v4/production.ts');let s=prepared();s=act(s,{id:'broker',type:'discover-supplier',supplierId:'bay-import'});
 // Move current eligible ingredients out of the supplying city; the due broker
 // shipment is the physical source needed by the planned opening boundary.
 s=foreignReceiving(s);for(const lotId of s.inventory.filter(l=>l.varietyId==='cocoa-ecuador').map(l=>l.id))s=act(s,{id:'relocate:'+lotId,type:'ship-lot',lotId,warehouseId:'paris-depot'});
 s.cashCents+=100000;s.events.push({id:'arrival-equity',origin:'action',week:s.week,type:'equity',signature:'arrival-fixture',entityIds:['house'],details:{}});s.ledger.push({id:'arrival-equity',eventId:'arrival-equity',week:s.week,description:'Arrival boundary scenario funding',postings:[{account:'cash',debitCents:100000,creditCents:0},{account:'equity',debitCents:0,creditCents:100000}]});
 s=act(s,{id:'incoming',type:'purchase',request:{supplierId:'bay-import',varietyId:'cocoa-ecuador',quantityGrams:50000,grade:'standard',warehouseId:'sf-storage'}});const arrival=s.shipments.at(-1).arrivalWeek;
 while(s.week<arrival){const r=resolveWeek(s,{tickId:'pre:'+s.week,expectedWeek:s.week});assert.equal(r.ok,true,r.error);s=r.state;}
 const saved=serializeV4(s),forecast=previewProduction(s,plan(20));assert.ok(forecast.schedule.rows[0].goodCases>0);assert.equal(serializeV4(s),saved);s=act(s,{id:'arrival-plan',type:'production-plan',plan:plan(20)});const r=resolveWeek(s,{tickId:'arrived:'+s.week,expectedWeek:s.week});assert.equal(r.ok,true,r.error);assert.equal(r.state.lastProduction[0].rows[0].goodCases,forecast.schedule.rows[0].goodCases);
});
test('contract-directed manufacturing protects newly produced cases from home retail while awaiting freight',()=>{let s=prepared();s=act(s,{id:'freight-promise',type:'accept-order',orderId:'ferry'});s.contracts.find(c=>c.id==='ferry').cityId='paris';s=act(s,{id:'promised-plan',type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:40,contractId:'ferry'}]}});const r=resolveWeek(s,{tickId:'reserved-output',expectedWeek:s.week});assert.equal(r.ok,true,r.error);const lot=r.state.inventory.find(l=>l.kind==='finished'&&l.recipeRevisionId==='embar62:r1');assert.equal(lot.reservations[0].contractId,'ferry');assert.equal(lot.reservations[0].quantity,35);assert.ok(r.state.lastSales.retail.find(o=>o.recipeRevisionId==='embar62:r1').soldCases<=5);});
test('ingredient grams reserved for a buyer cannot masquerade as finished cases already promised',()=>{let s=prepared();s=act(s,{id:'gram-promise',type:'accept-order',orderId:'ferry'});s.contracts.find(c=>c.id==='ferry').cityId='paris';const cocoa=s.inventory.find(l=>l.varietyId==='cocoa-ecuador');s=act(s,{id:'hold-input',type:'reserve-lot',lotId:cocoa.id,contractId:'ferry',quantity:35000});s=act(s,{id:'gram-plan',type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:20,contractId:'ferry'}]}});const r=resolveWeek(s,{tickId:'grams-not-cases',expectedWeek:s.week});assert.equal(r.ok,true,r.error);const finished=r.state.inventory.find(l=>l.kind==='finished');assert.equal(finished.reservations[0]?.quantity,finished.quantity);assert.equal(r.state.lastSales.retail.find(o=>o.recipeRevisionId==='embar62:r1').soldCases,0);});
