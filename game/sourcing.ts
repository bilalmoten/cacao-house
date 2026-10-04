import type {State, Ingredient, SupplierId} from './engine';
export interface ManualSource {supplier:SupplierId;ingredient:Ingredient;name:string}
/** On-site purchasing opportunities. Existing replenishment contracts are handled separately. */
export function manualSources(s:State):ManualSource[]{
 const pantry:Ingredient[]=['cocoa','sugar','milk','nuts','citrus',...(s.travel.learned.includes('kyoto-tea')?['tea' as Ingredient]:[])];
 if(!s.v3.enabled)return (['dock','coop','estate'] as SupplierId[]).flatMap(supplier=>pantry.map(ingredient=>({supplier,ingredient,name:supplier==='dock'?'Rafi’s Dock Exchange':supplier==='coop'?'Guayas Cooperative':'Río Cacao Estate'})));
 if(s.travel.trip)return [];
 if(s.travel.location==='sf'||s.travel.location==='oakland')return [...pantry.map(ingredient=>({supplier:'dock' as SupplierId,ingredient,name:'Rafi’s Import Pantry'})),{supplier:'coop',ingredient:'cocoa',name:'Guayas Cooperative · import contract'},{supplier:'estate',ingredient:'cocoa',name:'Río Cacao Estate · import contract'}];
 if(s.travel.location==='guayaquil')return [{supplier:'coop',ingredient:'cocoa',name:'Guayas Cooperative'},{supplier:'estate',ingredient:'cocoa',name:'Río Cacao Estate'}];
 if(s.travel.location==='turin'&&s.travel.learned.includes('turin-sample'))return [{supplier:'dock',ingredient:'nuts',name:'Luca’s Hazelnut Supplier'}];
 if(s.travel.location==='kyoto'&&s.travel.learned.includes('kyoto-tea'))return [{supplier:'dock',ingredient:'tea',name:'Uji Tea Supplier'}];
 return [];
}
export function canSourceManually(s:State,supplier:SupplierId,ingredient:Ingredient){return manualSources(s).some(x=>x.supplier===supplier&&x.ingredient===ingredient)}
