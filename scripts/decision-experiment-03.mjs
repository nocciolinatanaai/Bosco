// PRODUCT-03 (Tonino): answers Codex's PRODUCT_RESPONSE_02. Isolated copies only; combat.js, artifacts.js and
// enemy-attacks.js stay byte-identical (asserted). Not a gameplay patch, not a playtest; the dodge bot knows timers.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { restoreCheckpoint } from '../src/checkpoints.js';
import { CLASSES } from '../src/roles.js';
const out = resolve(process.argv[2] || 'test-results/decision-experiment-03'); await mkdir(out, { recursive: true });
const SRC = { combat: await readFile('src/combat.js', 'utf8'), artifacts: await readFile('src/artifacts.js', 'utf8') };
const once = (s, a, b) => { assert.equal(s.split(a).length, 2, `anchor must match once: ${a.slice(0, 70)}`); return s.replace(a, b); };
const TEMPER = [['if (stagger > 0 && enemy.hp > 0) {', 'if (stagger > 0 && enemy.hp > 0 && (!enemy.boss || !enemy.xTempered)) { if (enemy.boss) enemy.xTempered = true;'],
  ["enemy.phase = 'recovery'; enemy.recovery = enemy.recoveryDuration;", "enemy.phase = 'recovery'; enemy.recovery = enemy.recoveryDuration; enemy.xTempered = false;"]];
const PROVOKE = [['enemy.hp -= amount; enemy.hitFlash = .16;', 'enemy.hp -= amount; enemy.hitFlash = .16; if (enemy.boss) enemy.xAlert = 8;'],
  ['    const d = distance(enemy, s);\n    if (d > 14) {', '    enemy.xAlert = Math.max(0, (enemy.xAlert || 0) - dt);\n    const d = distance(enemy, s);\n    if (d > 14 && !(enemy.xAlert > 0)) {']];
