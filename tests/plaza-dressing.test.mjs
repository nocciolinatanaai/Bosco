// ENV-03 — l'arredo resta fuori dal sentiero e dal cerchio dello scontro, una draw call per tipo.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { dressPlaza, clearOfPlay } from '../src/visuals/plaza-dressing.js';

test('ENV-03: nessun elemento d’arredo sul sentiero o nel cerchio dello scontro', () => {
  const root = new THREE.Group(), group = dressPlaza(root), m = new THREE.Matrix4(), p = new THREE.Vector3();
  let count = 0;
  group.traverse((o) => { if (!o.isInstancedMesh || o.name.startsWith('dressing-lantern')) return;
    for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); p.setFromMatrixPosition(m); assert.ok(clearOfPlay(p.x, p.z), `${o.name} @ ${p.x.toFixed(2)},${p.z.toFixed(2)}`); count++; } });
  assert.ok(count > 50);
});

test('ENV-03: lanterne ai lati del sentiero, fuori dal cerchio; poche draw call', () => {
  const group = dressPlaza(new THREE.Group()), meshes = []; group.traverse((o) => o.isInstancedMesh && meshes.push(o));
  assert.ok(meshes.length <= 8, `${meshes.length} mesh`);
  const glass = meshes.find((o) => o.name === 'dressing-lantern-glass'), m = new THREE.Matrix4(), p = new THREE.Vector3();
  for (let i = 0; i < glass.count; i++) { glass.getMatrixAt(i, m); p.setFromMatrixPosition(m); assert.ok(Math.abs(p.x) > 2.6 && Math.hypot(p.x, p.z + 9) > 7.2); }
});
