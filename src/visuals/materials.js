import * as THREE from 'three';
import { random } from './geometry.js';

// Original procedural surface maps, not a background image or a screenshot.
function stoneMaps() {
  const size = 128, noise = random(104), heights = new Float32Array(size * size);
  const color = new Uint8Array(size * size * 4), normal = new Uint8Array(size * size * 4);
  const roughness = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const edge = Math.min(x, y, size - x - 1, size - y - 1);
    const n = noise(), i = (y * size + x) * 4;
    heights[y * size + x] = edge < 3 ? .2 : .65 + n * .2;
    const grit = (edge < 3 ? .55 : 1) * (140 + n * 38 + Math.sin(x * .13) * 7);
    color.set([grit * .92, grit * .98, grit * 1.03, 255], i);
    const wet = 75 + n * 90;
    roughness.set([wet, wet, wet, 255], i);
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const h = (dx, dy) => heights[((y + dy + size) % size) * size + ((x + dx + size) % size)];
    const v = new THREE.Vector3((h(-1, 0) - h(1, 0)) * 1.4, (h(0, -1) - h(0, 1)) * 1.4, 1).normalize();
    normal.set([(v.x * .5 + .5) * 255, (v.y * .5 + .5) * 255, (v.z * .5 + .5) * 255, 255], (y * size + x) * 4);
  }
  const texture = (data) => {
    const map = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.magFilter = THREE.LinearFilter;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.generateMipmaps = true;
    map.needsUpdate = true;
    return map;
  };
  const map = texture(color); map.colorSpace = THREE.SRGBColorSpace;
  return { map, normalMap: texture(normal), roughnessMap: texture(roughness) };
}

export function createMaterials() {
  const surface = stoneMaps();
  const standard = (color, props = {}) => new THREE.MeshStandardMaterial({ color, roughness: .7, ...props });
  return {
    paving: standard('#65707f', { ...surface, normalScale: new THREE.Vector2(.25, .25), roughness: .65, metalness: .1 }),
    pavingDark: standard('#3d5261', { ...surface, normalScale: new THREE.Vector2(.35, .35), roughness: .45, metalness: .22 }),
    stone: standard('#66768b', { map: surface.map, normalMap: surface.normalMap, normalScale: new THREE.Vector2(.16, .16) }),
    trim: standard('#8d969e', { roughness: .65 }),
    dark: standard('#1b2934'),
    iron: standard('#42535e', { metalness: .8, roughness: .36 }),
    brass: standard('#cba96b', { metalness: .75, roughness: .3 }),
    luminous: standard('#f7d197', { emissive: '#f3a743', emissiveIntensity: 2.4, roughness: .3 }),
    violet: standard('#ad80da', { emissive: '#6b35af', emissiveIntensity: .35, roughness: .35, metalness: .2 }),
    leaf: standard('#315d55', { side: THREE.DoubleSide }),
    leafLight: standard('#63836f', { side: THREE.DoubleSide }),
    blossom: standard('#c499d6', { emissive: '#3e1b5f', emissiveIntensity: .15, side: THREE.DoubleSide }),
    wood: standard('#3e333a'),
    bone: standard('#a4a59c', { map: surface.map, normalMap: surface.normalMap, normalScale: new THREE.Vector2(.15, .15), roughness: .6, metalness: .25 }),
    skin: standard('#cda78f', { roughness: .8 }),
    hair: standard('#e8e2d7', { roughness: .62 }),
    cloth: standard('#68384d', { side: THREE.DoubleSide, roughness: .9 }),
    leather: standard('#292634', { roughness: .8 }),
    steel: standard('#b7c7d3', { metalness: .8, roughness: .26 }),
  };
}
