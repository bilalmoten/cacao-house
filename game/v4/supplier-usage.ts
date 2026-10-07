import type {DomainEvent} from './model.ts';

/** Reserved capacity is separate from the spot market shared with operators. */
export function spotSupplierUsage(events:DomainEvent[],week:number,currentRules=true){
 const used=new Map<string,number>();
 for(const e of events.filter(e=>e.week===week&&['purchase','purchase-packaging'].includes(e.type))){
  const raw=e.type==='purchase',id=raw?e.details.varietyId:e.details.packagingId;
  const quantity=currentRules?(raw?Number(e.details.spotQuantityGrams??e.details.quantityGrams):Number(e.details.quantityUnits)-Number(e.details.contractQuantity??0)):Number(raw?e.details.quantityGrams:e.details.quantityUnits);
  const key=(raw?'ingredient':'packaging')+':'+e.details.supplierId+':'+(!raw&&currentRules?'*':id);
  used.set(key,(used.get(key)??0)+quantity);
 }
 return used;
}
