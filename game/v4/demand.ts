import type {MarketContext,ProductOffer,MarketResult,DemandForecast,SegmentId,FlavorVector} from './model.ts';
import {catalog} from './catalog.ts';
/** Provisional coefficients live together; controlled balance tests precede claims. */
export const segmentModel:{id:SegmentId;referencePriceCents:number;elasticity:number;qualityWeight:number;flavor:FlavorVector;packaging:Record<string,number>}[]=[
 {id:'value',referencePriceCents:1800,elasticity:3.2,qualityWeight:.7,flavor:[6,1,3,1],packaging:{'ordinary-wrap':.25,'presentation-box':-.45,'protective-pack':-.1}},
 {id:'gifting',referencePriceCents:2800,elasticity:1.8,qualityWeight:1.4,flavor:[6,5,2,2],packaging:{'ordinary-wrap':-.25,'presentation-box':.75,'protective-pack':-.15}},
 {id:'enthusiast',referencePriceCents:2400,elasticity:2.1,qualityWeight:2.2,flavor:[8,4,3,2],packaging:{'ordinary-wrap':.1,'presentation-box':.05,'protective-pack':-.1}},
 {id:'online',referencePriceCents:2200,elasticity:2.6,qualityWeight:1.1,flavor:[6,3,2,2],packaging:{'ordinary-wrap':-.3,'presentation-box':.1,'protective-pack':.65}},
];
function hash(value:string):number {let n=2166136261;for(const c of value){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;}
function random(seed:number):()=>number {let n=seed>>>0;return ()=>{n+=0x6d2b79f5;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function groups(offers:ProductOffer[]):ProductOffer[][] {
 const grouped=new Map<string,ProductOffer[]>();
 for(const offer of offers){
  if(!Number.isSafeInteger(offer.priceCents)||offer.priceCents<=0||!Number.isFinite(offer.quality)||offer.quality<0||offer.quality>100||offer.flavor.length!==4||offer.flavor.some(n=>!Number.isFinite(n)))throw Error('Offers require positive whole-cent prices and valid observed quality.');
  const key=JSON.stringify([offer.recipeRevisionId,offer.quality,offer.flavor,offer.packagingId]);const members=grouped.get(key)??[];members.push(offer);grouped.set(key,members);
 }
 if(new Set(offers.map(o=>o.id)).size!==offers.length)throw Error('Duplicate market offer identity.');
 return [...grouped.values()].map(members=>members.sort((a,b)=>a.priceCents-b.priceCents||a.id.localeCompare(b.id))).sort((a,b)=>a[0].recipeRevisionId.localeCompare(b[0].recipeRevisionId));
}
function evaluate(context:MarketContext,offers:ProductOffer[],stream:string):MarketResult {
 const credibility=context.priceCredibility??1;if(!Number.isFinite(credibility)||credibility<=0||credibility>1)throw Error('Price credibility must reflect a bounded comparable channel offer.');const city=catalog.cities.find(c=>c.id===context.cityId);if(!city||![context.trust,context.service,context.awareness].every(n=>Number.isFinite(n)&&n>=0&&n<=1))throw Error('Unknown market or invalid service evidence.');
 const draw=random(hash(`${stream}:${context.seed}:${context.week}:${context.cityId}:${context.cursor??0}`)),grouped=groups(offers),totals=new Map(offers.map(o=>[o.id,0]));
 const segments:MarketResult['segments']=[];
 for(const segment of segmentModel){
  // Direct retail has no convenience-online pool before that channel launches.
  const share=context.segmentShares?.[segment.id]??(segment.id==='online'?0:1);if(!Number.isFinite(share)||share<0||share>1)throw Error('Market channel shares must remain between zero and one.');const yearWeek=(context.week-1)%52+1,season=segment.id==='gifting'&&yearWeek>=41?1.6:city.id==='kyoto'&&segment.id==='enthusiast'&&yearWeek>=12&&yearWeek<=20?1.25:1;const opportunityCases=Math.round(city.market[segment.id]*(context.economicFactor??1)*(.8+draw()*.4)*share*season);
  const utilities=grouped.map(members=>{const o=members[0],fit=1-o.flavor.reduce((n,x,i)=>n+Math.abs(x-segment.flavor[i]),0)/40;
   return Math.log(credibility)+(context.targetedSegment===segment.id?Math.min(.4,Math.max(0,context.campaignStrength??0)):0)+.45+segment.qualityWeight*(o.quality-65)/25+.7*fit+(segment.packaging[o.packagingId]??0)+.6*(context.trust-.5)+.5*(context.service-.5)+Math.log(Math.max(.02,context.awareness))*.5-segment.elasticity*Math.log(o.priceCents/segment.referencePriceCents);
  });
  const rivalUtility=1.8+(draw()-.5)*.3,noPurchaseUtility=.9+(draw()-.5)*.3,max=Math.max(rivalUtility,noPurchaseUtility,...utilities),weights=[...utilities,rivalUtility,noPurchaseUtility].map(u=>Math.exp(u-max)),denominator=weights.reduce((n,w)=>n+w,0);
  let ownDemandCases=0;
  grouped.forEach((members,index)=>{const demand=Math.floor(opportunityCases*weights[index]/denominator);ownDemandCases+=demand;const cheapest=members.filter(m=>m.priceCents===members[0].priceCents);cheapest.forEach((member,i)=>totals.set(member.id,totals.get(member.id)!+Math.floor(demand/cheapest.length)+(i<demand%cheapest.length?1:0)));});
  const rivalCases=Math.floor(opportunityCases*weights[weights.length-2]/denominator),noPurchaseCases=opportunityCases-ownDemandCases-rivalCases;
  segments.push({id:segment.id,opportunityCases,ownDemandCases,rivalCases,noPurchaseCases});
 }
 return {cityId:city.id,week:context.week,opportunityCases:segments.reduce((n,s)=>n+s.opportunityCases,0),totalDemand:segments.reduce((n,s)=>n+s.ownDemandCases,0),rivalCases:segments.reduce((n,s)=>n+s.rivalCases,0),noPurchaseCases:segments.reduce((n,s)=>n+s.noPurchaseCases,0),offers:offers.map(o=>({id:o.id,demandCases:totals.get(o.id)!})),segments,drivers:['Finite local opportunities shared with rivals and no-purchase choices','Price relative to segment reference and observed product quality','Segment-specific packaging, flavor and brand/service trust',...(credibility<1?['A cheaper comparable channel offer weakens this asking price']:[])]};
}
export function sampleMarket(context:MarketContext,offers:ProductOffer[],sample:number):MarketResult {return evaluate(context,offers,'cash-preview:'+sample);}
export function realizeMarket(context:MarketContext,offers:ProductOffer[]):MarketResult {return evaluate(context,offers,'actual');}
const quantile=(values:number[],p:number)=>[...values].sort((a,b)=>a-b)[Math.floor((values.length-1)*p)];
export function forecastMarket(context:MarketContext,offers:ProductOffer[]):DemandForecast {
 const samples=96,results=Array.from({length:samples},(_,i)=>evaluate(context,offers,'preview:'+i)),totals=results.map(r=>r.totalDemand);
 return {basis:'sampled demand before stock constraints',cityId:context.cityId,week:context.week,lowCases:quantile(totals,.1),expectedCases:Math.round(totals.reduce((n,x)=>n+x,0)/samples),highCases:quantile(totals,.9),samples,offers:offers.map(o=>{const values=results.map(r=>r.offers.find(x=>x.id===o.id)!.demandCases);return {id:o.id,lowCases:quantile(values,.1),expectedCases:Math.round(values.reduce((n,x)=>n+x,0)/samples),highCases:quantile(values,.9)};}),drivers:results[0].drivers};
}
