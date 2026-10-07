import test from 'node:test';
import assert from 'node:assert/strict';
import {newV4,serializeV4,deserializeV4} from '../game/v4/saves.ts';
import {resolveWeek} from '../game/v4/tick.ts';
import {applyCommand} from '../game/v4/commands.ts';
import {preparedHouse} from './helpers/v4-house.mjs';
import {catalog} from '../game/v4/catalog.ts';
import {seasonalYield,quotePurchase} from '../game/v4/sourcing.ts';
test('welcome and first report guidance retain context without accepting an offer or changing balances',async()=>{
 const {updateFeed}=await import('../game/v4/updates.ts');let s=newV4({founder:'B',business:'Harbor Cacao',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'});assert.ok(updateFeed(s)[0].body.includes('Harbor Cacao'));const cash=s.cashCents,r=applyCommand(s,{id:'read',type:'read-update',updateId:'welcome'});assert.equal(r.ok,true,r.error);s=r.state;assert.equal(s.cashCents,cash);assert.equal(s.contracts.length,0);assert.equal(s.updates[0].readWeek,1);s=resolveWeek(s,{tickId:'week1',expectedWeek:1}).state;assert.ok(updateFeed(s).some(u=>u.author==='Nadia'&&u.topic==='first-report'&&u.locationIds.includes('office')));assert.equal(deserializeV4(serializeV4(s)).ok,true);
});
test('announced harvest boundaries lead actual spot-quote changes and retain immutable dates',async()=>{
 const {updateFeed}=await import('../game/v4/updates.ts');let s=preparedHouse();for(let week=1;week<=10;week++){s=resolveWeek(s,{tickId:'week:'+week,expectedWeek:week}).state;assert.doesNotThrow(()=>serializeV4(s));}
 const signal=s.updates.find(u=>u.topic==='harvest'&&u.entityIds.includes('cocoa-ecuador'));assert.ok(signal);assert.equal(signal.effectiveWeek-signal.publishedWeek,3);const variety=catalog.ingredients.find(i=>i.id==='cocoa-ecuador');assert.notEqual(seasonalYield(variety,signal.effectiveWeek),seasonalYield(variety,signal.effectiveWeek-1));const before=structuredClone(s);before.week=signal.effectiveWeek-1;const after=structuredClone(before);after.week++;const request={supplierId:'rafi',varietyId:variety.id,quantityGrams:1000,grade:'standard',warehouseId:'sf-storage'},a=quotePurchase(before,request),b=quotePurchase(after,request);assert.equal(a.ok,true,a.error);assert.equal(b.ok,true,b.error);assert.notEqual(a.quote.totalCents,b.quote.totalCents);const frozen=updateFeed(s).find(u=>u.id===signal.id);s.identity.business='New Name';assert.deepEqual(updateFeed(s).find(u=>u.id===signal.id),frozen);
});
test('news report respects publication dates and read state cannot rewrite or accept news',async()=>{
 const {buildReport}=await import('../game/v4/reports.ts');let s=resolveWeek(preparedHouse(),{tickId:'week1',expectedWeek:1}).state;const query={asOfWeek:2,periodStart:1,periodEnd:2,scopeType:'company',category:'news'},report=buildReport(s,query);assert.ok(report.rows.some(r=>r.topic==='first-report'));assert.equal(buildReport(s,{...query,asOfWeek:1,periodEnd:1}).rows.some(r=>r.topic==='first-report'),false);const corrupt=structuredClone(s);corrupt.updates.find(u=>u.topic==='first-report').sourceEventId='missing';assert.equal(deserializeV4(JSON.stringify(corrupt)).ok,false);assert.equal(applyCommand(s,{id:'unknown',type:'read-update',updateId:'missing'}).ok,false);
});
test('complete published history cannot be deleted from a save while its source evidence remains',()=>{
 let s=resolveWeek(preparedHouse(),{tickId:'week1',expectedWeek:1}).state;s.updates=s.updates.filter(u=>u.topic!=='first-report');assert.equal(deserializeV4(JSON.stringify(s)).ok,false);
});
test('matching duplicated text cannot forge delivered quantities or erase all publication records',async()=>{
 const {action}=await import('./helpers/v4-house.mjs');let s=preparedHouse();s=action(s,{id:'order',type:'accept-order',orderId:'ferry'});s=action(s,{id:'plan',type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:20}]}});s=resolveWeek(s,{tickId:'week1',expectedWeek:1}).state;
 const changed=structuredClone(s),update=changed.updates.find(u=>u.topic==='delivery:ferry');update.body=update.body.replace(/Delivered \d+ cases/,'Delivered 999 cases');const event=changed.events.find(e=>e.id===update.sourceEventId),published=JSON.parse(event.details.publishedUpdates);published.find(u=>u.id===update.id).body=update.body;event.details.publishedUpdates=JSON.stringify(published);assert.equal(deserializeV4(JSON.stringify(changed)).ok,false);
 const missing=structuredClone(s);missing.updates=[];for(const source of missing.events){delete source.details.publishedUpdates;delete source.details.updateContext;}assert.equal(deserializeV4(JSON.stringify(missing)).ok,false);
});
test('regional news includes locally addressed customer and office updates',async()=>{
 const {action}=await import('./helpers/v4-house.mjs');const {buildReport}=await import('../game/v4/reports.ts');let s=preparedHouse();s=action(s,{id:'order',type:'accept-order',orderId:'ferry'});s=action(s,{id:'plan',type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:20}]}});s=resolveWeek(s,{tickId:'week1',expectedWeek:1}).state;assert.ok(buildReport(s,{asOfWeek:2,periodStart:1,periodEnd:2,scopeType:'region',scopeId:'north-america',category:'news'}).rows.some(u=>u.topic==='delivery:ferry'));
});
