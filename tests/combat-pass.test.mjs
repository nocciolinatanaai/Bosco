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

// ── 2/5: provocazione, portata 16 e Frattura al posto dell'Onda oltre 6 ──
import { guardianAttackFor, GUARDIAN_ATTACKS } from '../src/enemy-attacks.js';
function windupAt(s, boss, x, z) {
  Object.assign(s, { x, z }); boss.phase = 'idle'; boss.timer = 0; boss.stagger = 0; drainEvents(s);
  advanceEnemies(s, DT); return drainEvents(s).find(e => e.type === 'enemy-windup');
}
function finishAttack(s, boss) { s.invulnerable = 0; s.dodgeRemaining = 0; let g = 0; while (boss.phase !== 'idle' && g++ < 500) { s.hp = s.maxHp; advanceEnemies(s, DT); } return drainEvents(s); }

test('Sequenza vicino→lontano→vicino: una sola progressione del contatore (caso mirato di Codex, contatore 1)', () => {
  const { s, boss } = bossFight('ranger');
  boss.attackCount = 1; boss.provoked = 8;
  let w = windupAt(s, boss, 0, 1); // lontano: 10 unità, tocca all'Onda
  assert.equal(w.kind, 'fracture'); assert.equal(w.reach, true); assert.equal(boss.attackCount, 2, 'un solo passo, non due');
  finishAttack(s, boss); boss.provoked = 8;
  w = windupAt(s, boss, 0, -5); // vicino: 4 unità
  assert.equal(w.kind, 'fracture', 'la prossima mossa vicina resta la Frattura'); assert.equal(boss.attackCount, 3); assert.equal(w.reach, false);
  finishAttack(s, boss); boss.provoked = 8;
  w = windupAt(s, boss, 0, -5); assert.equal(w.kind, 'nova'); assert.equal(boss.attackCount, 4);
  assert.deepEqual([0, 1, 2, 3].map(n => guardianAttackFor(n, 4).id), ['fracture', 'nova', 'fracture', 'nova']);
  assert.deepEqual([0, 1, 2, 3].map(n => guardianAttackFor(n, 6.01).id), ['fracture', 'fracture', 'fracture', 'fracture']);
});

test('Soglie 6/16: senza provocazione nessun attacco oltre 6 e riposo oltre 14; con provocazione fino a 16', () => {
  const { s, boss } = bossFight('ranger');
  assert.equal(windupAt(s, boss, 0, 1), undefined, '10 unità, non provocato: nessun attacco');
  Object.assign(boss, { x: 0, z: -9 }); Object.assign(s, { x: 0, z: 6 }); advanceEnemies(s, DT); assert.equal(boss.phase, 'idle', '15 unità, non provocato: riposo');
  boss.provoked = 8; Object.assign(boss, { x: 0, z: -9 });
  assert.equal(windupAt(s, boss, 0, 6.9)?.reach, true, '15,9: risponde');
  finishAttack(s, boss); boss.provoked = 8; Object.assign(boss, { x: 0, z: -9 });
  assert.equal(windupAt(s, boss, 0, 7.2), undefined, '16,2: fuori portata, insegue soltanto');
  assert.equal(boss.phase, 'pursuit');
});

test('Provocazione: un colpo valido la avvia per 8 s, scade, resta ferma fuori area', () => {
  const { s, boss } = bossFight('ranger');
  Object.assign(s, { x: 0, z: 5 }); boss.timer = 99; s.cooldown = 0;
  attack(s); let g = 0; while (boss.provoked === 0 && g++ < 200) { tickCooldowns(s, DT); }
  assert.ok(boss.provoked > 7.9, 'freccia a segno a 14 unità: provocato');
  // Fuori area la simulazione del Custode è congelata (come in pausa, quando il runtime non la chiama).
  const frozen = boss.provoked; s.area = 'caves'; for (let t = 0; t < 1; t += DT) advanceEnemies(s, DT);
  assert.equal(boss.provoked, frozen); s.area = 'plaza';
  for (let t = 0; t < 8.05; t += DT) { s.hp = s.maxHp; advanceEnemies(s, DT); }
  assert.equal(boss.provoked, 0, 'scaduta dopo 8 s');
  const fresh = restoreCheckpoint(checkpointFromSession(s)); assert.ok(fresh.enemies.every(e => !e.provoked), 'non salvata');
});

test('Telegraph della Frattura lontana: centro sul giocatore, raggio, durata e danno uguali all’impatto reale', () => {
  const { s, boss } = bossFight('mage');
  boss.attackCount = 1; boss.provoked = 8;
  const w = windupAt(s, boss, 2, 2);
  assert.deepEqual([w.x, w.z, w.radius, w.duration, w.damage], [2, 2, GUARDIAN_ATTACKS[0].radius, GUARDIAN_ATTACKS[0].windup, GUARDIAN_ATTACKS[0].damage]);
  let impact, hurtEv, t = 0; s.invulnerable = 0;
  while (!impact && t < 2) { advanceEnemies(s, DT); t += DT; for (const e of drainEvents(s)) { if (e.type === 'enemy-impact') impact = e; if (e.type === 'hurt') hurtEv = e; } }
  assert.ok(Math.abs(t - w.duration) < DT * 1.5, 'impatto alla fine della carica annunciata');
  assert.deepEqual([impact.x, impact.z, impact.radius, impact.kind, impact.reach], [w.x, w.z, w.radius, 'fracture', true]);
  assert.equal(hurtEv.amount, w.damage, 'fermo nel cerchio: danno pieno');
  // Uscire dal cerchio annunciato evita il colpo.
  boss.provoked = 8; finishAttack(s, boss); s.invulnerable = 0;
  const w2 = windupAt(s, boss, 2, 2); assert.equal(w2.kind, 'fracture'); s.x = 2 + w2.radius + .1; const hp = s.hp;
  finishAttack(s, boss); assert.equal(s.hp, hp);
});
