import assert from 'node:assert/strict';
import * as E from '../../../game/engine.ts';
let n=7;const rand=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);const apply=(s,a)=>{let r=E.act(s,a);assert.ok(r.ok,r.message);return r.state};
let successes=0,blocks=0;
for(let k=0;k<500;k++){
 let s=E.newGame('sandbox',k);s.cash=100000;s.book.openingCash=s.cash;s.research=['citrus','praline','origin','truffle'];s.upgrades=['capacity','flexibility'];s.week=17;s.productionPriority.sort(()=>rand()-.5);s.ingredientLots=[];
 for(const i of E.INGREDIENTS){let lots=[];for(const [g,q] of [['standard',54],['select',82],['premium',96]])lots.push({id:i+g,ingredient:i,grade:g,quality:q,qty:5+rand()*40,cost:2+rand()*10});s.ingredientLots.push(...lots);let qty=lots.reduce((a,l)=>a+l.qty,0);s.stock[i]={qty:Math.round(qty*100)/100,cost:Math.round(lots.reduce((a,l)=>a+l.qty*l.cost,0)/qty*100)/100,quality:Math.round(lots.reduce((a,l)=>a+l.qty*l.quality,0)/qty*100)/100};}
 for(const r of E.RECIPES){s.plan[r.id]=Math.floor(rand()*16);s.position[r.id]=['value','balanced','premium'][Math.floor(rand()*3)];for(const i of E.INGREDIENTS)s.ingredientPolicy[r.id][i]={preferred:['any',...E.GRADES][Math.floor(rand()*4)],fallback:['any','lower','none'][Math.floor(rand()*3)]};}
 E.deserialize(E.serialize(s));let f=E.forecast(s),raw=E.serialize(s),r=E.act(s,{type:'advance'});assert.equal(E.serialize(s),raw);if(!r.ok){assert.ok(f.risk.length);blocks++;continue}assert.ok(Math.abs((r.state.cash-f.closing)-(r.state.reports[0].retail-f.sales))<.011);E.deserialize(E.serialize(r.state));successes++;
}
console.log({allocationForecastProbes:500,successes,blocks});
let s=E.newGame('sandbox');for(let week=1;week<=120;week++){let needs=E.needed(s);for(const i of E.INGREDIENTS){let missing=Math.ceil(needs[i]-s.stock[i].qty);if(missing>0)s=apply(s,{type:'buy',supplier:'dock',ingredient:i,qty:missing});}s=apply(s,{type:'advance'});E.deserialize(E.serialize(s));assert.equal(s.status,'playing')};console.log({sandboxWeek:s.week,cash:s.cash,lots:s.ingredientLots.length});
// A valid imported save with a stale serial can collide with an existing lot on the next buy.
s=apply(E.newGame(),{type:'buy',supplier:'dock',ingredient:'cocoa',qty:1});s.serial=0;s=E.deserialize(E.serialize(s));s=apply(s,{type:'buy',supplier:'dock',ingredient:'sugar',qty:1});console.log({acceptedStaleSerialLotIds:s.ingredientLots.map(x=>x.id)});try{E.deserialize(E.serialize(s));console.log('stale serial roundtrip succeeded')}catch(e){console.log('stale serial next save fails',e.message)}
