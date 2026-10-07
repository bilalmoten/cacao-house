import { useEffect, useRef, useState } from 'react';
import type { V4State } from '../../game/v4/model';
import { scoreAssistedTrial, scoreTimedTrial, type TrialSample, type HandoffSignal, type TrialHandoff } from '../../game/v4/activity';
import { commissioningProfile } from '../../game/v4/process';
import { catalog } from '../../game/v4/catalog';
import type { Dispatch } from './types';
const stations: TrialHandoff[] = ['tempering', 'cooling', 'packing'];
export function TrialActivity({ state, dispatch }: {
    state: V4State;
    dispatch: Dispatch;
}) {
    const factory = state.factories.find(f=>f.cityId===state.currentCityId), [recipe, setRecipe] = useState('embar62:r1'), [mode, setMode] = useState<'assisted' | 'timed'>('assisted'), [temperature, setTemperature] = useState(31), [stir, setStir] = useState(45), [cool, setCool] = useState(60), [order, setOrder] = useState<TrialHandoff[]>([]), [extended, setExtended] = useState(false), [running, setRunning] = useState(false), [paused, setPaused] = useState(false), [seconds, setSeconds] = useState(0), [notice, setNotice] = useState(''), [evidence, setEvidence] = useState<{
        samples: TrialSample[];
        handoffs: HandoffSignal[];
    } | null>(null);
    const active = useRef(0), last = useRef(0), samples = useRef<TrialSample[]>([]), signals = useRef<HandoffSignal[]>([]), settings = useRef({ temperature: .5, agitation: .55, cooling: .7 });
    settings.current = { temperature: (temperature - 28.5) / 6, agitation: stir / 100, cooling: cool / 100 };
    const record = () => { const sample = { ...settings.current, at: active.current }; if (samples.current.at(-1)?.at === sample.at)
        samples.current[samples.current.length - 1] = sample;
    else
        samples.current.push(sample); };
    useEffect(() => { if (running && !paused)
        record(); }, [temperature, stir, cool]);
    useEffect(() => { if (!running || paused)
        return; last.current = performance.now(); const timer = window.setInterval(() => { const now = performance.now(); active.current = Math.min(60, active.current + (now - last.current) / 1000); last.current = now; setSeconds(active.current); if (active.current >= 60) {
        record();
        setEvidence({ samples: structuredClone(samples.current), handoffs: structuredClone(signals.current) });
        setRunning(false);
        setNotice('Trial complete. Review the measured result before paying to adopt it.');
    } }, 100); return () => clearInterval(timer); }, [running, paused]);
    useEffect(() => { const hide = () => { if (document.hidden && running) {
        record();
        setPaused(true);
        setNotice('Trial paused while the window is hidden. Resume when ready.');
    } }; document.addEventListener('visibilitychange', hide); return () => document.removeEventListener('visibilitychange', hide); }, [running]);
    let scored;
    try {
        scored = mode === 'assisted' ? scoreAssistedTrial(settings.current, order) : evidence ? scoreTimedTrial(evidence.samples, evidence.handoffs, extended) : undefined;
    }
    catch { }
    let profile;
    try {
        if (factory && scored)
            profile = commissioningProfile(state, factory.id, recipe, mode, scored.controls);
    }
    catch { }
    const reset = () => { setRunning(false); setEvidence(null); active.current = 0; setSeconds(0); setOrder([]); setNotice(''); };
    const adopt = async (practice = false) => { if (!factory)
        return; const ok = await dispatch({ type: 'process-trial', factoryId: factory.id, recipeRevisionId: recipe, mode, settings: settings.current, handoffs: order, ...(evidence ?? {}), extendedWindows: extended, practice }); if (ok)
        setNotice(practice ? 'Free practice complete. Your saved production method is unchanged.' : 'Paid trial recorded. A better valid method is retained automatically; a worse attempt cannot replace it.'); };
    const cue = seconds < 20 ? 'tempering' : seconds < 40 ? 'cooling' : 'packing';
    const timerPanel = <div className={`v4-method-card ${running ? 'v4-trial-hud' : ''}`}><strong>{seconds.toFixed(1)} / 60 active seconds</strong><progress aria-label="Active commissioning time" max={60} value={seconds}/><p role="status">{running ? `${paused ? 'Paused' : 'Approaching'} ${cue} handoff · ${signals.current.length} / 3 recorded` : evidence ? 'Run complete' : 'Ready to start'}</p><div className="v4-row">{stations.map(station => <button className="v4-button secondary" key={station} disabled={!running || paused || signals.current.length >= 3} onClick={() => { signals.current.push({ station, at: active.current }); setNotice(`${station} handed over at ${active.current.toFixed(1)} seconds`); }}>Handoff to {station}</button>)}</div><button className="v4-button secondary" disabled={!running} onClick={() => { record(); setPaused(p => !p); }}>{paused ? 'Resume trial' : 'Pause trial'}</button></div>;
    return <><h3>Set a repeatable method.</h3><p>Commissioning costs $80 per factory and recipe after you review the result. Practice is free. Your crew must have the competency to reproduce the method; this does not create extra machine minutes.</p><label>Recipe<select aria-label="Recipe" disabled={running} value={recipe} onChange={e => { setRecipe(e.target.value); reset(); }}>{state.recipeRevisions.map(r => <option key={r.id} value={r.id}>{catalog.recipes.find(c => c.id === r.recipeId)?.name}</option>)}</select></label><label>Activity mode<select aria-label="Activity mode" disabled={running} value={mode} onChange={e => { setMode(e.target.value as typeof mode); reset(); }}><option value="assisted">Untimed assisted setup</option><option value="timed">60-second active commissioning</option></select></label>{mode === 'timed' && timerPanel}<div className="v4-method-card"><strong>Method card</strong><p>Tempering target 31.5°C · agitation 55 rpm · cooling flow 70%. Handoff order: tempering → cooling → packing. Timed signals peak at 20, 40 and 55 active seconds; pause stops the clock.</p></div>{[{ label: 'Tempering temperature', value: temperature, set: setTemperature, min: 28.5, max: 34.5, step: .1, unit: '°C' }, { label: 'Agitation', value: stir, set: setStir, min: 0, max: 100, step: 1, unit: 'rpm' }, { label: 'Cooling flow', value: cool, set: setCool, min: 0, max: 100, step: 1, unit: '%' }].map(c => <label key={c.label}>{c.label} · {c.value}{c.unit}<input type="range" min={c.min} max={c.max} step={c.step} value={c.value} disabled={paused} onChange={e => c.set(Number(e.target.value))}/></label>)}
 {mode === 'assisted' ? <div className="v4-three">{stations.map((_, i) => <label key={i}>Handoff {i + 1}<select aria-label={`Handoff ${i + 1}`} value={order[i] ?? ''} onChange={e => setOrder(old => { const next = [...old]; next[i] = e.target.value as TrialHandoff; return next; })}><option value="">Choose station</option>{stations.map(s => <option key={s}>{s}</option>)}</select></label>)}</div> : <><label className="v4-check"><input type="checkbox" checked={extended} disabled={running || !!evidence} onChange={e => setExtended(e.target.checked)}/>Extended timing windows · same economic ceiling</label><div className="v4-row"><button className="v4-button" disabled={running || !factory || !state.employees.length} onClick={() => { active.current = 0; samples.current = [{ ...settings.current, at: 0 }]; signals.current = []; setSeconds(0); setEvidence(null); setPaused(false); setRunning(true); setNotice('Trial started; use keyboard controls or touch.'); }}>Run 60-second trial</button></div></>}
 {profile && <div className="v4-metrics"><span>Consistency<strong>{profile.consistency.toFixed(0)} / 100</strong></span><span>Expected yield<strong>{(profile.expectedYield * 100).toFixed(1)}%</strong></span><span>Cycle<strong>{profile.cycleMinutes} min/case</strong></span><span>Required crew competency<strong>{profile.requiredCompetency} / 100</strong></span></div>}<div className="v4-row"><button className="v4-button secondary" disabled={!factory || !state.employees.length || !profile || running} onClick={() => void adopt(true)}>Practice method</button><button className="v4-button" disabled={!factory || !state.employees.length || !profile || running || (mode === 'assisted' && (order.length !== 3 || stations.some((_, i) => !order[i])))} onClick={() => void adopt()}>Commission method · $80</button></div>{notice && <p role="status">{notice}</p>}<p>Sliders support arrow keys. Timed handoffs use ordinary keyboard-focusable buttons. Reduced-motion preferences retain static signals and the same outcomes. Untimed setup reaches the same best result.</p>{state.employees.filter(e => e.role === 'engineer' && e.factoryId === factory?.id && e.skills.setup >= 65).map(e => <button className="v4-button secondary" key={e.id} onClick={() => void dispatch({ type: 'engineer-commission', employeeId: e.id, factoryId: factory!.id, recipeRevisionId: recipe })}>Book {e.name} · $200 · 10 crew hours · ready next week</button>)}</>;
}
