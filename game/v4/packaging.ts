import {supplyCapacity} from './supply-agreements.ts';
import{supplierRoute}from'./supplier-routes.ts';
import type {V4State,PackagingRequest,PackagingQuote,DomainEvent} from './model.ts';
import {supplierEligible,protectedCash} from './sourcing.ts';
import {capacityAt,projectedOccupancy} from './inventory.ts';
import {catalog} from './catalog.ts';
import {post,debit,credit} from './finance.ts';
import {regionForCity} from './content/regions.ts';
import {packagingFamilies} from './content/packaging.ts';
export {packagingFamilies} from './content/packaging.ts';
export function quotePackaging(state:V4State,request:PackagingRequest):{ok:true;quote:PackagingQuote}|{ok:false;error:string}{
 const reject=(error:string)=>({ok:false as const,error}),family=packagingFamilies.find(p=>p.id===request?.packagingId),supplier=catalog.suppliers.find(s=>s.id===request?.supplierId),warehouse=state.warehouses.find(w=>w.id===request?.warehouseId);
 if(!family||family.stage>state.campaign.stage||!supplier||!supplierEligible(state,supplier.id)||!supplier.packagingIds?.includes(family.id))return reject('Discover an eligible supplier offering this packaging family first.');
 if(!warehouse||!Number.isSafeInteger(request.quantityUnits)||request.quantityUnits<family.minimumOrderUnits)return reject(`Order at least ${family.minimumOrderUnits} whole retail packs for an owned warehouse.`);
 const contracted=supplyCapacity(state,{...request,kind:'packaging',itemId:request.packagingId}),contractQuantity=Math.min(request.quantityUnits,contracted?.available??0);
 const committed=state.events.filter(e=>e.week===state.week&&e.type==='purchase-packaging'&&e.details.supplierId===supplier.id).reduce((n,e)=>n+Number(e.details.quantityUnits)-Number(e.details.contractQuantity??0),0),availableUnits=Math.max(0,(supplier.packagingAvailabilityUnits??0)-committed)+(contracted?.available??0);
 if(request.quantityUnits>availableUnits)return reject(`Only ${availableUnits} retail packs remain in this supplier's dated capacity.`);
 const discount=request.quantityUnits>=60000?.2:request.quantityUnits>=20000?.14:request.quantityUnits>=5000?.08:0,goodsCents=Math.round((request.quantityUnits-contractQuantity)*family.baseUnitCents*supplier.priceFactor*(1-discount)+contractQuantity/1000*(contracted?.agreement.unitCentsPerThousand??0)),route=supplierRoute(supplier,warehouse.cityId,request.quantityUnits*family.unitVolumeMilliliters),freightCents=supplier.freightCents+route.routeCents,totalCents=goodsCents+freightCents,arrivalWeek=state.week+route.routeWeeks,storageMilliliters=request.quantityUnits*family.unitVolumeMilliliters;
 if(!Number.isSafeInteger(totalCents)||totalCents<1||!Number.isSafeInteger(storageMilliliters))return reject('This packaging order exceeds supported precision.');
 const occupancy=projectedOccupancy(state,warehouse.id,arrivalWeek),capacity=capacityAt(state,warehouse.id,arrivalWeek);
 if(occupancy.dry+storageMilliliters>capacity.dry)return reject('Insufficient dry receiving space on the promised arrival date.');
 return {ok:true,quote:{...route,...(contracted?{agreementId:contracted.agreement.id,contractQuantity}:{}),id:['packaging',state.week,supplier.id,family.id,request.quantityUnits,warehouse.id,committed,totalCents,capacity.dry,occupancy.dry,state.brandVersion].join(':'),supplierId:supplier.id,packagingId:family.id,quantityUnits:request.quantityUnits,availableUnits,goodsCents,freightCents,totalCents,unitGoodsCents:goodsCents/request.quantityUnits,discount,quality:supplier.quality,arrivalWeek,storageMilliliters,brandVersion:state.brandVersion,drivers:[`${request.quantityUnits/20} gross cases of 20 retail packs`,`Quantity discount ${Math.round(discount*100)}%`,`Dry receiving volume ${storageMilliliters/1000} litres`,`${supplier.name}: ${supplier.leadWeeks} weeks, quality ${supplier.quality}`]}};
}
export function purchasePackaging(state:V4State,request:PackagingRequest,event:DomainEvent,quoteId?:string,overrideReserve=false):void{
 const result=quotePackaging(state,request);if(!result.ok)throw Error(result.error);const q=result.quote;
 if(quoteId&&quoteId!==q.id)throw Error('Packaging terms changed; review the new dated quote.');
 if(q.totalCents>state.cashCents||!overrideReserve&&q.totalCents+protectedCash(state)>state.cashCents)throw Error('Packaging purchase would consume protected operating obligations.');
 const warehouse=state.warehouses.find(w=>w.id===request.warehouseId)!,lotId=event.id+':packaging',shipmentId=event.id+':freight',incoming=q.arrivalWeek>state.week;
 post(state,event,'Packaging stock purchased at landed cost',[debit('packaging-inventory',q.totalCents,lotId),credit('cash',q.totalCents)],'',{regionId:regionForCity(warehouse.cityId)},'packaging-purchase');
 state.inventory.push({id:lotId,kind:'packaging',packagingId:q.packagingId,brandVersion:q.brandVersion,quantity:q.quantityUnits,costCents:q.totalCents,quality:q.quality,condition:100,bornWeek:state.week,arrivalWeek:q.arrivalWeek,expiryWeek:state.week+207,storageClass:'dry',locationId:incoming?'transit:'+shipmentId:warehouse.id,reservations:[]});
 if(incoming)state.shipments.push({id:shipmentId,lotId,warehouseId:warehouse.id,arrivalWeek:q.arrivalWeek,status:'in-transit',supplierId:q.supplierId,promisedWeek:q.arrivalWeek,delayCount:0});
 event.entityIds=[lotId,q.supplierId,warehouse.id];event.details={...(q.agreementId?{agreementId:q.agreementId,contractQuantity:q.contractQuantity!}:{}),routeWeeks:q.routeWeeks,routeCents:q.routeCents,supplierId:q.supplierId,packagingId:q.packagingId,quantityUnits:q.quantityUnits,brandVersion:q.brandVersion,goodsCents:q.goodsCents,freightCents:q.freightCents,arrivalWeek:q.arrivalWeek};
}
