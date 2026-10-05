import * as T from 'three';

/** A single shaded water surface: coherent ripples without low-resolution scene reflections. */
export function createHarbourWater(){
 const size=128,data=new Uint8Array(size*size*4),waves=[[1,4,.37,.2],[2,-3,.24,1.7],[-3,8,.16,3.1],[5,11,.10,.8],[7,-5,.08,4.2],[3,17,.05,2.3]];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  let height=0,dx=0,dz=0;
  for(const[kx,kz,amplitude,phase]of waves){const angle=Math.PI*2*(x/size*kx+y/size*kz)+phase;height+=Math.sin(angle)*amplitude;dx+=Math.cos(angle)*amplitude*kx;dz+=Math.cos(angle)*amplitude*kz;}
  const i=(y*size+x)*4;data[i]=Math.round(T.MathUtils.clamp(.5+dx*.065,0,1)*255);data[i+1]=Math.round(T.MathUtils.clamp(.5+dz*.035,0,1)*255);data[i+2]=Math.round((height*.45+.5)*255);data[i+3]=255;
 }
 const waveTexture=new T.DataTexture(data,size,size,T.RGBAFormat);waveTexture.wrapS=waveTexture.wrapT=T.RepeatWrapping;waveTexture.magFilter=T.LinearFilter;waveTexture.minFilter=T.LinearMipmapLinearFilter;waveTexture.generateMipmaps=true;waveTexture.needsUpdate=true;
 const material=new T.ShaderMaterial({
  name:'CacaoHarbourWater',fog:true,
  uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{
   harbourWaves:{value:waveTexture},nearColor:{value:new T.Color('#245d6d')},bayColor:{value:new T.Color('#508ca6')},skyColor:{value:new T.Color('#91afbc')},
   harbourTime:{value:0},harbourEye:{value:new T.Vector3()},sunDirection:{value:new T.Vector3(-18,24,28).normalize()},
  }]),
  vertexShader:`
   varying vec3 waterWorld;
   #include <common>
   #include <fog_pars_vertex>
   void main(){
    waterWorld=(modelMatrix*vec4(position,1.0)).xyz;
    vec4 mvPosition=modelViewMatrix*vec4(position,1.0);
    gl_Position=projectionMatrix*mvPosition;
    #include <fog_vertex>
   }`,
  fragmentShader:`
   uniform vec3 nearColor;uniform vec3 bayColor;uniform vec3 skyColor;
   uniform sampler2D harbourWaves;uniform float harbourTime;uniform vec3 harbourEye;uniform vec3 sunDirection;
   varying vec3 waterWorld;
   #include <common>
   #include <fog_pars_fragment>
   void main(){
    vec2 p=waterWorld.xz*vec2(.034,.058)+vec2(harbourTime*.002,harbourTime*.001);
    vec3 waveA=texture2D(harbourWaves,p).rgb,waveB=texture2D(harbourWaves,p*1.71+vec2(.31,-.17)+harbourTime*.0005).rgb;
    vec3 field=mix(waveA,waveB,.3);
    vec3 normal=normalize(vec3(-(field.r-.5)*.48,1.,-(field.g-.5)*.38));
    vec3 view=normalize(harbourEye-waterWorld);
    float distanceToEye=length(harbourEye-waterWorld);
    float bayDepth=smoothstep(24.,100.,distanceToEye);
    vec3 base=mix(nearColor,bayColor,bayDepth);
    float fresnel=.05+.28*pow(1.-max(dot(view,normal),0.),3.);
    // Broad, irregular ripple shading supplies depth without bands or pixelated mirror silhouettes.
    float ripple=(field.b-.5)*.32+(field.g-.5)*.35;
    base*=1.+ripple;
    vec3 reflectedSky=skyColor*(.92+.16*normal.z);
    float glint=pow(max(dot(normal,normalize(view+sunDirection)),0.),24.);
    float crest=smoothstep(.53,.72,waveB.b)*(.012+.021*bayDepth);
    vec3 surface=mix(base,reflectedSky,fresnel)+vec3(.65,.8,.84)*crest+vec3(.93,.85,.65)*glint*.035;
    gl_FragColor=vec4(surface,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
   }`,
 });
 // UniformsUtils clones textures; keep ownership of the single generated wave field explicit.
 const clonedWave=material.uniforms.harbourWaves.value as T.Texture;clonedWave.dispose();material.uniforms.harbourWaves.value=waveTexture;
 const water=new T.Mesh(new T.PlaneGeometry(240,240),material);
 water.rotation.x=-Math.PI/2;water.position.set(0,-1.12,-20);water.castShadow=false;water.receiveShadow=false;
 water.userData.moving=true;
 water.onBeforeRender=(_renderer,_scene,camera)=>{material.uniforms.harbourEye.value.setFromMatrixPosition(camera.matrixWorld);};
 water.userData.dispose=()=>waveTexture.dispose();
 return {water,update:(time:number)=>{material.uniforms.harbourTime.value=time;}};
}
