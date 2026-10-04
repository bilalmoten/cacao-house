import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../game/engine.ts';
const apply=(s,a)=>{const r=E.act(s,a);assert.equal(r.ok,true,r.message);return r.state};

test('V3 opening, milestone capabilities, location meetings and loan have no forced deadline',()=>{
 let s=E.newGame();assert.equal(s.version,6);assert.equal(E.capabilities(s).travel,false);s=apply(s,{type:'journey',choice:'begin'});assert.equal(s.v3.chapter,1);assert.equal(E.offers(s).filter(c=>c.client.startsWith('Captain Leda')).length,1);
 s=apply(s,{type:'accept',id:'waterfront'});s=apply(s,{type:'advance'});assert.equal(s.fulfilled,1);s=apply(s,{type:'journey',choice:'reserve'});assert.equal(E.capabilities(s).travel,true);assert.deepEqual(E.availableDestinations(s).map(d=>d.id),['paris']);
 assert.equal(E.act(s,{type:'journey',choice:'craft'}).ok,false);s.week=40;s.plan.dark=0;s.plan.milk=0;s=apply(s,{type:'advance'});assert.equal(s.status,'playing');assert.equal(s.debt,3000);assert.equal(E.pendingLetters(s).length,0);
});
test('finite positive prices have no cap and huge prices produce zero retail demand without nonfinite accounts',()=>{
 for(const price of [0,-1,NaN,Infinity])assert.equal(E.act(E.newGame(),{type:'price',recipe:'dark',price}).ok,false);
 let s=apply(E.newGame(),{type:'price',recipe:'dark',price:Number.MAX_VALUE});s=apply(s,{type:'market-price',id:'quay',multiplier:1.3});assert.equal(E.demand(s,E.RECIPES[0]),0);s=apply(s,{type:'advance'});assert.equal(s.reports[0].rows[0].revenue,0);assert.ok(Number.isFinite(s.cash));assert.deepEqual(E.deserialize(E.serialize(s)),s);
});
test('news has advance warning, bounded live effects and expiry; analyst shows ranges',()=>{
 let s=E.newGame();const news=E.currentNews(s)[0];assert.equal(news.phase,'ahead');assert.equal(news.starts,4);s.week=4;const baseline=structuredClone(s);baseline.v3.enabled=false;assert.ok(E.quote(s,'coop','cocoa')>E.quote(baseline,'coop','cocoa'));assert.equal(E.lead(s,'coop'),3);s.week=7;assert.equal(E.lead(s,'coop'),2);
 assert.equal(E.marketIntel(s).products.length,0);s.v3.chapter=2;s=apply(s,{type:'hire-manager',role:'analyst'});assert.ok(E.marketIntel(s).products.every(p=>p.low<p.high));assert.equal(E.overhead(s),275);assert.equal(E.act(s,{type:'hire-manager',role:'analyst'}).ok,false);
});
test('on-site factory management, saved plans while away, local travel and earned remote manager',()=>{
 let s=E.newGame();s.v3.chapter=6;s.cash=15000;s.reputation=70;s=apply(s,{type:'travel',to:'oakland'});assert.equal(s.travel.trip,null);assert.equal(s.week,1);assert.equal(E.canManageFactory(s,'quay'),false);assert.equal(E.act(s,{type:'plan',recipe:'dark',qty:10}).ok,false);s=apply(s,{type:'factory',id:'riverside'});s=apply(s,{type:'staff',factory:'riverside',workers:2,pay:'standard',qualityLead:false});assert.equal(E.act(s,{type:'hire-manager',role:'operations'}).ok,false);
 s=apply(s,{type:'advance'});assert.equal(s.reports[0].produced,90);s=apply(s,{type:'buy',supplier:'dock',ingredient:'cocoa',qty:100});s=apply(s,{type:'buy',supplier:'dock',ingredient:'sugar',qty:100});s=apply(s,{type:'buy',supplier:'dock',ingredient:'milk',qty:100});s=apply(s,{type:'advance'});s=apply(s,{type:'assign',recipe:'milk',factory:'riverside'});s=apply(s,{type:'buy',supplier:'dock',ingredient:'cocoa',qty:100});s=apply(s,{type:'advance'});s=apply(s,{type:'journey',choice:'reserve'});s=apply(s,{type:'hire-manager',role:'operations'});assert.equal(E.canManageFactory(s,'quay'),true);s=apply(s,{type:'plan',recipe:'dark',qty:10});assert.equal(s.plan.dark,10);assert.deepEqual(E.deserialize(E.serialize(s)),s);
});
test('adverse decisions have bounded costs, story orders can recover, and emergency relief is single use',()=>{
 let s=E.newGame();s.v3.chapter=4;s.travel.location='guayaquil';s.travel.learned=['ecuador-profile'];s=apply(s,{type:'journey',choice:'exchange'});assert.equal(E.currentNews(s).find(n=>n.id==='ines-inspection').phase,'ahead');s.week++;assert.equal(E.lead(s,'coop'),3);s.week+=3;assert.equal(E.currentNews(s).some(n=>n.id==='ines-inspection'),false);
 s.v3.chapter=8;s.research.push('kyoto');s.contracts.push({id:'tea-preview',client:'Preview',recipe:'tea',qty:24,unitPrice:43,minQuality:75,due:s.week-1,delay:1,deposit:.25,reward:6,accepted:true,status:'failed'});assert.ok(E.offers(s).some(c=>c.id.startsWith('tea-preview-retry-')));
 s.cash=-100;s.status='lost';s=apply(s,{type:'recovery',choice:'bridge'});assert.equal(s.cash,1700);assert.equal(s.debt,4980);assert.equal(s.status,'playing');assert.equal(E.act(s,{type:'recovery',choice:'bridge'}).ok,false);
});
test('connected chapter decisions reach a finite Paris ending and preserve the house in sandbox',()=>{
 let s=E.newGame();s.cash=20000;s.fulfilled=1;s.travel.learned=['paris-brief','turin-technique','turin-sample','ecuador-profile','kyoto-tea','kyoto-technique'];
 const fulfilled=id=>({id,client:id,recipe:id==='paris-tasting'?'gianduja':'tea',qty:25,unitPrice:40,minQuality:80,due:1,delay:1,deposit:.25,reward:6,accepted:true,status:'fulfilled'});
 s.contracts=['paris-tasting','tea-preview','house-table'].map(fulfilled);s.growth.factories.push({id:'riverside',ready:1,workers:2,pay:'standard',qualityLead:false,expanded:false,paused:false});s.v3.decisions['oakland-produced']='yes';s.growth.buyers.cafes.delivered=2;s.debt=0;s.markets.push('paris');
 for(const choice of ['begin','growers','craft','patient','direct','independent','training','collaborate','service','table']){const view=E.journeyView(s);s.travel.location=view.place;assert.equal(view.ready,true,view.title);s=apply(s,{type:'journey',choice});}
 assert.equal(s.status,'won');assert.equal(s.v3.chapter,10);assert.equal(s.v3.completed,true);assert.match(s.ending,/Inés, Luca and Aoi/);s=apply(s,{type:'continue'});assert.equal(s.mode,'sandbox');assert.equal(s.growth.chapter,'endless');assert.equal(E.journeyView(s).options.length,0);assert.equal(s.growth.factories.length,2);
});
test('v5 migration preserves travel, assets and rules while native v6 validates journey fields',()=>{
 const old=E.newGame('sandbox',81,'legacy');old.version=5;delete old.v3;old.travel.visited=['paris'];old.travel.learned=['paris-brief'];old.week=12;const migrated=E.deserialize(JSON.stringify({version:5,state:old}));assert.equal(migrated.v3.enabled,false);assert.deepEqual(migrated.travel,old.travel);assert.equal(migrated.cash,old.cash);assert.equal(migrated.version,6);assert.equal(E.canManageFactory(migrated,'quay'),true);
 for(const bad of [null,{...E.defaultJourney(),chapter:99},{...E.defaultJourney(),identity:{founder:4,business:'x',crest:'x'}}]){const broken=E.newGame();broken.v3=bad;assert.throws(()=>E.deserialize(E.serialize(broken)),/Journey data is damaged/);}
});

