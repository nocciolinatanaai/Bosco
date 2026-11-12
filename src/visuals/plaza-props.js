import * as THREE from 'three';

// ART-02 — vegetazione CC0 (Poly Haven fern_02, vedi manifest) istanziata: una draw call per
// sottomesh qualunque sia il numero di felci. Caricamento asincrono: la piazza è giocabile
// subito, le felci compaiono appena pronte. In Node (test) non si carica nulla.
const BASE = (import.meta.env?.BASE_URL || '/') + 'art/environment-pass02/';
let pending = Promise.resolve();
export const plazaPropsReady = () => pending;

export function addFerns(root, placements) {
  if (typeof document === 'undefined' || !placements.length) return;
  pending = import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }) => new GLTFLoader().loadAsync(BASE + 'fern.gltf')).then((gltf) => {
    const group = new THREE.Group(); group.name = 'plaza-ferns';
    const matrix = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    gltf.scene.updateMatrixWorld(true);
    // Il file contiene quattro varianti di felce disposte a griglia: ogni posizione ne usa una
    // sola, a rotazione, centrata nell'origine (si scarta lo spostamento della griglia).
    const variants = []; gltf.scene.traverse((node) => { if (node.isMesh) variants.push(node); });
    variants.forEach((node, v) => {
      const mine = placements.filter((_, i) => i % variants.length === v); if (!mine.length) return;
      const local = node.matrixWorld.clone().setPosition(0, 0, 0);
      const material = node.material; material.side = THREE.DoubleSide; material.color.set('#9fb3a4'); // verde spento verso la palette blu
      const mesh = new THREE.InstancedMesh(node.geometry, material, mine.length);
      mine.forEach(([x, z, scale, angle], i) => {
        q.setFromAxisAngle(up, angle);
        matrix.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(scale, scale, scale)).multiply(local);
        mesh.setMatrixAt(i, matrix);
      });
      mesh.castShadow = true; mesh.receiveShadow = true; mesh.computeBoundingSphere(); mesh.name = `plaza-fern-${v}`;
      group.add(mesh);
    });
    root.add(group);
  }).catch(() => { /* senza felci la piazza resta completa: nessun errore per il giocatore */ });
}
