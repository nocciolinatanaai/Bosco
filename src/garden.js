// Region and quest rules. No rendering, storage, accounts or remote rewards.
export const GARDEN_ENTRY = Object.freeze({ x: 0, z: 11 });
export const GARDEN_COMPASS = Object.freeze({ x: 0, z: -10 });
export const GARDEN_COVER = Object.freeze([-4, 4].flatMap(x => [-4, 2].map(z => Object.freeze({ x, z, radius: 1.25 }))));
export const createGarden = () => ({ step: 0, sentryDefeated: false });
export const inArea = (state, enemy) => (state.area || 'plaza') === (enemy.area || 'plaza');
const near = (s, p) => Math.hypot(s.x - p.x, s.z - p.z) <= 2.2;

export function createSentry() {
  return { id: 'garden-sentry', name: 'Sentinella Cartiglio', area: 'garden', type: 'sentry',
    x: -6, z: -6, hp: 110, maxHp: 110, boss: false, sealed: false, timer: 2,
    phase: 'idle', attackKind: 'beam', chargeDuration: 1.4, windup: 0, recovery: 0,
    stagger: 0, hitFlash: 0, facing: 0, radius: .8, beamWidth: 1.6,
    beamDX: 0, beamDZ: 1, beamLength: 22, aimX: -6, aimZ: 16, patrol: 1 };
}
function travelReset(s) {
  s.action = null; s.projectiles = []; s.targetId = null; s.inputBuffer = 0; s.skillBuffer = 0;
  s.dodgeRemaining = 0; s.invulnerable = 0; s.returnShot = 0;
}
export function enterGarden(s) {
  if (s.status !== 'playing' || s.area !== 'plaza' || !s.evolved || !s.cleared || !s.trail.complete || !near(s, { x: 38.5, z: 7 })) return false;
  if (!s.enemies.some(e => e.type === 'sentry')) {
    const enemy = createSentry(); if (s.garden.sentryDefeated) { enemy.hp = 0; enemy.phase = 'dead'; }
    s.enemies.push(enemy);
  }
  s.garden.step = Math.max(1, s.garden.step); s.area = 'garden';
  Object.assign(s, GARDEN_ENTRY); s.region = 'Giardino dei nomi'; travelReset(s); return true;
}
export function leaveGarden(s) {
  if (s.status !== 'playing' || s.area !== 'garden' || !near(s, GARDEN_ENTRY)) return false;
  if (s.garden.step === 3) s.garden.step = 4;
  s.area = 'plaza'; s.x = 38.5; s.z = 7; s.region = 'Il sentiero delle memorie'; travelReset(s); return true;
}
export function gardenObjective(s) {
  if (s.status !== 'playing') return null;
  if (s.area !== 'garden') return s.area !== 'plaza' ? null : s.cleared && s.evolved && s.trail.complete ? { id: 'enter', x: 38.5, z: 7, label: 'Entra nel giardino', approach: 'Raggiungi il passaggio' } : null;
  if (s.garden.step === 1) return { id: 'compass', ...GARDEN_COMPASS, label: 'Recupera la bussola', approach: 'Raggiungi la bussola' };
  if (s.garden.step === 2) return { id: 'signal', ...GARDEN_ENTRY, label: 'Accendi il segnale', approach: 'Riporta la bussola alla soglia' };
  return { id: 'leave', ...GARDEN_ENTRY, label: 'Torna al sentiero', approach: 'Raggiungi la soglia' };
}
export function interactGarden(s, id) {
  const before = s.garden.step;
  if (id === 'leave') { if (!leaveGarden(s)) return null; }
  else {
    const objective = gardenObjective(s);
    if (!objective || id !== objective.id || !near(s, objective)) return null;
    if (id === 'enter') { if (!enterGarden(s)) return null; }
    else if (id === 'compass' && s.garden.step === 1) s.garden.step = 2;
    else if (id === 'signal' && s.garden.step === 2) s.garden.step = 3;
    else return null;
  }
  return { step: s.garden.step, interaction: id, completed: before !== 4 && s.garden.step === 4 };
}
export function gardenPosition(x, z) {
  x = Math.max(-12, Math.min(12, x)); z = Math.max(-12, Math.min(13, z));
  for (const cover of GARDEN_COVER) {
    const dx = x - cover.x, dz = z - cover.z, distance = Math.hypot(dx, dz), radius = cover.radius + .35;
    if (distance < radius) { x = cover.x + (distance ? dx / distance : 1) * radius; z = cover.z + (distance ? dz / distance : 0) * radius; }
  }
  return { x, z };
}
export function blockedByGardenCover(from, to) {
  const dx = to.x - from.x, dz = to.z - from.z, squared = dx * dx + dz * dz;
  if (!squared) return false;
  return GARDEN_COVER.some(cover => {
    const t = Math.max(0, Math.min(1, ((cover.x - from.x) * dx + (cover.z - from.z) * dz) / squared));
    return (from.x + t * dx - cover.x) ** 2 + (from.z + t * dz - cover.z) ** 2 <= cover.radius ** 2;
  });
}
export function prepareBeam(enemy, player) {
  const distance = Math.hypot(player.x - enemy.x, player.z - enemy.z);
  enemy.beamDX = distance ? (player.x - enemy.x) / distance : 0;
  enemy.beamDZ = distance ? (player.z - enemy.z) / distance : 1;
  let length = 22;
  for (const cover of GARDEN_COVER) {
    const dx = cover.x - enemy.x, dz = cover.z - enemy.z;
    const along = dx * enemy.beamDX + dz * enemy.beamDZ;
    const acrossSquared = dx * dx + dz * dz - along * along;
    if (acrossSquared <= cover.radius ** 2) {
      const entry = along - Math.sqrt(Math.max(0, cover.radius ** 2 - acrossSquared));
      if (entry >= 0) length = Math.min(length, entry);
    }
  }
  enemy.beamLength = length;
  enemy.aimX = enemy.x + enemy.beamDX * length; enemy.aimZ = enemy.z + enemy.beamDZ * length;
  enemy.windup = enemy.chargeDuration; enemy.phase = 'windup';
  enemy.facing = Math.atan2(enemy.beamDX, enemy.beamDZ);
}
export function beamHits(enemy, player) {
  const dx = player.x - enemy.x, dz = player.z - enemy.z;
  const along = dx * enemy.beamDX + dz * enemy.beamDZ;
  const across = Math.abs(dx * enemy.beamDZ - dz * enemy.beamDX);
  return along >= 0 && along <= enemy.beamLength && across <= enemy.beamWidth / 2;
}
export function advanceSentry(s, enemy, dt, hurt, emit) {
  if (enemy.phase === 'windup') {
    enemy.windup = Math.max(0, enemy.windup - dt);
    if (enemy.windup === 0) {
      enemy.phase = 'recovery'; enemy.recovery = 1.6;
      emit('enemy-impact', { enemyId: enemy.id, kind: 'beam', x: enemy.x, z: enemy.z,
        dx: enemy.beamDX, dz: enemy.beamDZ, length: enemy.beamLength, width: enemy.beamWidth });
      if (beamHits(enemy, s)) hurt(20, { kind: 'beam', name: enemy.name });
    }
    return;
  }
  if (enemy.phase === 'recovery') {
    enemy.recovery = Math.max(0, enemy.recovery - dt);
    if (!enemy.recovery) { enemy.phase = 'idle'; enemy.timer = 1.4; enemy.patrol *= -1; }
    return;
  }
  const distance = Math.hypot(s.x - enemy.x, s.z - enemy.z);
  enemy.x = Math.max(-6, Math.min(6, enemy.x + enemy.patrol * 1.6 * dt));
  enemy.facing = enemy.patrol * Math.PI / 2;
  if (distance > 14) return;
  enemy.timer -= dt;
  if (enemy.timer <= 0) {
    prepareBeam(enemy, s);
    emit('enemy-windup', { enemyId: enemy.id, boss: false, kind: 'beam', duration: enemy.chargeDuration });
  }
}
