import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

await mkdir('test-results', { recursive: true });
const report = { status: 'running', startedAtUtc: new Date().toISOString(), fixture: 'legacy v1 guardian checkpoint with three traces; normal-time UI navigation', runs: [] };
async function save() {
  await writeFile('test-results/garden-report.json.tmp', JSON.stringify(report, null, 2));
  await rename('test-results/garden-report.json.tmp', 'test-results/garden-report.json');
}
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5184', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let browser, currentPage;
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Preview timeout')), 15000);
    server.stdout.on('data', data => { if (String(data).includes('5184')) { clearTimeout(timer); resolve(); } });
    server.once('error', error => { clearTimeout(timer); reject(error); });
    server.once('exit', code => { clearTimeout(timer); reject(Error(`Preview exit ${code}`)); });
  });
  report.buildEntrySha256 = createHash('sha256').update(await readFile('dist/index.html')).digest('hex');
  report.runnerSha256 = createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'); await save();
  browser = await chromium.launch({ ...(process.env.MYTHWOOD_CHROMIUM_PATH ? { executablePath: process.env.MYTHWOOD_CHROMIUM_PATH } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, viewport, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage(); currentPage = page;
    const errors = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.route('**/*', route => {
      if (new URL(route.request().url()).origin !== 'http://127.0.0.1:5184') { external.push(route.request().url()); return route.abort(); }
      return route.continue();
    });
    // Seed once: reload must use the checkpoint written by the application.
    await page.addInitScript(() => { if (!localStorage.getItem('mythwood.checkpoint.v1')) localStorage.setItem('mythwood.checkpoint.v1', JSON.stringify({ version: 1, autoSave: true, role: 'ranger', stage: 'guardian', traces: 3 })); });
    report.viewport = name; report.step = 'v1 migration'; await save();
    await page.goto('http://127.0.0.1:5184/', { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')).version), 1, 'Reading must not write');
    await page.locator('#resume-saved').click();
    await page.locator('#help').click(); await page.locator('#quality-select').selectOption('light'); await page.locator('#close-info').click();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')).version), 4);
    report.step = 'entry'; await save();
    await page.locator('#world-interact').click();
    assert.equal(await page.locator('#quest-title').innerText(), 'La bussola dei dispersi');
    assert.equal(await page.locator('#region').innerText(), '◇ Giardino dei nomi');
    assert.equal(await page.locator('#boss').isHidden(), true);
    assert.equal(await page.locator('#follow-trail').isHidden(), true);
    await page.screenshot({ path: `test-results/${name}-garden-entry.png` });
    report.step = 'recover compass'; await save();
    await page.locator('#world-interact').click();
    await page.waitForFunction(() => document.getElementById('world-interact').textContent === 'Recupera la bussola', {}, { timeout: 60000 });
    await page.locator('#world-interact').click();
    assert.equal(await page.locator('#quest-title').innerText(), 'Porta fuori un segnale');
    assert.equal(await page.locator('#quest-item').isVisible(), true);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')).garden.step), 2);
    await page.screenshot({ path: `test-results/${name}-garden-compass.png` });
    report.step = 'reload with compass'; await save();
    await page.reload({ waitUntil: 'networkidle' });
    assert.ok((await page.locator('#saved-summary').innerText()).includes('Bussola recuperata'));
    await page.locator('#resume-saved').click();
    assert.equal(await page.locator('#region').innerText(), '◇ Giardino dei nomi');
    assert.equal(await page.locator('#quest-title').innerText(), 'Porta fuori un segnale');
    assert.equal(await page.locator('#hp-text').innerText(), '130 / 130');
    await page.locator('#help').click(); await page.locator('#quality-select').selectOption('light'); await page.locator('#close-info').click();
    if (mobile) {
      await page.setViewportSize({ width: 844, height: 390 });
      const interact = await page.locator('#world-interact').boundingBox(), stick = await page.locator('#joystick').boundingBox();
      assert.ok(interact.y + interact.height <= stick.y || interact.x >= stick.x + stick.width, 'Quest and joystick must not overlap');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: 'test-results/mobile-garden-landscape.png' });
      await page.setViewportSize(viewport);
    }
    report.step = 'signal and return'; await save();
    await page.locator('#world-interact').click();
    assert.equal(await page.locator('#quest-title').innerText(), 'Riporta la rotta');
    await page.locator('#world-interact').click();
    assert.equal(await page.locator('#memory').evaluate(e => e.open), true);
    assert.equal(await page.locator('#memory-title').innerText(), 'Qualcuno cambia ancora le mappe.');
    await page.locator('#memory-continue').click();
    assert.equal(await page.locator('#quest-title').innerText(), 'Una rotta restituita');
    assert.ok((await page.locator('#region').innerText()).includes('sentiero'));
    assert.equal(await page.locator('#world-labels .enemy-label').count(), 4);
    assert.equal(await page.locator('#world-labels .enemy-label progress').last().evaluate(e => e.value), 110, 'Killing is optional');
    await page.evaluate(() => {
      const gl = document.getElementById('world').getContext('webgl2');
      const create = gl.createBuffer.bind(gl); window.gardenNewBuffers = 0;
      gl.createBuffer = (...args) => { window.gardenNewBuffers++; return create(...args); };
    });
    for (let visit = 0; visit < 3; visit++) {
      await page.locator('#world-interact').click(); await page.locator('#world-interact').click();
      assert.equal(await page.locator('#memory').evaluate(e => e.open), false);
      assert.equal(await page.locator('#world-labels .enemy-label').count(), 4);
    }
    const revisitBuffers = await page.evaluate(() => window.gardenNewBuffers);
    assert.equal(revisitBuffers, 0, 'Warm revisits must not allocate new WebGL buffers');
    const checkpoint = await page.evaluate(() => JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')));
    assert.equal(checkpoint.garden.step, 4); assert.equal(checkpoint.garden.area, 'plaza');
    assert.deepEqual(external, []); assert.deepEqual(errors, []);
    report.runs.push({ name, viewport, status: 'passed', checkpointVersion: checkpoint.version, questStep: checkpoint.garden.step, externalRequests: 0, errors: 0, repeatedVisits: 3, newWebGLBuffersOnWarmRevisit: revisitBuffers });
    await save(); await context.close(); console.log(`PASS ${name}: v1→v4, entry, compass, reload, signal, return and repeated visits`);
  }
  report.status = 'passed'; report.finishedAtUtc = new Date().toISOString(); delete report.step; delete report.viewport; await save();
} catch (error) {
  if (currentPage && !currentPage.isClosed()) {
    report.diagnostics = await currentPage.evaluate(() => ({ quest: document.getElementById('quest-title').textContent, interaction: document.getElementById('world-interact').textContent, hp: document.getElementById('hp-text').textContent, toast: document.getElementById('toast').textContent })).catch(() => ({}));
    await currentPage.screenshot({ path: 'test-results/garden-failure.png' }).catch(() => {});
  }
  report.status = 'failed'; report.error = error.message; report.finishedAtUtc = new Date().toISOString(); await save(); throw error;
} finally { await browser?.close(); server.kill('SIGTERM'); }
