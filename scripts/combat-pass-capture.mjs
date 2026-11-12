// COMBAT-01 — catture reali dei segnali nella build (con CSP), input da tastiera reale.
// Uso: npm run build && node scripts/combat-pass-capture.mjs [cartella]
// Verifica presenza e disposizione (≥14 px, dentro lo schermo, nessuna sovrapposizione ai comandi).
// Non certifica la comprensione: quella va verificata con persone.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, rename, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const out = process.argv[2] || 'test-results/combat-pass-01'; await mkdir(out, { recursive: true });
const PORT = 5193, ORIGIN = `http://127.0.0.1:${PORT}`;
const report = { status: 'running', startedAtUtc: new Date().toISOString(), note: 'Input reali (tastiera) sulla build; tempi di schivata letti dall’HUD. Prova di presenza/disposizione, non di comprensione.', runs: [] };
const save = () => writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
const AWAKENED = { version: 4, attunement: 'surge', autoSave: true, role: 'ranger', stage: 'awakened', traces: 0, garden: { step: 0, area: 'plaza', sentryDefeated: false }, caves: { step: 0, inside: false, wardenDefeated: false } };
const CAVES = { version: 3, attunement: 'ward', autoSave: true, role: 'ranger', stage: 'guardian', traces: 3, garden: { step: 4, area: 'plaza', sentryDefeated: false } };
const SIGNALS = ['#boss-resolute', '#boss-reach', '#surge-state', '.enemy-label .resolute-tag'];
const CONTROLS = ['#attack', '#skill', '#dash', '#joystick', '#movement', '#pause', '#evolve'];

