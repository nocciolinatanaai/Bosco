import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { CLASSES, createSession, interactGarden, movePlayer, cast, attack, tickCooldowns, advanceEnemies, drainEvents, selectedEnemy, setTarget } from '../src/game.js';
import { restoreCheckpoint, checkpointFromSession, validateCheckpoint, createCheckpointStore, CHECKPOINT_KEY } from '../src/checkpoints.js';
import { GARDEN_COVER, blockedByGardenCover, prepareBeam, beamHits, createSentry, gardenObjective } from '../src/garden.js';
import { createMaterials } from '../src/visuals/materials.js';
import { createGardenWorld } from '../src/visuals/garden.js';
import { createBeamTelegraph, updateTelegraph } from '../src/visuals/telegraph.js';

const old = role => ({ version: 1, autoSave: false, role, stage: 'guardian', traces: 3 });
function ready(role = 'ranger') { return restoreCheckpoint(old(role)); }
function garden(role = 'ranger') { const s = ready(role); assert.equal(interactGarden(s, 'enter'), true); return s; }
function step(s, seconds, enemies = false) {
  for (let left = seconds; left > 1e-8; left -= .02) { const dt = Math.min(.02, left); tickCooldowns(s, dt); if (enemies) advanceEnemies(s, dt); }
}

test('accesso richiede primo episodio e tre tracce; avvicinarsi non cambia area senza interazione', () => {
  const s = createSession('tank'); s.x = 38.5; s.z = 7;
  assert.equal(interactGarden(s, 'enter'), false); assert.equal(s.area, 'plaza');
  const t = ready(); t.x = 0; assert.equal(interactGarden(t, 'enter'), false);
  assert.equal(gardenObjective(t).id, 'enter'); t.x = 38.5;
  assert.equal(interactGarden(t, 'enter'), true); assert.equal(t.area, 'garden');
  assert.equal(t.garden.step, 1); assert.equal(t.enemies.length, 4);
});

test('sei classi completano recupero/segnale/ritorno senza uccisione obbligatoria o premio ripetuto', () => {
  for (const role of CLASSES) {
    const s = garden(role.id), hp = s.hp; drainEvents(s);
    assert.equal(interactGarden(s, 'compass'), false);
    for (let i = 0; i < 82; i++) movePlayer(s, 0, -1, .05);
    assert.equal(interactGarden(s, 'compass'), true); assert.equal(interactGarden(s, 'compass'), false);
    assert.equal(s.garden.step, 2); assert.equal(interactGarden(s, 'signal'), false);
    for (let i = 0; i < 82; i++) movePlayer(s, 0, 1, .05);
    assert.equal(interactGarden(s, 'signal'), true); assert.equal(interactGarden(s, 'signal'), false);
    assert.equal(interactGarden(s, 'leave'), true); assert.equal(s.garden.step, 4);
    assert.equal(s.area, 'plaza'); assert.equal(s.hp, hp, 'Viaggiare non cura');
    assert.equal(s.enemies[3].hp, 110); assert.equal(drainEvents(s).filter(e => e.completed).length, 1);
    assert.equal(interactGarden(s, 'enter'), true); assert.equal(interactGarden(s, 'leave'), true);
    assert.equal(drainEvents(s).filter(e => e.completed).length, 0); assert.equal(s.enemies.length, 4);
  }
});

test('uscire prima del segnale conserva la bussola e consente di continuare', () => {
  const s = garden(); s.z = -10; interactGarden(s, 'compass'); s.z = 11;
  assert.equal(interactGarden(s, 'leave'), true); assert.equal(s.garden.step, 2);
  interactGarden(s, 'enter'); assert.equal(s.garden.step, 2); assert.equal(gardenObjective(s).id, 'signal');
});

test('confini e colonne del giardino valgono anche per movimenti ripetuti', () => {
  const s = garden();
  for (let i = 0; i < 200; i++) movePlayer(s, 1, 1, .05);
  assert.equal(s.x, 12); assert.equal(s.z, 13);
  s.x = -4; s.z = 5;
  for (let i = 0; i < 30; i++) movePlayer(s, 0, -1, .05);
  for (const cover of GARDEN_COVER) assert.ok(Math.hypot(s.x - cover.x, s.z - cover.z) >= cover.radius + .35 - 1e-8);
});

test('copertura interrompe il raggio e il volume rettilineo coincide con il segnale', () => {
  const e = createSentry(); e.x = -4; e.z = -10;
  const player = { x: -4, z: 10 }; prepareBeam(e, player);
  assert.ok(e.beamLength < 6); assert.equal(beamHits(e, player), false);
  e.x = 0; e.z = -6; prepareBeam(e, { x: 0, z: 5 });
  assert.equal(e.beamLength, 22); assert.equal(beamHits(e, { x: .79, z: 5 }), true);
  assert.equal(beamHits(e, { x: .81, z: 5 }), false); assert.equal(beamHits(e, { x: 0, z: -7 }), false);
  const marker = createBeamTelegraph(); updateTelegraph(marker, e);
  assert.equal(marker.userData.line.scale.x, e.beamWidth); assert.equal(marker.userData.line.scale.z, e.beamLength);
  e.phase = 'recovery'; updateTelegraph(marker, e); assert.equal(marker.visible, false);
});

