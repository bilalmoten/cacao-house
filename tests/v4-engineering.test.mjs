import test from 'node:test';
import assert from 'node:assert/strict';
import {preparedHouse,action} from './helpers/v4-house.mjs';
import {applyCommand} from '../game/v4/commands.ts';
import {resolveWeek} from '../game/v4/tick.ts';
import {serializeV4,deserializeV4} from '../game/v4/saves.ts';
function engineering(){let s=preparedHouse();s.campaign.stage=3;const amount=2000000;s.cashCents+=amount;s.events.push({id:'fixture-engineering',origin:'action',week:1,type:'equity',signature:'fixture',entityIds:['house'],details:{}});s.ledger.push({id:'fixture-engineering',eventId:'fixture-engineering',week:1,description:'Engineering scenario funding',postings:[{account:'cash',debitCents:amount,creditCents:0},{account:'equity',debitCents:0,creditCents:amount}]});return action(s,{id:'elin',type:'hire',employeeId:'elin',factoryId:'sf-workshop'});}
const booking={id:'engineering',type:'engineer-commission',employeeId:'elin',factoryId:'sf-workshop',recipeRevisionId:'embar62:r1'};
test('named expert commissioning is paid, dated, and completes only its assigned factory recipe',()=>{
 let s=engineering();s.processProfiles=[];const cash=s.cashCents;s=action(s,booking);assert.equal(s.cashCents,cash-20000);assert.equal(s.processProfiles.length,0);assert.equal(s.engineeringJobs[0].dueWeek,2);assert.doesNotThrow(()=>serializeV4(s));
 for(let week=1;week<=2;week++){const r=resolveWeek(s,{tickId:'week:'+week,expectedWeek:week});assert.equal(r.ok,true,r.error);s=r.state;assert.doesNotThrow(()=>serializeV4(s));if(week===1)assert.equal(s.processProfiles.length,0);}
 assert.equal(s.processProfiles.length,1);assert.equal(s.processProfiles[0].provenance,'engineer');assert.equal(s.processProfiles[0].recipeRevisionId,'embar62:r1');assert.equal(s.engineeringJobs[0].status,'completed');
});
test('engineering rejects early access, unqualified staff, missing released recipes and duplicate bookings atomically',()=>{
 let s=engineering();s.campaign.stage=2;let before=serializeV4(s);assert.equal(applyCommand(s,booking).ok,false);assert.equal(serializeV4(s),before);s.campaign.stage=3;
 assert.equal(applyCommand(s,{...booking,employeeId:'sam'}).ok,false);assert.equal(applyCommand(s,{...booking,recipeRevisionId:'missing'}).ok,false);s=action(s,booking);before=serializeV4(s);assert.equal(applyCommand(s,{...booking,id:'duplicate'}).ok,false);assert.equal(serializeV4(s),before);
});
test('changed equipment interrupts engineering without certifying a different line and forged fees fail import',()=>{
 let s=action(engineering(),booking);const corrupt=structuredClone(s);corrupt.engineeringJobs[0].feeCents=1;assert.equal(deserializeV4(JSON.stringify(corrupt)).ok,false);s=action(s,{id:'changed-utilities',type:'upgrade-utilities',factoryId:'sf-workshop'});s=action(s,{id:'changed-cooling',type:'upgrade-module',factoryId:'sf-workshop',station:'cooling'});
 for(let week=1;week<=2;week++)s=resolveWeek(s,{tickId:'week:'+week,expectedWeek:week}).state;
 assert.equal(s.engineeringJobs[0].status,'interrupted');assert.equal(s.processProfiles.some(p=>p.equipmentSignature==='changed-line'),false);assert.doesNotThrow(()=>serializeV4(s));
});
test('a paid expert trial retains a superior method and cannot overschedule contracted engineering hours',()=>{
 let s=engineering();s=action(s,{id:'excellent',type:'commission',factoryId:'sf-workshop',recipeRevisionId:'embar62:r1',mode:'assisted',controls:[1,1,1]});s=action(s,booking);for(let week=1;week<=2;week++){const r=resolveWeek(s,{tickId:'week:'+week,expectedWeek:week});assert.equal(r.ok,true,r.error);s=r.state;}
 assert.equal(s.processProfiles.find(p=>p.recipeRevisionId==='embar62:r1').provenance,'assisted');
 s=engineering();s=action(s,{id:'engineer-hours',type:'employment-terms',employeeId:'elin',factoryId:'sf-workshop',minutes:600});s=action(s,booking);const before=serializeV4(s);assert.equal(applyCommand(s,{...booking,id:'second-recipe',recipeRevisionId:'velvet-milk:r1'}).ok,false);assert.equal(serializeV4(s),before);
 s=engineering();s.reserveCents=s.cashCents;assert.equal(applyCommand(s,booking).ok,false);
});
test('installed engineer results require a paid completed dated job, not a forged provenance label or pending booking',async()=>{
 const {commissioningProfile}=await import('../game/v4/process.ts');let s=preparedHouse();s.processProfiles[0]={...commissioningProfile(s,'sf-workshop','embar62:r1','assisted',[1,1,1]),provenance:'engineer'};assert.equal(deserializeV4(JSON.stringify(s)).ok,false);
 s=action(engineering(),booking);s.processProfiles=s.processProfiles.filter(p=>p.id!==s.engineeringJobs[0].profile.id);s.processProfiles.push(structuredClone(s.engineeringJobs[0].profile));assert.equal(deserializeV4(JSON.stringify(s)).ok,false);
});
test('booking identities and earned competence remain bound to the original expert action',async()=>{
 const {commissioningProfile}=await import('../game/v4/process.ts');const s=action(engineering(),booking),wrongPerson=structuredClone(s);wrongPerson.engineeringJobs[0].employeeId='sam';assert.equal(deserializeV4(JSON.stringify(wrongPerson)).ok,false);
 const wrongResult=structuredClone(s);wrongResult.engineeringJobs[0].profile={...commissioningProfile(s,'sf-workshop','embar62:r1','assisted',[1,1,1]),provenance:'engineer'};assert.equal(deserializeV4(JSON.stringify(wrongResult)).ok,false);
});

test('old engineer booking cannot certify a later calibrated upgrade',async()=>{let s=action(engineering(),booking);for(let week=1;week<=2;week++)s=resolveWeek(s,{tickId:'upgrade-week:'+week,expectedWeek:week}).state;s=action(s,{id:'utility-new',type:'upgrade-utilities',factoryId:'sf-workshop'});s=action(s,{id:'cooling-new',type:'upgrade-module',factoryId:'sf-workshop',station:'cooling'});const {processEquipmentSignature}=await import('../game/v4/equipment.ts'),job=s.engineeringJobs[0],signature=processEquipmentSignature(s.factories[0],'embar62');job.equipmentSignature=signature;job.profile.equipmentSignature=signature;job.profile.id=`sf-workshop/embar62:r1/${signature}`;s.events.find(e=>e.id===job.bookingEventId).details.result=JSON.stringify(job.profile);s.processProfiles=s.processProfiles.filter(p=>p.recipeRevisionId!==job.recipeRevisionId);s.processProfiles.push(structuredClone(job.profile));assert.equal(deserializeV4(JSON.stringify(s)).ok,false)});
