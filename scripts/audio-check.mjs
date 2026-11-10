import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

// Isolated harness, only the three local audio modules and a gesture button.
const modules = new Set(['cues.js', 'synthesis.js', 'index.js']);
const server = createServer(async (req, res) => {
  if (req.url === '/') { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><button id="enable">Attiva audio di prova</button><output id="state">off</output>'); return; }
  const file = req.url?.replace('/audio/', '');
  if (req.url?.startsWith('/audio/') && modules.has(file)) {
    res.setHeader('Content-Type', 'text/javascript'); res.end(await readFile(new URL(`../src/audio/${file}`, import.meta.url))); return;
  }
  res.statusCode = 404; res.end();
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ ...(process.env.MYTHWOOD_CHROMIUM_PATH ? { executablePath: process.env.MYTHWOOD_CHROMIUM_PATH } : {}), args: ['--no-sandbox', '--mute-audio'] });
  const page = await browser.newPage(), errors = [], external = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => {
    if (new URL(route.request().url()).origin !== origin) { external.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  await page.goto(origin);
  const results = await page.evaluate(async () => {
    const { CUES } = await import('/audio/cues.js'), { scheduleCue, createMix } = await import('/audio/synthesis.js');
    const stats = samples => {
      let peak = 0, energy = 0, tail = 0;
      for (let i = 0; i < samples.length; i++) {
        if (!Number.isFinite(samples[i])) throw new Error('Campione non finito');
        peak = Math.max(peak, Math.abs(samples[i])); energy += samples[i] ** 2;
        if (i > samples.length - 2400) tail = Math.max(tail, Math.abs(samples[i]));
      }
      return { peak, rms: Math.sqrt(energy / samples.length), tail };
    };
    const cues = {};
    for (const [name, layers] of Object.entries(CUES)) {
      const context = new OfflineAudioContext(1, 36000, 24000), mix = createMix(context);
      scheduleCue(context, mix.input, layers); cues[name] = stats((await context.startRendering()).getChannelData(0));
    }
    const silent = new OfflineAudioContext(1, 36000, 24000), silentMix = createMix(silent, 0);
    scheduleCue(silent, silentMix.input, CUES.evolve);
    const canceled = new OfflineAudioContext(1, 36000, 24000), canceledMix = createMix(canceled);
    scheduleCue(canceled, canceledMix.input, CUES.evolve).stop();
    const names = ['slash', 'impact', 'fracture', 'nova', 'echo', 'evolve'];
    const medley = new OfflineAudioContext(1, 24000 * names.length * 1.3, 24000), mix = createMix(medley);
    names.forEach((name, i) => scheduleCue(medley, mix.input, CUES[name].map(l => ({ ...l, delay: l.delay + i * 1.3 }))));
    const samples = Array.from((await medley.startRendering()).getChannelData(0));
    return { cues, zeroVolume: stats((await silent.startRendering()).getChannelData(0)), canceled: stats((await canceled.startRendering()).getChannelData(0)), samples, names };
  });
  for (const [name, value] of Object.entries(results.cues)) {
    assert.ok(value.peak > .001 && value.peak < 1, `${name}: segnale presente senza clipping`);
    assert.ok(value.rms > .00001 && value.tail === 0, `${name}: energia e fine silenziosa`);
  }
  assert.equal(results.zeroVolume.peak, 0); assert.equal(results.canceled.peak, 0);
  await page.evaluate(async () => {
    const { createCombatAudio } = await import('/audio/index.js');
    window.probe = createCombatAudio();
    document.getElementById('enable').onclick = async () => { await probe.setEnabled(true); await probe.setPaused(false); document.getElementById('state').textContent = probe.status().state; };
  });
  await page.locator('#enable').click(); await page.waitForFunction(() => document.getElementById('state').textContent === 'on');
  assert.equal(await page.evaluate(() => probe.play('impact')), true);
  await page.waitForFunction(() => probe.status().voices === 0);
  await page.evaluate(() => probe.dispose());
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  await mkdir('test-results', { recursive: true });
  const { samples, ...report } = results;
  const data = Buffer.alloc(44 + samples.length * 2); data.write('RIFF'); data.writeUInt32LE(data.length - 8, 4); data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22); data.writeUInt32LE(24000, 24); data.writeUInt32LE(48000, 28);
  data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((v, i) => data.writeInt16LE(Math.round(Math.min(1, Math.max(-1, v)) * 32767), 44 + i * 2));
  await writeFile('test-results/audio-study.wav', data); await writeFile('test-results/audio-report.json', JSON.stringify(report, null, 2));
  console.log(`PASS audio: ${Object.keys(report.cues).length} cue renderizzati, mute/cancellazione silenziosi, attivazione su gesto e pulizia reale dei nodi`);
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
