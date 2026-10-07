import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deserialize as readLegacy} from '../game/engine.ts';
import * as Saves from '../game/v4/saves.ts';
import {resolveWeek} from '../game/v4/tick.ts';

const legacyRaw = readFileSync(new URL('./fixtures/v4/legacy-v6.json', import.meta.url), 'utf8');
const storage = () => {
  const entries = new Map([[Saves.LEGACY_KEY, legacyRaw]]);
  return {getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value)};
};

test('new V4 slot preserves the exact version-6 legacy bytes and semantics', () => {
  const store = storage(), before = readLegacy(legacyRaw);
  const created = Saves.createSlot(store, 'founder', {founder:'Bilal',business:'Cacao House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'}, 81);
  assert.equal(created.ok, true);
  assert.equal(store.getItem(Saves.LEGACY_KEY), legacyRaw);
  assert.deepEqual(readLegacy(store.getItem(Saves.LEGACY_KEY)), before);
  assert.equal(created.state.schemaVersion, 4);
  assert.equal(created.state.random.seed, 81);
  assert.equal(created.state.week, 1);
  assert.equal(Saves.createSlot(store, 'founder', created.state.identity, 22).ok, false);
});

test('corrupt, future and invalid imports leave the active slot unchanged', () => {
  const store = storage();
  const created = Saves.createSlot(store, 'active', {founder:'A',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'}, 42);
  assert.equal(created.ok,true);
  const before = store.getItem(Saves.slotKey('active'));
  for (const raw of ['{', legacyRaw, JSON.stringify({...created.state,schemaVersion:99}), JSON.stringify({...created.state,week:-1}), JSON.stringify({...created.state,random:{seed:42,cursor:NaN}})]) {
    assert.equal(Saves.importSlot(store, 'active', raw).ok, false);
    assert.equal(store.getItem(Saves.slotKey('active')), before);
    assert.equal(store.getItem(Saves.LEGACY_KEY), legacyRaw);
  }
});

test('successful validated imports preserve a restorable previous V4 checkpoint', () => {
  const store = storage();
  const created = Saves.createSlot(store, 'active', {founder:'A',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'}, 42);
  assert.equal(created.ok,true);
  const next = resolveWeek(created.state,{tickId:'week:1',expectedWeek:1}).state;
  assert.equal(Saves.importSlot(store, 'active', Saves.serializeV4(next)).ok, true);
  assert.equal(Saves.loadSlot(store, 'active').state.week, 2);
  assert.equal(Saves.restoreSlot(store, 'active').ok, true);
  assert.deepEqual(Saves.loadSlot(store, 'active').state, created.state);
  assert.equal(store.getItem(Saves.LEGACY_KEY), legacyRaw);
});
test('corrupt loan terms and weekly cash markers cannot replace current or checkpoint bytes',()=>{
  const store=storage();const created=Saves.createSlot(store,'active',{founder:'A',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'},42);
  assert.equal(created.ok,true);
  const next=resolveWeek(created.state,{tickId:'week:1',expectedWeek:1}).state;
  assert.equal(Saves.importSlot(store,'active',Saves.serializeV4(next)).ok,true);
  const before=store.getItem(Saves.slotKey('active'));
  for(const mutate of [s=>s.loans[0].weeklyRateBps=-30,s=>s.weekOpeningCashCents=-1,s=>s.weekLedgerStartIndex=-100,s=>s.weekOpeningCashCents++,s=>s.loans[0].arrearsCents=200,s=>s.campaign.stage=7,s=>s.events.push(s.events[0]),s=>s.snapshots[0].closingCashCents++]){
    const broken=structuredClone(next);mutate(broken);
    assert.equal(Saves.importSlot(store,'active',JSON.stringify(broken)).ok,false);
    assert.equal(store.getItem(Saves.slotKey('active')),before);
  }
});

test('V4 round-trip preserves random state and identity without aliasing input', () => {
  const state = Saves.newV4({founder:'A',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'}, 17);
  const result = Saves.deserializeV4(Saves.serializeV4(state));
  assert.equal(result.ok, true);
  assert.deepEqual(result.state,state);
  result.state.identity.business = 'Changed';
  assert.equal(state.identity.business,'House');
  assert.equal(Saves.deserializeV4(JSON.stringify({...state,contentVersion:'future'})).ok,false);
});

test('legacy key injection and unavailable persistence cannot replace any saved house', () => {
  const store = storage();
  assert.equal(Saves.createSlot(store, '../../cacao-house-save-v2', {founder:'A',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'}, 42).ok,false);
  assert.equal(store.getItem(Saves.LEGACY_KEY),legacyRaw);
  const blocked = {getItem: () => null, setItem: () => {throw Error('QuotaExceededError');}};
  assert.equal(Saves.createSlot(blocked,'active',{founder:'A',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'},42).ok,false);
});

test('lossless compact V4 exports preserve every history field and reject damaged envelopes',()=>{
 const state=Saves.newV4({founder:'A',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'});
 const raw=Saves.serializeV4(state,{compact:true}),envelope=JSON.parse(raw);assert.equal(envelope.encoding,'gzip-base64-v1');assert.ok(raw.length<JSON.stringify(state).length);assert.deepEqual(Saves.deserializeV4(raw),{ok:true,state});
 for(const bad of[{...envelope,encoding:'unknown'},{...envelope,schemaVersion:99},{...envelope,data:'broken'},{...envelope,uncompressedBytes:1},{...envelope,uncompressedBytes:256*1024*1024}])assert.equal(Saves.deserializeV4(JSON.stringify(bad)).ok,false);
 const parsed=Saves.deserializeV4(raw).state;parsed.cashCents++;assert.equal(Saves.deserializeV4(JSON.stringify(parsed)).ok,false);
});

test('large actual current/checkpoint history compresses losslessly and quota failure preserves both houses and legacy bytes',async()=>{
 const {applyCommand}=await import('../game/v4/commands.ts'),source=Saves.deserializeV4(readFileSync(new URL('../docs/v4/consumer-opening-command-save.json',import.meta.url),'utf8'));assert.equal(source.ok,true);const store=storage(),next=applyCommand(source.state,{id:'compact-checkpoint-test',type:'set-reserve',cents:source.state.reserveCents+1});assert.equal(next.ok,true,next.error);assert.ok(JSON.stringify({current:source.state,checkpoint:next.state}).length>12*1024*1024);
 assert.equal(Saves.importSlot(store,'large',Saves.serializeV4(source.state)).ok,true);assert.equal(Saves.importSlot(store,'large',Saves.serializeV4(next.state)).ok,true);const raw=store.getItem(Saves.slotKey('large'));assert.equal(JSON.parse(raw).encoding,'gzip-base64-v1');assert.deepEqual(Saves.loadSlot(store,'large').state,next.state);assert.deepEqual(Saves.restoreSlot(store,'large').state,source.state);assert.deepEqual(Saves.restoreSlot(store,'large').state,next.state);
 const before=store.getItem(Saves.slotKey('large')),blocked={getItem:store.getItem,setItem(){throw Error('Quota exceeded')}};assert.equal(Saves.importSlot(blocked,'large',Saves.serializeV4(source.state)).ok,false);assert.equal(store.getItem(Saves.slotKey('large')),before);assert.equal(store.getItem(Saves.LEGACY_KEY),legacyRaw);
});

test('compact payload checksum changes reject even when the gzip stream and expanded length remain readable',()=>{const state=Saves.newV4({founder:'A',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'}),envelope=JSON.parse(Saves.serializeV4(state,{compact:true})),bytes=Uint8Array.from(atob(envelope.data),c=>c.charCodeAt(0));bytes[bytes.length-8]^=1;envelope.data=btoa(String.fromCharCode(...bytes));assert.equal(Saves.deserializeV4(JSON.stringify(envelope)).ok,false);});
