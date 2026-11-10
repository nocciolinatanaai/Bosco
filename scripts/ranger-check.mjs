import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

await mkdir('test-results', { recursive: true });
const report = { status: 'running', startedAtUtc: new Date().toISOString(), fixture: 'synthetic awakened Ranger; keyboard/touch combat with browser clock stepped at 100 ms, 50 ms near impact; no state hooks', runs: [] };
async function save() {
  await writeFile('test-results/ranger-report.json.tmp', JSON.stringify(report, null, 2));
  await rename('test-results/ranger-report.json.tmp', 'test-results/ranger-report.json');
}
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5182', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let browser, currentPage;
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Preview timeout')), 15000);
    server.stdout.on('data', data => { if (String(data).includes('5182')) { clearTimeout(timer); resolve(); } });
    server.once('error', error => { clearTimeout(timer); reject(error); });
    server.once('exit', code => { clearTimeout(timer); reject(Error(`Preview exit ${code}`)); });
  });
  report.runnerSha256 = createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
  report.buildEntrySha256 = createHash('sha256').update(await readFile('dist/index.html')).digest('hex');
  await save();
  browser = await chromium.launch({ ...(process.env.MYTHWOOD_CHROMIUM_PATH ? { executablePath: process.env.MYTHWOOD_CHROMIUM_PATH } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, viewport, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage(), errors = [], external = [];
    currentPage = page;
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.route('**/*', route => {
      if (new URL(route.request().url()).origin !== 'http://127.0.0.1:5182') { external.push(route.request().url()); return route.abort(); }
      return route.continue();
    });
    const clockStart = new Date('2026-11-10T14:00:00Z');
    await page.clock.install({ time: clockStart });
    await page.clock.pauseAt(new Date(clockStart.getTime() + 1000));
    async function advanceUntil(predicate, maxMs, fine = false) {
      const step = fine ? 50 : 100;
      for (let elapsed = 0; elapsed < maxMs; elapsed += step) {
        if (fine) await page.clock.runFor(step); else await page.clock.fastForward(step);
        if (await predicate()) return;
      }
      throw Error(`Condizione non raggiunta dopo ${maxMs} ms di simulazione: ${report.step}`);
    }
    async function capturePaused(path) {
      // Let Chromium paint while the GAME remains paused. A frozen browser RAF
      // would otherwise prevent Playwright's screenshot stabilization.
      assert.equal(await page.locator('#pause').innerText(), 'Riprendi');
      await page.clock.resume();
      await page.screenshot({ path });
      const now = await page.evaluate(() => Date.now());
      await page.clock.pauseAt(new Date(now + 1000));
    }
    await page.addInitScript(() => localStorage.setItem('mythwood.checkpoint.v1', JSON.stringify({ version: 1, autoSave: false, role: 'ranger', stage: 'awakened', traces: 0 })));
    report.viewport = name; report.step = 'resume'; await save();
    await page.goto('http://127.0.0.1:5182/', { waitUntil: 'networkidle' });
    await page.locator('#resume-saved').click({ force: true });
    await page.locator('#help').click({ force: true }); await page.locator('#quality-select').selectOption('light'); await page.locator('#close-info').click({ force: true });
    assert.equal(await page.locator('#rank').innerText(), 'PRIMA RISONANZA');
    assert.equal(await page.locator('#signature-status').isHidden(), true);
    report.step = 'approach'; await save();
    await page.keyboard.down('KeyW'); await page.keyboard.down('KeyD');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'world', 'Riprendere a muoversi dopo il menu restituisce il focus al gioco');
    await advanceUntil(async () => (await page.locator('#boss-intent').textContent()).includes('FRATTURA'), 15000);
    await page.keyboard.up('KeyW'); await page.keyboard.up('KeyD');
    report.step = 'dodge impact'; await save();
    await advanceUntil(async () => /FRATTURA.*0\.1 s/.test(await page.locator('#boss-intent').textContent()), 15000, true);
    await page.keyboard.press('Space');
    assert.ok(parseInt(await page.locator('#stamina-text').innerText()) < 100, 'Lo scatto deve partire dal focus di gioco');
    await advanceUntil(async () => await page.locator('#signature-status').isVisible(), 1000);
    assert.equal(await page.locator('#skill-name').innerText(), 'Tiro di ritorno');
    assert.ok((await page.locator('#skill').getAttribute('aria-label')).includes('due frecce'));
    await page.locator('#pause').click({ force: true });
    await capturePaused(`test-results/${name}-return-shot-ready.png`);
    if (mobile) {
      await page.setViewportSize({ width: 844, height: 390 });
      const hud = await page.locator('#hud').boundingBox(), actions = await page.locator('#actions').boundingBox();
      assert.ok(hud.y + hud.height < actions.y || hud.x + hud.width < actions.x, 'HUD e azioni separati');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await capturePaused('test-results/mobile-return-shot-landscape.png');
      await page.setViewportSize(viewport);
    }
    await page.locator('#pause').click({ force: true });
    report.step = 'counterattack'; await save();
    await advanceUntil(async () => await page.locator('#skill').isEnabled(), 500);
    if (mobile) await page.locator('#skill').tap({ force: true });
    else await page.keyboard.press('KeyQ');
    await advanceUntil(async () => (await page.locator('#toast').textContent()).includes('Due frecce'), 1000);
    await advanceUntil(async () => await page.locator('#boss-hp').evaluate(e => e.value <= 171), 2000);
    assert.equal(await page.locator('#signature-status').isHidden(), true);
    assert.equal(await page.locator('#skill-name').innerText(), 'Freccia di luce');
    assert.equal(await page.locator('#result').evaluate(e => e.open), false);
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    report.runs.push({ name, viewport, status: 'passed', bossHp: await page.locator('#boss-hp').evaluate(e => e.value), errors: 0, externalRequests: 0 });
    await save(); await context.close(); console.log(`PASS ${name}: real impact dodge → timed double shot, HUD, reset, isolation`);
  }
  report.status = 'passed'; report.finishedAtUtc = new Date().toISOString(); delete report.step; delete report.viewport; await save();
} catch (error) {
  if (currentPage && !currentPage.isClosed()) {
    report.diagnostics = await currentPage.evaluate(() => ({ hp: document.getElementById('hp-text').textContent, stamina: document.getElementById('stamina-text').textContent, intent: document.getElementById('boss-intent').textContent, focus: document.activeElement.id, toast: document.getElementById('toast').textContent, skill: document.getElementById('skill-state').textContent, signature: document.getElementById('signature-status').textContent, paused: document.getElementById('pause').textContent })).catch(() => ({}));
    await currentPage.clock.resume().catch(() => {});
    await currentPage.screenshot({ path: 'test-results/ranger-failure.png' }).catch(() => {});
  }
  report.status = 'failed'; report.error = error.message; report.finishedAtUtc = new Date().toISOString(); await save(); throw error;
} finally { await browser?.close(); server.kill('SIGTERM'); }
