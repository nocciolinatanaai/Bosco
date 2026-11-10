import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession, evolve, advanceEnemies, tickCooldowns, dodge, drainEvents } from '../src/game.js';
import { GUARDIAN_ATTACKS, prepareEnemyAttack } from '../src/enemy-attacks.js';
import { createTelegraph, updateTelegraph } from '../src/visuals/telegraph.js';
import { createGuardian } from '../src/visuals/actors.js';
import { createMaterials } from '../src/visuals/materials.js';
const ready = () => { const s = createSession('fighter'); s.enemies[0].hp = s.enemies[1].hp = 0; evolve(s);
  const b = s.enemies[2]; b.x = 0; b.z = 0; b.timer = 0; s.x = 0; s.z = 2; drainEvents(s); return [s, b]; };
const run = (s, seconds) => { for (let i = 0; i < Math.round(seconds * 100); i++) { tickCooldowns(s, .01); advanceEnemies(s, .01); } };

test('Frattura mira il giocatore, Onda resta sul Custode, sequenza deterministica', () => {
  const [s, b] = ready(); prepareEnemyAttack(b, s); assert.equal(b.attackKind, 'fracture'); assert.deepEqual([b.aimX, b.aimZ], [s.x, s.z]);
  prepareEnemyAttack(b, s); assert.equal(b.attackKind, 'nova'); assert.deepEqual([b.aimX, b.aimZ], [b.x, b.z]);
  assert.equal(b.radius, 5.2); assert.equal(b.chargeDuration, 1.65); assert.equal(b.recoveryDuration, 2);
  prepareEnemyAttack(b, s); assert.equal(b.attackKind, 'fracture'); assert.equal(b.radius, 3.6);
  assert.ok(GUARDIAN_ATTACKS.every(Object.isFrozen));
});
test('ciclo naturale: evita Frattura, Onda infligge un colpo e lascia due secondi di apertura', () => {
  const [s, b] = ready(); advanceEnemies(s, .01); s.x = 6; run(s, 1.2);
  assert.equal(s.hp, s.maxHp); assert.equal(b.phase, 'recovery');
  s.x = 0; run(s, 2.2); assert.equal(b.attackKind, 'nova'); assert.equal(b.phase, 'windup');
  run(s, 1.7); assert.equal(s.hp, s.maxHp - 32); assert.equal(b.phase, 'recovery');
  const hp = s.hp; run(s, .6); assert.equal(s.hp, hp); assert.ok(b.recovery > 1);
  assert.equal(drainEvents(s).filter(e => e.type === 'enemy-impact' && e.kind === 'nova').length, 1);
});
test('uscire dall’Onda evita il danno: il centro non segue il giocatore', () => {
  const [s, b] = ready(); b.attackCount = 1; prepareEnemyAttack(b, s); s.z = 6;
  run(s, 1.7); assert.equal(s.hp, s.maxHp); assert.deepEqual([b.aimX, b.aimZ], [0, 0]);
});
test('lo scatto evoluto può interrompere Onda prima dell’impatto', () => {
  const [s, b] = ready(); b.attackCount = 1; prepareEnemyAttack(b, s);
  dodge(s, 0, 1); assert.equal(b.phase, 'stagger'); assert.equal(b.windup, 0);
  run(s, .6); assert.equal(drainEvents(s).filter(e => e.type === 'enemy-impact').length, 0);
});
test('cerchio danno e riempimento rispettano il raggio delle due mosse senza ricreare geometrie', () => {
  const [s, b] = ready(), marker = createTelegraph(), geometry = marker.geometry;
  for (let i = 0; i < 3; i++) {
    prepareEnemyAttack(b, s); b.windup = b.chargeDuration / 2; updateTelegraph(marker, b);
    assert.equal(marker.scale.x, b.radius); assert.equal(marker.userData.chargeFill.scale.x, .5);
    assert.equal(marker.userData.novaRing.visible, b.attackKind === 'nova'); assert.equal(marker.geometry, geometry);
    assert.equal(marker.position.x, b.aimX); assert.equal(marker.position.z, b.aimZ);
  }
  b.phase = 'recovery'; updateTelegraph(marker, b); assert.equal(marker.visible, false);
  marker.traverse(n => { if (n.isMesh) { n.geometry.dispose(); n.material.dispose(); } });
});
test('pose del Custode finite per preparazione, impatto e recupero di entrambe le mosse', () => {
  const [s, b] = ready(), model = createGuardian(createMaterials(), true);
  for (let i = 0; i < 2; i++) {
    prepareEnemyAttack(b, s);
    for (const phase of ['windup', 'recovery', 'stagger']) {
      b.phase = phase; b.recovery = b.recoveryDuration;
      model.userData.animate(1, b.chargeDuration / 2, false, true, b); model.updateMatrixWorld(true);
      model.traverse(n => assert.ok(n.matrixWorld.elements.every(Number.isFinite)));
    }
  }
  model.traverse(n => { if (n.isMesh) n.geometry.dispose(); });
});
