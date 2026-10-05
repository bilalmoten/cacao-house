import * as T from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';

/** One bounded reflection render, with irregular world-space ripples rather than a flat blue plane. */
export function createHarbourWater(){
 // A seamless wave field is generated once; the fragment shader samples it instead of evaluating dozens of trigonometric hashes per pixel.
 const size=128,data=new Uint8Array(size*size*4),waves=[[1,4,.37,.2],[2,-3,.24,1.7],[-3,8,.16,3.1],[5,11,.10,.8],[7,-5,.08,4.2],[3,17,.05,2.3]];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  let height=0,dx=0,dz=0;
  for(const[kx,kz,amplitude,phase]of waves){const angle=Math.PI*2*(x/size*kx+y/size*kz)+phase;height+=Math.sin(angle)*amplitude;dx+=Math.cos(angle)*amplitude*kx;dz+=Math.cos(angle)*amplitude*kz;}
  const i=(y*size+x)*4;data[i]=Math.round(T.MathUtils.clamp(.5+dx*.065,0,1)*255);data[i+1]=Math.round(T.MathUtils.clamp(.5+dz*.035,0,1)*255);data[i+2]=Math.round((height*.45+.5)*255);data[i+3]=255;
 }
 const waveTexture=new T.DataTexture(data,size,size,T.RGBAFormat);waveTexture.wrapS=waveTexture.wrapT=T.RepeatWrapping;waveTexture.magFilter=T.LinearFilter;waveTexture.minFilter=T.LinearMipmapLinearFilter;waveTexture.generateMipmaps=true;waveTexture.needsUpdate=true;
 const shader={
  name:'CacaoHarbourWater',
  uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{
   harbourWaves:{value:null},color:{value:new T.Color('#186f86')},tDiffuse:{value:null},textureMatrix:{value:new T.Matrix4()},
   harbourTime:{value:0},harbourEye:{value:new T.Vector3()},sunDirection:{value:new T.Vector3(-24,25,20).normalize()},
  }]),
  vertexShader:`
   uniform mat4 textureMatrix;
   varying vec4 mirrorUv;
   varying vec3 waterWorld;
   #include <common>
   #include <fog_pars_vertex>
   void main(){
    vec4 world=modelMatrix*vec4(position,1.0);
    waterWorld=world.xyz;mirrorUv=textureMatrix*vec4(position,1.0);
    vec4 mvPosition=modelViewMatrix*vec4(position,1.0);
    gl_Position=projectionMatrix*mvPosition;
    #include <fog_vertex>
   }`,
  fragmentShader:`
   uniform vec3 color;uniform sampler2D tDiffuse;uniform sampler2D harbourWaves;uniform float harbourTime;
   uniform vec3 harbourEye;uniform vec3 sunDirection;
   varying vec4 mirrorUv;varying vec3 waterWorld;
   #include <common>
   #include <fog_pars_fragment>
   void main(){
    vec2 p=waterWorld.xz*.034+vec2(harbourTime*.002,harbourTime*.001);
    vec3 waveA=texture2D(harbourWaves,p).rgb,waveB=texture2D(harbourWaves,p*1.71+vec2(.31,-.17)+harbourTime*.0005).rgb;
    vec3 field=mix(waveA,waveB,.35);
    float wave=field.b,dx=(field.r-.5)*.15,dz=(field.g-.5)*.15;
    vec3 normal=normalize(vec3(-dx*.12,1.0,-dz*.12));
    vec3 view=normalize(harbourEye-waterWorld);
    vec2 uv=mirrorUv.xy/mirrorUv.w;
    vec2 broken=vec2(dx*.018,dz*.006);
    vec2 reflectedUv=uv+broken;
    vec3 reflection=texture2D(tDiffuse,reflectedUv,1.5).rgb*.4;
    reflection+=texture2D(tDiffuse,reflectedUv+vec2(.004,0.),1.5).rgb*.2;
    reflection+=texture2D(tDiffuse,reflectedUv-vec2(.004,0.),1.5).rgb*.2;
    reflection+=texture2D(tDiffuse,reflectedUv+vec2(0.,.0015),1.5).rgb*.1;
    reflection+=texture2D(tDiffuse,reflectedUv-vec2(0.,.0015),1.5).rgb*.1;
    // Fresnel keeps the near harbour blue and lets the distant skyline shimmer in the bay.
    float fresnel=.16+.43*pow(1.0-max(dot(view,normal),0.0),2.6);
    float ripple=waveB.b;
    vec3 base=color*(.98+.025*(wave-.5))+vec3(.005,.009,.012)*smoothstep(.65,.85,ripple);
    float glint=pow(max(dot(normal,normalize(view+sunDirection)),0.0),90.0);
    gl_FragColor=vec4(mix(base,reflection,fresnel)+vec3(1.,.87,.61)*glint*.08,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
   }`,
 };
 const water=new Reflector(new T.PlaneGeometry(240,240),{textureWidth:384,textureHeight:384,multisample:0,clipBias:.002,color:'#186f86',shader});
 const reflectedTexture=water.getRenderTarget().texture;reflectedTexture.generateMipmaps=true;reflectedTexture.minFilter=T.LinearMipmapLinearFilter;
 water.rotation.x=-Math.PI/2;water.position.set(0,-1.12,-20);water.castShadow=false;water.receiveShadow=false;
 water.userData.moving=true;const waterMaterial=water.material as T.ShaderMaterial;waterMaterial.fog=true;waterMaterial.uniforms.harbourWaves.value=waveTexture;
 const renderReflection=water.onBeforeRender;
 const lastCamera=new T.Matrix4(),lastProjection=new T.Matrix4();let refreshed=-Infinity,framesSinceRefresh=0;
 water.onBeforeRender=(renderer,scene,camera,geometry,material,group)=>{
  if(scene.overrideMaterial)return;
  waterMaterial.uniforms.harbourEye.value.setFromMatrixPosition(camera.matrixWorld);
  const now=performance.now();
  if(!lastCamera.equals(camera.matrixWorld)||!lastProjection.equals(camera.projectionMatrix)||(++framesSinceRefresh>=5&&now-refreshed>160)){
   renderReflection.call(water,renderer,scene,camera,geometry,material,group);
   lastCamera.copy(camera.matrixWorld);lastProjection.copy(camera.projectionMatrix);refreshed=now;framesSinceRefresh=0;
  }
 };
 water.userData.dispose=()=>{waveTexture.dispose();water.dispose();};
 return {water,update:(time:number)=>{waterMaterial.uniforms.harbourTime.value=time;}};
}
