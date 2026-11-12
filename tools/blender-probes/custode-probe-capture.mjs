// Prova locale del Custode: stesso studio, ?noglb = Custode procedurale attuale, ?glb = GLB Blender.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
const out = process.argv[2] || 'test-results/custode-probe', PORT = 5197; await mkdir(out, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
const report = { shots: [], errors: [] }; let browser;
try {
  await new Promise((res, rej) => { const t = setTimeout(() => rej(Error('Vite timeout')), 20000); server.stdout.on('data', (d) => { if (String(d).includes(String(PORT))) { clearTimeout(t); res(); } }); });
  browser = await chromium.launch({ executablePath: process.env.MYTHWOOD_CHROMIUM_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const views = (process.env.VIEWS || 'custode-fermo,custode-carica,custode-impatto,gioco,combattimento').split(',');
  for (const [vp, width, height] of (process.env.VP === 'all' ? [['desktop', 1440, 900], ['mobile', 390, 844], ['landscape', 844, 390]] : [['desktop', 1440, 900], ['mobile', 390, 844]])) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', (e) => report.errors.push(`${vp}: ${e.message}`));
    for (const version of (process.env.ONLY ? [process.env.ONLY] : ['prima', 'dopo'])) {
      await page.goto(`http://127.0.0.1:${PORT}/tools/art-pass-02/?${process.env.MODE === 'hero' ? (version === 'prima' ? 'cls=fighter&noglb' : 'cls=fighter&hero&noglb') : (version === 'prima' ? 'noglb' : 'glb')}`);
      await page.waitForFunction(() => window.artReady, null, { timeout: 240000 });
      for (const view of views) {
        const stats = await page.evaluate((v) => window.artFrame(v), view);
        const path = `${out}/${version}-${vp}-${view}.png`; await page.screenshot({ path, timeout: 120000 });
        if (view === 'combattimento') { await page.addStyleTag({ content: 'canvas{filter:grayscale(1)}' }); await page.evaluate(() => window.artFrame('combattimento')); await page.screenshot({ path: path.replace('.png', '-gray.png'), timeout: 120000 }); await page.evaluate(() => document.querySelectorAll('style').forEach((s) => s.textContent.includes('grayscale') && s.remove())); }
        report.shots.push({ version, vp, view, ...stats });
      }
    }
    await page.close();
  }
} finally { await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2)); await browser?.close(); server.kill('SIGTERM'); }
console.log(JSON.stringify(report.shots.filter((s) => s.vp === 'desktop').map(({ version, view, calls, triangles }) => ({ version, view, calls, triangles }))), report.errors);
