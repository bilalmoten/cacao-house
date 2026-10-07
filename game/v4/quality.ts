import type {FlavorVector,CommercialRecipe,ProcessProfile} from './model.ts';
import {catalog} from './catalog.ts';
export interface BatchInputs {recipe:CommercialRecipe;profile:ProcessProfile;teamCompetency:number;qualitySpecialist?:number;equipmentTier:number;ingredients:{role:string;varietyId:string;quality:number;condition:number;grams:number}[]}
export interface BatchEvaluation {quality:number;flavor:FlavorVector;expectedYield:number;cycleFactor:number;drivers:string[]}
export function evaluateBatch(input:BatchInputs):BatchEvaluation {
  let weightedQuality=0,weight=0,yieldSum=0,cycleSum=0,criticalPenalty=0;
  const flavor:FlavorVector=[0,0,0,0],drivers:string[]=[];
  for(const role of input.recipe.roles){
    const parts=input.ingredients.filter(i=>i.role===role.role),mass=parts.reduce((n,i)=>n+i.grams,0);
    if(!mass)throw Error('Batch ingredient role is missing.');
    let roleQuality=0,roleYield=0,roleCycle=0;
    for(const part of parts){const variety=catalog.ingredients.find(i=>i.id===part.varietyId);if(!variety||!role.allowedVarietyIds.includes(variety.id))throw Error('Incompatible batch ingredient.');
      const proportion=part.grams/mass,q=part.quality*part.condition/100;
      roleQuality+=q*proportion;roleYield+=variety.yieldFactor*proportion;roleCycle+=variety.cycleFactor*proportion;
      for(let k=0;k<4;k++)flavor[k]+=variety.flavor[k]*proportion*role.qualityWeight;
      if(q<role.minimumQuality)criticalPenalty+=Math.min(25,role.minimumQuality-q);
    }
    weightedQuality+=roleQuality*role.qualityWeight;yieldSum+=roleYield*role.qualityWeight;cycleSum+=roleCycle*role.qualityWeight;weight+=role.qualityWeight;
  }
  for(let k=0;k<4;k++)flavor[k]/=weight;
  const processConsistency=Math.min(input.profile.consistency,70+input.teamCompetency*.25,70+input.equipmentTier*10);
  const quality=Math.max(0,Math.min(100,.55*weightedQuality/weight+.35*processConsistency+10-criticalPenalty+Math.min(3,(input.qualitySpecialist??0)*.035)));
  const expectedYield=Math.max(.5,Math.min(.995,input.profile.expectedYield*yieldSum/weight+Math.min(.006,(input.qualitySpecialist??0)*.00007)));
  const cycleFactor=cycleSum/weight;
  if(input.qualitySpecialist)drivers.push(`Paid quality leadership ${input.qualitySpecialist.toFixed(1)}; bounded consistency and rejection improvement`);
  drivers.push(`Input suitability ${(weightedQuality/weight).toFixed(1)}`,`Reproducible process ${processConsistency.toFixed(1)}`,`Expected good yield ${(expectedYield*100).toFixed(1)}%`);
  return {quality,flavor,expectedYield,cycleFactor,drivers};
}
