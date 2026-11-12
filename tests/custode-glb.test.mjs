// ART-03 (candidato) — Custode GLB: stesse giunture del procedurale, limiti di costo, estensioni gestite da Three.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const data = readFileSync('public/art/custode-probe/custode.glb');
const json = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)).toString());

test('Custode GLB: giunture con gli stessi nomi del procedurale (stessa posa di gioco)', () => {
  const names = new Set(json.nodes.map((n) => n.name));
  for (const joint of ['guardian-torso', 'guardian-head', 'guardian-voice-seal', 'guardian-left-arm', 'guardian-right-arm',
    'guardian-left-elbow', 'guardian-right-elbow', 'guardian-left-leg', 'guardian-right-leg']) assert.ok(names.has(joint), joint);
});

test('Custode GLB: limiti di costo (≤ 400 KB, ≤ 13.000 triangoli)', () => {
  assert.ok(data.length <= 400_000, `${data.length} byte`);
  let triangles = 0;
  for (const mesh of json.meshes) for (const p of mesh.primitives) triangles += json.accessors[p.indices].count / 3;
  assert.ok(triangles <= 13_000, `${triangles} triangoli`);
});

test('Custode GLB: solo estensioni supportate dal GLTFLoader di Three.js', () => {
  const known = new Set(['KHR_mesh_quantization', 'EXT_texture_webp', 'KHR_materials_emissive_strength']);
  for (const ext of json.extensionsUsed || []) assert.ok(known.has(ext), ext);
});
