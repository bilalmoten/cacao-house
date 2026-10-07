import type {V4State,DomainEvent,FranchiseCohortProposal,FranchiseCohort} from './model.ts';
import {franchisePartners} from './content/franchise-partners.ts';
import {franchiseHubCapacity} from './franchise.ts';
import {regionForCity} from './content/regions.ts';
import {post,debit,credit} from './finance.ts';

const whole=(n:unknown):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
export function initialFranchiseCohort(p:FranchiseCohortProposal,standard:NonNullable<V4State['franchiseStandards']>[number],id:string,week:number):FranchiseCohort {
 const partner=franchisePartners.find(q=>q.id===p.partnerId)!;
 const proposal:FranchiseCohortProposal={partnerId:p.partnerId,standardId:p.standardId,hubId:p.hubId,stores:p.stores,priceFactorBps:p.priceFactorBps,...(p.warehouseId!==undefined?{warehouseId:p.warehouseId}:{}),...(p.grade!==undefined?{grade:p.grade}:{})};
 return {...proposal,id:'cohort:'+id,createdWeek:week,grade:p.grade??'standard',partnerCashCents:p.stores*(partner.capitalPerStoreCents-partner.fitoutPerStoreCents-standard.openingFeeCents),feeRemainingCents:p.stores*standard.openingFeeCents,serviceWeeks:0,trainingCompletedWeeks:0,extraTrainingWeeks:0,paused:false,stock:[],partnerArrearsCents:0,compliantWeeks:0,exception:'Paid training and supply preparation precede the opening.'};
}
export function openFranchiseCohort(s:V4State,p:FranchiseCohortProposal,e:DomainEvent){
 const partner=franchisePartners.find(q=>q.id===p.partnerId),standard=s.franchiseStandards?.find(q=>q.id===p.standardId),hub=s.franchiseSupportHubs?.find(q=>q.id===p.hubId),reserved=(s.franchiseCohorts??[]).filter(c=>c.hubId===p.hubId).reduce((n,c)=>n+c.stores,0),supportCommitments=(s.franchiseCohorts??[]).filter(c=>c.hubId===p.hubId).reduce((n,c)=>n+c.stores*(s.franchiseStandards?.find(q=>q.id===c.standardId)?.weeklySupportCents??0),0);
 if(s.campaign.stage<5||!partner||partner.stage>s.campaign.stage||!s.visitedCities.includes(partner.cityId)||!standard||!hub||hub.readyWeek>s.week||regionForCity(hub.cityId)!==regionForCity(partner.cityId)||!whole(p.stores)||p.stores<1||p.stores>partner.maximumStores||!whole(p.priceFactorBps)||p.priceFactorBps<7000||p.priceFactorBps>16000||p.grade!==undefined&&!['standard','premium'].includes(p.grade)||(s.franchiseCohorts??[]).some(c=>c.partnerId===partner.id))throw Error('Select a visited operator, signed standard, installed regional support office and a distinct bounded opening cohort.');
 if(franchiseHubCapacity(s,hub)<reserved+p.stores||hub.weeklyBudgetCents<supportCommitments+p.stores*standard.weeklySupportCents)throw Error('Stop intake: contracted support hours or approved field-work authority cannot cover these stores.');
 if(standard.supply==='central'&&!s.warehouses.some(w=>w.id===p.warehouseId)||standard.supply==='local'&&p.warehouseId!==undefined)throw Error('Central supply requires a real owned shipping warehouse; local partners use their own kitchens and stock.');
 if(partner.capitalPerStoreCents<=partner.fitoutPerStoreCents+standard.openingFeeCents+partner.fixedPerStoreCents*6)throw Error('Partner capital cannot cover its own fitout, opening fee and six weeks of local fixed commitments.');
 const cohort=initialFranchiseCohort(p,standard,e.id,s.week),scope={regionId:regionForCity(partner.cityId),channelId:'franchise-royalties'};
 post(s,e,'Partner opening advances held against training and future operating service',[debit('cash',cohort.feeRemainingCents),credit('customer-deposits',cohort.feeRemainingCents,cohort.id)],'partner-advance',scope);
 s.franchiseCohorts??=[];s.franchiseCohorts.push(cohort);e.entityIds=[cohort.id,partner.id,standard.id,hub.id];e.details={cohort:JSON.stringify(cohort),partnerCapitalCents:partner.capitalPerStoreCents*p.stores,partnerFitoutCents:partner.fitoutPerStoreCents*p.stores};
}
export function franchiseCohortPolicy(s:V4State,p:{cohortId:string;paused:boolean;priceFactorBps:number;extraTrainingWeeks:number;grade?:'standard'|'premium'},e:DomainEvent){
 const c=s.franchiseCohorts?.find(c=>c.id===p.cohortId);if(!c||typeof p.paused!=='boolean'||!whole(p.priceFactorBps)||p.priceFactorBps<7000||p.priceFactorBps>16000||!whole(p.extraTrainingWeeks)||p.extraTrainingWeeks<c.extraTrainingWeeks||p.extraTrainingWeeks>12||p.grade!==undefined&&!['standard','premium'].includes(p.grade))throw Error('Retain signed terms and select bounded prices, an operating pause or additional actual paid training.');
 c.grade=p.grade??c.grade;c.paused=p.paused;c.priceFactorBps=p.priceFactorBps;c.extraTrainingWeeks=p.extraTrainingWeeks;e.entityIds=[c.id];e.details={policy:JSON.stringify({cohortId:p.cohortId,paused:p.paused,priceFactorBps:p.priceFactorBps,extraTrainingWeeks:p.extraTrainingWeeks,...(p.grade!==undefined?{grade:p.grade}:{})})};
}
