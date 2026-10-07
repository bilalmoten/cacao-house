import{compactSave,expandSave}from'./save-codec.ts';
import {welcomeUpdate} from './updates.ts';
import {V4_CONTENT_VERSION,V4_SCHEMA_VERSION,type BrandIdentity,type SaveLoadResult,type SlotStorage,type V4State} from './model.ts';
import {catalog} from './catalog.ts';
import {checkLedger,starterLoan} from './finance.ts';
import {validateEconomicState} from './validation.ts';
export const LEGACY_KEY = 'cacao-house-save-v2';
const MAX_IMPORT_BYTES = 16 * 1024 * 1024;
const failure = (error:string):SaveLoadResult => ({ok:false,error});
const object = (value:unknown):value is Record<string,unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const uint = (value:unknown):value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
export function slotKey(id:string):string {
  if(!/^[a-zA-Z0-9_-]{1,64}$/.test(id))throw Error('Invalid V4 slot name.');
  return `cacao-house-v4-slot:${id}`;
}
function validate(value:unknown):SaveLoadResult {
  if(!object(value))return failure('This is not a V4 save.');
  if(value.schemaVersion !== V4_SCHEMA_VERSION)return failure('Unsupported save version. The current house is unchanged.');
  if(value.contentVersion !== V4_CONTENT_VERSION)return failure('Unsupported V4 content version.');
  if(!uint(value.week) || value.week < 1)return failure('Invalid campaign chronology.');
  if(!object(value.random) || !uint(value.random.seed) || value.random.seed > 0xffffffff || !uint(value.random.cursor))return failure('Invalid random state.');
  const identity=value.identity;
  if(!object(identity) || !['founder','business','emblem'].every(key=>typeof identity[key]==='string' && (identity[key] as string).trim().length>0 && (identity[key] as string).length<=80) || !['primary','accent'].every(key=>typeof identity[key]==='string' && /^#[0-9a-f]{6}$/i.test(identity[key] as string)))return failure('Invalid brand identity.');
  const collections=['updates','ledger','events','loans','inventory','factories','employees','contracts','receivables','snapshots','knownSuppliers','completedTicks','warehouses','shipments','visitedCities','recipeRevisions','processProfiles','engineeringJobs','training','lastProduction','unpaidObligations','salesHistory','knownRecipeBriefs','researchProjects'];
  if(collections.some(key=>!Array.isArray(value[key]))||!object(value.campaign))return failure('V4 campaign data is incomplete.');
  const state=value as unknown as V4State;
  if(validateEconomicState(state).length)return failure('V4 economic state or financial history is invalid.');
  return {ok:true,state:structuredClone(state)};
}
export function newV4(identity:BrandIdentity,seed=42):V4State {
  const events=[{id:'founding-equity',origin:'action' as const,week:1,type:'founding-equity',signature:'founding-equity',entityIds:['house'],details:{publishedUpdates:JSON.stringify([welcomeUpdate()])}},{id:'starter-finance',origin:'action' as const,week:1,type:'starter-finance',signature:'standard',entityIds:['starter'],details:{}}];
  const result=validate({schemaVersion:V4_SCHEMA_VERSION,contentVersion:V4_CONTENT_VERSION,week:1,random:{seed,cursor:0},identity,brandVersion:1,guide:{mode:'guided'},updates:[welcomeUpdate()],
    cashCents:600000,weekOpeningCashCents:600000,weekLedgerStartIndex:2,events,ledger:[{id:'founding-equity',eventId:'founding-equity',week:1,description:'Founder equity',postings:[{account:'cash',debitCents:300000,creditCents:0},{account:'equity',debitCents:0,creditCents:300000}]},{id:'starter-finance',eventId:'starter-finance',week:1,description:'Standard 52-week starter financing',postings:[{account:'cash',debitCents:300000,creditCents:0},{account:'loan-principal',debitCents:0,creditCents:300000}]}],
    loans:[starterLoan()],inventory:[],factories:[],employees:[],contracts:[],receivables:[],snapshots:[],campaign:{stage:1,chapter:0,flags:{},completedChapters:[],status:'playing'},knownSuppliers:['rafi'],completedTicks:[],reserveCents:0,currentCityId:'sf',visitedCities:['sf'],warehouses:[{id:'sf-storage',cityId:'sf',capacityMilliliters:{dry:400000,controlled:200000,cold:0},upgrades:[],arrivalPolicy:'delay',overflowBudgetCents:0}],shipments:[],recipeRevisions:catalog.recipes.filter(r=>r.stage===1).map(r=>({id:r.id+':r1',recipeId:r.id,version:1,formula:Object.fromEntries(r.roles.map(role=>[role.role,role.allowedVarietyIds[0]])),released:false,shelfWeeks:r.shelfWeeks,packagingId:'ordinary-wrap',producedCases:0})),processProfiles:[],engineeringJobs:[],training:[],lastProduction:[],unpaidObligations:[],directAssortment:['embar62:r1','velvet-milk:r1'],prices:{},marketMemory:{},brandTrust:.5,serviceTrust:.8,brandAwareness:.65,lastSales:null,salesHistory:[],knownRecipeBriefs:['embar62','velvet-milk'],researchProjects:[]});
  if(!result.ok)throw Error(result.error);
  return result.state;
}
export function validateV4State(state:unknown):SaveLoadResult{return validate(state);}
export function serializeV4(state:V4State,options:{compact?:boolean}={}):string {
  const result=validate(state);
  if(!result.ok)throw Error(result.error);
  const raw=JSON.stringify(result.state);return options.compact||raw.length>12*1024*1024?compactSave(raw):raw;
}
export function deserializeV4(raw:string):SaveLoadResult {
  if(typeof raw!=='string' || raw.length>MAX_IMPORT_BYTES || new TextEncoder().encode(raw).byteLength>MAX_IMPORT_BYTES)return failure('Save exceeds the supported import size.');
  try{const value:unknown=JSON.parse(raw);return validate(object(value)&&value.kind==='cacao-house-v4-export'?JSON.parse(expandSave(value)):value);}catch{return failure('The save could not be read. The current house is unchanged.');}
}
interface SlotRecord {kind:'cacao-house-v4-slot';current:V4State;checkpoint:V4State|null}
function serializeSlot(record:SlotRecord){const raw=JSON.stringify(record);return raw.length>12*1024*1024?compactSave(raw):raw;}
function readRecord(storage:SlotStorage,id:string):SlotRecord {
  const raw=storage.getItem(slotKey(id));
  if(!raw)throw Error('No V4 house in this slot.');
  if(raw.length>MAX_IMPORT_BYTES*2)throw Error('Saved slot exceeds the supported size.');
  const parsed:unknown=JSON.parse(raw),record:unknown=object(parsed)&&parsed.kind==='cacao-house-v4-export'?JSON.parse(expandSave(parsed)):parsed;
  if(!object(record) || record.kind!=='cacao-house-v4-slot')throw Error('Saved slot is damaged.');
  const current=validate(record.current);
  if(!current.ok)throw Error(current.error);
  const checkpoint=record.checkpoint===null?null:validate(record.checkpoint);
  if(checkpoint && !checkpoint.ok)throw Error('Saved checkpoint is damaged.');
  return {kind:'cacao-house-v4-slot',current:current.state,checkpoint:checkpoint?.state??null};
}
function message(error:unknown):string {return error instanceof Error?error.message:'Save storage unavailable. Export your house before leaving.';}
export function createSlot(storage:SlotStorage,id:string,identity:BrandIdentity,seed=42):SaveLoadResult {
  try{
    const key=slotKey(id);
    if(storage.getItem(key)!==null)return failure('A house already occupies this slot. Choose another slot.');
    const state=newV4(identity,seed);
    storage.setItem(key,serializeSlot({kind:'cacao-house-v4-slot',current:state,checkpoint:null}));
    return {ok:true,state};
  }catch(error){return failure(message(error));}
}
export function importSlot(storage:SlotStorage,id:string,raw:string):SaveLoadResult {
  const result=deserializeV4(raw);
  if(!result.ok)return result;
  try{
    const key=slotKey(id),existing=storage.getItem(key);
    const checkpoint=existing===null?null:readRecord(storage,id).current;
    // Current and previous states change in one storage write. A quota failure
    // cannot leave an active house with a partially updated checkpoint.
    storage.setItem(key,serializeSlot({kind:'cacao-house-v4-slot',current:result.state,checkpoint}));
    return result;
  }catch(error){return failure(message(error));}
}
export function loadSlot(storage:SlotStorage,id:string):SaveLoadResult {
  try{return {ok:true,state:readRecord(storage,id).current};}catch(error){return failure(message(error));}
}
export function restoreSlot(storage:SlotStorage,id:string):SaveLoadResult {
  try{
    const record=readRecord(storage,id);
    if(!record.checkpoint)return failure('There is no earlier checkpoint in this slot.');
    storage.setItem(slotKey(id),serializeSlot({...record,current:record.checkpoint,checkpoint:record.current}));
    return {ok:true,state:record.checkpoint};
  }catch(error){return failure(message(error));}
}
