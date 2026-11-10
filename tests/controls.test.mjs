import assert from 'node:assert/strict';
import { test } from 'node:test';
import { screenMovement, joystickVector } from '../src/controls.js';
test('assi dello schermo rispettano la camera e limitano la diagonale', () => {
  assert.deepEqual(screenMovement(0, -1), { x: 0, z: -1 });
  const right = screenMovement(1, 0, Math.PI / 2); assert.ok(Math.abs(right.x) < 1e-9 && Math.abs(right.z + 1) < 1e-9);
  const d = screenMovement(1, 1, .6); assert.ok(Math.abs(Math.hypot(d.x, d.z) - 1) < 1e-9);
});
test('joystick: zona morta, analogico, centro e cattura fuori dal cerchio', () => {
  assert.deepEqual(screenMovement(.1, .1, 0, .16), { x: 0, z: 0 });
  assert.ok(Math.abs(screenMovement(.58, 0, 0, .16).x - .5) < 1e-9);
  assert.deepEqual(screenMovement(NaN, Infinity), { x: 0, z: 0 });
  const rect = { left: 10, top: 20, width: 100, height: 100 };
  assert.deepEqual(joystickVector(60, 70, rect), { x: 0, y: 0 });
  const far = joystickVector(1000, -1000, rect); assert.ok(Math.abs(Math.hypot(far.x, far.y) - 1) < 1e-9);
});
