import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('base Ranger distribuibile: skin complete, cinque motion e nessun riferimento remoto',()=>{
 const data=readFileSync(new URL('../public/models/ranger/ranger-base.glb',import.meta.url));
 assert.equal(data.readUInt32LE(0),0x46546c67);assert.equal(data.readUInt32LE(4),2);assert.equal(data.readUInt32LE(8),data.length);assert.ok(data.length<3*1024*1024);
 const json=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString());
 const meshes=json.nodes.filter(n=>n.mesh!==undefined);assert.equal(meshes.length,5);
 assert.ok(meshes.every(n=>n.skin!==undefined),'Testa, capelli e abiti devono deformarsi insieme');
 const names=json.animations.map(a=>a.name.replace('human_female_',''));
 for(const name of ['idle','run','channel_two_handed_bow','cast_two_handed_bow','jump'])assert.ok(names.includes(name));
 assert.ok(json.images.every(i=>i.bufferView!==undefined&&!i.uri));assert.ok(json.buffers.every(b=>!b.uri));
 for(const skin of json.skins)assert.ok(skin.joints.length>=40);
});
