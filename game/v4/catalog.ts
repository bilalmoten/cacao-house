import type {V4Catalog,ContentValidationResult} from './model.ts';
import {ingredients,origins} from './content/ingredients.ts';
import {recipes} from './content/recipes.ts';
import {cities} from './content/cities.ts';
import {suppliers} from './content/suppliers.ts';
import {launchManifest} from './content/launchManifest.ts';
export const catalog:V4Catalog={cities,recipes,ingredients,origins,suppliers};
export function validateContent(value:V4Catalog):ContentValidationResult {
  const errors:string[]=[];
  for(const [kind,count]of Object.entries(launchManifest.catalogCounts)){
    const items=value[kind as keyof V4Catalog];
    if(items.length!==count)errors.push(`${kind}: expected ${count}, found ${items.length}`);
    if(new Set(items.map(i=>i.id)).size!==items.length)errors.push(`${kind}: duplicate ID`);
  }
  const ingredientIds=new Map(value.ingredients.map(i=>[i.id,i]));
  const cityIds=new Map(value.cities.map(i=>[i.id,i]));
  if(new Set(value.ingredients.map(i=>i.familyId)).size!==11)errors.push('Expected 11 ingredient families');
  if(new Set(value.recipes.map(r=>r.line)).size!==8)errors.push('Expected eight product lines');
  for(const i of value.ingredients){
    if(!i.harvest.length||i.harvest.some(([start,end])=>start<1||end>52||start>end||!Number.isInteger(start)||!Number.isInteger(end)))errors.push(`${i.id}: invalid harvest`);
    if(i.originId&&!value.origins.some(o=>o.id===i.originId))errors.push(`${i.id}: missing origin`);
    if(!value.recipes.some(r=>r.roles.some(role=>role.allowedVarietyIds.includes(i.id))))errors.push(`${i.id}: no recipe role`);
    const sources=value.suppliers.filter(s=>s.varietyIds.includes(i.id));
    if(sources.length<2)errors.push(`${i.id}: mature dual sourcing missing`);
    if(!sources.some(s=>s.stage<=i.stage))errors.push(`${i.id}: introduction has no source`);
    if(sources.length>=2&&new Set(sources.map(s=>`${s.priceFactor}/${s.leadWeeks}/${s.minimumGrams}/${s.quality}`)).size<2)errors.push(`${i.id}: suppliers have identical terms`);
  }
  for(const r of value.recipes){
    if(!r.roles.length||!r.operations.length)errors.push(`${r.id}: empty recipe`);
    for(const role of r.roles){
      if(role.gramsPerCase<=0||!Number.isSafeInteger(role.gramsPerCase))errors.push(`${r.id}: invalid input mass`);
      const candidates=role.allowedVarietyIds.map(id=>ingredientIds.get(id));
      if(candidates.some(i=>!i||!i.roles.includes(role.role)))errors.push(`${r.id}: incompatible ${role.role}`);
      if(!candidates.some(i=>i&&i.stage<=r.stage&&value.suppliers.some(s=>s.stage<=r.stage&&s.varietyIds.includes(i.id))))errors.push(`${r.id}: unreachable ${role.role}`);
    }
  }
  for(const s of value.suppliers){
    const city=cityIds.get(s.cityId);
    if(!city)errors.push(`${s.id}: missing city`);
    if(city&&s.stage<city.stage&&!s.remoteIntroduction)errors.push(`${s.id}: inaccessible introduction`);
    if(s.varietyIds.some(id=>!ingredientIds.has(id)))errors.push(`${s.id}: missing ingredient`);
  }
  for(const city of value.cities){
    if(value.suppliers.filter(s=>s.cityId===city.id).length!==2)errors.push(`${city.id}: needs two supplier businesses`);
    if(new Set(city.hotspots).size<4||!city.interior||!city.milestoneChange)errors.push(`${city.id}: incomplete action map`);
  }
  for(const [stage,count]of Object.entries(launchManifest.recipeCountsByStage))if(value.recipes.filter(r=>r.stage<=Number(stage)).length!==count)errors.push(`Stage ${stage}: recipe unlock count mismatch`);
  if(value.suppliers.reduce((n,s)=>n+s.varietyIds.length,0)<74)errors.push('Insufficient sourcing edges');
  return {errors};
}