test('impatto della sentinella danneggia una volta e non prosegue fuori area', () => {
  const s = garden(), enemy = s.enemies[3]; s.x = 0; s.z = 0; enemy.x = 0;
  prepareBeam(enemy, s); const hp = s.hp; step(s, 1.45, true);
  assert.equal(s.hp, hp - 20); assert.equal(s.lastDamage.kind, 'beam');
  step(s, .2, true); assert.equal(s.hp, hp - 20);
  s.z = 11; interactGarden(s, 'leave'); const phase = enemy.phase, recovery = enemy.recovery;
  step(s, 2, true); assert.equal(enemy.phase, phase); assert.equal(enemy.recovery, recovery);
  assert.equal(setTarget(s, enemy.id), false); assert.equal(selectedEnemy(s), null);
});

test('sentinella può essere interrotta e sconfitta senza duplicare il finale del Custode', () => {
  const s = garden('fighter'), enemy = s.enemies[3]; s.x = enemy.x; s.z = enemy.z + 1;
  prepareBeam(enemy, s); drainEvents(s); cast(s); step(s, .32);
  assert.equal(enemy.phase, 'stagger');
  for (let i = 0; i < 15 && enemy.hp > 0; i++) { attack(s); step(s, .6); }
  assert.equal(enemy.hp, 0); assert.equal(s.garden.sentryDefeated, true);
  const resumed = restoreCheckpoint(checkpointFromSession(s));
  assert.equal(resumed.enemies[3].hp, 0); assert.equal(resumed.garden.sentryDefeated, true);
  const events = drainEvents(s); assert.equal(events.filter(e => e.type === 'cleared').length, 0);
  assert.equal(events.filter(e => e.type === 'garden-progress' && e.interaction === 'sentry').length, 1);
});

test('checkpoint v1/v2 migrano a v3 senza scrivere; v3 conserva ogni tappa e ricrea il combattimento a un ingresso sicuro', () => {
  let raw = JSON.stringify(old('healer')), writes = 0;
  const store = createCheckpointStore(() => ({ getItem: () => raw, setItem: (key, value) => { assert.equal(key, CHECKPOINT_KEY); writes++; raw = value; } }));
  const loaded = store.load(); assert.equal(loaded.checkpoint.version, 4); assert.equal(writes, 0);
  assert.equal(JSON.parse(raw).version, 1);
  for (const role of CLASSES) for (let phase = 1; phase <= 4; phase++) {
    const s = garden(role.id); s.garden.step = phase; if (phase === 4) { s.area = 'plaza'; s.x = 38.5; s.z = 7; }
    const restored = restoreCheckpoint(checkpointFromSession(s));
    assert.equal(restored.garden.step, phase); assert.equal(restored.area, s.area);
    assert.equal(restored.hp, restored.maxHp); assert.equal(restored.action, null); assert.equal(restored.enemies.length, 4);
    if (restored.area === 'garden') { assert.equal(restored.x, 0); assert.equal(restored.z, 11); }
  }
});

test('schema corrente rifiuta combinazioni impossibili, versioni ignote e proprietà estranee', () => {
  const valid = checkpointFromSession(garden());
  for (const bad of [{ ...valid, version: 5 }, { ...valid, traces: 2 }, { ...valid, stage: 'arrival' },
    { ...valid, garden: { ...valid.garden, step: 5 } }, { ...valid, garden: { ...valid.garden, user: 'secret' } },
    { ...valid, garden: { ...valid.garden, step: 3, area: 'plaza' } }]) assert.equal(validateCheckpoint(bad), null);
  const s = garden(); s.garden.sentryDefeated = true; assert.throws(() => checkpointFromSession(s));
});

test('visite e aggiornamenti riusano la stessa geometria senza aggiungere nodi', () => {
  const scene = new THREE.Scene(), view = createGardenWorld(scene, createMaterials()), s = garden();
  const before = []; scene.traverse(node => before.push(node));
  for (let i = 0; i < 40; i++) { s.garden.step = i % 4 + 1; view.update(s, i % 2 === 0); }
  const after = []; scene.traverse(node => after.push(node)); assert.deepEqual(after, before);
});


test('colonne fermano proiettili e armi fisiche, senza impedire un tiro libero laterale', () => {
  assert.equal(blockedByGardenCover({x:-4,z:-10},{x:-4,z:10}), true);
  assert.equal(blockedByGardenCover({x:0,z:-10},{x:0,z:10}), false);
  const ranger = garden(), sentry = ranger.enemies[3];
  ranger.x = -4; ranger.z = 5; sentry.x = -4; sentry.z = 0;
  const hp = sentry.hp; cast(ranger); step(ranger, 1.5);
  assert.equal(sentry.hp, hp); assert.ok(drainEvents(ranger).some(e => e.type === 'projectile-blocked'));
  step(ranger, 3); ranger.x = 4; assert.equal(blockedByGardenCover(ranger, sentry), false); cast(ranger); step(ranger, 1.5); assert.ok(sentry.hp < hp);
  const fighter = garden('fighter'), target = fighter.enemies[3]; fighter.x = -4; fighter.z = 3.7; target.x = -4; target.z = .3;
  attack(fighter); step(fighter, .5); assert.equal(target.hp, target.maxHp);
});
