import { existsSync } from 'node:fs';
// Cattura locale riproducibile, nessuna API social né credenziale.
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

if (existsSync(new URL('../social/launch-kit/RETIRED', import.meta.url))) {
  throw new Error('Kit ritirato: non riutilizzare la vecchia cattura social.');
}

const output = resolve(process.argv[2] || 'test-results/social');
await mkdir(output, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5190', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let browser;
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview non pronta')), 15000);
    server.stdout.on('data', (chunk) => { if (String(chunk).includes('127.0.0.1:5190')) { clearTimeout(timer); resolve(); } });
    server.once('error', (error) => { clearTimeout(timer); reject(error); });
    server.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Preview terminata: ${code}`)); });
  });
  browser = await chromium.launch({ executablePath: process.env.MYTHWOOD_CHROMIUM_PATH || undefined,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
  const failures = [];
  page.on('pageerror', (error) => failures.push(error.message));
  await page.route('**/*', (route) => new URL(route.request().url()).origin === 'http://127.0.0.1:5190'
    ? route.continue() : route.abort());
  await page.goto('http://127.0.0.1:5190/', { waitUntil: 'networkidle' });
  await page.locator('[data-class="mage"]').click();
  await page.locator('#start').click();
  let running = true;
  const frames = [];
  const started = performance.now();
  const capture = (async () => {
    while (running) {
      const filename = `frame-${String(frames.length).padStart(4, '0')}.png`;
      const time = (performance.now() - started) / 1000;
      await page.screenshot({ path: resolve(output, filename) });
      frames.push({ filename, time });
      await new Promise((done) => setTimeout(done, 100));
    }
  })();
  try {
    await page.keyboard.down('KeyW'); await page.waitForTimeout(1300); await page.keyboard.up('KeyW');
    await page.keyboard.press('KeyQ'); await page.waitForTimeout(1300);
    await page.keyboard.down('KeyD'); await page.waitForTimeout(700); await page.keyboard.up('KeyD');
    await page.keyboard.press('Space'); await page.waitForTimeout(500);
    await page.keyboard.press('KeyQ'); await page.waitForTimeout(1500);
    await page.keyboard.press('KeyQ'); await page.waitForTimeout(1500);
  } finally { running = false; await capture; }
  if (failures.length) throw new Error(failures.join('\n'));
  if (frames.length < 2) throw new Error('Cattura insufficiente');
  let concat = '';
  for (let i = 0; i < frames.length; i++) {
    const duration = i + 1 < frames.length ? frames[i + 1].time - frames[i].time : .15;
    concat += `file '${frames[i].filename}'\nduration ${duration.toFixed(4)}\n`;
  }
  concat += `file '${frames.at(-1).filename}'\n`;
  await writeFile(resolve(output, 'frames.ffconcat'), concat);
  await writeFile(resolve(output, 'capture.json'), JSON.stringify({ viewport: { width: 540, height: 960 },
    renderer: 'Chromium software/SwiftShader', sampling: 'screenshot periodico con durate reali; non misura FPS nativi',
    mode: 'prototipo individuale locale, nessuna rete remota', frames }, null, 2));
  console.log(`Catturati ${frames.length} frame in ${output}`);
} finally {
  await browser?.close(); server.kill('SIGTERM');
}
