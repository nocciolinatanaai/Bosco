import * as THREE from 'three';
import {piece,link,batchArchitecture} from './geometry.js';
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function guardianPose(time,combat={},moving=false,reducedMotion=false){
 const charging=combat.phase==='windup',nova=combat.attackKind==='nova';
 const progress=charging?1-Math.max(0,combat.windup)/Math.max(.01,combat.chargeDuration||1.15):0;
 const release=charging?ease((progress-.8)/.2):combat.phase==='recovery'?1:0;
 const recovery=combat.phase==='recovery'?ease(((combat.recoveryDuration||1.5)-(combat.recovery||0))/Math.max(.01,combat.recoveryDuration||1.5)):0;
 const charge=charging?ease(progress/.8):combat.phase==='recovery'?1-recovery:0;
 const impact=release*(1-recovery),stride=moving?Math.sin(time*3.5)*.2:0;
 return {rightArm:nova?-.15-charge*1.7+impact*.6:-.12-charge*2.1+impact*1.8,leftArm:nova?-.15-charge*1.7+impact*.6:-.2-charge*.45+impact*.35,
 rightSpread:nova?charge*.75:charge*.12,leftSpread:nova?-charge*.75:-charge*.12,
 elbow:-.18-charge*.55+impact*.4,lean:combat.phase==='stagger'?-.2:charge*-.12+impact*.38,
 twist:nova?0:-charge*.16+impact*.28,leftLeg:stride,rightLeg:-stride,
 bob:reducedMotion?0:moving?Math.abs(Math.sin(time*3.5))*.035:Math.sin(time*.9)*.012,core:1+charge*.15,charge,impact};
}
function plate(parent,material,outline,depth,position){
 const shape=new THREE.Shape();outline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.035,bevelThickness:.035});geometry.translate(0,0,-depth/2);
 return piece(parent,geometry,material,...position);
}
function joint(parent,name,x,y,z){const node=new THREE.Group();node.name=name;node.position.set(x,y,z);parent.add(node);return node;}
function merge(node){const source=new THREE.Group();for(const child of [...node.children])if(child.isMesh)source.add(child);node.add(batchArchitecture(source));}
const STONE_TINT='#6f7784';
let pendingGlb=Promise.resolve();
export const guardianGlbReady=()=>pendingGlb;
export function createSealedGuardian(m){
 const root=new THREE.Group();root.name='Custode-della-voce';
 const torso=joint(root,'guardian-torso',0,2.15,0);
 plate(torso,m.dark,[[-.45,-.65],[.45,-.65],[.68,.55],[.46,1.02],[-.46,1.02],[-.68,.55]],.72,[0,0,0]);
 for(const side of [-1,1]){
  const chest=plate(torso,m.stone,[[0,-.5],[.42,-.24],[.62,.78],[.12,.91]],.24,[side*.08,.02,.45]);chest.scale.x=side;
  for(let i=0;i<3;i++)plate(torso,m.iron,[[-.12,-.13],[.3,-.18],[.38,.12],[-.1,.15]],.18,[side*(.18+i*.075),-.45+i*.27,.49]).scale.x=side;
  plate(torso,m.brass,[[-.025,-.48],[.025,-.48],[.025,.8],[-.025,.8]],.07,[side*.15,.05,.62]);
  // Broken lintels frame the captive voice rather than a decorative halo.
  const lintel=plate(torso,m.stone,[[-.16,0],[.16,0],[.25,1.45],[-.1,1.75]],.3,[side*.68,.3,-.45]);if(side>0)lintel.scale.y=.72;lintel.rotation.z=-side*.24;
  const leg=joint(root,side<0?'guardian-left-leg':'guardian-right-leg',side*.43,1.5,0);
  link(leg,m.dark,[0,0,0],[0,-1.15,0],.16,.16,6);
  plate(leg,m.stone,[[-.24,-.66],[.22,-.66],[.3,-.08],[-.27,.12]],.4,[0,-.02,.03]);
  plate(leg,m.iron,[[-.2,-.62],[.19,-.62],[.24,-.1],[0,.08],[-.24,-.1]],.38,[0,-.64,.13]);
  plate(leg,m.stone,[[-.29,-.12],[.27,-.12],[.3,.17],[-.21,.21]],.74,[0,-1.34,.2]);merge(leg);
  const arm=joint(torso,side<0?'guardian-left-arm':'guardian-right-arm',side*.92,.65,0);
  plate(arm,m.stone,[[-.37,-.24],[.38,-.24],[.49,.18],[.12,.43],[-.38,.21]],.66,[side*.07,0,0]);
  plate(arm,m.brass,[[-.3,-.2],[.28,-.2],[.32,-.12],[-.3,-.12]],.72,[side*.07,0,0]);
  link(arm,m.dark,[0,-.18,0],[0,-.65,0],.14,.14,6);plate(arm,m.iron,[[-.2,-.42],[.2,-.42],[.26,.03],[-.25,.03]],.38,[0,-.25,0]);
  const elbow=joint(arm,side<0?'guardian-left-elbow':'guardian-right-elbow',0,-.77,0);
  plate(elbow,m.stone,[[-.28,-.66],[.26,-.66],[.32,.05],[-.3,.14]],.5,[0,0,.03]);
  for(let i=0;i<3;i++)plate(elbow,m.iron,[[-.25,-.09],[.25,-.09],[.27,.05],[-.27,.05]],.54,[0,-.16-i*.18,.07]);
  plate(elbow,m.dark,[[-.24,-.26],[.24,-.26],[.28,.15],[-.28,.15]],.45,[0,-.78,.09]);
  for(let i=0;i<3;i++)piece(elbow,new THREE.BoxGeometry(.11,.28,.18),m.stone,-.15+i*.15,-.99,.19);
  merge(elbow);merge(arm);
 }
 for(const side of [-1,1]){const tabard=plate(torso,m.cloth,[[-.22,0],[.23,0],[.28,-.72],[.06,-1.02],[-.26,-.86]],.025,[side*.28,-.48,.36]);tabard.rotation.y=side*.12;}
 const head=joint(torso,'guardian-head',0,1.3,.02);
 plate(head,m.dark,[[-.26,-.34],[.26,-.34],[.36,.08],[.18,.48],[-.18,.48],[-.36,.08]],.55,[0,0,0]);
 for(const side of [-1,1]){
  const hood=plate(head,m.stone,[[0,-.35],[.22,-.23],[.3,.13],[.12,.48],[-.02,.44]],.17,[side*.12,0,.32]);hood.scale.x=side;
 }
 piece(head,new THREE.BoxGeometry(.035,.28,.025),m.luminous,0,-.035,.31);merge(head);
 // A narrow suspended seal, visibly enclosed by the stone breastplates.
 const core=joint(torso,'guardian-voice-seal',0,.25,.5);
 const gem=piece(core,new THREE.OctahedronGeometry(.19,0),m.luminous);gem.scale.set(.5,1.9,.4);
 for(let i=0;i<3;i++)piece(core,new THREE.BoxGeometry(.23,.025,.03),m.brass,0,-.18+i*.18,.09);
 merge(torso);
 const left=root.getObjectByName('guardian-left-arm'),right=root.getObjectByName('guardian-right-arm');
 const leftLeg=root.getObjectByName('guardian-left-leg'),rightLeg=root.getObjectByName('guardian-right-leg');
 const leftElbow=root.getObjectByName('guardian-left-elbow'),rightElbow=root.getObjectByName('guardian-right-elbow');
 let rig={left,right,leftLeg,rightLeg,leftElbow,rightElbow,torso,core};
 root.userData.leftArm=left;root.userData.rightArm=right;root.userData.design='sealed-stone-warden';
 // ART-03 (candidato): Custode modellato in Blender (tools/blender-probes/custode-probe.py), stesse giunture e stessa posa;
 // il procedurale resta di ripiego se il GLB non si carica. ?noglb mostra il procedurale per i confronti.
 if(typeof document!=='undefined'&&!(typeof location!=='undefined'&&new URLSearchParams(location.search).has('noglb'))){
  pendingGlb=import('three/addons/loaders/GLTFLoader.js').then(({GLTFLoader})=>new GLTFLoader().loadAsync((import.meta.env?.BASE_URL||'/')+'art/custode-probe/custode.glb')).then((gltf)=>{
   const g=gltf.scene;g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material.name==='custode-stone')o.material.color.set(STONE_TINT);}});
   const n=(k)=>g.getObjectByName(k);
   rig={left:n('guardian-left-arm'),right:n('guardian-right-arm'),leftLeg:n('guardian-left-leg'),rightLeg:n('guardian-right-leg'),leftElbow:n('guardian-left-elbow'),rightElbow:n('guardian-right-elbow'),torso:n('guardian-torso'),core:n('guardian-voice-seal')};
   torso.visible=false;leftLeg.visible=false;rightLeg.visible=false;root.add(g);
   root.userData.leftArm=rig.left;root.userData.rightArm=rig.right;root.userData.design='blender-probe';root.userData.animate(0,0,false,true,{phase:'idle'});
  }).catch(()=>{});
 }
 root.userData.animate=(time,windup,moving,reducedMotion,combat={})=>{
  const pose=guardianPose(time,{...combat,windup},moving,reducedMotion),r=rig;
  r.right.rotation.set(pose.rightArm,0,pose.rightSpread);r.left.rotation.set(pose.leftArm,0,pose.leftSpread);
  r.leftElbow.rotation.x=pose.elbow;r.rightElbow.rotation.x=pose.elbow;
  r.leftLeg.rotation.x=pose.leftLeg;r.rightLeg.rotation.x=pose.rightLeg;
  r.torso.rotation.set(pose.lean,pose.twist,0);r.torso.position.y=2.15+pose.bob-pose.impact*.3;r.core.scale.setScalar(pose.core);
 };
 root.userData.animate(0,0,false,true,{phase:'idle'});return root;
}
