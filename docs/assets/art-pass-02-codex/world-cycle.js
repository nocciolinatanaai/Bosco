import * as THREE from 'three';
const renderer=new THREE.WebGLRenderer();renderer.setSize(2,2);
const snapshot=(world)=>({fog:world.scene.fog.color.getHexString(),density:world.scene.fog.density,lights:world.scene.children.filter(x=>x.isLight).map(x=>({type:x.type,intensity:x.intensity,color:x.color.getHexString(),position:x.position.toArray()}))});
try{
 const report={};
 for(const [name,path] of [['before','/test-results/pr5-cycle-before/src/visuals/environment.js'],['after','/src/visuals/environment.js']]){
  const {createArtWorld}=await import(path);const w=createArtWorld(renderer);const initial=snapshot(w);w.setArea('garden');const garden=snapshot(w);w.setArea('plaza');const afterGarden=snapshot(w);w.setArea('caves');const caves=snapshot(w);w.setArea('plaza');const afterCaves=snapshot(w);
  report[name]={initial,garden,afterGarden,caves,afterCaves,plazaRoundTripMatches:initial.fog===afterGarden.fog&&initial.fog===afterCaves.fog};
 }
 window.probeResult=report;
}catch(error){window.probeError=error.stack;}
