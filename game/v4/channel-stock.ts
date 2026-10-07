import type{V4State}from'./model.ts';
/** Unfulfilled online parcels and central partner supply promises reserve real owned cases. */
export function consumerReservedQuantity(s:V4State,lotId:string){return(s.consumerOrders??[]).filter(o=>o.status==='pending').flatMap(o=>o.allocations).filter(a=>a.lotId===lotId).reduce((n,a)=>n+a.quantity,0)+(s.franchiseSupplyOrders??[]).filter(o=>o.status==='pending').flatMap(o=>o.allocations).filter(a=>a.lotId===lotId).reduce((n,a)=>n+a.quantity,0);}
