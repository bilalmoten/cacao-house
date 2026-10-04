import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../game/engine.ts';
const act=(s,a)=>{const r=E.act(s,a);assert.equal(r.ok,true,r.message);return r.state};
const factory=(overrides={})=>({id:'riverside',ready:1,workers:2,pay:'standard',qualityLead:false,expanded:false,paused:false,...overrides});
function supplied(){let s=E.newGame();s.cash=10000;s=act(s,{type:'buy',supplier:'dock',ingredient:'cocoa',qty:300});s=act(s,{type:'buy',supplier:'dock',ingredient:'sugar',qty:200});s=act(s,{type:'buy',supplier:'dock',ingredient:'milk',qty:100});return s;}

test('Oakland commissioning advances two weeks with saved plans, then staffed production starts',()=>{
 let s=supplied();s.week=12;s.cash=10000;s.travel.location='oakland';s.growth.factories.push(factory({ready:14}));s.growth.assignment.milk='riverside';const plan=structuredClone(s.plan);assert.deepEqual(E.blockers(s),[]);assert.match(E.productionWarnings(s).join(' '),/commissioning until week 14/);
 for(let n=0;n<2;n++){s=act(s,{type:'advance'});assert.equal(s.reports[0].rows.find(r=>r.recipe==='milk').made,0);assert.equal(s.reports[0].rows.find(r=>r.recipe==='dark').made,55);assert.deepEqual(s.plan,plan);assert.match(s.reports[0].notes.join(' '),/commissioning/);}
 assert.equal(s.week,14);s=act(s,{type:'advance'});assert.equal(s.reports[0].rows.find(r=>r.recipe==='milk').made,35);assert.equal(s.growth.assignment.milk,'riverside');assert.deepEqual(E.deserialize(E.serialize(s)),s);
});
test('unstaffed and paused factories consume no stock or wages while another site works',()=>{
 for(const configuration of [{workers:0},{paused:true}]){let s=supplied();s.cash=10000;s.growth.factories.push(factory(configuration));s.growth.assignment.milk='riverside';const milk=s.stock.milk.qty,actual=E.actualProduction(s);assert.equal(actual.plan.milk,0);assert.equal(actual.plan.dark,55);assert.match(actual.warnings.join(' '),configuration.paused?/paused/:/no staffed/);s=act(s,{type:'advance'});assert.equal(s.stock.milk.qty,milk);assert.equal(s.reports[0].labor,154);assert.equal(s.week,2);assert.equal(s.plan.milk,35);}
});
test('overscheduled sites allocate whole cases by saved priority and account for changeovers',()=>{
 let s=supplied();s.plan.dark=70;s.plan.milk=50;let p=E.actualProduction(s);assert.equal(p.plan.dark,70);assert.equal(p.plan.milk,22);assert.equal(E.siteHours({...s,plan:p.plan},E.RECIPES,'quay'),100);assert.match(p.warnings.join(' '),/machine capacity/);
 s.productionPriority=['milk',...s.productionPriority.filter(id=>id!=='milk')];p=E.actualProduction(s);assert.equal(p.plan.milk,50);assert.equal(p.plan.dark,42);
 s.upgrades.push('flexibility');p=E.actualProduction(s);assert.equal(p.plan.milk,50);assert.equal(p.plan.dark,50);
 s.growth.factories.push(factory({workers:1}));s.growth.assignment.milk='riverside';s.plan.milk=90;p=E.actualProduction(s);assert.equal(p.plan.milk,60);assert.equal(p.plan.dark,70);assert.match(p.warnings.join(' '),/staffing capacity/);assert.equal(E.siteHours({...s,plan:p.plan},E.RECIPES,'riverside'),60);
});
test('ingredient-impossible priority batches release capacity for other complete recipes',()=>{
 let s=supplied();s.plan.dark=100;s.plan.milk=100;s.ingredientPolicy.dark.cocoa={preferred:'premium',fallback:'none'};const p=E.actualProduction(s);assert.equal(p.plan.dark,0);assert.equal(p.plan.milk,100);assert.equal(E.siteHours({...s,plan:p.plan},E.RECIPES,'quay'),100);const before=structuredClone(s.ingredientLots);s=act(s,{type:'advance'});assert.equal(s.reports[0].produced,100);for(const original of before){const usage=Object.values(p.products).flatMap(x=>x.usage).filter(x=>x.lotId===original.id).reduce((n,x)=>n+x.qty,0),left=s.ingredientLots.find(x=>x.id===original.id)?.qty||0;assert.ok(Math.abs(original.qty-usage-left)<1e-8);}assert.equal(s.plan.dark,100);assert.equal(s.plan.milk,100);
});
