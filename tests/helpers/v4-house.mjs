import assert from 'node:assert/strict';
import {newV4} from '../../game/v4/saves.ts';
import {applyCommand} from '../../game/v4/commands.ts';
export const action=(state,command)=>{const result=applyCommand(state,command);assert.equal(result.ok,true,result.error);return result.state;};
export function preparedHouse(){
 let s=newV4({founder:'QA',business:'Test House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'});s=action(s,{id:'line',type:'select-equipment',package:'balanced'});
 for(const employeeId of ['sam','mira'])s=action(s,{id:'hire-'+employeeId,type:'hire',employeeId,factoryId:'sf-workshop'});
 for(const recipeRevisionId of ['embar62:r1','velvet-milk:r1'])s=action(s,{id:'trial-'+recipeRevisionId,type:'commission',factoryId:'sf-workshop',recipeRevisionId,mode:'assisted',controls:[.7,.7,.7]});
 for(const [varietyId,quantityGrams]of [['cocoa-ecuador',70000],['sugar-refined',60000],['milk-powder',20000]])s=action(s,{id:'stock-'+varietyId,type:'purchase',request:{supplierId:'rafi',varietyId,quantityGrams,grade:'standard',warehouseId:'sf-storage'}});s=action(s,{id:'wrappers',type:'purchase-packaging',request:{supplierId:'rafi',packagingId:'ordinary-wrap',quantityUnits:4000,warehouseId:'sf-storage'}});return s;
}
