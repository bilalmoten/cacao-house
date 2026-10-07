import type {V4State} from './model.ts';
import {regionForCity} from './content/regions.ts';
/** Recent completed operating service affects consideration with a one-week
 * lag. Training before the first actual opening carries no invented customer
 * reputation. Local failures matter most; a bounded share crosses regions. */
export function franchiseBrandFactor(s:V4State,cityId:string,asOfWeek=s.week){
 const region=regionForCity(cityId);let localGood=0,localTotal=0,globalGood=0,globalTotal=0;
 for(const w of s.franchiseHistory??[]){if(w.week>=asOfWeek||w.week<asOfWeek-8)continue;for(const row of w.cohorts){const c=s.franchiseCohorts?.find(c=>c.id===row.cohortId);if(!c?.openedWeek||c.openedWeek>w.week)continue;const weight=c.stores;globalTotal+=weight;if(row.compliant)globalGood+=weight;if(regionForCity(row.cityId)===region){localTotal+=weight;if(row.compliant)localGood+=weight;}}}
 const local=localTotal?(localGood/localTotal-.85)*.16:0,global=globalTotal?(globalGood/globalTotal-.85)*.04:0;
 return Math.max(.8,Math.min(1.05,1+local+global));
}
