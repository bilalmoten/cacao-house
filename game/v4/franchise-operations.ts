import {franchiseBrandFactor} from './franchise-brand.ts';
import type {V4State,DomainEvent,FranchiseWeek,FranchiseSupplyDelivery} from './model.ts';
import {franchisePartners} from './content/franchise-partners.ts';
import {franchiseHubCapacity} from './franchise.ts';
import {operatePartner} from './partner-week.ts';
import {protectedCash} from './sourcing.ts';
import {regionForCity} from './content/regions.ts';
import {post,debit,credit} from './finance.ts';

/** Resolve actual regional authority and third-party operations once per close.
 * Oldest signed cohorts receive support first; scarce hours/budget stop the
 * next whole opening rather than silently spreading one lead over all stores. */
export function resolveFranchises(s:V4State,e:DomainEvent,sample?:number){
 if(!s.franchiseCohorts?.length)return [];
 const history:FranchiseWeek={tickId:e.id,week:s.week,cohorts:[]},interruptions:string[]=[],capacity=new Map((s.franchiseSupportHubs??[]).map(h=>[h.id,franchiseHubCapacity(s,h)])),budgets=new Map((s.franchiseSupportHubs??[]).map(h=>[h.id,h.weeklyBudgetCents])),used=new Map<string,number>();
 for(const event of s.events.filter(ev=>ev.week===s.week&&['purchase','purchase-packaging'].includes(ev.type))){const ingredient=event.type==='purchase',key=(ingredient?'ingredient':'packaging')+':'+event.details.supplierId+':'+(ingredient?event.details.varietyId:event.details.packagingId);used.set(key,(used.get(key)??0)+Number(ingredient?event.details.quantityGrams:event.details.quantityUnits));}
 for(const [index,c]of s.franchiseCohorts.entries()){
  const standard=s.franchiseStandards?.find(p=>p.id===c.standardId),partner=franchisePartners.find(p=>p.id===c.partnerId);if(!standard||!partner)throw Error('The franchise contract lost its operator or operating standard.');
  const cost=standard.weeklySupportCents*c.stores,available=capacity.get(c.hubId)??0,budget=budgets.get(c.hubId)??0,supported=!c.paused&&available>=c.stores&&budget>=cost&&s.cashCents>=protectedCash(s)+cost;
  if(supported){capacity.set(c.hubId,available-c.stores);budgets.set(c.hubId,budget-cost);post(s,e,'Actual partner field training, travel and operating-support materials',[debit('support',cost,c.id),credit('cash',cost)],c.id+':field-support',{regionId:regionForCity(partner.cityId),channelId:'franchise-royalties'});}
  const result=operatePartner(c,standard,partner,{cityId:partner.cityId,week:s.week,stage:s.campaign.stage,grade:c.grade,allowedSupplierIds:[...s.knownSuppliers],used,seed:s.random.seed,centralProcurementCents:(JSON.parse(String(e.details.franchiseSupplyDeliveries??'[]')) as FranchiseSupplyDelivery[]).filter(d=>d.cohortId===c.id).reduce((n,d)=>n+d.revenueCents+d.shippingCents,0),serviceModel:4,brandFactor:franchiseBrandFactor(s,partner.cityId),tickId:e.id,revisions:s.recipeRevisions,supportedStores:supported?c.stores:0,supportCents:supported?cost:0,...(sample!==undefined?{sample}:{})});
  s.franchiseCohorts[index]=result.cohort;const row=result.row,scope={regionId:regionForCity(partner.cityId),channelId:'franchise-royalties'};
  if(row.royaltyCents)post(s,e,'Royalty split from actual earned partner till receipts',[debit('cash',row.royaltyCents),credit('royalty-revenue',row.royaltyCents,c.id)],c.id+':royalty',scope);
  if(row.feeEarnedCents)post(s,e,'Opening advance earned through completed supported operating service',[debit('customer-deposits',row.feeEarnedCents,c.id),credit('royalty-revenue',row.feeEarnedCents,c.id)],c.id+':service-fee',scope);
  history.cohorts.push(row);if(row.exception&&!row.exception.includes('training is in progress'))interruptions.push(partner.lead+' — '+row.exception);
 }
 s.franchiseHistory??=[];s.franchiseHistory.push(history);e.details.franchiseActuals=JSON.stringify(history);e.details.franchiseStage=s.campaign.stage;e.details.franchiseBrandModel=1;e.details.franchiseServiceModel=4;return interruptions;
}
