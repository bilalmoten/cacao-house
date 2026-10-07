import type {V4State,LedgerScope} from './model.ts';
import {regionCities} from './content/regions.ts';
export const salesChannels=['direct','wholesale','owned-retail','ecommerce','franchise-royalties','partner-supply'];
export function validScope(state:V4State,value:unknown):value is LedgerScope|undefined {
 if(value===undefined)return true;
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const scope=value as Record<string,unknown>;
 return Object.keys(scope).every(k=>['factoryId','regionId','channelId'].includes(k))&&(scope.factoryId===undefined||typeof scope.factoryId==='string'&&state.factories.some(f=>f.id===scope.factoryId))&&(scope.regionId===undefined||typeof scope.regionId==='string'&&Object.hasOwn(regionCities,scope.regionId))&&(scope.channelId===undefined||typeof scope.channelId==='string'&&salesChannels.includes(scope.channelId));
}
