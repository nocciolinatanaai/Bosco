// PRODUCT-02 (Tonino): isolated candidates answering Codex's two counterexamples. Not a gameplay patch:
// temporary copies of combat.js / artifacts.js only; the sources (incl. the Rintocco-reserved hit()) stay byte-identical.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { restoreCheckpoint } from '../src/checkpoints.js';
import { CLASSES } from '../src/roles.js';
const out = resolve(process.argv[2] || 'test-results/decision-experiment-02'); await mkdir(out, { recursive: true });
const combatSrc = await readFile('src/combat.js', 'utf8'), artifactSrc = await readFile('src/artifacts.js', 'utf8');
const once = (s, a, b) => { assert.equal(s.split(a).length, 2, `patch anchor must match once: ${a.slice(0, 60)}`); return s.replace(a, b); };
// --- Rule pieces (each one textual, so the report shows exactly what was tried) -------------------------
const TEMPER = [ // Codex's candidate: after a first disturbance the boss cannot be staggered until an attack completes.
  ['if (stagger > 0 && enemy.hp > 0) {', 'if (stagger > 0 && enemy.hp > 0 && (!enemy.boss || !enemy.xTempered)) { if (enemy.boss) enemy.xTempered = true;'],
  ["enemy.phase = 'recovery'; enemy.recovery = enemy.recoveryDuration;", "enemy.phase = 'recovery'; enemy.recovery = enemy.recoveryDuration; enemy.xTempered = false;"],
];
const PROVOKE = [ // Tonino: a boss that is hit stays engaged for 8 s, whatever the distance.
  ['enemy.hp -= amount; enemy.hitFlash = .16;', 'enemy.hp -= amount; enemy.hitFlash = .16; if (enemy.boss) enemy.xAlert = 8;'],
  ['    const d = distance(enemy, s);\n    if (d > 14) {', '    enemy.xAlert = Math.max(0, (enemy.xAlert || 0) - dt);\n    const d = distance(enemy, s);\n    if (d > 14 && !(enemy.xAlert > 0)) {'],
];
const REACH = [ // Tonino: an engaged boss answers at range with its aimed Frattura (not the centred Onda).
  ['if (enemy.timer <= 0 && d < (enemy.boss ? 6 : 3.8)) {', 'if (enemy.timer <= 0 && d < (enemy.boss ? (enemy.xAlert > 0 ? 16 : 6) : 3.8)) {'],
];
const WARD_CHARGE = { // Tonino: Custodia = one guarded hit within 6 s (consumed by the next damage), instead of a 2.2 s timer.
  artifacts: [["if(a.attunement==='ward')s.shield=Math.max(s.shield,2.2);", "if(a.attunement==='ward')s.xWard=6;"]],
  combat: [
    ["const actual = Math.min(s.hp, Math.round(amount * (s.shield > 0 ? .25 : 1)));", "const xGuard = s.shield > 0 || s.xWard > 0; const actual = Math.min(s.hp, Math.round(amount * (xGuard ? .25 : 1))); if (s.xWard > 0) { s.xWard = 0; s.xWardUsed = (s.xWardUsed || 0) + 1; }"],
    ["emit(s, 'hurt', { amount: actual, guarded: s.shield > 0 });", "emit(s, 'hurt', { amount: actual, guarded: xGuard, raw: amount });"],
    ["for (const key of ['cooldown',", "s.xWard = Math.max(0, (s.xWard || 0) - dt); for (const key of ['cooldown',"],
  ],
};
const WARD_LONG = { artifacts: [["s.shield=Math.max(s.shield,2.2)", "s.shield=Math.max(s.shield,4.2)"]], combat: [] }; // control: blind duration increase
const RAW = [["emit(s, 'hurt', { amount: actual, guarded: s.shield > 0 });", "emit(s, 'hurt', { amount: actual, guarded: s.shield > 0, raw: amount });"]];
const variants = {
  baseline: { combat: [...RAW], artifacts: [] },
  tempered: { combat: [...TEMPER, ...RAW], artifacts: [] },
  'tempered+provoke': { combat: [...TEMPER, ...PROVOKE, ...RAW], artifacts: [] },
  'tempered+provoke+reach': { combat: [...TEMPER, ...PROVOKE, ...REACH, ...RAW], artifacts: [] },
  'tempered+provoke+reach+wardCharge': { combat: [...TEMPER, ...PROVOKE, ...REACH, ...WARD_CHARGE.combat], artifacts: WARD_CHARGE.artifacts },
  'tempered+provoke+reach+ward4.2s': { combat: [...TEMPER, ...PROVOKE, ...REACH, ...RAW], artifacts: WARD_LONG.artifacts },
};
async function load(name, v) {
  const dir = resolve(out, name.replaceAll('+', '_').replaceAll('.', '')); await mkdir(dir, { recursive: true });
  let a = artifactSrc; for (const [x, y] of v.artifacts) a = once(a, x, y);
  let c = combatSrc; for (const [x, y] of v.combat) c = once(c, x, y);
  const abs = s => s.replaceAll(/from '(\.\/[^']+)'/g, (_, rel) => rel === './artifacts.js' ? "from './artifacts.mjs'" : `from '${pathToFileURL(resolve('src', rel)).href}'`);
  await writeFile(resolve(dir, 'artifacts.mjs'), abs(a)); await writeFile(resolve(dir, 'combat.mjs'), abs(c));
  const combat = await import(pathToFileURL(resolve(dir, 'combat.mjs')));
  return combat;
}
const DT = 1 / 60;
function run(g, roleId, policy, attunement = 'ward') {
  const s = restoreCheckpoint({ version: 1, autoSave: false, role: roleId, stage: 'awakened', traces: 0 });
  const boss = s.enemies.find(e => e.boss);
  const far = policy === 'outside-aggro' || policy.startsWith('kite');
  const maxRange = { mage: 11.85, healer: 10.65 }[roleId];
  const off = far ? { x: 0, z: 14.25 } : policy === 'max-range' ? { x: 0, z: maxRange } : { x: -2.5, z: 0 };
  s.x = boss.x + off.x; s.z = boss.z + off.z; g.attuneArtifact(s, attunement); g.drainEvents(s);
  const m = { completedAttacks: 0, hitsTaken: 0, damage: 0, rawDamage: 0, guardedHits: 0, preventedBySigil: 0, evaded: 0, sigil: 0, dodges: 0 };
  for (let f = 0; f < 120 / DT && boss.hp > 0 && s.status === 'playing'; f++) {
    const inCircle = boss.phase === 'windup' && Math.hypot(s.x - boss.aimX, s.z - boss.aimZ) < boss.radius;
    const timed = (policy === 'timed-dodge' || policy === 'kite') && inCircle && boss.windup <= .10;
    if (timed && s.dashCooldown <= 0 && s.stamina >= 30) { const dx = s.x - boss.aimX, dz = s.z - boss.aimZ, d = Math.hypot(dx, dz) || 1; if (g.dodge(s, dx / d, dz / d)) m.dodges++; }
    if (policy !== 'basic' && s.cooldown <= 0) g.cast(s);
    g.tickCooldowns(s, DT);
    let tx = boss.x + off.x - s.x, tz = boss.z + off.z - s.z;
    if (policy.startsWith('kite')) { const d = Math.hypot(s.x - boss.x, s.z - boss.z); if (d < 12) { tx = s.x - boss.x; tz = s.z - boss.z; } else { tx = 0; tz = 0; } }
    const d = Math.hypot(tx, tz); if (d > .001 && s.dodgeRemaining <= 0) g.movePlayer(s, tx / d * Math.min(1, d / (5 * DT)), tz / d * Math.min(1, d / (5 * DT)), DT, s.action ? (s.action.phase === 'windup' ? 2.4 : 3.6) : 5);
    g.advanceEnemies(s, DT); if (!s.action) g.attack(s);
    for (const e of g.drainEvents(s)) {
      if (e.type === 'enemy-impact' && e.enemyId === boss.id) m.completedAttacks++;
      if (e.type === 'hurt') { m.hitsTaken++; m.damage += e.amount; m.rawDamage += e.raw ?? e.amount; if (e.guarded) { m.guardedHits++; m.preventedBySigil += (e.raw ?? e.amount) - e.amount; } }
      if (e.type === 'evaded') m.evaded++;
      if (e.type === 'artifact-triggered') m.sigil++;
    }
  }
  return { outcome: boss.hp <= 0 ? 'won' : s.status === 'defeated' ? 'lost' : 'timeout', seconds: +s.time.toFixed(2), ...m };
}
// Custodia probe (Codex's counterexample 2): evade the first boss attack (activates the Sigil),
// then make the next mistake on purpose (stay inside the next circle). Does the Sigil reduce that damage?
function wardProbe(g, roleId, attunement, delay = 0) {
  const s = restoreCheckpoint({ version: 1, autoSave: false, role: roleId, stage: 'awakened', traces: 0 });
  const boss = s.enemies.find(e => e.boss); s.x = boss.x - 2.5; s.z = boss.z; g.attuneArtifact(s, attunement); g.drainEvents(s);
  g.cast(s); // a legitimate early interruption (activates the tempered rule where present)
  let impacts = 0, activation = null, mistakeAt = null, damageAtMistake = 0, rawAtMistake = 0;
  for (let f = 0; f < 1800 && impacts < 2 && s.status === 'playing'; f++) {
    if (activation === null && boss.phase === 'windup' && boss.windup <= .1 && s.dashCooldown <= 0) g.dodge(s, 0, 1);
    if (activation !== null && s.time - activation < delay) { s.x = boss.x + 17; s.z = boss.z; } // step out of reach first (delayed mistake)
    else if (activation !== null && boss.phase === 'windup') { s.x = boss.aimX; s.z = boss.aimZ; } // the deliberate mistake
    g.tickCooldowns(s, DT); g.advanceEnemies(s, DT);
    for (const e of g.drainEvents(s)) {
      if (e.type === 'artifact-triggered') activation = s.time;
      if (e.type === 'enemy-impact' && e.enemyId === boss.id) { impacts++; if (impacts === 2) mistakeAt = s.time; }
      if (e.type === 'hurt' && impacts >= 1 && activation !== null) { damageAtMistake += e.amount; rawAtMistake += e.raw ?? e.amount; }
    }
  }
  return { attunement, delay, activation, mistakeAt, secondsBetween: activation !== null && mistakeAt !== null ? +(mistakeAt - activation).toFixed(3) : null, rawDamage: rawAtMistake, damageTaken: damageAtMistake };
}
const rows = [], wards = [];
for (const [name, v] of Object.entries(variants)) {
  const g = await load(name, v);
  for (const role of CLASSES) {
    for (const policy of ['basic', 'timed-dodge', ...(role.id === 'ranger' ? ['outside-aggro', 'kite', 'kite-no-dodge'] : []), ...(['mage', 'healer'].includes(role.id) ? ['max-range'] : [])]) rows.push({ variant: name, role: role.id, policy, ...run(g, role.id, policy) });
    rows.push({ variant: name, role: role.id, policy: 'timed-dodge/impeto', ...run(g, role.id, 'timed-dodge', 'surge') });
    for (const att of ['ward', 'surge']) for (const delay of [0, 2.5]) wards.push({ variant: name, role: role.id, ...wardProbe(g, role.id, att, delay) });
  }
}
assert.equal(await readFile('src/combat.js', 'utf8'), combatSrc, 'combat.js must stay unchanged');
assert.equal(await readFile('src/artifacts.js', 'utf8'), artifactSrc, 'artifacts.js must stay unchanged');
const report = { scope: 'Isolated candidates in temporary module copies; six evolved classes, legitimate checkpoint, 1/60 s, 120 s cap. Timed dodge uses perfect knowledge of the windup: not a measure of human difficulty. Not a shipped change, not a playtest.',
  sourceSha256: { combat: createHash('sha256').update(combatSrc).digest('hex'), artifacts: createHash('sha256').update(artifactSrc).digest('hex') },
  rules: { TEMPER, PROVOKE, REACH, WARD_CHARGE, WARD_LONG }, rows, wardProbe: wards };
await writeFile(resolve(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
for (const name of Object.keys(variants)) await rm(resolve(out, name.replaceAll('+', '_').replaceAll('.', '')), { recursive: true, force: true });
const t = r => `${r.outcome} ${r.seconds}s atk${r.completedAttacks} hit${r.hitsTaken} dmg${r.damage} sig${r.sigil} prev${r.preventedBySigil}`;
for (const name of Object.keys(variants)) {
  console.log('##', name);
  for (const r of rows.filter(r => r.variant === name && (r.role === 'ranger' || r.policy === 'basic' || r.policy === 'max-range' || r.role === 'fighter'))) console.log(' ', r.role.padEnd(8), r.policy.padEnd(18), t(r));
  for (const w of wards.filter(w => w.variant === name && w.role === 'fighter')) console.log('  ward-probe fighter', w.attunement, 'delay', w.delay, `gap ${w.secondsBetween}s raw ${w.rawDamage} taken ${w.damageTaken}`);
}
