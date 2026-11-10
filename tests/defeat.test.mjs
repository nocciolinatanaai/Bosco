import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession, hurt, dodge, tickCooldowns } from '../src/game.js';
import { defeatMessage } from '../src/defeat.js';
test('il riepilogo conserva il colpo effettivo, non viene sovrascritto da danni evitati', () => {
  const s = createSession('fighter'), source = { name: 'Il Custode Vuoto', kind: 'nova' };
  hurt(s, 32, source); source.kind = 'fracture'; assert.equal(s.lastDamage.kind, 'nova');
  assert.ok(Object.isFrozen(s.lastDamage)); assert.match(defeatMessage(s), /32 PV.*Onda/);
  dodge(s); hurt(s, 26, { name: 'Altro', kind: 'fracture' }); assert.equal(s.lastDamage.kind, 'nova');
  assert.match(defeatMessage(s), /allontanati/i);
});
test('colpo letale registra soltanto la vita rimasta; nuova sessione non conserva la sconfitta', () => {
  const s = createSession('fighter'); s.hp = 7; hurt(s, 26, { name: 'Custode', kind: 'fracture' });
  assert.equal(s.status, 'defeated'); assert.equal(s.lastDamage.amount, 7);
  assert.match(defeatMessage(s), /7 PV.*Frattura/); assert.equal(createSession('fighter').lastDamage, null);
  assert.match(defeatMessage(createSession('fighter')), /Puoi riprovare/);
});
test('riparo riduce il danno registrato e input invalido non sostituisce la causa', () => {
  const s = createSession('tank'); s.shield = 1; hurt(s, 40, { name: 'Eco', kind: 'strike' });
  assert.equal(s.lastDamage.amount, 10); tickCooldowns(s, .05); hurt(s, NaN);
  assert.equal(s.lastDamage.amount, 10); assert.match(defeatMessage(s), /L’eco fissa/);
});
