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
// Orologio controllato: ogni passo fa girare i fotogrammi a 16 ms di tempo di gioco, qualunque sia
// la velocità reale del rendering (SwiftShader headless va a ~1,5 fps). Input e letture restano reali.
async function advanceUntil(page, predicate, arg = null, maxMs = 30000, stepMs = 48) {
  for (let t = 0; t < maxMs; t += stepMs) { if (await page.evaluate(predicate, arg)) return true; await page.clock.runFor(stepMs); }
  return page.evaluate(predicate, arg);
}
const visibleSel = (sel) => { const el = document.querySelector(sel); return Boolean(el && !el.hidden && !el.closest('[hidden]')); };
// Lo screenshot ha bisogno di fotogrammi reali: per la sola cattura l'orologio riprende in tempo reale
// (a ~1,5 fps il gioco avanza di pochi decimi di secondo), poi si ferma di nuovo.
async function capture(page, path) {
  await page.clock.resume();
  try { await page.screenshot({ path, timeout: 120000 }); }
  finally { await page.clock.pauseAt(await page.evaluate(() => Date.now() + 20)); }
}
async function shot(page, name, run, gray = false) {
  const path = `${out}/${name}.png`; await capture(page, path); run.captures.push(path);
  if (gray) { const style = await page.addStyleTag({ content: 'html{filter:grayscale(1)!important}' }); await capture(page, `${out}/${name}-gray.png`); run.captures.push(`${out}/${name}-gray.png`); await style.evaluate((n) => n.remove()); }
}
async function setup(browser, name, width, height, fixture, video = false) {
  const mobile = name !== 'desktop';
  const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, ...(video ? { recordVideo: { dir: `${out}/video-tmp`, size: { width: 960, height: 600 } } } : {}) });
  const page = await context.newPage(); const errors = [], external = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', (r) => { if (new URL(r.request().url()).origin !== ORIGIN) { external.push(r.request().url()); return r.abort(); } return r.continue(); });
  await page.addInitScript((data) => { localStorage.setItem('mythwood.checkpoint.v1', JSON.stringify(data)); }, fixture);
  // Prima del caricamento: three.js conserva il riferimento a requestAnimationFrame. Il tempo scorre finché non lo fermiamo.
  await page.clock.install();
  await page.goto(`${ORIGIN}/demo.html`, { waitUntil: 'networkidle' });
  // Con l'orologio finto i controlli di stabilità di Playwright attendono fotogrammi: clic e scelte eseguiti nella pagina.
  const click = (id) => page.evaluate((i) => document.getElementById(i).click(), id);
  await page.locator('#resume-saved').waitFor(); await click('resume-saved');
  // Movimento ridotto e qualità leggera; l'audio resta spento (predefinito).
  await click('help');
  await page.evaluate(() => { const q = document.getElementById('quality-select'); q.value = 'light'; q.dispatchEvent(new Event('change', { bubbles: true })); const m = document.getElementById('motion-option'); if (!m.checked) m.click(); });
  await click('close-info');
  await page.evaluate(() => document.getElementById('world').focus()); // i tasti non vanno a un campo del pannello appena chiuso
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 500)); await page.clock.runFor(500);
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
    // Avvicinati tenendo Attacco finché una freccia arriva a segno (provocazione), poi fermati oltre 6 unità.
    await page.keyboard.down('KeyW'); await page.keyboard.down('KeyJ');
    assert.ok(await advanceUntil(page, () => Number(document.getElementById('boss-hp').value) < 280, null, 20000), 'freccia a segno');
    await page.keyboard.up('KeyW'); await page.keyboard.up('KeyJ');
    assert.ok(await advanceUntil(page, visibleSel, '#boss-reach', 10000, 16), 'Frattura a distanza annunciata');
    run.measures.farFracture = await measure(page); check(run.measures.farFracture, '#boss-reach', `${name} far`);
    await shot(page, `${name}-far-fracture`, run, name === 'desktop');
    // Impeto: schivata all'ultimo istante della carica (lettura dell'HUD), poi un attacco base.
    // Un'Onda lanciata quando si è già fuori dal suo cerchio non colpisce, quindi non attiva il Sigillo: si ritenta.
    const endOfCharge = () => { const m = document.getElementById('boss-intent').textContent.match(/· ([\d.]+) s/); return Boolean(m && Number(m[1]) <= .1); };
    const chargedNow = () => /×1,5/.test(document.getElementById('surge-state').textContent) && !document.getElementById('surge-state').hidden;
    const dodgeForCharge = async () => {
      for (let attempt = 0; attempt < 6; attempt++) {
        run.dodgeAttempts = (run.dodgeAttempts || 0) + 1;
        await advanceUntil(page, () => !/· 0\.[01] s/.test(document.getElementById('boss-intent').textContent), null, 3000, 32);
        assert.ok(await advanceUntil(page, endOfCharge, null, 12000, 16), 'fine carica');
        await page.keyboard.press('Space');
        if (await advanceUntil(page, chargedNow, null, 1000, 16)) return true;
      }
      return false;
    };
    // 1) carica e misura, poi subito l'attacco base (nessuna cattura in mezzo: durante lo screenshot il tempo scorre).
    run.surgeCharged = await dodgeForCharge();
    assert.ok(run.surgeCharged, 'schivata d’impatto: carica Impeto');
    run.measures.surge = await measure(page); check(run.measures.surge, '#surge-state', `${name} impeto`);
    run.surgeBeforeAttack = (await page.locator('#surge-state').textContent()).trim();
    await page.keyboard.down('KeyJ');
    const outcome = await advanceUntil(page, () => /IMPETO (A SEGNO|A VUOTO)/.test(document.getElementById('surge-state').textContent), null, 5000, 16);
    await page.keyboard.up('KeyJ');
    assert.ok(outcome, `esito Impeto (stato: ${(await page.locator('#surge-state').textContent()).trim()})`);
    run.surgeOutcome = (await page.locator('#surge-state').textContent()).trim();
    await shot(page, `${name}-impeto-used`, run);
    // 2) una seconda carica solo per la cattura.
    if (await dodgeForCharge()) await shot(page, `${name}-impeto-charge`, run, name === 'desktop');
    // Resistenza: tiro caricato (Q) che interrompe; da lì «Non interrompibile» finché il Custode non completa un attacco.
    for (let attempt = 0; attempt < 6 && !(await page.evaluate(visibleSel, '#boss-resolute')); attempt++) {
      await page.keyboard.press('KeyQ'); await advanceUntil(page, visibleSel, '#boss-resolute', 1500, 32);
      if (!(await page.evaluate(visibleSel, '#boss-resolute'))) await page.clock.runFor(1500);
    }
    assert.ok(await page.evaluate(visibleSel, '#boss-resolute'), 'resistenza attiva');
    run.measures.resolute = await measure(page); check(run.measures.resolute, '#boss-resolute', `${name} resolute`);
    await shot(page, `${name}-resolute`, run, name === 'desktop');
    // Il segnale sparisce con il flag: all'impatto successivo.
    run.resoluteClearedAfterImpact = await advanceUntil(page, (sel) => { const el = document.querySelector(sel); return el.hidden; }, '#boss-resolute', 8000, 32);
    assert.deepEqual(ctx.errors, []); assert.deepEqual(ctx.external, []);
    const video = page.video(); await ctx.context.close();
    if (video) { const src = await video.path(); await rename(src, `${out}/desktop-boss.webm`); run.video = `${out}/desktop-boss.webm`; }
    // Guardiano del rintocco: stessa regola, segnale sulla sua etichetta (non ha la barra del Custode).
    if (name !== 'landscape') {
      ctx = await setup(browser, name, width, height, CAVES); page = ctx.page;
      await page.evaluate(() => document.getElementById('cave-travel').click()); assert.ok(await advanceUntil(page, () => document.getElementById('cave-travel').textContent === 'Entra nelle Cave dei Sussurri', null, 20000));
      await page.evaluate(() => document.getElementById('cave-travel').click()); assert.ok(await advanceUntil(page, () => document.getElementById('region').textContent.includes('Cave dei Sussurri'), null, 5000));
      await page.evaluate(() => document.getElementById('world').focus());
      // Avanza finché l'etichetta del Guardiano è visibile (entro 12 unità), poi tiro caricato.
      await page.keyboard.down('KeyW');
      assert.ok(await advanceUntil(page, () => [...document.querySelectorAll('.enemy-label')].some((l) => !l.hidden && l.textContent.includes('rintocco')), null, 15000), 'Guardiano in vista');
      await page.keyboard.up('KeyW');
      const tagged = () => [...document.querySelectorAll('.enemy-label .resolute-tag')].some((t) => !t.hidden && !t.parentElement.hidden);
      for (let attempt = 0; attempt < 6 && !(await page.evaluate(tagged)); attempt++) { await page.keyboard.press('KeyQ'); await advanceUntil(page, tagged, null, 2000, 32); }
      assert.ok(await page.evaluate(tagged), 'Guardiano non interrompibile');
      run.measures.warden = await measure(page); check(run.measures.warden, '.enemy-label .resolute-tag', `${name} warden`);
      await shot(page, `${name}-warden-resolute`, run, name === 'desktop');
      assert.deepEqual(ctx.errors, []); assert.deepEqual(ctx.external, []); await ctx.context.close();
    }
    run.status = 'passed'; await save();
  }
  report.status = 'passed'; report.finishedAtUtc = new Date().toISOString(); await save(); console.log(JSON.stringify(report.runs.map((r) => ({ name: r.name, status: r.status, surge: r.surgeCharged, outcome: r.surgeOutcome }))));
} catch (error) {
  report.status = 'failed'; report.error = error.message;
  if (page && !page.isClosed()) { await page.clock.resume().catch(() => {}); await page.screenshot({ path: `${out}/failure.png`, timeout: 60000 }).catch(() => {}); }
  await save(); throw error;
} finally { await browser?.close(); server.kill('SIGTERM'); }
