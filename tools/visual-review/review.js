import * as THREE from 'three';
import { createRangerActor } from '/src/visuals/ranger.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true});renderer.setSize(1200,800,false);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene();scene.background=new THREE.Color('#101d27');
const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.3;room.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight('#c8d9ef','#252c31',1));
const light=new THREE.DirectionalLight('#ffe1ba',2.5);light.position.set(3,5,5);scene.add(light);const rim=new THREE.DirectionalLight('#9aaeff',1);rim.position.set(-3,4,-3);scene.add(rim);
const camera=new THREE.PerspectiveCamera(34,1.5,.1,40);camera.position.set(0,2.35,5.5);camera.lookAt(0,1.1,0);
const old=createRangerActor(),next=createRangerActor();old.root.position.x=-1;next.root.position.x=1;scene.add(old.root,next.root);
const ready=await next.root.userData.loadVisual();if(!ready)throw Error('Skinned model failed to load');
const floor=new THREE.Mesh(new THREE.PlaneGeometry(15,12),new THREE.MeshStandardMaterial({color:'#1d303e',roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-.02;scene.add(floor);
window.reviewPose=(pose,time=1.25)=>{
 for(const actor of [old,next]){actor.root.rotation.y=pose==='back'?Math.PI:.2;actor.root.userData.animate(time,pose==='run',0,true,{evolved:pose==='draw',action:pose==='draw'?{elapsed:.23,windup:.28,duration:.7,kind:'skill'}:null});}
 renderer.render(scene,camera);
 return {bowForward:next.root.getObjectByName('daria-skinned-bow').getWorldDirection(new THREE.Vector3()).toArray(),actorForward:new THREE.Vector3(0,0,1).applyQuaternion(next.root.quaternion).toArray()};
};
window.reviewModel=()=>{let triangles=0,meshes=0,skinned=0;const loaded=next.root.getObjectByName('Daria-skinned-presentation');loaded.traverse(n=>{if(n.isMesh){meshes++;triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;if(n.isSkinnedMesh)skinned++;}});return {triangles,meshes,skinned,status:next.root.userData.visualStatus,clips:next.root.userData.visualClips,bounds:new THREE.Box3().setFromObject(loaded).getSize(new THREE.Vector3()).toArray()};};
window.reviewPose('idle');window.reviewReady=true;
document.querySelectorAll('button').forEach(b=>b.onclick=()=>window.reviewPose(b.dataset.pose));

// Observe real skeleton output at action boundaries, not sampler internals.
window.reviewMotion=()=>{
 const actor=next.root;actor.rotation.y=.2;
 const model=actor.getObjectByName('Daria-skinned-presentation');
 const bones=['palm_L','palm_R','head'].map(name=>model.getObjectByName(name));
 const snapshot=()=>bones.map(b=>b.getWorldPosition(new THREE.Vector3()).toArray());
 const distance=(a,b)=>Math.max(...a.map((v,i)=>new THREE.Vector3(...v).distanceTo(new THREE.Vector3(...b[i]))));
 const frame=(time,moving,combat={})=>{actor.userData.animate(time,moving,0,false,combat);renderer.render(scene,camera);return snapshot();};
 const idle=frame(2,false),start=frame(2,false,{action:{elapsed:0,windup:.28,duration:.7}});
 const midway=frame(2.06,false,{action:{elapsed:.06,windup:.28,duration:.7}});
 const interrupted=frame(2.06,true);
 const paused=frame(2.06,true);
 const reset=frame(0,false);
 window.reviewPose('idle');
 return {startJump:distance(idle,start),interruptJump:distance(midway,interrupted),pauseDrift:distance(interrupted,paused),resetFinite:reset.every(v=>v.every(Number.isFinite))};
};
