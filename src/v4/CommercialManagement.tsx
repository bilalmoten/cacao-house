import {useState} from 'react';
import type {V4State} from '../../game/v4/model';
import {commercialPolicies,commercialActions,type CommercialPolicy} from '../../game/v4/commercial-management';
import {money,type Dispatch} from './types';

export function CommercialManagement({state,channelId,dispatch}:{state:V4State;channelId:string;dispatch:Dispatch}){
 const saved=commercialPolicies(state).find(p=>p.channelId===channelId),[enabled,setEnabled]=useState(saved?.enabled??false),[weeks,setWeeks]=useState<CommercialPolicy['lossWeeks']>(saved?.lossWeeks??3),[floor,setFloor]=useState((saved?.minimumContributionCents??0)/100),decision=commercialActions(state).find(d=>d.policy.channelId===channelId);
 return <details><summary>Commercial authority and loss review</summary><p>Authorize this channel’s named lead to pause ongoing media after consecutive closed weeks below your contribution floor. Creative costs stay spent; existing customer orders, prices, staffing and rent continue. A new campaign requires your approval.</p>
  <label className="v4-check"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>Allow the lead to pause unprofitable media</label>
  <label>Consecutive closed weeks<select value={weeks} onChange={e=>setWeeks(Number(e.target.value) as CommercialPolicy['lossWeeks'])}><option value={2}>Two</option><option value={3}>Three</option><option value={4}>Four</option></select></label>
  <label>Minimum weekly contribution · dollars<input type="number" step={1} value={floor} onChange={e=>setFloor(Number(e.target.value))}/></label>
  <p>Contribution is recognized sales less sold-goods cost, media and net parcel freight. It excludes advances and fixed rent/payroll; compare operating profit in Reports before expansion.</p>
  <button className="v4-button secondary" onClick={()=>void dispatch({type:'commercial-management-policy',channelId,enabled,lossWeeks:weeks,minimumContributionCents:Math.round(floor*100)})}>Approve this commercial authority</button>
  {decision&&<><p className={decision.pause?'v4-warning':'v4-note'}>{decision.reason}</p>{decision.run.values.map((r,i)=><p key={i}>{r?'W'+r.week+' · actual contribution '+money(r.contributionCents):'No completed trading row'}</p>)}</>}
 </details>;
}
