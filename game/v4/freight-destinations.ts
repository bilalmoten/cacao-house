import type {V4State} from './model.ts';
/** A buyer dock is a delivery address, never owned receiving capacity. */
export function freightDestination(s:V4State,id:string){const warehouse=s.warehouses.find(w=>w.id===id);if(warehouse)return {id:warehouse.id,cityId:warehouse.cityId,contract:undefined};const contract=s.contracts.find(c=>'buyer:'+c.id===id);return contract?{id,cityId:contract.cityId,contract}:undefined;}
