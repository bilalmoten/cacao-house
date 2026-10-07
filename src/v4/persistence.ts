import {applyCommand} from '../../game/v4/commands';
import type {V4State,BrandIdentity} from '../../game/v4/model';
import {newV4,deserializeV4,serializeV4,validateV4State,slotKey} from '../../game/v4/saves';
export type PersistentResult={ok:true;state:V4State;revision:number}|{ok:false;error:string};
interface Record {id:string;kind:'cacao-house-v4-indexed-slot';revision:number;current:V4State;checkpoint:V4State|null}
const fail=(error:string):PersistentResult=>({ok:false,error});
function validated(record:Record|undefined):Record {
 if(!record||record.kind!=='cacao-house-v4-indexed-slot'||!Number.isSafeInteger(record.revision)||record.revision<1)throw Error('This V4 slot is missing or damaged.');
 const current=validateV4State(record.current),checkpoint=record.checkpoint===null?null:validateV4State(record.checkpoint);
 if(!current.ok||checkpoint&&!checkpoint.ok)throw Error('Saved campaign or checkpoint is damaged.');
 return {...record,current:current.state,checkpoint:checkpoint?.state??null};
}
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{
 const request=indexedDB.open('cacao-house-v4',1);
 request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('slots'))request.result.createObjectStore('slots',{keyPath:'id'});};
 request.onsuccess=()=>{request.result.onversionchange=()=>request.result.close();resolve(request.result);};
 request.onerror=()=>reject(request.error??Error('Campaign storage is unavailable.'));
 request.onblocked=()=>reject(Error('Another browser tab is blocking campaign storage. Close it and retry.'));
});}
/** An IndexedDB transaction checks the revision and writes both current and
 * checkpoint together. Independent tabs/imports cannot silently overwrite. */
export class IndexedSlots {
 private database:Promise<IDBDatabase>|null=null;
 private async run(id:string,write:boolean,operation:(record:Record|undefined)=>Record|undefined):Promise<PersistentResult>{
  try{
   slotKey(id);this.database??=open();const db=await this.database;
   return await new Promise<PersistentResult>(resolve=>{
    let result:PersistentResult=fail('Campaign storage transaction did not complete.'),error:string|undefined;
    const transaction=db.transaction('slots',write?'readwrite':'readonly'),store=transaction.objectStore('slots'),request=store.get(id);
    request.onsuccess=()=>{try{const next=operation(request.result as Record|undefined);if(!next)throw Error('No V4 house in this slot.');if(write)store.put(next);result={ok:true,state:structuredClone(next.current),revision:next.revision};}catch(e){error=e instanceof Error?e.message:'Campaign storage is unavailable.';transaction.abort();}};
    request.onerror=()=>{error=request.error?.message;};
    transaction.oncomplete=()=>resolve(result);
    transaction.onabort=()=>resolve(fail(error??transaction.error?.message??'Save failed. Your earlier campaign is unchanged; export before leaving.'));
    transaction.onerror=()=>{error??=transaction.error?.message;};
   });
  }catch(e){this.database=null;return fail(e instanceof Error?e.message:'Campaign storage is unavailable.');}
 }
 load(id:string){return this.run(id,false,record=>{if(!record)throw Error('No V4 house in this slot.');return validated(record);});}
 create(id:string,identity:BrandIdentity,seed=42,financing?:'standard'|'leveraged'){return this.run(id,true,record=>{if(record)throw Error('A V4 house already occupies this slot.');let current=newV4(identity,seed);if(financing){const selected=applyCommand(current,{id:'founder-financing',type:'select-funding',package:financing});if(!selected.ok)throw Error(selected.error);current=selected.state;}serializeV4(current);return {id,kind:'cacao-house-v4-indexed-slot',revision:1,current,checkpoint:null};});}
 async commit(id:string,state:V4State,expectedRevision:number,checkpoint=false):Promise<PersistentResult>{
  // IndexedDB stores structured state. Apply the same complete semantic
  // validator once instead of compressing, decoding and validating again as
  // though this internal atomic write were an external file transfer.
  let parsed:ReturnType<typeof validateV4State>;try{parsed=validateV4State(state);}catch(e){return fail(e instanceof Error?e.message:'Invalid campaign state.');}
  if(!parsed.ok)return fail(parsed.error);
  return this.run(id,true,raw=>{const record=validated(raw);if(record.revision!==expectedRevision)throw Error('This house changed in another tab or action. Reload before saving.');return {...record,revision:record.revision+1,current:parsed.state,checkpoint:checkpoint?record.current:record.checkpoint};});
 }
 import(id:string,raw:string,expectedRevision:number|null):Promise<PersistentResult>{
  const parsed=deserializeV4(raw);if(!parsed.ok)return Promise.resolve(fail(parsed.error));
  return this.run(id,true,existing=>{
   if(existing){const record=validated(existing);if(record.revision!==expectedRevision)throw Error('The active house changed while this import was being read. Reload before importing.');return {...record,revision:record.revision+1,current:parsed.state,checkpoint:record.current};}
   if(expectedRevision!==null)throw Error('The expected campaign slot is missing.');
   return {id,kind:'cacao-house-v4-indexed-slot',revision:1,current:parsed.state,checkpoint:null};
  });
 }
 restore(id:string,expectedRevision:number){return this.run(id,true,raw=>{const record=validated(raw);if(record.revision!==expectedRevision)throw Error('The house changed before restore. Reload and retry.');if(!record.checkpoint)throw Error('There is no earlier campaign checkpoint.');return {...record,revision:record.revision+1,current:record.checkpoint,checkpoint:record.current};});}
 async close(){if(this.database){(await this.database).close();this.database=null;}}
}
