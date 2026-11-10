import { CLASSES } from './roles.js';
import { createTrail, resonateTrail } from './trail.js';
import { prepareEnemyAttack } from './enemy-attacks.js';

const clamp = (n, low, high) => Math.min(high, Math.max(low, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const ranged = (s) => ['magic', 'bow', 'light'].includes(s.role.style);

function emit(s, type, payload = {}) {
  s.events.push({ id: ++s.sequence, time: s.time, type, ...payload });
  if (s.events.length > 80) s.events.shift();
}
export function drainEvents(s) { return s.events.splice(0); }

export function createSession(id) {
  const role = CLASSES.find((item) => item.id === id);
  if (!role) throw new Error('Classe sconosciuta');
  const enemy = (id, name, x, z, hp, boss, timer) => ({ id, name, x, z, hp, maxHp: hp, boss, timer,
    sealed: boss, attackCount: 0, attackKind: boss ? 'fracture' : 'strike',
    impactDamage: boss ? 26 : 12, recoveryDuration: boss ? 1.5 : 1, phase: 'idle', windup: 0, chargeDuration: boss ? 1.15 : .9, recovery: 0, stagger: 0, hitFlash: 0, facing: 0,
    aimX: x, aimZ: z, radius: boss ? 3.6 : 1.8 });
  return { role, x: 0, z: 12, hp: role.hp, maxHp: role.hp, stamina: 100, staminaDelay: 0,
    cooldown: 0, dashCooldown: 0, returnShot: 0, shield: 0, invulnerable: 0, dodgeRemaining: 0, dodgeDirection: { x: 0, z: -1 },
    facing: { x: 0, z: -1 }, action: null, combo: 0, comboReset: 0, inputBuffer: 0, skillBuffer: 0,
    evolved: false, status: 'playing', explored: false, cleared: false, region: 'Piazza del ritorno',
    lesson: { distance: 0, hit: false, dodged: false }, resonanceReady: false, lastDamage: null, trail: createTrail(),
    time: 0, sequence: 0, events: [], targetId: null, projectiles: [],
    enemies: [enemy('shade-a', 'Eco errante', -5, 2, 52, false, 1.3), enemy('shade-b', 'Eco corazzato', 6, -1, 65, false, 1.8),
      enemy('guardian', 'Il Custode Vuoto', 0, -9, 280, true, 2.2)] };
}

export function selectedEnemy(s, maxRange = Infinity) {
  const selected = s.enemies.find((e) => e.id === s.targetId && e.hp > 0 && !e.sealed && distance(e, s) <= maxRange);
  return selected || s.enemies.filter((e) => e.hp > 0 && !e.sealed && distance(e, s) <= maxRange).sort((a, b) => distance(a, s) - distance(b, s))[0] || null;
}
export function setTarget(s, id) {
  if (!s.enemies.some((e) => e.id === id && e.hp > 0 && !e.sealed)) return false;
  s.targetId = id; return true;
}

function begin(s, kind) {
  if (s.status !== 'playing' || s.dodgeRemaining > 0) return false;
  if (s.action) {
    if (kind === 'skill' && s.action.kind === 'basic' && s.cooldown <= 0) { s.skillBuffer = .6; s.inputBuffer = 0; return true; }
    if (kind === 'basic' && s.action.duration - s.action.elapsed <= .18) s.inputBuffer = .24;
    return false;
  }
  if (kind === 'skill' && s.cooldown > 0) return false;
  const range = (kind === 'basic' ? s.role.basicRange : s.role.range) * (s.evolved ? 1.2 : 1);
  const target = selectedEnemy(s, range + 1);
  if (target) {
    const d = distance(target, s);
    if (d > .001) s.facing = { x: (target.x - s.x) / d, z: (target.z - s.z) / d };
    s.targetId = target.id;
  }
  if (kind === 'skill') { s.cooldown = s.role.cooldown; s.combo = 0; }
  else s.combo = s.comboReset > 0 ? s.combo % 3 + 1 : 1;
  s.comboReset = 1.15;
  const windup = kind === 'skill' ? (s.role.id === 'mage' ? .48 : s.role.id === 'assassin' ? .16 : .28)
    : ranged(s) ? .22 : s.role.id === 'assassin' ? .10 : .14;
  s.action = { kind, style: s.role.style, combo: kind === 'basic' ? s.combo : 0, elapsed: 0, windup,
    duration: windup + (kind === 'skill' ? .42 : ranged(s) ? .32 : .26), impacted: false, phase: 'windup', range,
    facing: { ...s.facing }, targetId: target?.id || null,
    aimX: target?.x ?? s.x + s.facing.x * Math.min(range, 5), aimZ: target?.z ?? s.z + s.facing.z * Math.min(range, 5) };
  emit(s, 'action-start', { kind, style: s.role.style, combo: s.action.combo, aimX: s.action.aimX, aimZ: s.action.aimZ, windup });
  return true;
}
export const attack = (s) => begin(s, 'basic');
export const cast = (s) => begin(s, 'skill');

export function movePlayer(s, dx, dz, dt, speed = 5) {
  if (s.status !== 'playing' || !Number.isFinite(dx) || !Number.isFinite(dz) || !Number.isFinite(dt) || dt <= 0) return false;
  const length = Math.hypot(dx, dz); if (length < .001) return false;
  if (!Number.isFinite(speed) || speed <= 0) return false;
  const scale = Math.min(1, length) / length * Math.min(dt, .05) * Math.min(speed, 20);
  const beforeX = s.x, beforeZ = s.z;
  let x = clamp(s.x + dx * scale, -15, 39), z = clamp(s.z + dz * scale, -19, 18);
  if (x > 18) {
    if (beforeX <= 18 && (z < 5.2 || z > 8.8)) x = 18;
    else z = clamp(z, 5.2, 8.8);
  }
  // Columns are fixed landmarks; player movement slides around their footprint.
  for (const cx of [-16.5, 16.5]) for (const cz of [-20, -11, -2, 7, 16]) {
    const d = Math.hypot(x - cx, z - cz), radius = 1.13;
    if (d < radius) {
      const nx = d > .001 ? (x - cx) / d : -1, nz = d > .001 ? (z - cz) / d : 0;
      x = cx + nx * radius; z = cz + nz * radius;
    }
  }
  s.x = clamp(x, -15, 39); s.z = clamp(z, -19, 18);
  if (s.x > 18) {
    if (beforeX <= 18 && (s.z < 5.2 || s.z > 8.8)) s.x = 18;
    else s.z = clamp(s.z, 5.2, 8.8);
  }
  if (!s.action && s.dodgeRemaining <= 0) s.facing = { x: dx / length, z: dz / length };
  const travelled = Math.hypot(s.x - beforeX, s.z - beforeZ);
  s.lesson.distance += travelled;
  return travelled > .0001;
}

export function dodge(s, dx = s.facing.x, dz = s.facing.z) {
  if (s.status !== 'playing' || s.dashCooldown > 0 || s.stamina < 30 || !Number.isFinite(dx) || !Number.isFinite(dz)) return false;
  const length = Math.hypot(dx, dz);
  s.dodgeDirection = length > .001 ? { x: dx / length, z: dz / length } : { ...s.facing };
  s.stamina -= 30; s.staminaDelay = .75; s.dashCooldown = .65;
  s.dodgeRemaining = .24; s.invulnerable = .18; s.action = null; s.inputBuffer = 0; s.skillBuffer = 0;
  s.lesson.dodged = true;
  if (s.evolved) {
    emit(s, 'echo-burst', { x: s.x, z: s.z, radius: 3.2 });
    for (const enemy of s.enemies) if (!enemy.sealed && distance(s, enemy) <= 3.2) hit(s, enemy, 18, .35);
  }
  const trace = resonateTrail(s);
  if (trace) emit(s, 'trail-progress', trace);
  emit(s, 'dodge', { x: s.x, z: s.z, direction: { ...s.dodgeDirection } });
  return true;
}

export function hurt(s, amount, source = null) {
  if (s.status !== 'playing' || !Number.isFinite(amount) || amount <= 0) return 0;
  if (s.invulnerable > 0) {
    if (s.dodgeRemaining > 0) {
      emit(s, 'evaded');
      if (s.evolved && s.role.id === 'ranger') {
        s.returnShot = 4; emit(s, 'return-shot-ready');
      }
    }
    return 0;
  }
  const actual = Math.min(s.hp, Math.round(amount * (s.shield > 0 ? .25 : 1)));
  if (actual <= 0) return 0;
  s.hp -= actual; s.invulnerable = .28;
  s.lastDamage = Object.freeze({ amount: actual, kind: source?.kind || 'unknown', name: source?.name || 'un nemico' });
  emit(s, 'hurt', { amount: actual, guarded: s.shield > 0 });
  if (s.hp === 0) { s.status = 'defeated'; s.returnShot = 0; s.action = null; s.projectiles = []; emit(s, 'defeated'); }
  return actual;
}

function hit(s, enemy, damage, stagger = 0, critical = false) {
  if (enemy.hp <= 0 || enemy.sealed) return;
  s.lesson.hit = true;
  const amount = Math.min(enemy.hp, Math.round(damage * (s.evolved ? 1.5 : 1)));
  enemy.hp -= amount; enemy.hitFlash = .16;
  if (stagger > 0 && enemy.hp > 0) {
    enemy.stagger = Math.max(enemy.stagger, stagger * (enemy.boss ? .45 : 1));
    enemy.windup = 0; enemy.phase = 'stagger';
  }
  emit(s, 'hit', { enemyId: enemy.id, amount, x: enemy.x, z: enemy.z, critical });
  if (enemy.hp === 0) { enemy.phase = 'dead'; enemy.windup = 0; emit(s, 'enemy-defeated', { enemyId: enemy.id, x: enemy.x, z: enemy.z }); }
  if (!s.resonanceReady && !s.evolved && s.enemies.filter(e => !e.boss).every(e => e.hp <= 0)) {
    s.resonanceReady = true; emit(s, 'resonance-ready');
  }
  if (!s.cleared && s.enemies.every((e) => e.hp <= 0)) { s.cleared = true; emit(s, 'cleared'); }
}

function projectile(s, action, damage, empowered = false, echo = false) {
  const target = s.enemies.find((e) => e.id === action.targetId && e.hp > 0 && !e.sealed && distance(e, s) <= action.range);
  if (!target) { emit(s, 'miss'); return null; }
  const offset = echo ? .6 : 0;
  const item = { id: ++s.sequence, x: s.x + action.facing.z * offset, z: s.z - action.facing.x * offset, targetId: target.id, speed: empowered ? 23 : 18,
    life: 1.6, delay: echo ? .14 : 0, damage, empowered, echo, style: s.role.style };
  s.projectiles.push(item);
  emit(s, 'projectile', { projectileId: item.id, x: s.x, z: s.z });
  return item;
}

function resolve(s, action) {
  const inRange = s.enemies.filter((e) => e.hp > 0 && !e.sealed && distance(e, s) <= action.range);
  const inFront = inRange.filter((e) => {
    const d = distance(e, s);
    return d < .1 || ((e.x - s.x) * action.facing.x + (e.z - s.z) * action.facing.z) / d >= Math.cos(action.combo === 3 ? Math.PI / 2 : Math.PI * .35);
  });
  emit(s, 'strike', { kind: action.kind, style: s.role.style, combo: action.combo, range: action.range, x: s.x, z: s.z, facing: { ...action.facing } });
  if (action.kind === 'basic') {
    if (ranged(s)) { projectile(s, action, s.role.basicDamage); return; }
    const targets = action.combo === 3 && s.role.id === 'fighter' ? inFront : inFront.sort((a, b) => distance(a, s) - distance(b, s)).slice(0, 1);
    for (const enemy of targets) hit(s, enemy, s.role.basicDamage * (action.combo === 3 ? 1.65 : action.combo === 2 ? 1.15 : 1), action.combo === 3 ? .3 : 0);
    if (!targets.length) emit(s, 'miss');
    return;
  }
  if (s.role.id === 'ranger') {
    const shot = projectile(s, action, s.role.damage, true);
    if (shot && s.evolved && s.returnShot > 0) {
      s.returnShot = 0;
      projectile(s, action, s.role.damage * .65, true, true);
      emit(s, 'return-shot-fired');
    }
    return;
  }
  let targets = inFront;
  if (s.role.id === 'tank') { s.shield = 1.6; targets = inRange; emit(s, 'guard'); }
  if (s.role.id === 'healer') {
    targets = inRange; const amount = Math.min(s.maxHp - s.hp, 22); s.hp += amount;
    emit(s, 'heal', { amount });
  }
  if (s.role.id === 'mage') targets = s.enemies.filter((e) => e.hp > 0 && !e.sealed && Math.hypot(e.x - action.aimX, e.z - action.aimZ) <= 3.2);
  if (s.role.id === 'assassin') targets = inFront.sort((a, b) => distance(a, s) - distance(b, s)).slice(0, 1);
  for (const enemy of targets) {
    const critical = s.role.id === 'assassin' && enemy.phase === 'windup';
    hit(s, enemy, s.role.damage * (critical ? 1.5 : 1), s.role.id === 'tank' ? 1 : .5, critical);
  }
  if (!targets.length && !['tank', 'healer'].includes(s.role.id)) emit(s, 'miss');
  emit(s, 'skill-impact', { role: s.role.id, range: action.range, x: s.role.id === 'mage' ? action.aimX : s.x, z: s.role.id === 'mage' ? action.aimZ : s.z });
}

export function tickCooldowns(s, delta) {
  const dt = clamp(Number.isFinite(delta) ? delta : 0, 0, .05);
  if (s.status !== 'playing' || dt === 0) return 0;
  s.time += dt;
  for (const key of ['cooldown', 'dashCooldown', 'returnShot', 'shield', 'invulnerable', 'comboReset', 'inputBuffer', 'skillBuffer', 'staminaDelay']) s[key] = Math.max(0, s[key] - dt);
  if (s.staminaDelay === 0) s.stamina = Math.min(100, s.stamina + 20 * dt);
  if (s.dodgeRemaining > 0) {
    movePlayer(s, s.dodgeDirection.x, s.dodgeDirection.z, Math.min(dt, s.dodgeRemaining), 17);
    s.dodgeRemaining = Math.max(0, s.dodgeRemaining - dt);
  }
  if (s.action) {
    const action = s.action; action.elapsed += dt;
    if (!action.impacted && action.elapsed >= action.windup) { action.impacted = true; action.phase = 'recovery'; resolve(s, action); }
    if (action.elapsed >= action.duration) {
      s.action = null;
      if (s.skillBuffer > 0) { s.skillBuffer = 0; s.inputBuffer = 0; cast(s); }
      else if (s.inputBuffer > 0) { s.inputBuffer = 0; attack(s); }
    }
  }
  for (const p of s.projectiles) {
    if (p.delay > 0) { p.delay = Math.max(0, p.delay - dt); continue; }
    p.life -= dt;
    const target = s.enemies.find((e) => e.id === p.targetId && e.hp > 0);
    if (!target || p.life <= 0) { p.life = 0; continue; }
    const d = distance(target, p), step = p.speed * dt;
    if (d <= step + .4) { hit(s, target, p.damage, p.empowered ? .65 : 0); p.life = 0; }
    else { p.x += (target.x - p.x) / d * step; p.z += (target.z - p.z) / d * step; }
  }
  s.projectiles = s.projectiles.filter((p) => p.life > 0);
  return dt;
}

export function advanceEnemies(s, dt) {
  if (s.status !== 'playing' || !Number.isFinite(dt) || dt <= 0) return;
  dt = Math.min(dt, .05);
  for (const enemy of s.enemies) {
    if (s.status !== 'playing') break;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    if (enemy.hp <= 0 || enemy.sealed) continue;
    if (enemy.stagger > 0) { enemy.stagger = Math.max(0, enemy.stagger - dt); enemy.phase = 'stagger'; if (enemy.stagger === 0) { enemy.phase = 'recovery'; enemy.recovery = .4; } continue; }
    if (enemy.phase === 'windup') {
      enemy.windup = Math.max(0, enemy.windup - dt);
      if (enemy.windup === 0) {
        enemy.phase = 'recovery'; enemy.recovery = enemy.recoveryDuration;
        emit(s, 'enemy-impact', { enemyId: enemy.id, x: enemy.aimX, z: enemy.aimZ, radius: enemy.radius, kind: enemy.attackKind });
        if (Math.hypot(s.x - enemy.aimX, s.z - enemy.aimZ) < enemy.radius) hurt(s, enemy.impactDamage, { kind: enemy.attackKind, name: enemy.name });
      }
      continue;
    }
    if (enemy.phase === 'recovery') {
      enemy.recovery = Math.max(0, enemy.recovery - dt);
      if (enemy.recovery === 0) { enemy.phase = 'idle'; enemy.timer = .6; }
      continue;
    }
    const d = distance(enemy, s);
    if (d > 14) { enemy.phase = 'idle'; continue; }
    enemy.phase = 'pursuit'; enemy.facing = Math.atan2(s.x - enemy.x, s.z - enemy.z); enemy.timer -= dt;
    if (d > (enemy.boss ? 3.6 : 2)) {
      const speed = enemy.boss ? 1.45 : 2.1;
      enemy.x += (s.x - enemy.x) / d * dt * speed; enemy.z += (s.z - enemy.z) / d * dt * speed;
    }
    if (enemy.timer <= 0 && d < (enemy.boss ? 6 : 3.8)) {
      prepareEnemyAttack(enemy, s);
      emit(s, 'enemy-windup', { enemyId: enemy.id, boss: enemy.boss, x: enemy.aimX, z: enemy.aimZ, duration: enemy.chargeDuration, kind: enemy.attackKind, radius: enemy.radius });
    }
  }
}

export const canEvolve = (s) => s.status === 'playing' && !s.evolved && s.enemies.filter(e => !e.boss).every(e => e.hp <= 0);

export function evolve(s) {
  if (!canEvolve(s)) return false;
  s.evolved = true; s.action = null; s.inputBuffer = 0; s.skillBuffer = 0; s.maxHp = Math.round(s.role.hp * 1.3); s.hp = s.maxHp; s.stamina = 100;
  s.cooldown = 0; s.dashCooldown = 0;
  for (const enemy of s.enemies) if (enemy.boss) { enemy.sealed = false; enemy.timer = 1.2; }
  emit(s, 'evolved'); return true;
}
