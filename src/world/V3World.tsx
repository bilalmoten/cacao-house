import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowUpRight,Box,Compass,Factory,FlaskConical,Globe2,Leaf,MapPin,Minus,Plus,Ship,Store,Users,Wallet,BookOpen,PackageCheck} from 'lucide-react';
import type {State} from '../../game/engine';
import {capabilities} from '../../game/journey';
import {createV3World,V3_DESTINATIONS,v3Hotspots,type V3Controller,type WorldLocation,type WorldAction} from './scene';
import './v3-world.css';
export type {WorldLocation,WorldAction} from './scene';
const icons:Record<string,typeof Factory>={factory:Factory,production:Factory,machines:Factory,staff:Users,inventory:Box,research:FlaskConical,dispatch:PackageCheck,office:Wallet,buyer:Users,supplier:Ship,market:Store,terminal:Globe2,news:BookOpen,discovery:Leaf};

export default function V3World({s,location,interior,onInteract,highlight,sceneArea}:{s:State;location:WorldLocation;interior:boolean;onInteract:(action:WorldAction)=>void;highlight?:string;sceneArea?:string}){
 const host=useRef<HTMLDivElement>(null),world=useRef<V3Controller|null>(null),labels=useRef<Record<string,HTMLButtonElement|null>>({}),pick=useRef(onInteract);
 const [failed,setFailed]=useState(false),[ready,setReady]=useState(false),[area,setArea]=useState(0),[selection,setSelection]=useState('');
 pick.current=onInteract;
 const destination=V3_DESTINATIONS[location],caps=capabilities(s),spots=v3Hotspots(location,interior).filter(p=>(p.id!=='research'||caps.research)&&(p.id!=='terminal'||caps.travel)&&(p.id!=='factory'||location==='sf'||caps.factories)).map(p=>p.id==='staff'&&location==='sf'?{...p,label:s.v3.chapter===0?'Meet Nadia':s.v3.chapter===1&&!interior?'Captain Leda':'Nadia · your crew'}:p),visible=spots.filter(p=>interior||p.area===area||p.area===-1);
 useEffect(()=>{setArea(0);setSelection('');setReady(false);setFailed(false);if(!host.current)return;let instance:V3Controller|null=null;
  try{instance=createV3World(host.current,location,interior,id=>{setSelection(id);pick.current(id)},points=>{for(const [id,el] of Object.entries(labels.current)){if(!el)continue;const p=points[id];el.style.transform=p?`translate3d(${p.x}px,${p.y}px,0) translate(-50%,-100%)`:'';el.style.visibility=p?.visible?'visible':'hidden';el.dataset.inView=p?.visible?'true':'false';}});world.current=instance;instance.setState(s);setReady(true);}catch(error){console.error('3D destination could not start',error);setFailed(true)}
  return()=>{instance?.dispose();world.current=null};
 },[location,interior]);
 useEffect(()=>{world.current?.setState(s)},[s]);
 useEffect(()=>{world.current?.setArea(area)},[area]);
 useEffect(()=>{if(sceneArea){const n=destination.areas.findIndex(a=>a.id===sceneArea);if(n>=0)setArea(n)}},[sceneArea,location]);
 useEffect(()=>{world.current?.highlight(highlight||selection)},[highlight,selection,ready]);
 function interact(id:string){setSelection(id);world.current?.highlight(id);onInteract(id)}
 return <section className={`v3-world ${interior?'v3-interior':''} ${failed?'v3-world-failed':''}`} aria-label={`${destination.name} ${interior?'factory interior':'interactive world'}`}>
  <div className="v3-canvas" ref={host}/><div className="v3-scene-shade"/>
  {!ready&&!failed&&<div className="v3-world-loading"><Compass size={24}/><span>Arriving in {destination.name}…</span></div>}
  <div className="v3-place-caption"><span>{interior?'THE FACTORY FLOOR':destination.region}</span><strong>{interior?(location==='sf'?'The original workshop':location==='oakland'?'Oakland Factory':'Turin Works'):destination.name}</strong><small>{interior?'Select a machine, person or workbench':destination.areas[area]?.description}</small></div>
  {interior&&<button className="v3-leave-floor" onClick={()=>onInteract('exterior')}><ArrowLeft size={15}/> Outside</button>}
  {!failed&&<div className="v3-object-labels">{visible.map(p=>{const Icon=icons[p.id.split(':')[0]]||MapPin;const learned=p.id.startsWith('discovery:')&&s.travel.learned.includes(p.id.slice(10) as never);return <button key={p.id} ref={el=>{labels.current[p.id]=el}} className={`v3-object-label ${highlight===p.id||selection===p.id?'is-highlighted':''} ${p.id==='factory'?'is-home':''} ${learned?'is-discovered':''}`} onClick={()=>interact(p.id)} aria-label={`${p.label}${learned?' · discovered':''}`}><span className="v3-object-icon"><Icon size={15}/></span><span>{p.label}</span>{learned?<span className="v3-discovered-mark">✓</span>:<ArrowUpRight className="v3-object-arrow" size={12}/>}</button>})}</div>}
  {failed&&<div className="v3-world-access"><Compass/><h2>Explore {destination.name}</h2><p>The 3D view is unavailable on this device. Every destination and activity is still accessible.</p><div>{spots.map(p=>{const Icon=icons[p.id.split(':')[0]]||MapPin;return <button key={p.id} onClick={()=>interact(p.id)}><Icon size={18}/>{p.label}<ArrowUpRight size={14}/></button>})}</div></div>}
  {!failed&&<>
   <div className="v3-camera-tools" aria-label="Camera controls"><button aria-label="Zoom in" onClick={()=>world.current?.zoom(.18)}><Plus size={17}/></button><button aria-label="Zoom out" onClick={()=>world.current?.zoom(-.18)}><Minus size={17}/></button><button aria-label="Reset camera" onClick={()=>world.current?.reset()}><Compass size={18}/></button></div>
   {!interior&&<nav className="v3-neighbourhoods" aria-label={`Explore ${destination.name}`}>{destination.areas.map((a,i)=><button key={a.id} aria-pressed={area===i} onClick={()=>{setArea(i);setSelection('')}}><span className="v3-area-dot"/>{a.name}</button>)}</nav>}
   <p className="v3-world-gesture">Drag to orbit <span>·</span> Tap a place to explore</p>
  </>}
 </section>
}
