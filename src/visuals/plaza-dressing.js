import * as THREE from 'three';

// ENV-03 — arredo della piazza verso il concept: grappoli di cristalli viola, pozzanghere lucide,
// fiori di risonanza e lanterne lungo il sentiero. Solo geometria e materiali, nessuna luce
// aggiunta: il bagliore viene dall'emissivo e dal bloom già presente. Una draw call per tipo
// (InstancedMesh). Tutto fuori dal sentiero (|x| < 2,6) e dal cerchio dello scontro (r < 7
// attorno a 0,-9), per non disturbare la lettura dei telegraph.
const PATH_HALF = 2.6, ARENA = { x: 0, z: -9, r: 7.2 };
export const clearOfPlay = (x, z) => Math.abs(x) > PATH_HALF && Math.hypot(x - ARENA.x, z - ARENA.z) > ARENA.r;

function seeded(seed) { let s = seed >>> 0; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822519) + 0x9e3779b9 >>> 0) / 4294967296); }

function instanced(root, geometry, material, transforms, name) {
  const mesh = new THREE.InstancedMesh(geometry, material, transforms.length);
  transforms.forEach((m, i) => mesh.setMatrixAt(i, m));
  mesh.name = name; mesh.castShadow = false; mesh.receiveShadow = true; mesh.computeBoundingSphere();
  root.add(mesh); return mesh;
}
const compose = (x, y, z, rx, ry, rz, sx, sy = sx, sz = sx) => new THREE.Matrix4().compose(
  new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));

