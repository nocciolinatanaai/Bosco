import * as THREE from 'three';
import { createStoneSurface } from './stone-surface.js';

export function createMaterials() {
  const surface = createStoneSurface(512,{tiles:2}), masonry = createStoneSurface(128,{paving:false});
  const standard = (color, props = {}) => new THREE.MeshStandardMaterial({ color, roughness: .7, ...props });
  return {
    paving: standard('#8c98a3', { ...surface, normalScale: new THREE.Vector2(.65, .65), roughness: 1, metalness: 0 }),
    pavingDark: standard('#647887', { ...surface, normalScale: new THREE.Vector2(.65, .65), roughness: .85, metalness: 0 }),
    stone: standard('#66768b', { ...masonry, roughness: 1, normalScale: new THREE.Vector2(.3, .3) }),
    trim: standard('#8d969e', { ...masonry, roughness: .95, normalScale: new THREE.Vector2(.18, .18) }),
    dark: standard('#1b2934'),
    iron: standard('#42535e', { metalness: .8, roughness: .36 }),
    brass: standard('#cba96b', { metalness: .75, roughness: .3 }),
    luminous: standard('#f7d197', { emissive: '#f3a743', emissiveIntensity: 2.4, roughness: .3 }),
    violet: standard('#ad80da', { emissive: '#6b35af', emissiveIntensity: .35, roughness: .35, metalness: .2 }),
    leaf: standard('#315d55', { side: THREE.DoubleSide }),
    leafLight: standard('#63836f', { side: THREE.DoubleSide }),
    blossom: standard('#c499d6', { emissive: '#3e1b5f', emissiveIntensity: .15, side: THREE.DoubleSide }),
    wood: standard('#3e333a'),
    bone: standard('#a4a59c', { ...masonry, normalScale: new THREE.Vector2(.2, .2), roughness: .9, metalness: 0 }),
    skin: standard('#cda78f', { roughness: .8 }),
    hair: standard('#e8e2d7', { roughness: .62 }),
    cloth: standard('#68384d', { side: THREE.DoubleSide, roughness: .9 }),
    leather: standard('#292634', { roughness: .8 }),
    steel: standard('#b7c7d3', { metalness: .8, roughness: .26 }),
  };
}
