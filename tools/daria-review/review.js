import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createRangerActor } from '/src/visuals/ranger.js';
// Authoring comparison: two real Ranger actors, the previous and the new GLB, same light/camera.
const canvas=document.querySelector('canvas'),renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(1);renderer.setSize(1400,820,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;
const scene=new THREE.Scene();scene.background=new THREE.Color('#5d5b5c');
const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(room,.04);
scene.environment=env.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight('#e6ecef','#3e3b36',1.4));
const key=new THREE.DirectionalLight('#ffe6cc',2.4);key.position.set(2.5,5,5);key.castShadow=true;scene.add(key);
const rim=new THREE.DirectionalLight('#b9cde0',1.1);rim.position.set(-3,4,-4);scene.add(rim);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,8),new THREE.MeshStandardMaterial({color:'#4b4a4a',roughness:1}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const camera=new THREE.PerspectiveCamera(30,1400/820,.05,40);
const before=createRangerActor({variant:'refined'}),after=createRangerActor({variant:'pass01'});
before.root.position.x=-.85;after.root.position.x=.85;scene.add(before.root,after.root);
const VIEWS={front:[0,0,1.12,7.2,1.1],side:[Math.PI/2,0,1.12,7.2,1.1],back:[Math.PI,0,1.12,7.2,1.1],face:[0,1,0,1.3,0],faceside:[0,1,0,1.3,0]};
const POSES={idle:{},run:{moving:true},draw:{action:{elapsed:.24,windup:.28,duration:.7,kind:'basic'}},release:{action:{elapsed:.42,windup:.28,duration:.7,kind:'basic'}},dodge:{dodge:.12}};
window.dariaFrame=(view='front',pose='idle',time=1.25)=>{
  const [yaw,close,y,dist,look]=VIEWS[view],p=POSES[pose];
  for(const actor of [before,after]){actor.root.rotation.y=yaw;actor.root.userData.animate(time,Boolean(p.moving),0,true,{style:'bow',action:p.action||null,dodge:p.dodge||0,evolved:false});}
  if(close){
    // Close views: left half frames the previous head, right half the new one.
    camera.fov=20;camera.aspect=700/820;camera.updateProjectionMatrix();renderer.setScissorTest(true);
    for(const [i,actor] of [[0,before],[1,after]]){
      const head=new THREE.Vector3();actor.root.updateMatrixWorld(true);
      (actor.root.getObjectByName('head')||actor.root).getWorldPosition(head);head.y+=.12;
      camera.position.set(head.x,head.y,head.z+dist);if(view==='faceside')camera.position.set(head.x+dist,head.y,head.z);camera.lookAt(head);
      renderer.setViewport(i*700,0,700,820);renderer.setScissor(i*700,0,700,820);renderer.render(scene,camera);
    }
    renderer.setScissorTest(false);renderer.setViewport(0,0,1400,820);
  }else{camera.fov=30;camera.aspect=1400/820;camera.position.set(0,y,dist);camera.lookAt(0,look,0);camera.updateProjectionMatrix();renderer.render(scene,camera);}
  const stats={};for(const [name,actor] of [['before',before],['after',after]]){let triangles=0,meshes=0,skinned=0;const mats=new Set();actor.root.traverseVisible(n=>{if(n.isMesh){meshes++;if(n.isSkinnedMesh)skinned++;mats.add(n.material);triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;}});stats[name]={triangles,meshes,skinned,materials:mats.size};}
  return stats;
};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{playing=false;window.dariaFrame(b.dataset.view);});
document.querySelectorAll('[data-pose]').forEach(b=>b.onclick=()=>{playing=false;window.dariaFrame('front',b.dataset.pose);});
let playing=false;document.querySelector('#play').onclick=()=>{playing=!playing;const start=performance.now();const step=now=>{if(!playing)return;const t=(now-start)/1000;window.dariaFrame('front',['idle','run','draw','release','dodge'][Math.floor(t/1.5)%5],t);requestAnimationFrame(step);};requestAnimationFrame(step);};
window.dariaActors={before,after};
const ok=await Promise.all([before.root.userData.loadVisual(),after.root.userData.loadVisual()]);
window.dariaReady=ok.every(Boolean)?'ready':'failed';window.dariaFrame('front');
