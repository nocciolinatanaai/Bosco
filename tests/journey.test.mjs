import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession, movePlayer, attack, dodge, tickCooldowns, evolve } from '../src/game.js';
import { journey, MEMORY } from '../src/journey.js';
test('guida segue azioni reali, risveglio e conclusione senza bloccare controlli', () => {
  const s = createSession('fighter'); assert.equal(journey(s).id, 'move');
  for (let i = 0; i < 5; i++) movePlayer(s, 1, 0, .05); assert.equal(journey(s).id, 'attack');
  s.x = -5; s.z = 4; attack(s); for (let i = 0; i < 25; i++) tickCooldowns(s, .02);
  assert.equal(journey(s).id, 'dodge'); dodge(s); assert.equal(journey(s).id, 'opening');
  s.enemies[0].hp = 0; assert.equal(journey(s).id, 'echoes');
  s.enemies[1].hp = 0; assert.equal(journey(s).id, 'resonance');
  evolve(s); assert.equal(journey(s).id, 'guardian'); s.cleared = true;
  assert.equal(journey(s).id, 'trail'); s.trail.complete = true; assert.equal(journey(s).id, 'complete'); assert.ok(MEMORY.resonance.body.includes('Liora'));
  assert.equal(journey(createSession('fighter')).id, 'move');
});
