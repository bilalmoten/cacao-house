import test from 'node:test';
import assert from 'node:assert/strict';
import {forecastMarket,realizeMarket} from '../game/v4/demand.ts';
const context={cityId:'sf',week:1,seed:42,trust:.5,service:.8,awareness:.65};
const offer=(priceCents=2000)=>({id:'dark',recipeRevisionId:'embar62:r1',priceCents,quality:78,flavor:[8,3,3,1],packagingId:'ordinary-wrap'});
test('identical offers sell less at a higher price, with finite stable no-purchase alternatives',()=>{
 const cheap=realizeMarket(context,[offer(1800)]),dear=realizeMarket(context,[offer(3000)]),extreme=realizeMarket(context,[offer(1000000)]);
 assert.ok(cheap.totalDemand>dear.totalDemand);assert.equal(extreme.totalDemand,0);assert.ok(cheap.totalDemand<=cheap.opportunityCases);assert.ok(cheap.noPurchaseCases>0);
 assert.deepEqual(realizeMarket(context,[offer(1800)]),cheap);
});
test('product duplication cannot multiply a finite competitor-shared demand pool',()=>{
 const a=realizeMarket(context,[offer()]),b=realizeMarket(context,[offer(),{...offer(),id:'duplicate'}]);assert.equal(a.totalDemand,b.totalDemand);
 const two=realizeMarket(context,[offer(),{...offer(),id:'milk',recipeRevisionId:'velvet-milk:r1',flavor:[6,1,2,1]}]);assert.ok(two.offers.find(o=>o.id==='dark').demandCases<a.totalDemand);assert.ok(two.totalDemand<=two.opportunityCases);
});
test('packaging preference differs by segment instead of granting a universal premium bonus',()=>{
 const ordinary=realizeMarket(context,[offer()]),gift=realizeMarket(context,[{...offer(),packagingId:'presentation-box'}]);
 assert.ok(gift.segments.find(s=>s.id==='gifting').ownDemandCases>ordinary.segments.find(s=>s.id==='gifting').ownDemandCases);
 assert.ok(gift.segments.find(s=>s.id==='value').ownDemandCases<ordinary.segments.find(s=>s.id==='value').ownDemandCases);
});
test('preview samples a separate stream, remains stable, and never mutates committed randomness',()=>{
 const before=structuredClone(context),f=forecastMarket(context,[offer()]);assert.deepEqual(context,before);assert.deepEqual(f,forecastMarket(context,[offer()]));assert.ok(f.lowCases<=f.expectedCases&&f.expectedCases<=f.highCases);assert.ok(f.highCases>f.lowCases);assert.equal(f.basis,'sampled demand before stock constraints');
});
test('held-out opening seeds cover sampled ranges and the provisional competent assortment remains competitive',()=>{
 const offers=[offer(),{...offer(2200),id:'milk',recipeRevisionId:'velvet-milk:r1',flavor:[6,1,2,1]}];let covered=0,total=0;
 for(let seed=1;seed<=200;seed++){const c={...context,seed},f=forecastMarket(c,offers),r=realizeMarket(c,offers);covered+=r.totalDemand>=f.lowCases&&r.totalDemand<=f.highCases?1:0;total+=r.totalDemand;}
 assert.ok(covered/200>=.7&&covered/200<=.96,`interval coverage ${covered}/200`);assert.ok(total/200>=50&&total/200<=70,`provisional competent-offer average ${total/200}`);
});
test('raising one equivalent listing price cannot create a new market choice or increase its demand',()=>{
 const first=realizeMarket(context,[offer(),{...offer(),id:'duplicate'}]);const higher=realizeMarket(context,[offer(2001),{...offer(),id:'duplicate'}]);assert.equal(higher.totalDemand,first.totalDemand);assert.ok(higher.offers.find(o=>o.id==='dark').demandCases<=first.offers.find(o=>o.id==='dark').demandCases);
});
