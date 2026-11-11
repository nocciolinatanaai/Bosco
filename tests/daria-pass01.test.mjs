import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { RANGER_FILES } from '../src/visuals/ranger-skinned.js';

const file = new URL('../public/models/ranger/daria-pass01.glb', import.meta.url);
const provenance = JSON.parse(readFileSync(new URL('../public/models/ranger/SOURCE.json', import.meta.url)));

test('Daria pass01: asset versionato, provenienza e hash coerenti', () => {
  const data = readFileSync(file);
  assert.equal(RANGER_FILES.pass01, 'daria-pass01.glb');
  assert.equal(createHash('sha256').update(data).digest('hex'), provenance.pass01.sha256);
  assert.equal(data.length, provenance.pass01.bytes);
  assert.ok(data.length < 1.5 * 1024 * 1024, 'Peso contenuto per il primo caricamento su telefono');
});

test('Daria pass01: abiti, capelli e treccia nel GLB, tutto pesato sullo scheletro, sotto 20k triangoli', () => {
  const data = readFileSync(file);
  const json = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)).toString());
  const meshes = json.nodes.filter(n => n.mesh !== undefined);
  assert.ok(meshes.every(n => n.skin !== undefined), 'Nessun accessorio rigido fuori dallo scheletro');
  for (const name of ['Daria outfit pass01', 'Daria hair pass01', 'human_female_head_default']) assert.ok(meshes.some(n => n.name === name), name);
  let triangles = 0;
  for (const mesh of json.meshes) for (const p of mesh.primitives) triangles += json.accessors[p.indices].count / 3;
  assert.ok(triangles < 20000, `triangoli ${triangles}`);
  assert.equal(triangles, provenance.pass01.triangles);
  for (const name of ['idle', 'run', 'channel_two_handed_bow', 'cast_two_handed_bow', 'jump'])
    assert.ok(json.animations.some(a => a.name === 'human_female_' + name), name);
  assert.ok(json.images.every(i => i.bufferView !== undefined && !i.uri));
  assert.ok(json.buffers.every(b => !b.uri));
  assert.ok(json.images.some(i => i.name === 'daria_face_pass01'), 'Volto ridipinto, non la texture generica');
  assert.ok(!json.images.some(i => i.name === 'tex_human_female_head_1'), 'La texture del volto generico non viene più spedita');
  assert.ok(json.materials.some(m => m.doubleSided && /capelet/.test(m.name)), 'Mantellina visibile da entrambi i lati');
});
