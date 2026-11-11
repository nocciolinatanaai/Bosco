import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createRangerActor } from '/src/visuals/ranger.js';
import { createSession, attack, cast, dodge, movePlayer, tickCooldowns, advanceEnemies, drainEvents } from '/src/game.js';
// Drives the real simulation with a fixed script; rendering mirrors runtime.js (scale, yaw smoothing, animate call).
const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true});
renderer.setPixelRatio(1);renderer.setSize(1200,800,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene();scene.background=new THREE.Color('#3b4248');
const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.35;
scene.add(new THREE.HemisphereLight('#e6ecef','#3e3b36',1.4));const key=new THREE.DirectionalLight('#ffe6cc',2.4);key.position.set(4,8,6);scene.add(key);
const grid=new THREE.GridHelper(60,60,'#6b7680','#4a545c');scene.add(grid);
const camera=new THREE.PerspectiveCamera(55,1.5,.1,160);
const STEP=1/60;
// Script: run right, reverse, shoot a target behind, shoot and cancel with a dodge, skill, shoot while running diagonally.
const SCRIPT=[{t:0,move:[1,0]},{t:.9,move:[-1,0]},{t:1.5,attack:true},{t:2.2,move:null},{t:2.3,attack:true},{t:2.4,dodge:[0,1]},{t:2.9,cast:true},{t:3.8,move:[.7,-.7]},{t:4.0,attack:true},{t:4.8,move:null},{t:5.2,move:[-.7,.7]},{t:5.6,attack:true},{t:5.66,dodge:[-1,0]},{t:6.4,move:null},{t:6.7,end:true}];
let s,actor,variant,frame,move,last,prevFoot,events;
const v=()=>new THREE.Vector3();const tmp={a:v(),b:v(),c:v(),d:v(),fl:v(),fr:v()};
window.combatSetup=async name=>{
  if(actor)scene.remove(actor.root);
  variant=name;actor=createRangerActor({variant:name});scene.add(actor.root);
  const ok=await actor.root.userData.loadVisual();
  s=createSession('ranger');s.enemies=s.enemies.filter(e=>e.id==='shade-a');s.enemies[0].x=0;s.enemies[0].z=18;s.enemies[0].timer=99;
  frame=0;move=null;last=null;prevFoot=null;events=[];
  actor.root.scale.setScalar(1.2);actor.root.rotation.y=Math.atan2(s.facing.x,s.facing.z);
  return ok;
};
function bone(name){return actor.root.getObjectByName(name);}
window.combatStep=()=>{
  const t=frame*STEP;const notes=[];
  for(const c of SCRIPT)if(Math.abs(c.t-t)<STEP/2){
    if('move'in c)move=c.move;
    if(c.attack)notes.push(attack(s)?'attack':'attack-refused');
    if(c.cast)notes.push(cast(s)?'cast':'cast-refused');
    if(c.dodge)notes.push(dodge(s,...c.dodge)?'dodge':'dodge-refused');
    if(c.end)return {done:true};
  }
  const hadImpact=s.action&&!s.action.impacted;const actionBefore=s.action;
  tickCooldowns(s,STEP);let moving=false;
  if(move&&s.dodgeRemaining<=0){const speed=s.action?s.action.phase==='windup'?2.4:3.6:5;moving=movePlayer(s,move[0],move[1],STEP,speed)||false;}
  advanceEnemies(s,STEP);drainEvents(s);s.hp=s.maxHp;
  const impactNow=hadImpact&&actionBefore.impacted;
  // runtime.js lines: position, smoothed yaw toward facing/dodge direction, animate with simulation time.
  actor.root.position.set(s.x,0,s.z);
  const facing=s.dodgeRemaining>0?s.dodgeDirection:s.facing,angle=Math.atan2(facing.x,facing.z),diff=Math.atan2(Math.sin(angle-actor.root.rotation.y),Math.cos(angle-actor.root.rotation.y));
  actor.root.rotation.y+=diff*(1-Math.exp(-STEP*18));
  const action=s.action;
  actor.root.userData.animate(s.time,moving,action?Math.min(1,action.elapsed/action.duration):0,false,{action,dodge:s.dodgeRemaining,style:'bow',evolved:false,returnShot:0});
  actor.root.updateMatrixWorld(true);
  const bow=actor.root.getObjectByName('daria-skinned-bow');const out={t:+t.toFixed(4),notes,moving,phase:action?action.phase:s.dodgeRemaining>0?'dodge':moving?'run':'idle',impactNow};
  if(bow){
    const gripTruth=bone('wep_pos_L').getWorldPosition(tmp.a);const grip=bow.localToWorld(tmp.b.set(0,0,.12));
    out.gripError=+gripTruth.distanceTo(grip).toFixed(4);
    const line=bow.children.find(n=>n.isLine);const nock=bow.localToWorld(tmp.c.fromBufferAttribute(line.geometry.attributes.position,1));
    out.nockHand=+bone('wep_pos_R').getWorldPosition(tmp.d).distanceTo(nock).toFixed(4);
    const arrow=bow.children.find(n=>n.isMesh&&n.geometry.type==='CylinderGeometry');out.arrowVisible=Boolean(arrow?.visible);
    const fwd=v().set(0,0,1).transformDirection(bow.matrixWorld);fwd.y=0;fwd.normalize();
    if(action){const aim=v().set(action.aimX-s.x,0,action.aimZ-s.z).normalize();out.aimError=+THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(fwd.dot(aim),-1,1))).toFixed(2);}
  }
  const fl=bone('foot_L').getWorldPosition(tmp.fl),fr=bone('foot_R').getWorldPosition(tmp.fr);
  out.feet=[[fl.x,fl.y,fl.z].map(n=>+n.toFixed(4)),[fr.x,fr.y,fr.z].map(n=>+n.toFixed(4))];
  out.yawError=+THREE.MathUtils.radToDeg(Math.abs(Math.atan2(Math.sin(angle-actor.root.rotation.y),Math.cos(angle-actor.root.rotation.y)))).toFixed(2);
  out.loco=actor.root.userData.locomotion;
  if(bow){const local=actor.root.worldToLocal(bow.getWorldPosition(v()));out.bowLocal=[local.x,local.y,local.z].map(n=>+n.toFixed(4));out.bowInHand=actor.root.userData.bowInHand??1;}
  out.player=[+s.x.toFixed(3),+s.z.toFixed(3)];
  frame++;return out;
};
window.combatRender=(close=false)=>{
  const p=actor.root.position;const off=close?new THREE.Vector3(2.4,1.9,3.1):new THREE.Vector3(8,9,13);
  camera.position.copy(p).add(off);camera.lookAt(p.x,p.y+(close?1.4:1),p.z);renderer.render(scene,camera);
};
// PR #1 review P1 (Codex's probe, kept as a regression check): three identical actors after 30 frames —
// standing shot, moving shot, plain run. Upper body of the moving shot must match the standing shot,
// legs must follow the run. Local bone rotations, so the turn toward the target does not count.
window.layerCheck=async variant=>{
  const actors=[createRangerActor({variant}),createRangerActor({variant}),createRangerActor({variant})];
  await Promise.all(actors.map(a=>a.root.userData.loadVisual()));
  const action={elapsed:.2,windup:.28,duration:.7,kind:'basic',facing:{x:0,z:1}};
  for(let frame=1;frame<=30;frame++)for(let j=0;j<3;j++){const r=actors[j].root;r.position.x=frame*.05;r.userData.animate(frame/60,j!==0,0,false,{action:j===2?null:action});r.updateMatrixWorld(true);}
  const deg=(name,a,b)=>actors[a].root.getObjectByName(name).quaternion.angleTo(actors[b].root.getObjectByName(name).quaternion)*180/Math.PI;
  const upper=['torso','arm_upper_R','arm_lower_R','palm_R','arm_upper_L','arm_lower_L','palm_L'],legs=['leg_upper_L','leg_lower_L','leg_upper_R','leg_lower_R'];
  const r=actors[1].root,snap=()=>{const s=[];r.traverse(n=>{if(n.isBone)s.push(...n.quaternion.toArray());});return s;};
  r.userData.animate(.5,true,0,false,{action});const before=snap();r.userData.animate(.5,true,0,false,{action});const after=snap();
  return {upperMovingVsStanding:Object.fromEntries(upper.map(n=>[n,+deg(n,1,0).toFixed(3)])),upperMovingVsRun:Object.fromEntries(upper.map(n=>[n,+deg(n,1,2).toFixed(3)])),
    legsMovingVsStanding:Object.fromEntries(legs.map(n=>[n,+deg(n,1,0).toFixed(3)])),legsMovingVsRun:Object.fromEntries(legs.map(n=>[n,+deg(n,1,2).toFixed(3)])),
    repeatDrift:Math.max(...before.map((v,i)=>Math.abs(v-after[i])))};
};
window.combatReady=true;
