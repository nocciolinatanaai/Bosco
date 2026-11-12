// ART-02 — contratti delle correzioni R1 (alpha della felce) e R2 (atmosfera per area).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { AREA_ATMOSPHERE } from '../src/visuals/environment.js';

const DIR = 'public/art/environment-pass02/';

test('R1: la felce MASK punta a un colore PNG RGBA dichiarato come image/png', () => {
  const gltf = JSON.parse(readFileSync(DIR + 'fern.gltf', 'utf8'));
  for (const material of gltf.materials) {
    assert.equal(material.alphaMode, 'MASK');
    const image = gltf.images[gltf.textures[material.pbrMetallicRoughness.baseColorTexture.index].source];
    assert.equal(image.mimeType, 'image/png');
    const png = readFileSync(DIR + image.uri);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png[25], 6, 'tipo colore PNG 6 = RGBA');
  }
});

test('R1: manifest coerente con i file consegnati (hash e byte)', () => {
  const manifest = JSON.parse(readFileSync(DIR + 'manifest.json', 'utf8'));
  for (const asset of manifest.assets) for (const file of asset.files) {
    const data = readFileSync(DIR + file.file);
    assert.equal(data.length, file.bytes, file.file);
    assert.equal(createHash('sha256').update(data).digest('hex'), file.sha256, file.file);
  }
});

test('R2: Giardino e Cave conservano l’assetto precedente; la piazza ha quello ART-02', () => {
  const before = { fogDensity: .018, environment: .22, hemi: ['#93adc9', '#25202d', .45], sun: ['#b3c9e4', 1.45, [-10, 22, 14]], rim: ['#b38acb', 1.2] };
  assert.deepEqual(AREA_ATMOSPHERE.garden, { ...before, background: '#152e32', fog: '#24483f' });
  assert.deepEqual(AREA_ATMOSPHERE.caves, { ...before, background: '#141523', fog: '#242338' });
  assert.equal(AREA_ATMOSPHERE.plaza.fog, '#22314a');
  assert.equal(AREA_ATMOSPHERE.plaza.fogDensity, .022);
});

test('R2: avvio e cambio d’area passano dalla stessa tabella (ritorno uguale all’ingresso)', () => {
  const source = readFileSync('src/visuals/environment.js', 'utf8');
  assert.match(source, /applyAtmosphere\('plaza'\)/);
  assert.match(source, /setArea\(id\) \{[\s\S]*?applyAtmosphere\(id\);[\s\S]*?\}/);
  assert.doesNotMatch(source, /fog\.color\.set\(id ===/);
});
