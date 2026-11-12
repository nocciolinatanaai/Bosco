// COMBAT-01 — confronto prima/dopo con le stesse fixture e politiche deterministiche.
// «Prima» = sorgenti della base 86dbe4c estratti in una cartella temporanea; «dopo» = src/ di questo ramo.
// Uso: node scripts/combat-pass-compare.mjs [cartella-output]
// Sono bot: la schivata «a tempo» conosce il timer alla perfezione. Nessun dato su persone.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE = process.env.COMBAT_BASE || '86dbe4c';
const out = process.argv[2] || 'test-results/combat-pass-compare'; mkdirSync(out, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'combat-before-'));
execFileSync('sh', ['-c', `git archive ${BASE} src | tar -x -C ${tmp}`]);
const before = await import(pathToFileURL(join(tmp, 'src/game.js')).href);
const after = await import(pathToFileURL(resolve('src/game.js')).href);
const head = execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim();

const DT = .02, LIMIT = 60;
const MELEE = new Set(['tank', 'fighter', 'assassin']);
const maxRange = (role) => role.basicRange * 1.2 - .15;
function engage(role) { return MELEE.has(role.id) ? 2.4 : 8; }

// Politiche: ognuna decide movimento, attacco e schivata a ogni passo, leggendo solo lo stato visibile.
const POLICIES = {
  spam: { label: 'spam attacco/abilità alla distanza d’ingaggio, senza schivare', classes: 'all', step: (api, s, b) => { keep(api, s, b, engage(s.role)); press(api, s); } },
  early: { label: 'schivata anticipata (0,6 s prima)', classes: 'all', step: (api, s, b) => { keep(api, s, b, engage(s.role)); if (b.phase === 'windup' && b.windup <= .6 && b.windup > .5) api.dodge(s); press(api, s); } },
  leave: { label: 'esce dal cerchio annunciato', classes: 'all', step: (api, s, b) => {
    if (b.phase === 'windup') { const d = Math.hypot(s.x - b.aimX, s.z - b.aimZ); if (d < b.radius + .4) { const dx = (s.x - b.aimX) || 1, dz = s.z - b.aimZ; api.movePlayer(s, dx, dz, DT); return; } }
    keep(api, s, b, engage(s.role)); press(api, s); } },
  timed: { label: 'schivata a tempo (bot perfetto)', classes: 'all', step: (api, s, b) => { keep(api, s, b, engage(s.role)); timedDodge(api, s, b); press(api, s); } },
  twoFinger: { label: 'due dita: gira intorno mentre attacca, schivata a tempo', classes: 'all', step: (api, s, b, t) => {
    const d = engage(s.role), a = t * .9; api.movePlayer(s, b.x + Math.sin(a) * d - s.x, b.z + Math.cos(a) * d - s.z, DT); timedDodge(api, s, b); press(api, s); } },
  rangedStand: { label: 'a distanza fermo alla gittata massima', classes: 'ranged', step: (api, s, b) => { keep(api, s, b, maxRange(s.role)); press(api, s); } },
  kite: { label: 'a distanza, mantiene 11–14 e schiva a tempo', classes: 'ranged', step: (api, s, b) => {
    const d = Math.hypot(s.x - b.x, s.z - b.z), target = Math.min(14, maxRange(s.role));
    if (d < target - 2.5) api.movePlayer(s, s.x - b.x, s.z - b.z, DT); else if (d > target) api.movePlayer(s, b.x - s.x, b.z - s.z, DT);
    timedDodge(api, s, b); press(api, s); } },
};
function keep(api, s, b, d) {
  const dx = s.x - b.x, dz = s.z - b.z, cur = Math.hypot(dx, dz) || 1;
  const tx = b.x + dx / cur * d, tz = b.z + dz / cur * d;
  if (Math.hypot(tx - s.x, tz - s.z) > .15) api.movePlayer(s, tx - s.x, tz - s.z, DT);
}
function press(api, s) { if (!api.cast(s)) api.attack(s); }
function timedDodge(api, s, b) { if (b.phase === 'windup' && b.windup <= .1 && Math.hypot(s.x - b.aimX, s.z - b.aimZ) < b.radius + .5) api.dodge(s); }

