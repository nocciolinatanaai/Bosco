// COMBAT-01 — contratti di logica (Tonino). Ogni test isola una regola di docs/COMBAT_PASS_01_ACCEPTANCE.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, cast, attack, dodge, evolve, tickCooldowns, advanceEnemies, drainEvents } from '../src/game.js';
import { restoreCheckpoint, checkpointFromSession } from '../src/checkpoints.js';

const DT = .02;
function step(s, seconds) { for (let t = 0; t < seconds - 1e-9; t += DT) { tickCooldowns(s, DT); advanceEnemies(s, DT); } }
// Custode sbloccato, echi già sconfitti: stessa preparazione di game.test.
function bossFight(role = 'tank', opening = false) {
  const s = createSession(role);
  for (const e of s.enemies) if (!e.boss) { e.hp = 0; e.phase = 'dead'; }
  assert.equal(evolve(s), true); drainEvents(s);
  const boss = s.enemies.find(e => e.boss);
  // I contratti della regola corrente partono dallo stato dopo il primo attacco completato;
  // la resistenza iniziale ha i suoi test dedicati in fondo al file.
  if (opening === false) boss.resolute = false;
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
  // La ripresa ricomincia lo scontro: nessuna resistenza acquisita, solo quella iniziale del Custode.
  const restored = restoreCheckpoint(cp); assert.ok(restored.enemies.filter(e => !e.boss).every(e => !e.resolute));
  assert.equal(restored.enemies.find(e => e.boss).resolute, true);
  // Riavvio: una sessione nuova non eredita nulla.
  assert.ok(createSession('tank').enemies.every(e => e.resolute === false), 'prima del risveglio nessuno è resistente');
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

// ── 3/5: Custodia come carica ──
import { attuneArtifact, hurt } from '../src/game.js';
function warded(role = 'ranger') {
  const { s, boss } = bossFight(role); attuneArtifact(s, 'ward'); boss.timer = 99;
  assert.equal(dodge(s), true); assert.equal(hurt(s, 30), 0); // schivata d'impatto
  assert.equal(s.artifact.wardCharge, 6); s.dodgeRemaining = 0; s.invulnerable = 0; drainEvents(s);
  return s;
}
test('Custodia: il prossimo colpo vero entro 6 s è ridotto del 75%, una sola volta', () => {
  const s = warded(); const hp = s.hp;
  assert.equal(hurt(s, 32), 8); assert.equal(s.artifact.wardCharge, 0);
  assert.ok(drainEvents(s).some(e => e.type === 'ward-consumed' && e.raw === 32 && e.amount === 8));
  s.invulnerable = 0; assert.equal(hurt(s, 32), 32, 'secondo colpo pieno'); assert.equal(s.hp, hp - 40);
});
test('Custodia: non si consuma su schivata o invulnerabilità, scade a 6 s, non si accumula', () => {
  let s = warded();
  s.invulnerable = .2; assert.equal(hurt(s, 32), 0); assert.equal(s.artifact.wardCharge, 6, 'invulnerabilità: carica intatta');
  s.invulnerable = 0; s.dashCooldown = 0; s.stamina = 100; dodge(s); hurt(s, 32);
  assert.equal(s.artifact.wardCharge, 6, 'schivata d’impatto durante il recupero: nessuna seconda carica, nessun consumo');
  s = warded(); for (let t = 0; t < 5.9; t += DT) tickCooldowns(s, DT); assert.ok(s.artifact.wardCharge > 0);
  for (let t = 0; t < .2; t += DT) tickCooldowns(s, DT); assert.equal(s.artifact.wardCharge, 0);
  assert.ok(drainEvents(s).some(e => e.type === 'ward-expired')); s.invulnerable = 0; assert.equal(hurt(s, 32), 32, 'scaduta');
});
test('Custodia: lo Scudo d’urto del Tank non spreca la carica; checkpoint e sconfitta la azzerano', () => {
  const s = warded('tank'); s.shield = 1; assert.equal(hurt(s, 32), 8); assert.equal(s.artifact.wardCharge, 6, 'scudo già attivo: nessun doppio sconto, carica conservata');
  s.shield = 0; s.invulnerable = 0; assert.equal(hurt(s, 32), 8); assert.equal(s.artifact.wardCharge, 0);
  const t = warded(); const cp = checkpointFromSession(t); assert.equal(JSON.stringify(cp).includes('ward'), true, 'solo la scelta');
  assert.equal(JSON.stringify(cp).includes('Charge'), false); assert.equal(restoreCheckpoint(cp).artifact.wardCharge, 0);
  t.hp = 1; t.invulnerable = 0; hurt(t, 100); assert.equal(t.status, 'defeated'); assert.equal(t.artifact.wardCharge, 0);
});

// ── 4/5: Impeto ibrido ──
function surged(role, at = { x: 0, z: -6 }) {
  const { s, boss } = bossFight(role); attuneArtifact(s, 'surge'); boss.timer = 99; s.cooldown = 3; s.stamina = 50;
  assert.equal(dodge(s), true); assert.equal(hurt(s, 30), 0);
  assert.equal(s.artifact.surgeCharge, 3); assert.equal(s.stamina, 50 - 30 + 18); assert.ok(Math.abs(s.cooldown - 2.2) < 1e-9, 'anticipo abilità conservato');
  s.dodgeRemaining = 0; s.invulnerable = 0; s.action = null; Object.assign(s, at); drainEvents(s);
  return { s, boss };
}
const resolveAction = (s) => { let g = 0; while (s.action && g++ < 100) tickCooldowns(s, DT); return drainEvents(s); };
test('Impeto: il prossimo attacco base fa ×1,5, consumato alla risoluzione; il successivo è normale', () => {
  const { s, boss } = surged('fighter');
  assert.equal(attack(s), true); assert.equal(s.artifact.surgeCharge > 0, true, 'non consumato all’avvio');
  let ev = resolveAction(s); const hit1 = ev.find(e => e.type === 'hit' && e.enemyId === boss.id);
  assert.equal(hit1.amount, Math.round(16 * 1.5 * 1.5)); assert.ok(hit1.chargeId > 0); assert.equal(s.artifact.surgeCharge, 0);
  assert.equal(ev.filter(e => e.type === 'surge-consumed').length, 1);
  s.comboReset = 0; attack(s); ev = resolveAction(s);
  assert.equal(ev.find(e => e.type === 'hit').amount, Math.round(16 * 1.5)); assert.equal(ev.find(e => e.type === 'hit').chargeId, 0);
});
test('Impeto: va a vuoto ma si consuma; annullato dalla schivata non si consuma; scade a 3 s; l’abilità non lo usa', () => {
  let { s } = surged('fighter', { x: 0, z: 8 });
  attack(s); let ev = resolveAction(s);
  assert.equal(s.artifact.surgeCharge, 0); assert.ok(ev.some(e => e.type === 'miss' && e.chargeId > 0), 'miss caricato');
  assert.equal(ev.some(e => e.type === 'hit' && e.chargeId), false, 'nessun colpo caricato a segno');
  ({ s } = surged('fighter')); attack(s); s.dashCooldown = 0; s.stamina = 100; assert.equal(dodge(s), true);
  assert.equal(s.action, null); assert.ok(s.artifact.surgeCharge > 0, 'annullato prima della risoluzione: carica intatta');
  ({ s } = surged('fighter')); s.cooldown = 0; cast(s); resolveAction(s); assert.ok(s.artifact.surgeCharge > 0, 'l’abilità non consuma');
  ({ s } = surged('fighter')); for (let t = 0; t < 3.05; t += DT) tickCooldowns(s, DT);
  assert.equal(s.artifact.surgeCharge, 0); assert.ok(drainEvents(s).some(e => e.type === 'surge-expired'));
});
test('Impeto a distanza: il proiettile lanciato conserva il danno calcolato; se si perde la carica è usata ma non a segno', () => {
  let { s, boss } = surged('ranger', { x: 0, z: 0 });
  attack(s); let ev = resolveAction(s);
  assert.equal(s.artifact.surgeCharge, 0, 'consumata al lancio'); assert.equal(s.projectiles[0].damage, 15 * 1.5);
  let g = 0; while (s.projectiles.length && g++ < 200) tickCooldowns(s, DT); ev = ev.concat(drainEvents(s));
  const landed = ev.find(e => e.type === 'hit' && e.chargeId);
  assert.equal(landed.amount, Math.round(15 * 1.5 * 1.5));
  ({ s, boss } = surged('ranger', { x: 0, z: 2 }));
  attack(s); resolveAction(s); assert.equal(s.projectiles.length, 1); boss.hp = 0; boss.phase = 'dead';
  g = 0; while (s.projectiles.length && g++ < 200) tickCooldowns(s, DT); ev = drainEvents(s);
  assert.equal(ev.some(e => e.type === 'hit' && e.chargeId), false, 'proiettile perso: nessun colpo caricato contato');
});
test('Impeto: nessun doppio bonus. La falciata a più bersagli usa una sola carica; l’attacco in coda è normale', () => {
  const { s, boss } = surged('fighter');
  const shade = s.enemies.find(e => e.id === 'shade-a'); Object.assign(shade, { hp: 500, maxHp: 500, phase: 'idle', x: 1, z: -8.2 });
  s.combo = 2; s.comboReset = 1; attack(s); assert.equal(s.action.combo, 3);
  s.action.duration = s.action.windup + .1; s.inputBuffer = 0; tickCooldowns(s, s.action.windup);
  let ev = drainEvents(s); while (s.action) { tickCooldowns(s, DT); ev = ev.concat(drainEvents(s)); }
  const charged = ev.filter(e => e.type === 'hit' && e.chargeId);
  assert.equal(ev.filter(e => e.type === 'surge-consumed').length, 1);
  assert.equal(new Set(charged.map(e => e.chargeId)).size, 1, 'stessa carica per l’intera azione');
  assert.ok(charged.some(e => e.enemyId === boss.id) && charged.some(e => e.enemyId === shade.id), 'due bersagli, un’azione');
  s.comboReset = 0; attack(s); ev = resolveAction(s); assert.equal(ev.some(e => e.type === 'hit' && e.chargeId), false);
});

// ── R1 (revisione Codex): esito terminale unico per i proiettili caricati ──
import { SURGE_OUTCOME_TEXT } from '../src/artifacts.js';
const outcomes = (ev) => ev.filter((e) => e.type === 'surge-outcome');
function flyAll(s) { let ev = [], g = 0; while (s.projectiles.length && g++ < 300) { tickCooldowns(s, DT); ev = ev.concat(drainEvents(s)); } return ev; }
test('R1: carica Ranger persa perché il bersaglio muore → un solo esito «lost/target-lost», feedback A VUOTO', () => {
  const { s, boss } = surged('ranger', { x: 0, z: 2 });
  attack(s); let ev = resolveAction(s);
  const id = ev.find((e) => e.type === 'surge-consumed').id;
  assert.equal(s.projectiles.length, 1); assert.equal(outcomes(ev).length, 0, 'proiettile in volo: ancora nessun esito, non è un miss');
  boss.hp = 0; boss.phase = 'dead';
  ev = flyAll(s);
  assert.deepEqual(outcomes(ev).map((e) => [e.chargeId, e.outcome, e.reason]), [[id, 'lost', 'target-lost']]);
  assert.ok(ev.some((e) => e.type === 'projectile-lost' && e.chargeId === id && e.reason === 'target-lost'));
  assert.equal(ev.some((e) => e.type === 'hit' && e.chargeId), false);
  assert.equal(SURGE_OUTCOME_TEXT[outcomes(ev)[0].outcome], 'A VUOTO');
  for (let i = 0; i < 20; i++) tickCooldowns(s, DT); assert.equal(outcomes(drainEvents(s)).length, 0, 'nessun esito duplicato');
});
test('R1: scadenza, copertura, cambio area e sconfitta danno ciascuno un esito con la sua ragione', async () => {
  // Scadenza.
  let { s } = surged('ranger', { x: 0, z: 2 }); attack(s); resolveAction(s); s.projectiles[0].life = .01;
  assert.deepEqual(outcomes(flyAll(s)).map((e) => [e.outcome, e.reason]), [['lost', 'expired']]);
  // Copertura del Giardino: proiettile caricato che attraversa una colonna.
  ({ s } = surged('ranger')); s.area = 'garden';
  const sentry = { id: 'garden-target', name: 'bersaglio', area: 'garden', x: -4, z: 0, hp: 100, maxHp: 100, phase: 'idle', stagger: 0, hitFlash: 0 }; s.enemies.push(sentry);
  s.projectiles.push({ id: 999, x: -4, z: -5.4, targetId: sentry.id, speed: 18, life: 1.6, delay: 0, damage: 30, empowered: false, echo: false, style: 'bow', chargeId: 77 });
  let ev = flyAll(s);
  assert.deepEqual(outcomes(ev).map((e) => [e.chargeId, e.outcome, e.reason]), [[77, 'lost', 'blocked']]);
  assert.ok(ev.some((e) => e.type === 'projectile-blocked' && e.chargeId === 77));
  // Sconfitta con proiettile in volo.
  ({ s } = surged('ranger', { x: 0, z: 2 })); attack(s); resolveAction(s); s.invulnerable = 0; s.hp = 1; hurt(s, 50);
  assert.deepEqual(outcomes(drainEvents(s)).map((e) => [e.outcome, e.reason]), [['lost', 'defeated']]);
  // Cambio area (Cave → sentiero) con proiettile in volo: annullato, ragione esplicita.
  const { CAVE_GATE, CAVE_ENTRY } = await import('../src/caves.js');
  const { interactCaves } = await import('../src/game.js');
  const c = restoreCheckpoint({ version: 3, attunement: 'surge', autoSave: false, role: 'ranger', stage: 'guardian', traces: 3, garden: { step: 4, area: 'plaza', sentryDefeated: false } });
  Object.assign(c, CAVE_GATE); interactCaves(c, 'enter'); Object.assign(c, CAVE_ENTRY); drainEvents(c);
  const warden = c.enemies.find((e) => e.type === 'warden');
  c.projectiles.push({ id: 998, x: 0, z: 11, targetId: warden.id, speed: 18, life: 1.6, delay: 0, damage: 30, empowered: false, echo: false, style: 'bow', chargeId: 55 });
  assert.equal(interactCaves(c, 'leave'), true);
  ev = drainEvents(c);
  assert.deepEqual(outcomes(ev).map((e) => [e.chargeId, e.outcome, e.reason]), [[55, 'lost', 'area-change']]);
  assert.equal(c.projectiles.length, 0);
});
test('R1: colpo già risolto non genera un secondo esito; melee a segno/a vuoto hanno un esito ciascuno', () => {
  let { s } = surged('ranger', { x: 0, z: 0 }); attack(s); let ev = resolveAction(s).concat(flyAll(s));
  assert.deepEqual(outcomes(ev).map((e) => [e.outcome, e.reason]), [['hit', 'hit']]);
  ({ s } = surged('fighter')); attack(s); ev = resolveAction(s);
  assert.deepEqual(outcomes(ev).map((e) => e.outcome), ['hit']);
  ({ s } = surged('fighter', { x: 0, z: 8 })); attack(s); ev = resolveAction(s);
  assert.deepEqual(outcomes(ev).map((e) => [e.outcome, e.reason]), [['miss', 'no-target']]);
});

// ── Decisione Assassino: resistenza iniziale sul solo Custode introduttivo ──
test('Resistenza iniziale: armata al risveglio, visibile prima del primo colpo, anche dopo riavvio e ripresa', () => {
  const { s, boss } = bossFight('assassin', true);
  assert.equal(boss.resolute, true, 'armata all’ingaggio, prima di qualunque colpo del giocatore');
  const fresh = createSession('assassin'); for (const e of fresh.enemies) if (!e.boss) { e.hp = 0; e.phase = 'dead'; }
  evolve(fresh); assert.equal(fresh.enemies.find((e) => e.boss).resolute, true, 'riavvio');
  const resumed = restoreCheckpoint({ version: 4, attunement: null, autoSave: false, role: 'assassin', stage: 'awakened', traces: 0, garden: { step: 0, area: 'plaza', sentryDefeated: false }, caves: { step: 0, inside: false, wardenDefeated: false } });
  assert.equal(resumed.enemies.find((e) => e.boss).resolute, true, 'ripresa da checkpoint');
  assert.equal(JSON.stringify(checkpointFromSession(resumed)).includes('resolute'), false, 'non salvata');
  assert.ok(s.enemies.filter((e) => !e.boss).every((e) => !e.resolute), 'solo il Custode');
  assert.equal(createSession('assassin').enemies.find((e) => e.boss).resolute, false, 'Custode ancora sigillato: nessuna resistenza');
});
test('Resistenza iniziale: il primo colpo non interrompe ma fa danno; dopo il primo attacco completato torna la regola normale', () => {
  const { s, boss } = bossFight('tank', true);
  Object.assign(s, { x: 0, z: -5 }); boss.timer = 0; advanceEnemies(s, DT); assert.equal(boss.phase, 'windup');
  const hp = boss.hp; shieldBash(s);
  assert.equal(boss.phase, 'windup', 'la prima carica non si interrompe'); assert.ok(boss.hp < hp, 'danno valido');
  let g = 0; while (boss.phase === 'windup' && g++ < 400) { s.hp = s.maxHp; step(s, DT); }
  assert.equal(boss.resolute, false, 'primo attacco completato: resistenza iniziale finita');
  g = 0; while (boss.phase !== 'idle' && boss.phase !== 'pursuit' && g++ < 400) { s.hp = s.maxHp; step(s, DT); }
  shieldBash(s); assert.equal(boss.phase, 'stagger', 'ora la prima interruzione vale'); assert.equal(boss.resolute, true, 'e riarma la regola corrente');
});
test('Resistenza iniziale: Guardiano delle Cave ed echi invariati', async () => {
  const { CAVE_GATE } = await import('../src/caves.js');
  const { interactCaves } = await import('../src/game.js');
  const c = restoreCheckpoint({ version: 3, attunement: null, autoSave: false, role: 'tank', stage: 'guardian', traces: 3, garden: { step: 4, area: 'plaza', sentryDefeated: false } });
  Object.assign(c, CAVE_GATE); interactCaves(c, 'enter');
  assert.equal(c.enemies.find((e) => e.type === 'warden').resolute, false);
});
