import * as THREE from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { createPoseSampler } from './pose-sampler.js';

export const CHARACTER_ROLES = ['tank', 'fighter', 'assassin', 'mage', 'healer'];
const sources = new Map();
function source(role) {
  if (!sources.has(role)) {
    sources.set(role, import('three/addons/loaders/GLTFLoader.js')
      .then(({ GLTFLoader }) => new GLTFLoader().loadAsync(`${import.meta.env?.BASE_URL || '/'}models/characters/${role}${role === 'fighter' && typeof location !== 'undefined' && new URLSearchParams(location.search).has('hero') ? '-probe' : ''}.glb`))
      .catch(error => { sources.delete(role); throw error; }));
  }
  return sources.get(role);
}

// Only presentation: poses use game time, never assign damage or move the actor.
export function characterPose(clips, time, moving, reducedMotion, combat = {}) {
  const action = combat.action;
  const preparing = action && action.elapsed < action.windup;
  const name = combat.dodge > 0 ? 'dodge' : action ? preparing ? 'prepare' : action.kind === 'skill' ? 'special' : 'attack' : moving ? 'run' : 'idle';
  let phase;
  if (combat.dodge > 0) phase = 1 - combat.dodge / .24;
  else if (action) phase = preparing ? action.elapsed / Math.max(.01, action.windup) : (action.elapsed - action.windup) / Math.max(.01, action.duration - action.windup);
  else phase = reducedMotion && !moving ? 0 : (time * (moving ? 1.35 : 1) % clips[name].duration) / clips[name].duration;
  return { name, phase: THREE.MathUtils.clamp(phase, 0, .999) };
}

function equipment(model, role) {
  const steel = new THREE.MeshStandardMaterial({ color: '#90989c', metalness: .8, roughness: .42 });
  const brass = new THREE.MeshStandardMaterial({ color: '#a38a54', metalness: .7, roughness: .5 });
  const dark = new THREE.MeshStandardMaterial({ color: '#342a24', roughness: .8 });
  const makeBlade = (bone, length) => {
    const group = new THREE.Group(); group.name = `${role}-held-blade`; bone.add(group);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(.075, length, .025), steel);
    blade.position.y = length / 2 + .16; group.add(blade);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(.28, .04, .07), brass);
    guard.position.y = .14; group.add(guard);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, .18, 8), dark);
    group.add(grip);
  };
  const left = model.getObjectByName('palm_L'), right = model.getObjectByName('palm_R');
  if (!left || !right) throw Error('Missing character hand bones');
  if (role === 'tank' || (role === 'fighter' && !model.getObjectByName('fighter-sword-blade'))) makeBlade(right, role === 'tank' ? .9 : 1.35);
  if (role === 'assassin') { makeBlade(left, .5); makeBlade(right, .5); }
  if (role === 'tank') {
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(.52, .44, .09, 8), brass);
    shield.name = 'tank-held-shield'; shield.rotation.x = Math.PI / 2; shield.position.set(0, .15, .12); left.add(shield);
  }
  if (role === 'mage' || role === 'healer') {
    const focus = new THREE.Mesh(new THREE.OctahedronGeometry(.13), new THREE.MeshStandardMaterial({
      color: role === 'mage' ? '#a482d2' : '#d4bd7b', emissive: role === 'mage' ? '#48206a' : '#735123', emissiveIntensity: .35,
      roughness: .4,
    }));
    focus.name = `${role}-hand-focus`; focus.position.y = .19; right.add(focus);
  }
}

export function attachClassCharacters(root) {
  const fallback = [...root.children], fallbackAnimate = root.userData.animate;
  const models = new Map(), pending = new Map();
  let selected = null;
  const show = () => {
    const ready = models.has(selected);
    for (const node of fallback) node.visible = !ready;
    for (const [role, entry] of models) entry.presentation.visible = role === selected;
    root.userData.visualStatus = ready ? 'ready' : pending.has(selected) ? 'loading' : 'fallback';
    root.userData.visualRole = selected;
  };
  root.userData.selectVisual = role => {
    selected = role;
    show();
    if (!CHARACTER_ROLES.includes(role) || typeof document === 'undefined') return Promise.resolve(false);
    if (models.has(role)) return Promise.resolve(true);
    if (pending.has(role)) return pending.get(role);
    const task = source(role).then(gltf => {
      const model = clone(gltf.scene), presentation = new THREE.Group();
      presentation.name = `${role}-skinned-presentation`; presentation.add(model);
      const bounds = new THREE.Box3().setFromObject(model), height = bounds.max.y - bounds.min.y;
      if (!Number.isFinite(height) || height <= 0) throw Error('Invalid character bounds');
      const scale = 2.2 / height; model.scale.multiplyScalar(scale); model.position.y = -bounds.min.y * scale;
      const clips = Object.fromEntries(gltf.animations.map(clip => [clip.name, clip]));
      for (const name of ['idle', 'run', 'prepare', 'attack', 'special', 'dodge']) {
        if (!clips[name]) throw Error(`Missing character clip: ${name}`);
      }
      equipment(model, role);
      model.traverse(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } });
      const mixer = new THREE.AnimationMixer(model);
      models.set(role, { presentation, model, clips, sampler: createPoseSampler(mixer, Object.values(clips)) });
      root.add(presentation); show();
      return true;
    }).catch(() => false).finally(() => { pending.delete(role); show(); });
    pending.set(role, task); show();
    return task;
  };
  root.userData.animate = (time, moving, attack, reducedMotion, combat = {}) => {
    const entry = models.get(selected);
    if (!entry) { fallbackAnimate(time, moving, attack, reducedMotion, combat); return; }
    const pose = characterPose(entry.clips, time, moving, reducedMotion, combat);
    entry.sampler.sample(pose.name, pose.phase, time, { immediate: reducedMotion });
    entry.presentation.updateMatrixWorld(true);
  };
}
