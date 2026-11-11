import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Standalone image maps, standard glTF UVs; caller owns resource disposal.
export async function importCharacter(config) {
  if (!config?.modelUrl || !Array.isArray(config.materials) || !config.materials.length) {
    throw new Error('modelUrl and a nonempty materials array are required');
  }
  const names = config.materials.map(slot => slot.sourceMaterial);
  if (names.some(name => typeof name !== 'string' || !name) || new Set(names).size !== names.length) {
    throw new Error('Each material must have a unique sourceMaterial name');
  }
  const gltf = await new GLTFLoader().loadAsync(config.modelUrl);
  const available = new Set();
  gltf.scene.traverse(node => {
    if (node.isMesh) for (const material of [].concat(node.material)) available.add(material.name);
  });
  for (const name of names) {
    if (!available.has(name)) throw new Error(`Missing model material slot: ${name}`);
  }
  const loader = new THREE.TextureLoader();
  const textures = new Set();
  const materials = new Map();
  const warnings = [];
  const load = async (url, color = false) => {
    if (!url) return null;
    const texture = await loader.loadAsync(url);
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.flipY = false;
    textures.add(texture);
    return texture;
  };
  const jobs = await Promise.allSettled(config.materials.map(async slot => {
    if (slot.normalConvention && !['opengl', 'directx'].includes(slot.normalConvention)) {
      throw new Error(`Unsupported normal convention for ${slot.sourceMaterial}`);
    }
    const maps = await Promise.allSettled([
      load(slot.albedo, true), load(slot.normal), load(slot.roughness), load(slot.subsurface),
    ]);
    const failure = maps.find(result => result.status === 'rejected');
    if (failure) throw failure.reason;
    const [map, normalMap, roughnessMap, subsurface] = maps.map(result => result.value);
    const material = new THREE.MeshPhysicalMaterial({
      name: slot.sourceMaterial,
      map, normalMap, roughnessMap,
      roughness: slot.roughnessFactor ?? 1,
      metalness: slot.metalness ?? 0,
      normalScale: new THREE.Vector2(1, slot.normalConvention === 'directx' ? -1 : 1),
    });
    if (subsurface) {
      material.userData.subsurfaceMap = subsurface;
      material.userData.subsurfaceStatus = 'metadata-only: opaque PBR fallback';
      warnings.push(`${slot.sourceMaterial}: subsurface map retained; skin scattering is not implemented.`);
    }
    materials.set(slot.sourceMaterial, material);
  }));
  const dispose = () => {
    for (const material of materials.values()) material.dispose();
    for (const texture of textures) texture.dispose();
  };
  const failure = jobs.find(result => result.status === 'rejected');
  if (failure) { dispose(); throw failure.reason; }
  gltf.scene.traverse(node => {
    if (!node.isMesh) return;
    const replace = original => materials.get(original.name) ?? original;
    node.material = Array.isArray(node.material) ? node.material.map(replace) : replace(node.material);
  });
  // dispose() releases only the new resources; glTF source resources remain caller-owned.
  return { gltf, warnings, materials, dispose };
}
