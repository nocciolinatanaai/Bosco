import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CLASSES, createSession, evolve } from '../src/game.js';
import { MEMORY_TRACES } from '../src/trail.js';
import { CHECKPOINT_KEY, createCheckpointStore, checkpointFromSession, restoreCheckpoint, validateCheckpoint } from '../src/checkpoints.js';
const memory = () => { const values = new Map(); return { values, getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) }; };
const advanced = role => { const s = createSession(role); s.enemies.filter(e => !e.boss).forEach(e => { e.hp = 0; }); evolve(s); return s; };

test('tutte le classi riprendono dalle tappe senza azioni, proiettili o vecchi eventi', () => {
  for (const role of CLASSES) {
    let s = createSession(role.id), restored = restoreCheckpoint(checkpointFromSession(s));
    assert.equal(restored.role.id, role.id); assert.equal(restored.evolved, false);
    s = advanced(role.id); s.hp = 1; s.cooldown = 3; s.action = { stale: true }; s.projectiles.push({ stale: true });
    restored = restoreCheckpoint(checkpointFromSession(s));
    assert.equal(restored.evolved, true); assert.equal(restored.hp, restored.maxHp); assert.equal(restored.action, null); assert.equal(restored.cooldown, 0);
    assert.equal(restored.projectiles.length, 0); assert.equal(restored.events.length, 0); assert.equal(restored.enemies[2].hp, 280);
  }
});
test('pista ripristinata in ordine su un punto sicuro, senza condividere array del salvataggio', () => {
  const s = advanced('ranger'); s.enemies[2].hp = 0; s.cleared = true;
  for (let count = 0; count <= 3; count++) {
    s.trail.found = MEMORY_TRACES.slice(0, count).map(t => t.id);
    const restored = restoreCheckpoint(checkpointFromSession(s));
    assert.equal(restored.cleared, true); assert.equal(restored.trail.found.length, count); assert.equal(restored.trail.complete, count === 3);
    assert.ok(restored.x >= 18 && restored.x <= 39 && restored.z === 7); restored.trail.found.push('other'); assert.equal(s.trail.found.length, count);
  }
});
test('salvataggio minimo: nessuna coordinata, identità personale, credenziale o preferenza audio', () => {
  const s = advanced('mage'); s.secret = 'not-to-store'; s.x = 987;
  assert.deepEqual(Object.keys(checkpointFromSession(s)).sort(), ['autoSave','role','stage','traces','version']);
});
test('schema rigoroso: rifiuta versioni, classi, tappe, tracce e proprietà non supportate', () => {
  const valid = { version: 1, autoSave: true, role: 'fighter', stage: 'arrival', traces: 0 };
  for (const invalid of [null, [], { ...valid, version: 2 }, { ...valid, autoSave: 'true' }, { ...valid, role: '__proto__' }, { ...valid, stage: 'admin' },
    { ...valid, traces: 1 }, { ...valid, traces: NaN }, { ...valid, stage: 'guardian', traces: 4 }, { ...valid, token: 'x' }]) {
    assert.equal(validateCheckpoint(invalid), null); assert.equal(restoreCheckpoint(invalid), null);
  }
  assert.equal(validateCheckpoint(valid).role, 'fighter');
});
test('tappa incoerente o tracce fuori ordine non vengono serializzate', () => {
  const s = createSession('fighter'); s.cleared = true; assert.throws(() => checkpointFromSession(s));
  const advancedState = advanced('fighter'); advancedState.enemies[2].hp = 0; advancedState.cleared = true;
  advancedState.trail.found = ['signature']; assert.throws(() => checkpointFromSession(advancedState));
});
test('storage non scrive al caricamento, conserva file corrotti e cancella soltanto la propria chiave', () => {
  const storage = memory(), store = createCheckpointStore(() => storage); storage.setItem('other', 'keep');
  assert.equal(store.load().status, 'empty'); assert.equal(storage.values.size, 1);
  assert.equal(store.save(createSession('tank')).status, 'ready'); assert.ok(storage.getItem(CHECKPOINT_KEY));
  assert.equal(store.clear().status, 'empty'); assert.equal(storage.getItem('other'), 'keep');
  storage.setItem(CHECKPOINT_KEY, '{broken'); assert.equal(store.load().status, 'invalid'); assert.equal(storage.getItem(CHECKPOINT_KEY), '{broken');
  storage.setItem(CHECKPOINT_KEY, ' '.repeat(2048)); assert.equal(store.load().status, 'invalid');
});
test('errori di lettura, quota e rimozione non interrompono il chiamante', () => {
  const blocked = createCheckpointStore(() => { throw new Error('SecurityError'); });
  assert.equal(blocked.load().status, 'unavailable'); assert.equal(blocked.save(createSession('mage')).status, 'unavailable'); assert.equal(blocked.clear().status, 'unavailable');
  const storage = memory(); storage.setItem = () => { throw new Error('QuotaExceededError'); };
  const full = createCheckpointStore(() => storage); full.load(); assert.equal(full.save(createSession('mage')).status, 'unavailable');
});
test('un cambiamento esterno osservato sospende scrittura o cancellazione finché non si rilegge', () => {
  const storage = memory(), a = createCheckpointStore(() => storage), b = createCheckpointStore(() => storage);
  a.load(); b.load(); a.save(createSession('fighter'));
  assert.equal(b.save(createSession('mage')).status, 'conflict'); assert.equal(b.clear().status, 'conflict');
  assert.equal(b.load().checkpoint.role, 'fighter'); assert.equal(b.clear().status, 'empty');
});

test('disattivare autosalvataggio mantiene la tappa e la preferenza alla riapertura', () => {
  const storage = memory(), store = createCheckpointStore(() => storage); store.load(); store.save(advanced('tank'));
  assert.equal(store.pause().status, 'ready');
  const reopened = createCheckpointStore(() => storage).load(); assert.equal(reopened.checkpoint.autoSave, false);
  assert.equal(reopened.checkpoint.stage, 'awakened'); assert.equal(restoreCheckpoint(reopened.checkpoint).role.id, 'tank');
});
