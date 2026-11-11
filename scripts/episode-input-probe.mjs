// Controlled rendering-stall reproduction; does not edit game state or production.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const out='test-results/episode-input-probe';await mkdir(out,{recursive:true});
const report={status:'running',kind:'Controlled RAF suppression during the original 1600ms W gesture; not proof of the historical machine condition',runs:[]};
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5195','--strictPort'],{stdio:['ignore','pipe','pipe']});let browser,page;
const snapshot=page=>page.evaluate(()=>({frames:window.probeFrames,hp:document.getElementById('hp-text').textContent,quest:document.getElementById('quest-title').textContent,hint:document.getElementById('journey-hint').textContent,focus:document.activeElement?.id,paused:document.getElementById('pause').textContent,enemies:[...document.querySelectorAll('.enemy-label progress')].map(e=>e.value),memory:document.getElementById('memory').open,result:document.getElementById('result').open}));
try{
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Preview timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5195')){clearTimeout(t);resolve();}});server.on('error',reject);});
 browser=await chromium.launch({executablePath:process.env.MYTHWOOD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const strategy of ['fixed-wall-time','observed-progress']){
  const context=await browser.newContext({viewport:{width:1440,height:900}});page=await context.newPage();const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>{if(new URL(r.request().url()).origin!=='http://127.0.0.1:5195'){external.push(r.request().url());return r.abort();}return r.continue();});
  await page.addInitScript(()=>{const native=window.requestAnimationFrame.bind(window);window.probeSuspend=false;window.probeFrames=0;window.requestAnimationFrame=callback=>{const deliver=t=>{if(window.probeSuspend)return native(deliver);window.probeFrames++;callback(t);};return native(deliver);};});
  await page.goto('http://127.0.0.1:5195/demo.html',{waitUntil:'networkidle'});await page.locator('[data-class="ranger"]').click();await page.locator('#start').click();
  await page.locator('#help').click();await page.locator('#quality-select').selectOption('light');await page.locator('#close-info').click();
  await page.evaluate(()=>window.probeSuspend=true);const before=await snapshot(page);
  await page.keyboard.down('KeyW');await page.waitForTimeout(1600);
  if(strategy==='fixed-wall-time')await page.keyboard.up('KeyW');
  const during=await snapshot(page);assert.equal(during.frames,before.frames,'No simulation RAF during the timed input');
  await page.evaluate(()=>window.probeSuspend=false);
  if(strategy==='observed-progress'){
   await page.waitForFunction(()=>document.getElementById('quest-title').textContent==='Rompi il primo sigillo',{}, {timeout:30000});await page.keyboard.up('KeyW');
  }
  await page.keyboard.down('KeyJ');let timedOut=false;
  try{await page.waitForFunction(()=>document.getElementById('memory').open||document.getElementById('result').open,{}, {timeout:60000});}catch(e){if(e.name!=='TimeoutError')throw e;timedOut=true;}
  await page.keyboard.up('KeyJ');const after=await snapshot(page);
  if(strategy==='fixed-wall-time'){
   assert.equal(timedOut,true);assert.deepEqual(after.enemies,[0,65,280]);assert.equal(after.paused,'Pausa');assert.equal(after.result,false);
   await page.screenshot({path:`${out}/fixed-stalled.png`});
   await page.keyboard.down('KeyW');await page.keyboard.down('KeyJ');await page.waitForFunction(()=>document.getElementById('memory').open,{}, {timeout:30000});await page.keyboard.up('KeyW');await page.keyboard.up('KeyJ');
  }else{assert.equal(timedOut,false);assert.equal(after.memory,true);assert.equal(after.result,false);await page.screenshot({path:`${out}/progress-memory.png`});}
  report.runs.push({strategy,before,during,after,timeout60000:timedOut,recoverable:strategy==='fixed-wall-time',errors,external});assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await context.close();
 }
 report.status='passed';console.log(JSON.stringify(report));
}catch(e){report.status='failed';report.error=e.message;if(page&&!page.isClosed())await page.screenshot({path:`${out}/failure.png`}).catch(()=>{});throw e;}
finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
