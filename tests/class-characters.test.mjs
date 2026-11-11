import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CHARACTER_ROLES, characterPose } from '../src/visuals/class-characters.js';
const provenance=JSON.parse(readFileSync(new URL('../public/models/characters/SOURCE.json',import.meta.url)));
for(const role of CHARACTER_ROLES)test(`${role}: GLB completo, scheletro, sei clip e risorse incorporate`,()=>{
  const data=readFileSync(new URL(`../public/models/characters/${role}.glb`,import.meta.url));
  assert.equal(data.readUInt32LE(0),0x46546c67);assert.equal(data.readUInt32LE(8),data.length);
  assert.equal(createHash('sha256').update(data).digest('hex'),provenance.characters[role].sha256);
  const json=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString());
  for(const name of ['idle','run','prepare','attack','special','dodge'])assert.ok(json.animations.some(a=>a.name===name));
  assert.ok(json.nodes.filter(n=>n.mesh!==undefined).every(n=>n.skin!==undefined));
  assert.ok(json.skins.every(s=>s.joints.length>=40));
  assert.ok(json.buffers.every(b=>!b.uri));assert.ok(json.images.every(i=>i.bufferView!==undefined&&!i.uri));
});
test('pose classi segue carica/colpo, pausa e tempo simulato senza modificare azioni',()=>{
  const clips=Object.fromEntries(['idle','run','prepare','attack','special','dodge'].map(n=>[n,{duration:1}]));
  const combat=Object.freeze({action:Object.freeze({elapsed:.2,windup:.3,duration:.7,kind:'skill'})});
  assert.equal(characterPose(clips,1,false,false,combat).name,'prepare');
  assert.deepEqual(characterPose(clips,1,false,false,combat),characterPose(clips,1,false,false,combat));
  assert.equal(characterPose(clips,1,false,false,{action:{...combat.action,elapsed:.4}}).name,'special');
  assert.equal(characterPose(clips,1,false,false,{dodge:.12}).name,'dodge');
  assert.equal(characterPose(clips,9,false,true,{}).phase,0);
});
