import * as THREE from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { curve, piece } from './geometry.js';

let source;
const loadSource = () => source ||= import('three/addons/loaders/GLTFLoader.js').then(({GLTFLoader})=>new GLTFLoader().loadAsync(`${import.meta.env?.BASE_URL || '/'}models/ranger/ranger-base.glb`)).catch(error => { source=null; throw error; });

// Third-party CC0 anatomical/animation base, with original Mythwood accessories.
// Loading stays local and lazy. Every actor gets its own skeleton and mixer.
export function attachSkinnedRanger(root) {
  const fallbackChildren=[...root.children], fallbackAnimate=root.userData.animate;
  let visual=null, pending=null;
  root.userData.visualStatus='placeholder';
  root.userData.loadVisual=()=>{
    if (typeof document==='undefined') return Promise.resolve(false);
    if (pending) return pending;
    root.userData.visualStatus='loading';
    pending=loadSource().then(gltf=>{
      const model=clone(gltf.scene), presentation=new THREE.Group();presentation.name='Daria-skinned-presentation';
      presentation.add(model);
      const box=new THREE.Box3().setFromObject(model), height=box.max.y-box.min.y;
      if (!Number.isFinite(height)||height<=0) throw Error('Invalid Ranger bounds');
      const scale=2.2/height;model.scale.multiplyScalar(scale);model.position.y=-box.min.y*scale;
      model.traverse(n=>{
        if(!n.isMesh)return;n.castShadow=true;n.receiveShadow=true;
        n.material=n.material.clone();n.material.roughness=.85;
        if(n.material.name.includes('medium_armor'))n.material.color.set('#9bbbc0');
        if(n.material.name.includes('head'))n.material.color.set('#e1bb98');
      });
      presentation.updateMatrixWorld(true);
      const mixer=new THREE.AnimationMixer(model), clips=Object.fromEntries(gltf.animations.map(c=>[c.name.replace('human_female_',''),c]));
      for(const name of ['idle','run','channel_two_handed_bow','cast_two_handed_bow','jump'])if(!clips[name])throw Error(`Missing Ranger motion: ${name}`);
      const actions=Object.fromEntries(Object.entries(clips).map(([name,clip])=>[name,mixer.clipAction(clip)]));
      const palmL=model.getObjectByName('palm_L'),palmR=model.getObjectByName('palm_R'),torso=model.getObjectByName('torso');
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
      const capeGeo=new THREE.PlaneGeometry(.7,.95,8,10),vertices=capeGeo.attributes.position;
      for(let i=0;i<vertices.count;i++){const x=vertices.getX(i),f=(.475-vertices.getY(i))/.95;vertices.setX(i,x*(.6+f*.6));vertices.setY(i,vertices.getY(i)+x*.12-f*f*Math.cos(x*9)*.035);vertices.setZ(i,-f*.16+Math.cos(x*19)*(.012+f*.025));}
      capeGeo.computeVertexNormals();const original=Float32Array.from(vertices.array);
      const cape=piece(presentation,capeGeo,new THREE.MeshStandardMaterial({color:'#8e432e',roughness:.96,side:THREE.DoubleSide}),0,1.28,-.22);cape.name='daria-skinned-cape';
      const scarf=piece(presentation,new THREE.TorusGeometry(.105,.032,7,20),new THREE.MeshStandardMaterial({color:'#7e8b69',roughness:1}));scarf.rotation.x=Math.PI/2;
      const quiver=piece(presentation,new THREE.CylinderGeometry(.085,.07,.52,12),wood);quiver.rotation.z=-.22;
      const braid=new THREE.Group();presentation.add(braid);
      const hair=new THREE.MeshStandardMaterial({color:'#29201c',roughness:.92});
      for(let strand=0;strand<3;strand++){const path=[];for(let n=0;n<14;n++){const a=n*1.4+strand*Math.PI*2/3;path.push([.08+Math.sin(a)*.023+n*.004,-n*.035,-.13+Math.cos(a)*.018]);}curve(braid,hair,path,.014,26);}
      const head=model.getObjectByName('head'),headPosition=new THREE.Vector3();
      const left=new THREE.Vector3(),right=new THREE.Vector3(),chest=new THREE.Vector3(),forward=new THREE.Vector3(),xAxis=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),basis=new THREE.Matrix4();
      // Authored animation is sampled by normalized game action phase, never changes hit timing.
      visual={presentation,model,mixer,actions,clips,palmL,palmR,torso,bow,echo,arrow,cape,vertices,original,left,right,chest,forward,xAxis,up,basis,lineGeo,scarf,quiver,braid,head,headPosition,current:null,lastTime:null};
      for(const node of fallbackChildren)node.visible=false;
      root.add(presentation);root.userData.visualStatus='ready';root.userData.visualSource='System G6 CC0 / Mythwood accessories';
      root.userData.visualClips=Object.keys(clips);
      root.userData.animate(0,false,0,true,{});
      return true;
    }).catch(()=>{if(visual){root.remove(visual.presentation);visual=null;for(const node of fallbackChildren)node.visible=true;}root.userData.visualStatus='fallback';pending=null;return false;});
    return pending;
  };
  root.userData.animate=(time,moving,attack,reducedMotion,combat={})=>{
    if(!visual){fallbackAnimate(time,moving,attack,reducedMotion,combat);return;}
    const v=visual,action=combat.action,drawing=action&&action.elapsed<action.windup;
    const name=combat.dodge>0?'jump':action?(drawing?'channel_two_handed_bow':'cast_two_handed_bow'):moving?'run':'idle';
    if(name!==v.current){for(const a of Object.values(v.actions))a.stop();v.actions[name].reset().play();v.current=name;}
    const a=v.actions[name],duration=v.clips[name].duration;
    let phase;
    if(action)phase=drawing?Math.min(.95,action.elapsed/action.windup):Math.min(.95,(action.elapsed-action.windup)/Math.max(.01,action.duration-action.windup));
    else phase=reducedMotion&&!moving?0:((time*(moving?1.35:1))%duration)/duration;
    a.time=phase*duration;v.mixer.update(0);v.model.rotation.y=0;v.model.updateWorldMatrix(true,true);
    v.presentation.worldToLocal(v.palmL.getWorldPosition(v.left));v.presentation.worldToLocal(v.palmR.getWorldPosition(v.right));
    if(action){
      v.forward.subVectors(v.left,v.right);v.forward.y=0;
      if(v.forward.lengthSq()>.001)v.model.rotation.y=-Math.atan2(v.forward.x,v.forward.z);
      v.model.updateWorldMatrix(true,true);
      v.presentation.worldToLocal(v.palmL.getWorldPosition(v.left));v.presentation.worldToLocal(v.palmR.getWorldPosition(v.right));
    }
    // Model bow clips have a native aiming axis. Align it with simulation +Z.
    v.forward.set(0,0,1);
    v.xAxis.crossVectors(v.up,v.forward).normalize();v.basis.makeBasis(v.xAxis,v.up,v.forward);v.bow.quaternion.setFromRotationMatrix(v.basis);
    v.bow.position.copy(v.left).addScaledVector(v.forward,-.12);
    const draw=drawing?Math.min(1,action.elapsed/action.windup):0;
    v.lineGeo.attributes.position.setXYZ(1,0,0,-draw*.28);v.lineGeo.attributes.position.needsUpdate=true;
    v.arrow.visible=Boolean(drawing);v.arrow.position.z=.3-draw*.28;v.echo.visible=Boolean(combat.evolved);
    v.presentation.worldToLocal(v.torso.getWorldPosition(v.chest));v.cape.position.set(v.chest.x,v.chest.y+.05,v.chest.z-.18);
    v.presentation.worldToLocal(v.head.getWorldPosition(v.headPosition));v.braid.position.copy(v.headPosition);v.braid.rotation.y=v.model.rotation.y;
    v.scarf.position.set(v.chest.x,v.chest.y+.48,v.chest.z);v.quiver.position.set(v.chest.x+.16,v.chest.y+.1,v.chest.z-.3);
    for(let i=0;i<v.vertices.count;i++){const f=(.475-v.original[i*3+1])/.95;v.vertices.setZ(i,v.original[i*3+2]+(reducedMotion?0:Math.sin(time*4+v.original[i*3]*7)*.025*f));}
    v.vertices.needsUpdate=true;
  };
}
