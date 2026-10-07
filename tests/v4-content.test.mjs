import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,validateContent} from '../game/v4/catalog.ts';
import {launchManifest} from '../game/v4/content/launchManifest.ts';

test('launch catalog has exact substantive city, recipe, ingredient, origin and supplier coverage',()=>{
  assert.deepEqual(validateContent(catalog).errors,[]);
  for(const [kind,count] of Object.entries({cities:12,recipes:24,ingredients:37,origins:8,suppliers:24}))assert.equal(catalog[kind].length,count,kind);
  assert.equal(new Set(catalog.recipes.map(r=>r.line)).size,8);
  assert.deepEqual(launchManifest.campaign,{mainChapters:42,regionalCommissions:18,relationshipArcs:6});
});
test('each recipe role has a compatible commercially reachable source before its project unlock',()=>{
  for(const recipe of catalog.recipes)for(const role of recipe.roles){
    assert.ok(role.gramsPerCase>0);
    assert.ok(role.allowedVarietyIds.some(id=>catalog.ingredients.some(i=>i.id===id&&i.stage<=recipe.stage&&i.roles.includes(role.role))&&catalog.suppliers.some(s=>s.stage<=recipe.stage&&s.varietyIds.includes(id))),`${recipe.id}/${role.role}`);
  }
  for(const ingredient of catalog.ingredients){
    assert.ok(catalog.recipes.some(r=>r.roles.some(role=>role.allowedVarietyIds.includes(ingredient.id))),ingredient.id);
    assert.ok(catalog.suppliers.filter(s=>s.varietyIds.includes(ingredient.id)).length>=2,ingredient.id);
  }
  assert.ok(catalog.suppliers.reduce((n,s)=>n+s.varietyIds.length,0)>=74);
});
test('fictional harvests cover the year with distinct origin process and seasonal strategies',()=>{
  assert.ok(new Set(catalog.origins.map(o=>JSON.stringify([o.harvest,o.flavor,o.cycleFactor,o.yieldFactor]))).size===8);
  for(const i of catalog.ingredients)for(const [start,end] of i.harvest){assert.ok(start>=1&&end<=52&&start<=end);}
  const signatures=catalog.suppliers.map(s=>JSON.stringify([s.cityId,s.leadWeeks,s.priceFactor,s.minimumGrams,s.reliability]));
  assert.equal(new Set(signatures).size,24);
});
test('invalid references, premature unlocks and missing mature alternatives fail validation',()=>{
  let broken=structuredClone(catalog);broken.recipes[0].roles[0].allowedVarietyIds=['missing'];assert.ok(validateContent(broken).errors.length);
  broken=structuredClone(catalog);broken.ingredients.find(i=>i.id==='cocoa-ecuador').stage=6;broken.ingredients.find(i=>i.id==='cocoa-ghana').stage=6;assert.ok(validateContent(broken).errors.length);
  broken=structuredClone(catalog);broken.suppliers.forEach(s=>s.varietyIds=s.varietyIds.filter(id=>id!=='pistachio'));assert.ok(validateContent(broken).errors.length);
});
