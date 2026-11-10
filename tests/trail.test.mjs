import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createSession, evolve, dodge, tickCooldowns, drainEvents } from '../src/game.js';
import { activeTrace, resonateTrail, MEMORY_TRACES } from '../src/trail.js';
import { createMemoryTrail } from '../src/visuals/memory-trail.js';
const ready = (role = 'fighter') => { const s = createSession(role); s.enemies.forEach(e => { e.hp = 0; }); evolve(s); s.cleared = true; return s; };
test('tracce accessibili solo dopo risveglio e vittoria, senza dati condivisi fra sessioni', () => {
  const s = createSession('fighter'); assert.equal(activeTrace(s), null); s.cleared = true; assert.equal(activeTrace(s), null);
  const a = ready(), b = ready(); a.trail.found.push('departure'); assert.equal(b.trail.found.length, 0);
  a.status = 'defeated'; assert.equal(activeTrace(a), null); assert.ok(MEMORY_TRACES.every(Object.isFrozen));
});
test('risonanza ordina i segni, richiede vicinanza e non duplica il premio finale', () => {
  const s = ready(); s.x = MEMORY_TRACES[1].x; s.z = 7; assert.equal(resonateTrail(s), null);
  s.x = NaN; assert.equal(resonateTrail(s), null);
  for (const trace of MEMORY_TRACES) { s.x = trace.x; s.z = trace.z; const result = resonateTrail(s); assert.equal(result.id, trace.id); }
  assert.equal(s.trail.complete, true); assert.equal(activeTrace(s), null); assert.equal(resonateTrail(s), null); assert.equal(s.trail.found.length, 3);
});
test('tutte le classi possono usare lo scatto reale per attivare le tre tracce; vigore e recupero restano validi', () => {
  for (const role of ['tank','fighter','assassin','mage','ranger','healer']) {
    const s = ready(role);
    for (const trace of MEMORY_TRACES) {
      s.x = trace.x; s.z = trace.z; assert.equal(dodge(s, 1, 0), true);
      assert.equal(dodge(s, 1, 0), false); // Same instant cannot collect another trace.
      for (let i = 0; i < 70; i++) tickCooldowns(s, .02);
    }
    assert.equal(s.trail.complete, true); const events = drainEvents(s).filter(e => e.type === 'trail-progress');
    assert.equal(events.length, 3); assert.equal(events.filter(e => e.complete).length, 1);
  }
});
test('scatto senza risorse non attiva la traccia e il corridoio conserva i propri limiti', () => {
  const s = ready(); s.x = 38.5; s.z = 7; s.trail.found = ['departure', 'return']; s.stamina = 29;
  assert.equal(dodge(s, 1, 0), false); assert.equal(s.trail.complete, false);
  s.stamina = 30; dodge(s, 1, 0); for (let i = 0; i < 30; i++) tickCooldowns(s, .02);
  assert.equal(s.trail.complete, true); assert.ok(s.x <= 39 && s.z >= 5.2 && s.z <= 8.8);
});
test('vista delle tracce nascosta prima della vittoria e riutilizzata senza aggiungere nodi a ogni frame', () => {
  const scene = new THREE.Scene(), view = createMemoryTrail(scene), s = createSession('fighter');
  view.update(s, 0, false); assert.equal(view.root.visible, false); const count = view.root.children.length;
  s.evolved = s.cleared = true;
  for (let i = 0; i < 20; i++) view.update(s, i / 10, i % 2 === 0);
  assert.equal(view.root.visible, true); assert.equal(view.root.children.length, count); view.root.updateMatrixWorld(true);
  view.root.traverse(n => assert.ok(n.matrixWorld.elements.every(Number.isFinite)));
  view.dispose(); assert.equal(scene.children.length, 0);
});