test('one complete operating journey wins from original cash through real travel, production and settlement',()=>{
let s=E.newGame();
const act=a=>{const r=E.act(s,a);if(!r.ok)throw Error(`W${s.week} ch${s.v3.chapter} $${s.cash}: ${JSON.stringify(a)}: ${r.message}`);s=r.state;};
function advance(){const n=E.needed(s);for(const i of E.INGREDIENTS){const qty=Math.ceil(n[i]-s.stock[i].qty);if(qty>0)act({type:'buy',supplier:'dock',ingredient:i,qty});}act({type:'advance'});if(s.status!=='playing')throw Error(s.ending);}
function travel(to){act({type:'travel',to});while(s.travel.trip)advance();}
function choice(choice){act({type:'journey',choice});}
function plan(values){for(const [recipe,qty]of Object.entries(values))act({type:'plan',recipe,qty});}
function waitMoney(n){let count=0;while(s.cash<n){advance();if(++count>25)throw Error('Unprofitable reserve building');}}
choice('begin');act({type:'accept',id:'waterfront'});advance();choice('growers');
travel('paris');act({type:'visit',id:'paris-brief'});choice('craft');
travel('turin');act({type:'visit',id:'turin-sample'});act({type:'visit',id:'turin-technique'});choice('patient');
travel('guayaquil');act({type:'visit',id:'ecuador-profile'});choice('direct');travel('sf');
act({type:'upgrade',id:'capacity'});act({type:'upgrade',id:'quality'});act({type:'buy',supplier:'estate',ingredient:'cocoa',qty:60});for(let i=0;i<3;i++)advance();
act({type:'buy',supplier:'dock',ingredient:'nuts',qty:40});act({type:'buy',supplier:'dock',ingredient:'sugar',qty:20});act({type:'buy',supplier:'dock',ingredient:'milk',qty:20});act({type:'pilot',recipe:'gianduja',variant:'balanced'});act({type:'policy',recipe:'gianduja',ingredient:'cocoa',preferred:'premium',fallback:'none'});act({type:'accept',id:'paris-tasting'});plan({dark:45,milk:25,gianduja:25});advance();plan({gianduja:0,dark:55,milk:35});choice('independent');
waitMoney(7500);travel('oakland');act({type:'factory',id:'riverside'});act({type:'staff',factory:'riverside',workers:2,pay:'standard',qualityLead:false});advance();advance();act({type:'assign',recipe:'milk',factory:'riverside'});advance();choice('reserve');act({type:'hire-manager',role:'operations'});
travel('kyoto');act({type:'visit',id:'kyoto-tea'});act({type:'visit',id:'kyoto-technique'});choice('collaborate');travel('sf');act({type:'buy',supplier:'dock',ingredient:'cocoa',qty:10});act({type:'buy',supplier:'dock',ingredient:'sugar',qty:10});act({type:'buy',supplier:'dock',ingredient:'milk',qty:10});act({type:'pilot',recipe:'tea',variant:'balanced'});act({type:'buy',supplier:'estate',ingredient:'cocoa',qty:60});for(let i=0;i<3;i++)advance();act({type:'policy',recipe:'tea',ingredient:'cocoa',preferred:'premium',fallback:'none'});act({type:'accept',id:'tea-preview'});plan({dark:45,milk:25,tea:24});act({type:'buyer',id:'cafes',enabled:true,recipe:'dark',terms:'fast'});advance();plan({tea:0,dark:70,milk:25});for(let i=0;i<3;i++)advance();choice('service');
act({type:'buyer',id:'cafes',enabled:false,recipe:'dark',terms:'fast'});waitMoney(s.debt+4000);act({type:'repay',amount:s.debt});act({type:'expand',id:'paris'});act({type:'accept',id:'house-table'});act({type:'buy',supplier:'estate',ingredient:'cocoa',qty:40});for(let i=0;i<3;i++)advance();plan({dark:40,milk:20,tea:35});advance();plan({tea:0,dark:55,milk:35});travel('paris');choice('table');assert.equal(s.status,'won');assert.ok(s.week<=40);assert.equal(s.debt,0);assert.ok(s.cash>2000);assert.deepEqual(E.deserialize(E.serialize(s)),s);
});
