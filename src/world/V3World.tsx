import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowUpRight,Box,Compass,Factory,FlaskConical,Globe2,Leaf,MapPin,Minus,Plus,Ship,Store,Users,Wallet,BookOpen,PackageCheck} from 'lucide-react';
import type {State} from '../../game/engine';
import {capabilities} from '../../game/journey';
import {createV3World,V3_DESTINATIONS,v3Hotspots,type V3Controller,type WorldLocation,type WorldAction,type V3ProjectedAnchor} from './scene';
import './v3-world.css';
export type {WorldLocation,WorldAction} from './scene';
const icons:Record<string,typeof Factory>={factory:Factory,production:Factory,machines:Factory,staff:Users,inventory:Box,research:FlaskConical,dispatch:PackageCheck,office:Wallet,buyer:Users,supplier:Ship,market:Store,terminal:Globe2,news:BookOpen,discovery:Leaf};

type CalloutRect={left:number;top:number;right:number;bottom:number};
const overlap=(a:CalloutRect,b:CalloutRect,padding=0)=>Math.max(0,Math.min(a.right+padding,b.right)-Math.max(a.left-padding,b.left))*Math.max(0,Math.min(a.bottom+padding,b.bottom)-Math.max(a.top-padding,b.top));
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));

export default function V3World({s,location,interior,onInteract,highlight,sceneArea}:{s:State;location:WorldLocation;interior:boolean;onInteract:(action:WorldAction)=>void;highlight?:string;sceneArea?:string}){
 const host=useRef<HTMLDivElement>(null),world=useRef<V3Controller|null>(null),labels=useRef<Record<string,HTMLButtonElement|null>>({}),leaders=useRef<Record<string,SVGGElement|null>>({}),labelLayer=useRef<HTMLDivElement>(null),lastPoints=useRef<Record<string,V3ProjectedAnchor>>({}),placements=useRef(new Map<string,string>()),pick=useRef(onInteract);
 const [failed,setFailed]=useState(false),[ready,setReady]=useState(false),[area,setArea]=useState(0),[selection,setSelection]=useState('');
 pick.current=onInteract;
 const destination=V3_DESTINATIONS[location],caps=capabilities(s),spots=v3Hotspots(location,interior).filter(p=>(p.id!=='research'||caps.research)&&(p.id!=='terminal'||caps.travel)&&(p.id!=='factory'||location==='sf'||caps.factories)).map(p=>{if(p.id==='staff'&&location==='sf')return {...p,label:s.v3.chapter===0?'Meet Nadia':s.v3.chapter===1&&!interior?'Captain Leda':'Nadia · your crew'};if(p.id==='factory'){const id=location==='sf'?'quay':location==='oakland'?'riverside':'northline',owned=s.growth.factories.some(f=>f.id===id);return {...p,label:owned?(location==='sf'?'Your workshop':location==='oakland'?'Your Oakland factory':'Your Turin factory'):'Factory for sale'};}return p;}),visible=spots.filter(p=>interior||p.area===area||p.area===-1);
 function positionLabels(points:Record<string,V3ProjectedAnchor>){
  lastPoints.current=points;const canvas=host.current,layer=labelLayer.current;if(!canvas||!layer)return;
  // Read actual CSS sizes before writing transforms. No device-specific marker offsets.
  const canvasRect=canvas.getBoundingClientRect(),layerRect=layer.getBoundingClientRect(),ox=canvasRect.left-layerRect.left,oy=canvasRect.top-layerRect.top;
  const app=canvas.closest('.v3-app')||canvas.parentElement!;
  const obstacles=Array.from(app.querySelectorAll<HTMLElement>('.v3-hud,.v3-bottom,.v3-place-caption,.v3-leave-floor,.v3-camera-tools,.v3-neighbourhoods,.v3-travel-status')).filter(el=>el.getClientRects().length&&el.offsetWidth>0).map(el=>{const r=el.getBoundingClientRect();return {left:r.left-layerRect.left,top:r.top-layerRect.top,right:r.right-layerRect.left,bottom:r.bottom-layerRect.top}});
  const entries=Object.entries(labels.current).filter((entry):entry is [string,HTMLButtonElement]=>!!entry[1]).map(([id,el])=>({id,el,point:points[id],width:el.offsetWidth,height:el.offsetHeight}));
  const priority=['inventory','machines','research','production','staff','dispatch'];if(interior)entries.sort((a,b)=>priority.indexOf(a.id)-priority.indexOf(b.id));
  const targets=entries.filter(e=>e.point?.visible).map(e=>({id:e.id,x:e.point.x+ox,y:e.point.y+oy,bounds:{left:e.point.bounds.left+ox,top:e.point.bounds.top+oy,right:e.point.bounds.right+ox,bottom:e.point.bounds.bottom+oy}}));
  const occupied:CalloutRect[]=[],result:{id:string;el:HTMLButtonElement;rect:CalloutRect;point:V3ProjectedAnchor;tx:number;ty:number}[]=[];
  for(const {id,el,point,width,height}of entries){const leader=leaders.current[id];if(!point?.visible){el.style.visibility='hidden';el.tabIndex=-1;el.dataset.inView='false';if(leader)leader.style.visibility='hidden';continue}
   const tx=point.x+ox,ty=point.y+oy;
   const directions:Record<string,[number,number][]>= {above:[[0,-1],[-1,-1],[1,-1],[-1,0],[1,0],[0,1],[-1,1],[1,1]],below:[[0,1],[1,1],[-1,1],[1,0],[-1,0],[0,-1],[1,-1],[-1,-1]],left:[[-1,0],[-1,1],[-1,-1],[0,1],[0,-1],[1,0],[1,1],[1,-1]],right:[[1,0],[1,1],[1,-1],[0,1],[0,-1],[-1,0],[-1,1],[-1,-1]]};
   let best:CalloutRect|undefined,bestScore=Infinity,bestKey='';
   for(const gap of[10,28,48])for(const [rank,[dx,dy]]of directions[point.side].entries()){
    const left=clamp(tx+(dx===0?-width/2:dx<0?-width-gap:gap),ox+8,ox+canvasRect.width-width-8),top=clamp(ty+(dy===0?-height/2:dy<0?-height-gap:gap),oy+8,oy+canvasRect.height-height-8);
    const rect={left,top,right:left+width,bottom:top+height},key=`${dx}:${dy}:${gap}`,distance=Math.hypot(tx-clamp(tx,left,rect.right),ty-clamp(ty,top,rect.bottom));
    let score=distance+rank*3+(placements.current.get(id)===key?-7:0);
    for(const taken of occupied)score+=overlap(rect,taken,6)*1000;
    for(const obstacle of obstacles)score+=overlap(rect,obstacle,5)*100;
    for(const target of targets){score+=overlap(rect,target.bounds,3)*.5;if(target.x>rect.left-6&&target.x<rect.right+6&&target.y>rect.top-6&&target.y<rect.bottom+6)score+=6000;}
    if(score<bestScore){bestScore=score;best=rect;bestKey=key}
   }
   if(best){placements.current.set(id,bestKey);occupied.push(best);result.push({id,el,rect:best,point,tx,ty})}
  }
  for(const {id,el,rect,point,tx,ty}of result){el.style.transform=`translate3d(${rect.left}px,${rect.top}px,0)`;el.style.visibility='visible';el.tabIndex=0;el.dataset.inView='true';el.dataset.anchorX=tx.toFixed(2);el.dataset.anchorY=ty.toFixed(2);el.dataset.anchorSource=point.source;
   const leader=leaders.current[id];if(!leader)continue;const cx=(rect.left+rect.right)/2,cy=(rect.top+rect.bottom)/2,dx=tx-cx,dy=ty-cy,scale=Math.min(Math.abs(dx)>.01?(rect.right-rect.left)/2/Math.abs(dx):Infinity,Math.abs(dy)>.01?(rect.bottom-rect.top)/2/Math.abs(dy):Infinity,1),line=leader.querySelector('line')!,dot=leader.querySelector('circle')!;
   line.setAttribute('x1',String(cx+dx*scale));line.setAttribute('y1',String(cy+dy*scale));line.setAttribute('x2',String(tx));line.setAttribute('y2',String(ty));dot.setAttribute('cx',String(tx));dot.setAttribute('cy',String(ty));leader.style.visibility='visible';
  }
 }
 const layout=useRef(positionLabels);layout.current=positionLabels;
 useEffect(()=>{setArea(0);setSelection('');setReady(false);setFailed(false);lastPoints.current={};placements.current.clear();if(!host.current)return;let instance:V3Controller|null=null;
  try{instance=createV3World(host.current,location,interior,id=>{setSelection(id);pick.current(id)},points=>layout.current(points));world.current=instance;instance.setState(s);setReady(true);}catch(error){console.error('3D destination could not start',error);setFailed(true)}
  return()=>{instance?.dispose();world.current=null};
 },[location,interior]);
 useEffect(()=>{world.current?.setState(s)},[s]);
 useEffect(()=>{world.current?.setArea(area)},[area]);
 useEffect(()=>{if(sceneArea){const n=destination.areas.findIndex(a=>a.id===sceneArea);if(n>=0)setArea(n)}},[sceneArea,location]);
 useEffect(()=>{world.current?.highlight(highlight||selection)},[highlight,selection,ready]);
 useEffect(()=>{if(!ready||failed)return;const observer=new ResizeObserver(()=>layout.current(lastPoints.current));if(host.current)observer.observe(host.current);for(const el of Object.values(labels.current))if(el)observer.observe(el);const app=host.current?.closest('.v3-app');app?.querySelectorAll('.v3-hud,.v3-bottom').forEach(el=>observer.observe(el));let live=true;document.fonts?.ready.then(()=>{if(live)layout.current(lastPoints.current)});layout.current(lastPoints.current);return()=>{live=false;observer.disconnect()}},[ready,failed,location,interior,visible.map(p=>p.id+':'+p.label).join('|')]);
 function interact(id:string){setSelection(id);world.current?.highlight(id);onInteract(id)}
 return <section className={`v3-world ${interior?'v3-interior':''} ${failed?'v3-world-failed':''}`} aria-label={`${destination.name} ${interior?'factory interior':'interactive world'}`}>
  <div className="v3-canvas" ref={host}/><div className="v3-scene-shade"/>
  {!ready&&!failed&&<div className="v3-world-loading"><Compass size={24}/><span>Arriving in {destination.name}…</span></div>}
  <div className="v3-place-caption"><span>{interior?'THE FACTORY FLOOR':destination.region}</span><strong>{interior?(location==='sf'?'The original workshop':location==='oakland'?'Oakland Factory':'Turin Works'):destination.name}</strong><small>{interior?'Select a machine, person or workbench':destination.areas[area]?.description}</small></div>
  {interior&&<button className="v3-leave-floor" onClick={()=>onInteract('exterior')}><ArrowLeft size={15}/> Outside</button>}
  {!failed&&<div className="v3-object-labels" ref={labelLayer}><svg className="v3-callout-leaders" aria-hidden="true" focusable="false">{visible.map(p=><g key={p.id} ref={el=>{leaders.current[p.id]=el}} data-action={p.id} style={{visibility:'hidden'}}><line/><circle className="v3-callout-target" r="2.5"/></g>)}</svg>{visible.map(p=>{const Icon=icons[p.id.split(':')[0]]||MapPin;const learned=p.id.startsWith('discovery:')&&s.travel.learned.includes(p.id.slice(10) as never);return <button key={p.id} ref={el=>{labels.current[p.id]=el}} className={`v3-object-label ${highlight===p.id||selection===p.id?'is-highlighted':''} ${p.id==='factory'&&s.growth.factories.some(f=>f.id===(location==='sf'?'quay':location==='oakland'?'riverside':'northline'))?'is-home':''} ${learned?'is-discovered':''}`} onClick={()=>interact(p.id)} aria-label={`${p.label}${learned?' · discovered':''}`}><span className="v3-object-icon"><Icon size={15}/></span><span>{p.label}</span>{learned?<span className="v3-discovered-mark">✓</span>:<ArrowUpRight className="v3-object-arrow" size={12}/>}</button>})}</div>}
  {failed&&<div className="v3-world-access"><Compass/><h2>Explore {destination.name}</h2><p>The 3D view is unavailable on this device. Every destination and activity is still accessible.</p><div>{spots.map(p=>{const Icon=icons[p.id.split(':')[0]]||MapPin;return <button key={p.id} onClick={()=>interact(p.id)}><Icon size={18}/>{p.label}<ArrowUpRight size={14}/></button>})}</div></div>}
  {!failed&&<>
   <div className="v3-camera-tools" aria-label="Camera controls"><button aria-label="Zoom in" onClick={()=>world.current?.zoom(.18)}><Plus size={17}/></button><button aria-label="Zoom out" onClick={()=>world.current?.zoom(-.18)}><Minus size={17}/></button><button aria-label="Reset camera" onClick={()=>world.current?.reset()}><Compass size={18}/></button></div>
   {!interior&&<nav className="v3-neighbourhoods" aria-label={`Explore ${destination.name}`}>{destination.areas.map((a,i)=><button key={a.id} aria-pressed={area===i} onClick={()=>{setArea(i);setSelection('')}}><span className="v3-area-dot"/>{a.name}</button>)}</nav>}
   <p className="v3-world-gesture">Drag to orbit <span>·</span> Tap a place to explore</p>
  </>}
 </section>
}
