import * as THREE from 'three';
import {createPipeline} from '/src/visuals/environment.js';
import {CLASSES} from '/src/roles.js';
const before=new URLSearchParams(location.search).has('before');
const {createArtWorld}=await import(before?'/test-results/environment-before.js':'/src/visuals/environment.js');
document.querySelector('#version').textContent=before?'PRIMA · Superfici precedenti':'DOPO · Pietra, usura e umidità';
const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const world=createArtWorld(renderer);world.player.userData.setClass(CLASSES.find(r=>r.id==='ranger'));const ranger=world.player.getObjectByName('Daria-ranger-prototype');await ranger.userData.loadVisual();
world.player.position.set(0,0,5);world.player.rotation.y=Math.PI;world.player.userData.animate(4,false,0,true,{});
const boss=world.addEnemy({x:0,z:-9,type:'guardian',boss:true}).group;boss.userData.animate(4,0,false,true,{});
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,160),pipeline=createPipeline(renderer,world.scene,camera);pipeline.configure({bloom:true,pixelRatio:1});pipeline.resize(innerWidth,innerHeight);
window.surfaceFrame=(view='wide')=>{
 world.player.visible=view!=='detail';
 camera.position.fromArray(view==='detail'?[2.6,1.2,6.2]:[11,13,20]);camera.lookAt(new THREE.Vector3().fromArray(view==='detail'?[0,.05,2.8]:[0,1,-2]));
 world.animate(4,true);return {...pipeline.render()};
};window.surfaceFrame();window.surfaceReady=true;