export function dressPlaza(root) {
  const rand = seeded(311), group = new THREE.Group(); group.name = 'plaza-dressing'; root.add(group);
  const stats = { crystals: 0, puddles: 0, flowers: 0, lanterns: 0 };

  // Cristalli: grappoli di prismi allungati, inclinati verso l'esterno, alla base di colonne e muri.
  const crystalGeo = new THREE.OctahedronGeometry(.5, 0); crystalGeo.scale(.32, 1.6, .32); crystalGeo.translate(0, .65, 0);
  const crystalMat = new THREE.MeshStandardMaterial({ name: 'dressing-crystal', color: '#b48cf0', emissive: '#7b3fd6', emissiveIntensity: .9, roughness: .18, metalness: 0, transparent: true, opacity: .92 });
  const crystals = [], anchors = [];
  for (const side of [-1, 1]) for (let i = 0; i < 7; i++) anchors.push([side * (12.6 + rand() * 2.4), -19 + i * 6.2 + rand() * 2]);
  for (const x of [-3.9, 3.9]) anchors.push([x, -16.4]);                 // ai piedi del portale
  for (const [ax, az] of anchors) {
    const n = 3 + Math.floor(rand() * 4), big = .8 + rand() * .9;
    for (let k = 0; k < n; k++) {
      const x = ax + (rand() - .5) * 1.1, z = az + (rand() - .5) * 1.1; if (!clearOfPlay(x, z)) continue;
      const s = big * (k === 0 ? 1 : .45 + rand() * .45);
      crystals.push(compose(x, 0, z, (rand() - .5) * .7, rand() * Math.PI, (rand() - .5) * .7, s, s * (.8 + rand() * .6), s));
    }
  }
  instanced(group, crystalGeo, crystalMat, crystals, 'dressing-crystals'); stats.crystals = crystals.length;

  // Pozzanghere: dischi irregolari quasi a specchio sopra i ciottoli (riflettono ambiente e bagliori).
  const puddleGeo = new THREE.CircleGeometry(1, 20); puddleGeo.rotateX(-Math.PI / 2);
  const pos = puddleGeo.attributes.position;
  for (let i = 1; i < pos.count; i++) { const a = Math.atan2(pos.getZ(i), pos.getX(i)), k = 1 + .16 * Math.sin(3 * a) + .08 * Math.cos(5 * a + 1); pos.setX(i, pos.getX(i) * k); pos.setZ(i, pos.getZ(i) * k); } // contorno morbido, non a stella
  const puddleMat = new THREE.MeshStandardMaterial({ name: 'dressing-puddle', color: '#1b2533', roughness: .12, metalness: 0, envMapIntensity: .55, transparent: true, opacity: .5, depthWrite: false });
  const puddles = [];
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1, x = side * (3.2 + rand() * 8), z = -14 + rand() * 40; if (!clearOfPlay(x, z)) continue;
    puddles.push(compose(x, .018, z, 0, rand() * Math.PI, 0, .7 + rand() * 1.6, 1, .5 + rand() * 1.1));
  }
  const puddleMesh = instanced(group, puddleGeo, puddleMat, puddles, 'dressing-puddles'); puddleMesh.renderOrder = 1; stats.puddles = puddles.length;

  // Fiori di risonanza: calice di petali viola su stelo sottile, a ciuffi lungo i cordoli del sentiero.
  const petal = new THREE.ConeGeometry(.09, .22, 5, 1, true); petal.translate(0, .11, 0); petal.rotateX(Math.PI);
  const flowerGeo = new THREE.BufferGeometry();
  { // stelo + calice in una sola geometria
    const stem = new THREE.CylinderGeometry(.008, .012, .34, 4); stem.translate(0, .17, 0);
    const cup = petal.clone(); cup.translate(0, .48, 0);
    const parts = [stem, cup].map((g) => g.toNonIndexed());
    const count = parts.reduce((n, g) => n + g.attributes.position.count, 0), p = new Float32Array(count * 3), nrm = new Float32Array(count * 3);
    let o = 0; for (const g of parts) { p.set(g.attributes.position.array, o * 3); nrm.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
    flowerGeo.setAttribute('position', new THREE.BufferAttribute(p, 3)); flowerGeo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  }
  const flowerMat = new THREE.MeshStandardMaterial({ name: 'dressing-flower', color: '#c79ff2', emissive: '#5a2a9a', emissiveIntensity: .3, roughness: .55, side: THREE.DoubleSide });
  const flowers = [];
  for (let i = 0; i < 34; i++) {
    const side = i % 2 ? 1 : -1, x = side * (2.75 + rand() * 1.4), z = -1 + rand() * 30;
    if (!clearOfPlay(x, z)) continue;
    for (let k = 0; k < 3; k++) flowers.push(compose(x + (rand() - .5) * .35, 0, z + (rand() - .5) * .35, (rand() - .5) * .3, rand() * 6.3, (rand() - .5) * .3, .45 + rand() * .3));
  }
  for (const side of [-1, 1]) for (let i = 0; i < 16; i++) {
    const x = side * (9.5 + rand() * 5), z = -20 + rand() * 40;
    if (clearOfPlay(x, z)) flowers.push(compose(x, 0, z, 0, rand() * 6.3, 0, .55 + rand() * .35));
  }
  instanced(group, flowerGeo, flowerMat, flowers, 'dressing-flowers'); stats.flowers = flowers.length;

  // Lanterne a palo lungo il sentiero: ferro scuro e vetro caldo (emissivo, nessuna luce reale).
  const iron = new THREE.MeshStandardMaterial({ name: 'dressing-iron', color: '#1d222b', metalness: .7, roughness: .45 });
  const glass = new THREE.MeshStandardMaterial({ name: 'dressing-lantern', color: '#ffd9a0', emissive: '#ffb45c', emissiveIntensity: 2.2, roughness: .3 });
  const pole = new THREE.CylinderGeometry(.045, .07, 2.6, 6); pole.translate(0, 1.3, 0);
  const cage = new THREE.BoxGeometry(.32, .05, .32); cage.translate(0, 2.65, 0);   // base della lanterna: il vetro resta visibile
  const cap = new THREE.ConeGeometry(.26, .22, 4); cap.rotateY(Math.PI / 4); cap.translate(0, 3.12, 0);
  const lamp = new THREE.BoxGeometry(.2, .28, .2); lamp.translate(0, 2.82, 0);
  const poles = [], lamps = [];
  for (let z = 3; z <= 27; z += 6) for (const x of [-3.15, 3.15]) { poles.push(compose(x, 0, z, 0, 0, 0, 1)); lamps.push(compose(x, 0, z, 0, 0, 0, 1)); }
  instanced(group, pole, iron, poles, 'dressing-lantern-poles').castShadow = true;
  instanced(group, cage, iron, poles, 'dressing-lantern-cages');
  instanced(group, cap, iron, poles, 'dressing-lantern-caps');
  instanced(group, lamp, glass, lamps, 'dressing-lantern-glass'); stats.lanterns = lamps.length;
  group.userData.stats = stats;
  return group;
}
