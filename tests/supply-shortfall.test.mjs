import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../game/engine.ts';

test('supply fill uses available inventory, rounds fractional shortages to whole kilograms and leaves saves unchanged',()=>{
 const s=E.newGame(),before=E.serialize(s);
 for(const i of E.INGREDIENTS)assert.equal(E.purchaseShortfall(s,i).quantity,0);
 assert.equal(E.serialize(s),before);
 s.plan.dark=101;s.plan.milk=0;
 assert.deepEqual(E.purchaseShortfall(s,'cocoa'),{required:80.8,allocated:80,missing:.8,quantity:1});
 assert.equal(E.purchaseShortfall(s,'sugar').quantity,0);
 const restored=E.deserialize(E.serialize(s));assert.deepEqual(E.purchaseShortfall(restored,'cocoa'),E.purchaseShortfall(s,'cocoa'));
 s.plan.dark=100;assert.equal(E.purchaseShortfall(s,'cocoa').quantity,0);
});

test('supply fill counts shared inventory once across factory assignments and keeps ingredients independent',()=>{
 const s=E.newGame();s.plan.dark=100;s.plan.milk=100;s.growth.assignment.milk='riverside';
 assert.deepEqual(E.purchaseShortfall(s,'cocoa'),{required:135,allocated:80,missing:55,quantity:55});
 assert.equal(E.purchaseShortfall(s,'sugar').quantity,35);assert.equal(E.purchaseShortfall(s,'milk').quantity,5);assert.equal(E.purchaseShortfall(s,'nuts').quantity,0);
});

test('supply fill respects grade eligibility, excludes undelivered freight and obeys the order limit',()=>{
 const s=E.newGame();s.plan.dark=10;s.plan.milk=0;s.ingredientPolicy.dark.cocoa={preferred:'premium',fallback:'none'};
 assert.equal(E.purchaseShortfall(s,'cocoa').quantity,8);assert.equal(s.stock.cocoa.qty,80);
 s.orders.push({id:'future',ingredient:'cocoa',qty:100,quality:95,supplier:'estate',arrival:3,unitCost:10});
 assert.equal(E.purchaseShortfall(s,'cocoa').quantity,8);
 s.ingredientPolicy.dark.cocoa.fallback='any';assert.equal(E.purchaseShortfall(s,'cocoa').quantity,0);
 s.plan.dark=400;s.research.push('origin');s.plan.origin=400;
 assert.equal(E.purchaseShortfall(s,'cocoa').missing,660);assert.equal(E.purchaseShortfall(s,'cocoa').quantity,500);
});
