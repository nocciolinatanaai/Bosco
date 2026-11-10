import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CLASSES, createSession, selectedEnemy, setTarget, attack, cast, dodge, hurt, movePlayer, tickCooldowns, advanceEnemies, evolve, drainEvents } from '../src/game.js';
const advance = (s, seconds, enemies = false) => { for (let i = 0; i < Math.round(seconds * 100); i++) { tickCooldowns(s, .01); if (enemies) advanceEnemies(s, .01); } };
const close = (id = 'fighter') => { const s = createSession(id); s.x = -5; s.z = 4; return s; };

test('sei classi immutabili e sessioni indipendenti', () => {
  assert.equal(new Set(CLASSES.map(r => r.id)).size, 6); assert.throws(() => createSession('unknown'));
  assert.ok(Object.isFrozen(CLASSES)); assert.ok(CLASSES.every(Object.isFrozen));
  const a = createSession('tank'), b = createSession('tank'); hurt(a, 10); assert.equal(b.hp, 160);
});
test('impatto dopo preparazione, danno una volta, attacco base indipendente dal cooldown abilità', () => {
  const s = close(); assert.equal(attack(s), true); assert.equal(s.enemies[0].hp, 52);
  advance(s, .1); assert.equal(s.enemies[0].hp, 52); advance(s, .1); assert.equal(s.enemies[0].hp, 36);
  advance(s, .25); assert.equal(s.enemies[0].hp, 36); assert.equal(s.action, null);
  assert.equal(cast(s), true); assert.equal(cast(s), false); advance(s, .8);
  assert.ok(s.cooldown > 0); assert.equal(attack(s), true);
});
test('buffer di fine recupero concatena la combo, senza accodare spam iniziale', () => {
  const s = close(); s.enemies[0].hp = 500;
  attack(s); assert.equal(attack(s), false); assert.equal(s.inputBuffer, 0);
  advance(s, .25); attack(s); assert.ok(s.inputBuffer > 0); advance(s, .16);
  assert.equal(s.action.combo, 2); advance(s, .25); attack(s); advance(s, .15);
  assert.equal(s.action.combo, 3); advance(s, .45);
  assert.equal(drainEvents(s).filter(e => e.type === 'hit').length, 3);
  advance(s, 1.2); attack(s); assert.equal(s.action.combo, 1);
});
test('il cono melee resta orientato alla partenza: un bersaglio passato dietro evita il colpo', () => {
  const s = close(); attack(s); s.enemies[0].z = 6; advance(s, .2); assert.equal(s.enemies[0].hp, 52);
});
test('ranger: freccia con tempo di viaggio, un solo impatto e nessun colpo su bersaglio morto', () => {
  const s = createSession('ranger'); s.x = -5; s.z = 10; attack(s); advance(s, .23);
  assert.equal(s.enemies[0].hp, 52); assert.equal(s.projectiles.length, 1);
  advance(s, .6); assert.equal(s.enemies[0].hp, 37); assert.equal(s.projectiles.length, 0);
  attack(s); advance(s, .23); s.enemies[0].hp = 0; advance(s, 2);
  assert.equal(s.projectiles.length, 0); assert.equal(s.enemies[0].hp, 0);
});
test('Mago colpisce nel punto mirato e consente di uscire dall’area durante la preparazione', () => {
  const s = createSession('mage'); s.x = -5; s.z = 10; cast(s);
  s.enemies[1].x = -4; s.enemies[1].z = 2; advance(s, .5);
  assert.equal(s.enemies[0].hp, 20); assert.equal(s.enemies[1].hp, 33);
  const moved = createSession('mage'); moved.x = -5; moved.z = 10; cast(moved); moved.enemies[0].x = -12;
  advance(moved, .5); assert.equal(moved.enemies[0].hp, 52);
});
test('Guaritore cura all’impatto entro il massimo, Tank interrompe la carica e riduce danni', () => {
  const s = close('healer'); hurt(s, 30); cast(s); assert.equal(s.hp, 70); advance(s, .3); assert.equal(s.hp, 92);
  advance(s, 5); cast(s); advance(s, .3); assert.equal(s.hp, 100);
  const t = close('tank'); t.enemies[0].phase = 'windup'; t.enemies[0].windup = .7; cast(t); advance(t, .3);
  assert.equal(t.enemies[0].phase, 'stagger'); assert.equal(t.enemies[0].windup, 0);
  assert.equal(hurt(t, 40), 10); assert.equal(t.hp, 150);
});
test('Assassino premia l’interruzione della carica con un critico', () => {
  const s = close('assassin'); s.enemies[0].hp = 100; s.enemies[0].phase = 'windup'; cast(s); advance(s, .2);
  assert.equal(s.enemies[0].hp, 40); assert.ok(drainEvents(s).some(e => e.type === 'hit' && e.critical));
});
test('schivata costa vigore, annulla il colpo non partito e protegge solo nella sua finestra', () => {
  const s = close(); attack(s); assert.equal(dodge(s, 1, 0), true); assert.equal(s.stamina, 70); assert.equal(s.action, null);
  assert.equal(dodge(s), false); assert.equal(hurt(s, 20), 0); advance(s, .19);
  assert.equal(hurt(s, 20), 20); assert.equal(s.enemies[0].hp, 52);
  advance(s, .5); s.stamina = 29; assert.equal(dodge(s), false);
});
test('vigore rigenera dopo ritardo, non supera 100, input non finiti non corrompono stato', () => {
  const s = createSession('fighter'); dodge(s); advance(s, .7); assert.equal(s.stamina, 70);
  advance(s, 3); assert.equal(s.stamina, 100); assert.equal(dodge(s, NaN, 0), false);
  assert.equal(movePlayer(s, NaN, 1, .05), false); assert.equal(movePlayer(s, 1, 0, .05, Infinity), false);
  assert.equal(hurt(s, NaN), 0); assert.ok(Number.isFinite(s.x));
});
test('movimento senza bonus diagonale, limiti e accesso al corridoio senza teletrasporto', () => {
  const a = createSession('fighter'), b = createSession('fighter');
  movePlayer(a, 1, 0, .05); movePlayer(b, 1, 1, .05);
  assert.ok(Math.abs(Math.hypot(b.x, b.z - 12) - a.x) < 1e-8);
  a.x = 17.95; a.z = 0; movePlayer(a, 1, 0, .05); assert.equal(a.x, 18); assert.equal(a.z, 0);
  a.z = 7; movePlayer(a, 1, 0, .05); assert.ok(a.x > 18); assert.equal(a.z, 7);
  for (let i = 0; i < 300; i++) movePlayer(a, 1, 1, .05); assert.ok(a.x <= 39 && a.z <= 8.8);
});
test('carica nemica fissa il punto: uscire dal cerchio evita danno, rimanere riceve un solo colpo', () => {
  const s = close(); s.enemies[0].timer = 0; advanceEnemies(s, .01);
  const e = s.enemies[0]; assert.equal(e.phase, 'windup'); const aim = [e.aimX, e.aimZ];
  s.x += 5; advance(s, 1, true); assert.equal(s.hp, s.maxHp); assert.deepEqual([e.aimX, e.aimZ], aim); assert.equal(e.phase, 'recovery');
  const still = close(); still.enemies[0].timer = 0; advance(still, 1, true); assert.equal(still.hp, 108);
  advance(still, .4, true); assert.equal(still.hp, 108);
});
test('sconfitta ferma abilità, attacchi, nemici e progressione', () => {
  const s = createSession('healer'); hurt(s, 1000); const before = s.time;
  assert.equal(s.status, 'defeated'); assert.equal(attack(s), false); assert.equal(cast(s), false); assert.equal(dodge(s), false);
  assert.equal(tickCooldowns(s, .05), 0); advanceEnemies(s, .05); assert.equal(s.time, before); assert.equal(evolve(s), false);
});
test('risveglio dopo gli echi, una volta, con danno aumentato e vita ripristinata', () => {
  const s = close(); assert.equal(evolve(s), false); s.enemies.forEach(e => { e.hp = 0; });
  assert.equal(evolve(s), true); assert.equal(s.maxHp, 156); assert.equal(evolve(s), false);
  s.enemies[0].hp = 100; cast(s); advance(s, .3); assert.equal(s.enemies[0].hp, 46);
});
test('delta limitato e coda eventi drenabile e limitata', () => {
  const s = close(); cast(s); assert.equal(tickCooldowns(s, 100), .05);
  assert.ok(Math.abs(s.cooldown - (s.role.cooldown - .05)) < 1e-9);
  assert.equal(tickCooldowns(s, NaN), 0); assert.equal(tickCooldowns(s, -1), 0);
  for (let i = 0; i < 100; i++) { s.action = null; attack(s); }
  assert.equal(s.events.length, 80); assert.equal(drainEvents(s).length, 80); assert.equal(s.events.length, 0);
});

