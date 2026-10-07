import type {PartnerStock,PartnerPurchase,SupplierBusiness} from './model.ts';
import {catalog} from './catalog.ts';
import {packagingFamilies} from './content/packaging.ts';
import {seasonalYield} from './sourcing.ts';
import {supplierRoute} from './supplier-routes.ts';
import {volumeMilliliters} from './inventory.ts';

export interface PartnerProcurementContext {cityId:string;week:number;stage:number;grade:'standard'|'premium';allowedSupplierIds:string[];used:Map<string,number>;minimumQuality?:number;sharedPackagingCapacity?:boolean;cocoaPriceFactor?:number;freightPriceFactor?:number}
/** A partner pays its own real offered ingredients/packs at the same dated
 * prices, grade and route rules. Shared availability includes house orders.
 * This creates no house stock, cash, asset, expense or internal sales revenue. */
export function partnerPurchase(context:PartnerProcurementContext,kind:PartnerStock['kind'],itemId:string,target:number,cash:number,id:string):PartnerPurchase|undefined {
 const ingredient=kind==='ingredient'?catalog.ingredients.find(i=>i.id===itemId):undefined,family=kind==='packaging'?packagingFamilies.find(p=>p.id===itemId):undefined;
 if(!ingredient&&!family||target<1)return;
 const options=catalog.suppliers.filter(s=>context.allowedSupplierIds.includes(s.id)&&s.stage<=context.stage&&(kind==='ingredient'?s.varietyIds.includes(itemId):s.packagingIds?.includes(itemId))).flatMap(s=>quote(context,s,kind,itemId,target,cash,id)??[]).filter(q=>kind!=='ingredient'||q.stock.quality>=(context.minimumQuality??0)).sort((a,b)=>{const ac=(a.goodsCents+a.freightCents)/a.stock.quantity,bc=(b.goodsCents+b.freightCents)/b.stock.quantity;return ac-bc||a.stock.arrivalWeek-b.stock.arrivalWeek||a.stock.supplierId.localeCompare(b.stock.supplierId)});
 return options[0];
}
function quote(c:PartnerProcurementContext,s:SupplierBusiness,kind:PartnerStock['kind'],id:string,target:number,cash:number,stockId:string):PartnerPurchase|undefined {
 const ingredient=kind==='ingredient'?catalog.ingredients.find(i=>i.id===id):undefined,family=kind==='packaging'?packagingFamilies.find(p=>p.id===id):undefined,yieldFactor=ingredient?seasonalYield(ingredient,c.week):1,key=kind+':'+s.id+':'+(kind==='packaging'&&c.sharedPackagingCapacity?'*':id),minimum=ingredient?s.minimumGrams:family!.minimumOrderUnits,maximum=Math.max(0,Math.floor((ingredient?s.baseAvailabilityGrams*yieldFactor:s.packagingAvailabilityUnits??0))-(c.used.get(key)??0));
 let quantity=Math.min(maximum,Math.max(minimum,Math.ceil(target)));if(quantity<minimum)return;
 const calculate=(q:number)=>{const discount=ingredient?s.bulkBands.filter(b=>q>=b.grams).reduce((n,b)=>Math.max(n,b.discount),0):q>=60000?.2:q>=20000?.14:q>=5000?.08:0,volume=ingredient?volumeMilliliters(id,q):q*family!.unitVolumeMilliliters,route=supplierRoute(s,c.cityId,volume,ingredient?.storageClass==='cold'),goodsCents=ingredient?Math.round(q/1000*ingredient.baseCentsPerKg*(ingredient.familyId==='cocoa'?(c.cocoaPriceFactor??1):1)*s.priceFactor*(1.3-.5*(yieldFactor-.5))*(c.grade==='premium'?1.2:1)*(1-discount)):Math.round(q*family!.baseUnitCents*s.priceFactor*(1-discount)),freightCents=Math.round((s.freightCents+route.routeCents+(ingredient?.storageClass==='cold'?Math.round(q/1000*32):0))*(ingredient?(c.freightPriceFactor??1):1));return {goodsCents,freightCents,route};};
 let terms=calculate(quantity);
 // Requote a bounded smaller purchase rather than spend wages or force an
 // infinite search. Availability and bulk bands remain exactly disclosed.
 if(terms.goodsCents+terms.freightCents>cash){const fraction=Math.max(0,(cash-terms.freightCents)/Math.max(1,terms.goodsCents));quantity=Math.min(quantity,Math.floor(quantity*fraction));if(quantity<minimum)return;terms=calculate(quantity);if(terms.goodsCents+terms.freightCents>cash)return;}
 const arrivalWeek=c.week+terms.route.routeWeeks;
 return {goodsCents:terms.goodsCents,freightCents:terms.freightCents,stock:{id:stockId+':'+s.id+':'+kind+':'+id,kind,...(ingredient?{varietyId:id}:{packagingId:id}),quantity,costCents:terms.goodsCents+terms.freightCents,quality:Math.min(100,s.quality+(ingredient&&c.grade==='premium'?8:0)),arrivalWeek,expiryWeek:ingredient?arrivalWeek+ingredient.shelfWeeks-1:c.week+207,supplierId:s.id}};
}
