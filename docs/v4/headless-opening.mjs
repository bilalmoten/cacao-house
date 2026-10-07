import {newV4,serializeV4} from '../../game/v4/saves.ts';
import {applyCommand} from '../../game/v4/commands.ts';
import {resolveWeek} from '../../game/v4/tick.ts';
let s=newV4({founder:'B',business:'Headless test',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'});let i=0;const act=c=>{const r=applyCommand(s,{id:'act'+i++,...c});if(!r.ok)throw Error(r.error);s=r.state;};
act({type:'select-equipment',package:'balanced'});for(const employeeId of ['sam','mira'])act({type:'hire',employeeId,factoryId:'sf-workshop'});for(const recipeRevisionId of ['embar62:r1','velvet-milk:r1'])act({type:'commission',recipeRevisionId,factoryId:'sf-workshop',mode:'assisted',controls:[.8,.8,.8]});
for(const [varietyId,quantityGrams] of [['cocoa-ecuador',70000],['sugar-refined',50000],['milk-powder',20000]])act({type:'purchase',request:{varietyId,quantityGrams,supplierId:'rafi',grade:'standard',warehouseId:'sf-storage'}});
act({type:'accept-order',orderId:'ferry'});
for(let week=1;week<=12;week++){
 const dark=week===1?60:38,milk=week===1?15:35;
 const packCount=s.inventory.filter(l=>l.kind==='packaging'&&l.packagingId==='ordinary-wrap').reduce((n,l)=>n+l.quantity,0);if(packCount<(dark+milk)*20)act({type:'purchase-packaging',request:{supplierId:'rafi',packagingId:'ordinary-wrap',quantityUnits:Math.max(1000,(dark+milk)*20-packCount),warehouseId:'sf-storage'}});
 for(const [varietyId,need] of [['cocoa-ecuador',dark*800+milk*550],['sugar-refined',(dark+milk)*400],['milk-powder',milk*300]]){
 const quantity=s.inventory.filter(l=>l.varietyId===varietyId&&!l.locationId.startsWith('transit')).reduce((n,l)=>n+l.quantity,0);if(quantity<need)act({type:'purchase',request:{varietyId,quantityGrams:Math.max(10000,Math.ceil((need-quantity)/10000)*10000),supplierId:'rafi',grade:'standard',warehouseId:'sf-storage'}});
 }
 act({type:'production-plan',plan:{factoryId:'sf-workshop',items:[{recipeRevisionId:'embar62:r1',cases:dark},{recipeRevisionId:'velvet-milk:r1',cases:milk}]}});
 const r=resolveWeek(s,{tickId:'week'+week,expectedWeek:week});if(!r.ok)throw Error(r.error);s=r.state;serializeV4(s);
 console.log(JSON.stringify({week,cash:s.cashCents,profit:s.snapshots.at(-1).profitCents,good:s.lastProduction[0].rows.map(r=>r.goodCases),retail:s.lastSales.retail.map(r=>r.soldCases),contract:s.contracts[0].status,recovery:s.campaign.status}));
}
