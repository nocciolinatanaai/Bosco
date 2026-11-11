import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const out='test-results/caves';await mkdir(out,{recursive:true});
const report={status:'running',startedAtUtc:new Date().toISOString(),fixture:'legacy v3 completed Garden, real-time UI movement',runs:[]};
const save=()=>writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5191','--strictPort'],{stdio:['ignore','pipe','pipe']});let browser,page;
try {
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Preview timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5191')){clearTimeout(t);resolve();}});server.on('error',reject);});
 const html=await readFile('dist/index.html','utf8'),entry=html.match(/src="([^"]+\.js)"/)[1];report.buildEntrySha256=createHash('sha256').update(await readFile(`dist/${entry.replace(/^\.?\//, '')}`)).digest('hex');
 browser=await chromium.launch({executablePath:process.env.MYTHWOOD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  report.viewport=name;await save();const context=await browser.newContext({viewport:{width,height},isMobile:name==='mobile',hasTouch:name==='mobile'});page=await context.newPage();const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>{if(new URL(r.request().url()).origin!=='http://127.0.0.1:5191'){external.push(r.request().url());return r.abort();}return r.continue();});
  const legacy={version:3,attunement:'ward',autoSave:true,role:'ranger',stage:'guardian',traces:3,garden:{step:4,area:'plaza',sentryDefeated:false}};
  await page.addInitScript(data=>{if(!localStorage.getItem('mythwood.checkpoint.v1'))localStorage.setItem('mythwood.checkpoint.v1',JSON.stringify(data));},legacy);
  await page.goto('http://127.0.0.1:5191/',{waitUntil:'networkidle'});assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('mythwood.checkpoint.v1'))),legacy);
  await page.locator('#resume-saved').click();await page.locator('#help').click();await page.locator('#quality-select').selectOption('light');await page.locator('#close-info').click();
  await page.locator('#cave-travel').click();await page.waitForFunction(()=>document.getElementById('cave-travel').textContent==='Entra nelle Cave dei Sussurri');await page.locator('#cave-travel').click();
  await page.waitForFunction(()=>document.getElementById('region').textContent.includes('Cave dei Sussurri'));
  assert.equal(await page.locator('#boss').isHidden(),true);assert.equal(await page.locator('#follow-trail').isHidden(),true);
  let cp=await page.evaluate(()=>JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')));assert.equal(cp.version,4);assert.equal(cp.caves.inside,true);
  if(name==='mobile') {
   await page.waitForFunction(()=>{const q=document.querySelector('.quest').getBoundingClientRect(),t=document.getElementById('toast').getBoundingClientRect();return t.top>=q.bottom+8;});
   await page.locator('#quest-toggle').click();
   await page.waitForFunction(()=>{const q=document.querySelector('.quest').getBoundingClientRect(),t=document.getElementById('toast').getBoundingClientRect();return t.top>=q.bottom+8;});
   await page.screenshot({path:`${out}/mobile-expanded.png`});await page.locator('#quest-toggle').click();
  }
  await page.screenshot({path:`${out}/${name}-entry.png`});report.step='lens';await save();
  await page.locator('#world-interact').click();
  await page.waitForFunction(()=>document.getElementById('world-interact').textContent==='Recupera la lente'||document.getElementById('result').open,{}, {timeout:60000});
  assert.equal(await page.locator('#result').evaluate(e=>e.open),false,'Reach lens alive');await page.locator('#world-interact').click();
  assert.ok((await page.locator('#quest-item').textContent()).includes('Lente · con te'));
  await page.locator('#world-interact').click();
  await page.waitForFunction(()=>document.getElementById('world-interact').textContent==='Riporta la lente a Liora'||document.getElementById('result').open,{}, {timeout:60000});
  assert.equal(await page.locator('#result').evaluate(e=>e.open),false,'Return to threshold alive');
  await page.locator('#pause').click();
  await page.screenshot({path:`${out}/${name}-lens.png`});
  await page.reload({waitUntil:'networkidle'});assert.ok((await page.locator('#saved-summary').textContent()).includes('Lente recuperata'));await page.locator('#resume-saved').click();
  assert.ok((await page.locator('#region').textContent()).includes('Cave dei Sussurri'));assert.ok((await page.locator('#artifact-status').textContent()).includes('Custodia'));
  if(name==='mobile'){
   await page.setViewportSize({width:844,height:390});await page.screenshot({path:`${out}/mobile-landscape.png`});
   const button=await page.locator('#world-interact').boundingBox(),stick=await page.locator('#joystick').boundingBox();assert.ok(button.y+button.height<=stick.y||button.x>=stick.x+stick.width,'Quest does not overlap joystick');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.setViewportSize({width,height});
  }
  report.step='return';await save();await page.locator('#world-interact').click();
  assert.equal(await page.locator('#memory').evaluate(e=>e.open),true);assert.equal(await page.locator('#memory-title').textContent(),'Non erano dispersi.');await page.screenshot({path:`${out}/${name}-memory.png`});await page.locator('#memory-continue').click();
  cp=await page.evaluate(()=>JSON.parse(localStorage.getItem('mythwood.checkpoint.v1')));assert.equal(cp.caves.step,3);assert.equal(cp.caves.inside,false);
  await page.locator('#cave-travel').click();assert.ok((await page.locator('#region').textContent()).includes('Cave dei Sussurri'));await page.locator('#leave-garden').click();assert.equal(await page.locator('#memory').evaluate(e=>e.open),false,'Return reward not repeated');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);report.runs.push({name,status:'passed',checkpointVersion:4,legacyReadNoWrite:true,choiceRestored:true,questStep:3,errors:0,externalRequests:0});await context.close();
 }
 report.status='passed';report.finishedAtUtc=new Date().toISOString();delete report.viewport;delete report.step;await save();console.log(JSON.stringify(report));
}catch(error){report.status='failed';report.error=error.message;if(page&&!page.isClosed())await page.screenshot({path:`${out}/failure.png`}).catch(()=>{});await save();throw error;}
finally{await browser?.close();server.kill('SIGTERM');}
