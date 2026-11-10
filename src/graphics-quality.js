export const GRAPHICS_MODES = Object.freeze({
  light: Object.freeze({ name: 'Leggera', pixelRatioCap: 1, shadows: false, shadowSize: 512, bloom: false, description: 'Meno effetti, ombre disattivate. I segnali del combattimento restano visibili.' }),
  balanced: Object.freeze({ name: 'Bilanciata', pixelRatioCap: 1.35, shadows: true, shadowSize: 1024, bloom: true, description: 'Equilibrio fra risoluzione, ombre e alone luminoso.' }),
  high: Object.freeze({ name: 'Alta', pixelRatioCap: 1.75, shadows: true, shadowSize: 2048, bloom: true, description: 'Ombre più definite e risoluzione maggiore sugli schermi compatibili; carico più alto.' }),
});
export function qualitySettings(id, deviceRatio = 1) {
  id = Object.hasOwn(GRAPHICS_MODES, id) ? id : 'balanced';
  const mode = GRAPHICS_MODES[id], ratio = Number.isFinite(deviceRatio) && deviceRatio > 0 ? deviceRatio : 1;
  return { id, ...mode, pixelRatio: Math.min(ratio, mode.pixelRatioCap) };
}
