import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const out='test-results/site';await mkdir(out,{recursive:true});const report={status:'running',runs:[],errors:[],external:[]};
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5196','--strictPort'],{stdio:['ignore','pipe','pipe']});let browser,page;
try{
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Preview timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5196')){clearTimeout(t);resolve();}});server.on('error',reject);});
 browser=await chromium.launch({executablePath:process.env.MYTHWOOD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:name==='mobile',hasTouch:name==='mobile',acceptDownloads:true});page=await context.newPage();const requests=[];
  page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>requests.push(r.url()));await page.route('**/*',r=>{if(new URL(r.request().url()).origin!=='http://127.0.0.1:5196'){report.external.push(r.request().url());return r.abort();}return r.continue();});
  await page.goto('http://127.0.0.1:5196/',{waitUntil:'networkidle'});assert.equal(await page.title(),'MYTHWOOD · Segui le voci');if(await page.locator('#cookie-banner').isVisible())await page.locator('#cookie-necessary').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(requests.some(r=>/GLTF|\.glb|assets\/demo-/.test(r)),false,'Landing does not load the game');await page.screenshot({path:`${out}/${name}-home.png`,fullPage:true});
  assert.equal(await page.locator('video').count(),0,'Rejected video removed from presentation');assert.equal(await page.locator('.video-pending').isVisible(),true);
  await page.locator('.hero-actions a[href="./account.html"]').click();await page.waitForFunction(()=>document.getElementById('account-availability').textContent.includes('non ancora attive'));assert.equal(await page.locator('#auth-submit').isDisabled(),true);await page.screenshot({path:`${out}/${name}-account-inactive.png`,fullPage:true});await page.locator('.site-header .wordmark').click();
  await page.locator('[data-role="ranger"]').click();assert.equal(await page.locator('#class-skill').textContent(),'Freccia di luce');assert.equal(await page.locator('[data-role="ranger"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#return-answer').inputValue(),'Non indicato','Feedback does not assume an intention to return');
  await page.locator('#return-answer').selectOption('No');
  await page.locator('#feedback-text').fill('Vorrei più chiarezza sui segnali.');const download=page.waitForEvent('download');await page.locator('#download-feedback').click();const file=await download;assert.equal(file.suggestedFilename(),'mythwood-feedback.txt');
  assert.match(await readFile(await file.path(),'utf8'),/Tornerei a giocare: No\n/,'A negative answer is preserved in the exported feedback');
  assert.equal(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k!=='mythwood.cookie-consent.v1').length+sessionStorage.length),0);assert.ok((await page.locator('#feedback-status').textContent()).includes('Nessuna risposta inviata'));
  await page.locator('.header-play').click();assert.equal(new URL(page.url()).pathname,'/demo.html');await page.locator('[data-class]').first().waitFor();assert.equal(await page.locator('[data-class]').count(),6);await page.locator('#start').click();assert.equal(await page.locator('#selection').evaluate(e=>e.open),false);assert.equal(await page.locator('#demo-home-link').isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#pause').click();await page.screenshot({path:`${out}/${name}-demo.png`});await page.locator('#demo-home-link').click();assert.equal(await page.title(),'MYTHWOOD · Segui le voci');
  report.runs.push({name,status:'passed',landingLazyGame:true,feedbackDownload:true,gameNavigation:true});await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(e){report.status='failed';report.error=e.message;if(page&&!page.isClosed())await page.screenshot({path:`${out}/failure.png`}).catch(()=>{});throw e;}
finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
