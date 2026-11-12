// COMBAT-01 — catture reali dei segnali nella build (con CSP), input da tastiera reale.
// Uso: npm run build && node scripts/combat-pass-capture.mjs [cartella]
// Verifica presenza e disposizione (≥14 px, dentro lo schermo, nessuna sovrapposizione ai comandi).
// Non certifica la comprensione: quella va verificata con persone.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, rename, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const out = process.argv[2] || 'test-results/pr4-rereview-layout'; await mkdir(out, { recursive: true });
const PORT = 5193, ORIGIN = `http://127.0.0.1:${PORT}`;
const report = { status: 'running', startedAtUtc: new Date().toISOString(), note: 'Input reali (tastiera) sulla build; tempi di schivata letti dall’HUD. Prova di presenza/disposizione, non di comprensione.', runs: [] };
const save = () => writeFile(`${out}/report${process.env.CAPTURE_VIEWPORTS ? '-' + process.env.CAPTURE_VIEWPORTS.replace(/,/g, '-') : ''}.json`, JSON.stringify(report, null, 2));
const AWAKENED = { version: 4, attunement: 'surge', autoSave: true, role: 'ranger', stage: 'awakened', traces: 0, garden: { step: 0, area: 'plaza', sentryDefeated: false }, caves: { step: 0, inside: false, wardenDefeated: false } };
const CAVES = { version: 3, attunement: 'ward', autoSave: true, role: 'ranger', stage: 'guardian', traces: 3, garden: { step: 4, area: 'plaza', sentryDefeated: false } };
const SIGNALS = ['#boss-resolute', '#boss-reach', '#surge-state', '.enemy-label .resolute-tag', '#hud-resolute'];
// Comandi e pannelli di testo (revisione R2): un segnale leggibile non copre né pulsanti né istruzioni.
const CONTROLS = ['#attack', '#skill', '#dash', '#joystick', '#movement', '#pause', '#evolve', '.quest', '#hud', '#boss', 'header', '#garden-actions'];

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
      // L'avviso temporaneo conta solo quando mostra testo.
      const toast = document.getElementById('toast'), range = document.createRange(); if (toast) range.selectNodeContents(toast);
      const tb = toast && toast.textContent.trim() && visible(toast) ? range.getBoundingClientRect() : null, tr = tb && tb.width ? { x: tb.x, y: tb.y, w: tb.width, h: tb.height } : null; // area del testo, non del riquadro
      const overlaps = ctrl.filter((c) => !c.el.contains(el) && overlap(r, c.r)).map((c) => c.sel).concat(tr && overlap(r, tr) ? ['#toast'] : []);
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
  finally { /* Context closes directly after this final screenshot. */ }
}
// Il tempo reale continua mentre si calcola l'istante: si riprova con un margine più ampio.
async function pauseSoon(page) {
  for (let margin = 50; ; margin *= 2) {
    try { await page.clock.pauseAt(await page.evaluate((m) => Date.now() + m, margin)); return; }
    catch (error) { if (margin > 20000 || !/past/.test(error.message)) throw error; }
  }
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
  const anchor = Date.now(); await page.clock.install({time:anchor}); await page.clock.pauseAt(anchor+1);
  await page.goto(`${ORIGIN}/demo.html`, { waitUntil: 'networkidle' });
  // Con l'orologio finto i controlli di stabilità di Playwright attendono fotogrammi: clic e scelte eseguiti nella pagina.
  const click = (id) => page.evaluate((i) => document.getElementById(i).click(), id);
  await page.locator('#resume-saved').waitFor(); await click('resume-saved');
  // Movimento ridotto e qualità leggera; l'audio resta spento (predefinito).
  await click('help');
  await page.evaluate(() => { const q = document.getElementById('quality-select'); q.value = 'light'; q.dispatchEvent(new Event('change', { bubbles: true })); const m = document.getElementById('motion-option'); if (!m.checked) m.click(); });
  await click('close-info');
  await page.evaluate(() => document.getElementById('world').focus()); // i tasti non vanno a un campo del pannello appena chiuso
  await page.clock.runFor(500);
  return { context, page, errors, external };
}

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let browser, page;
try {
  await new Promise((resolve, reject) => { const t = setTimeout(() => reject(Error('Preview timeout')), 15000); server.stdout.on('data', (d) => { if (String(d).includes(String(PORT))) { clearTimeout(t); resolve(); } }); server.on('error', reject); });
  const html = await readFile('dist/demo.html', 'utf8'); report.csp = /Content-Security-Policy/.test(html);
  const entry = html.match(/src="([^"]+\.js)"/)[1]; report.buildEntrySha256 = createHash('sha256').update(await readFile(`dist/${entry.replace(/^\.?\//, '')}`)).digest('hex');
  browser = await chromium.launch({ executablePath: process.env.MYTHWOOD_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

  report.note = 'Independent focused check derived from capture runner: clock paused before navigation; no video. Screenshots resume only at end of each context. CSS viewports unchanged.';
  for (const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['landscape',844,390]]) {
    const run={name,viewport:`${width}x${height}`,captures:[],measures:{}}; report.runs.push(run); await save();
    let ctx=await setup(browser,name,width,height,AWAKENED);page=ctx.page;
    assert.equal(await page.locator('#boss-hp').getAttribute('value'),'280');
    assert.equal(await page.locator('#boss-resolute').isVisible(),true,'opening signal before any player attack');
    run.measures.opening=await measure(page); check(run.measures.opening,'#boss-resolute',`${name} opening`);
    await capture(page,`${out}/${name}-opening.png`);run.captures.push(`${out}/${name}-opening.png`);
    assert.deepEqual(ctx.errors,[]);assert.deepEqual(ctx.external,[]);await ctx.context.close();
    ctx=await setup(browser,name,width,height,CAVES);page=ctx.page;
    await page.evaluate(()=>document.getElementById('cave-travel').click());
    assert.ok(await advanceUntil(page,()=>document.getElementById('cave-travel').textContent==='Entra nelle Cave dei Sussurri',null,20000));
    await page.evaluate(()=>document.getElementById('cave-travel').click());
    assert.ok(await advanceUntil(page,()=>document.getElementById('region').textContent.includes('Cave dei Sussurri'),null,5000));
    await page.evaluate(()=>document.getElementById('world').focus());
    await page.keyboard.down('KeyW');for(let t=0;t<2400;t+=48)await page.clock.runFor(48);await page.keyboard.up('KeyW');
    const tagged=()=>!document.getElementById('hud-resolute').hidden;
    for(let attempt=0;attempt<6&&!(await page.evaluate(tagged));attempt++){await page.keyboard.press('KeyQ');await advanceUntil(page,tagged,null,2000,32);}
    assert.ok(await page.evaluate(tagged),'Warden persistent signal');
    run.measures.warden=await measure(page);check(run.measures.warden,'#hud-resolute',`${name} Warden HUD`);
    run.wardenTagOnTarget=run.measures.warden.items.some(i=>i.sel==='.enemy-label .resolute-tag');
    if(run.wardenTagOnTarget)check(run.measures.warden,'.enemy-label .resolute-tag',`${name} Warden tag`);
    await capture(page,`${out}/${name}-warden.png`);run.captures.push(`${out}/${name}-warden.png`);
    assert.deepEqual(ctx.errors,[]);assert.deepEqual(ctx.external,[]);await ctx.context.close();
    run.status='passed';await save();console.log('PASS',name,'opening and Warden');
  }
  report.status='passed';report.finishedAtUtc=new Date().toISOString();await save();
} catch(error){report.status='failed';report.error=error.message;await save();throw error;}
finally{await browser?.close();server.kill('SIGTERM');}
