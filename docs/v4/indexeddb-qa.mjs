import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire('/tmp/cacao-v4-qa/package.json');const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],timeout:15000});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5174/?v4=save-boundary',{waitUntil:'domcontentloaded',timeout:15000});
 const result=await page.evaluate(async()=>{
  const {IndexedSlots}=await import('/src/v4/persistence.ts');const {serializeV4}=await import('/game/v4/saves.ts');const {resolveWeek}=await import('/game/v4/tick.ts');
  const repository=new IndexedSlots(),identity={founder:'QA',business:'IDB House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'};localStorage.setItem('cacao-house-save-v2','legacy-byte-fixture');
  const created=await repository.create('qa',identity);if(!created.ok)throw Error(created.error);
  const second=resolveWeek(created.state,{tickId:'week1',expectedWeek:1});if(!second.ok)throw Error(second.error);
  const races=await Promise.all([repository.commit('qa',second.state,created.revision,true),repository.commit('qa',second.state,created.revision,true)]);
  const loaded=await repository.load('qa');if(!loaded.ok)throw Error(loaded.error);const before=serializeV4(loaded.state);
  let invalidCommitThrows=false,invalidCommit;try{invalidCommit=await repository.commit('qa',{...loaded.state,cashCents:-1},loaded.revision);}catch{invalidCommitThrows=true;}
  const corrupt=await repository.import('qa','{',loaded.revision),stale=await repository.import('qa',serializeV4(created.state),created.revision),after=await repository.load('qa');
  const restored=await repository.restore('qa',loaded.revision),reopened=new IndexedSlots(),reload=await reopened.load('qa');
  const legacy=localStorage.getItem('cacao-house-save-v2');await repository.close();await reopened.close();
  return {invalidCommitThrows,invalidCommit:invalidCommit?.ok,races:races.map(r=>r.ok),week:loaded.state.week,revision:loaded.revision,corrupt:corrupt.ok,stale:stale.ok,preserved:after.ok&&serializeV4(after.state)===before,restored:restored.ok&&restored.state.week,reloaded:reload.ok&&reload.state.week,legacy};
 });
 assert.equal(result.invalidCommitThrows,false);assert.equal(result.invalidCommit,false);assert.equal(result.races.filter(Boolean).length,1);assert.equal(result.week,2);assert.equal(result.revision,2);assert.equal(result.corrupt,false);assert.equal(result.stale,false);assert.equal(result.preserved,true);assert.equal(result.restored,1);assert.equal(result.reloaded,1);assert.equal(result.legacy,'legacy-byte-fixture');console.log('PASS native IndexedDB: atomic revision race, corrupt/stale imports, checkpoint restore/reopen, legacy bytes unchanged');
}finally{await browser.close();}
