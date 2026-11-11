import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createAdventurer } from '/src/visuals/actors.js';
import { createMaterials } from '/src/visuals/materials.js';
import { CLASSES } from '/src/roles.js';
const renderer = new THREE.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true});
renderer.setSize(1200,800,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene();scene.background=new THREE.Color('#222c33');
const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.04);
scene.environment=environment.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight('#e0e7ec','#3d3d38',1.8));
const light=new THREE.DirectionalLight('#ffe5ca',2.3);light.position.set(3,5,4);scene.add(light);
const camera=new THREE.PerspectiveCamera(32,1.5,.1,30);camera.position.set(0,1.7,5.3);camera.lookAt(0,1.15,0);
const actor=createAdventurer(createMaterials());scene.add(actor.root);
let selected='tank',playing=false,frameId;
window.rosterSelect=async role=>{
  playing=false;cancelAnimationFrame(frameId);selected=role;
  actor.root.userData.setClass(CLASSES.find(c=>c.id===role));
  const root=actor.root.getObjectByName(role==='ranger'?'Daria-ranger-prototype':'prototype-shared-body');
  const success=await (role==='ranger'?root.userData.loadVisual():root.userData.selectVisual(role));
  if(!success)throw Error('Character load failed: '+role);
  window.rosterFrame('idle');return root.userData.visualStatus;
};
window.rosterFrame=(pose,time=1.25,angle=.18)=>{
  const action=pose==='prepare'?{elapsed:.18,windup:.28,duration:.7,kind:'basic'}:
    ['attack','special'].includes(pose)?{elapsed:.46,windup:.28,duration:.7,kind:pose==='special'?'skill':'basic'}:null;
  actor.root.rotation.y=angle;
  actor.root.userData.animate(time,pose==='run',0,true,{style:CLASSES.find(c=>c.id===selected).style,action});
  renderer.render(scene,camera);
  const root=actor.root.getObjectByName(selected==='ranger'?'Daria-skinned-presentation':`${selected}-skinned-presentation`);
  let triangles=0,skinned=0;root.traverse(n=>{if(n.isMesh){triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;if(n.isSkinnedMesh)skinned++;}});
  return {role:selected,pose,triangles,skinned,bounds:new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).toArray()};
};
document.querySelector('#role').onchange=e=>window.rosterSelect(e.target.value);
document.querySelectorAll('[data-pose]').forEach(button=>button.onclick=()=>{playing=false;cancelAnimationFrame(frameId);window.rosterFrame(button.dataset.pose);});
document.querySelector('#play').onclick=()=>{
  playing=!playing;if(!playing){cancelAnimationFrame(frameId);return;}const start=performance.now();
  const step=now=>{if(!playing)return;const t=(now-start)/1000;window.rosterFrame(['idle','run','prepare','attack','special'][Math.floor(t)%5],t);frameId=requestAnimationFrame(step);};
  frameId=requestAnimationFrame(step);
};
await window.rosterSelect('tank');window.rosterReady=true;