const REACH = [['if (enemy.timer <= 0 && d < (enemy.boss ? 6 : 3.8)) {', 'if (enemy.timer <= 0 && d < (enemy.boss ? (enemy.xAlert > 0 ? 16 : 6) : 3.8)) {']];
// Codex is right: REACH alone keeps alternating Frattura/Onda and Onda is centred on the boss. Two explicit specs:
const SUBSTITUTE = [['      prepareEnemyAttack(enemy, s);', '      if (enemy.boss && d > 6 && enemy.attackCount % 2 === 1) enemy.attackCount += 1; // far: Frattura replaces Onda\n      prepareEnemyAttack(enemy, s);']];
const WALK = [['if (enemy.timer <= 0 && d < (enemy.boss ? (enemy.xAlert > 0 ? 16 : 6) : 3.8)) {', 'if (enemy.timer <= 0 && d < (enemy.boss ? (enemy.xAlert > 0 && enemy.attackCount % 2 === 0 ? 16 : 6) : 3.8)) { // far: no empty Onda, keep walking']];
const LOG = [["      emit(s, 'enemy-windup', {", "      emit(s, 'x-attack', { kind: enemy.attackKind, distance: d, threatening: Math.hypot(s.x - enemy.aimX, s.z - enemy.aimZ) < enemy.radius });\n      emit(s, 'enemy-windup', {"]];
const RAW = [["emit(s, 'hurt', { amount: actual, guarded: s.shield > 0 });", "emit(s, 'hurt', { amount: actual, guarded: s.shield > 0, raw: amount });"]];
// Codex's proposal for Impeto: the next basic attack after an impact dodge is charged (expires, consumed, vigour kept).
const strike = (k, keepCooldown = false) => ({
  artifacts: [["else{s.stamina=Math.min(100,s.stamina+18);s.cooldown=Math.max(0,s.cooldown-.8);}", keepCooldown ? "else{s.stamina=Math.min(100,s.stamina+18);s.cooldown=Math.max(0,s.cooldown-.8);s.xStrike=3;}" : "else{s.stamina=Math.min(100,s.stamina+18);s.xStrike=3;}"]],
  combat: [
    ["  emit(s, 'strike', { kind: action.kind,", `  const xK = action.kind === 'basic' && s.xStrike > 0 ? ${k} : 1; if (xK > 1) { s.xStrike = 0; s.xStrikeUsed = (s.xStrikeUsed || 0) + 1; }\n  emit(s, 'strike', { kind: action.kind,`],
    ["if (ranged(s)) { projectile(s, action, s.role.basicDamage); return; }", "if (ranged(s)) { projectile(s, action, s.role.basicDamage * xK); return; }"],
    ["for (const enemy of targets) hit(s, enemy, s.role.basicDamage * (action.combo === 3 ? 1.65 : action.combo === 2 ? 1.15 : 1), action.combo === 3 ? .3 : 0);\n    if (!targets.length) emit(s, 'miss');",
     "for (const enemy of targets) hit(s, enemy, s.role.basicDamage * xK * (action.combo === 3 ? 1.65 : action.combo === 2 ? 1.15 : 1), action.combo === 3 ? .3 : 0);\n    if (!targets.length) emit(s, 'miss', { charged: xK > 1 });"],
    ["for (const key of ['cooldown',", "s.xStrike = Math.max(0, (s.xStrike || 0) - dt); for (const key of ['cooldown',"],
  ],
});
const variants = {
  'reach (02)': { combat: [...TEMPER, ...PROVOKE, ...REACH, ...LOG, ...RAW], artifacts: [] },
  'reach+substitute': { combat: [...TEMPER, ...PROVOKE, ...REACH, ...SUBSTITUTE, ...LOG, ...RAW], artifacts: [] },
  'reach+walk': { combat: [...TEMPER, ...PROVOKE, ...REACH, ...WALK, ...LOG, ...RAW], artifacts: [] },
  'tempered (impeto now)': { combat: [...TEMPER, ...LOG, ...RAW], artifacts: [] },
  'tempered+strike1.5': { combat: [...TEMPER, ...LOG, ...RAW, ...strike(1.5).combat], artifacts: strike(1.5).artifacts },
  'tempered+strike2': { combat: [...TEMPER, ...LOG, ...RAW, ...strike(2).combat], artifacts: strike(2).artifacts },
  'tempered+strike1.5+cooldown': { combat: [...TEMPER, ...LOG, ...RAW, ...strike(1.5, true).combat], artifacts: strike(1.5, true).artifacts },
};
async function load(name, v) {
  const dir = resolve(out, 'tmp-' + name.replace(/[^a-z0-9]+/gi, '_')); await mkdir(dir, { recursive: true });
  let a = SRC.artifacts; for (const [x, y] of v.artifacts) a = once(a, x, y);
  let c = SRC.combat; for (const [x, y] of v.combat) c = once(c, x, y);
  const abs = s => s.replaceAll(/from '(\.\/[^']+)'/g, (_, rel) => rel === './artifacts.js' ? "from './artifacts.mjs'" : `from '${pathToFileURL(resolve('src', rel)).href}'`);
  await writeFile(resolve(dir, 'artifacts.mjs'), abs(a)); await writeFile(resolve(dir, 'combat.mjs'), abs(c));
  return { g: await import(pathToFileURL(resolve(dir, 'combat.mjs'))), dir };
}
const DT = 1 / 60;
function run(g, roleId, policy, { attunement = 'ward', schedule = 'eager', bossHp = null } = {}) {
  const s = restoreCheckpoint({ version: 1, autoSave: false, role: roleId, stage: 'awakened', traces: 0 });
  const boss = s.enemies.find(e => e.boss); if (bossHp) { boss.hp = boss.maxHp = bossHp; }
  const far = policy === 'outside-aggro' || policy.startsWith('kite'), maxRange = { mage: 11.85, healer: 10.65 }[roleId];
  const off = far ? { x: 0, z: 14.25 } : policy === 'max-range' ? { x: 0, z: maxRange } : { x: -2.5, z: 0 };
  s.x = boss.x + off.x; s.z = boss.z + off.z; g.attuneArtifact(s, attunement); g.drainEvents(s);
  const m = { attacks: [], completedAttacks: 0, hitsTaken: 0, damage: 0, sigil: 0, misses: 0, chargedMisses: 0, chargedUsed: 0 };
  for (let f = 0; f < 120 / DT && boss.hp > 0 && s.status === 'playing'; f++) {
    const inCircle = boss.phase === 'windup' && Math.hypot(s.x - boss.aimX, s.z - boss.aimZ) < boss.radius;
    if ((policy === 'timed-dodge' || policy === 'kite') && inCircle && boss.windup <= .10 && s.dashCooldown <= 0 && s.stamina >= 30) { const dx = s.x - boss.aimX, dz = s.z - boss.aimZ, d = Math.hypot(dx, dz) || 1; g.dodge(s, dx / d, dz / d); }
    if (policy !== 'basic' && s.cooldown <= 0 && (schedule === 'eager' || s.time < .01 || (schedule === 'finish-combo' && !s.action && s.combo === 3))) g.cast(s);
    g.tickCooldowns(s, DT);
    let tx = boss.x + off.x - s.x, tz = boss.z + off.z - s.z;
    if (policy.startsWith('kite')) { const d = Math.hypot(s.x - boss.x, s.z - boss.z); if (d < 12) { tx = s.x - boss.x; tz = s.z - boss.z; } else { tx = 0; tz = 0; } }
    const d = Math.hypot(tx, tz); if (d > .001 && s.dodgeRemaining <= 0) g.movePlayer(s, tx / d * Math.min(1, d / (5 * DT)), tz / d * Math.min(1, d / (5 * DT)), DT, s.action ? (s.action.phase === 'windup' ? 2.4 : 3.6) : 5);
    g.advanceEnemies(s, DT); if (!s.action) g.attack(s);
    for (const e of g.drainEvents(s)) {
      if (e.type === 'x-attack') m.attacks.push({ t: +s.time.toFixed(2), kind: e.kind, distance: +e.distance.toFixed(2), threatening: e.threatening });
      if (e.type === 'enemy-impact' && e.enemyId === boss.id) m.completedAttacks++;
      if (e.type === 'hurt') { m.hitsTaken++; m.damage += e.amount; }
      if (e.type === 'artifact-triggered') m.sigil++;
      if (e.type === 'miss') { m.misses++; if (e.charged) m.chargedMisses++; }
    }
  }
  m.chargedUsed = s.xStrikeUsed || 0;
  return { outcome: boss.hp <= 0 ? 'won' : s.status === 'defeated' ? 'lost' : 'timeout', seconds: +s.time.toFixed(2), ...m,
    threateningAttacks: m.attacks.filter(a => a.threatening).length, emptyAttacks: m.attacks.filter(a => !a.threatening).length };
}
const reach = [], impeto = [];
for (const [name, v] of Object.entries(variants)) {
  const { g, dir } = await load(name, v);
  if (name.startsWith('reach')) {
    for (const [role, policy] of [['ranger', 'outside-aggro'], ['ranger', 'kite'], ['ranger', 'kite-no-dodge'], ['mage', 'max-range'], ['healer', 'max-range']]) {
      reach.push({ variant: name, role, policy, normal: run(g, role, policy) });
      // Stress run, boss HP x3 (840): only to observe several attack cycles at range, not a balance proposal.
      reach.push({ variant: name, role, policy, stressHp840: run(g, role, policy, { bossHp: 840 }) });
    }
    for (const role of CLASSES) reach.push({ variant: name, role: role.id, policy: 'basic', normal: run(g, role.id, 'basic') });
  } else {
    for (const role of CLASSES) for (const schedule of ['eager', 'finish-combo']) for (const attunement of ['ward', 'surge'])
      impeto.push({ variant: name, role: role.id, schedule, attunement, ...run(g, role.id, 'timed-dodge', { attunement, schedule }) });
  }
  await rm(dir, { recursive: true, force: true });
}
assert.equal(await readFile('src/combat.js', 'utf8'), SRC.combat); assert.equal(await readFile('src/artifacts.js', 'utf8'), SRC.artifacts);
const report = { scope: 'Isolated copies; tempered + provocation + reach (Tonino 02) with two explicit far-Onda specs, and Codex\'s charged-strike Impeto at two sensitivity values. Six evolved classes, 1/60 s, 120 s cap, perfect-timer dodge bot. Boss HP x3 runs are stress observations only.',
  sourceSha256: Object.fromEntries(Object.entries(SRC).map(([k, v]) => [k, createHash('sha256').update(v).digest('hex')])), reach, impeto };
await writeFile(resolve(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
const fmt = r => `${r.outcome} ${r.seconds}s atk${r.attacks.length} (minacce ${r.threateningAttacks}, a vuoto ${r.emptyAttacks}: ${r.attacks.map(a => a.kind[0] + (a.threatening ? '!' : '·')).join('')}) dmg${r.damage} sig${r.sigil}`;
for (const x of reach) if (x.policy !== 'basic') console.log(x.variant.padEnd(17), x.role.padEnd(7), x.policy.padEnd(14), x.normal ? 'N ' + fmt(x.normal) : 'S ' + fmt(x.stressHp840));
for (const x of reach) if (x.policy === 'basic' && x.variant !== 'reach (02)') console.log(x.variant.padEnd(17), x.role.padEnd(8), 'basic', fmt(x.normal));
for (const x of impeto) if (x.attunement === 'surge' || x.variant.startsWith('tempered (')) console.log(x.variant.padEnd(22), x.role.padEnd(8), x.schedule.padEnd(12), x.attunement.padEnd(5), `${x.outcome} ${x.seconds}s miss${x.misses} chargedMiss${x.chargedMisses} used${x.chargedUsed}`);
