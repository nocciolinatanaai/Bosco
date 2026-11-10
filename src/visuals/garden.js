import * as THREE from 'three';
import { GARDEN_COMPASS, GARDEN_COVER, GARDEN_ENTRY } from '../garden.js';
import { block, curve, piece, random, batchArchitecture } from './geometry.js';

export function createGardenWorld(scene, m) {
  const root = new THREE.Group(); root.name = 'Giardino-dei-nomi'; scene.add(root);
  const source = new THREE.Group(), rand = random(812);
  block(source, m.dark, [29, .5, 31], [0, -.35, 0]);
  for (let x = -11; x <= 11; x += 2) for (let z = -11; z <= 13; z += 2) {
    block(source, Math.abs(x) < 3 || Math.abs(x) > 7 ? m.paving : m.pavingDark, [1.91, .12, 1.91], [x, -.04 + rand() * .025, z]);
  }
  for (const cover of GARDEN_COVER) {
    piece(source, new THREE.CylinderGeometry(cover.radius, cover.radius, 4.4, 12), m.stone, cover.x, 2.2, cover.z);
    for (const y of [.2, 4.2]) piece(source, new THREE.CylinderGeometry(1.4, 1.4, .25, 12), m.trim, cover.x, y, cover.z);
    curve(source, m.wood, [[cover.x, .1, cover.z + 1.25], [cover.x + .6, 1.7, cover.z + 1.15], [cover.x - .4, 3.8, cover.z + 1.2]], .07);
  }
  for (const side of [-1, 1]) {
    for (let z = -12; z <= 12; z += 4) {
      const x = side * 13;
      piece(source, new THREE.CylinderGeometry(.28, .6, 6 + rand() * 3, 7), m.wood, x, 3, z);
      for (let n = 0; n < 5; n++) {
        const leaf = piece(source, new THREE.IcosahedronGeometry(1, 1), n % 2 ? m.leaf : m.leafLight, x + (rand() - .5) * 3, 4 + rand() * 3, z + (rand() - .5) * 3);
        leaf.scale.set(1.9, .7, 1.3);
      }
      for (let n = 0; n < 5; n++) {
        const crystal = piece(source, new THREE.ConeGeometry(.13, .65, 5), m.violet, side * (10.8 + rand()), .3, z + rand());
        crystal.rotation.z = (rand() - .5) * .5;
      }
    }
  }
  block(source, m.stone, [28, 3.5, 1], [0, 1.5, -14]);
  for (let x = -12; x <= 12; x += 4) block(source, m.trim, [1, 5, 1.3], [x, 2.2, -14]);
  for (const x of [-2, 2]) {
    block(source, m.stone, [.7, 5, .7], [x, 2.5, 12]);
    block(source, m.brass, [.8, .16, .8], [x, 4.8, 12]);
  }
  const arch = piece(source, new THREE.TorusGeometry(2, .3, 8, 32, Math.PI), m.trim, 0, 5, 12);
  arch.rotation.z = 0;
  piece(source, new THREE.CylinderGeometry(.8, 1, 1.2, 8), m.stone, GARDEN_COMPASS.x, .6, GARDEN_COMPASS.z);
  piece(source, new THREE.CylinderGeometry(1.05, 1.05, .16, 12), m.brass, 0, 1.25, -10);
  root.add(batchArchitecture(source));
  const compass = new THREE.Group(); compass.position.set(0, 1.8, -10); root.add(compass);
  const dial = piece(compass, new THREE.TorusGeometry(.4, .045, 6, 32), m.brass); dial.rotation.x = -Math.PI / 2;
  const needle = piece(compass, new THREE.OctahedronGeometry(.25), m.luminous); needle.scale.set(.35, .2, 1.6);
  const signal = piece(root, new THREE.TorusGeometry(1, .055, 6, 48), m.luminous, GARDEN_ENTRY.x, .16, GARDEN_ENTRY.z); signal.rotation.x = -Math.PI / 2;
  const route = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, .12, -10), new THREE.Vector3(0, .12, 11)]), new THREE.LineBasicMaterial({ color: '#e5d7a1', transparent: true, opacity: .8 })); root.add(route);
  return {
    root,
    update(state, reducedMotion) {
      compass.visible = state.garden.step < 2;
      compass.rotation.y = reducedMotion ? 0 : state.time * .45;
      route.visible = state.garden.step >= 3;
      signal.visible = state.garden.step >= 2;
      signal.scale.setScalar(state.garden.step >= 3 ? 1.3 : 1);
    },
  };
}

export function createGardenSentry(m) {
  const root = new THREE.Group(); root.name = 'Cartiglio-sentry';
  const body = new THREE.Group(); root.add(body);
  const core = piece(body, new THREE.OctahedronGeometry(.65), m.stone, 0, 1.8, 0); core.scale.y = 1.4;
  const eye = piece(body, new THREE.OctahedronGeometry(.22), m.luminous, 0, 1.8, .5);
  const ring = piece(body, new THREE.TorusGeometry(1, .06, 6, 32), m.brass, 0, 1.8, 0); ring.rotation.x = Math.PI / 3;
  for (const x of [-.8, .8]) block(body, m.stone, [.35, .7, .5], [x, 1.5, 0], x * .3);
  root.userData.animate = (time, windup, moving, reducedMotion) => {
    body.position.y = reducedMotion ? 0 : Math.sin(time * 2) * .1;
    ring.rotation.z = reducedMotion ? 0 : time * .4;
    eye.scale.setScalar(windup > 0 ? 1.4 : 1);
  };
  return root;
}
