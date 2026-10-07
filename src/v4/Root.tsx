import {lazy,Suspense,useRef,useState} from 'react';
import {createSlot,importSlot,loadSlot,restoreSlot,serializeV4,LEGACY_KEY} from '../../game/v4/saves';
import type {SlotStorage,V4State,SaveLoadResult} from '../../game/v4/model';
import './save-boundary.css';

// The existing engine/world are imported only when the player chooses legacy.
const V4Game=lazy(()=>import('./Game'));
const LegacyApp=lazy(()=>import('../App'));
const storage:SlotStorage={getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)};
const slot='founder';
function exportFile(raw:string,name:string) {
  const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function SaveBoundary() {
  const [state,setState]=useState<V4State|null>(()=>{const result=loadSlot(storage,slot);return result.ok?result.state:null;});
  const [founder,setFounder]=useState(''),[business,setBusiness]=useState(''),[message,setMessage]=useState(''),[legacy,setLegacy]=useState(false);
  const importSequence=useRef(0);
  function result(value:SaveLoadResult,success:string) {
    if(value.ok){setState(value.state);setMessage(success);}else setMessage(value.error);
  }
  if(legacy)return <Suspense fallback={<p>Opening your existing house…</p>}><LegacyApp/></Suspense>;
  return <main className="v4-save-boundary">
    <h1>V4 save checkpoint</h1>
    <p>This development checkpoint keeps new V4 saves separate from your existing house.</p>
    <section aria-label="New V4 slot">
      <h2>{state?`${state.identity.business} · Week ${state.week}`:'Create a separate house'}</h2>
      {!state&&<form onSubmit={event=>{event.preventDefault();result(createSlot(storage,slot,{founder:founder.trim(),business:business.trim(),emblem:'cocoa',primary:'#184f45',accent:'#cd925a'}),'Separate V4 slot saved.');}}>
        <label>Founder<input required maxLength={80} value={founder} onChange={event=>setFounder(event.target.value)}/></label>
        <label>House name<input required maxLength={80} value={business} onChange={event=>setBusiness(event.target.value)}/></label>
        <button type="submit">Create separate V4 slot</button>
      </form>}
      {state&&<div className="v4-save-actions">
        <button onClick={()=>exportFile(serializeV4(state),'cacao-house-v4-founder.json')}>Export V4 save</button>
        <button onClick={()=>result(restoreSlot(storage,slot),'Earlier checkpoint restored.')}>Restore earlier checkpoint</button>
      </div>}
      <label>Import V4 save<input type="file" accept=".json,application/json" onChange={async event=>{
        const selected=event.target.files?.[0];event.target.value='';if(!selected)return;
        const request=++importSequence.current;
        if(selected.size>16*1024*1024){setMessage('Save exceeds the supported import size.');return;}
        try {const raw=await selected.text();if(request===importSequence.current)result(importSlot(storage,slot,raw),'V4 save imported; earlier state kept as a checkpoint.');}
        catch{if(request===importSequence.current)setMessage('The selected file could not be read. Your house is unchanged.');}
      }}/></label>
    </section>
    <section aria-label="Existing house">
      <h2>Existing house</h2>
      <p>Continue with its original game rules or export it separately.</p>
      <div className="v4-save-actions">
        <button onClick={()=>setLegacy(true)}>Continue existing house</button>
        <button onClick={()=>{try {const raw=storage.getItem(LEGACY_KEY);if(raw)exportFile(raw,'cacao-house-legacy.json');else setMessage('No existing house is saved in this browser.');}catch{setMessage('Browser save storage is unavailable.');}}}>Export existing house</button>
      </div>
    </section>
    {message&&<p role="alert">{message}</p>}
  </main>;
}
export default function Root() {
  const params=new URLSearchParams(window.location.search);
  if(params.get('v4')==='save-boundary')return <SaveBoundary/>;
  return <Suspense fallback={<p>Opening your house…</p>}>{params.get('legacy')==='1'?<LegacyApp/>:<V4Game/>}</Suspense>;
}
