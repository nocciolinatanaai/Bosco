// COMBAT-01 — contratti di logica (Tonino). Ogni test isola una regola di docs/COMBAT_PASS_01_ACCEPTANCE.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, cast, attack, dodge, evolve, tickCooldowns, advanceEnemies, drainEvents } from '../src/game.js';
import { restoreCheckpoint, checkpointFromSession } from '../src/checkpoints.js';

const DT = .02;
function step(s, seconds) { for (let t = 0; t < seconds - 1e-9; t += DT) { tickCooldowns(s, DT); advanceEnemies(s, DT); } }
// Custode sbloccato, echi già sconfitti: stessa preparazione di game.test.
function bossFight(role = 'tank') {
  const s = createSession(role);
  for (const e of s.enemies) if (!e.boss) { e.hp = 0; e.phase = 'dead'; }
  assert.equal(evolve(s), true); drainEvents(s);
  const boss = s.enemies.find(e => e.boss);
  return { s, boss };
}
// Scudo d'urto del Tank: interrompe (stagger 1) tutti i nemici entro 4,2 × 1,2.
function shieldBash(s) { s.cooldown = 0; s.action = null; assert.equal(cast(s), true); step(s, .3); }

test('Resistenza: la prima interruzione vale, la seconda no finché il Custode non completa un attacco; il danno passa sempre', () => {
  const { s, boss } = bossFight();
  Object.assign(s, { x: 0, z: -5 }); boss.timer = 0; advanceEnemies(s, DT);
  assert.equal(boss.phase, 'windup'); assert.equal(boss.resolute, false);
  shieldBash(s);
  assert.equal(boss.phase, 'stagger', 'prima perturbazione applicata'); assert.equal(boss.resolute, true);
  assert.ok(drainEvents(s).some(e => e.type === 'enemy-resolute' && e.resolute === true));
  let guard = 0; while (boss.phase !== 'windup' && guard++ < 400) step(s, DT);
  assert.equal(boss.phase, 'windup', 'la carica successiva parte'); assert.equal(boss.resolute, true);
  const hp = boss.hp; s.invulnerable = 0; shieldBash(s);
  assert.equal(boss.phase, 'windup', 'la carica temprata non si interrompe');
  assert.ok(boss.hp < hp, 'il danno passa durante la resistenza');
  const hits = drainEvents(s).filter(e => e.type === 'hit' && e.enemyId === boss.id);
  assert.equal(hits.at(-1).resisted, true);
  guard = 0; while (boss.phase === 'windup' && guard++ < 400) step(s, DT);
  assert.equal(boss.phase, 'recovery'); assert.equal(boss.resolute, false, 'attacco completato: resistenza finita');
  assert.ok(drainEvents(s).some(e => e.type === 'enemy-resolute' && e.resolute === false));
  shieldBash(s); assert.equal(boss.phase, 'stagger', 'dopo l’impatto torna interrompibile');
});

test('Resistenza: interruzione prima della carica. Lo spam di interruzioni non impedisce mai la carica', () => {
  const { s, boss } = bossFight();
  Object.assign(s, { x: 0, z: -5 }); boss.timer = 5; advanceEnemies(s, DT);
  assert.equal(boss.phase, 'pursuit');
  shieldBash(s); assert.equal(boss.phase, 'stagger'); assert.equal(boss.resolute, true, 'stagger in inseguimento: resistenza già attiva');
  // Interruzioni continue: Scudo d'urto appena pronto, la posizione resta nel cerchio.
  let impacts = 0, windups = 0;
  for (let t = 0; t < 8 && boss.hp > 0; t += DT) {
    s.hp = s.maxHp; if (s.cooldown <= 0 && !s.action) cast(s);
    tickCooldowns(s, DT); advanceEnemies(s, DT);
    for (const e of drainEvents(s)) { if (e.type === 'enemy-impact') impacts++; if (e.type === 'enemy-windup') windups++; }
  }
  assert.ok(windups >= 1 && impacts >= 1, `carica avviata e completata nonostante lo spam (cariche ${windups}, impatti ${impacts})`);
});

test('Resistenza: nessuna resistenza permanente (morte, riavvio, checkpoint, cambio area) e nessuna contaminazione fra nemici', () => {
  const { s, boss } = bossFight();
  Object.assign(s, { x: 0, z: -5 }); shieldBash(s); assert.equal(boss.resolute, true);
  // Checkpoint: la resistenza non è nello schema e il ripristino riparte pulito.
  const cp = checkpointFromSession(s); assert.equal(JSON.stringify(cp).includes('resolute'), false);
  const restored = restoreCheckpoint(cp); assert.ok(restored.enemies.every(e => !e.resolute));
  // Riavvio: una sessione nuova non eredita nulla.
  assert.ok(createSession('tank').enemies.every(e => e.resolute === false));
  // Echi normali: mai temprati, si interrompono sempre.
  const plain = createSession('tank'); Object.assign(plain, { x: -5, z: 4.5 });
  const shade = plain.enemies.find(e => e.id === 'shade-a');
  for (let i = 0; i < 2; i++) { shieldBash(plain); assert.equal(shade.phase, 'stagger'); assert.equal(shade.resolute, false); plain.enemies.find(e => e.id === 'shade-a').stagger = 0; }
  // Morte: la resistenza si azzera con l'avversario.
  boss.hp = 1; s.invulnerable = 0; shieldBash(s); assert.equal(boss.hp, 0); assert.equal(boss.resolute, false);
});

test('Resistenza nelle Cave: il Guardiano usa la stessa regola e uscire non trascina la resistenza', async () => {
  const { CAVE_GATE, CAVE_ENTRY } = await import('../src/caves.js');
  const { interactCaves } = await import('../src/game.js');
  const s = restoreCheckpoint({ version: 3, attunement: 'ward', autoSave: false, role: 'tank', stage: 'guardian', traces: 3, garden: { step: 4, area: 'plaza', sentryDefeated: false } });
  Object.assign(s, CAVE_GATE); assert.equal(interactCaves(s, 'enter'), true);
  const warden = s.enemies.find(e => e.type === 'warden'); Object.assign(s, { x: 0, z: -5 });
  shieldBash(s); assert.equal(warden.resolute, true);
  Object.assign(s, CAVE_ENTRY); assert.equal(interactCaves(s, 'leave'), true);
  assert.equal(warden.resolute, false, 'cambio area: nessuna resistenza trascinata');
});
