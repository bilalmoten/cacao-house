import test from 'node:test';
import assert from 'node:assert/strict';
import {newV4,serializeV4} from '../game/v4/saves.ts';
import {applyCommand} from '../game/v4/commands.ts';
import {resolveWeek} from '../game/v4/tick.ts';
import {quotePurchase,supplierEligible} from '../game/v4/sourcing.ts';
import {storageOccupancy,checkInventory} from '../game/v4/inventory.ts';
import {checkLedger,accountBalance} from '../game/v4/finance.ts';
const fresh=()=>newV4({founder:'B',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'});
const apply=(s,c)=>{const r=applyCommand(s,c);assert.equal(r.ok,true,r.error);return r.state;};
const req=(supplierId='rafi',quantityGrams=20000,varietyId='cocoa-ecuador')=>({supplierId,varietyId,quantityGrams,grade:'standard',warehouseId:'sf-storage'});
test('manual and delegated purchases share discoveries, stage eligibility and the exact quote',()=>{
  let s=fresh();assert.equal(supplierEligible(s,'bay-bulk'),false);
  assert.equal(quotePurchase(s,req('bay-bulk')).ok,false);
  s=apply(s,{id:'intro',type:'discover-supplier',supplierId:'bay-bulk'});
  assert.equal(supplierEligible(s,'bay-bulk'),true);assert.equal(supplierEligible(s,'aoi-tea'),false);
  assert.deepEqual(quotePurchase(s,{...req('bay-bulk',20000,'cocoa-ghana'),purpose:'manual'}),quotePurchase(s,{...req('bay-bulk',20000,'cocoa-ghana'),purpose:'delegated'}));
});
test('receiving-space changes execute disclosed overflow, delay and rejection without lost ledger value',()=>{
  for(const policy of ['overflow','delay','reject']){
    let s=apply(fresh(),{id:'intro',type:'discover-supplier',supplierId:'bay-bulk'});
    s=apply(s,{id:'stock',type:'purchase',request:req('bay-bulk',20000,'milk-powder')});
    s=apply(s,{id:'policy',type:'arrival-policy',warehouseId:'sf-storage',policy,budgetCents:20000});
    s.warehouses[0].capacityMilliliters.dry=0; // controlled test of a later capacity disruption
    s=resolveWeek(s,{tickId:'w1',expectedWeek:1}).state;
    const r=resolveWeek(s,{tickId:'w2',expectedWeek:2});assert.equal(r.ok,true);s=r.state;
    assert.deepEqual(checkInventory(s),[]);assert.deepEqual(checkLedger(s),[]);assert.ok(r.interruptions.length);
    if(policy==='overflow'){assert.equal(s.shipments[0].status,'arrived');assert.match(s.inventory[0].locationId,/^overflow:/);}
    if(policy==='delay'){assert.equal(s.shipments[0].status,'delayed');assert.equal(s.shipments[0].arrivalWeek,3);assert.equal(s.inventory[0].condition,98);}
    if(policy==='reject'){assert.equal(s.shipments[0].status,'rejected');assert.equal(s.inventory.length,0);assert.equal(accountBalance(s,'raw-inventory'),0);assert.ok(accountBalance(s,'shipping')>0);}
  }
});
test('a delayed lot expiring on the receiving boundary cannot become a broken future shipment',()=>{
  let s=apply(fresh(),{id:'intro',type:'discover-supplier',supplierId:'bay-bulk'});
  s=apply(s,{id:'stock',type:'purchase',request:req('bay-bulk',20000,'milk-powder')});
  s.inventory[0].expiryWeek=2;s.warehouses[0].capacityMilliliters.dry=0;
  for(let w=1;w<=3;w++){const r=resolveWeek(s,{tickId:'w'+w,expectedWeek:w});assert.equal(r.ok,true,r.error);s=r.state;}
  assert.equal(s.shipments[0].status,'expired');assert.equal(s.inventory.length,0);assert.deepEqual(checkInventory(s),[]);
});
test('lot reservations cannot exceed physical stock and protected lots cannot be transferred',()=>{
  let s=apply(fresh(),{id:'order',type:'accept-order',orderId:'ferry'});
  s=apply(s,{id:'stock',type:'purchase',request:req()});
  const lot=s.inventory[0];
  s=apply(s,{id:'reserve-stock',type:'reserve-lot',lotId:lot.id,contractId:'ferry',quantity:10000});
  assert.equal(s.inventory[0].reservations[0].quantity,10000);
  const before=serializeV4(s);
  for(const c of [{id:'excess',type:'reserve-lot',lotId:lot.id,contractId:'ferry',quantity:11000},{id:'move',type:'transfer-lot',lotId:lot.id,toLocationId:'sf-storage'}]){assert.equal(applyCommand(s,c).ok,false);assert.equal(serializeV4(s),before);}
});
test('real capacity permits 501 kilograms after paid expansion; finite availability still binds',()=>{
  let s=fresh();s=apply(s,{id:'intro',type:'discover-supplier',supplierId:'bay-bulk'});
  assert.equal(quotePurchase(s,req('bay-bulk',501000,'cocoa-ghana')).ok,false);
  s=apply(s,{id:'shelves',type:'expand-storage',warehouseId:'sf-storage',storageClass:'controlled'});
  for(let n=0;n<2;n++){const r=resolveWeek(s,{tickId:'w'+s.week,expectedWeek:s.week});assert.equal(r.ok,true);s=r.state;}
  const large=quotePurchase(s,req('bay-bulk',501000,'cocoa-ghana'));assert.equal(large.ok,true,large.error);
  s=apply(s,{id:'bulk',type:'purchase',request:req('bay-bulk',501000,'cocoa-ghana'),quoteId:large.quote.id});
  assert.ok(s.shipments.length===1);assert.equal(s.inventory[0].quantity,501000);
  assert.deepEqual(checkInventory(s),[]);
  assert.equal(quotePurchase(s,req('rafi',200000)).ok,false);
});
test('stepped volume discounts, landed costs and arrival space are explicit and deterministic',()=>{
  let s=apply(fresh(),{id:'intro',type:'discover-supplier',supplierId:'bay-bulk'});
  const before=serializeV4(s),small=quotePurchase(s,req('bay-bulk',49000,'milk-powder')),large=quotePurchase(s,req('bay-bulk',50000,'milk-powder'));
  assert.equal(small.ok,true);assert.equal(large.ok,true);assert.equal(small.quote.discount,0);assert.equal(large.quote.discount,.04);
  assert.equal(large.quote.totalCents,large.quote.goodsCents+large.quote.freightCents);
  assert.ok(large.quote.storageMilliliters>0);assert.equal(serializeV4(s),before);
});
test('purchases preserve lot quality/cost and cannot consume protected obligation cash',()=>{
  let s=fresh();const q=quotePurchase(s,req());assert.equal(q.ok,true);
  s=apply(s,{id:'stock',type:'purchase',request:req(),quoteId:q.quote.id});
  assert.equal(s.inventory[0].costCents,q.quote.totalCents);assert.equal(s.inventory[0].quality,q.quote.quality);
  assert.equal(s.cashCents,600000-q.quote.totalCents);assert.ok(storageOccupancy(s,'sf-storage').controlled>0);
  const reserved=apply(s,{id:'reserve',type:'set-reserve',cents:s.cashCents});
  const before=serializeV4(reserved),r=applyCommand(reserved,{id:'blocked',type:'purchase',request:req()});assert.equal(r.ok,false);assert.equal(serializeV4(reserved),before);
});
test('incoming freight is unavailable before arrival and weekly expiry writes off acquisition value once',()=>{
  let s=apply(fresh(),{id:'intro',type:'discover-supplier',supplierId:'bay-bulk'});
  s=apply(s,{id:'stock',type:'purchase',request:req('bay-bulk',20000,'milk-powder')});
  assert.match(s.inventory[0].locationId,/^transit:/);
  s=resolveWeek(s,{tickId:'w1',expectedWeek:1}).state;assert.match(s.inventory[0].locationId,/^transit:/);
  s=resolveWeek(s,{tickId:'w2',expectedWeek:2}).state;assert.equal(s.inventory[0].locationId,'sf-storage');
  const expiry=s.inventory[0].expiryWeek;
  while(s.week<=expiry)s=resolveWeek(s,{tickId:'w'+s.week,expectedWeek:s.week}).state;
  assert.equal(s.inventory.length,0);assert.deepEqual(checkInventory(s),[]);
});
