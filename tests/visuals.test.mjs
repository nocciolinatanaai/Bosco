import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { batchArchitecture, block } from '../src/visuals/geometry.js';
import { createMaterials } from '../src/visuals/materials.js';
import { createAdventurer } from '../src/visuals/actors.js';
import { CLASSES, createSession, attack, cast, dodge, tickCooldowns } from '../src/game.js';

test('batch statico conserva lo spazio delle geometrie con trasformazioni annidate', () => {
  const root = new THREE.Group(), parent = new THREE.Group();
  const material = new THREE.MeshStandardMaterial();
  parent.position.set(5, 2, -3); parent.rotation.y = Math.PI / 2; root.add(parent);
  block(parent, material, [2, 4, 6], [1, 0, 0]);
  block(root, material, [1, 1, 1], [-2, 1, 3]);
  const before = new THREE.Box3().setFromObject(root);
  const merged = batchArchitecture(root);
  const after = new THREE.Box3().setFromObject(merged);
  assert.ok(before.min.distanceTo(after.min) < .00001);
  assert.ok(before.max.distanceTo(after.max) < .00001);
  assert.equal(merged.children.length, 1, 'stesso materiale: una sola mesh statica');
  merged.children[0].geometry.dispose(); material.dispose();
});

test('riuso del personaggio fra le sei classi non mantiene equipaggiamento della classe precedente', () => {
  const m = createMaterials();
  const { root } = createAdventurer(m);
  for (const role of [...CLASSES, ...CLASSES].reverse()) {
    root.userData.setClass(role);
    assert.equal(root.getObjectByName('class-shield').visible, role.id === 'tank');
    assert.equal(root.getObjectByName('class-staff').visible, ['mage', 'healer'].includes(role.id));
    assert.equal(root.getObjectByName('class-blade').visible, !['mage', 'healer', 'ranger'].includes(role.id));
    assert.equal(root.getObjectByName('class-bow').visible, role.id === 'ranger');
    assert.equal(root.getObjectByName('class-dagger').visible, role.id === 'assassin');
    root.userData.animate(1.5, true, .7, false);
    root.userData.animate(1.6, false, 0, true);
    const session = createSession(role.id);
    for (const start of [attack, cast, dodge]) {
      session.action = null; start(session);
      for (let i = 0; i < 40; i++) {
        tickCooldowns(session, .02);
        root.userData.animate(session.time, true, 0, false, { action: session.action, dodge: session.dodgeRemaining, style: role.style });
        root.updateMatrixWorld(true);
        root.traverse((node) => assert.ok(node.matrixWorld.elements.every(Number.isFinite), `${role.id}: posa finita`));
      }
    }
    root.updateMatrixWorld(true);
    root.traverse((node) => assert.ok(node.matrixWorld.elements.every(Number.isFinite)));
  }
  root.traverse((node) => { if (node.isMesh) node.geometry.dispose(); });
});
