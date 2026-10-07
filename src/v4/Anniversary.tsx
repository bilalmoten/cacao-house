import type {V4State} from '../../game/v4/model';
import {anniversaryMemories,anniversaryRegions} from '../../game/v4/anniversary';
import {qualifiedRecipes} from '../../game/v4/campaign';
import {catalog} from '../../game/v4/catalog';

export function Anniversary({state,guestId}:{state:V4State;guestId:string}){
 const guest=anniversaryMemories(state).find(g=>g.id===guestId);
 if(!state.campaign.flags['global-finale']||!guest)return <p>The anniversary begins after Nadia’s final operating review.</p>;
 return <><small className="v4-eyebrow">HEADQUARTERS ANNIVERSARY · {guest.city.toUpperCase()}</small><h3>{guest.name} remembers your house</h3><p>{state.identity.founder}, the display carries {state.identity.business}’s {qualifiedRecipes(state).length} qualified products. Its operating routes now span {anniversaryRegions(state).map(r=>r.replaceAll('-',' ')).join(', ')}.</p>{guest.decisions.length?<div className="v4-cards">{guest.decisions.map(d=><article key={d.title}><small>YOUR DECISION · WEEK {d.week}</small><h4>{d.title}</h4><strong>{d.choice}</strong><p>{d.scene}</p></article>)}</div>:<p>Your conversations still have room to grow. Visit {guest.name} at the original workplace to continue the relationship’s operating decisions.</p>}<details><summary>The encounters that brought you here</summary>{guest.encounters.map(e=><article key={e.title}><h4>{e.title} · W{e.week}</h4><p>{e.scene}</p></article>)}</details><details><summary>Your qualified collection</summary>{qualifiedRecipes(state).map(id=><p key={id}>{catalog.recipes.find(r=>r.id===id)!.name}</p>)}</details><p className="v4-note">The business continues with its existing people, methods, customers and promises. Reports retain the costs and results of every recorded choice.</p></>;
}
