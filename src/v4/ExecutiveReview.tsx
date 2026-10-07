import {useMemo} from 'react';
import type {V4State} from '../../game/v4/model';
import {executiveReview} from '../../game/v4/executive-review';
import {money} from './types';

export function ExecutiveReview({state,onWorld}:{state:V4State;onWorld?:(id:string)=>void}){
 const review=useMemo(()=>executiveReview(state),[state]);
 return <section aria-label="Executive operating review">
  <h4>Decisions needing your attention</h4>
  {review.exceptions.length?review.exceptions.map(e=><article className={e.priority==='urgent'?'v4-warning':'v4-journal'} key={e.id}><strong>{e.title}</strong><p>{e.body}</p>{onWorld&&<button className="v4-link" onClick={()=>onWorld(e.worldId)}>Inspect the responsible workplace →</button>}</article>):<p>No current exception has been identified from signed commitments and the latest closed operations.</p>}
  <h4>Recommendations from your executives</h4>
  {review.recommendations.length?review.recommendations.map(r=><article className="v4-journal" key={r.role}><small>{r.name} · {r.role}</small><h4>{r.title}</h4><p>{r.body}</p><p><small>{r.assumption}</small></p>{onWorld&&<button className="v4-link" onClick={()=>onWorld(r.worldId)}>Review in the world →</button>}</article>):<p>Appoint available paid senior colleagues to receive operating recommendations.</p>}
  <details><summary>Regional performance · thirteen closed weeks</summary><p>Revenue and profit are recognized group amounts. Net cash includes regional investment and advances; it is separate from recurring group operating cash flow.</p>{review.regions.filter(r=>r.active||r.revenueCents||r.allocations.length).map(r=><article className="v4-journal" key={r.id}><strong>{r.id.replaceAll('-',' ')} · W{r.from}–{r.to}</strong><p>{r.closedWeeks}/13 actual closes · revenue {money(r.revenueCents)} · profit {money(r.profitCents)} · net cash {money(r.cashFlowCents)}</p><p>{r.goodCases.toLocaleString()} good cases · quality {r.quality===null?'No production':r.quality.toFixed(1)} · partner compliance {r.partnerCompliance===null?'No observed partner closes':(r.partnerCompliance*100).toFixed(1)+'%'}</p>{r.allocations.map(p=><p key={p.id}>{p.priority} · {money(p.weeklyBudgetCents)}/week · authority ends W{p.endWeek}</p>)}</article>)}</details>
 </section>;
}
