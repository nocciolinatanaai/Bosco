import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function piece(parent, geometry, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function block(parent, material, size, position, rotation = 0) {
  const mesh = piece(parent, new THREE.BoxGeometry(...size), material, ...position);
  mesh.rotation.y = rotation;
  return mesh;
}

export function ellipsoid(parent, material, size, position, detail = 16) {
  const mesh = piece(parent, new THREE.SphereGeometry(1, detail, Math.max(8, detail / 2)), material, ...position);
  mesh.scale.set(...size);
  return mesh;
}

export function link(parent, material, from, to, radius = .1, tip = radius, sides = 10) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const vector = b.clone().sub(a);
  const mesh = piece(parent, new THREE.CylinderGeometry(tip, radius, vector.length(), sides), material);
  mesh.position.copy(a).add(b).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vector.normalize());
  return mesh;
}

export function curve(parent, material, points, radius = .08, segments = 16) {
  return piece(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), segments, radius, 6, false), material);
}

export function random(seed = 43) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}

// Geometry is merged per material, rather than issuing one draw per stone/leaf.
// Animated characters and the transparent portal are deliberately outside this root.
export function batchArchitecture(root) {
  root.updateMatrixWorld(true);
  const groups = new Map();
  root.traverse((node) => {
    if (!node.isMesh || Array.isArray(node.material)) return;
    const geometry = node.geometry.index ? node.geometry.toNonIndexed() : node.geometry.clone();
    geometry.applyMatrix4(node.matrixWorld);
    const bucket = groups.get(node.material) || [];
    bucket.push(geometry);
    groups.set(node.material, bucket);
  });
  const result = new THREE.Group();
  for (const [material, geometries] of groups) {
    const combined = mergeGeometries(geometries, false);
    if (!combined) throw new Error('Geometrie statiche incompatibili');
    const mesh = piece(result, combined, material);
    mesh.frustumCulled = true;
    for (const geometry of geometries) geometry.dispose();
  }
  root.traverse((node) => { if (node.isMesh) node.geometry.dispose(); });
  root.clear();
  return result;
}

// ART-02: UV in metri per i blocchi (una texture si ripete ogni `unit` metri invece di
// stirarsi su ogni faccia). Ordine facce di BoxGeometry: +x, -x, +y, -y, +z, -z.
export function worldBoxUV(geometry, unit = 2) {
  const { width: w, height: h, depth: d } = geometry.parameters || {};
  if (!w) return geometry;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]], uv = geometry.attributes.uv;
  const perFace = uv.count / 6;
  for (let i = 0; i < uv.count; i++) { const [a, b] = dims[Math.floor(i / perFace)]; uv.setXY(i, uv.getX(i) * a / unit, uv.getY(i) * b / unit); }
  uv.needsUpdate = true; return geometry;
}
// Piano orizzontale con UV in coordinate del mondo (x, z) / unit: le texture del terreno
// restano continue fra pezzi diversi.
export function worldPlane(parent, material, [x0, z0, x1, z1], y = 0, unit = 3) {
  const geometry = new THREE.PlaneGeometry(x1 - x0, z1 - z0, 1, 1); geometry.rotateX(-Math.PI / 2);
  geometry.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  const pos = geometry.attributes.position, uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / unit, -pos.getZ(i) / unit);
  const mesh = piece(parent, geometry, material); mesh.castShadow = false; return mesh;
}
export function worldDisc(parent, material, cx, cz, radius, y = 0, unit = 3, segments = 64) {
  const geometry = new THREE.CircleGeometry(radius, segments); geometry.rotateX(-Math.PI / 2); geometry.translate(cx, y, cz);
  const pos = geometry.attributes.position, uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / unit, -pos.getZ(i) / unit);
  const mesh = piece(parent, geometry, material); mesh.castShadow = false; return mesh;
}
