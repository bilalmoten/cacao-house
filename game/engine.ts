/* Cacao House — deterministic economy. One unit of output is a case of 20 bars. */
export const SAVE_VERSION = 3;
export const INGREDIENTS = ['cocoa','sugar','milk','nuts','citrus'] as const;
export type Ingredient = typeof INGREDIENTS[number];
export type RecipeId = 'dark'|'milk'|'orange'|'praline'|'origin'|'truffle';
export type MarketId = 'quay'|'hill'|'rail';
export type UpgradeId = 'capacity'|'efficiency'|'quality'|'flexibility';
export type ResearchId = 'citrus'|'praline'|'origin'|'truffle';
export type SupplierId = 'dock'|'coop'|'estate';
export type Mode = 'campaign'|'sandbox';
export interface Recipe { id:RecipeId; name:string; subtitle:string; segment:string; color:string; ingredients:Partial<Record<Ingredient,number>>; hours:number; labor:number; price:number; demand:number; unlock?:ResearchId; }
export const RECIPES:Recipe[] = [
 {id:'dark',name:'Quayside 62',subtitle:'The everyday dark bar',segment:'Everyday',color:'#bb8559',ingredients:{cocoa:.8,sugar:.4},hours:1,labor:2.8,price:20,demand:57},
 {id:'milk',name:'Velvet Milk',subtitle:'Comfort in a copper wrapper',segment:'Everyday',color:'#d9ab77',ingredients:{cocoa:.55,sugar:.4,milk:.3},hours:1,labor:3.1,price:22,demand:45},
 {id:'orange',name:'Amber Peel',subtitle:'Dark chocolate, candied citrus',segment:'Gifting',color:'#d28b43',ingredients:{cocoa:.7,sugar:.4,citrus:.25},hours:1.25,labor:3.5,price:28,demand:41,unlock:'citrus'},
 {id:'praline',name:'Copper Praline',subtitle:'Roasted hazelnut centre',segment:'Gifting',color:'#c4a46e',ingredients:{cocoa:.55,sugar:.35,nuts:.4,milk:.1},hours:1.6,labor:4.2,price:34,demand:32,unlock:'praline'},
 {id:'origin',name:'Sierra No. 8',subtitle:'A distinctive single-origin dark',segment:'Connoisseur',color:'#8dada3',ingredients:{cocoa:1.05,sugar:.2},hours:1.35,labor:3.8,price:33,demand:34,unlock:'origin'},
 {id:'truffle',name:'Midnight Ganache',subtitle:'Small-batch cream truffles',segment:'Connoisseur',color:'#bda5c3',ingredients:{cocoa:.65,sugar:.25,milk:.6},hours:1.8,labor:5.1,price:38,demand:28,unlock:'truffle'}
];
export const RESEARCH = [
 {id:'citrus' as ResearchId,name:'Citrus development',cost:550,weeks:1,description:'Develop Amber Peel, a higher-margin citrus chocolate for gift buyers.'},
 {id:'praline' as ResearchId,name:'Praline pilot',cost:800,weeks:2,description:'Test a nut centre. Unlock Copper Praline; more margin, more machine time.'},
 {id:'origin' as ResearchId,name:'Origin programme',cost:850,weeks:2,description:'Develop Sierra No. 8. Connoisseurs reward cocoa quality; ordinary beans disappoint them.'},
 {id:'truffle' as ResearchId,name:'Ganache laboratory',cost:1000,weeks:2,description:'Unlock Midnight Ganache. Strong hill demand, short shelf life and a slow process.'}
];
export const UPGRADES = [
 {id:'capacity' as UpgradeId,name:'Second conching drum',cost:1500,description:'+65 hours every week. Rent and maintenance +$55 / week.'},
 {id:'efficiency' as UpgradeId,name:'Heat recovery',cost:1050,description:'Reduce production wages & energy by 25%. Protect margin at everyday prices.'},
 {id:'quality' as UpgradeId,name:'Precision tempering',cost:1150,description:'+12 product quality; enables a stronger premium position. No capacity increase.'},
 {id:'flexibility' as UpgradeId,name:'Quick-change moulds',cost:750,description:'Remove the 8-hour changeover per additional recipe. Make a varied portfolio practical.'}
];
export const MARKETS = [
 {id:'quay' as MarketId,name:'Maravel Quay',subtitle:'Dockworkers, cafés & families',cost:0,overhead:0,fit:{Everyday:1,Gifting:.7,Connoisseur:.45}},
 {id:'hill' as MarketId,name:'Lantern Hill',subtitle:'Hotels, salons & discerning gifts',cost:1100,overhead:75,fit:{Everyday:.35,Gifting:.85,Connoisseur:1}},
 {id:'rail' as MarketId,name:'Northline Station',subtitle:'Travellers, kiosks & larger orders',cost:1400,overhead:100,fit:{Everyday:.85,Gifting:.8,Connoisseur:.45}}
];
export const SUPPLIERS = [
 {id:'dock' as SupplierId,name:'Rafi’s Dock Exchange',origin:'Maravel · spot market',lead:0,quality:54,factor:1.15,description:'Immediate stock. Higher prices, ordinary cocoa. Useful when a deadline is close.'},
 {id:'coop' as SupplierId,name:'Sierra Cooperative',origin:'Sierra Valley · direct trade',lead:2,quality:82,factor:.88,description:'Better cocoa and price. Two weeks at sea; the week 6–7 storm adds one week.'},
 {id:'estate' as SupplierId,name:'Solano Estate',origin:'Solano Highlands · small harvest',lead:3,quality:96,factor:1.3,description:'Exceptional cocoa. Expensive, slow; origin bars can earn the difference.'}
];
const BASE:Record<Ingredient,number>={cocoa:7,sugar:2.2,milk:4.5,nuts:7.5,citrus:5};
export interface Stock {qty:number;cost:number;quality:number}
export const GRADES = ['standard','select','premium'] as const;
export type Grade = typeof GRADES[number];
export interface IngredientLot extends Stock {id:string;ingredient:Ingredient;grade:Grade}
export interface IngredientPolicy {preferred:Grade|'any';fallback:'any'|'lower'|'none'}
export interface RepeatOrder {supplier:SupplierId;qty:number}
export const gradeFor=(quality:number):Grade=>quality>=90?'premium':quality>=75?'select':'standard';
const defaultPolicies=()=>Object.fromEntries(RECIPES.map(r=>[r.id,Object.fromEntries(INGREDIENTS.map(i=>[i,{preferred:'any',fallback:'any'}]))])) as Record<RecipeId,Record<Ingredient,IngredientPolicy>>;
export interface Goods extends Stock {born:number;recipe:RecipeId}
export interface Order {id:string;ingredient:Ingredient;qty:number;cost:number;quality:number;arrival:number;supplier:SupplierId}
export interface Receivable {id:string;amount:number;due:number;label:string}
export interface Contract {id:string;client:string;recipe:RecipeId;qty:number;unitPrice:number;minQuality:number;due:number;delay:number;deposit:number;accepted:boolean;status:'offer'|'active'|'fulfilled'|'failed';reward:number}
export interface WeekBook {openingCash:number;purchases:number;investments:number;deposits:number;repayments:number;credit:number;story:number;contractCash:number;contractRevenue:number;contractCost:number}
export interface WeekReport {purchases:number;investments:number;deposits:number;repayments:number;credit:number;story:number;refunds:number;expectedRetail:number;contractRevenue:number;costOfSales:number;week:number;openingCash:number;closingCash:number;retail:number;contract:number;collections:number;labor:number;overhead:number;spoiled:number;penalties:number;profit:number;produced:number;sold:number;rows:{recipe:RecipeId;made:number;sold:number;demand:number;quality:number;revenue:number}[];notes:string[]}
export interface Letter {id:string;week:number;from:string;role:string;title:string;text:string;choices?:{id:string;label:string;detail:string}[]}
export interface State {
 book:WeekBook;version:number;mode:Mode;seed:number;week:number;cash:number;debt:number;reputation:number;
 ingredientLots:IngredientLot[];ingredientPolicy:Record<RecipeId,Record<Ingredient,IngredientPolicy>>;productionPriority:RecipeId[];repeatOrders:Partial<Record<Ingredient,RepeatOrder>>;tutorial:{enabled:boolean;completed:string[]};
 stock:Record<Ingredient,Stock>;goods:Goods[];orders:Order[];receivables:Receivable[];
 prices:Record<RecipeId,number>;plan:Record<RecipeId,number>;position:Record<RecipeId,'value'|'balanced'|'premium'>;
 upgrades:UpgradeId[];research:ResearchId[];project:{id:ResearchId;ready:number}|null;markets:MarketId[];
 contracts:Contract[];fulfilled:number;signature:number;revenue:number;reports:WeekReport[];log:{week:number;text:string}[];
 choices:Record<string,string>;seen:string[];rival:number;marketing:boolean;creditUsed:boolean;status:'playing'|'won'|'lost';ending:string;serial:number;
}
export const LETTERS:Letter[] = [
 {id:'opening',week:1,from:'Nadia Vale',role:'Head of product',title:'Your first 16 weeks',text:'Bilal, you have $3,200 cash, two recipes and a $3,000 workshop loan due in week 16. Build an independent chocolate business before Voss takes over. I’ll guide you through production, your first order and restocking. Your opening plan is ready: 55 dark and 35 milk cases.'},
 {id:'trade',week:3,from:'Rafi Osman',role:'Supplier partner',title:'Better cocoa, longer lead time',text:'Cooperative cocoa offers quality 82 at a lower price, but arrives two weeks after you pay. Order ahead and keep immediate stock for current production. A new hotel order is available this week.'},
 {id:'choice-growers',week:4,from:'Inés Sol',role:'Sourcing partner',title:'Invest in traceable cocoa?',text:'A $300 sourcing programme adds 8 reputation and 5 quality to future batches. It strengthens your products but reduces cash available for stock. Choose the option that fits your plan.',choices:[{id:'growers',label:'Back the growers · $300',detail:'+8 reputation and +5 quality for all future batches.'},{id:'quiet',label:'Keep the cash',detail:'No cost. Protect your working capital.'}]},
 {id:'storm',week:5,from:'Rafi Osman',role:'Supplier partner',title:'Delivery disruption: weeks 6–7',text:'New cooperative orders placed in weeks 6–7 take one extra week. Existing shipments keep their arrival dates. Check your stock buffer before committing to a deadline.'},
 {id:'choice-rival',week:8,from:'Ada Voss',role:'Director, Voss & Co.',title:'Voss offers a private-label deal',text:'Voss will pay $450 now to sell your chocolate under its own brand. You lose 6 reputation. Declining earns 5 reputation and keeps your identity independent.',choices:[{id:'label',label:'Sell the licence · receive $450',detail:'Immediate cash, but −6 reputation.'},{id:'independent',label:'Stay independent',detail:'+5 reputation. No cash received.'}]},
 {id:'ledger',week:10,from:'Nadia Vale',role:'Head of product',title:'Single-origin product opportunity',text:'Sierra No. 8 targets quality-focused buyers, especially in Lantern Hill. Research costs $850 and takes two weeks. Check your cocoa grades, capacity and cash before starting.'},
 {id:'choice-festival',week:12,from:'Mara Sen',role:'City festival curator',title:'Festival promotion opportunity',text:'A $350 tasting event adds 8 reputation and increases gift demand by 25% in weeks 12–14. Invest if you can produce the additional cases; otherwise keep the cash.',choices:[{id:'showcase',label:'Host the tasting · $350',detail:'+8 reputation, gift demand +25% in weeks 12–14.'},{id:'pass',label:'Focus on the workshop',detail:'Keep $350 for stock and debt repayment.'}]},
 {id:'due',week:15,from:'Ellis Rowe',role:'Harbour credit union',title:'Final deadline: end of week 16',text:'Repay the workshop loan from Accounts before week 16 closes. To win, also complete four contracts, including a researched recipe, open two markets and reach 65 reputation. Unpaid customer balances cannot fund a repayment yet.'}
];
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
const record=<T>(v:T)=>Object.fromEntries(RECIPES.map(r=>[r.id,v])) as Record<RecipeId,T>;
export const money=(n:number)=>'$'+Math.round(n).toLocaleString('en-US');
const emptyBook=(openingCash:number):WeekBook=>({openingCash,purchases:0,investments:0,deposits:0,repayments:0,credit:0,story:0,contractCash:0,contractRevenue:0,contractCost:0});
export function newGame(mode:Mode='campaign',seed=42):State {
 const state:State = {ingredientLots:[],ingredientPolicy:defaultPolicies(),productionPriority:RECIPES.map(r=>r.id),repeatOrders:{},tutorial:{enabled:mode==='campaign',completed:[]},book:emptyBook(3200),version:SAVE_VERSION,mode,seed,week:1,cash:3200,debt:3000,reputation:40,stock:{cocoa:{qty:80,cost:7,quality:70},sugar:{qty:45,cost:2.2,quality:70},milk:{qty:25,cost:4.5,quality:70},nuts:{qty:0,cost:7.5,quality:70},citrus:{qty:0,cost:5,quality:70}},goods:[],orders:[],receivables:[],prices:Object.fromEntries(RECIPES.map(r=>[r.id,r.price])) as Record<RecipeId,number>,plan:{...record(0),dark:55,milk:35},position:record('balanced'),upgrades:[],research:[],project:null,markets:['quay'],contracts:[],fulfilled:0,signature:0,revenue:0,reports:[],log:[],choices:{},seen:[],rival:0,marketing:false,creditUsed:false,status:'playing',ending:'',serial:0};
 state.ingredientLots=INGREDIENTS.filter(i=>state.stock[i].qty>0).map(i=>({id:'opening-'+i,ingredient:i,grade:gradeFor(state.stock[i].quality),...state.stock[i]}));return state;
}
export function unlocked(s:State,r:Recipe){return !r.unlock||s.research.includes(r.unlock)}
export function capacity(s:State){return 100+(s.upgrades.includes('capacity')?65:0)}
export function overhead(s:State){return 230+(s.upgrades.includes('capacity')?55:0)+MARKETS.filter(m=>s.markets.includes(m.id)).reduce((a,m)=>a+m.overhead,0)+(s.marketing?110:0)}
export function hours(s:State){const active=RECIPES.filter(r=>unlocked(s,r)&&s.plan[r.id]>0);return round(active.reduce((a,r)=>a+r.hours*s.plan[r.id],0)+(s.upgrades.includes('flexibility')?0:Math.max(0,active.length-1)*8))}
export function needed(s:State){const req=Object.fromEntries(INGREDIENTS.map(i=>[i,0])) as Record<Ingredient,number>;for(const r of RECIPES)if(unlocked(s,r))for(const i of INGREDIENTS)req[i]+=s.plan[r.id]*(r.ingredients[i]||0);return Object.fromEntries(INGREDIENTS.map(i=>[i,round(req[i])])) as Record<Ingredient,number>}
const productionLabor=(s:State,r:Recipe)=>r.labor*(s.upgrades.includes('efficiency')?.75:1)+(s.position[r.id]==='premium'?1.3:s.position[r.id]==='value'?-.7:0);
export function allocateProduction(s:State){
 const remaining=new Map(s.ingredientLots.map(l=>[l.id,l.qty]));
 const products=Object.fromEntries(RECIPES.map(r=>[r.id,{usage:[] as {lotId:string;ingredient:Ingredient;qty:number;cost:number;quality:number;fallback:boolean}[],shortages:[] as string[],quality:0,cost:0,fallback:false}])) as Record<RecipeId,{usage:{lotId:string;ingredient:Ingredient;qty:number;cost:number;quality:number;fallback:boolean}[];shortages:string[];quality:number;cost:number;fallback:boolean}>;
 const left=Object.fromEntries(RECIPES.map(r=>[r.id,Object.fromEntries(INGREDIENTS.map(i=>[i,unlocked(s,r)?s.plan[r.id]*(r.ingredients[i]||0):0]))])) as Record<RecipeId,Record<Ingredient,number>>;
 // Reserve explicit preferences for every recipe before allowing any fallback or mixed-stock use.
 for(const pass of [0,1])for(const id of s.productionPriority)for(const i of INGREDIENTS){
  const policy=s.ingredientPolicy[id][i];if(left[id][i]<1e-8)continue;
  const eligible=s.ingredientLots.filter(l=>l.ingredient===i&&(remaining.get(l.id)||0)>1e-8&&(pass===0?policy.preferred!=='any'&&l.grade===policy.preferred:policy.preferred==='any'||(l.grade!==policy.preferred&&(policy.fallback==='any'||policy.fallback==='lower'&&GRADES.indexOf(l.grade)<GRADES.indexOf(policy.preferred)))));
  const total=eligible.reduce((n,l)=>n+(remaining.get(l.id)||0),0),take=Math.min(left[id][i],total);if(!take)continue;
  // Proportional use within an allowed pool preserves the old blended-stock default.
  for(const l of eligible){const n=take*(remaining.get(l.id)||0)/total;remaining.set(l.id,Math.max(0,(remaining.get(l.id)||0)-n));products[id].usage.push({lotId:l.id,ingredient:i,qty:n,cost:l.cost,quality:l.quality,fallback:pass===1&&policy.preferred!=='any'});}
  left[id][i]=Math.max(0,left[id][i]-take);
 }
 for(const r of RECIPES){const p=products[r.id],cocoa=p.usage.filter(u=>u.ingredient==='cocoa'),used=cocoa.reduce((a,u)=>a+u.qty,0);const base=used?cocoa.reduce((a,u)=>a+u.qty*u.quality,0)/used:s.stock.cocoa.quality;
  p.quality=Math.max(0,Math.min(100,Math.round(base+(s.upgrades.includes('quality')?12:0)+(s.choices['choice-growers']==='growers'?5:0)+(s.position[r.id]==='premium'?5:s.position[r.id]==='value'?-8:0))));
  p.cost=round((s.plan[r.id]>0?(p.usage.reduce((a,u)=>a+u.qty*u.cost,0)+INGREDIENTS.reduce((a,i)=>a+left[r.id][i]*s.stock[i].cost,0))/s.plan[r.id]:INGREDIENTS.reduce((a,i)=>a+(r.ingredients[i]||0)*s.stock[i].cost,0))+productionLabor(s,r));p.fallback=p.usage.some(u=>u.fallback);
  for(const i of INGREDIENTS)if(left[r.id][i]>.001)p.shortages.push(`${r.name}: ${round(left[r.id][i])} kg ${i} unavailable under its grade policy.`);
 }
 return {products,remaining,shortages:Object.values(products).flatMap(p=>p.shortages)};
}
export function productPreview(s:State,r:Recipe){if(s.plan[r.id]>0)return allocateProduction(s).products[r.id];const probe={...s,plan:{...s.plan,[r.id]:1}};return allocateProduction(probe).products[r.id]}
export function quality(s:State,r:Recipe){return productPreview(s,r).quality}
export function unitCost(s:State,r:Recipe){return productPreview(s,r).cost}
export function gradeWarnings(s:State){const allocation=allocateProduction(s);return s.contracts.filter(c=>c.status==='active'&&s.plan[c.recipe]>0&&allocation.products[c.recipe].quality<c.minQuality).map(c=>`${RECIPES.find(r=>r.id===c.recipe)!.name}: ${allocation.products[c.recipe].fallback?'fallback ingredients produce':'planned quality is'} ${allocation.products[c.recipe].quality}; ${c.client} requires ${c.minQuality}+. Change grades or product finish before dispatch.`)}
function syncStock(s:State){for(const i of INGREDIENTS){const lots=s.ingredientLots.filter(l=>l.ingredient===i&&l.qty>1e-8),total=lots.reduce((a,l)=>a+l.qty,0);if(total)s.stock[i]={qty:round(total),cost:round(lots.reduce((a,l)=>a+l.qty*l.cost,0)/total),quality:round(lots.reduce((a,l)=>a+l.qty*l.quality,0)/total)};else s.stock[i].qty=0;}}
export function quote(s:State,supplier:SupplierId,i:Ingredient){const p=SUPPLIERS.find(x=>x.id===supplier)!;const fluct=1+Math.sin(s.week*.83+INGREDIENTS.indexOf(i))*.08;const cacaoShock=i==='cocoa'&&s.week>=6&&s.week<=9?1.18:1;return round(BASE[i]*p.factor*fluct*cacaoShock)}
export function orderTotal(s:State,supplier:SupplierId,i:Ingredient,qty:number){return round(quote(s,supplier,i)*qty)}
export function lead(s:State,id:SupplierId){return SUPPLIERS.find(x=>x.id===id)!.lead+(id==='coop'&&(s.week===6||s.week===7)?1:0)}
export function demand(s:State,r:Recipe){
 const reach=MARKETS.filter(m=>s.markets.includes(m.id)).reduce((a,m)=>a+m.fit[r.segment as keyof typeof m.fit],0);
 const rep=.7+s.reputation/100; const priceRatio=s.prices[r.id]/r.price;
 const elasticity=r.segment==='Everyday'?1.9:1.2;
 const q=quality(s,r); const qFactor=r.segment==='Connoisseur'?.45+q/100:r.segment==='Gifting'?.7+q/180:.85+q/300;
 const positionFactor=s.position[r.id]==='premium'?(r.segment==='Everyday'?.9:1.15):s.position[r.id]==='value'?(r.segment==='Everyday'?1.13:.82):1;
 const season=r.segment==='Gifting'&&s.week>=12&&s.week<=14?1.35:1;
 const festival=s.choices['choice-festival']==='showcase'&&s.week>=12&&s.week<=14&&r.segment==='Gifting'?1.25:1;
 const rival=r.segment==='Everyday'?1-s.rival*.06:1-s.rival*.015;
 return Math.max(0,Math.floor(r.demand*reach*rep*Math.max(.08,Math.min(2.3,Math.pow(priceRatio,-elasticity)))*qFactor*positionFactor*season*festival*rival*(s.marketing?1.18:1)));
}
export function pendingLetters(s:State){return LETTERS.filter(l=>l.week<=s.week&&!s.seen.includes(l.id)&&(!l.choices||!s.choices[l.id]))}
export function offers(s:State):Contract[]{
 const defs=[
 {id:'ferry',client:'Captain Leda · Ferry canteen',recipe:'dark',qty:35,unitPrice:22,minQuality:50,start:1,due:4,delay:0,deposit:.25,reward:5},
 {id:'hotel',client:'Mara Sen · Lantern Hotel',recipe:'milk',qty:55,unitPrice:25,minQuality:62,start:3,due:7,delay:2,deposit:.2,reward:6},
 {id:'citrus-fair',client:'Nadia’s Guild · Autumn fair',recipe:'orange',qty:48,unitPrice:32,minQuality:65,start:6,due:11,delay:1,deposit:.3,reward:7},
 {id:'rail-order',client:'Jon Bell · Northline kiosks',recipe:'dark',qty:75,unitPrice:23,minQuality:55,start:8,due:13,delay:2,deposit:.15,reward:6},
 {id:'salon',client:'Amira Dey · Hill salon',recipe:'praline',qty:40,unitPrice:39,minQuality:70,start:10,due:15,delay:2,deposit:.3,reward:8},
 {id:'origin-club',client:'The Eight · Tasting society',recipe:'origin',qty:35,unitPrice:40,minQuality:85,start:11,due:16,delay:1,deposit:.25,reward:9}
 ];
 const result=defs.filter(d=>s.week>=d.start&&s.week<=d.due&&!s.contracts.some(c=>c.id===d.id)).map(d=>({...d,recipe:d.recipe as RecipeId,accepted:false,status:'offer' as const}));
 if(s.mode==='sandbox'&&s.week>16){const k=Math.floor((s.week-17)/4),r=RECIPES[k%RECIPES.length];const id='sandbox-'+k;if(!s.contracts.some(c=>c.id===id))result.push({id,client:'Maravel Trade Board',recipe:r.id,qty:40+k%4*10,unitPrice:r.price+5,minQuality:60,start:17+k*4,due:20+k*4,delay:1,deposit:.2,reward:5,accepted:false,status:'offer'});}
 return result;
}
export function blockers(s:State){const b:string[]=[...allocateProduction(s).shortages];if(hours(s)>capacity(s))b.push(`Plan needs ${hours(s)} hours; only ${capacity(s)} available.`);const n=needed(s);for(const i of INGREDIENTS)if(n[i]>s.stock[i].qty+.001)b.push(`${i}: need ${n[i]} kg, have ${round(s.stock[i].qty)} kg.`);const wages=RECIPES.reduce((a,r)=>a+s.plan[r.id]*(r.labor*(s.upgrades.includes('efficiency')?.75:1)+(s.position[r.id]==='premium'?1.3:s.position[r.id]==='value'?-.7:0)),0);if(wages>s.cash)b.push(`Production needs ${money(wages)} before sales; cash is ${money(s.cash)}.`);return b}
export function forecast(s:State){
 const preview=structuredClone(s);let wages=0,contractCash=0;
 for(const r of RECIPES)if(unlocked(s,r)){const qty=s.plan[r.id];wages+=qty*(r.labor*(s.upgrades.includes('efficiency')?.75:1)+(s.position[r.id]==='premium'?1.3:s.position[r.id]==='value'?-.7:0));if(qty)preview.goods.push({recipe:r.id,qty,cost:unitCost(s,r),quality:quality(s,r),born:s.week});}
 for(const c of preview.contracts.filter(c=>c.status==='active').sort((a,b)=>b.minQuality-a.minQuality||a.due-b.due)){if(preview.goods.filter(g=>g.recipe===c.recipe&&g.quality>=c.minQuality).reduce((a,g)=>a+g.qty,0)>=c.qty){consumeGoods(preview,c.recipe,c.qty,c.minQuality);c.status='fulfilled';if(c.delay===0)contractCash+=c.qty*c.unitPrice*(1-c.deposit);}}
 let sales=0;for(const r of RECIPES)if(unlocked(s,r))sales+=sellRetail(preview,r.id,demand(s,r)).qty*s.prices[r.id];
 const collections=s.receivables.filter(x=>x.due<=s.week).reduce((a,x)=>a+x.amount,0);
 const penalties=preview.contracts.filter(c=>c.status==='active'&&c.due<=s.week).reduce((a,c)=>a+c.qty*c.unitPrice*(c.deposit+.12),0);
 return {sales:round(sales),labor:round(wages),overhead:overhead(s),collections:round(collections),contractCash:round(contractCash),penalties:round(penalties),closing:round(s.cash+sales+collections+contractCash-wages-overhead(s)-penalties),risk:blockers(s)};
}
export type Action = {type:'policy';recipe:RecipeId;ingredient:Ingredient;preferred:Grade|'any';fallback:'any'|'lower'|'none'}|{type:'priority';recipe:RecipeId;direction:-1|1}|{type:'repeat';ingredient:Ingredient}|{type:'tutorial';enabled?:boolean;complete?:string}| {type:'buy';supplier:SupplierId;ingredient:Ingredient;qty:number}|{type:'plan';recipe:RecipeId;qty:number}|{type:'price';recipe:RecipeId;price:number}|{type:'position';recipe:RecipeId;position:'value'|'balanced'|'premium'}|{type:'accept';id:string}|{type:'deliver';id:string}|{type:'upgrade';id:UpgradeId}|{type:'research';id:ResearchId}|{type:'expand';id:MarketId}|{type:'repay';amount:number}|{type:'credit'}|{type:'marketing'}|{type:'choice';id:string;choice:string}|{type:'read';id:string}|{type:'advance'}|{type:'continue'};
export interface Result {state:State;ok:boolean;message:string}
export function act(old:State,a:Action):Result {
 const fail=(message:string):Result=>({state:old,ok:false,message});
 if(old.status!=='playing'&&a.type!=='continue'&&a.type!=='read')return fail('This chapter has ended. Restart, or continue a successful house in sandbox.');
 if(a.type==='repeat'){const preset=old.repeatOrders[a.ingredient];return preset?act(old,{type:'buy',ingredient:a.ingredient,...preset}):fail('Place an order first to save a repeat preset.');}
 const s=structuredClone(old);const note=(text:string)=>s.log.unshift({week:s.week,text});
 const spend=(n:number)=>Number.isFinite(n)&&n>=0&&s.cash>=n;
 if(a.type==='tutorial'){if(typeof a.enabled==='boolean')s.tutorial.enabled=a.enabled;if(a.complete&&['production','order','result1','supply','result2'].includes(a.complete)&&!s.tutorial.completed.includes(a.complete))s.tutorial.completed.push(a.complete);return {state:s,ok:true,message:'Guide updated.'};}
 if(a.type==='policy'){if(!RECIPES.some(r=>r.id===a.recipe&&r.ingredients[a.ingredient])||!['any',...GRADES].includes(a.preferred)||!['any','lower','none'].includes(a.fallback))return fail('Choose a valid ingredient grade policy.');s.ingredientPolicy[a.recipe][a.ingredient]={preferred:a.preferred,fallback:a.fallback};return {state:s,ok:true,message:'Ingredient preference saved.'};}
 if(a.type==='priority'){const index=s.productionPriority.indexOf(a.recipe),target=index+a.direction;if(![-1,1].includes(a.direction)||index<0||target<0||target>=s.productionPriority.length)return fail('This product cannot move further.');[s.productionPriority[index],s.productionPriority[target]]=[s.productionPriority[target],s.productionPriority[index]];return {state:s,ok:true,message:'Allocation priority saved.'};}
 if(a.type==='buy'){
  if(!SUPPLIERS.some(x=>x.id===a.supplier)||!INGREDIENTS.includes(a.ingredient)||!Number.isFinite(a.qty)||a.qty<1||a.qty>500||a.qty%1!==0)return fail('Order between 1 and 500 whole kilograms.');
  const price=quote(s,a.supplier,a.ingredient),cost=orderTotal(s,a.supplier,a.ingredient,a.qty);if(!spend(cost))return fail('Not enough cash for this order.');s.cash=round(s.cash-cost);s.book.purchases=round(s.book.purchases+cost);const supplier=SUPPLIERS.find(x=>x.id===a.supplier)!;const q=a.ingredient==='cocoa'?supplier.quality:75;
  if(lead(s,a.supplier)===0)addStock(s,a.ingredient,a.qty,price,q);else s.orders.push({id:nextId(s,'order'),supplier:a.supplier,ingredient:a.ingredient,qty:a.qty,cost:price,quality:q,arrival:s.week+lead(s,a.supplier)});
  s.repeatOrders[a.ingredient]={supplier:a.supplier,qty:a.qty};if(s.week===2&&a.supplier==='coop'&&!s.tutorial.completed.includes('supply'))s.tutorial.completed.push('supply');
  note(`${a.qty} kg ${a.ingredient} ordered from ${supplier.name} for ${money(cost)}.`);
  return {state:s,ok:true,message:lead(s,a.supplier)?`Ordered. Arrives at the start of week ${s.week+lead(s,a.supplier)}.`:'Delivered to your storeroom.'};
 }
 if(a.type==='plan'){
  const r=RECIPES.find(r=>r.id===a.recipe);if(!r||!unlocked(s,r)||!Number.isFinite(a.qty)||a.qty<0||a.qty>400||a.qty%1!==0)return fail('Use 0–400 whole cases for an unlocked recipe.');s.plan[a.recipe]=a.qty;return {state:s,ok:true,message:'Production plan updated.'};
 }
 if(a.type==='price'){
  if(!RECIPES.some(r=>r.id===a.recipe)||!Number.isFinite(a.price)||a.price<8||a.price>80)return fail('Prices must be between $8 and $80 per case.');s.prices[a.recipe]=round(a.price);return {state:s,ok:true,message:'Price updated.'};
 }
 if(a.type==='position'){
  if(!RECIPES.some(r=>r.id===a.recipe)||!['value','balanced','premium'].includes(a.position))return fail('Unknown product position.');s.position[a.recipe]=a.position;return {state:s,ok:true,message:'Product position updated.'};
 }
 if(a.type==='accept'){
  const c=offers(s).find(c=>c.id===a.id);if(!c)return fail('That offer is no longer available.');const r=RECIPES.find(r=>r.id===c.recipe)!;if(!unlocked(s,r))return fail('Research this recipe before accepting the order.');if(s.contracts.filter(c=>c.status==='active').length>=3)return fail('Complete an active order first. Three simultaneous commitments is the limit.');s.contracts.push({...c,status:'active',accepted:true});const deposit=round(c.qty*c.unitPrice*c.deposit);s.cash=round(s.cash+deposit);s.book.deposits=round(s.book.deposits+deposit);note(`Accepted ${c.client}: ${c.qty} cases due week ${c.due}.`);return {state:s,ok:true,message:`Deposit received: ${money(c.qty*c.unitPrice*c.deposit)}. Ready cases ship automatically when the week closes; stored cases can be dispatched now.`};
 }
 if(a.type==='deliver'){
  const c=s.contracts.find(c=>c.id===a.id);if(!c||c.status!=='active')return fail('This order cannot be delivered again.');const eligible=s.goods.filter(g=>g.recipe===c.recipe&&g.quality>=c.minQuality).reduce((a,g)=>a+g.qty,0);if(eligible<c.qty)return fail(`Need ${c.qty} finished cases with quality ≥ ${c.minQuality}. Eligible stock: ${eligible}. Produce first, then dispatch.`);
  const used=consumeGoods(s,c.recipe,c.qty,c.minQuality);s.book.contractCost=round(s.book.contractCost+used.cost);s.book.contractRevenue=round(s.book.contractRevenue+c.qty*c.unitPrice);c.status='fulfilled';s.fulfilled++;if(!['dark','milk'].includes(c.recipe))s.signature++;s.reputation=Math.min(100,s.reputation+c.reward);const remaining=round(c.qty*c.unitPrice*(1-c.deposit));if(c.delay===0){s.cash=round(s.cash+remaining);s.book.contractCash=round(s.book.contractCash+remaining);}else s.receivables.push({id:c.id,amount:remaining,due:s.week+c.delay,label:c.client});s.revenue=round(s.revenue+c.qty*c.unitPrice);note(`Delivered ${c.qty} cases to ${c.client}. ${c.delay?`Balance due week ${s.week+c.delay}.`:'Balance paid.'}`);return {state:s,ok:true,message:c.delay?`Dispatched. ${money(remaining)} is due week ${s.week+c.delay}.`:'Dispatched and paid in full.'};
 }
 if(a.type==='upgrade'){
  const u=UPGRADES.find(x=>x.id===a.id);if(!u||s.upgrades.includes(a.id))return fail('This upgrade is already installed or unavailable.');if(!spend(u.cost))return fail('Not enough cash for this investment.');s.cash-=u.cost;s.book.investments+=u.cost;s.upgrades.push(a.id);note(`Installed ${u.name}.`);return {state:s,ok:true,message:'Upgrade installed. Your factory forecast has changed.'};
 }
 if(a.type==='research'){
  const r=RESEARCH.find(x=>x.id===a.id);if(!r||s.research.includes(a.id))return fail('This recipe is already researched or unavailable.');if(s.project)return fail('The laboratory is already working on a recipe.');if(!spend(r.cost))return fail('Not enough cash for research.');s.cash-=r.cost;s.book.investments+=r.cost;s.project={id:a.id,ready:s.week+r.weeks};note(`Started ${r.name}. Ready week ${s.project.ready}.`);return {state:s,ok:true,message:`Pilot underway. Recipe unlocks at the start of week ${s.project.ready}.`};
 }
 if(a.type==='expand'){
  const m=MARKETS.find(x=>x.id===a.id);if(!m||s.markets.includes(a.id))return fail('This market is already open or unavailable.');if(s.reputation<48)return fail('Build reputation to 48 before opening another market.');if(!spend(m.cost))return fail('Not enough cash to open this market.');s.cash-=m.cost;s.book.investments+=m.cost;s.markets.push(m.id);note(`Opened distribution in ${m.name}.`);return {state:s,ok:true,message:`${m.name} is open. Demand and weekly overhead have increased.`};
 }
 if(a.type==='repay'){
  if(!Number.isFinite(a.amount)||a.amount<=0||a.amount>s.debt||!spend(a.amount))return fail('Repayment must be positive, no larger than your debt, and affordable.');s.cash=round(s.cash-a.amount);s.debt=round(s.debt-a.amount);s.book.repayments=round(s.book.repayments+a.amount);note(`Repaid ${money(a.amount)} of the workshop note.`);return {state:s,ok:true,message:s.debt===0?'The workshop is yours. The note is fully repaid.':`${money(s.debt)} remains on the note.`};
 }
 if(a.type==='credit'){
  if(s.creditUsed)return fail('The emergency facility can only be used once.');s.creditUsed=true;s.cash+=900;s.book.credit+=900;s.debt+=1080;s.reputation=Math.max(0,s.reputation-3);note('Emergency advance received: $900. Note increased by $1,080.');return {state:s,ok:true,message:'$900 received. $1,080 added to the note.'};
 }
 if(a.type==='marketing'){s.marketing=!s.marketing;return {state:s,ok:true,message:s.marketing?'Local advertising enabled: $110 / week, +18% demand.':'Advertising paused.'};}
 if(a.type==='read'){
  const l=LETTERS.find(x=>x.id===a.id);if(!l||l.week>s.week)return fail('This letter is not available yet.');if(l.choices&&!s.choices[l.id])return fail('Choose a response before acknowledging this message.');if(!s.seen.includes(a.id))s.seen.push(a.id);return {state:s,ok:true,message:'Message acknowledged. It remains in Messages.'};
 }
 if(a.type==='choice'){
  const l=LETTERS.find(x=>x.id===a.id);if(!l||l.week>s.week||!l.choices?.some(c=>c.id===a.choice)||s.choices[a.id])return fail('This decision is unavailable or already made.');const cost=a.choice==='growers'?300:a.choice==='showcase'?350:0;if(!spend(cost))return fail('Not enough cash for this choice.');s.cash-=cost;s.book.story-=cost;s.choices[a.id]=a.choice;if(a.choice==='growers')s.reputation+=8;if(a.choice==='label'){s.cash+=450;s.book.story+=450;s.reputation-=6;}if(a.choice==='independent')s.reputation+=5;if(a.choice==='showcase')s.reputation+=8;s.reputation=Math.max(0,Math.min(100,s.reputation));s.seen.push(a.id);note(`${l.title}: ${l.choices.find(c=>c.id===a.choice)!.label}.`);return {state:s,ok:true,message:'Decision saved. You can review it in Messages.'};
 }
 if(a.type==='continue'){
  if(s.status!=='won')return fail('Complete the campaign to continue this house.');s.mode='sandbox';s.status='playing';s.ending='';return {state:s,ok:true,message:'The house continues. New Trade Board orders appear every four weeks.'};
 }
 if(a.type==='advance'){
  const b=blockers(s);if(b.length)return fail(b.join(' '));
  const rep:WeekReport={purchases:s.book.purchases,investments:s.book.investments,deposits:s.book.deposits,repayments:s.book.repayments,credit:s.book.credit,story:s.book.story,refunds:0,expectedRetail:forecast(old).sales,contractRevenue:0,costOfSales:0,week:s.week,openingCash:s.book.openingCash,closingCash:0,retail:0,contract:s.book.contractCash,collections:0,labor:0,overhead:overhead(s),spoiled:0,penalties:0,profit:0,produced:0,sold:0,rows:[],notes:[]};let costOfSales=s.book.contractCost;
  const allocation=allocateProduction(s);
  for(const r of RECIPES){if(!unlocked(s,r))continue;const qty=s.plan[r.id],q=allocation.products[r.id].quality,cost=allocation.products[r.id].cost;const labor=qty*(r.labor*(s.upgrades.includes('efficiency')?.75:1)+(s.position[r.id]==='premium'?1.3:s.position[r.id]==='value'?-.7:0));rep.labor+=labor;if(qty>0)s.goods.push({recipe:r.id,qty,cost,quality:q,born:s.week});rep.produced+=qty;}
  s.ingredientLots=s.ingredientLots.map(l=>({...l,qty:allocation.remaining.get(l.id)||0})).filter(l=>l.qty>1e-8);syncStock(s);
  let contractRevenue=s.book.contractRevenue;
  for(const c of s.contracts.filter(c=>c.status==='active').sort((a,b)=>b.minQuality-a.minQuality||a.due-b.due)){
   if(s.goods.filter(g=>g.recipe===c.recipe&&g.quality>=c.minQuality).reduce((a,g)=>a+g.qty,0)<c.qty)continue;
   const used=consumeGoods(s,c.recipe,c.qty,c.minQuality);costOfSales+=used.cost;c.status='fulfilled';s.fulfilled++;if(!['dark','milk'].includes(c.recipe))s.signature++;s.reputation=Math.min(100,s.reputation+c.reward);
   const remaining=round(c.qty*c.unitPrice*(1-c.deposit));contractRevenue+=c.qty*c.unitPrice;s.revenue=round(s.revenue+c.qty*c.unitPrice);
   if(c.delay===0){s.cash=round(s.cash+remaining);rep.contract+=remaining;}else s.receivables.push({id:c.id,amount:remaining,due:s.week+c.delay,label:c.client});
   rep.notes.push(`${c.client}: dispatched ${c.qty} cases. ${c.delay?`Balance due week ${s.week+c.delay}.`:'Balance collected.'}`);
  }
  for(const r of RECIPES){if(!unlocked(s,r))continue;const expected=demand(old,r);const noise=.91+random(s.seed,s.week,RECIPES.indexOf(r))*.18;const actual=Math.floor(expected*noise);const used=sellRetail(s,r.id,actual);costOfSales+=used.cost;rep.retail+=used.qty*s.prices[r.id];rep.sold+=used.qty;rep.rows.push({recipe:r.id,made:s.plan[r.id],sold:used.qty,demand:actual,quality:quality(old,r),revenue:round(used.qty*s.prices[r.id])});if(actual>used.qty&&s.plan[r.id]>0)rep.notes.push(`${r.name}: ${actual-used.qty} retail cases unserved (stock or contract reservations).`);}
  rep.labor=round(rep.labor);rep.retail=round(rep.retail);s.cash=round(s.cash+rep.retail-rep.labor-rep.overhead);s.revenue=round(s.revenue+rep.retail);
  for(const x of s.receivables.filter(x=>x.due<=s.week)){s.cash=round(s.cash+x.amount);rep.collections+=x.amount;rep.notes.push(`${x.label}: ${money(x.amount)} collected.`);}s.receivables=s.receivables.filter(x=>x.due>s.week);
  for(const c of s.contracts.filter(c=>c.status==='active'&&c.due<=s.week)){c.status='failed';const refund=round(c.qty*c.unitPrice*c.deposit),fee=round(c.qty*c.unitPrice*.12),penalty=round(refund+fee);s.cash=round(s.cash-penalty);rep.refunds+=refund;rep.penalties+=fee;s.reputation=Math.max(0,s.reputation-10);rep.notes.push(`${c.client}: deadline missed. Deposit returned and penalty paid (${money(penalty)}).`);}
  for(const g of s.goods){const shelf=g.recipe==='truffle'?1:3;if(s.week-g.born>=shelf-1){rep.spoiled+=g.qty*g.cost;rep.notes.push(`${g.qty} cases of ${RECIPES.find(r=>r.id===g.recipe)!.name} expired.`);g.qty=0;}}s.goods=s.goods.filter(g=>g.qty>0);
  rep.contractRevenue=round(contractRevenue);rep.costOfSales=round(costOfSales);rep.profit=round(rep.retail+contractRevenue-costOfSales-rep.overhead-rep.penalties-rep.spoiled);rep.closingCash=s.cash;s.book=emptyBook(s.cash);
  const totalDemand=rep.rows.reduce((a,r)=>a+r.demand,0);if(rep.sold>=Math.min(60,totalDemand*.65))s.reputation=Math.min(100,s.reputation+1);else if(rep.produced===0&&rep.sold===0)s.reputation=Math.max(0,s.reputation-1);
  const cheap=RECIPES.filter(r=>r.segment==='Everyday').some(r=>s.prices[r.id]<r.price*.9&&s.plan[r.id]>40);s.rival=Math.max(0,Math.min(3,s.rival+(cheap?1:s.week%3===0?-1:0)));if(cheap)rep.notes.push('Voss answered your low everyday prices. Its promotion pressure has risen.');
  if(s.week===5)rep.notes.push('Cocoa shortage begins next week: prices +18% through week 9.');
  s.reports.unshift(rep);s.reports=s.reports.slice(0,52);s.week++;
  for(const o of s.orders.filter(o=>o.arrival<=s.week)){addStock(s,o.ingredient,o.qty,o.cost,o.quality);rep.notes.push(`${o.qty} kg ${o.ingredient} arrived from ${SUPPLIERS.find(p=>p.id===o.supplier)!.name}.`);}s.orders=s.orders.filter(o=>o.arrival>s.week);
  if(s.project&&s.project.ready<=s.week){s.research.push(s.project.id);rep.notes.push(`${RESEARCH.find(r=>r.id===s.project!.id)!.name} completed.`);s.project=null;}
  if(s.cash<0){s.status='lost';s.ending='Cash ran out after wages, overhead or a missed-order penalty. The lender closes the workshop. Review the final cash breakdown and try a different production and funding plan.';}
  else if(s.mode==='campaign'&&s.week>16){if(s.debt===0&&s.fulfilled>=4&&s.signature>=1&&s.markets.length>=2&&s.reputation>=65){s.status='won';s.ending='You repaid the loan, completed the required orders and built a trusted business across two markets. Voss withdraws its takeover bid. Continue in sandbox to grow at your own pace.';}else{s.status='lost';s.ending=`The city’s review arrives. ${s.debt>0?`${money(s.debt)} remains on the note. `:''}${s.fulfilled<4?'Four completed contracts were required. ':''}${s.signature<1?'A researched signature contract was required. ':''}${s.markets.length<2?'A second market was required. ':''}${s.reputation<65?'Reputation needed to reach 65. ':''}Voss takes the lease. Try a different path through the same sixteen weeks.`;}}
  note(`Week ${rep.week}: ${money(rep.retail)} retail sales, ${money(rep.profit)} trading profit.`);
  s.log=s.log.slice(0,120);return {state:s,ok:true,message:`Week ${rep.week} closed. ${money(rep.retail)} retail sales; ${money(s.cash)} cash.`};
 }
 return fail('Unknown action.');
}
function nextId(s:State,prefix:string){let id:string;do{id=prefix+'-'+(++s.serial)}while(s.ingredientLots.some(l=>l.id===id)||s.orders.some(o=>o.id===id));return id}
function addStock(s:State,i:Ingredient,qty:number,cost:number,q:number){s.ingredientLots.push({id:nextId(s,'lot'),ingredient:i,grade:gradeFor(q),qty,cost,quality:q});syncStock(s)}
function consumeGoods(s:State,id:RecipeId,qty:number,minQuality=0){let left=qty,cost=0;for(const g of s.goods.filter(g=>g.recipe===id&&g.quality>=minQuality).sort((a,b)=>a.quality-b.quality||a.born-b.born)){const n=Math.min(left,g.qty);g.qty-=n;cost+=n*g.cost;left-=n;if(left<=0)break;}s.goods=s.goods.filter(g=>g.qty>0);return {cost:round(cost),qty:qty-left}}
function sellRetail(s:State,id:RecipeId,qty:number){
 const lots=s.goods.filter(g=>g.recipe===id).sort((a,b)=>a.born-b.born);const reserved=new Map<Goods,number>();
 for(const c of s.contracts.filter(c=>c.recipe===id&&c.status==='active').sort((a,b)=>b.minQuality-a.minQuality||a.due-b.due)){let left=c.qty;for(const g of lots.filter(g=>g.quality>=c.minQuality)){const n=Math.min(left,g.qty-(reserved.get(g)||0));reserved.set(g,(reserved.get(g)||0)+n);left-=n;if(left<=0)break;}}
 let left=qty,cost=0;for(const g of lots){const n=Math.min(left,g.qty-(reserved.get(g)||0));g.qty-=n;cost+=n*g.cost;left-=n;if(left<=0)break;}s.goods=s.goods.filter(g=>g.qty>0);return {qty:qty-left,cost:round(cost)};
}
function random(seed:number,week:number,salt:number){let x=(seed+week*374761393+salt*668265263)|0;x=Math.imul(x^(x>>>13),1274126177);return ((x^(x>>>16))>>>0)/4294967296}
export function serialize(s:State){return JSON.stringify({version:SAVE_VERSION,state:s})}
export function deserialize(raw:string):State{
 let p:any;try{p=JSON.parse(raw)}catch{throw new Error('This save is not valid JSON. Your current house is unchanged.')}
 if(![2,SAVE_VERSION].includes(p?.version)||p.state?.version!==p.version)throw new Error('This save version is not supported. Your current house is unchanged.');
 const s=p.state as State;const finite=(x:unknown)=>typeof x==='number'&&Number.isFinite(x);
 if(!s||!['campaign','sandbox'].includes(s.mode)||!['playing','won','lost'].includes(s.status)||!Number.isInteger(s.week)||s.week<1||s.week>10000||!finite(s.cash)||!finite(s.debt)||s.debt<0||!finite(s.reputation)||s.reputation<0||s.reputation>100||!finite(s.seed)||!Number.isInteger(s.serial)||(!Number.isInteger(s.fulfilled)||s.fulfilled<0)||(!Number.isInteger(s.signature)||s.signature<0)||!finite(s.revenue)||!finite(s.rival)||s.rival<0||s.rival>3||typeof s.marketing!=='boolean'||typeof s.creditUsed!=='boolean'||typeof s.ending!=='string')throw new Error('Save data is damaged. Your current house is unchanged.');
 for(const key of ['goods','orders','receivables','upgrades','research','markets','contracts','reports','log','seen'] as const)if(!Array.isArray(s[key])||s[key].length>1000)throw new Error('Save collections are damaged.');
 for(const key of ['goods','orders','receivables','contracts','reports','log'] as const)if(s[key].some(x=>!x||typeof x!=='object'||Array.isArray(x)))throw new Error('Save records are damaged.');
 if(!s.book||Object.keys(emptyBook(0)).some(k=>!finite((s.book as any)[k])))throw new Error('Current-week accounts are damaged.');
 for(const i of INGREDIENTS){const v=s.stock?.[i];if(!v||!finite(v.qty)||v.qty<0||!finite(v.cost)||v.cost<0||!finite(v.quality)||v.quality<0||v.quality>100)throw new Error('Ingredient data is damaged.');}
 for(const r of RECIPES)if(!finite(s.plan?.[r.id])||s.plan[r.id]<0||s.plan[r.id]>400||!Number.isInteger(s.plan[r.id])||!finite(s.prices?.[r.id])||s.prices[r.id]<8||s.prices[r.id]>80||!['value','balanced','premium'].includes(s.position?.[r.id]))throw new Error('Product data is damaged.');
 for(const r of RECIPES)if(!unlocked(s,r)&&s.plan[r.id]!==0)throw new Error('Locked product in production plan.');
 for(const key of ['goods','orders','receivables','upgrades','research','markets','contracts','reports','log','seen'] as const)if(!Array.isArray(s[key])||s[key].length>1000)throw new Error('Save collections are damaged.');
 for(const a of [s.markets,s.upgrades,s.research,s.seen,s.contracts.map(x=>x.id),s.orders.map(x=>x.id),s.receivables.map(x=>x.id)])if(new Set(a).size!==a.length)throw new Error('Duplicate records in save.');
 if(!s.choices||typeof s.choices!=='object'||Array.isArray(s.choices)||s.markets.length===0||s.markets.some(id=>!MARKETS.some(m=>m.id===id))||s.upgrades.some(id=>!UPGRADES.some(u=>u.id===id))||s.research.some(id=>!RESEARCH.some(r=>r.id===id)))throw new Error('Progress data is damaged.');
 for(const g of s.goods)if(!RECIPES.some(r=>r.id===g.recipe)||!finite(g.qty)||g.qty<0||!Number.isInteger(g.qty)||!finite(g.cost)||g.cost<0||!finite(g.quality)||g.quality<0||g.quality>100||!Number.isInteger(g.born)||g.born<1||g.born>s.week||s.week-g.born>=(g.recipe==='truffle'?1:3))throw new Error('Finished stock is damaged.');
 for(const o of s.orders)if(!INGREDIENTS.includes(o.ingredient)||!SUPPLIERS.some(p=>p.id===o.supplier)||!finite(o.qty)||o.qty<1||!finite(o.cost)||o.cost<0||!finite(o.quality)||o.quality<0||o.quality>100||!Number.isInteger(o.arrival)||o.arrival<s.week||typeof o.id!=='string')throw new Error('Shipment data is damaged.');
 for(const x of s.receivables)if(!finite(x.amount)||x.amount<0||!Number.isInteger(x.due)||typeof x.id!=='string'||typeof x.label!=='string')throw new Error('Receivables are damaged.');
 for(const c of s.contracts)if(typeof c.id!=='string'||typeof c.client!=='string'||!RECIPES.some(r=>r.id===c.recipe)||!Number.isInteger(c.qty)||c.qty<1||!finite(c.unitPrice)||c.unitPrice<0||!finite(c.minQuality)||c.minQuality<0||c.minQuality>100||!Number.isInteger(c.due)||!Number.isInteger(c.delay)||c.delay<0||!finite(c.deposit)||c.deposit<0||c.deposit>1||!['active','fulfilled','failed'].includes(c.status)||!finite(c.reward))throw new Error('Contract data is damaged.');
 if(s.project&&(!RESEARCH.some(r=>r.id===s.project!.id)||!Number.isInteger(s.project.ready)||s.project.ready<=s.week||s.research.includes(s.project.id)))throw new Error('Research data is damaged.');
 for(const x of s.log)if(!Number.isInteger(x.week)||typeof x.text!=='string')throw new Error('Ledger is damaged.');
 for(const x of s.reports)if(!Number.isInteger(x.week)||!finite(x.retail)||!finite(x.profit)||['openingCash','closingCash','contract','collections','labor','overhead','spoiled','penalties','produced','sold','purchases','investments','deposits','repayments','credit','story','refunds','expectedRetail','contractRevenue','costOfSales'].some(k=>!finite((x as any)[k]))||x.week>=s.week||!Array.isArray(x.rows)||!Array.isArray(x.notes)||x.notes.some(n=>typeof n!=='string')||x.rows.some(r=>!r||typeof r!=='object'||!RECIPES.some(a=>a.id===r.recipe)||!finite(r.made)||!finite(r.sold)||!finite(r.demand)||!finite(r.quality)||!finite(r.revenue)))throw new Error('Week reports are damaged.');
 if(s.seen.some(id=>typeof id!=='string')||Object.entries(s.choices).some(([id,choice])=>!LETTERS.find(l=>l.id===id)?.choices?.some(c=>c.id===choice)))throw new Error('Story data is damaged.');
 if(p.version===2){s.version=SAVE_VERSION;s.ingredientLots=INGREDIENTS.filter(i=>s.stock[i].qty>0).map(i=>({id:'legacy-'+i,ingredient:i,grade:gradeFor(s.stock[i].quality),...s.stock[i]}));s.ingredientPolicy=defaultPolicies();s.productionPriority=RECIPES.map(r=>r.id);s.repeatOrders={};s.tutorial={enabled:s.week<=2,completed:[]};}
 if(!Array.isArray(s.ingredientLots)||s.ingredientLots.length>5000||s.ingredientLots.some(l=>!l||typeof l.id!=='string'||!INGREDIENTS.includes(l.ingredient)||!GRADES.includes(l.grade)||!finite(l.qty)||l.qty<=0||!finite(l.cost)||l.cost<0||!finite(l.quality)||l.quality<0||l.quality>100||gradeFor(l.quality)!==l.grade)||new Set(s.ingredientLots.map(l=>l.id)).size!==s.ingredientLots.length)throw new Error('Ingredient lots are damaged.');
 for(const i of INGREDIENTS){const lots=s.ingredientLots.filter(l=>l.ingredient===i),n=lots.reduce((a,l)=>a+l.qty,0);if(Math.abs(n-s.stock[i].qty)>.011||(n>0&&(Math.abs(lots.reduce((a,l)=>a+l.qty*l.cost,0)/n-s.stock[i].cost)>.011||Math.abs(lots.reduce((a,l)=>a+l.qty*l.quality,0)/n-s.stock[i].quality)>.011)))throw new Error('Ingredient totals do not match their lots.');}
 if(!Array.isArray(s.productionPriority)||s.productionPriority.length!==RECIPES.length||new Set(s.productionPriority).size!==RECIPES.length||s.productionPriority.some(id=>!RECIPES.some(r=>r.id===id)))throw new Error('Production priority is damaged.');
 for(const r of RECIPES)for(const i of INGREDIENTS){const p=s.ingredientPolicy?.[r.id]?.[i];if(!p||!['any',...GRADES].includes(p.preferred)||!['any','lower','none'].includes(p.fallback))throw new Error('Ingredient preferences are damaged.');}
 if(!s.repeatOrders||typeof s.repeatOrders!=='object'||Array.isArray(s.repeatOrders)||Object.entries(s.repeatOrders).some(([i,p])=>!INGREDIENTS.includes(i as Ingredient)||!p||!SUPPLIERS.some(x=>x.id===p.supplier)||!Number.isInteger(p.qty)||p.qty<1||p.qty>500))throw new Error('Repeat orders are damaged.');
 if(!s.tutorial||typeof s.tutorial.enabled!=='boolean'||!Array.isArray(s.tutorial.completed)||s.tutorial.completed.some(id=>!['production','order','result1','supply','result2'].includes(id)))throw new Error('Tutorial progress is damaged.');
 return s;
}
