import * as T from 'three';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {FullScreenQuad} from 'three/addons/postprocessing/Pass.js';

/** Architecture is static: reuse its contact shading between bounded refreshes. */
export class HarbourOcclusion extends SSAOPass {
 private lastCamera=new T.Matrix4();
 private lastProjection=new T.Matrix4();
 private refreshed=-Infinity;
 private invalid=true;
 private framesSinceRefresh=0;
 private cachedQuad:FullScreenQuad;

 constructor(scene:T.Scene,camera:T.Camera){
  super(scene,camera,1,1,12);
  this.cachedQuad=new FullScreenQuad(this.copyMaterial);
  // Contact shading belongs to the near district. Subpixel distant cables and hill silhouettes must not acquire screen-space noise.
  this.ssaoMaterial.fragmentShader=this.ssaoMaterial.fragmentShader
   .replace('if ( depth == depthThreshold )','if ( depth == depthThreshold || -getViewZ( depth ) > 90.0 )')
   .replace('occlusion = clamp( occlusion / float( KERNEL_SIZE ), 0.0, 1.0 );','occlusion = clamp( occlusion / float( KERNEL_SIZE ), 0.0, 1.0 ) * ( 1.0 - smoothstep( 55.0, 90.0, -viewZ ) );');
  this.ssaoMaterial.needsUpdate=true;
 }

 invalidate(){this.invalid=true;}

 override setSize(width:number,height:number){
  super.setSize(width,height);
  this.invalid=true;
 }

 override render(renderer:T.WebGLRenderer,write:T.WebGLRenderTarget,read:T.WebGLRenderTarget,delta:number,mask:boolean){
  const now=performance.now();
  if(this.invalid||!this.lastCamera.equals(this.camera.matrixWorld)||!this.lastProjection.equals(this.camera.projectionMatrix)||(++this.framesSinceRefresh>=6&&now-this.refreshed>200)){
   this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix);
   this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse);
   const excluded:T.Object3D[]=[];
   this.scene.traverse(o=>{if(o.userData.excludeFromOcclusion&&o.visible){excluded.push(o);o.visible=false;}});
   try{super.render(renderer,write,read,delta,mask);}finally{excluded.forEach(o=>o.visible=true);}
   this.lastCamera.copy(this.camera.matrixWorld);
   this.lastProjection.copy(this.camera.projectionMatrix);
   this.refreshed=now;this.invalid=false;this.framesSinceRefresh=0;
   return;
  }
  const previousTarget=renderer.getRenderTarget(),previousAutoClear=renderer.autoClear;
  renderer.autoClear=false;
  renderer.setRenderTarget(this.renderToScreen?null:read);
  this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture;
  this.copyMaterial.blending=T.CustomBlending;
  this.cachedQuad.render(renderer);
  renderer.setRenderTarget(previousTarget);
  renderer.autoClear=previousAutoClear;
 }

 override dispose(){this.cachedQuad.dispose();super.dispose();}
}
