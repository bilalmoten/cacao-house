import {economicPriceFactor,economicFreightFactor,portfolioFixed}from './global.ts';
import {supplyCapacity,supplyMinimumFixed} from './supply-agreements.ts';
import {teamFixed} from './teams.ts';
import {activeEmployee,retainedSiteFixed} from './site-recovery.ts';
import {machineLeaseFixed} from './machine-orders.ts';
import {maintenanceFixed} from './maintenance.ts';
import {franchiseFixed} from './franchise.ts';
import{consumerFixed}from'./channels.ts';
import {supplierRoute}from'./supplier-routes.ts';
import type {V4State,PurchaseRequest,QuoteResult,IngredientVariety} from './model.ts';
import {catalog} from './catalog.ts';
import {capacityAt,projectedOccupancy,volumeMilliliters} from './inventory.ts';
export function supplierEligible(state:V4State,id:string):boolean {
  const supplier=catalog.suppliers.find(s=>s.id===id);
  return !!supplier&&supplier.stage<=state.campaign.stage&&state.knownSuppliers.includes(id);
}
export function seasonalYield(variety:IngredientVariety,week:number):number {
  const yearWeek=(week-1)%52+1;
  for(const [start,end]of variety.harvest)if(yearWeek>=start&&yearWeek<=end){const progress=(yearWeek-start+.5)/(end-start+1);return .9+.6*Math.sin(Math.PI*progress);}
  return .55;
}
export function protectedCash(state:V4State):number {
  const payroll=state.employees.filter(activeEmployee).reduce((n,e)=>n+e.wageCents,0),rent=state.factories.filter(f=>f.active).reduce((n,f)=>n+f.rentCents,0)+state.warehouses.reduce((n,w)=>n+(w.rentCents??0),0);
  const installments=state.loans.filter(l=>l.status!=='settled').reduce((n,l)=>n+l.installmentCents+l.arrearsCents,0);
  return Math.max(state.reserveCents,portfolioFixed(state).reduce((n,f)=>n+f.amount,0)+supplyMinimumFixed(state).reduce((n,f)=>n+f.amount,0)+teamFixed(state).reduce((n,f)=>n+f.amount,0)+retainedSiteFixed(state).reduce((n,f)=>n+f.amount,0)+machineLeaseFixed(state).reduce((n,f)=>n+f.amount,0)+maintenanceFixed(state).reduce((n,f)=>n+f.amount,0)+franchiseFixed(state).reduce((n,h)=>n+h.rentCents,0)+payroll+rent+installments+consumerFixed(state).reduce((n,c)=>n+c.rentCents+c.staffCents,0)+(state.unpaidObligations??[]).reduce((n,o)=>n+o.cents,0));
}
export function quotePurchase(state:V4State,request:PurchaseRequest):QuoteResult {
  const reject=(error:string):QuoteResult=>({ok:false,error});
  if(!request||!Number.isSafeInteger(request.quantityGrams)||request.quantityGrams<=0||!['standard','premium'].includes(request.grade))return reject('Enter a positive whole-gram quantity and offered grade.');
  const supplier=catalog.suppliers.find(s=>s.id===request.supplierId),variety=catalog.ingredients.find(i=>i.id===request.varietyId),warehouse=state.warehouses.find(w=>w.id===request.warehouseId);
  if(!supplier||!supplierEligible(state,supplier.id)||!variety||variety.stage>state.campaign.stage||!supplier.varietyIds.includes(variety.id))return reject('Discover an eligible supplier offering this ingredient first.');
  if(!warehouse)return reject('Receiving warehouse is unavailable.');
  if(request.quantityGrams<supplier.minimumGrams)return reject(`Minimum order: ${supplier.minimumGrams/1000} kg.`);
  const yieldFactor=seasonalYield(variety,state.week),used=state.events.filter(e=>e.week===state.week&&e.type==='purchase'&&e.details.supplierId===supplier.id&&e.details.varietyId===variety.id).reduce((n,e)=>n+Number(e.details.spotQuantityGrams??e.details.quantityGrams),0);
  const contracted=supplyCapacity(state,{...request,kind:'ingredient',itemId:request.varietyId}),contractQuantity=Math.min(request.quantityGrams,contracted?.available??0),spotQuantityGrams=request.quantityGrams-contractQuantity,availableGrams=Math.max(0,Math.floor(supplier.baseAvailabilityGrams*yieldFactor)-used)+(contracted?.available??0);
  if(request.quantityGrams>availableGrams)return reject(`Only ${availableGrams/1000} kg available for this dated offer. Future deliveries require a separate disclosed commitment.`);
  const discount=supplier.bulkBands.filter(b=>request.quantityGrams>=b.grams).reduce((best,b)=>Math.max(best,b.discount),0);
  const pricePressure=1.3-.5*(yieldFactor-.5),gradeFactor=request.grade==='premium'?1.2:1;
  const goodsCents=Math.round(spotQuantityGrams/1000*variety.baseCentsPerKg*economicPriceFactor(state,variety.familyId)*supplier.priceFactor*pricePressure*gradeFactor*(1-discount)+contractQuantity/1000*(contracted?.agreement.unitCentsPerThousand??0));
  const route=supplierRoute(supplier,warehouse.cityId,volumeMilliliters(variety.id,request.quantityGrams),variety.storageClass==='cold'),freightCents=Math.round((supplier.freightCents+route.routeCents+(variety.storageClass==='cold'?Math.round(request.quantityGrams/1000*32):0))*economicFreightFactor(state)),totalCents=goodsCents+freightCents;
  if(!Number.isSafeInteger(totalCents)||totalCents<1)return reject('This order exceeds supported numeric precision.');
  const arrivalWeek=state.week+route.routeWeeks,storageMilliliters=volumeMilliliters(variety.id,request.quantityGrams);
  const occupancy=projectedOccupancy(state,warehouse.id,arrivalWeek),capacity=capacityAt(state,warehouse.id,arrivalWeek);
  if(occupancy[variety.storageClass]+storageMilliliters>capacity[variety.storageClass])return reject(`Insufficient ${variety.storageClass} space on arrival in week ${arrivalWeek}. Expand storage or change the order.`);
  const id=[state.week,supplier.id,variety.id,request.quantityGrams,request.grade,warehouse.id,used,goodsCents,freightCents,capacity[variety.storageClass],occupancy[variety.storageClass]].join(':');
  return {ok:true,quote:{...route,...(contracted?{agreementId:contracted.agreement.id,contractQuantity,spotQuantityGrams}:{}),id,supplierId:supplier.id,varietyId:variety.id,quantityGrams:request.quantityGrams,availableGrams,discount,goodsCents,freightCents,totalCents,quality:Math.min(100,supplier.quality+(request.grade==='premium'?8:0)),arrivalWeek,storageMilliliters,seasonalYield:yieldFactor,drivers:[...(contracted?[`${contractQuantity/1000}kg reserved capacity at locked contract price;25%minimum-use commitment`]:[]),`Fictional game harvest factor ${yieldFactor.toFixed(2)}`,`Volume discount ${Math.round(discount*100)}%`,`Freight and condition cost ${freightCents} cents`]}};
}
