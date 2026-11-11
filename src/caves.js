// Third local region. Narrative milestones only; no online rewards.
export const CAVE_GATE = Object.freeze({ x: 35, z: 7 });
export const CAVE_ENTRY = Object.freeze({ x: 0, z: 12 });
export const CAVE_LENS = Object.freeze({ x: 0, z: -13 });
export const createCaves = () => ({ step: 0, wardenDefeated: false });
const near = (s, p) => Math.hypot(s.x - p.x, s.z - p.z) <= 2.2;
function reset(s) {
  s.action = null; s.projectiles = []; s.targetId = null; s.inputBuffer = 0; s.skillBuffer = 0;
  s.dodgeRemaining = 0; s.invulnerable = 0; s.returnShot = 0;
}
export function createWarden() {
  return { id: 'cave-warden', name: 'Guardiano del rintocco', area: 'caves', type: 'warden',
    x: 0, z: -8, hp: 150, maxHp: 150, boss: false, sealed: false, timer: 1.2,
    phase: 'idle', attackKind: 'nova', attackCount: 0, chargeDuration: 1.6,
    radius: 5, windup: 0, recovery: 0, recoveryDuration: 2, impactDamage: 22,
    stagger: 0, hitFlash: 0, facing: 0, aimX: 0, aimZ: -8 };
}
export function enterCaves(s) {
  if (s.status !== 'playing' || s.area !== 'plaza' || s.garden.step !== 4 || !near(s, CAVE_GATE)) return false;
  if (!s.enemies.some(e => e.type === 'warden')) {
    const e = createWarden(); if (s.caves.wardenDefeated) { e.hp = 0; e.phase = 'dead'; } s.enemies.push(e);
  }
  s.caves.step = Math.max(1, s.caves.step); s.area = 'caves'; s.region = 'Cave dei Sussurri';
  Object.assign(s, CAVE_ENTRY); reset(s); return true;
}
export function caveObjective(s) {
  if (s.status !== 'playing' || s.area !== 'caves') return null;
  return s.caves.step === 1
    ? { id: 'lens', ...CAVE_LENS, label: 'Recupera la lente', approach: 'Raggiungi il banco del cartografo' }
    : { id: 'return', ...CAVE_ENTRY, label: 'Riporta la lente a Liora', approach: 'Torna alla soglia' };
}
export function interactCaves(s, id) {
  if (id === 'enter') { if (!enterCaves(s)) return null; return { interaction: id, completed: false }; }
  if (s.status !== 'playing' || s.area !== 'caves') return null;
  if (id === 'leave' || id === 'return') {
    if (!near(s, CAVE_ENTRY)) return null;
    const completed = s.caves.step === 2;
    if (completed) s.caves.step = 3;
    s.area = 'plaza'; s.region = 'Il sentiero delle memorie'; Object.assign(s, CAVE_GATE); reset(s);
    return { interaction: 'leave', completed };
  }
  if (id !== 'lens' || s.caves.step !== 1 || !near(s, CAVE_LENS)) return null;
  s.caves.step = 2; return { interaction: id, completed: false };
}
export function cavePosition(x, z) {
  return { x: Math.max(-10, Math.min(10, x)), z: Math.max(-15, Math.min(14, z)) };
}
export function advanceWarden(s, enemy, dt, hurt, emit) {
  if (enemy.phase === 'windup') {
    enemy.windup = Math.max(0, enemy.windup - dt);
    if (!enemy.windup) {
      enemy.phase = 'recovery'; enemy.recovery = 2;
      emit('enemy-impact', { enemyId: enemy.id, kind: 'nova', x: enemy.x, z: enemy.z, radius: enemy.radius });
      if (Math.hypot(s.x - enemy.x, s.z - enemy.z) < enemy.radius) hurt(22, { kind: 'nova', name: enemy.name });
    }
  } else if (enemy.phase === 'recovery') {
    enemy.recovery = Math.max(0, enemy.recovery - dt);
    if (!enemy.recovery) { enemy.phase = 'idle'; enemy.timer = 1.2; }
  } else if (Math.hypot(s.x - enemy.x, s.z - enemy.z) <= 10) {
    enemy.timer -= dt;
    if (enemy.timer <= 0) {
      enemy.aimX = enemy.x; enemy.aimZ = enemy.z; enemy.phase = 'windup'; enemy.windup = 1.6;
      emit('enemy-windup', { enemyId: enemy.id, kind: 'nova', x: enemy.x, z: enemy.z, duration: 1.6, radius: enemy.radius });
    }
  }
}
