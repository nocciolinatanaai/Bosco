import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createPoseSampler } from '../src/visuals/pose-sampler.js';

function character() {
  const root = new THREE.Object3D();
  const clip = (name, x) => new THREE.AnimationClip(name, 1, [new THREE.NumberKeyframeTrack('.position[x]', [0,1], [x,x])]);
  const sampler = createPoseSampler(new THREE.AnimationMixer(root), [clip('idle',0),clip('draw',1),clip('run',-1)], .12);
  return {root,sampler};
}

test('cambio posa conserva la posizione iniziale e raggiunge gradualmente la destinazione',()=>{
 const {root,sampler}=character();sampler.sample('idle',0,1);sampler.sample('draw',.4,2);
 assert.equal(root.position.x,0,'Nessuno scatto al cambio di azione');
 sampler.sample('draw',.5,2.06);assert.ok(Math.abs(root.position.x-.5)<.001);
 sampler.sample('draw',.6,2.12);assert.ok(Math.abs(root.position.x-1)<.001);
});

test('schivata o nuovo comando durante una transizione parte dalla posa corrente',()=>{
 const {root,sampler}=character();sampler.sample('idle',0,0);sampler.sample('draw',.2,1);sampler.sample('draw',.3,1.06);
 const interrupted=root.position.x;sampler.sample('run',.2,1.06);assert.ok(Math.abs(root.position.x-interrupted)<.001);
 sampler.sample('run',.4,1.18);assert.ok(Math.abs(root.position.x+1)<.001);
});

test('pausa e nuova spedizione non proseguono una transizione precedente',()=>{
 const {root,sampler}=character();sampler.sample('idle',0,0);sampler.sample('draw',.2,1);sampler.sample('draw',.3,1.06);
 const paused=root.position.x;for(let i=0;i<5;i++)sampler.sample('draw',.3,1.06);assert.equal(root.position.x,paused);
 sampler.sample('run',0,0);assert.equal(root.position.x,-1,'Tempo riavviato: nuova posa senza residui');
 sampler.sample('draw',.5,1,{immediate:true});assert.equal(root.position.x,1,'Movimento ridotto: niente crossfade');
});

test('prima posa e movimento ridotto restano stabili nei fotogrammi successivi',()=>{
 const {root,sampler}=character();sampler.sample('run',0,0);sampler.sample('run',.05,.05);assert.equal(root.position.x,-1);
 sampler.sample('draw',.1,.06,{immediate:true});sampler.sample('draw',.2,.07);assert.equal(root.position.x,1);
});
