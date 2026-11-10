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
