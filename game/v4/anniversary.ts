import type {V4State} from './model.ts';
import {relationshipArcs} from './relationships.ts';
import {catalog} from './catalog.ts';
import {regionForCity} from './content/regions.ts';

export function anniversaryRegions(s:V4State){
 return [...new Set([
  ...s.factories.filter(f=>f.active).map(f=>f.cityId),
  ...(s.consumerChannels??[]).filter(c=>c.active).map(c=>c.cityId),
  ...(s.franchiseSupportHubs??[]).map(h=>h.cityId),
 ].map(regionForCity).filter((r):r is string=>!!r))];
}
export function anniversaryMemories(s:V4State){
 return relationshipArcs.map(arc=>{
  const decisions=s.events.filter(e=>e.type==='relationship-choice'&&e.entityIds.includes(arc.id)).map(e=>({week:e.week,title:String(e.details.title),choice:String(e.details.choice),scene:String(e.details.scene)}));
  const encounters=s.events.filter(e=>e.type==='review-chapter'&&e.entityIds.includes(arc.cityId)).map(e=>({week:e.week,title:String(e.details.title),scene:String(e.details.scene)}));
  return {id:arc.id,name:arc.name,city:catalog.cities.find(c=>c.id===arc.cityId)!.name,decisions,encounters};
 });
}
