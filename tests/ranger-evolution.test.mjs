import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { CLASSES, createSession, evolve, dodge, hurt, cast, tickCooldowns, advanceEnemies, drainEvents } from '../src/game.js';
import { restoreCheckpoint, checkpointFromSession } from '../src/checkpoints.js';
import { createCombatEffects } from '../src/visuals/combat-effects.js';

function awakened(role = 'ranger') {
  const state = createSession(role);
  for (const enemy of state.enemies.filter(e => !e.boss)) enemy.hp = 0;
  evolve(state); drainEvents(state);
  state.x = 0; state.z = 0;
  const boss = state.enemies[2]; boss.x = 0; boss.z = -5.5;
  return state;
}
function advance(state, seconds) {
  for (let remaining = seconds; remaining > 1e-8; remaining -= .02) tickCooldowns(state, Math.min(.02, remaining));
}
function charged() {
  const state = awakened(); dodge(state, 1, 0); hurt(state, 26);
  advance(state, .26); return state;
}

test('tiro di ritorno richiede Ranger risvegliato e impatto evitato durante lo scatto', () => {
  for (const role of CLASSES) {
    const initial = createSession(role.id); dodge(initial); hurt(initial, 12);
    assert.equal(initial.returnShot, 0);
    const state = awakened(role.id); dodge(state);
    assert.equal(state.returnShot, 0, 'Scattare da solo non carica il tiro');
    hurt(state, 26);
    assert.equal(state.returnShot, role.id === 'ranger' ? 4 : 0);
  }
  const protectedState = awakened(); protectedState.invulnerable = .2; hurt(protectedState, 26);
  assert.equal(protectedState.returnShot, 0, 'Protezione senza scatto non è una schivata');
});

test('un vero impatto del Custode evitato carica una finestra, senza cumularne la durata', () => {
  const state = awakened(), boss = state.enemies[2];
  boss.phase = 'windup'; boss.windup = .01; boss.aimX = state.x; boss.aimZ = state.z;
  const before = state.hp; dodge(state, 1, 0); advance(state, .12); advanceEnemies(state, .02);
  assert.equal(state.hp, before); assert.equal(state.returnShot, 4);
  assert.ok(drainEvents(state).some(e => e.type === 'return-shot-ready'));
  hurt(state, 26); assert.equal(state.returnShot, 4);
});

test('finestra scade sul tempo di simulazione e non produce frecce extra dopo la scadenza', () => {
  const state = charged(); advance(state, 4.1); assert.equal(state.returnShot, 0);
  cast(state); advance(state, .3);
  assert.equal(state.projectiles.length, 1); assert.equal(state.projectiles[0].echo, false);
});

test('abilità nella finestra produce due frecce distinte e consuma la carica una volta', () => {
  const state = charged(); cast(state); advance(state, .3);
  assert.equal(state.returnShot, 0); assert.equal(state.projectiles.length, 2);
  const [primary, echo] = state.projectiles;
  assert.notEqual(primary.id, echo.id); assert.equal(primary.targetId, echo.targetId);
  assert.equal(echo.damage, state.role.damage * .65); assert.ok(echo.delay > 0);
  assert.ok(Math.hypot(primary.x - echo.x, primary.z - echo.z) > .1);
  assert.equal(drainEvents(state).filter(e => e.type === 'return-shot-fired').length, 1);
  advance(state, 1); assert.equal(state.enemies[2].hp, 280 - 66 - 43);
});

test('colpo fuori portata non consuma il contrattacco e annullare il windup non spara', () => {
  const state = charged(); state.enemies[2].z = -35;
  cast(state); advance(state, .3);
  assert.equal(state.projectiles.length, 0); assert.ok(state.returnShot > 0);
  const cancelled = charged(); advance(cancelled, .4); cast(cancelled); advance(cancelled, .1); assert.equal(dodge(cancelled), true);
  advance(cancelled, .5); assert.equal(cancelled.projectiles.length, 0); assert.ok(cancelled.returnShot > 0);
});

test('seconda freccia non duplica morte o conclusione se la prima abbatte il bersaglio', () => {
  const state = charged(); state.enemies[2].hp = 20;
  cast(state); advance(state, 1.6);
  const events = drainEvents(state);
  assert.equal(events.filter(e => e.type === 'enemy-defeated').length, 1);
  assert.equal(events.filter(e => e.type === 'cleared').length, 1);
  assert.equal(state.projectiles.length, 0);
});

test('la carica temporanea non viene conservata nella ripresa delle tappe', () => {
  const state = charged(); const data = checkpointFromSession(state);
  assert.equal(Object.hasOwn(data, 'returnShot'), false);
  assert.equal(restoreCheckpoint(data).returnShot, 0);
  state.invulnerable = 0; state.dodgeRemaining = 0; hurt(state, state.maxHp * 2);
  assert.equal(state.returnShot, 0);
});

test('freccia eco resta nascosta nel ritardo e le viste vengono riusate e rilasciate', () => {
  const scene = new THREE.Scene(), effects = createCombatEffects(scene), state = charged();
  cast(state); advance(state, .3); effects.update(.01, state);
  assert.equal(scene.children.length, 2);
  assert.equal(scene.children.filter(view => view.visible).length, 1);
  effects.update(.01, state); assert.equal(scene.children.length, 2);
  advance(state, .18); effects.update(.01, state);
  assert.equal(scene.children.filter(view => view.visible).length, 2);
  effects.clear(); assert.equal(scene.children.length, 0);
});
