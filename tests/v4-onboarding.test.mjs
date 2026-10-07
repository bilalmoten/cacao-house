import test from 'node:test';
import assert from 'node:assert/strict';
import {newV4,serializeV4,deserializeV4} from '../game/v4/saves.ts';
import {applyCommand} from '../game/v4/commands.ts';
import {preparedHouse,action} from './helpers/v4-house.mjs';
import {resolveWeek} from '../game/v4/tick.ts';
const fresh=()=>newV4({founder:'B',business:'Harbor Cacao',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'});
test('opening help advances from actual local actions and staffing rather than dismissal',async()=>{
 const {openingGuide}=await import('../game/v4/onboarding.ts');let s=fresh();assert.equal(openingGuide(s).currentStep.id,'inspect');assert.ok(openingGuide(s).currentStep.prompt.includes('Harbor Cacao'));assert.equal(applyCommand(s,{id:'foreign',type:'visit-location',cityId:'paris',locationId:'salon'}).ok,false);
 s=action(s,{id:'inspect',type:'visit-location',cityId:'sf',locationId:'workshop'});assert.equal(openingGuide(s).currentStep.id,'equipment');s=action(s,{id:'line',type:'select-equipment',package:'balanced'});assert.equal(openingGuide(s).currentStep.id,'staff');s=action(s,{id:'sam',type:'hire',employeeId:'sam',factoryId:'sf-workshop'});assert.equal(openingGuide(s).currentStep.id,'staff');s=action(s,{id:'mira',type:'hire',employeeId:'mira',factoryId:'sf-workshop'});assert.equal(openingGuide(s).currentStep.id,'trial');
});
test('explore, pause, resume and replay preserve business requirements and survive reload',async()=>{
 const {openingGuide,visibleSystems}=await import('../game/v4/onboarding.ts');let s=fresh();const baseline={cash:s.cashCents,ledger:s.ledger,recipes:s.recipeRevisions,campaign:s.campaign};for(const mode of ['explore','paused','guided']){s=action(s,{id:'help:'+mode,type:'guide-control',mode});assert.equal(s.guide.mode,mode);assert.deepEqual({cash:s.cashCents,ledger:s.ledger,recipes:s.recipeRevisions,campaign:s.campaign},baseline);}
 s=action(s,{id:'replay',type:'guide-control',mode:'replay',stepId:'staff'});assert.equal(openingGuide(s).focus.id,'staff');const loaded=deserializeV4(serializeV4(s));assert.equal(loaded.ok,true);assert.deepEqual(openingGuide(loaded.state),openingGuide(s));assert.equal(visibleSystems(s).includes('research'),false);assert.equal(visibleSystems(s).includes('franchise'),false);s.campaign.stage=2;assert.equal(visibleSystems(s).includes('research'),true);
});
test('actual commitment preview and a closed weekly finance view complete distinct guide observations',async()=>{
 const {openingGuide}=await import('../game/v4/onboarding.ts');let s=preparedHouse();s=action(s,{id:'plan',type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:20}]}});const query={asOfWeek:1,periodStart:1,periodEnd:1,scopeType:'company',category:'finance'};s=action(s,{id:'early-report',type:'view-report',query});assert.equal(openingGuide(s).steps.find(step=>step.id==='outcome').complete,false);
 s=action(s,{id:'preview',type:'preview-week'});assert.equal(openingGuide(s).steps.find(step=>step.id==='preview').complete,true);const r=resolveWeek(s,{tickId:'week1',expectedWeek:1});assert.equal(r.ok,true,r.error);s=r.state;assert.equal(openingGuide(s).steps.find(step=>step.id==='close').complete,true);assert.equal(openingGuide(s).steps.find(step=>step.id==='outcome').complete,false);s=action(s,{id:'read',type:'view-report',query});assert.equal(openingGuide(s).steps.find(step=>step.id==='outcome').complete,true);assert.doesNotThrow(()=>serializeV4(s));
});

test('advanced houses keep incomplete opening help available without replacing the current story',async()=>{const {openingGuide}=await import('../game/v4/onboarding.ts');let s=fresh();s.campaign.stage=4;const help=openingGuide(s);assert.equal(help.currentStep.id,'inspect');assert.equal(help.showPrompt,false);s=action(s,{id:'advanced-replay',type:'guide-control',mode:'replay',stepId:'outcome'});assert.equal(openingGuide(s).showPrompt,true);assert.equal(openingGuide(s).focus.id,'outcome');});