test('abilità premuta durante combo parte nel primo recupero libero e lo scatto svuota la coda', () => {
  const s = close(); attack(s); assert.equal(cast(s), true); assert.equal(s.cooldown, 0);
  advance(s, .41); assert.equal(s.action.kind, 'skill'); assert.ok(s.cooldown > 0); assert.equal(s.skillBuffer, 0);
  const t = close(); attack(t); cast(t); dodge(t); assert.equal(t.skillBuffer, 0); advance(t, .7); assert.equal(t.action, null);
});

test('Custode sigillato: non insegue, non è selezionabile e non subisce danno ad area', () => {
  const s = createSession('mage'), boss = s.enemies[2]; s.x = boss.x; s.z = boss.z + 1;
  s.enemies[0].hp = s.enemies[1].hp = 0;
  assert.equal(setTarget(s, boss.id), false); assert.equal(selectedEnemy(s), null);
  const original = [boss.x, boss.z, boss.hp]; cast(s); advance(s, 1, true);
  assert.deepEqual([boss.x, boss.z, boss.hp], original); assert.equal(boss.phase, 'idle');
});
test('liberare gli echi apre il risveglio una sola volta, prima del Custode', () => {
  const s = close(); s.enemies[1].hp = 0; s.enemies[0].hp = 1; attack(s); advance(s, .5);
  assert.equal(s.resonanceReady, true); assert.equal(s.cleared, false);
  assert.equal(drainEvents(s).filter(e => e.type === 'resonance-ready').length, 1);
  assert.equal(evolve(s), true); assert.equal(s.enemies[2].sealed, false); assert.equal(evolve(s), false);
});
test('Passo di risonanza colpisce al punto di partenza una volta e resta vincolato al vigore', () => {
  const s = createSession('fighter'); s.enemies[0].hp = s.enemies[1].hp = 0; evolve(s);
  const boss = s.enemies[2]; s.x = boss.x; s.z = boss.z + 2; const hp = boss.hp;
  assert.equal(dodge(s, 1, 0), true); assert.equal(boss.hp, hp - 27); assert.ok(boss.stagger > 0);
  advance(s, .3); assert.equal(boss.hp, hp - 27); assert.equal(dodge(s), false);
  advance(s, .4); s.stamina = 29; assert.equal(dodge(s), false); assert.equal(boss.hp, hp - 27);
});

test('conclusione emessa una sola volta dopo il Custode, non dopo i due echi', () => {
  const s = createSession('fighter'); s.enemies[0].hp = s.enemies[1].hp = 0;
  evolve(s); drainEvents(s); const boss = s.enemies[2]; boss.hp = 1; s.x = boss.x; s.z = boss.z + 2;
  attack(s); for (let i = 0; i < 30; i++) tickCooldowns(s, .02);
  assert.equal(s.cleared, true); assert.equal(drainEvents(s).filter(e => e.type === 'cleared').length, 1);
  attack(s); for (let i = 0; i < 30; i++) tickCooldowns(s, .02);
  assert.equal(drainEvents(s).filter(e => e.type === 'cleared').length, 0);
});
