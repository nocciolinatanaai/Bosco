// ART-02 — confronto prima/dopo a camere fisse nello studio tools/art-pass-02 (Vite dev, SwiftShader).
// Uso: node scripts/art-pass-02-review.mjs [cartella] [--only=after]
// «Prima» = sorgenti di ART02_BASE (predefinito f881e7d) estratti in test-results/art02-before/.
// Misure: draw call e triangoli del fotogramma, materiali e texture della scena, memoria texture
// stimata (RGBA 8 bit con mipmap, senza compressione GPU). Non sono misure di un telefono reale.
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';
const out = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'test-results/art-pass-02';
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
const BASE = process.env.ART02_BASE || 'f881e7d', PORT = 5195;
await mkdir(out, { recursive: true });
await rm('test-results/art02-before', { recursive: true, force: true }); await mkdir('test-results/art02-before', { recursive: true });
execFileSync('sh', ['-c', `git archive ${BASE} src public/art | tar -x -C test-results/art02-before`]);
const report = { status: 'running', base: BASE, head: execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim(),
  method: 'Studio a camere fisse: stessa geometria/posa/tempo, camera di gioco del runtime, bloom e ombre 1024 attivi, pixel ratio 1. SwiftShader headless: nessuna misura di frame rate o di telefono reale.', errors: [], external: [], shots: [] };
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let browser;
try {
  await new Promise((resolve, reject) => { const t = setTimeout(() => reject(Error('Vite timeout')), 20000); server.stdout.on('data', (d) => { if (String(d).includes(String(PORT))) { clearTimeout(t); resolve(); } }); server.on('error', reject); });
  browser = await chromium.launch({ executablePath: process.env.MYTHWOOD_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [vp, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844], ['landscape', 844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', (e) => report.errors.push(`${vp}: ${e.message}`));
    await page.route('**/*', (r) => { if (new URL(r.request().url()).origin !== `http://127.0.0.1:${PORT}`) { report.external.push(r.request().url()); return r.abort(); } return r.continue(); });
    for (const version of only ? [only] : ['before', 'after']) {
      await page.goto(`http://127.0.0.1:${PORT}/tools/art-pass-02/${version === 'before' ? '?before=1' : ''}`);
      await page.waitForFunction(() => window.artReady, null, { timeout: 180000 });
      for (const view of ['gioco', 'combattimento', 'materiali']) {
        const stats = await page.evaluate((v) => window.artFrame(v), view);
        const path = `${out}/${version}-${vp}-${view}.png`;
        await page.screenshot({ path, timeout: 120000 });
        if (view === 'combattimento') { await page.addStyleTag({ content: 'canvas{filter:grayscale(1)}' }); await page.evaluate(() => window.artFrame('combattimento')); await page.screenshot({ path: path.replace('.png', '-gray.png'), timeout: 120000 }); await page.evaluate(() => document.querySelectorAll('style').forEach((s) => s.textContent.includes('grayscale') && s.remove())); }
        assert.ok(stats.calls > 1 && stats.triangles > 1000, `${version} ${vp} ${view}: scena vuota`);
        report.shots.push({ version, viewport: vp, view, path, ...stats });
      }
    }
    await page.close();
  }
  assert.deepEqual(report.errors, []); assert.deepEqual(report.external, []);
  report.status = 'passed';
} catch (error) { report.status = 'failed'; report.error = error.message; throw error; }
finally { await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2)); await browser?.close(); server.kill('SIGTERM'); }
console.log(JSON.stringify(report.shots.filter((s) => s.viewport === 'desktop').map(({ version, view, calls, triangles, materials, sceneTextures, textureMemoryMiB }) => ({ version, view, calls, triangles, materials, sceneTextures, textureMemoryMiB }))));
