import {effectiveStationMinutes,equipmentOperatingCosts,prepareEquipmentOperations} from './maintenance.ts';
import {simulationCopy} from './simulation-copy.ts';
import {processEquipmentSignature} from './equipment.ts';
import {defaultLayout,handoffMinutesPerCase,inspectLayout} from './layout.ts';
import type {ProductionContext,FactoryPlan,ProductionSchedule,StationId,ConsumedInput,InventoryLot,ProductionRow,V4State,DomainEvent} from './model.ts';
import {packagingFamilies} from './content/packaging.ts';
import {regionForCity} from './content/regions.ts';
import {prepareOpening} from './opening.ts';
import {catalog} from './catalog.ts';
import {availableLaborMinutes,teamCompetency,operatorTeam} from './people.ts';
import {standardCycleMinutes} from './process.ts';
import {evaluateBatch} from './quality.ts';
import {post,debit,credit} from './finance.ts';
import {protectedCash} from './sourcing.ts';
import {storageOccupancy,volumeMilliliters} from './inventory.ts';
const stationZero=():Record<StationId,number>=>({preparation:0,processing:0,tempering:0,cooling:0,packing:0});
const eligibleQuantity=(lot:InventoryLot,contractId?:string)=>lot.quantity-lot.reservations.filter(r=>r.contractId!==contractId).reduce((n,r)=>n+r.quantity,0);
export function scheduleProduction(context:ProductionContext,plan:FactoryPlan):ProductionSchedule {
  const {state}=context,factory=state.factories.find(f=>f.id===context.factoryId);
  if(!factory||plan.factoryId!==factory.id)throw Error('The production line is unavailable.');
  const localLocations=new Set([factory.id,...state.warehouses.filter(w=>w.cityId===factory.cityId).flatMap(w=>[w.id,'overflow:'+w.id])]);
  const inventory=structuredClone(state.inventory),stationUsedMinutes=stationZero(),laborAvailableMinutes=availableLaborMinutes(state,factory.id),skill=teamCompetency(state,factory.id);
  const rows:ProductionRow[]=[],constraints:string[]=[];let laborUsedMinutes=0,changeoverMinutes=0,previousFamily='',previousPackaging='';
  const operators=operatorTeam(state,factory.id),payroll=operators.reduce((n,e)=>n+e.wageCents+((state.overtimeBookings??[]).find(b=>b.employeeId===e.id&&b.bookedWeek===state.week)?.costCents??0),0),contractMinutes=operators.reduce((n,e)=>n+e.contractedMinutes+((state.overtimeBookings??[]).find(b=>b.employeeId===e.id&&b.bookedWeek===state.week)?.minutes??0),0);
  for(const item of plan.items){
    const revision=state.recipeRevisions.find(r=>r.id===item.recipeRevisionId),recipe=catalog.recipes.find(r=>r.id===revision?.recipeId),profile=state.processProfiles.find(p=>p.factoryId===factory.id&&p.recipeRevisionId===revision?.id&&p.equipmentSignature===processEquipmentSignature(factory,revision!.recipeId));
    const row:ProductionRow={recipeRevisionId:item.recipeRevisionId,packagingId:item.packagingId??revision?.packagingId??'ordinary-wrap',brandVersion:state.brandVersion,plannedCases:item.cases,inputCases:0,goodCases:0,rejectedCases:0,quality:0,flavor:[0,0,0,0],consumed:[],packagingConsumed:[],packagingCents:0,materialCents:0,conversionCents:0,allocatedLaborCents:0,stationMinutes:stationZero(),laborMinutes:0,constraints:[]};rows.push(row);
    if(item.contractId&&!state.contracts.some(c=>c.id===item.contractId&&c.status==='accepted'&&c.fulfilledCases<c.cases)){row.constraints.push('This customer target is complete or closed; use a separate discretionary batch for new stock.');continue;}
    if(!recipe||!revision?.released||!profile||!factory.active||Math.max(factory.readyWeek??1,factory.reactivationReadyWeek??1)>state.week){row.constraints.push('Recipe release or this line’s certified process is missing.');continue;}
    let maximum=item.cases;
    const parts:{role:string;lots:InventoryLot[];grams:number}[]=[];
    for(const role of recipe.roles){
      const varietyId=revision.formula[role.role],lots=inventory.filter(l=>l.kind==='ingredient'&&localLocations.has(l.locationId)&&l.varietyId===varietyId&&!l.locationId.startsWith('transit:')&&l.arrivalWeek<=state.week&&l.expiryWeek>=state.week&&l.quality*l.condition/100>=role.minimumQuality).sort((a,b)=>a.expiryWeek-b.expiryWeek||a.id.localeCompare(b.id));
      const available=lots.reduce((n,l)=>n+eligibleQuantity(l,item.contractId),0),possible=Math.floor(available/role.gramsPerCase);
      if(possible<maximum)row.constraints.push(`ingredient:${varietyId}`);maximum=Math.min(maximum,possible);parts.push({role:role.role,lots,grams:role.gramsPerCase});
    }
    const packFamily=packagingFamilies.find(p=>p.id===row.packagingId),packLots=inventory.filter(l=>l.kind==='packaging'&&l.packagingId===row.packagingId&&l.brandVersion===state.brandVersion&&localLocations.has(l.locationId)&&l.arrivalWeek<=state.week&&l.expiryWeek>=state.week&&l.condition>0).sort((a,b)=>a.expiryWeek-b.expiryWeek||a.id.localeCompare(b.id));
    if(!packFamily||packFamily.stage>state.campaign.stage||!packFamily.compatibleStorageClasses.includes(recipe.storageClass)){row.constraints.push('Incompatible packaging');continue;}
    const packMax=Math.floor(packLots.reduce((n,l)=>n+eligibleQuantity(l,item.contractId),0)/20);if(packMax<maximum)row.constraints.push('packaging stock');maximum=Math.min(maximum,packMax);
    const family=recipe.route+':'+(recipe.roles.some(r=>r.role==='dairy'||r.role==='cream'||r.role==='fat')?'dairy':'no-dairy')+':'+(recipe.roles.some(r=>r.role==='nut')?'nuts':'no-nuts');
    const setup=previousFamily&&family!==previousFamily?[480,300,180,90][factory.changeoverTier]:0;
    const packingSetup=previousPackaging&&previousPackaging!==row.packagingId?[90,60,45,30][factory.changeoverTier]:0;
    const factor=Math.max(.8,profile.cycleMinutes/standardCycleMinutes(recipe.id),.8+Math.max(0,profile.requiredCompetency-skill)/Math.max(1,profile.requiredCompetency)*.35);
    const ingredientCycle=recipe.roles.reduce((n,r)=>n+(catalog.ingredients.find(i=>i.id===revision.formula[r.role])?.cycleFactor??1)*r.qualityWeight,0)/recipe.roles.reduce((n,r)=>n+r.qualityWeight,0);
    const perStation=stationZero();let perLabor=0;
    for(const op of recipe.operations){const calibration=['processing','tempering','cooling'].includes(op.station)?factor*ingredientCycle:1;perStation[op.station]+=op.minutesPerCase*calibration;perLabor+=op.laborMinutesPerCase*calibration;}
    perStation.packing+=packFamily.packingExtraMinutesPerCase;perLabor+=packFamily.packingExtraMinutesPerCase;
    perLabor+=handoffMinutesPerCase(factory.layout??defaultLayout());
    for(const handoff of inspectLayout(factory.layout??defaultLayout()).handoffs)perStation[handoff.to]+=handoff.cells*.05;
    for(const station of Object.keys(perStation) as StationId[]){const setupMinutes=station==='packing'?packingSetup:['preparation','processing'].includes(station)?setup:0;if(perStation[station]){const possible=Math.max(0,Math.floor((effectiveStationMinutes(state,factory,station)-stationUsedMinutes[station]-setupMinutes)/perStation[station]));if(possible<maximum)row.constraints.push(`station:${station}`);maximum=Math.min(maximum,possible);}}
    const laborMax=Math.max(0,Math.floor((laborAvailableMinutes-laborUsedMinutes-setup-packingSetup)/perLabor));if(laborMax<maximum)row.constraints.push('skilled labor');maximum=Math.min(maximum,laborMax);
    const conversionPerCase=state.factoryOperations?.some(o=>o.factoryId===factory.id)?equipmentOperatingCosts(factory,'reactive').energyPerCase:50; // Energy only: physical packaging is capitalized from its landed asset cost.
    const cashAvailable=Math.max(0,state.cashCents-protectedCash(state));
    const alreadyConversion=rows.reduce((n,r)=>n+r.conversionCents,0),cashMax=Math.floor((cashAvailable-alreadyConversion)/conversionPerCase);
    if(cashMax<maximum)row.constraints.push('protected conversion cash');maximum=Math.max(0,Math.min(maximum,cashMax));
    if(maximum<1){if(!row.constraints.length)row.constraints.push('No positive feasible batch.');continue;}
    // Storage may admit a partial batch. Re-evaluate its actual FEFO mix and
    // yield as the quantity shrinks; never consume the cancelled portion.
    const warehouse=state.warehouses.find(w=>w.cityId===factory.cityId);
    if(!warehouse){row.constraints.push('Owned output storage is missing.');continue;}
    const occupied=storageOccupancy({...state,inventory},warehouse.id)[recipe.storageClass];
    let evaluation:ReturnType<typeof evaluateBatch>|undefined,goodCases=0;
    for(;maximum>0;maximum--){
      const batchIngredients:Parameters<typeof evaluateBatch>[0]['ingredients']=[];let freed=0;
      for(const part of parts){let need=maximum*part.grams;for(const lot of part.lots){const quantity=Math.min(need,eligibleQuantity(lot,item.contractId));if(quantity){if(lot.locationId===warehouse.id&&lot.storageClass===recipe.storageClass)freed+=quantity*1000/catalog.ingredients.find(i=>i.id===lot.varietyId)!.gramsPerLiter;batchIngredients.push({role:part.role,varietyId:lot.varietyId!,quality:lot.quality,condition:lot.condition,grams:quantity});need-=quantity;}if(!need)break;}}
      evaluation=evaluateBatch({recipe,profile,teamCompetency:skill,qualitySpecialist:Math.max(0,...state.employees.filter(e=>e.factoryId===factory.id&&e.role==='quality'&&e.departedWeek===undefined&&e.contractedMinutes>=600&&!state.training.some(t=>t.employeeId===e.id)).map(e=>e.skills.quality*(1-e.fatigue/500))),equipmentTier:Math.min(...Object.values(factory.stations).map(s=>s.tier)),ingredients:batchIngredients});
      goodCases=Math.floor(maximum*evaluation.expectedYield);

      if(recipe.storageClass==='dry'){let need=maximum*20;for(const lot of packLots){const take=Math.min(need,eligibleQuantity(lot,item.contractId));if(lot.locationId===warehouse.id)freed+=take*packFamily.unitVolumeMilliliters;need-=take;if(!need)break;}}
      if(goodCases&&occupied-freed+goodCases*packFamily.finishedCaseMilliliters<=warehouse.capacityMilliliters[recipe.storageClass])break;
      if(!row.constraints.includes(`finished-goods ${recipe.storageClass} storage`))row.constraints.push(`finished-goods ${recipe.storageClass} storage`);
    }
    if(maximum<1||!evaluation||!goodCases)continue;
    row.inputCases=maximum;row.goodCases=goodCases;row.rejectedCases=maximum-goodCases;row.quality=evaluation.quality;row.flavor=evaluation.flavor;
    for(const part of parts){let need=maximum*part.grams;for(const lot of part.lots){const quantity=Math.min(need,eligibleQuantity(lot,item.contractId));if(!quantity)continue;const costCents=quantity===lot.quantity?lot.costCents:Math.floor(lot.costCents*quantity/lot.quantity);const used:ConsumedInput={lotId:lot.id,quantity,costCents,quality:lot.quality,varietyId:lot.varietyId!};row.consumed.push(used);row.materialCents+=costCents;lot.quantity-=quantity;lot.costCents-=costCents;let ownTake=quantity;for(const reservation of lot.reservations.filter(r=>r.contractId===item.contractId)){const taken=Math.min(ownTake,reservation.quantity);reservation.quantity-=taken;ownTake-=taken;}lot.reservations=lot.reservations.filter(r=>r.quantity>0);need-=quantity;if(!need)break;}}
    let packsNeeded=maximum*20;for(const lot of packLots){const quantity=Math.min(packsNeeded,eligibleQuantity(lot,item.contractId));if(!quantity)continue;const costCents=quantity===lot.quantity?lot.costCents:Math.floor(lot.costCents*quantity/lot.quantity);row.packagingConsumed.push({lotId:lot.id,quantity,costCents,packagingId:lot.packagingId!,brandVersion:lot.brandVersion!});row.packagingCents+=costCents;lot.quantity-=quantity;lot.costCents-=costCents;let ownTake=quantity;for(const reservation of lot.reservations.filter(r=>r.contractId===item.contractId)){const taken=Math.min(ownTake,reservation.quantity);reservation.quantity-=taken;ownTake-=taken;}lot.reservations=lot.reservations.filter(r=>r.quantity>0);packsNeeded-=quantity;if(!packsNeeded)break;}
    for(const station of Object.keys(perStation) as StationId[]){row.stationMinutes[station]=Math.ceil(perStation[station]*maximum)+(station==='packing'?packingSetup:['preparation','processing'].includes(station)?setup:0);stationUsedMinutes[station]+=row.stationMinutes[station];}
    row.laborMinutes=Math.ceil(perLabor*maximum)+setup+packingSetup;row.allocatedLaborCents=contractMinutes?Math.round(payroll*row.laborMinutes/contractMinutes):0;row.conversionCents=maximum*conversionPerCase;laborUsedMinutes+=row.laborMinutes;changeoverMinutes+=setup+packingSetup;previousFamily=family;previousPackaging=row.packagingId;
    // Placeholder output occupancy uses quantity only; financial posting occurs at commit.
    inventory.push({id:'preview:'+rows.length,kind:'finished',recipeRevisionId:revision.id,factoryId:factory.id,flavor:row.flavor,packagingId:row.packagingId,brandVersion:state.brandVersion,processProfileId:state.processProfiles.find(p=>p.factoryId===factory.id&&p.recipeRevisionId===revision.id&&p.equipmentSignature===processEquipmentSignature(factory,revision!.recipeId))!.id,locationId:warehouse.id,quantity:goodCases,costCents:row.materialCents+row.packagingCents+row.conversionCents,quality:row.quality,condition:100,bornWeek:state.week,arrivalWeek:state.week,expiryWeek:state.week+Math.min(revision.shelfWeeks,packFamily.maximumShelfWeeks)-1,storageClass:recipe.storageClass,reservations:[]});
  }
  for(const row of rows)constraints.push(...row.constraints);
  return {factoryId:factory.id,rows,remainingInventory:inventory.filter(l=>l.quantity>0&&!l.id.startsWith('preview:')),stationUsedMinutes,laborUsedMinutes,laborAvailableMinutes,changeoverMinutes,constraints};
}
export function commitProduction(state:V4State,event:DomainEvent):ProductionSchedule[] {
  const results:ProductionSchedule[]=[];
  for(const factory of state.factories.filter(f=>f.active)){
    const schedule=scheduleProduction({state,factoryId:factory.id},{factoryId:factory.id,items:factory.plan});state.inventory=schedule.remainingInventory;
    for(const [index,row]of schedule.rows.entries())if(row.goodCases){
      const revision=state.recipeRevisions.find(r=>r.id===row.recipeRevisionId)!,recipe=catalog.recipes.find(r=>r.id===revision.recipeId)!,warehouse=state.warehouses.find(w=>w.cityId===factory.cityId)!,lotId=`${event.id}:${factory.id}:${index}`;
      post(state,event,'Raw inputs converted to finished goods',[debit('finished-inventory',row.materialCents,lotId),credit('raw-inventory',row.materialCents)],factory.id+':'+index+':materials',{factoryId:factory.id,regionId:regionForCity(factory.cityId)},'manufacturing-materials');
      post(state,event,'Packaging stock converted to finished goods',[debit('finished-inventory',row.packagingCents,lotId),credit('packaging-inventory',row.packagingCents)],factory.id+':'+index+':packaging',{factoryId:factory.id,regionId:regionForCity(factory.cityId)},'manufacturing-packaging');
      post(state,event,'Manufacturing energy capitalized once',[debit('finished-inventory',row.conversionCents,lotId),credit('cash',row.conversionCents)],factory.id+':'+index+':conversion',{factoryId:factory.id,regionId:regionForCity(factory.cityId)},'manufacturing-conversion');
      const commitment=state.contracts.find(c=>c.id===factory.plan[index]?.contractId&&c.status==='accepted'),alreadyReserved=commitment?state.inventory.filter(l=>l.kind==='finished'&&state.recipeRevisions.find(r=>r.id===l.recipeRevisionId)?.recipeId===commitment.recipeId&&l.quality*l.condition/100>=commitment.minimumQuality&&l.expiryWeek-state.week+1>=(commitment.minimumShelfWeeks??1)&&(!commitment.packagingId||l.packagingId===commitment.packagingId)).reduce((n,l)=>n+l.reservations.filter(r=>r.contractId===commitment.id).reduce((m,r)=>m+r.quantity,0),0):0,reserved=commitment&&revision.recipeId===commitment.recipeId&&row.quality>=commitment.minimumQuality&&Math.min(revision.shelfWeeks,packagingFamilies.find(p=>p.id===row.packagingId)!.maximumShelfWeeks)>=(commitment.minimumShelfWeeks??1)&&(!commitment.packagingId||row.packagingId===commitment.packagingId)?Math.min(row.goodCases,Math.max(0,commitment.cases-commitment.fulfilledCases-alreadyReserved)):0;
      state.inventory.push({id:lotId,kind:'finished',recipeRevisionId:revision.id,factoryId:factory.id,flavor:row.flavor,packagingId:row.packagingId,brandVersion:state.brandVersion,processProfileId:state.processProfiles.find(p=>p.factoryId===factory.id&&p.recipeRevisionId===revision.id&&p.equipmentSignature===processEquipmentSignature(factory,revision!.recipeId))!.id,locationId:warehouse.id,quantity:row.goodCases,costCents:row.materialCents+row.packagingCents+row.conversionCents,quality:row.quality,condition:100,bornWeek:state.week,arrivalWeek:state.week,expiryWeek:state.week+Math.min(revision.shelfWeeks,packagingFamilies.find(p=>p.id===row.packagingId)!.maximumShelfWeeks)-1,storageClass:recipe.storageClass,reservations:reserved&&commitment?[{contractId:commitment.id,quantity:reserved}]:[]});revision.producedCases+=row.goodCases;
    }
    results.push(schedule);
  }
  return results;
}

export function previewProduction(state:V4State,plan:FactoryPlan){
 const draft=simulationCopy(state),event:DomainEvent={id:'preview:production',origin:'tick',week:state.week,type:'weekly-close',signature:'read-only-production',entityIds:[plan.factoryId],details:{}};
 const interruptions=prepareOpening(draft,event);prepareEquipmentOperations(draft,event);
 return {basis:'planned production after due arrivals and training' as const,schedule:scheduleProduction({state:draft,factoryId:plan.factoryId},plan),interruptions};
}
