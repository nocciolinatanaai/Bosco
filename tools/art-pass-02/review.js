// ART-02 — studio a camere fisse per il confronto prima/dopo della piazza del Custode.
// Stessa geometria di gioco, stessa posa, stesso tempo shader e camera di gioco del runtime
// (fov 55, offset 8/9/13 su desktop, 1/14/20 sotto i 700 px). Non è una sessione giocata.
// ?before=1 carica i sorgenti della base estratti in /test-results/art02-before/.
import * as THREE from 'three';
import { CLASSES } from '/src/roles.js';
const params = new URLSearchParams(location.search), before = params.has('before');
const root = before ? '/test-results/art02-before/src/visuals' : '/src/visuals';
const { createArtWorld, createPipeline } = await import(`${root}/environment.js`);
const { updateTelegraph } = await import(`${root}/telegraph.js`);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('canvas'), antialias: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const world = createArtWorld(renderer);
world.player.userData.setClass(CLASSES.find((r) => r.id === 'ranger'));
const daria = world.player.getObjectByName('Daria-ranger-prototype'); if (daria?.userData.loadVisual) await daria.userData.loadVisual();
const enemy = { x: 0, z: -9, boss: true, phase: 'idle', windup: 0, chargeDuration: 1.15, recoveryDuration: 1.5, recovery: 0, attackKind: 'fracture', radius: 3.6, aimX: 0, aimZ: -9, hp: 280, sealed: false, reach: false };
const view = world.addEnemy(enemy);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 160);
const pipeline = createPipeline(renderer, world.scene, camera); pipeline.configure({ bloom: true, pixelRatio: 1 }); pipeline.resize(innerWidth, innerHeight);
world.setShadowQuality?.(true, 1024);

// Pose: gioco = inizio dello scontro dopo il risveglio; combattimento = Frattura a distanza in carica.
const POSES = {
  gioco: { player: [0, 12], enemy: [0, -9], phase: 'idle' },
  combattimento: { player: [0, 1.5], enemy: [0, -6.5], phase: 'windup' },
};
function frame(name) {
  const narrow = innerWidth < 700;
  if (name === 'materiali') {
    world.player.visible = false; view.group.visible = false; view.marker.visible = false;
    camera.position.set(-11.4, 1.7, -6.2); camera.lookAt(-15.6, .9, -10.6);
  } else {
    const pose = POSES[name];
    world.player.visible = true; view.group.visible = true;
    world.player.position.set(pose.player[0], 0, pose.player[1]); world.player.rotation.y = Math.PI;
    world.player.userData.animate(4, false, 0, true, {});
    Object.assign(enemy, { x: pose.enemy[0], z: pose.enemy[1], phase: pose.phase, windup: pose.phase === 'windup' ? .6 : 0,
      aimX: pose.player[0], aimZ: pose.player[1], reach: pose.phase === 'windup' });
    view.group.position.set(enemy.x, 0, enemy.z); view.group.rotation.y = Math.atan2(pose.player[0] - enemy.x, pose.player[1] - enemy.z);
    view.group.userData.animate(4, enemy.windup, false, true, enemy);
    updateTelegraph(view.marker, enemy);
    const focus = new THREE.Vector3(pose.player[0], 1, pose.player[1] - (narrow ? 2 : 3));
    camera.position.copy(focus).add(new THREE.Vector3(narrow ? 1 : 8, narrow ? 14 : 9, narrow ? 20 : 13)); camera.lookAt(focus);
  }
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  world.animate(4, true);
  const stats = pipeline.render();
  // Conteggi della scena (indipendenti dal fotogramma): materiali e texture distinti, memoria texture stimata.
  const materials = new Set(), textures = new Map();
  world.scene.traverse((o) => { if (!o.isMesh && !o.isPoints) return; for (const mat of [].concat(o.material)) { materials.add(mat);
    for (const key of ['map', 'normalMap', 'roughnessMap', 'aoMap', 'metalnessMap', 'emissiveMap']) { const t = mat[key]; if (t && !textures.has(t.uuid)) textures.set(t.uuid, t); } } });
  let textureBytes = 0;
  for (const t of textures.values()) { const img = t.image || {}; const w = img.width || 0, h = img.height || 0; textureBytes += w * h * 4 * (t.generateMipmaps === false ? 1 : 4 / 3); }
  return { ...stats, materials: materials.size, sceneTextures: textures.size, textureMemoryMiB: Number((textureBytes / 1048576).toFixed(2)) };
}
window.artFrame = frame; frame('gioco'); window.artReady = true;
