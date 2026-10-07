import {paintBrandMark} from './BrandSign';
import type{CommercialAppearance}from'./CommercialAppearance';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createHarbourWater} from './HarbourWater';

type Side = 'above' | 'below' | 'left' | 'right';
export interface SanFranciscoContext {
 onCommerce?:(update:(appearance:CommercialAppearance)=>void)=>void;
 onBrand?:(update:(name:string,primary:string,accent:string,emblem?:string)=>void)=>void;
 ground:T.Group;
 mesh:(p:T.Object3D,geometry:T.BufferGeometry,c:string,x?:number,y?:number,z?:number,metal?:number)=>T.Mesh;
 box:(p:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,c:string,metal?:number)=>T.Mesh;
 cyl:(p:T.Object3D,x:number,y:number,z:number,rt:number,rb:number,h:number,c:string,n?:number,metal?:number)=>T.Mesh;
 orb:(p:T.Object3D,x:number,y:number,z:number,r:number,c:string)=>T.Mesh;
 group:(p:T.Object3D,x?:number,y?:number,z?:number)=>T.Group;
 interactive:(g:T.Object3D,id:string)=>T.Object3D;
 bindAnchor:(owner:T.Object3D,id:string,position:[number,number,number],side?:Side,explicit?:boolean)=>T.Object3D;
 mat:(color:string,metal?:number)=>T.MeshStandardMaterial;
 textures:T.Texture[];
 updates:((t:number)=>void)[];
 merge:(g:T.Group)=>void;
 tree:(p:T.Object3D,x:number,z:number,size?:number,color?:string,y?:number)=>T.Group;
 person:(p:T.Object3D,x:number,z:number,c:string,scale?:number,y?:number)=>T.Group;
 crate:(p:T.Object3D,x:number,y:number,z:number,size?:number,c?:string)=>T.Group;
 sign:(p:T.Object3D,text:string,x:number,y:number,z:number,w:number,h?:number,color?:string)=>T.Mesh;
 awning:(p:T.Object3D,x:number,y:number,z:number,w:number,d:number,c:string)=>void;
 deliveryVan:(x:number,z:number)=>T.Group;
}

export const SAN_FRANCISCO_ANCHORS:Record<string,[number,number,number]>={
 factory:[-3,4.3,6],supplier:[4.8,4.4,6.9],terminal:[5.8,7.1,-12.05],
 staff:[-3,1.5,7.5],buyer:[-9,6,-16],market:[-3.3,7.5,-19.6],
 office:[3.8,6.7,-19.5],research:[-7.2,4.6,-13.5],
};