function fight(api, roleId, policyId, attune) {
  const s = api.createSession(roleId);
  for (const e of s.enemies) if (!e.boss) { e.hp = 0; e.phase = 'dead'; }
  api.evolve(s); if (attune) api.attuneArtifact(s, attune); api.drainEvents(s);
  const b = s.enemies.find((e) => e.boss);
  Object.assign(s, { x: b.x, z: b.z + (policyId === 'rangedStand' || policyId === 'kite' ? maxRange(s.role) : 6) });
  const m = { win: false, time: 0, attacksCompleted: 0, hitsTaken: 0, damage: 0, interrupts: 0, resisted: 0, misses: 0,
    surgeUsed: 0, surgeLanded: 0, surgeMissed: 0, wardUsed: 0, wardPrevented: 0, sigil: 0, farFractures: 0 };
  const landed = new Set();
  let t = 0, inStagger = false;
  for (; t < LIMIT && b.hp > 0 && s.status === 'playing'; t += DT) {
    POLICIES[policyId].step(api, s, b, t);
    api.tickCooldowns(s, DT); api.advanceEnemies(s, DT);
    for (const e of api.drainEvents(s)) {
      if (e.type === 'enemy-impact' && e.enemyId === b.id) m.attacksCompleted++;
      if (e.type === 'enemy-windup' && e.enemyId === b.id && e.reach) m.farFractures++;
      if (e.type === 'hurt') { m.hitsTaken++; m.damage += e.amount; }
      if (e.type === 'hit' && e.enemyId === b.id && e.resisted) m.resisted++;
      if (e.type === 'miss') { m.misses++; if (e.chargeId) m.surgeMissed++; }
      if (e.type === 'surge-consumed') m.surgeUsed++;
      if (e.type === 'hit' && e.chargeId && !landed.has(e.chargeId)) { landed.add(e.chargeId); m.surgeLanded++; }
      if (e.type === 'ward-consumed') { m.wardUsed++; m.wardPrevented += e.raw - e.amount; }
      if (e.type === 'artifact-triggered') m.sigil++;
    }
    if (b.phase === 'stagger' && !inStagger) m.interrupts++; inStagger = b.phase === 'stagger';
  }
  m.win = b.hp <= 0 && s.status === 'playing'; m.time = Number(t.toFixed(2)); m.hpLeft = s.hp;
  return m;
}
const { restoreCheckpoint: restoreBefore } = await import(pathToFileURL(join(tmp, 'src/checkpoints.js')).href);
const { restoreCheckpoint: restoreAfter } = await import(pathToFileURL(resolve('src/checkpoints.js')).href);
const CAVES = { version: 3, attunement: null, autoSave: false, stage: 'guardian', traces: 3, garden: { step: 4, area: 'plaza', sentryDefeated: false } };
function warden(api, restore, roleId, policy) {
  const s = restore({ ...CAVES, role: roleId }); Object.assign(s, { x: 35, z: 7 }); api.interactCaves(s, 'enter');
  const w = s.enemies.find((e) => e.type === 'warden'); Object.assign(s, { x: 0, z: -5.5 });
  const m = { win: false, time: 0, rings: 0, ringsBeforeDeath: 0, hitsTaken: 0, damage: 0, resisted: 0 }; let t = 0;
  for (; t < 120 && w.hp > 0 && s.status === 'playing'; t += DT) {
    if (policy === 'timed') timedDodge(api, s, { ...w, aimX: w.x, aimZ: w.z });
    press(api, s); api.tickCooldowns(s, DT); api.advanceEnemies(s, DT);
    for (const e of api.drainEvents(s)) { if (e.type === 'enemy-impact') m.rings++; if (e.type === 'hurt') { m.hitsTaken++; m.damage += e.amount; } if (e.type === 'hit' && e.resisted) m.resisted++; }
  }
  m.win = w.hp <= 0 && s.status === 'playing'; m.time = Number(t.toFixed(2)); return m;
}

const roles = after.CLASSES.map((r) => r.id), ranged = roles.filter((r) => !MELEE.has(r));
const rows = [];
for (const [policyId, policy] of Object.entries(POLICIES)) for (const role of policy.classes === 'all' ? roles : ranged)
  for (const attune of (['timed', 'twoFinger', 'kite', 'early'].includes(policyId) ? [null, 'ward', 'surge'] : [null])) {
    rows.push({ fight: 'custode', policy: policyId, role, attune: attune || '—', before: fight(before, role, policyId, attune), after: fight(after, role, policyId, attune) });
  }
for (const role of roles) for (const policy of ['spam', 'timed'])
  rows.push({ fight: 'rintocco', policy, role, attune: '—', before: warden(before, restoreBefore, role, policy), after: warden(after, restoreAfter, role, policy) });
rmSync(tmp, { recursive: true, force: true });

const report = { base: BASE, head, dt: DT, limitSeconds: LIMIT, note: 'Bot deterministici, stessa fixture prima/dopo. Non sono persone.', policies: Object.fromEntries(Object.entries(POLICIES).map(([k, v]) => [k, v.label])), rows };
writeFileSync(join(out, 'compare.json'), JSON.stringify(report, null, 2));
const f = (m) => `${m.win ? 'V' : 'S'} ${m.time}s · att ${m.attacksCompleted} · colpi ${m.hitsTaken} · danno ${m.damage}`;
const lines = ['| scontro | politica | classe | Sigillo | prima | dopo | Impeto usati/a segno/a vuoto | Custodia usate (danno evitato) | Frattura lontana | resistiti |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |'];
for (const r of rows) {
  if (r.fight === 'custode') lines.push(`| Custode | ${r.policy} | ${r.role} | ${r.attune} | ${f(r.before)} | ${f(r.after)} | ${r.after.surgeUsed}/${r.after.surgeLanded}/${r.after.surgeMissed} | ${r.after.wardUsed} (${r.after.wardPrevented}) | ${r.after.farFractures} | ${r.after.resisted} |`);
  else lines.push(`| Rintocco | ${r.policy} | ${r.role} | — | ${r.before.win ? 'V' : 'S'} ${r.before.time}s · rintocchi ${r.before.rings} · danno ${r.before.damage} | ${r.after.win ? 'V' : 'S'} ${r.after.time}s · rintocchi ${r.after.rings} · danno ${r.after.damage} | — | — | — | ${r.after.resisted} |`);
}
writeFileSync(join(out, 'compare.md'), `# COMBAT-01 prima (${BASE}) / dopo (${head})\n\nV = vittoria, S = sconfitta o tempo scaduto (${LIMIT} s). att = attacchi completati del nemico; colpi = colpi subiti.\n\n${lines.join('\n')}\n`);
console.log(`${rows.length} righe → ${out}/compare.json, compare.md`);
