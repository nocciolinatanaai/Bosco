import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { createRangerActor } from '../src/visuals/ranger.js';
import { createAdventurer } from '../src/visuals/actors.js';
import { createMaterials } from '../src/visuals/materials.js';
import { CLASSES } from '../src/game.js';

test('modello Ranger originale resta nel budget di geometria e ha coordinate finite', () => {
  const { root } = createRangerActor(); let triangles = 0, meshes = 0;
  root.traverse(node => {
    if (!node.isMesh) return;
    meshes++; triangles += (node.geometry.index?.count || node.geometry.attributes.position.count) / 3;
    assert.ok(node.geometry.attributes.position.array.every(Number.isFinite));
  });
  assert.ok(triangles < 20000); assert.ok(meshes < 60);
  const bounds = new THREE.Box3().setFromObject(root);
  assert.ok(bounds.min.y > -.15 && bounds.max.y < 2.7, 'Piedi appoggiati e dimensioni coerenti');
});

test('cambio fra classi usa un solo corpo visibile e riutilizza i modelli', () => {
  const { root } = createAdventurer(createMaterials()); const nodes = []; root.traverse(n => nodes.push(n));
  for (const role of [...CLASSES, ...CLASSES].reverse()) {
    root.userData.setClass(role);
    assert.equal(root.getObjectByName('Daria-ranger-prototype').visible, role.id === 'ranger');
    assert.equal(root.getObjectByName('prototype-shared-body').visible, role.id !== 'ranger');
    assert.equal(root.children.filter(n => n.visible).length, 1);
    assert.equal(root.getObjectByName('prototype-shared-body').rotation.y, 0, 'Nessuna rotazione doppia rispetto al runtime');
  }
  const after = []; root.traverse(n => after.push(n)); assert.deepEqual(after, nodes);
});

test('corda si tende durante preparazione e torna a riposo nel rilascio', () => {
  const { root } = createRangerActor(), string = root.getObjectByName('daria-bow-string');
  const action = { elapsed: .24, windup: .28, kind: 'skill' };
  root.userData.animate(1, false, 0, false, { action });
  assert.ok(string.geometry.attributes.position.getZ(1) < -.2);
  root.userData.animate(1.3, false, 0, false, { action: { ...action, elapsed: .6 } });
  assert.equal(string.geometry.attributes.position.getZ(1), Math.fround(.02));
});

test('risonanza visibile soltanto dopo il risveglio e movimento ridotto ripristina i tessuti', () => {
  const { root } = createRangerActor(), echo = root.getObjectByName('daria-resonance-bow'), cape = root.getObjectByName('daria-cape');
  root.userData.animate(0, false, 0, true, {}); const neutral = Float32Array.from(cape.geometry.attributes.position.array);
  assert.equal(echo.visible, false);
  root.userData.animate(1, true, 0, false, { evolved: true, returnShot: 3 });
  assert.equal(echo.visible, true); assert.notDeepEqual(cape.geometry.attributes.position.array, neutral);
  root.userData.animate(9, true, 0, true, { evolved: true });
  assert.deepEqual(cape.geometry.attributes.position.array, neutral);
  root.userData.animate(9, false, 0, true, {}); assert.equal(echo.visible, false);
});

test('pose non modificano la simulazione e non allocano nuovi nodi/geometrie/materiali', () => {
  const { root } = createRangerActor(), before = [];
  root.traverse(n => before.push([n, n.geometry, n.material]));
  const combat = Object.freeze({ evolved: true, returnShot: 4, dodge: .12, action: Object.freeze({ elapsed: .2, windup: .28, kind: 'skill' }) });
  for (let i = 0; i < 80; i++) {
    root.userData.animate(i / 20, true, .4, false, combat); root.updateMatrixWorld(true);
    root.traverse(n => assert.ok(n.matrixWorld.elements.every(Number.isFinite)));
  }
  const after = []; root.traverse(n => after.push([n, n.geometry, n.material])); assert.deepEqual(after, before);
  assert.equal(combat.returnShot, 4); assert.equal(combat.action.elapsed, .2);
});


test('superficie della giacca ha facce e normali rivolte verso l’esterno', () => {
  const {root,body}=createRangerActor(),torso=root.getObjectByName('daria-torso');
  const mesh=torso.children.flatMap(n=>n.children).find(n=>n.isMesh && n.material===body);
  assert.ok(mesh); const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal;let samples=0;
  for(let i=0;i<p.count;i++) if(p.getZ(i)>.12 && Math.abs(p.getX(i))<.12){assert.ok(n.getZ(i)>.4);samples++;}
  assert.ok(samples>10);
});
