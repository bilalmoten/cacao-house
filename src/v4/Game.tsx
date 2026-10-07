import {Franchise} from './Franchise';
import{worldSourceRoute}from'../../game/v4/world-sources';
import{campaignChapters}from'../../game/v4/campaign';
import{ConsumerChannels}from'./ConsumerChannels';
import {Delegation} from './Delegation';
import {managementTurn} from '../../game/v4/management';
import {Network} from './Network';
import {Travel} from './Travel';
import {RegionalPlace} from './RegionalPlace';
import {catalog} from '../../game/v4/catalog';
import {regionalPlaces} from '../../game/v4/world-routes';
import {Campaign} from './Campaign';
import {RecipeLab} from './RecipeLab';
import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Compass, Mail, Menu, Play, BookOpen, ChartNoAxesCombined, Package, ArrowRight } from 'lucide-react';
import type { V4State, BrandIdentity } from '../../game/v4/model';
import { applyCommand } from '../../game/v4/commands';
import { resolveWeek } from '../../game/v4/tick';
import { openingGuide } from '../../game/v4/onboarding';
import { serializeV4, LEGACY_KEY, newV4 } from '../../game/v4/saves';
import { IndexedSlots } from './persistence';
import World from './World';
import Sheet from './Sheet';
import Founding from './Founding';
import Emblem from './Emblem';
import { Equipment, People, Trial, Supplies, Production } from './Operations';
import { Orders, Commitments, Inbox, Reports } from './Business';
import { money, type PlayerAction } from './types';
import '../v3/app.css';
import './game.css';
const Legacy = lazy(() => import('../App'));
type Panel = 'franchise' | 'consumer' | 'delegation' | 'network' | 'travel' | 'place' | 'campaign' | 'lab' | 'equipment' | 'people' | 'trial' | 'supplies' | 'production' | 'orders' | 'commitments' | 'inbox' | 'reports' | 'explore' | 'office' | 'guide' | 'settings';
const PREVIEW_SLOT = 'preview-2026-10-06';
const titles: Record<Panel, string> = {franchise:'Partners & field support',consumer:'Stores & ecommerce',delegation:'Management authority',network:'Premises & logistics',travel:'Travel & introductions',place:'Regional workplace',campaign:'Your house story', lab:'Recipe development lab', equipment: 'The first line', people: 'Your team', trial: 'Process studio', supplies: 'Rafi’s pantry', production: 'Production & prices', orders: 'Leda’s buyer desk', commitments: 'Cash & commitments', inbox: 'Messages', reports: 'Reports Centre', explore: 'Explore San Francisco', office: 'The house office', guide: 'Nadia’s guidance', settings: 'Settings & saves' };
const places = [{ id: 'workshop', name: 'Waterfront workshop', detail: 'Inspect the floor; configure machines, crew and production.' }, { id: 'rafi-pantry', name: 'Rafi’s pantry', detail: 'Ingredient quality, packaging, purchasing and dated freight.' }, { id: 'ferry-cafe', name: 'Ferry Café · Leda', detail: 'A real order, its delivery promise and settlement terms.' }, { id: 'office', name: 'House office', detail: 'Cash, commitments, reports and your next decision.' },{id:'flagship',name:'Owned store',detail:'Visit the real local store and review its assortment, customer service and contribution.'}];
function download(raw: string, name: string) { const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' })), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export default function Game() {
    const db = useRef(new IndexedSlots()), live = useRef<{
        state: V4State;
        revision: number;
    } | null>(null), lock = useRef(false), [state, setState] = useState<V4State | null>(null), [loaded, setLoaded] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [panel, setPanel] = useState<Panel | null>(null), [interior, setInterior] = useState(false), [place,setPlace]=useState('workshop'),[sourceTarget,setSourceTarget]=useState<ReturnType<typeof worldSourceRoute>|undefined>(),[area, setArea] = useState('quay'), [newHouse,setNewHouse]=useState(false),[legacy, setLegacy] = useState(false), file = useRef<HTMLInputElement>(null);
    const accept = useCallback((r: {
        state: V4State;
        revision: number;
    }) => { live.current = r; setState(r.state); }, []);
    useEffect(() => { let mounted = true; void db.current.load(PREVIEW_SLOT).then(r => { if (!mounted)
        return; if (r.ok)
        accept(r);
    else if (r.error !== 'No V4 house in this slot.')
        setMessage(r.error); setLoaded(true); }); return () => { mounted = false; }; }, [accept]);
    useEffect(()=>{if(!state)return;setInterior(false);setArea(state.currentCityId==='sf'?'quay':'street');setPlace(state.currentCityId==='sf'?'workshop':regionalPlaces(state.currentCityId)[0]?.id??'');},[state?.currentCityId]);
    useEffect(() => { if (!message)
        return; const timer = setTimeout(() => setMessage(''), 8000); return () => clearTimeout(timer); }, [message]);
    useEffect(()=>{if(!state||!sourceTarget||state.currentCityId!==sourceTarget.cityId||state.trip||busy||lock.current)return;const target=sourceTarget;setSourceTarget(undefined);void visit(target.locationId,target.franchise?'franchise':target.consumer?'consumer':undefined);},[state?.currentCityId,state?.trip,busy,sourceTarget]);
    const backdrop = useRef(newV4({ founder: 'Founder', business: 'Your house', emblem: 'cocoa', primary: '#184f45', accent: '#cd925a' }));
    const close = useCallback(() => setPanel(null), []);
    async function dispatch(action: PlayerAction) { if (lock.current || !live.current)
        return false; lock.current = true; setBusy(true); try {
        const result = applyCommand(live.current.state, { ...action, id: action.type + ':' + crypto.randomUUID() });
        if (!result.ok) {
            setMessage(result.error);
            return false;
        }
        if (!result.events.length) {
            setMessage('Practice complete. Your saved method and cash are unchanged.');
            return true;
        }
        const saved = await db.current.commit(PREVIEW_SLOT, result.state, live.current.revision);
        if (!saved.ok) {
            setMessage(saved.error);
            return false;
        }
        accept(saved);
        setMessage(({ 'place-module':'Floor saved. The next batches use these handoff routes.', 'process-trial':'The paid trial is saved for this factory and recipe.', 'finance-recovery':'Financing saved. Review the new repayment and your operating plan.', 'select-equipment': 'Your first line is installed.', hire: 'Your colleague has joined the workshop.', commission: 'The method is saved for this factory and recipe.', purchase: 'Ingredient stock purchased at its landed cost.', 'purchase-packaging': 'Physical packs purchased. Check receiving space and arrival date.', 'production-plan': 'Your production targets are saved.', 'set-price': 'Asking price updated.', 'select-packaging': 'Future batches will use the selected packaging.', 'expand-storage': 'Expansion booked. New receiving space opens in two weeks.', 'set-reserve': 'Operating reserve saved.' } as Record<string, string>)[action.type] ?? '');
        return true;
    }
    finally {
        lock.current = false;
        setBusy(false);
    } }
    async function create(identity: BrandIdentity, financing: 'standard' | 'leveraged') { if (lock.current)
        return; lock.current = true; setBusy(true); try {
        let r;if(newHouse&&live.current){let fresh=newV4(identity,Math.floor(Date.now()%4294967295));const funding=applyCommand(fresh,{id:'founder-financing',type:'select-funding',package:financing});if(!funding.ok){setMessage(funding.error);return;}fresh=funding.state;r=await db.current.import(PREVIEW_SLOT,serializeV4(fresh),live.current.revision);}else r=await db.current.create(PREVIEW_SLOT, identity, 42, financing);
        if (!r.ok) {
            setMessage(r.error);
            return;
        }
        accept(r);setNewHouse(false);setInterior(false);setPlace('workshop');
        setPanel('inbox');
    }
    finally {
        lock.current = false;
        setBusy(false);
    } }
    async function visit(id: string, task?: Panel) { if (!state||newHouse)
        return; if(state.currentCityId!=='sf'){const destinations=regionalPlaces(state.currentCityId),p=destinations.find(p=>p.id===id);if(!p){setPanel('explore');return;}if(!await dispatch({type:'visit-location',cityId:state.currentCityId,locationId:p.id}))return;setPlace(p.id);setArea(p.area?'operations':'street');setInterior(true);setPanel(task??'place');return;} const location = places.some(p => p.id === id) ? id : id === 'sf-storage' || id === 'sf-workshop' ? 'workshop' : id === 'rafi' ? 'rafi-pantry' : 'office'; if (!await dispatch({ type: 'visit-location', cityId: 'sf', locationId: location }))
        return; setArea(location === 'office' || location === 'ferry-cafe' ? 'hill' : 'quay'); setPlace(location);setInterior(location === 'workshop'||location==='office'||location==='flagship'); setPanel(task ?? (location === 'workshop' ? null : location === 'rafi-pantry' ? 'supplies' : location === 'ferry-cafe' ? 'orders' : location==='flagship'?'consumer':'office')); }
    function drillSource(id:string){if(!state)return;const target=worldSourceRoute(state,id);if(target.cityId!==state.currentCityId){setSourceTarget(target);setPanel('travel');return;}void visit(target.locationId,target.franchise?'franchise':target.consumer?'consumer':undefined);}
    function interact(id: string) {if(state?.currentCityId==='sf'&&interior&&['reports','campaign','people','delegation','commercial','display'].includes(id)){setPanel(id==='commercial'||id==='display'?'consumer':id as Panel);return;} if(id==='terminal'){setPanel('travel');return;}if(id.startsWith('place:')){void visit(id.slice(6));return;}if(state&&state.currentCityId!=='sf'&&id!=='exterior'){if(['production','machines','staff','inventory','research','dispatch'].includes(id)&&regionalPlaces(state.currentCityId).find(p=>p.id===place)?.kind==='production'){if(!state.factories.some(f=>f.cityId===state.currentCityId)){setPanel('network');return;}setPanel(id==='production'?'production':id==='machines'?'equipment':id==='staff'?'people':id==='inventory'?'supplies':id==='research'?'trial':'orders');return;}setPanel(id==='reports'?'reports':id==='campaign'?'campaign':id==='delegation'?'delegation':'place');return;} if (id === 'exterior') {
        setInterior(false);
        close();
        return;
    } if (id === 'factory') {
        void visit('workshop');
        return;
    } if (id === 'supplier') {
        void visit('rafi-pantry');
        return;
    } if (id === 'buyer') {
        void visit('ferry-cafe');
        return;
    } if (id === 'staff') {
        void visit('workshop', 'people');
        return;
    } if (id === 'office' || id === 'news') {
        void visit('office', 'office');
        return;
    } if (id === 'market') {
        void visit('office', 'production');
        return;
    } if (id === 'production' || id === 'machines' || id === 'inventory' || id === 'dispatch' || id === 'research') {
        void visit('workshop', id === 'production' ? 'production' : id === 'machines' ? 'equipment' : id === 'inventory' ? 'supplies' : id === 'research' ? 'trial' : state&&state.campaign.stage>=2?'network':'orders');
        return;
    } setPanel('explore'); }
    async function reviewTurn(weeks:4|13){if(lock.current||!live.current)return;lock.current=true;setBusy(true);try{const initial=live.current,existing=initial.state.managementReview,review=managementTurn(initial.state,weeks,existing?.weeks===weeks?existing.id:'review:'+crypto.randomUUID());let committed=0;for(const checkpoint of review.checkpoints){const saved=await db.current.commit(PREVIEW_SLOT,checkpoint,live.current!.revision,true);if(!saved.ok){setMessage(saved.error+' Earlier review weeks remain saved.');return;}accept(saved);committed++;await new Promise<void>(resolve=>setTimeout(resolve,0));}setMessage(`${committed} operating weeks saved. ${review.reason}`);if(committed)setPanel('reports');}finally{lock.current=false;setBusy(false);}}
    async function closeWeek() { if (lock.current || !live.current)
        return; lock.current = true; setBusy(true); try {
        const current = live.current, r = resolveWeek(current.state, { tickId: 'close:' + current.state.week, expectedWeek: current.state.week });
        if (!r.ok) {
            setMessage(r.error);
            return;
        }
        const saved = await db.current.commit(PREVIEW_SLOT, r.state, current.revision, true);
        if (!saved.ok) {
            setMessage(saved.error);
            return;
        }
        accept(saved);
        setPanel('reports');
        setMessage(`Week ${current.state.week} closed and saved. Profit ${money(r.state.snapshots.at(-1)!.profitCents)}; cash ${money(r.state.cashCents)}.`);
    }
    finally {
        lock.current = false;
        setBusy(false);
    } }
    if (legacy)
        return <Suspense fallback={<p>Opening your existing house…</p>}><Legacy /></Suspense>;
    if (!loaded)
        return <main className="v4-loading">Opening your house…</main>;
    if (!state||newHouse)
        return <main className="v3-app v4-app"><World state={backdrop.current} interior={false} inactive onInteract={() => { }}/><Founding busy={busy} error={message} onCreate={(i, f) => void create(i, f)} onLegacy={() => setLegacy(true)}/></main>;
    const story=campaignChapters[state.campaign.completedChapters.length], guide = openingGuide(state), focus = guide.focus, guideTask: Partial<Record<string, Panel>> = { equipment: 'equipment', staff: 'people', trial: 'trial', supplier: 'supplies', buyer: 'orders', plan: 'production', preview: 'commitments', close: 'commitments', outcome: 'reports' };
    const common = { state, dispatch }, unread = state.updates.filter(u => u.readWeek === undefined).length;
    function content() { const house = state; if (!house)
        return null; switch (panel) {
        case 'consumer':return <><ConsumerChannels {...common}/>{house.campaign.stage>=5&&<button className="v4-button secondary" onClick={()=>setPanel('franchise')}>Partners and field support</button>}</>;
        case 'franchise':return <Franchise {...common}/>;
        case 'delegation':return <Delegation {...common} busy={busy} onReview={weeks=>void reviewTurn(weeks)}/>;
        case 'network':return <Network {...common}/>;
        case 'travel':return <Travel {...common} targetCityId={sourceTarget?.cityId} onCloseWeek={()=>void closeWeek()}/>;
        case 'place':return <RegionalPlace {...common} placeId={place} onTask={setPanel}/>;
        case 'equipment': return <Equipment {...common}/>;
        case 'people': return <People {...common}/>;
        case 'trial': return <><Trial {...common}/>{house.campaign.stage>=2&&<button className="v4-button secondary" onClick={()=>setPanel('lab')}>Enter recipe development lab</button>}</>;
        case 'lab': return <RecipeLab {...common}/>;
        case 'campaign':return <Campaign onNewHouse={()=>{download(serializeV4(state),'cacao-house-v4-completed-house.json');setNewHouse(true);setPanel(null);}} {...common} onWorld={id=>void visit(id)} onTravel={()=>setPanel('travel')}/>;
        case 'supplies': return <Supplies {...common}/>;
        case 'production': return <Production {...common}/>;
        case 'orders': return <Orders {...common}/>;
        case 'commitments': return <Commitments {...common} busy={busy} onCloseWeek={() => void closeWeek()}/>;
        case 'inbox': return <Inbox {...common} onWorld={drillSource}/>;
        case 'reports': return <Reports {...common} onWorld={drillSource}/>;
        case 'explore':if(house.currentCityId!=='sf')return <><h3>{catalog.cities.find(c=>c.id===house.currentCityId)?.name}</h3><div className="v4-cards">{regionalPlaces(house.currentCityId).map(p=><article key={p.id}><h4>{p.label}</h4><p>{p.contact} · {p.kind}</p><button className="v4-button" onClick={()=>void visit(p.id)}>Visit {p.label}</button></article>)}</div><button className="v4-button secondary" onClick={()=>setPanel('travel')}>Travel onward</button></>;return <><p>Explore a place for its people and decisions. The workshop has an operating floor; Rafi and Leda have distinct commercial terms.</p><div className="v4-cards">{places.filter(p=>p.id!=='flagship'||house.consumerChannels?.some(c=>c.kind==='owned-retail'&&c.cityId==='sf'&&c.readyWeek<=house.week)).map(p => <article key={p.id}><h3>{p.name}</h3><p>{p.detail}</p><button className="v4-button" onClick={() => void visit(p.id)}>Visit {p.name}</button></article>)}</div>{house.campaign.stage>=2&&<button className="v4-button secondary" onClick={()=>setPanel('travel')}>Travel onward</button>}</>;
        case 'office': return <><small className="v4-eyebrow">{house.identity.business}</small><h3>A business you can understand.</h3><p>Reports Centre links dated accounts, production and stock to the places behind them. Nadia’s messages explain decisions as you encounter them.</p><div className="v4-cards">{(['campaign', 'reports', 'commitments', 'inbox', 'guide', 'lab','delegation','consumer'] as const).map(id => <button className="v4-button secondary" key={id} onClick={() => setPanel(id)}>{titles[id]}</button>)}</div></>;
        case 'guide': return <><p>Help can pause or replay without changing commercial progress.</p><div className="v4-row"><button className="v4-button" onClick={() => void dispatch({ type: 'guide-control', mode: 'guided' })}>Resume guidance</button><button className="v4-button secondary" onClick={() => void dispatch({ type: 'guide-control', mode: 'paused' })}>Pause guidance</button><button className="v4-button secondary" onClick={() => void dispatch({ type: 'guide-control', mode: 'explore' })}>Explore freely</button></div><div className="v4-list">{guide.steps.map(step => <div key={step.id}><strong>{step.complete ? '✓ ' : ''}{step.title}</strong><p>{step.prompt}</p><button className="v4-link" onClick={async () => { if (await dispatch({ type: 'guide-control', mode: 'replay', stepId: step.id }))
            void visit(step.targetLocationId, guideTask[step.id]); }}>Show this topic</button></div>)}</div></>;
        case 'settings': return <><h3>V4 playtest preview</h3><p>The opening workshop is playable. Later regional and global systems are implemented but their complete campaign, balance and finale are not yet verified. Preview saves use a separate slot; older V4 development saves and legacy saves are preserved. Export before testing and expect changes in later releases.</p><p>Your V4 house saves separately in this browser. Export moves it between devices. Legacy saves retain their original rules and bytes.</p><div className="v4-list"><button className="v4-button" onClick={() => download(serializeV4(house), 'cacao-house-v4.json')}>Export this house</button><button className="v4-button secondary" onClick={() => file.current?.click()}>Import V4 house</button><button className="v4-button secondary" onClick={async () => { if (lock.current || !live.current)
            return; lock.current = true; setBusy(true); try {
            const r = await db.current.restore(PREVIEW_SLOT, live.current.revision);
            if (r.ok) {
                accept(r);
                setMessage('Earlier checkpoint restored.');
            }
            else
                setMessage(r.error);
        }
        finally {
            lock.current = false;
            setBusy(false);
        } }}>Restore previous weekly checkpoint</button><button className="v4-button secondary" onClick={() => setLegacy(true)}>Continue legacy house</button><button className="v4-button secondary" onClick={() => { const raw = localStorage.getItem(LEGACY_KEY); if (raw)
            download(raw, 'cacao-house-legacy.json');
        else
            setMessage('No legacy house saved here.'); }}>Export preserved legacy save</button><button className="v4-button secondary" onClick={() => setPanel('guide')}>Help & guidance</button></div><p>Drag to pan the city, pinch to zoom. Keyboard place buttons and the Explore menu reach every opening activity. Motion follows your device preference.</p></>;
        default: return null;
    } }
    return <main className="v3-app v4-app sf-trial"><div className="v4-preview-tag">V4 PLAYTEST PREVIEW</div><World state={state} interior={interior} inactive={!!panel || busy} onInteract={interact} area={area} place={place} highlight={state.currentCityId==='sf'&&guide.showPrompt ? focus?.targetLocationId === 'workshop' ? 'factory' : focus?.targetLocationId === 'rafi-pantry' ? 'supplier' : focus?.targetLocationId === 'ferry-cafe' ? 'buyer' : 'office' : undefined}/><header className="v3-hud"><button className="v3-location" onClick={() => { setInterior(false); close(); }}><Compass size={17}/><span>{catalog.cities.find(c=>c.id===state.currentCityId)?.name}{interior && <small>{state.currentCityId==='sf'?(place==='office'?'Commercial floor':place==='flagship'?'Owned store':'Workshop floor'):place.replaceAll('-',' ')}</small>}</span></button><button className="v3-cash" aria-label="Cash details" onClick={() => setPanel('commitments')}>{money(state.cashCents)}</button><span className="v3-week">W{state.week}</span><button className="v3-icon" aria-label={`Messages${unread ? ` · ${unread} unread` : ''}`} onClick={() => setPanel('inbox')}><Mail size={20}/>{unread > 0 && <i />}</button><button className="v3-icon" aria-label="Menu" onClick={() => setPanel('settings')}><Menu size={21}/></button></header>{!panel && <><div className="v4-house-mark"><Emblem id={state.identity.emblem} size={22}/><span>{state.identity.business}</span></div>{interior&&state.currentCityId==='sf'&&place==='workshop' && <nav className="v4-floor-actions" aria-label="Workshop actions">{(['equipment', 'people', 'trial', 'production', 'supplies', 'lab'] as const).map(id => <button key={id} onClick={() => setPanel(id)}>{titles[id]}</button>)}{state.campaign.stage>=2&&<button onClick={()=>setPanel('network')}>Pack & dispatch</button>}</nav>}<div className="v3-bottom"><button disabled={busy} className="v3-mission guided" onClick={() => state.currentCityId!=='sf'?setPanel('explore'):guide.showPrompt && focus ? void visit(focus.targetLocationId, guideTask[focus.id]) : setPanel('campaign')}><span className="v3-mission-icon"><BookOpen size={18}/></span><span><small>{state.currentCityId!=='sf'?'LOCAL INTRODUCTIONS':guide.showPrompt ? 'NADIA’S GUIDANCE' : story ? 'YOUR HOUSE STORY' : guide.complete ? 'YOUR HOUSE IS OPERATING' : 'YOUR NEXT DECISION'}</small><strong>{state.currentCityId!=='sf'?`${catalog.cities.find(c=>c.id===state.currentCityId)?.contact} · visit the local workplaces and discover their terms.`:guide.showPrompt ? focus?.prompt : story ? `${story.lead}: ${story.objective}` : guide.complete ? 'Keep your promises. Build a repeatable business.' : 'Explore your house and choose the next promise.'}</strong></span><ArrowRight size={16}/></button><nav className="v3-world-toolbar" aria-label="World tools"><button onClick={() => setPanel('explore')}><Compass size={19}/><span>Explore</span></button><button onClick={() => setPanel('reports')}><ChartNoAxesCombined size={19}/><span>Reports</span></button><button onClick={() => setPanel('orders')}><Package size={19}/><span>Orders</span></button><button className="v3-next" disabled={busy} onClick={() => setPanel('commitments')}><Play size={18}/><span>Next week</span></button></nav></div></>}{panel && <Sheet pending={busy} title={state.currentCityId!=='sf'&&panel==='orders'?'Regional buyer desk':state.currentCityId!=='sf'&&panel==='supplies'?'Supply routes & receiving':titles[panel]} context={`${state.identity.business} · WEEK ${state.week}`} onClose={close} wide={['reports', 'supplies', 'equipment'].includes(panel)}><fieldset className="v4-panel-content" disabled={busy}>{content()}</fieldset></Sheet>}{message && <div role="status" className={`v4-toast ${panel?'with-panel':''}`}><span>{message}</span><button aria-label="Dismiss notification" onClick={() => setMessage('')}>×</button></div>}<input ref={file} hidden aria-label="Import V4 house" type="file" accept=".json,application/json" onChange={async (e) => { const selected = e.target.files?.[0]; e.target.value = ''; if (!selected || lock.current || !live.current)
        return; if (selected.size > 16 * 1024 * 1024) {
        setMessage('Save exceeds the supported import size.');
        return;
    } lock.current = true; setBusy(true); try {
        const r = await db.current.import(PREVIEW_SLOT, await selected.text(), live.current.revision);
        if (r.ok) {
            accept(r);
            setMessage('House imported; previous house kept as a checkpoint.');
        }
        else
            setMessage(r.error);
    }
    catch {
        setMessage('The selected file could not be read. Your house is unchanged.');
    }
    finally {
        lock.current = false;
        setBusy(false);
    } }}/></main>;
}
