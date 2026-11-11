import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const out='test-results/quest-layout';await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5193','--strictPort'],{stdio:['ignore','pipe','pipe']});let browser,page;
const report={status:'running',runs:[],errors:[],external:[]};
try{
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Preview timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5193')){clearTimeout(t);resolve();}});server.on('error',reject);});
 browser=await chromium.launch({executablePath:process.env.MYTHWOOD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height] of [[390,844],[360,740]])for(const area of ['garden','caves']){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));await page.route('**/*',r=>{if(new URL(r.request().url()).origin!=='http://127.0.0.1:5193'){report.external.push(r.request().url());return r.abort();}return r.continue();});
  const cp={version:4,attunement:'ward',autoSave:false,role:'ranger',stage:'guardian',traces:3,garden:{step:area==='garden'?1:4,area:area==='garden'?'garden':'plaza',sentryDefeated:false},caves:{step:area==='caves'?1:0,inside:area==='caves',wardenDefeated:false}};
  await page.addInitScript(cp=>localStorage.setItem('mythwood.checkpoint.v1',JSON.stringify(cp)),cp);await page.goto('http://127.0.0.1:5193/',{waitUntil:'networkidle'});await page.locator('#resume-saved').click();await page.locator('#quest-toggle').click();
  await page.waitForFunction(()=>{const q=document.querySelector('.quest').getBoundingClientRect(),t=document.getElementById('toast').getBoundingClientRect(),h=document.getElementById('hud').getBoundingClientRect();return t.top>=q.bottom+7&&t.bottom<=h.top;});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const leave=page.locator('#leave-garden');await leave.scrollIntoViewIfNeeded();const box=await leave.boundingBox();assert.ok(box.height>=44);
  await page.screenshot({path:`${out}/${area}-${width}.png`});await leave.click();assert.ok((await page.locator('#region').textContent()).includes('sentiero'));
  report.runs.push({area,width,height,status:'passed',expandedMessageClearOfHud:true,exitReachable:true});await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(e){report.status='failed';report.error=e.message;if(page&&!page.isClosed())await page.screenshot({path:`${out}/failure.png`}).catch(()=>{});throw e;}
finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