function measure(page) {
  return page.evaluate(([signals, controls]) => {
    const visible = (el) => { if (!el || el.closest('[hidden]')) return false; const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
    const rect = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    const ctrl = controls.flatMap((sel) => [...document.querySelectorAll(sel)].filter(visible).map((el) => ({ sel, el, r: rect(el) })));
    const items = [];
    for (const sel of signals) for (const el of document.querySelectorAll(sel)) {
      if (!visible(el)) continue;
      const r = rect(el), fontSize = parseFloat(getComputedStyle(el).fontSize);
      const overlaps = ctrl.filter((c) => !c.el.contains(el) && overlap(r, c.r)).map((c) => c.sel);
      items.push({ sel, text: el.textContent.trim(), fontSize, rect: r, inside: r.x >= 0 && r.y >= 0 && r.x + r.w <= innerWidth && r.y + r.h <= innerHeight, clipped: el.scrollWidth > el.clientWidth + 1, overlaps });
    }
    return { viewport: { w: innerWidth, h: innerHeight }, items };
  }, [SIGNALS, CONTROLS]);
}
function check(m, sel, label) {
  const item = m.items.find((i) => i.sel === sel);
  assert.ok(item, `${label}: ${sel} visibile`);
  assert.ok(item.fontSize >= 14, `${label}: ${sel} ${item.fontSize}px < 14`);
  assert.ok(item.inside, `${label}: ${sel} fuori schermo ${JSON.stringify(item.rect)}`);
  assert.equal(item.clipped, false, `${label}: ${sel} tagliato`);
  assert.deepEqual(item.overlaps, [], `${label}: ${sel} sovrapposto ai comandi`);
  return item;
}
// Attende nel browser che la carica del Custode scenda sotto la soglia e preme Spazio (schivata d'impatto).
const dodgeAtImpact = (page) => page.evaluate(() => new Promise((resolve) => {
  const started = performance.now();
  const tick = () => {
    const m = document.getElementById('boss-intent').textContent.match(/(FRATTURA|ONDA)[^·]*· ([\d.]+) s/);
    if (m && Number(m[2]) <= .25) {
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
      setTimeout(() => document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ', bubbles: true })), 60);
      return resolve(Number(m[2]));
    }
    if (performance.now() - started > 240000) return resolve(null);
    requestAnimationFrame(tick);
  };
  tick();
}));
async function shot(page, name, run, gray = false) {
  const path = `${out}/${name}.png`; await page.screenshot({ path }); run.captures.push(path);
  if (gray) { const style = await page.addStyleTag({ content: 'html{filter:grayscale(1)!important}' }); await page.screenshot({ path: `${out}/${name}-gray.png` }); run.captures.push(`${out}/${name}-gray.png`); await style.evaluate((n) => n.remove()); }
}
async function setup(browser, name, width, height, fixture, video = false) {
  const mobile = name !== 'desktop';
  const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, ...(video ? { recordVideo: { dir: `${out}/video-tmp`, size: { width: 960, height: 600 } } } : {}) });
  const page = await context.newPage(); const errors = [], external = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', (r) => { if (new URL(r.request().url()).origin !== ORIGIN) { external.push(r.request().url()); return r.abort(); } return r.continue(); });
  await page.addInitScript((data) => { localStorage.setItem('mythwood.checkpoint.v1', JSON.stringify(data)); }, fixture);
  await page.goto(`${ORIGIN}/demo.html`, { waitUntil: 'networkidle' });
  await page.locator('#resume-saved').click();
  // Movimento ridotto e qualità leggera; l'audio resta spento (predefinito).
  await page.locator('#help').click(); await page.locator('#quality-select').selectOption('light');
  await page.locator('#motion-option').check(); await page.locator('#close-info').click();
  await page.locator('#world').focus(); // i tasti non vanno a un campo del pannello appena chiuso
  return { context, page, errors, external };
}

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let browser, page;
try {
  await new Promise((resolve, reject) => { const t = setTimeout(() => reject(Error('Preview timeout')), 15000); server.stdout.on('data', (d) => { if (String(d).includes(String(PORT))) { clearTimeout(t); resolve(); } }); server.on('error', reject); });
  const html = await readFile('dist/demo.html', 'utf8'); report.csp = /Content-Security-Policy/.test(html);
  const entry = html.match(/src="([^"]+\.js)"/)[1]; report.buildEntrySha256 = createHash('sha256').update(await readFile(`dist/${entry.replace(/^\.?\//, '')}`)).digest('hex');
  browser = await chromium.launch({ executablePath: process.env.MYTHWOOD_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844], ['landscape', 844, 390]]) {
    const run = { name, viewport: `${width}x${height}`, captures: [], measures: {} }; report.runs.push(run); await save();
    let ctx = await setup(browser, name, width, height, AWAKENED, name === 'desktop'); page = ctx.page;
    // Avvicinati fin dentro la gittata dell'arco (14,4) ma oltre 6 unità, poi colpisci: provocazione.
    // Il browser headless (SwiftShader) va a pochi fotogrammi al secondo: si attende lo stato, non un tempo fisso.
    await page.keyboard.down('KeyW'); await page.keyboard.down('KeyJ');
    await page.waitForFunction(() => Number(document.getElementById('boss-hp').value) < 280, null, { timeout: 240000 });
    await page.keyboard.up('KeyW'); await page.keyboard.up('KeyJ');
    await page.locator('#boss-reach').waitFor({ state: 'visible', timeout: 180000 });
    run.measures.farFracture = await measure(page); check(run.measures.farFracture, '#boss-reach', `${name} far`);
    await shot(page, `${name}-far-fracture`, run, name === 'desktop');
    // Impeto: schivata all'impatto della carica (fino a 5 tentativi), poi attacco base.
    let charged = false;
    for (let attempt = 0; attempt < 5 && !charged; attempt++) {
      await dodgeAtImpact(page);
      charged = await page.locator('#surge-state').filter({ hasText: '×1,5' }).waitFor({ state: 'visible', timeout: 15000 }).then(() => true, () => false);
    }
    run.surgeCharged = charged;
    if (charged) {
      run.measures.surge = await measure(page); check(run.measures.surge, '#surge-state', `${name} impeto`);
      await shot(page, `${name}-impeto-charge`, run, name === 'desktop');
      await page.keyboard.press('KeyJ');
      await page.locator('#surge-state').filter({ hasText: /IMPETO (A SEGNO|A VUOTO|USATO)/ }).waitFor({ state: 'visible', timeout: 60000 });
      run.surgeOutcome = (await page.locator('#surge-state').textContent()).trim();
      await shot(page, `${name}-impeto-used`, run);
    }
    // Resistenza del Custode: il tiro caricato (Q) interrompe; da lì «Non interrompibile».
    for (let attempt = 0; attempt < 8 && !(await page.locator('#boss-resolute').isVisible()); attempt++) { await page.keyboard.press('KeyQ'); await page.locator('#boss-resolute').waitFor({ state: 'visible', timeout: 30000 }).catch(() => {}); }
    await page.locator('#boss-resolute').waitFor({ state: 'visible', timeout: 5000 });
    run.measures.resolute = await measure(page); check(run.measures.resolute, '#boss-resolute', `${name} resolute`);
    await shot(page, `${name}-resolute`, run, name === 'desktop');
    assert.deepEqual(ctx.errors, []); assert.deepEqual(ctx.external, []);
    const video = page.video(); await ctx.context.close();
    if (video) { const src = await video.path(); await rename(src, `${out}/desktop-boss.webm`); run.video = `${out}/desktop-boss.webm`; }
    // Guardiano del rintocco: stessa regola, segnale sulla sua etichetta (non ha la barra del Custode).
    if (name !== 'landscape') {
      ctx = await setup(browser, name, width, height, CAVES); page = ctx.page;
      await page.locator('#cave-travel').click(); await page.waitForFunction(() => document.getElementById('cave-travel').textContent === 'Entra nelle Cave dei Sussurri');
      await page.locator('#cave-travel').click(); await page.waitForFunction(() => document.getElementById('region').textContent.includes('Cave dei Sussurri'));
      // Avanza finché l'etichetta del Guardiano è visibile (entro 12 unità), poi tiro caricato.
      await page.keyboard.down('KeyW');
      await page.waitForFunction(() => [...document.querySelectorAll('.enemy-label')].some((l) => !l.hidden && l.textContent.includes('rintocco')), null, { timeout: 240000 });
      await page.keyboard.up('KeyW');
      const tag = page.locator('.enemy-label .resolute-tag:not([hidden])');
      for (let attempt = 0; attempt < 8 && !(await tag.count()); attempt++) { await page.keyboard.press('KeyQ'); await tag.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {}); }
      await tag.first().waitFor({ state: 'visible', timeout: 5000 });
      run.measures.warden = await measure(page); check(run.measures.warden, '.enemy-label .resolute-tag', `${name} warden`);
      await shot(page, `${name}-warden-resolute`, run, name === 'desktop');
      assert.deepEqual(ctx.errors, []); assert.deepEqual(ctx.external, []); await ctx.context.close();
    }
    run.status = 'passed'; await save();
  }
  report.status = 'passed'; report.finishedAtUtc = new Date().toISOString(); await save(); console.log(JSON.stringify(report.runs.map((r) => ({ name: r.name, status: r.status, surge: r.surgeCharged, outcome: r.surgeOutcome }))));
} catch (error) {
  report.status = 'failed'; report.error = error.message;
  if (page && !page.isClosed()) await page.screenshot({ path: `${out}/failure.png` }).catch(() => {});
  await save(); throw error;
} finally { await browser?.close(); server.kill('SIGTERM'); }
