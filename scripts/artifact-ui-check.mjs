import assert from 'node:assert/strict';import {chromium} from 'playwright';import {spawn} from 'node:child_process';import {mkdir,writeFile} from 'node:fs/promises';
const out='/workspace/artifacts/artifact-pass';await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5190','--strictPort'],{stdio:['ignore','pipe','pipe']});let browser;
const report={status:'running',runs:[],errors:[],external:[]};
try{
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Vite timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5190')){clearTimeout(t);resolve();}});server.on('error',reject);});
 browser=await chromium.launch({executablePath:process.env.MYTHWOOD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:name==='mobile',hasTouch:name==='mobile'}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.route('**/*',r=>{if(new URL(r.request().url()).origin!=='http://127.0.0.1:5190'){report.external.push(r.request().url());return r.abort();}return r.continue();});
  const legacy={version:1,autoSave:false,role:'mage',stage:'awakened',traces:0};
  await page.addInitScript(data=>{if(!localStorage.getItem('mythwood.checkpoint.v1'))localStorage.setItem('mythwood.checkpoint.v1',JSON.stringify(data));},legacy);
  await page.goto('http://127.0.0.1:5190/demo.html',{waitUntil:'networkidle'});await page.locator('#resume-saved').click();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('mythwood.checkpoint.v1'))),legacy,'Leggere una tappa non la riscrive');
  await page.locator('#artifact-open').click();assert.equal(await page.locator('#pause').textContent(),'Riprendi');
  await page.locator('#artifact-menu [data-attunement="ward"]').click();assert.ok((await page.locator('#artifact-menu-status').textContent()).includes('Custodia attiva'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:`${out}/${name}-choice.png`});await page.locator('#artifact-close').click();assert.equal(await page.locator('#pause').textContent(),'Pausa');
  await page.locator('#help').click();await page.locator('#save-option').check();await page.locator('#close-info').click();
  let data=await page.evaluate(()=>JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')));assert.equal(data.version,4);assert.equal(data.attunement,'ward');
  await page.reload({waitUntil:'networkidle'});await page.locator('#resume-saved').click();assert.ok((await page.locator('#artifact-status').textContent()).includes('Custodia'));
  await page.locator('#artifact-open').click();await page.locator('#artifact-menu [data-attunement="surge"]').click();await page.locator('#artifact-close').click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')).attunement),'surge');
  await page.locator('#pause').click();await page.addStyleTag({content:'#pause-overlay{display:none!important}.is-paused #world{filter:none}'});await page.screenshot({path:`${out}/${name}-hud.png`});
  report.runs.push({name,status:'passed',legacyReadNoWrite:true,choiceRestored:true,checkpointVersion:3});await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';console.log(JSON.stringify(report));
}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
