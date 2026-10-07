import type {V4State,FactoryPlanItem} from './model.ts';
/** Reopening a saved plan is lossless, including split packs and buyer allocations. */
export function initialProductionItems(s:V4State,factoryId:string):FactoryPlanItem[]{const f=s.factories.find(f=>f.id===factoryId);if(!f)return[];if(f.plan.length||s.events.some(e=>e.type==='production-plan'&&e.entityIds.includes(f.id)))return structuredClone(f.plan);return f.cityId==='sf'?s.recipeRevisions.filter(r=>r.released&&['embar62:r1','velvet-milk:r1'].includes(r.id)).map(r=>({recipeRevisionId:r.id,cases:r.id==='embar62:r1'?40:20})):[];}
