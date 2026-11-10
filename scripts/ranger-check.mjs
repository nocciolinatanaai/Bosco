import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

await mkdir('test-results', { recursive: true });
const report = { status: 'running', startedAtUtc: new Date().toISOString(), fixture: 'synthetic awakened Ranger; real keyboard combat, no state hooks', runs: [] };
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
    await page.addInitScript(() => localStorage.setItem('mythwood.checkpoint.v1', JSON.stringify({ version: 1, autoSave: false, role: 'ranger', stage: 'awakened', traces: 0 })));
    report.viewport = name; report.step = 'resume'; await save();
    await page.goto('http://127.0.0.1:5182/', { waitUntil: 'networkidle' });
    await page.locator('#resume-saved').click();
    await page.locator('#help').click(); await page.locator('#quality-select').selectOption('light'); await page.locator('#close-info').click(); await page.locator('#world').focus();
    assert.equal(await page.locator('#rank').innerText(), 'PRIMA RISONANZA');
    assert.equal(await page.locator('#signature-status').isHidden(), true);
    report.step = 'approach'; await save();
    await page.keyboard.down('KeyW'); await page.keyboard.down('KeyD');
    await page.waitForFunction(() => document.getElementById('boss-intent').textContent.includes('FRATTURA'), {}, { timeout: 60000 });
    await page.keyboard.up('KeyW'); await page.keyboard.up('KeyD');
    report.step = 'dodge impact'; await save();
    await page.waitForFunction(() => /FRATTURA.*0\.1 s/.test(document.getElementById('boss-intent').textContent), {}, { timeout: 30000 });
    await page.keyboard.press('Space');
    assert.ok(parseInt(await page.locator('#stamina-text').innerText()) < 100, 'Lo scatto deve partire dal focus di gioco');
    await page.waitForFunction(() => !document.getElementById('signature-status').hidden, {}, { timeout: 15000 });
    assert.equal(await page.locator('#skill-name').innerText(), 'Tiro di ritorno');
    assert.ok((await page.locator('#skill').getAttribute('aria-label')).includes('due frecce'));
    await page.locator('#pause').click();
    await page.screenshot({ path: `test-results/${name}-return-shot-ready.png` });
    if (mobile) {
      await page.setViewportSize({ width: 844, height: 390 });
      const hud = await page.locator('#hud').boundingBox(), actions = await page.locator('#actions').boundingBox();
      assert.ok(hud.y + hud.height < actions.y || hud.x + hud.width < actions.x, 'HUD e azioni separati');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: 'test-results/mobile-return-shot-landscape.png' });
      await page.setViewportSize(viewport);
    }
    await page.locator('#pause').click();
    report.step = 'counterattack'; await save();
    await page.keyboard.press('KeyQ');
    await page.waitForFunction(() => document.getElementById('toast').textContent.includes('Due frecce'), {}, { timeout: 15000 });
    await page.waitForFunction(() => document.getElementById('boss-hp').value <= 171, {}, { timeout: 15000 });
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
    await currentPage.screenshot({ path: 'test-results/ranger-failure.png' }).catch(() => {});
    report.diagnostics = await currentPage.evaluate(() => ({ hp: document.getElementById('hp-text').textContent, stamina: document.getElementById('stamina-text').textContent, intent: document.getElementById('boss-intent').textContent, focus: document.activeElement.id, toast: document.getElementById('toast').textContent })).catch(() => ({}));
  }
  report.status = 'failed'; report.error = error.message; report.finishedAtUtc = new Date().toISOString(); await save(); throw error;
} finally { await browser?.close(); server.kill('SIGTERM'); }
