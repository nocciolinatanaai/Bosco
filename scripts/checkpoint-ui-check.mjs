import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
await mkdir('test-results', { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js','preview','--port','5181','--strictPort'], {stdio:['ignore','pipe','pipe']});
let browser;
try {
  await new Promise((resolve,reject) => { const timer=setTimeout(()=>reject(Error('Preview timeout')),15000); server.stdout.on('data', data=>{if(String(data).includes('5181')){clearTimeout(timer);resolve();}}); server.on('error',reject); });
  browser=await chromium.launch({...(process.env.MYTHWOOD_CHROMIUM_PATH ? {executablePath:process.env.MYTHWOOD_CHROMIUM_PATH} : {}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const runs=[];
  for (const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]) {
    const page=await browser.newPage({viewport}); const errors=[]; page.on('pageerror', e=>errors.push(e.message));
    const checkpoint={version:1,autoSave:false,role:'ranger',stage:'guardian',traces:2};
    await page.addInitScript(data=>{if(!localStorage.getItem('mythwood.checkpoint.v1'))localStorage.setItem('mythwood.checkpoint.v1',JSON.stringify(data));},checkpoint);
    await page.goto('http://127.0.0.1:5181/demo.html',{waitUntil:'networkidle'});
    assert.equal(await page.locator('.selection-actions small').innerText(),'Prova locale · Nessun account');
    assert.equal(await page.locator('#save-start').isChecked(),false);
    assert.equal(await page.locator('#resume-saved').isVisible(),true);
    page.once('dialog',d=>d.dismiss()); await page.locator('#forget-saved').click();
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('mythwood.checkpoint.v1'))),checkpoint);
    await page.screenshot({path:`test-results/${name}-saved-selection.png`});
    await page.locator('#resume-saved').click();
    assert.equal(await page.locator('#hp-text').innerText(),'130 / 130');
    assert.ok((await page.locator('#journey-hint').innerText()).startsWith('2 / 3'));
    assert.equal(await page.locator('#memory').evaluate(e=>e.open),false);
    const gardenCheckpoint={version:2,autoSave:false,role:'ranger',stage:'guardian',traces:3,garden:{step:2,area:'garden',sentryDefeated:true}};
    await page.evaluate(data=>localStorage.setItem('mythwood.checkpoint.v1',JSON.stringify(data)),gardenCheckpoint);
    await page.reload({waitUntil:'networkidle'}); await page.locator('#resume-saved').click();
    assert.equal(await page.locator('#quest-title').innerText(),'Porta fuori un segnale');
    assert.equal(await page.locator('#target-status').innerText(),'Accendi il segnale');
    assert.equal(await page.locator('#world-labels .enemy-label progress').last().evaluate(e=>e.value),0,'Sentinella sconfitta resta assente');
    assert.equal(await page.locator('#memory').evaluate(e=>e.open),false);
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('mythwood.checkpoint.v1'))),gardenCheckpoint,'Ripresa con autosave off non scrive');
    assert.deepEqual(errors,[]); runs.push({name,status:'passed',errors:0}); await page.close();
  }
  await writeFile('test-results/checkpoint-ui-smoke.json',JSON.stringify({status:'passed',finishedAtUtc:new Date().toISOString(),fixture:'synthetic v1 guardian and v2 garden compass checkpoints with autosave off; deletion cancelled; defeated sentry remains absent',runnerSha256:createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'),buildEntrySha256:createHash('sha256').update(await readFile('dist/index.html')).digest('hex'),runs},null,2));
  console.log('PASS desktop/mobile: paused autosave, cancellation, v1/v2 resume, defeated sentry and garden guidance');
} finally {await browser?.close();server.kill('SIGTERM');}
