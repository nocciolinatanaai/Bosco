import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GRAPHICS_MODES, qualitySettings } from '../src/graphics-quality.js';
test('qualità limita risoluzione e costo, mantenendo invariati i profili', () => {
  assert.equal(qualitySettings('light', 3).pixelRatio, 1); assert.equal(qualitySettings('light', 3).bloom, false);
  assert.equal(qualitySettings('light', 3).shadows, false); assert.equal(qualitySettings('balanced', 3).pixelRatio, 1.35);
  assert.equal(qualitySettings('high', 3).pixelRatio, 1.75); assert.equal(qualitySettings('high', 3).shadowSize, 2048);
  assert.equal(qualitySettings('high', .75).pixelRatio, .75); assert.ok(Object.values(GRAPHICS_MODES).every(Object.isFrozen));
  const a = qualitySettings('balanced', 2); a.shadowSize = 1; assert.equal(qualitySettings('balanced', 2).shadowSize, 1024);
});
test('qualità sconosciuta e rapporti invalidi non richiedono buffer illimitati', () => {
  for (const ratio of [NaN, Infinity, 0, -4]) assert.equal(qualitySettings('invalid', ratio).pixelRatio, 1);
  assert.equal(qualitySettings('__proto__').id, 'balanced'); assert.equal(qualitySettings('high', 1e20).pixelRatio, 1.75);
});
