import * as THREE from 'three';
import { block, piece, batchArchitecture, random } from './geometry.js';
import { CAVE_ENTRY, CAVE_LENS } from '../caves.js';

export function createCaveWorld(scene, m) {
  const root = new THREE.Group(); root.name = 'Cave-dei-Sussurri'; scene.add(root);
  const source = new THREE.Group(), rand = random(416);
  block(source, m.dark, [25, .5, 35], [0, -.35, 0]);
  for (let x = -10; x <= 10; x += 2) for (let z = -14; z <= 14; z += 2)
    block(source, m.pavingDark, [1.94, .12, 1.94], [x, -.05, z]);
  // Open roof for the existing elevated camera; walls stay beyond playable bounds.
  for (const side of [-1, 1]) for (let z = -15; z <= 15; z += 3) {
    const rock = piece(source, new THREE.DodecahedronGeometry(1.8, 0), m.stone, side * 12, 1.4, z);
    rock.scale.set(1, 1.4 + rand(), 1.2);
    const crystal = piece(source, new THREE.ConeGeometry(.3, 2 + rand(), 5), m.violet, side * 10.8, .8, z);
    crystal.rotation.z = -side * .25;
  }
  block(source, m.stone, [25, 4, 1], [0, 1.8, -17]);
  block(source, m.wood, [3, .25, 1.3], [CAVE_LENS.x, 1, CAVE_LENS.z]);
  for (const x of [-1.2, 1.2]) block(source, m.wood, [.2, 1, 1], [x, .5, CAVE_LENS.z]);
  for (const x of [-2, 2]) block(source, m.trim, [.7, 4, .7], [x, 2, CAVE_ENTRY.z]);
  root.add(batchArchitecture(source));
  const lens = piece(root, new THREE.TorusGeometry(.42, .08, 8, 32), m.brass, 0, 1.7, CAVE_LENS.z);
  const glass = piece(lens, new THREE.OctahedronGeometry(.3), m.luminous);
  glass.scale.z = .3;
  const threshold = piece(root, new THREE.TorusGeometry(1.6, .05, 6, 40), m.luminous, 0, .12, CAVE_ENTRY.z); threshold.rotation.x = -Math.PI / 2;
  return { root, update(s, reducedMotion) {
    lens.visible = s.caves.step === 1; lens.rotation.y = reducedMotion ? 0 : s.time * .4;
    threshold.scale.setScalar(s.caves.step >= 2 ? 1.1 : 1);
  } };
}
