import * as THREE from 'three';

// ART-02 — materiali PBR della piazza da texture CC0 locali (public/art/environment-pass02,
// vedi manifest.json). Solo architettura e terreno della piazza: personaggi e Custode usano
// ancora createMaterials(). Colore in sRGB; normale e ARM come dati lineari.
// In Node (test) non c'è un caricatore di immagini: i materiali restano a tinta unita.
const BASE = (import.meta.env?.BASE_URL || '/') + 'art/environment-pass02/';
const loader = typeof document !== 'undefined' ? new THREE.TextureLoader() : null;
const cache = new Map(), pending = [];
// Promessa risolta quando le texture richieste finora sono caricate (studio e catture).
export const plazaSurfacesReady = () => Promise.all(pending);
function texture(file, color) {
  if (!loader) return null;
  if (!cache.has(file)) {
    let done; pending.push(new Promise((resolve) => { done = resolve; }));
    const t = loader.load(BASE + file, done, undefined, done);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
    t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    cache.set(file, t);
  }
  return cache.get(file);
}
function surface(id, tint, { normal = 1, roughness = 1, ao = 1 } = {}) {
  const arm = texture(`${id}_arm.jpg`, false);
  return new THREE.MeshStandardMaterial({
    name: `plaza-${id}`, color: tint, map: texture(`${id}_color.jpg`, true),
    normalMap: texture(`${id}_normal.jpg`, false), normalScale: new THREE.Vector2(normal, normal),
    roughnessMap: arm, roughness, aoMap: arm, aoMapIntensity: ao, metalness: 0,
  });
}
// Tinte: spostano la pietra fotografata verso la palette blu/oro della piazza senza
// cancellarne il dettaglio (moltiplicano il colore della texture).
export function createPlazaSurfaces() {
  return {
    cobble: surface('cobble', '#ffffff', { normal: 1.1 }),
    flagstone: surface('flagstone', '#a9a69d', { normal: .9 }), // più scuro: i cerchi di pericolo devono staccare anche in scala di grigi
    ashlar: surface('ashlar', '#aeb8c4', { normal: 1 }),
    ashlarTrim: surface('ashlar', '#d3d6d4', { normal: .8 }),
    slate: surface('slate', '#7f8b99', { normal: .55 }),
    slateDark: surface('slate', '#2f3b4b', { normal: .7 }),
  };
}
