import * as THREE from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { curve, piece } from './geometry.js';
import { createPoseSampler } from './pose-sampler.js';
import { rangerFabric } from './ranger-fabric.js';

const sources=new Map();
// pass01: character-art pass with clothes, hair, braid, capelet and quiver inside the GLB.
export const RANGER_FILES={base:'ranger-base.glb',refined:'daria-refined.glb',pass01:'daria-pass01.glb'};
const loadSource = variant => {
  const name=RANGER_FILES[variant]||RANGER_FILES.pass01;
  if(!sources.has(name))sources.set(name,import('three/addons/loaders/GLTFLoader.js').then(({GLTFLoader})=>new GLTFLoader().loadAsync(`${import.meta.env?.BASE_URL || '/'}models/ranger/${name}`)).catch(error=>{sources.delete(name);throw error;}));
  return sources.get(name);
};

// Third-party CC0 anatomical/animation base, with original Mythwood accessories.
// Loading stays local and lazy. Every actor gets its own skeleton and mixer.
export function attachSkinnedRanger(root,{variant='pass01'}={}) {
  const refined=variant==='refined', dressed=variant==='pass01';
  const fallbackChildren=[...root.children], fallbackAnimate=root.userData.animate;
  let visual=null, pending=null;
  root.userData.visualStatus='placeholder';
  root.userData.loadVisual=()=>{
    if (typeof document==='undefined') return Promise.resolve(false);
    if (pending) return pending;
    root.userData.visualStatus='loading';
    pending=loadSource(variant).then(gltf=>{
      const model=clone(gltf.scene), presentation=new THREE.Group();presentation.name='Daria-skinned-presentation';
      presentation.add(model);
      const box=new THREE.Box3().setFromObject(model), height=box.max.y-box.min.y;
      if (!Number.isFinite(height)||height<=0) throw Error('Invalid Ranger bounds');
      const scale=2.2/height;model.scale.multiplyScalar(scale);model.position.y=-box.min.y*scale;
      model.traverse(n=>{
        if(!n.isMesh)return;n.castShadow=true;n.receiveShadow=true;
        n.material=n.material.clone();if(dressed){n.frustumCulled=false;return;}if(!refined)n.material.roughness=.85;
        if(refined&&/coat|undershirt|trousers|scarf/.test(n.material.name)){Object.assign(n.material,rangerFabric());n.material.normalScale=new THREE.Vector2(.18,.18);}
        if(n.material.name.includes('medium_armor'))n.material.color.set('#9bbbc0');
        if(n.material.name.includes('head')){n.material.color.set(refined?'#dfb38b':'#e1bb98');if(refined)n.material.roughness=.65;}

      });
      presentation.updateMatrixWorld(true);
      const mixer=new THREE.AnimationMixer(model), clips=Object.fromEntries(gltf.animations.map(c=>[c.name.replace('human_female_',''),c]));
      for(const name of ['idle','run','channel_two_handed_bow','cast_two_handed_bow','jump'])if(!clips[name])throw Error(`Missing Ranger motion: ${name}`);
      const poseSampler=createPoseSampler(mixer,Object.entries(clips).map(([name,clip])=>{const named=clip.clone();named.name=name;return named;}));
      // Combat locomotion (pass01): run phase driven by real ground speed, legs keep running under the bow pose.
      const legNames=['leg_upper_L','leg_lower_L','foot_L','toes_L','heel_L','leg_upper_R','leg_lower_R','foot_R','toes_R','heel_R'];
      const legs=dressed?legNames.map(n=>model.getObjectByName(n)).filter(Boolean):[];
      let legMixer=null,legAction=null,stride=0;
      if(dressed){
        const runClip=clips.run.clone();runClip.name='legs-run';legMixer=new THREE.AnimationMixer(model);legAction=legMixer.clipAction(runClip);legAction.play();
        const fl=model.getObjectByName('foot_L'),fr=model.getObjectByName('foot_R'),a=new THREE.Vector3(),b=new THREE.Vector3(),samples=[];
        for(let i=0;i<=48;i++){legAction.time=i/48*runClip.duration;legMixer.update(0);model.updateWorldMatrix(true,true);presentation.worldToLocal(fl.getWorldPosition(a));presentation.worldToLocal(fr.getWorldPosition(b));samples.push([a.y,a.z,b.y,b.z]);}
        const low=Math.min(...samples.flatMap(q=>[q[0],q[2]])),rates=[];
        for(let i=1;i<samples.length;i++)for(const k of [0,2]){const q=samples[i],o=samples[i-1];if(q[k]<=low+.05&&q[k]<=q[2-k])rates.push(Math.abs(q[k+1]-o[k+1])*48);}
        rates.sort((x,y)=>x-y);stride=rates.length?rates[Math.floor(rates.length/2)]:0;
        legAction.stop();legAction.play();
      }
      const palmL=model.getObjectByName(dressed?'wep_pos_L':'palm_L'),palmR=model.getObjectByName(dressed?'wep_pos_R':'palm_R'),torso=model.getObjectByName('torso');
      if(!palmL||!palmR||!torso)throw Error('Incomplete Ranger skeleton');
      const wood=new THREE.MeshStandardMaterial({color:'#563d2c',roughness:.65}),brass=new THREE.MeshStandardMaterial({color:'#b69a60',metalness:.65,roughness:.4});
      const bow=new THREE.Group();bow.name='daria-skinned-bow';presentation.add(bow);
      curve(bow,wood,[[0,-.7,0],[0,-.42,.21],[0,0,.12],[0,.45,.24],[0,.8,.02]],.025,24);
      for(const side of [-1,1])curve(bow,brass,[[0,side*.42,.2],[.035,side*.62,.17],[0,side*.8,.01]],.011,12);
      const lineGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-.7,0),new THREE.Vector3(0,0,0),new THREE.Vector3(0,.8,.02)]);
      bow.add(new THREE.Line(lineGeo,new THREE.LineBasicMaterial({color:'#d4c6a8'})));
      const glowMat=new THREE.MeshBasicMaterial({color:'#ffda97',transparent:true,opacity:.6});
      const echo=new THREE.Group();bow.add(echo);
      for(const side of [-1,1])curve(echo,glowMat,[[0,side*.5,.21],[.04,side*.84,.18],[0,side*.95,0]],.014,12);
      const arrow=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.9,6),brass);arrow.rotation.x=Math.PI/2;arrow.position.set(0,0,.3);bow.add(arrow);
      const capeGeo=new THREE.PlaneGeometry(.7,.95,refined?24:8,refined?28:10),vertices=capeGeo.attributes.position;
      for(let i=0;i<vertices.count;i++){
        const x=vertices.getX(i),f=(.475-vertices.getY(i))/.95,u=x/.35;
        if(refined){
          vertices.setX(i,x*(.82+f*.50)+f*.035);
          vertices.setY(i,(.475-f*.8)+u*.055+Math.cos(u*Math.PI)*.028-f*f*(.025+Math.sin(u*5)*.022));
          vertices.setZ(i,.025-Math.cos(u*Math.PI/2)*.025-f*.10+Math.sin(u*Math.PI*3)*(.008+f*.045));
        }else{vertices.setX(i,x*(.6+f*.6));vertices.setY(i,vertices.getY(i)+x*.12-f*f*Math.cos(x*9)*.035);vertices.setZ(i,-f*.16+Math.cos(x*19)*(.012+f*.025));}
      }
      capeGeo.computeVertexNormals();const original=Float32Array.from(vertices.array);
      const cape=piece(presentation,capeGeo,new THREE.MeshStandardMaterial({color:'#8e432e',roughness:.96,side:THREE.DoubleSide}),0,1.28,-.22);cape.name='daria-skinned-cape';if(refined){Object.assign(cape.material,rangerFabric());cape.material.normalScale=new THREE.Vector2(.2,.2);}
      const scarf=piece(presentation,new THREE.TorusGeometry(.105,.032,7,20),new THREE.MeshStandardMaterial({color:'#7e8b69',roughness:1}));scarf.rotation.x=Math.PI/2;scarf.visible=!refined;
      const quiver=piece(presentation,new THREE.CylinderGeometry(.085,.07,.52,12),wood);quiver.rotation.z=-.22;
      const braid=new THREE.Group();presentation.add(braid);
      const hair=new THREE.MeshStandardMaterial({color:'#29201c',roughness:.92});
      for(let strand=0;strand<(refined?0:3);strand++){const path=[];for(let n=0;n<14;n++){const a=n*1.4+strand*Math.PI*2/3;path.push([.08+Math.sin(a)*.023+n*.004,-n*.035,-.13+Math.cos(a)*.018]);}curve(braid,hair,path,.014,26);}
      // The dressed GLB carries its own capelet, scarf, braid and quiver, skinned to the skeleton.
      if(dressed){cape.visible=false;scarf.visible=false;quiver.visible=false;braid.visible=false;}
      const head=model.getObjectByName('head'),headPosition=new THREE.Vector3(),nock=new THREE.Vector3();
      const left=new THREE.Vector3(),right=new THREE.Vector3(),chest=new THREE.Vector3(),forward=new THREE.Vector3(),xAxis=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),basis=new THREE.Matrix4();
      // Authored animation is sampled by normalized game action phase, never changes hit timing.
      visual={refined,dressed,nock,arrowDir:new THREE.Vector3(),yAxis:new THREE.Vector3(0,1,0),legs,legMixer,legAction,stride,runPhase:0,lastWorld:new THREE.Vector3(),hasWorld:false,aimYaw:0,parentQ:new THREE.Quaternion(),parentE:new THREE.Euler(),legQ:legs.map(()=>new THREE.Quaternion()),presentation,model,mixer,poseSampler,clips,palmL,palmR,torso,bow,echo,arrow,cape,vertices,original,left,right,chest,forward,xAxis,up,basis,lineGeo,scarf,quiver,braid,head,headPosition,yaw:0,lastTime:null};
      for(const node of fallbackChildren)node.visible=false;
      root.add(presentation);root.userData.visualStatus='ready';root.userData.visualSource='System G6 CC0 / Mythwood accessories';
      root.userData.visualClips=Object.keys(clips);root.userData.visualVariant=variant;
      root.userData.animate(0,false,0,true,{});
      return true;
    }).catch(()=>{if(visual){root.remove(visual.presentation);visual=null;for(const node of fallbackChildren)node.visible=true;}root.userData.visualStatus='fallback';pending=null;return false;});
    return pending;
  };
  root.userData.animate=(time,moving,attack,reducedMotion,combat={})=>{
    if(!visual){fallbackAnimate(time,moving,attack,reducedMotion,combat);return;}
    const v=visual,action=combat.action,drawing=action&&action.elapsed<action.windup;
    const name=combat.dodge>0?'jump':action?(drawing?'channel_two_handed_bow':'cast_two_handed_bow'):moving?'run':'idle';
    const duration=v.clips[name].duration;
    let phase;
    if(action)phase=drawing?Math.min(.95,action.elapsed/action.windup):Math.min(.95,(action.elapsed-action.windup)/Math.max(.01,action.duration-action.windup));
    else if(combat.dodge>0)phase=Math.min(.95,Math.max(0,1-combat.dodge/.24));
    else phase=reducedMotion&&!moving?0:((time*(moving?1.35:1))%duration)/duration;
    let speed=0;
    if(v.dressed){
      // Ground speed from the actor's own world motion (presentation units/s); the simulation is untouched.
      const dtw=v.lastTime===null?0:time-v.lastTime;root.getWorldPosition(v.headPosition);
      if(v.hasWorld&&dtw>0&&dtw<.25){const scale=v.presentation.getWorldScale(v.chest).x||1;speed=Math.hypot(v.headPosition.x-v.lastWorld.x,v.headPosition.z-v.lastWorld.z)/dtw/scale;}
      if(dtw<0)v.runPhase=0;
      v.lastWorld.copy(v.headPosition);v.hasWorld=true;
      if(moving&&v.stride>0&&dtw>0&&dtw<.25)v.runPhase=(v.runPhase+speed/v.stride*dtw)%1;
      if(name==='run'&&!reducedMotion&&v.stride>0)phase=v.runPhase;
      root.userData.locomotion={stride:v.stride,speed,runPhase:v.runPhase};
    }
    v.poseSampler.sample(name,phase,time,{immediate:reducedMotion});v.model.rotation.y=0;
    if(v.dressed&&action&&moving&&!reducedMotion&&v.stride>0){
      // Legs keep the stride-locked run while the upper body draws or releases.
      for(let i=0;i<v.legs.length;i++)v.legQ[i].copy(v.legs[i].quaternion);
      v.legAction.time=v.runPhase*v.clips.run.duration;v.legMixer.update(0);
      const w=Math.min(1,speed/2.4);
      for(let i=0;i<v.legs.length;i++){const run=v.legs[i].quaternion.clone();v.legs[i].quaternion.copy(v.legQ[i]).slerp(run,w);}
    }
    v.model.updateWorldMatrix(true,true);
    v.presentation.worldToLocal(v.palmL.getWorldPosition(v.left));v.presentation.worldToLocal(v.palmR.getWorldPosition(v.right));
    let targetYaw=0;
    if(action){
      v.forward.subVectors(v.left,v.right);v.forward.y=0;
      if(v.forward.lengthSq()>.001)targetYaw=-Math.atan2(v.forward.x,v.forward.z);
    }
    const dt=v.lastTime===null?1/60:Math.max(0,Math.min(.05,time-v.lastTime));
    const yawDelta=Math.atan2(Math.sin(targetYaw-v.yaw),Math.cos(targetYaw-v.yaw));
    v.yaw=reducedMotion||(v.lastTime!==null&&time<v.lastTime)?targetYaw:v.yaw+yawDelta*(1-Math.exp(-18*dt));v.lastTime=time;
    v.model.rotation.y=v.yaw;
    if(v.dressed){
      let aim=0;
      if(action&&action.facing){root.getWorldQuaternion(v.parentQ);v.parentE.setFromQuaternion(v.parentQ,'YXZ');
        root.getWorldPosition(v.chest);const ax=Number.isFinite(action.aimX)?action.aimX-v.chest.x:action.facing.x,az=Number.isFinite(action.aimZ)?action.aimZ-v.chest.z:action.facing.z;
        aim=(Math.hypot(ax,az)>.3?Math.atan2(ax,az):Math.atan2(action.facing.x,action.facing.z))-v.parentE.y;aim=Math.atan2(Math.sin(aim),Math.cos(aim));}
      const da=Math.atan2(Math.sin(aim-v.aimYaw),Math.cos(aim-v.aimYaw));
      v.aimYaw=reducedMotion?aim:v.aimYaw+da*(1-Math.exp(-(action?40:18)*dt));
      v.presentation.rotation.y=v.aimYaw;
    }
    v.model.updateWorldMatrix(true,true);
    v.presentation.worldToLocal(v.palmL.getWorldPosition(v.left));v.presentation.worldToLocal(v.palmR.getWorldPosition(v.right));
    // Model bow clips have a native aiming axis. Align it with simulation +Z.
    v.forward.set(0,0,1);
    v.xAxis.crossVectors(v.up,v.forward).normalize();v.basis.makeBasis(v.xAxis,v.up,v.forward);v.bow.quaternion.setFromRotationMatrix(v.basis);
    v.bow.position.copy(v.left).addScaledVector(v.forward,-.12);
    if(v.dressed&&!action&&!(combat.dodge>0)&&moving){
      // Running with an empty draw hand: the bow rides across the back (as in the sheet) instead of cutting through the legs.
      v.presentation.worldToLocal(v.torso.getWorldPosition(v.chest));
      v.bow.position.set(v.chest.x+.02,v.chest.y+.22,v.chest.z-.3);v.bow.rotateZ(.62);
    }
    const draw=drawing?Math.min(1,action.elapsed/action.windup):0;
    let pull=draw*.28,nockY=0;
    if(v.dressed&&drawing){
      // The string follows the drawing hand when it is near the bow plane; released string snaps back.
      v.bow.updateMatrixWorld(true);v.bow.worldToLocal(v.palmR.getWorldPosition(v.nock));
      pull=Math.min(.5,Math.max(pull*.5,-v.nock.z));nockY=Math.max(-.25,Math.min(.25,v.nock.y));
    }
    v.lineGeo.attributes.position.setXYZ(1,0,nockY,-pull);v.lineGeo.attributes.position.needsUpdate=true;
    // Arrow lies on the rest at the grip and its tail sits on the nock.
    v.arrowDir.set(0,-nockY,.45+pull).normalize();v.arrow.quaternion.setFromUnitVectors(v.yAxis,v.arrowDir);
    v.arrow.position.set(0,nockY,-pull).addScaledVector(v.arrowDir,.45);
    v.arrow.visible=Boolean(drawing);v.echo.visible=Boolean(combat.evolved);
    v.presentation.worldToLocal(v.torso.getWorldPosition(v.chest));v.cape.position.set(v.chest.x,v.chest.y+.05,v.chest.z-(v.refined?.24:.18));v.cape.rotation.y=v.refined?v.yaw:0;
    v.presentation.worldToLocal(v.head.getWorldPosition(v.headPosition));v.braid.position.copy(v.headPosition);v.braid.rotation.y=v.model.rotation.y;
    v.scarf.position.set(v.chest.x,v.chest.y+.48,v.chest.z);v.quiver.position.set(v.chest.x+.16,v.chest.y+.1,v.chest.z-.3);
    if(v.dressed)return;
    for(let i=0;i<v.vertices.count;i++){const f=(.475-v.original[i*3+1])/.95;v.vertices.setZ(i,v.original[i*3+2]+(reducedMotion?0:Math.sin(time*4+v.original[i*3]*7)*.025*f));}
    v.vertices.needsUpdate=true;v.cape.geometry.computeVertexNormals();
  };
}
