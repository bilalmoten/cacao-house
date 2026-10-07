import type {V4State,DomainEvent,V4Command} from './model.ts';
import {consumerLeads,consumerLeadSkill} from './commercial-leads.ts';
import {staffBefore} from './staff-history.ts';
import {applyCommand} from './commands.ts';
import {campaignEffect} from './marketing.ts';

export interface CommercialPolicy {channelId:string;enabled:boolean;lossWeeks:2|3|4;minimumContributionCents:number}
function signed(e:DomainEvent){try{return JSON.parse(e.signature)}catch{return {}}}
export function commercialPolicies(s:V4State){return s.events.filter(e=>e.type==='commercial-management-policy').filter((e,i,all)=>all.findLastIndex(x=>signed(x).channelId===signed(e).channelId)===i).map(e=>({...signed(e) as CommercialPolicy,sourceId:e.id}));}
export function configureCommercialManagement(s:V4State,p:CommercialPolicy,e:DomainEvent){
 const c=s.consumerChannels?.find(c=>c.id===p.channelId&&c.active),lead=consumerLeads(s).find(a=>a.channelId===p.channelId);
 if(s.campaign.stage<4||!c||typeof p.enabled!=='boolean'||![2,3,4].includes(p.lossWeeks)||!Number.isSafeInteger(p.minimumContributionCents)||p.enabled&&(!lead||consumerLeadSkill(s,c.id)<60))throw Error('Assign an available paid commercial lead and approve a two-to-four-week contribution floor.');
 e.entityIds=[p.channelId,...(lead?[lead.employeeId]:[])];e.details={policy:JSON.stringify({channelId:p.channelId,enabled:p.enabled,lossWeeks:p.lossWeeks,minimumContributionCents:p.minimumContributionCents})};
}
export function contributionRun(s:V4State,p:CommercialPolicy){
 const weeks=(s.consumerHistory??[]).filter(w=>w.week<s.week).slice(-p.lossWeeks);
 const values=weeks.map(w=>{const r=w.channels.find(r=>r.channelId===p.channelId);return r?{week:w.week,contributionCents:r.revenueCents-r.cogsCents-r.mediaCents-r.shippingCents}:undefined;});
 return {values,belowFloor:values.length===p.lossWeeks&&values.every((r,i)=>r&&r.week===s.week-p.lossWeeks+i&&r.contributionCents<p.minimumContributionCents)};
}
export function commercialActions(s:V4State){
 return commercialPolicies(s).filter(p=>p.enabled).map(p=>{
  const c=s.consumerChannels?.find(c=>c.id===p.channelId&&c.active),run=contributionRun(s,p),available=!!c&&consumerLeadSkill(s,p.channelId)>=60;
  return {policy:p,run,available,pause:available&&run.belowFloor&&!!(c!.weeklyMediaCents||campaignEffect(s,c!).mediaCents),reason:!available?'The commercial lead is unavailable; inspect this channel manually.':run.belowFloor?'Closed contribution stayed below the approved floor; pause ongoing media.':'Continue within the approved merchandising and media policy.'};
 });
}
export function resolveCommercialManagement(s:V4State,e:DomainEvent){
 let state=s;const interruptions:string[]=[];
 for(const decision of commercialActions(s)){
  if(!decision.available){interruptions.push('Commercial review: '+decision.reason);continue;}
  if(!decision.pause)continue;
  const c=state.consumerChannels!.find(c=>c.id===decision.policy.channelId)!,channelIndex=state.consumerChannels!.indexOf(c),campaign=campaignEffect(state,c),commands:V4Command[]=[];
  if(campaign.campaignId&&campaign.mediaCents)commands.push({id:'commercial:'+e.id+':'+channelIndex+':campaign',type:'stop-consumer-campaign',campaignId:campaign.campaignId});
  if(c.weeklyMediaCents)commands.push({id:'commercial:'+e.id+':'+channelIndex+':media',type:'consumer-policy',channelId:c.id,assortment:[...c.assortment],prices:{...c.prices},weeklyMediaCents:0,shippingSubsidyCents:c.shippingSubsidyCents,fulfillmentCases:c.fulfillmentCases,deliveryWeeks:c.deliveryWeeks,audience:c.audience});
  for(const command of commands){const result=applyCommand({...state,events:[...state.events,e]},command);if(!result.ok)throw Error(result.error);state=result.state;state.events=state.events.filter(ev=>ev.id!==e.id);}
  interruptions.push('Commercial lead paused media after '+decision.policy.lossWeeks+' closed weeks below your contribution floor. Review '+c.cityId+' '+c.kind+' before approving another campaign.');
 }
 return {state,interruptions};
}
export function commercialManagementErrors(s:V4State){
 const errors:string[]=[];
 for(const e of s.events.filter(e=>e.type==='commercial-management-policy')){
  const p=signed(e),before={...s,events:s.events.slice(0,s.events.indexOf(e))},lead=consumerLeads(before).find(a=>a.channelId===p.channelId),past=lead?staffBefore(s,lead.employeeId,e):undefined;
  const shape={channelId:p.channelId,enabled:p.enabled,lossWeeks:p.lossWeeks,minimumContributionCents:p.minimumContributionCents};
  if(p.id!==e.id||p.type!==e.type||!s.consumerChannels?.some(c=>c.id===p.channelId)||typeof p.enabled!=='boolean'||![2,3,4].includes(p.lossWeeks)||!Number.isSafeInteger(p.minimumContributionCents)||e.details.policy!==JSON.stringify(shape)||p.enabled&&(!past||past.employee.departedWeek!==undefined||past.training||past.employee.skills.management<60))errors.push('Commercial authority lacks its dated available leader and signed contribution floor.');
 }
 for(const e of s.events.filter(e=>e.id.startsWith('commercial:'))){
  const p=signed(e),before={...s,week:e.week,events:s.events.slice(0,s.events.indexOf(e)),consumerHistory:(s.consumerHistory??[]).filter(w=>w.week<e.week)},channelId=p.channelId??s.consumerCampaigns?.find(c=>c.id===p.campaignId)?.channelId,policy=commercialPolicies(before).find(p=>p.channelId===channelId),lead=consumerLeads(before).find(l=>l.channelId===channelId),past=lead?staffBefore(s,lead.employeeId,e):undefined;
  const priorPolicy=before.events.filter(x=>x.type==='consumer-policy'&&signed(x).channelId===channelId).at(-1),opening=before.events.find(x=>x.type==='open-consumer-channel'&&'channel:'+x.id===channelId);
  let prior:Record<string,unknown>|undefined;try{prior=priorPolicy?signed(priorPolicy):JSON.parse(String(opening?.details.channel??''));}catch{}
  const untouched=e.type!=='consumer-policy'||!!prior&&['assortment','prices','shippingSubsidyCents','fulfillmentCases','deliveryWeeks','audience'].every(key=>JSON.stringify(p[key])===JSON.stringify(prior[key]));
  const suffix=':'+s.consumerChannels!.findIndex(c=>c.id===channelId)+':'+(e.type==='consumer-policy'?'media':'campaign'),tickId=e.id.slice('commercial:'.length,-suffix.length);
  if(!untouched||!policy?.enabled||!contributionRun(before,policy).belowFloor||!past||past.employee.departedWeek!==undefined||past.training||past.employee.skills.management<60||!e.id.endsWith(suffix)||!s.events.some(t=>t.id===tickId&&t.origin==='tick'&&t.week===e.week)||!['stop-consumer-campaign','consumer-policy'].includes(e.type)||e.type==='consumer-policy'&&p.weeklyMediaCents!==0)errors.push('Commercial media pause exceeded its dated authority or closed loss evidence.');
 }
 return errors;
}
