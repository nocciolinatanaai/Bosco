import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

// Serve soltanto dist/ su loopback; nessuna connessione al backend di produzione.
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5180', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let browser;
const report = { status: 'running', startedAtUtc: new Date().toISOString(), runs: [] };
async function saveReport() {
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/browser-report.json.tmp', JSON.stringify(report, null, 2));
  await rename('test-results/browser-report.json.tmp', 'test-results/browser-report.json');
}
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview non pronta entro 15 s')), 15000);
    const ready = (chunk) => { if (String(chunk).includes('127.0.0.1:5180')) { clearTimeout(timer); resolve(); } };
    server.stdout.on('data', ready);
    server.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Preview terminata: ${code}`)); });
    server.once('error', (error) => { clearTimeout(timer); reject(error); });
  });
  report.buildEntrySha256 = createHash('sha256').update(await readFile('dist/index.html')).digest('hex');
  report.portraitSha256 = createHash('sha256').update(await readFile('dist/art/liora-portrait.png')).digest('hex');
  report.runnerSha256 = createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
  await saveReport();
  const executablePath = process.env.MYTHWOOD_CHROMIUM_PATH;
  browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  await mkdir('test-results', { recursive: true });
  for (const [name, viewport, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
    report.currentViewport = name; await saveReport();
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const page = await context.newPage();
    const errors = [], external = [], portraitRequests = [];
    page.on('request', request => { if (new URL(request.url()).pathname.endsWith('/art/liora-portrait.png')) portraitRequests.push(request.url()); });
    page.on('pageerror', (error) => { errors.push(error.message); console.error(name, error.message); });
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.route('**/*', (route) => {
      if (new URL(route.request().url()).origin !== 'http://127.0.0.1:5180') { external.push(route.request().url()); return route.abort(); }
      return route.continue();
    });
    await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
    assert.equal(await page.title(), 'Mythwood · La prima frattura');
    assert.equal(await page.locator('[data-class]').count(), 6);
    assert.equal(portraitRequests.length, 0, 'Ritratto non scaricato durante la selezione');
    assert.equal(await page.locator('#start').isEnabled(), true, 'WebGL deve inizializzarsi');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.locator('[data-class="healer"]').click();
    assert.equal(await page.locator('[data-class="healer"]').getAttribute('aria-pressed'), 'true');
    await page.screenshot({ path: `test-results/${name}-selection.png` });
    await page.locator('#audio-start').check();
    await page.locator('#start').click();
    await page.waitForFunction(() => document.getElementById('audio-status').dataset.state === 'on');
    assert.equal(await page.locator('#selection').evaluate((element) => element.open), false);
    assert.equal(await page.locator('#role-name').innerText(), 'Guaritore');
    assert.equal(await page.locator('#world-interact').isHidden(), true, 'Il giardino resta chiuso prima delle tracce');
    await page.locator('#skill').click();
    await page.waitForFunction(() => document.getElementById('toast').textContent.includes('Risonanza vitale'));
    assert.equal(await page.locator('#skill').isDisabled(), true);
    await page.locator('#pause').click();
    assert.equal(await page.locator('#audio-status').getAttribute('data-state'), 'paused');
    assert.equal(await page.locator('#pause').innerText(), 'Riprendi');
    await page.locator('#help').click();
    await page.locator('#audio-option').uncheck();
    assert.equal(await page.locator('#audio-status').getAttribute('data-state'), 'off');
    await page.locator('#audio-volume').focus(); await page.keyboard.press('Home'); await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#audio-volume-text').innerText(), '1%');
    await page.locator('#audio-option').check();
    const graphicsChecks = [];
    for (const [mode, cap] of [['high', 1.75], ['light', 1], ['balanced', 1.35]]) {
      await page.locator('#quality-select').selectOption(mode);
      const buffer = await page.locator('#world').evaluate(canvas => ({ width: canvas.width, height: canvas.height, ratio: devicePixelRatio }));
      assert.ok(Math.abs(buffer.width - viewport.width * Math.min(buffer.ratio, cap)) <= 1);
      assert.ok(Math.abs(buffer.height - viewport.height * Math.min(buffer.ratio, cap)) <= 1);
      graphicsChecks.push({ mode, ...buffer });
    }
    if (mobile) await page.locator('#quality-select').selectOption('light');
    await writeFile(`test-results/${name}-graphics.json`, JSON.stringify(graphicsChecks, null, 2));
    await page.locator('#motion-option').scrollIntoViewIfNeeded();
    const closeBox = await page.locator('#close-info').boundingBox();
    assert.ok(closeBox.y >= 0 && closeBox.y + closeBox.height <= viewport.height, 'Chiudi rimane visibile dopo scroll delle impostazioni');
    await page.locator('#close-info').click();
    assert.equal(await page.locator('#pause').innerText(), 'Riprendi', 'Chiudere le informazioni deve preservare la pausa precedente');
    await page.locator('#pause').click();
    for (const [button, expected] of [['store', 'Store chiuso'], ['guild', 'esclusivamente individuale'], ['privacy', 'non invia telemetria']]) {
      await page.locator(`#${button}`).click();
      assert.ok((await page.locator('#info-body').innerText()).includes(expected));
      await page.locator('#close-info').click();
      assert.equal(await page.locator('#pause').innerText(), 'Pausa', 'Informazioni consecutive non devono lasciare il gioco in pausa');
    }
    if (mobile) {
      const stick = await page.locator('#joystick').boundingBox(), attack = await page.locator('#attack').boundingBox();
      assert.ok(stick.x + stick.width < attack.x, 'Joystick e attacco non si sovrappongono');
      const cdp = await context.newCDPSession(page);
      const left = { x: stick.x + stick.width / 2 + 30, y: stick.y + stick.height / 2, id: 1 };
      const right = { x: attack.x + attack.width / 2, y: attack.y + attack.height / 2, id: 2 };
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [left] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [left, right] });
      await page.waitForFunction(() => document.getElementById('combo-label').textContent.includes('COLPO'));
      assert.notEqual(await page.locator('#joystick-knob').evaluate(e => e.style.transform), 'translate(0px, 0px)', 'Due dita: movimento resta attivo durante attacco');
      await page.screenshot({ path: 'test-results/mobile-combat.png' });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      assert.equal(await page.locator('#joystick-knob').evaluate(e => e.style.transform), 'translate(0px, 0px)');
      await page.locator('#help').tap(); await page.locator('#dpad-option').check(); await page.locator('#motion-option').check(); await page.locator('#close-info').tap();
      assert.equal(await page.locator('[data-move="right"]').isVisible(), true); await page.locator('[data-move="right"]').tap();
      await page.locator('#help').tap(); await page.locator('#dpad-option').uncheck(); await page.locator('#close-info').tap();
      await page.locator('#dash').tap();
      assert.ok(parseInt(await page.locator('#stamina-text').innerText()) < 100);
      await page.setViewportSize({ width: 844, height: 390 });
      const landscape = await page.locator('#joystick').boundingBox(); assert.ok(landscape && landscape.y > 0);
      assert.equal(await page.locator('#actions').evaluate(e => [...e.querySelectorAll('button:not([hidden])')].every(b => b.scrollWidth <= b.clientWidth + 1)), true, 'Etichette landscape contenute nei pulsanti');
      await page.screenshot({ path: 'test-results/mobile-landscape.png' });
      await page.setViewportSize(viewport);
    } else {
      assert.equal(await page.locator('#pause').innerText(), 'Pausa');
      await page.locator('#attack').focus();
      await page.keyboard.down('KeyD'); await page.waitForTimeout(250); await page.keyboard.up('KeyD');
      await page.keyboard.down('KeyJ');
      await page.waitForFunction(() => document.getElementById('combo-label').textContent.includes('COLPO'));
      await page.screenshot({ path: 'test-results/desktop-combat.png' });
      await page.keyboard.up('KeyJ'); await page.keyboard.press('Space');
      assert.ok(parseInt(await page.locator('#stamina-text').innerText()) < 100);
      await page.keyboard.press('Escape'); assert.equal(await page.locator('#pause-overlay').isVisible(), true);
      await page.locator('#resume').click();
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: `test-results/${name}-arena.png` });
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0, 'Nessuna persistenza senza opt-in');
    await page.locator('#brand').click(); await page.locator('[data-class="ranger"]').click();
    await page.locator('#save-start').check(); await page.locator('#start').click();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')).stage), 'arrival');
    assert.equal(await page.locator('#boss').isHidden(), true, 'Custode sigillato prima del ricordo');
    assert.ok((await page.locator('#journey-hint').innerText()).includes('Muoviti'));
    await page.keyboard.down('KeyW'); await page.waitForTimeout(1600); await page.keyboard.up('KeyW');
    await page.keyboard.down('KeyJ');
    await page.waitForFunction(() => document.getElementById('memory').open, { }, { timeout: 60000 });
    await page.keyboard.up('KeyJ');
    assert.ok((await page.locator('#memory-body').innerText()).includes('Liora'));
    await page.waitForFunction(() => { const img = document.getElementById('liora-portrait'); return img.complete && img.naturalWidth > 0; });
    assert.equal(portraitRequests.length, 1); assert.equal(await page.locator('#liora-portrait').isVisible(), true);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'memory-title');
    await page.screenshot({ path: `test-results/${name}-memory.png` });
    if (mobile) {
      await page.setViewportSize({ width: 844, height: 390 });
      assert.equal((await page.locator('#liora-frame').boundingBox()).width, 60);
      await page.screenshot({ path: 'test-results/mobile-memory-landscape.png' });
      await page.setViewportSize(viewport);
    }
    const beforeChoice=await page.evaluate(()=>localStorage.getItem('mythwood.checkpoint.v1'));
    await page.locator('#memory-artifact [data-attunement="surge"]').click();
    await page.locator('#memory-artifact [data-attunement="ward"]').click();
    assert.equal(await page.evaluate(()=>localStorage.getItem('mythwood.checkpoint.v1')),beforeChoice,'Scelta provvisoria: non salva prima di accogliere il ricordo');
    await page.locator('#memory-continue').click();
    assert.ok((await page.locator('#artifact-status').textContent()).includes('Custodia'));
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')).attunement),'ward');
    assert.equal(await page.locator('#rank').innerText(), 'PRIMA RISONANZA');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')).stage), 'awakened');
    assert.equal(await page.locator('#boss').isVisible(), true);
    await page.locator('#dash').click();
    assert.equal(await page.locator('#dash strong').innerText(), 'Risonanza');
    await page.screenshot({ path: `test-results/${name}-resonance.png` });
    await page.keyboard.down('KeyW'); await page.keyboard.down('KeyJ');
    await page.waitForFunction(() => document.getElementById('boss-hp').value < 280, {}, { timeout: 30000 });
    await page.keyboard.up('KeyJ');
    await page.waitForFunction(() => document.getElementById('boss-intent').textContent.includes('FRATTURA'), {}, { timeout: 30000 });
    await page.keyboard.up('KeyW');
    await page.screenshot({ path: `test-results/${name}-fracture.png` });
    await page.keyboard.press('Space');
    await page.waitForFunction(() => document.getElementById('boss-intent').textContent.includes('ONDA'), {}, { timeout: 30000 });
    await page.screenshot({ path: `test-results/${name}-nova.png` });
    await page.keyboard.press('Space');
    await page.keyboard.down('KeyJ');
    await page.waitForFunction(() => document.getElementById('memory').open || document.getElementById('result').open, {}, { timeout: 60000 });
    await page.keyboard.up('KeyJ');
    assert.equal(await page.locator('#result').evaluate(e => e.open), false, 'Il Ranger deve poter concludere questo percorso di prova');
    assert.ok((await page.locator('#memory-title').innerText()).includes('nascosti'));
    await page.screenshot({ path: `test-results/${name}-ending.png` });
    await page.locator('#memory-continue').click();
    assert.equal(await page.locator('#boss').isHidden(), true);
    assert.equal(await page.locator('#quest-title').innerText(), 'La strada che manca');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')).stage), 'guardian');
    if (mobile) {
      await page.setViewportSize({ width: 844, height: 390 });
      const follow = await page.locator('#follow-trail').boundingBox(), stick = await page.locator('#joystick').boundingBox();
      assert.ok(follow.y + follow.height <= stick.y || follow.x >= stick.x + stick.width, 'Missione e joystick separati in landscape');
      await page.setViewportSize(viewport);
    }
    for (let i = 0; i < 3; i++) {
      await page.locator('#follow-trail').click();
      await page.waitForFunction(() => document.getElementById('follow-trail').textContent.includes('Risuona'), {}, { timeout: 60000 });
      await page.locator('#follow-trail').click();
      if (i < 2) await page.waitForFunction(n => document.getElementById('journey-hint').textContent.startsWith(`${n} / 3`), i + 1);
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')).traces), i + 1);
      if (i === 0) {
        await page.reload({ waitUntil: 'networkidle' });
        assert.ok((await page.locator('#saved-summary').innerText()).includes('1 / 3'));
        await page.locator('#resume-saved').click();
        assert.equal(await page.locator('#role-name').innerText(), 'Ranger');
        assert.equal(await page.locator('#hp-text').innerText(), '130 / 130');
        assert.equal(await page.locator('#memory').evaluate(e => e.open), false);
        assert.ok((await page.locator('#journey-hint').innerText()).startsWith('1 / 3'));
        if (mobile) {
          await page.locator('#help').click(); await page.locator('#quality-select').selectOption('light'); await page.locator('#close-info').click();
        }
      }
    }
    await page.waitForFunction(() => document.getElementById('memory').open);
    assert.ok((await page.locator('#memory-body').innerText()).includes('Cartiglio'));
    await page.screenshot({ path: `test-results/${name}-trail.png` });
    if (mobile) {
      await page.locator('#liora-portrait').evaluate(img => img.dispatchEvent(new Event('error')));
      assert.equal(await page.locator('#liora-portrait').isHidden(), true, 'Fallback UI: il testo resta utilizzabile senza ritratto');
      assert.equal(await page.locator('#memory-continue').isEnabled(), true);
    }
    await page.locator('#memory-continue').click();
    assert.equal(await page.locator('#quest-title').innerText(), 'La mappa ricorda');
    assert.equal(await page.locator('#world-interact').isVisible(), true, 'Tre tracce aprono il passaggio al giardino');
    assert.equal(await page.locator('#follow-trail').isHidden(), true);
    await page.locator('#help').click(); await page.locator('#save-option').uncheck();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')).autoSave), false);
    await page.locator('#close-info').click();
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#save-start').isChecked(), false);
    assert.ok((await page.locator('#saved-summary').innerText()).includes('Cartiglio'));
    await page.evaluate(() => localStorage.setItem('unrelated-test', 'keep'));
    page.once('dialog', dialog => dialog.accept()); await page.locator('#forget-saved').click();
    assert.equal(await page.evaluate(() => localStorage.getItem('mythwood.checkpoint.v1')), null);
    assert.equal(await page.evaluate(() => localStorage.getItem('unrelated-test')), 'keep');
    await page.evaluate(() => localStorage.removeItem('unrelated-test'));
    assert.equal(await page.locator('#resume-saved').isHidden(), true);
    if (mobile) {
      await page.locator('#start').click(); await page.locator('#help').click(); await page.locator('#quality-select').selectOption('light'); await page.locator('#close-info').click(); await page.locator('#brand').click();
    }
    await page.locator('[data-class="mage"]').click(); await page.locator('#start').click();
    await page.keyboard.down('KeyW'); await page.waitForTimeout(1600); await page.keyboard.up('KeyW');
    await page.waitForFunction(() => document.getElementById('result').open, {}, { timeout: 90000 });
    assert.ok((await page.locator('#result-text').innerText()).includes('L’ultimo colpo'));
    assert.ok((await page.locator('#result-text').innerText()).includes('eco'));
    await page.screenshot({ path: `test-results/${name}-defeat.png` });
    await page.locator('#restart').click();
    assert.equal(await page.locator('#hp-text').innerText(), '85 / 85');
    assert.equal(await page.locator('#quest-title').innerText(), 'Trova gli echi');
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
    assert.deepEqual(external, [], 'Nessuna richiesta remota');
    assert.deepEqual(errors, [], 'Nessun errore browser');
    console.log(`PASS ${name}: classi, 3D, impatto abilità, combo, schivata, pausa, controlli, echi → ricordo → evoluzione → Frattura/Onda → vittoria, tracce e ritratto Liora, salvataggio/ripresa/eliminazione, audio, qualità grafica, sconfitta e riprova, isolamento`);
    report.runs.push({ name, viewport, status: 'passed', externalRequests: external.length, errors: errors.length, portraitRequests: portraitRequests.length, checkpoints: 'opt-in, milestones, reload, resume, pause preference, delete own key', persistentEntries: 0 });
    await saveReport();
    await context.close();
  }
  report.storageFallbacks = [];
  for (const mode of ['corrupt', 'blocked']) {
    const context = await browser.newContext(); const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:5180' ? route.continue() : route.abort());
    await page.addInitScript(mode => {
      if (mode === 'blocked') Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Disabled', 'SecurityError'); } });
      else { localStorage.setItem('mythwood.checkpoint.v1', '{broken'); localStorage.setItem('unrelated-test', 'keep'); }
    }, mode);
    await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#resume-saved').isHidden(), true);
    if (mode === 'corrupt') {
      assert.equal(await page.evaluate(() => localStorage.getItem('mythwood.checkpoint.v1')), '{broken');
      assert.ok((await page.locator('#saved-summary').innerText()).includes('non è leggibile'));
      page.once('dialog', dialog => dialog.accept()); await page.locator('#forget-saved').click();
      assert.equal(await page.evaluate(() => localStorage.getItem('mythwood.checkpoint.v1')), null);
      assert.equal(await page.evaluate(() => localStorage.getItem('unrelated-test')), 'keep');
    } else await page.locator('#save-start').check();
    await page.locator('#start').click();
    assert.equal(await page.locator('#selection').evaluate(e => e.open), false);
    if (mode === 'blocked') {
      assert.equal(await page.locator('#save-start').isChecked(), false);
      assert.ok((await page.locator('#save-start-status').innerText()).includes('non disponibile'));
    }
    assert.deepEqual(errors, []); report.storageFallbacks.push({ mode, status: 'passed', errors: 0 }); await saveReport();
    await context.close();
  }
  report.status = 'passed'; report.finishedAtUtc = new Date().toISOString(); delete report.currentViewport; await saveReport();
} catch (error) {
  report.status = 'failed'; report.error = error.message; report.finishedAtUtc = new Date().toISOString(); await saveReport(); throw error;
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