/** The district is one connected piece of shoreline, with a bay beyond and a working marina below. */
export function buildSanFrancisco(c:SanFranciscoContext){
 const {ground,mesh,box,cyl,orb,group,interactive,bindAnchor,mat,textures,updates,merge,tree,person,crate,sign,awning}=c;
 const stone='#dfcdb0',edge='#f1dec0',dark='#294a4d',copper='#d38a42';
 for(const color of['#738c40','#83995b','#718b51','#8d9c3e','#5a7838']){const foliage=mat(color);foliage.flatShading=true;foliage.color.set(color==='#738c40'?'#789433':color==='#83995b'?'#96a843':color);}
 mat(copper,.78).roughness=.25;mat(copper,.72).roughness=.28;
 let randomSeed=416;
 const random=()=>{randomSeed=(randomSeed*16807)%2147483647;return randomSeed/2147483647};
 function canvasTexture(size:number,paint:(ctx:CanvasRenderingContext2D,size:number)=>void){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;paint(canvas.getContext('2d')!,size);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);return texture;
 }
 const brick=canvasTexture(512,(q,s)=>{q.fillStyle='#d9aa85';q.fillRect(0,0,s,s);for(let row=0;row<16;row++)for(let col=-1;col<9;col++){const x=col*64+(row%2)*32,y=row*32;q.fillStyle=['#aa603b','#c77b4b','#ce8350','#bc7043'][Math.floor(random()*4)];q.fillRect(x+1.5,y+2,61,28);q.fillStyle='rgba(70,34,19,.18)';q.fillRect(x+3,y+27,58,2);}for(let i=0;i<9000;i++){q.fillStyle=random()>.5?'rgba(245,201,151,.07)':'rgba(71,41,21,.08)';q.fillRect(random()*s,random()*s,1+random()*2,1)} });
 brick.wrapS=brick.wrapT=T.RepeatWrapping;brick.repeat.set(1,1);
 const brickMaterial=new T.MeshStandardMaterial({color:'#fff4e5',map:brick,bumpMap:brick,bumpScale:.028,roughness:.86});
 const paving=canvasTexture(512,(q,s)=>{q.fillStyle='#dfcdb0';q.fillRect(0,0,s,s);for(let row=0;row<8;row++)for(let col=-1;col<9;col++){const x=col*64+(row%2)*32,y=row*64;q.fillStyle=['#decdb0','#e3d2b6','#d8c6a8','#e9d9bd'][Math.floor(random()*4)];q.fillRect(x+1,y+1,62,62);q.strokeStyle='rgba(111,103,85,.21)';q.strokeRect(x+1,y+1,62,62)} });
 paving.wrapS=paving.wrapT=T.RepeatWrapping;paving.repeat.set(5,4);
 const pavingMaterial=new T.MeshStandardMaterial({map:paving,color:'#fff1d8',roughness:.9,bumpMap:paving,bumpScale:.023});
 const glass=new T.MeshStandardMaterial({color:'#597c78',roughness:.12,metalness:.25,transparent:true,opacity:.2,depthWrite:false});
 const warm=new T.MeshStandardMaterial({color:'#edbd57',emissive:'#ec9d22',emissiveIntensity:1.9,roughness:.75});
 const warmFloor=new T.MeshStandardMaterial({color:'#c39149',emissive:'#a6641d',emissiveIntensity:.4,roughness:.8});
 const copperSurface=new T.MeshStandardMaterial({color:'#bd713a',roughness:.3,metalness:.58,envMapIntensity:1.6});
 const copperCrown=new T.MeshStandardMaterial({color:'#d99552',roughness:.25,metalness:.64,envMapIntensity:1.9});
 const copperRim=new T.MeshStandardMaterial({color:'#ecb56c',roughness:.21,metalness:.72,envMapIntensity:2});
 const interiorWall=new T.MeshStandardMaterial({color:'#b88d49',emissive:'#985e24',emissiveIntensity:.38,roughness:.87});
 const sageSurface=new T.MeshStandardMaterial({color:'#6d865f',roughness:.8});
 function painted(m:T.Mesh,material:T.Material){m.material=material;if(material===glass)m.castShadow=false;return m}
 function paver(p:T.Object3D,x:number,y:number,z:number,w:number,d:number){
  let surface=pavingMaterial;if(w>40){const tiling=paving.clone();tiling.repeat.set(w/6.2,d/3.07);textures.push(tiling);surface=new T.MeshStandardMaterial({map:tiling,color:'#fff1d8',roughness:.9,bumpMap:tiling,bumpScale:.023});}
  return painted(box(p,x,y,z,w,.12,d,stone),surface);
 }
 function masonry(p:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number){
  const m=box(p,x,y,z,w,h,d,'#b97956'),positions=m.geometry.getAttribute('position'),normals=m.geometry.getAttribute('normal'),uv=m.geometry.getAttribute('uv');
  for(let i=0;i<positions.count;i++){
   const px=positions.getX(i)+x,py=positions.getY(i)+y,pz=positions.getZ(i)+z;
   if(Math.abs(normals.getY(i))>.5)uv.setXY(i,px/2.88,pz/2.24);
   else uv.setXY(i,(Math.abs(normals.getX(i))>.5?pz:px)/2.88,py/2.24);
  }
  uv.needsUpdate=true;return painted(m,brickMaterial);
 }
 function beam(p:T.Object3D,a:T.Vector3,b:T.Vector3,r:number,color:string,segments=7){const middle=a.clone().add(b).multiplyScalar(.5);const m=cyl(p,middle.x,middle.y,middle.z,r,r,a.distanceTo(b),color,segments);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());return m}
 function rail(p:T.Object3D,x:number,z:number,length:number,y=0,alongZ=false){const g=group(p,x,y,z);if(alongZ)g.rotation.y=Math.PI/2;for(let i=0;i<=Math.floor(length/1.6);i++){const xx=-length/2+i*1.6;cyl(g,xx,.48,0,.065,.085,.96,dark,10);cyl(g,xx,.98,0,.105,.105,.065,'#bdbbaa',10)}for(const yy of[.43,.87])box(g,0,yy,0,length,.045,.045,dark);return g}
 function bollard(p:T.Object3D,x:number,z:number,y=.13){const g=group(p,x,y,z);cyl(g,0,.37,0,.13,.17,.75,'#3c5153',12);cyl(g,0,.74,0,.19,.19,.11,'#a0a59b',12);box(g,0,.56,0,.48,.09,.11,'#3c5153');return g}
 function lamp(p:T.Object3D,x:number,z:number,y=0){const g=group(p,x,y,z);cyl(g,0,.13,0,.15,.22,.25,dark,12);cyl(g,0,1.42,0,.044,.085,2.7,dark,10);box(g,0,2.73,0,.26,.4,.26,'#f0d698');cyl(g,0,2.98,0,0,.24,.19,dark,4);return g}
 function planter(x:number,z:number,s=1,y=.1){const g=group(ground,x,y,z);box(g,0,.2,0,1.5*s,.4,1.5*s,stone);box(g,0,.43,0,1.64*s,.13,1.64*s,edge);box(g,0,.48,0,1.36*s,.04,1.36*s,'#726f48');tree(g,0,0,s,'#738c40',.48);
  if(x>-12&&x<11&&z>-.5&&z<8){const variation=Math.sin(x*1.7+z*.3);orb(g,-.36*s,2.42*s+.48,.2*s,.52*s,'#718b51');orb(g,.32*s,2.55*s+.48,-.08*s,.5*s,variation>0?'#8d9c3e':'#5a7838');orb(g,.12*s,2.1*s+.48,.37*s,.46*s,'#83995b');}
  return g;
 }
 function skylight(p:T.Object3D,x:number,z:number,y:number,w:number,d:number){const g=group(p,x,y,z);box(g,0,.07,0,w+.18,.15,d+.18,'#d2c5a8');const top=box(g,0,.21,0,w,.085,d,'#436b78',.5);top.rotation.x=.16;for(let i=0;i<5;i++){const q=box(g,-w/2+i*w/4,.25,0,.025,.04,d,'#c3cdc4',.5);q.rotation.x=.16}for(const zz of[-d/2,d/2])box(g,0,.25+zz*.16,zz,w,.045,.04,'#c3cdc4',.5);return g}
 function acUnit(p:T.Object3D,x:number,z:number,y:number){box(p,x,y+.22,z,.65,.44,.7,'#d4d2bc');for(let i=0;i<5;i++)box(p,x-.23+i*.115,y+.23,z+.36,.037,.25,.02,'#8b998e');cyl(p,x,y+.46,z,.2,.2,.025,'#758780',12)}
 function solidAwning(p:T.Object3D,x:number,y:number,z:number,w:number,d:number,color='#41694f'){
  const canopy=box(p,x,y,z,w,.095,d,color);canopy.rotation.x=.15;box(p,x,y-.15,z+d/2,w,.24,.07,color);
  for(let i=0;i<Math.round(w/.4);i++){const seam=box(p,x-w/2+.18+i*.4,y+.054,z,.025,.016,d,'#5d7c56');seam.rotation.x=.15;}
  for(const xx of[x-w/2+.06,x+w/2-.06])box(p,xx,y/2,z+d/2-.1,.05,y,.05,'#53674c');
 }

 // Large, continuous landmass: the back-left city reaches out of frame rather than floating in an empty sea.
 const land=new T.Shape();land.moveTo(-85,9);land.lineTo(85,9);land.lineTo(85,-20);land.lineTo(25,-25);land.lineTo(10,-30);land.lineTo(-3,-34);land.lineTo(-6,-40);land.lineTo(-85,-40);land.closePath();
 const terrain=mesh(ground,new T.ExtrudeGeometry(land,{depth:1.5,bevelEnabled:false,steps:1}),'#b0a58b',0,.05,0);terrain.rotation.x=Math.PI/2;
 paver(ground,-.5,.08,2.8,169,12.3);paver(ground,-22,.07,-15,32,44);paver(ground,.1,.08,-10.9,29.6,28.8);
 // Seawall has deep piers, visible courses, and a pale coping that follows the entire quay.
 const quay=group(ground,0,0,8.8);box(quay,0,-.68,0,170,1.45,.65,'#aaa68e');box(quay,0,.12,0,170,.28,.98,edge);
 for(let row=0;row<3;row++)for(let i=0;i<114;i++)box(quay,-84+i*1.5+(row%2)*.75,-1.16+row*.44,.34,1.43,.39,.06,row%2?'#b0ac95':'#bab49b');
 for(let i=0;i<92;i++){const x=-84+i*1.85;box(quay,x,-.56,.48,.35,1.65,.42,'#979b90');box(quay,x,.28,.47,.47,.15,.54,edge);bollard(quay,x,.12,.28)}
 rail(ground,-8.4,8.25,11,.18);rail(ground,10.5,8.25,8,.18);
 // Foreground return walkway and a mooring finger create a real sheltered harbour inlet.
 paver(ground,-11.8,.06,13.1,6.5,9);box(ground,-8.5,-.6,13.1,.6,1.4,9,'#a6a58e');box(ground,-8.5,.12,13.1,.85,.28,9,edge);rail(ground,-8.4,13.2,8.3,.17,true);
 paver(ground,-3,.08,11.9,8.6,1.9);box(ground,-3,-.6,12.9,8.9,1.45,.65,'#a9a891');box(ground,-3,.18,12.94,9,.2,.9,edge);
 for(const x of[-6.8,-4.6,-2.4,-.2]){box(ground,x,-.52,12.95,.35,1.7,.48,'#8a9590');bollard(ground,x,12.68,.18)}
 // Boulevard behind the workshop: kerbs, lanes, tram rails, crossing and connected city steps.
 box(ground,0,.16,-6.1,165,.14,10.2,'#737c7a');for(const z of[-11.31,-.89])box(ground,0,.23,z,165,.2,.22,edge);
 for(const z of[-6.29,-6.13])box(ground,0,.244,z,165,.018,.04,'#dcba62');
 for(const z of[-9.18,-8.48])box(ground,0,.254,z,165,.025,.035,'#586f70',.6);
 paver(ground,0,.26,-11.86,165,1.05);
 for(let i=0;i<24;i++)box(ground,-2.9,.255,-10.9+i*.42,2.8,.018,.17,'#efe6cd');
 for(let i=0;i<13;i++)box(ground,-14+i*2.25,.252,-3.5,1.1,.022,.075,'#e8e3cf');
 paver(ground,-5.4,.26,-11.86,19.8,1.05);paver(ground,6.5,.26,-11.82,12,1.1);
 const city=group(ground,-8,0,-17.2);box(city,0,.7,0,15,1.5,10,'#bab49b');paver(city,0,1.5,0,15,10);box(city,0,.8,5.02,15,1.4,.23,'#c3bba3');
 for(let i=0;i<10;i++){box(ground,-2.9,.26+(i+1)*.065,-11.62-i*.34,4,(i+1)*.13,.39,stone);box(ground,-2.9,.26+(i+1)*.13,-11.51-i*.34,4,.045,.46,edge)}
 for(const x of[-5.04,-.76]){const side=box(ground,x,.86,-13.24,.3,1.7,3.55,stone);side.rotation.x=-.1;}
 rail(ground,-9.5,-12.3,6.3,1.54);

 // Warm, transparent factory bays reveal real tables, shelves and chocolate machines.
 const factory=group(ground,-3,.2,3.5);const fw=6.8,fd=5,fh=4.05;
 paver(factory,0,0,0,7.15,5.3);masonry(factory,0,2.05,-2.37,fw,fh,.25);
 masonry(factory,-3.27,2.05,0,.26,fh,fd);masonry(factory,3.27,2.05,-1.5,.26,fh,2);
 masonry(factory,0,3.7,2.39,fw,.75,.23);masonry(factory,0,.18,2.39,fw,.32,.23);
 for(const x of[-3.25,-1.65,1.7,3.25])masonry(factory,x,1.85,2.39,.32,3.35,.26);
 // Exterior right corner is glass, giving the target's open, glowing workshop character.
 for(const x of[-2.45,-.85,.8,2.5]){
  painted(box(factory,x,1.78,2.45,1.3,2.9,.035,'#8a9e8c'),glass);
  for(const xx of[x-.65,x+.65])box(factory,xx,1.78,2.49,.055,2.97,.065,dark);
  for(const yy of[.38,1.15,2.13,3.23])box(factory,x,yy,2.49,1.34,.055,.065,dark);
 }
 painted(box(factory,3.3,1.77,.78,.025,2.9,3.2,'#899b84'),glass);
 for(const z of[-.82,.28,1.37,2.38])box(factory,3.33,1.78,z,.055,2.98,.055,dark);
 for(const y of[.38,1.15,2.13,3.23])box(factory,3.33,y,.78,.06,.055,3.27,dark);
 painted(box(factory,0,1.4,-2.19,6.1,2.35,.045,'#e5bf76'),interiorWall);
 painted(box(factory,0,.12,0,6.35,.08,4.55,'#b18a57'),warmFloor);
 for(const x of[-1.9,.6]){box(factory,x,.9,1.26,1.75,.13,.85,'#bd9458');for(const xx of[x-.7,x+.7])for(const z of[.95,1.55])box(factory,xx,.45,z,.09,.9,.09,'#605c42');for(let i=0;i<5;i++)box(factory,x-.61+i*.3,1.03,1.3,.2,.14,.32,'#71432b');}
 for(const x of[-2.1,0,1.9]){box(factory,x,1.6,-1.78,1.7,.1,.45,'#795f3f');for(let i=0;i<4;i++)box(factory,x-.6+i*.4,1.81,-1.77,.26,.32,.28,['#a96c36','#c39d58','#69513b'][i%3])}
 for(const x of[-2.1,1.9]){for(const xx of[x-.85,x+.85])box(factory,xx,1.53,-1.74,.075,2.62,.13,'#4f5742');for(const y of[.65,2.48]){box(factory,x,y,-1.74,1.82,.12,.55,'#665238');for(let i=0;i<5;i++)box(factory,x-.7+i*.34,y+.21,-1.72,.25,.32,.31,i%2?'#d1b477':'#895c36');}}
 for(const x of[-1.8,1.25]){cyl(factory,x,1.13,-.9,.56,.5,1.5,copper,24,.72);cyl(factory,x,1.92,-.9,.61,.61,.11,'#dda065',24,.75);cyl(factory,x,2.1,-.9,.09,.12,.35,'#7a6b4c',12,.6)}
 person(factory,-.4,.4,'#ead5a7',.78,.15);
 const display=group(factory,2.1,0,1.5);box(display,0,.86,0,1.3,.11,.8,'#d1aa69');for(const x of[-.5,.5])box(display,x,.42,0,.08,.84,.08,'#6c6047');for(let i=0;i<8;i++){box(display,-.43+(i%4)*.28,.98+Math.floor(i/4)*.12,0,.2,.11,.33,i%3?'#653c25':'#946038');}
 for(const x of[-1.3,1.3]){cyl(factory,x,3.18,.48,.018,.018,.42,'#736545',6);cyl(factory,x,2.91,.48,.09,.29,.2,'#52704f',16);const bulb=orb(factory,x,2.8,.48,.11,'#f5c365');bulb.material=warm;}
 box(factory,0,4.12,0,7.13,.22,5.3,'#d89d76');box(factory,0,4.25,0,6.72,.09,4.8,'#687c75');
 for(const z of[-2.52,2.52])masonry(factory,0,4.43,z,7,.38,.2);for(const x of[-3.45,3.45])masonry(factory,x,4.43,0,.2,.38,5.05);
 for(const x of[-.95,.65]){box(factory,x,4.37,-.35,1.6,.14,1.7,'#4e6258');cyl(factory,x,4.96,-.35,.53,.58,1.04,copper,32,.78);const dome=mesh(factory,new T.SphereGeometry(.53,24,12,0,Math.PI*2,0,Math.PI/2),'#d18b4c',x,5.5,-.35,.8);dome.scale.y=.65;cyl(factory,x,5.91,-.35,.1,.13,.15,'#99552d',16,.7);cyl(factory,x,6,-.35,.19,.19,.07,'#b8743d',16,.7);for(const zz of[-.93,.25])beam(factory,new T.Vector3(x-.72,4.55,zz),new T.Vector3(x+.72,4.55,zz),.045,'#a89669');}
 for(const x of[-.95,.65])for(const[y,r]of[[4.47,.58],[5.49,.535]] as [number,number][]){const ring=mesh(factory,new T.TorusGeometry(r,.043,10,40),'#ecb56c',x,y,-.35,.72);ring.rotation.x=Math.PI/2;ring.material=copperRim;}
 skylight(factory,-2.43,-.72,4.38,1.1,2.4);skylight(factory,2.5,-.7,4.38,1.1,2.4);acUnit(factory,2.3,1.56,4.33);
 const interiorLight=new T.PointLight('#ffc365',12,8,2);interiorLight.position.set(0,2.9,.6);factory.add(interiorLight);
 for(const x of[-2.77,2.82]){box(factory,x,2.63,2.61,.13,.39,.19,'#4b6550');const bulb=orb(factory,x,2.61,2.72,.12,'#f4c269');bulb.material=new T.MeshStandardMaterial({color:'#ffd780',emissive:'#ffb333',emissiveIntensity:2.2});cyl(factory,x,2.87,2.72,0,.22,.12,'#936335',8,.45);const light=new T.PointLight('#ffbd54',1.2,3,2);light.position.set(x,2.58,2.83);factory.add(light);}
 solidAwning(factory,-.12,2.82,2.96,3.6,1.17,'#477154');
 // A broad, cream lettered fascia gives the working house a clear architectural identity.
 box(factory,0,3.68,2.535,5.92,.58,.11,'#a15d35');box(factory,0,3.98,2.58,6.06,.045,.08,'#d49a66');
 const houseNameCanvas=document.createElement('canvas');houseNameCanvas.width=1024;houseNameCanvas.height=128;const houseNameContext=houseNameCanvas.getContext('2d')!;
 houseNameContext.clearRect(0,0,1024,128);houseNameContext.font='700 91px Georgia';houseNameContext.textAlign='center';houseNameContext.textBaseline='middle';houseNameContext.fillStyle='#ffe8bd';houseNameContext.fillText('CACAO HOUSE',512,68,975);
 const houseNameTexture=new T.CanvasTexture(houseNameCanvas);
 c.onBrand?.((name,primary,accent,emblem)=>{houseNameContext.fillStyle=primary;houseNameContext.fillRect(0,0,1024,128);houseNameContext.fillStyle=accent;houseNameContext.fillRect(0,118,1024,10);houseNameContext.fillStyle='#ffffff';houseNameContext.fillText(name.toUpperCase(),emblem?565:512,68,emblem?850:975);if(emblem)paintBrandMark(houseNameContext,emblem,24,20,80,accent);houseNameTexture.needsUpdate=true;});houseNameTexture.colorSpace=T.SRGBColorSpace;textures.push(houseNameTexture);
 const houseName=mesh(factory,new T.PlaneGeometry(5.62,.57),'#fff',0,3.68,2.599);houseName.material=new T.MeshBasicMaterial({map:houseNameTexture,transparent:true});
 interactive(factory,'factory');bindAnchor(factory,'factory',[0,4.05,2.5],'left');merge(factory);
 const copperOriginals=[mat(copper,.78),mat(copper,.72)];factory.traverse(o=>{if(o instanceof T.Mesh){if(copperOriginals.includes(o.material as T.MeshStandardMaterial))o.material=copperSurface;else if(o.material===mat('#d18b4c',.8))o.material=copperCrown;}});

 // Sage corrugated ingredient warehouse, with two open loading bays and a working delivery yard.
 const warehouse=group(ground,4.8,.2,4.5);const ww=5.6,wd=4.7;
 box(warehouse,0,.11,0,5.9,.22,5,'#c0b79b');box(warehouse,0,1.9,-2.23,ww,3.8,.23,'#708773');
 for(const x of[-2.69,2.69])box(warehouse,x,1.9,0,.22,3.8,wd,'#7c9279');
 box(warehouse,0,3.54,2.25,ww,.55,.25,'#738b73');for(const x of[-2.67,-.05,2.65])box(warehouse,x,1.73,2.25,.28,3.4,.25,'#70896f');
 for(let i=0;i<37;i++)box(warehouse,-2.7+i*.15,3.57,2.395,.027,.5,.025,'#9aab83');
 for(const x of[-1.4,1.3]){box(warehouse,x,2.69,2.32,2.22,.43,.06,'#b7c1a1');for(let i=0;i<4;i++)box(warehouse,x,2.52+i*.105,2.37,2.24,.025,.02,'#8f9d84');box(warehouse,x,.3,2.61,2.3,.22,.6,'#bab39b');box(warehouse,x,1.45,-.93,2.28,2.6,.1,'#3f554c');for(let i=0;i<5;i++)crate(warehouse,x-.73+(i%3)*.58,.08+Math.floor(i/3)*.57,1.37,.52,'#b38b4b');}
 for(const side of[-1,1])for(let i=0;i<28;i++)box(warehouse,side*2.81,1.85,-2.13+i*.16,.025,3.7,.025,'#93a284');
 box(warehouse,0,3.94,0,5.92,.22,5.05,'#9dab93');box(warehouse,0,4.08,0,5.5,.07,4.62,'#718276');for(const z of[-2.4,2.4])box(warehouse,0,4.22,z,5.9,.22,.13,'#99aa8f');for(const x of[-2.87,2.87])box(warehouse,x,4.22,0,.12,.22,4.9,'#99aa8f');
 skylight(warehouse,-1.35,0,4.1,1.7,2.3);skylight(warehouse,1.1,0,4.1,1.7,2.3);acUnit(warehouse,1.88,1.53,4.1);
 sign(warehouse,'RAFI · INGREDIENTS',0,3.46,2.4,4.65,.35,'#55785a');
 const seal=canvasTexture(256,(q,s)=>{q.clearRect(0,0,s,s);q.fillStyle='#ece3c5';q.beginPath();q.arc(128,128,104,0,Math.PI*2);q.fill();q.strokeStyle='#5f7958';q.lineWidth=10;q.beginPath();q.ellipse(128,128,42,77,.4,0,Math.PI*2);q.stroke();q.beginPath();q.moveTo(95,200);q.quadraticCurveTo(112,132,159,64);q.stroke();});
 const emblem=mesh(warehouse,new T.PlaneGeometry(.84,.84),'#fff',2.36,2.92,2.408);emblem.material=new T.MeshBasicMaterial({map:seal,transparent:true});
 const sageOriginals=[mat('#708773'),mat('#7c9279'),mat('#738b73'),mat('#70896f')];warehouse.traverse(o=>{if(o instanceof T.Mesh&&sageOriginals.includes(o.material as T.MeshStandardMaterial))o.material=sageSurface;});
 interactive(warehouse,'supplier');bindAnchor(warehouse,'supplier',[0,4.1,2.4],'right');merge(warehouse);
 const van=c.deliveryVan(3.5,7.65);van.scale.setScalar(.75);van.rotation.y=-.1;
 for(let i=0;i<7;i++)crate(ground,8.1+(i%3)*.6,.18+Math.floor(i/3)*.56,6.8+Math.floor(i%3/2)*.6,.55,'#bd9250');
 const rafi=person(ground,7.2,7.65,'#49684e',.93,.22);interactive(rafi,'supplier');
 const contact=person(ground,-3,7.5,'#2d5973',1.08,.2);interactive(contact,'staff');bindAnchor(contact,'staff',[0,1.05,0],'below');

 // Ferry Building: a long arcade and tiered campanile, with actual round clocks on four faces.
 const ferry=group(ground,5.8,.25,-14);const hallW=11.8,hallD=3.8;
 box(ferry,0,.12,0,hallW+.4,.24,hallD+.4,stone);box(ferry,0,2.03,0,hallW,3.85,hallD,'#e9d6b6');
 for(let i=0;i<9;i++){
  const x=-5.2+i*1.3;box(ferry,x,1.52,1.93,.84,2.4,.075,'#627b68',.12);
  const arch=mesh(ferry,new T.CircleGeometry(.42,20,0,Math.PI),'#627b68',x,2.72,1.976);arch.material=mat('#627b68');
  mesh(ferry,new T.TorusGeometry(.47,.07,6,20,Math.PI),'#e6cda7',x,2.72,2.03);
  for(const xx of[x-.48,x+.48])box(ferry,xx,1.51,2.04,.14,2.47,.19,'#e3c8a0');
  box(ferry,x,1.45,2.03,.035,2.6,.04,'#cfcbab');box(ferry,x,2.12,2.03,.81,.055,.045,'#a5b49b');
  box(ferry,x,.91,2.04,.67,1.36,.03,'#a98551');box(ferry,x,.91,2.063,.035,1.34,.035,'#485f54');
 }
 for(const y of[.36,3.24,3.89])box(ferry,0,y,0,hallW+.36,.15,hallD+.22,'#f1dfbf');
 box(ferry,0,4.01,0,hallW+.1,.12,hallD,'#899188');for(const z of[-1.86,1.86])box(ferry,0,4.23,z,hallW+.1,.4,.18,'#e4d0ae');
 for(let i=0;i<6;i++)box(ferry,-5+i*2,4.51,-1.1,.28,.85,.34,'#ebd7b7');
 const tower=group(ferry,1.2,0,0);box(tower,0,6.27,0,1.95,5.14,1.95,'#e8d5b3');
 for(const y of[4.1,8.77,9.94,10.86,11.55]){const w=y<9?2.3:y<10.5?1.85:y<11.5?1.38:1;box(tower,0,y,0,w,.17,w,'#f3dfbd')}
 for(const side of[-1,1])for(const xx of[-.58,0,.58]){box(tower,xx,5.23,side*.984,.075,.57,.025,'#736f57');box(tower,xx,8.13,side*.984,.085,.45,.025,'#7b7b61');box(tower,side*.984,5.23,xx,.025,.57,.075,'#736f57');}
 box(tower,0,9.37,0,1.56,1.13,1.56,'#e9d5b2');box(tower,0,10.46,0,1.12,.91,1.12,'#e4cfa9');box(tower,0,11.18,0,.74,.65,.74,'#dec79f');
 for(const [y,w,h,n]of[[9.39,1.57,.81,4],[10.45,1.13,.65,3],[11.18,.75,.45,2]] as [number,number,number,number][]){for(const side of[-1,1]){box(tower,0,y,side*w/2,w-.21,h,.026,'#605f4b');box(tower,side*w/2,y,0,.026,h,w-.21,'#605f4b');for(let i=0;i<n;i++){const x=-w/2+.09+i*(w-.18)/(n-1);box(tower,x,y,side*(w/2+.04),.1,h+.12,.07,'#eddbb9');box(tower,side*(w/2+.04),y,x,.07,h+.12,.1,'#eddbb9')}}}
 const clockTexture=canvasTexture(256,(q,s)=>{q.fillStyle='#f4e9c7';q.beginPath();q.arc(128,128,118,0,Math.PI*2);q.fill();q.strokeStyle='#64735b';q.lineWidth=9;q.stroke();q.fillStyle='#435a49';for(let i=0;i<12;i++){q.save();q.translate(128,128);q.rotate(i*Math.PI/6);q.fillRect(-2,-102,4,i%3?10:16);q.restore()}q.font='bold 33px Georgia';q.textAlign='center';q.textBaseline='middle';q.fillText('12',128,54);q.fillText('3',202,130);q.fillText('6',128,203);q.fillText('9',54,130);q.strokeStyle='#405544';q.lineCap='round';q.lineWidth=7;q.beginPath();q.moveTo(128,128);q.lineTo(128,62);q.moveTo(128,128);q.lineTo(167,153);q.stroke();q.beginPath();q.arc(128,128,6,0,Math.PI*2);q.fill()});
 const clockMaterial=new T.MeshBasicMaterial({map:clockTexture,transparent:true});
 for(let i=0;i<4;i++){const holder=group(tower);holder.rotation.y=i*Math.PI/2;const q=mesh(holder,new T.CircleGeometry(.66,48),'#f9edce',0,7.18,.995);q.material=clockMaterial;mesh(holder,new T.TorusGeometry(.69,.045,6,48),'#73836a',0,7.18,1.015);box(holder,0,7.33,1.03,.035,.34,.017,'#304a3c');const hand=box(holder,.12,7.12,1.033,.28,.04,.017,'#304a3c');hand.rotation.z=-.5;for(let k=0;k<12;k++){const tick=group(holder,0,7.18,1.04);tick.rotation.z=k*Math.PI/6;box(tick,0,.555,0,k%3?.025:.04,k%3?.065:.09,.018,'#304a3c');}}
 const dome=mesh(tower,new T.SphereGeometry(.38,20,10,0,Math.PI*2,0,Math.PI/2),'#546b63',0,11.73,0,.5);dome.scale.y=1.4;cyl(tower,0,12.33,0,.024,.035,.67,'#d9c593',10,.6);
 const flag=box(tower,.19,12.48,0,.36,.19,.022,'#b85647');flag.userData.moving=true;updates.push(t=>flag.rotation.y=Math.sin(t*1.4)*.12);
 sign(ferry,'FERRY BUILDING',-2.1,3.53,2.025,5.3,.27,'#c1aa82');interactive(ferry,'terminal');bindAnchor(ferry,'terminal',[0,6.85,1.95],'right');merge(ferry);

 function cityBuilding(x:number,z:number,w:number,d:number,h:number,color:string,name?:string,id?:string,base=1.53,streetShift=7){
  const g=group(ground,x,base,z-streetShift);box(g,0,-base/2,0,w+.2,base,d+.2,'#b7b199');box(g,0,h/2,0,w,h,d,color);box(g,0,.13,0,w+.15,.26,d+.12,stone);box(g,0,h,0,w+.27,.19,d+.25,edge);box(g,0,h+.19,0,w-.12,.12,d-.12,'#89978b');
  for(const zz of[-d/2,d/2])box(g,0,h+.32,zz,w+.25,.24,.13,color);for(const xx of[-w/2,w/2])box(g,xx,h+.32,0,.13,.24,d+.2,color);
  const columns=Math.max(2,Math.floor(w/1.2)),levels=Math.max(2,Math.floor(h/1.5));
  for(let row=0;row<levels;row++)for(let col=0;col<columns;col++){
   const xx=-w/2+.6+col*(w-1.2)/(columns-1),yy=.9+row*(h-1.7)/(levels-1);box(g,xx,yy,d/2+.04,.61,.97,.065,'#c1b69a');box(g,xx,yy,d/2+.08,.47,.84,.034,row===0?'#988958':'#3c6262',.2);box(g,xx,yy,d/2+.106,.025,.87,.024,'#a6b4a1');box(g,xx,yy-.08,d/2+.107,.48,.028,.025,'#a6b4a1');box(g,xx,yy-.5,d/2+.1,.76,.095,.2,edge);
  }
  for(const side of[-1,1])for(let row=0;row<levels;row++)for(let col=0;col<2;col++)box(g,side*(w/2+.025),.95+row*(h-1.7)/(levels-1),-.58+col*1.16,.035,.8,.48,'#426769',.18);
  box(g,0,.72,d/2+.11,.76,1.39,.095,'#476352');solidAwning(g,0,1.89,d/2+.44,Math.min(w-.3,3.4),.8,'#39674e');
  if(name)sign(g,name,0,2.22,d/2+.08,w-.3,.26,'#68745a');if(id){interactive(g,id);bindAnchor(g,id,[0,h,d/2],'above')}
  acUnit(g,-w*.23,-d*.1,h+.24);merge(g);return g;
 }
 cityBuilding(-9,-9,4.1,3.4,4.1,'#ded0ae','BUYER HOUSE','buyer');cityBuilding(-3.3,-12.6,4.3,3.4,5.8,'#e3d4b5','UNION SQUARE','market');
 cityBuilding(3.8,-12.5,3.3,3.1,4.9,'#c4cab3','HOUSE LEDGER','office',.8);cityBuilding(-7.2,-6.5,2.8,2.6,2.9,'#dec7a2','NADIA’S STUDIO','research');
 // Two rear buildings frame the open steps; the house and ferry remain the main silhouettes.
 for(const [x,z,w,d,h,col,base]of[[-15,-8,4.2,3.4,4.7,'#d1ceb3',1.5],[-14,-13,3.5,3,5.8,'#d9c6a2',2]] as [number,number,number,number,number,string,number][])cityBuilding(x,z,w,d,h,col,undefined,undefined,base);
 // The western streets continue into an inhabited block; its bays break up the broad harbour paving.
 const west=cityBuilding(-18,.4,6.9,4.2,4.65,'#dfd0af','QUAY PROVISIONS',undefined,.2,0);west.rotation.y=.13;
 for(const x of[-1.65,1.65]){box(west,x,2.95,2.29,1.23,1.2,.47,'#e5d7b8');box(west,x,2.97,2.55,.89,.83,.035,'#52716e',.25);box(west,x,2.35,2.4,1.43,.13,.73,edge);for(const xx of[x-.42,x+.42])box(west,xx,2.97,2.59,.036,.86,.03,'#c8c6a9');}
 cityBuilding(-24,-1.2,4.7,4.1,5.8,'#cbd0b8',undefined,undefined,.2,0);
 // Bay Street turns inland between two different inhabited blocks, beyond the mobile hero framing.
 box(ground,-20.5,.16,-18.3,4.3,.14,24.5,'#78817b');for(const x of[-22.78,-18.22])box(ground,x,.23,-18.3,.2,.19,24.5,edge);
 for(let i=0;i<11;i++)box(ground,-20.5,.25,-7.8-i*2.1,.055,.018,.85,'#d7cda9');
 const bayBlock=group(ground,-27.6,.2,-18.5);bayBlock.rotation.y=.045;
 masonry(bayBlock,0,2.48,0,8.1,4.95,4.7);box(bayBlock,0,4.98,0,8.35,.2,4.95,edge);box(bayBlock,0,5.12,0,7.85,.07,4.45,'#778477');
 for(const z of[-2.35,2.35])box(bayBlock,0,5.25,z,8.32,.28,.15,'#c6ac87');
 for(const x of[-2.75,0,2.75]){
  box(bayBlock,x,2.75,2.51,1.57,2.8,.48,'#d7c49e');
  for(const y of[2.01,3.57]){box(bayBlock,x,y,2.78,1.18,1.06,.045,'#4e716c',.2);box(bayBlock,x,y,2.812,.044,1.09,.03,'#e4d3b0');box(bayBlock,x,y-.58,2.59,1.82,.12,.86,edge);}
  box(bayBlock,x,.9,2.405,1.47,1.6,.055,'#395848');solidAwning(bayBlock,x,1.8,2.88,2.03,.76,'#5a6e4e');
 }
 sign(bayBlock,'BAY STREET',0,4.59,2.405,4.08,.3,'#96613c');merge(bayBlock);
 const annex=group(ground,-34.6,.2,-20.1);box(annex,0,1.94,0,5.25,3.88,3.9,'#d1ccad');box(annex,0,3.98,0,5.52,.2,4.12,edge);box(annex,0,4.12,0,5.1,.07,3.68,'#778375');
 for(const x of[-1.58,0,1.58])for(const y of[1.08,2.82]){box(annex,x,y,1.98,1.08,1.07,.075,'#5e766a',.16);for(const xx of[x-.54,x+.54])box(annex,xx,y,2.025,.085,1.17,.08,'#e6d4b1');box(annex,x,y-.59,2.04,1.25,.1,.3,edge);}
 solidAwning(annex,0,1.78,2.38,3.7,.8,'#516b53');merge(annex);
 paver(ground,-25.1,.22,-14.76,12.8,2.1);planter(-24.1,-13.78,1.05,.22);lamp(ground,-22.3,-14,.22);
 box(ground,-19.3,.15,4,17,.12,2.5,'#898980');for(const z of[2.72,5.28])box(ground,-19.3,.24,z,17,.16,.2,edge);
 for(const[x,z,s]of[[-12,1,.92],[-14,5.7,1.02],[-23.5,5.8,1.1]])planter(x,z,s);
 const westBench=group(ground,-12.2,.2,-.2);box(westBench,0,.46,0,1.7,.12,.45,'#9c7e4f');box(westBench,0,.79,-.21,1.7,.55,.095,'#9c7e4f');for(const x of[-.62,.62])box(westBench,x,.23,0,.095,.47,.42,'#4e6554');person(ground,-13.3,2,'#b68653',.84,.2);
 for(const[x,z,s,y]of[[-11,-5.2,1.1,1.55],[-11.3,-11,1.05,1.55],[-6.5,-12,1.05,1.55],[-15.2,-11.2,1.25,1.55],[-28,-7,1.7,.2]] as [number,number,number,number][])planter(x,z-7,s,y);
 for(const[x,z,s]of[[-10.5,3.4,1.05],[-9.8,7.2,.85],[.2,7.3,.76],[10.1,7.2,.88],[-4.2,-.33,.75],[3.7,-.26,.82],[10.9,-11.8,.92],[-14,11,1.2],[-12.5,17,1.25]] as [number,number,number][])planter(x,z,s);
 for(const[x,z]of[[-8.7,5.8],[-1.4,7.9],[8.5,8],[-6.5,-.14],[1.7,-.16],[6.2,-11.7],[12,-11.7],[-6.6,12.2],[-11,15]])lamp(ground,x,z,.2);
 // The promenade continues along the shore, so the road and quay never end in an exposed slab.
 for(const x of[18,25,32,39,46]){planter(x,-11.85,.95,.25);lamp(ground,x+2.2,-11.83,.25);rail(ground,x,8.25,6.8,.18);}
 // A planted garden with broad entry steps gives the ferry's eastern promenade a purpose.
 const ferryGarden=group(ground,29,.15,-18.2);box(ferryGarden,0,.19,0,33,.38,8.5,'#b6b79b');box(ferryGarden,0,.4,0,32.6,.07,8.1,'#7f9569');
 for(const z of[-4.23,4.23])box(ferryGarden,0,.38,z,33.25,.17,.19,edge);
 paver(ferryGarden,0,.47,0,31.8,1.45);paver(ground,29,.26,-12.5,34,1.05);
 for(let i=0;i<4;i++)box(ground,17.3,.26+(i+1)*.045,-12.94-i*.3,3.3,(i+1)*.09,.37,stone);
 for(const [x,z]of[[15.6,-16.7],[22.9,-19.5],[30.4,-16.7],[38,-20],[43.1,-16.7]]){planter(x,z,1.05,.6);lamp(ground,x+1.6,-16.4,.6);}
 for(const x of[21.5,33.5,41.5]){const seat=group(ground,x,.62,-17.65);box(seat,0,.45,0,1.65,.11,.45,'#9f8555');box(seat,0,.76,-.19,1.65,.46,.09,'#9f8555');for(const xx of[-.58,.58])box(seat,xx,.23,0,.07,.46,.37,dark);}
 for(const[x,z,y]of[[-10,-11.8,.2],[-8,-18.2,1.6],[-1,-16,1.5],[11,-11.8,.2],[-12.5,11,.2],[.1,7.7,.2],[-7.6,5,.2],[5,-11.8,.2],[-14,-13,1.55]] as [number,number,number][])person(ground,x,z,['#b37d50','#667f73','#d2c299'][Math.floor(random()*3)],.82,y);
 for(let i=0;i<8;i++)box(ground,10.25,.275,-2.2-i*.73,2.0,.018,.34,'#f3ead3');
 // A single cable car travels along the boulevard, with visible warm wood and cream trim.
 const tram=group(ground,-4,.37,-8.83);tram.userData.moving=true;box(tram,0,.7,0,2.65,.95,1.02,'#af5940');box(tram,0,1.24,0,2.95,.16,1.2,'#e0c194');
 for(const side of[-1,1])for(let i=0;i<6;i++){box(tram,-1.08+i*.43,.87,side*.529,.33,.44,.028,'#a6bca1');box(tram,-1.08+i*.43,.46,side*.54,.34,.16,.035,'#d0a66b')}
 for(const x of[-.84,.84])for(const side of[-1,1]){const w=cyl(tram,x,.18,side*.52,.2,.2,.1,'#344948',12);w.rotation.x=Math.PI/2}merge(tram);updates.push(t=>tram.position.x=-13+(t*.26)%25);

 // A sheltered foreground cabin launch has a proper tapered hull, deck, windows and mooring ropes.
 function launch(x:number,z:number,scale=1){
  const g=group(ground,x,-.62,z);g.userData.moving=true;g.scale.setScalar(scale);g.rotation.y=-.38;
  const shape=new T.Shape();shape.moveTo(-.82,-2);shape.lineTo(-1,.9);shape.quadraticCurveTo(-.81,2.2,0,2.63);shape.quadraticCurveTo(.81,2.2,1,.9);shape.lineTo(.82,-2);shape.closePath();
  const hull=mesh(g,new T.ExtrudeGeometry(shape,{depth:.73,bevelEnabled:true,bevelSize:.13,bevelThickness:.1,bevelSegments:2,steps:1}),'#244f68',0,.25,0);hull.rotation.x=Math.PI/2;
  const deck=mesh(g,new T.ExtrudeGeometry(shape,{depth:.11,bevelEnabled:true,bevelSize:.06,bevelThickness:.03,bevelSegments:1,steps:1}), '#eee3c7',0,.41,0);deck.rotation.x=Math.PI/2;deck.scale.set(.95,.96,1);
  for(const side of[-1,1]){box(g,side*.9,.3,-.35,.09,.13,3.7,'#e5d4b6');box(g,side*.91,.11,-.35,.055,.085,3.72,'#b06b39');}
  const cabin=box(g,0,.87,-.37,1.55,.94,2.16,'#efebd8');const cabinPoints=cabin.geometry.getAttribute('position');for(let i=0;i<cabinPoints.count;i++)if(cabinPoints.getZ(i)>0)cabinPoints.setZ(i,cabinPoints.getZ(i)-(cabinPoints.getY(i)+.47)*.24);cabin.geometry.computeVertexNormals();
  box(g,0,1.4,-.4,1.9,.14,2.48,'#f7efd8');const windshield=box(g,0,1.05,.61,1.4,.61,.055,'#4d7f84',.28);windshield.rotation.x=-.24;for(const xx of[-.49,0,.49]){const mullion=box(g,xx,1.05,.648,.045,.65,.055,'#eee6cc');mullion.rotation.x=-.24;}
  for(const side of[-1,1]){for(let i=0;i<4;i++)box(g,side*.791,1.04,-1.13+i*.49,.035,.52,.37,'#456d70',.35);for(const zz of[-1.35,-.89,-.39,.12,.68])box(g,side*.817,1.04,zz,.055,.67,.075,'#f6e9d0')}
  box(g,0,1.77,-.56,1.06,.63,1.02,'#efead8');for(const side of[-1,1])box(g,side*.548,1.8,-.53,.03,.36,.75,'#537f80',.3);box(g,0,2.12,-.56,1.27,.09,1.17,'#efe7d0');box(g,0,1.8,-.03,.79,.36,.035,'#466f73',.3);
  cyl(g,0,2.5,-.74,.035,.045,1.1,'#e5dfcc',10);beam(g,new T.Vector3(-.52,2.57,-.74),new T.Vector3(.52,2.57,-.74),.028,'#f0e9d4');cyl(g,.3,2.27,-.52,.11,.12,.23,'#466c70',10);
  for(const side of[-1,1])rail(g,side*.85,.99,1.6,.44,true);rail(g,0,-1.81,1.7,.44);const ring=mesh(g,new T.TorusGeometry(.22,.065,8,24),'#ce7231',.59,1.6,-1.12);ring.rotation.y=Math.PI/2;
  merge(g);updates.push(t=>{g.position.y=-.62+Math.sin(t*.67+x)*.045;g.rotation.z=Math.sin(t*.63+x)*.013});return g;
 }
 const boat=launch(3.2,12.25,1.06);launch(11.8,12,.7);
 beam(ground,new T.Vector3(.45,.41,11.65),new T.Vector3(-.2,.32,12.85),.02,'#a89468');
 // One shaded water pass avoids coarse, low-resolution boat/bridge reflection blocks.
 const harbour=createHarbourWater();ground.add(harbour.water);updates.push(harbour.update);
 // Water depth, sky response and ripples come from the material, with no floating highlight boxes.
 // The far shore is a continuous low-poly ridge, then a full suspension bridge, never a miniature prop on land.
 const hills=group(ground,0,0,-99),hillPositions:number[]=[],hillColors:number[]=[],hillIndices:number[]=[];
 const shoreColor=new T.Color('#477974'),crestColor=new T.Color('#83a05e'),hillColumns=88,hillRows=16;
 // Unevenly spaced, overlapping massifs give the existing mesh broad shoulders and shaded valleys.
 const massifs=[[-105,-4,15,22,13],[-69,3,13,20,12],[-34,-2,15,19,14],[7,4,12,21,12],[43,-5,16,20,15],[82,3,13,23,12],[113,-3,16,22,13]];
 for(let i=0;i<=hillColumns;i++)for(let j=0;j<=hillRows;j++){
  const x=-110+i*2.5,z=-20+j*40/hillRows;
  const massif=massifs.reduce((height,[px,pz,peak,wx,wz])=>Math.max(height,peak*Math.exp(-Math.pow((x-px)/wx,2)-Math.pow((z-pz)/wz,2))),0);
  const shoulder=(1.8+Math.sin(x*.055)*.5)*Math.exp(-Math.pow((z-7)/18,2));
  const y=-1.5+massif*.72+shoulder*.85,color=shoreColor.clone().lerp(crestColor,T.MathUtils.clamp((y+1.5)/12.5,0,1));
  hillPositions.push(x,y,z);hillColors.push(color.r,color.g,color.b);
 }
 for(let i=0;i<hillColumns;i++)for(let j=0;j<hillRows;j++){const a=i*(hillRows+1)+j,b=a+hillRows+1;hillIndices.push(a,b+1,b,a,a+1,b+1)}
 const hillGeometry=new T.BufferGeometry();hillGeometry.setAttribute('position',new T.Float32BufferAttribute(hillPositions,3));hillGeometry.setIndex(hillIndices);hillGeometry.computeVertexNormals();
 // Bake broad slope lighting into the existing smooth mesh: coherent landforms at no additional render-pass cost.
 const hillNormals=hillGeometry.getAttribute('normal'),hillSun=new T.Vector3(-.8,.55,.2).normalize();
 for(let i=0;i<hillNormals.count;i++){
  const n=new T.Vector3().fromBufferAttribute(hillNormals,i),light=.38+.82*Math.max(0,n.dot(hillSun));
  const color=new T.Color().setRGB(hillColors[i*3],hillColors[i*3+1],hillColors[i*3+2]).multiplyScalar(light);
  hillColors[i*3]=color.r;hillColors[i*3+1]=color.g;hillColors[i*3+2]=color.b;
 }
 hillGeometry.setAttribute('color',new T.Float32BufferAttribute(hillColors,3));
 const ridge=mesh(hills,hillGeometry,'#fff');ridge.material=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,fog:true,toneMapped:false});ridge.castShadow=false;
 // Unlit distant pigments retain their green identity under the warm foreground sunlight.
 const farGeometry=hillGeometry.clone(),farColors=farGeometry.getAttribute('color'),atmosphere=new T.Color('#82a4aa');
 for(let i=0;i<farColors.count;i++){const color=new T.Color().fromBufferAttribute(farColors,i).lerp(atmosphere,.66);farColors.setXYZ(i,color.r,color.g,color.b);}
 const farRidge=mesh(hills,farGeometry,'#fff',21,-.3,-45);farRidge.scale.set(1.13,.82,.82);farRidge.rotation.y=.045;farRidge.material=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,fog:true,toneMapped:false});farRidge.castShadow=false;
 hills.userData.excludeFromOcclusion=true;
 const bridge=group(ground,-12,-1.1,-60);bridge.userData.retainBatch=true;bridge.userData.excludeFromOcclusion=true;bridge.scale.setScalar(.85);const bridgeRed='#be6d54';
 box(bridge,0,4.25,0,67,.36,1.25,bridgeRed);box(bridge,0,4.48,0,67,.08,1.5,'#ad6654');
 for(const x of[-18,18]){
  box(bridge,x,.3,0,2.4,.6,2.1,'#b48c6b');for(const z of[-.67,.67]){
   for(const xx of[x-.72,x+.72])box(bridge,xx,6.42,z,.27,12.8,.3,bridgeRed);
   for(const y of[1.2,4.3,7.7,10.1,12.75])box(bridge,x,y,z,1.7,.3,.32,bridgeRed);
   for(const y of[1.35,2.7]){beam(bridge,new T.Vector3(x-.64,y,z),new T.Vector3(x+.64,y+1.25,z),.07,bridgeRed);beam(bridge,new T.Vector3(x+.64,y,z),new T.Vector3(x-.64,y+1.25,z),.07,bridgeRed)}
  }
 }
 const hangerMaterial=new T.MeshBasicMaterial({color:'#b97559',fog:true});
 const cableHeight=(x:number)=>Math.abs(x)<=18?5.35+7.7*(x/18)**2:4.72+8.33*((Math.abs(x)-33.5)/15.5)**2;
 for(const z of[-.73,.73])for(let i=0;i<98;i++){
  const x=-33.5+i*67/98,next=x+67/98;beam(bridge,new T.Vector3(x,cableHeight(x),z),new T.Vector3(next,cableHeight(next),z),.085,bridgeRed);
  if(i%2===0)painted(beam(bridge,new T.Vector3(x,4.48,z),new T.Vector3(x,cableHeight(x),z),.045,'#ba806b',5),hangerMaterial);
 }
 // Keep distant, subpixel hangers uniformly colored and in one draw call.
 const hangers=bridge.children.filter((o):o is T.Mesh=>o instanceof T.Mesh&&o.material===hangerMaterial);
 const hangerParts=hangers.map(m=>{m.updateMatrix();return m.geometry.clone().applyMatrix4(m.matrix)});
 const hangerGeometry=mergeGeometries(hangerParts,false);hangerParts.forEach(g=>g.dispose());
 if(hangerGeometry){hangers.forEach(m=>m.removeFromParent());bridge.add(new T.Mesh(hangerGeometry,hangerMaterial));}
 for(const x of[-33.5,33.5])box(bridge,x,2.08,0,1.7,4.2,2.4,'#c19b7b');merge(bridge);bridge.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=false;o.receiveShadow=false;}});
 // Distant sails are simple readable silhouettes; the main harbour launch keeps the foreground scale.
 for(const[x,z,s]of[[-14,-27,.6],[.5,-30,.85],[19,-24,.52],[-24,-37,.45]] as [number,number,number][]){const g=group(ground,x,-.9,z);g.scale.setScalar(s);box(g,0,.06,0,1.3,.18,.34,'#ebe0c4');cyl(g,0,1.1,0,.017,.017,2.3,'#d4c9aa',6);const sail=new T.BufferGeometry();sail.setAttribute('position',new T.Float32BufferAttribute([-.05,.23,0,-.05,2.18,0,-.82,.23,0,.06,.23,.03,.06,1.91,.03,.57,.23,.03],3));sail.computeVertexNormals();const q=mesh(g,sail,'#eee5cd');q.material=mat('#eee5cd').clone();(q.material as T.MeshStandardMaterial).side=T.DoubleSide;merge(g);}
 // One small outdoor work table helps the workshop frontage feel inhabited without obstructing paths.
 const cafe=group(ground,-7.9,.2,5.2);cyl(cafe,0,.65,0,.48,.48,.09,'#c8a16a',16);cyl(cafe,0,.32,0,.045,.045,.64,'#49634f',8);for(const x of[-.65,.65]){box(cafe,x,.36,0,.38,.08,.4,'#967649');box(cafe,x,.64,-.15,.4,.48,.065,'#967649');for(const xx of[-.12,.12])box(cafe,x+xx,.18,.09,.05,.35,.05,'#45604f')}merge(cafe);
 return {anchors:SAN_FRANCISCO_ANCHORS,boat,factory,warehouse,ferry};
}
