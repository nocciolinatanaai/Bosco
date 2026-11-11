// Body bytes, not compressed wire bytes or a physical-phone FPS measurement.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const out=process.argv.slice(2).find(arg=>!arg.startsWith('--'))||'test-results/loading-budget';await mkdir(out,{recursive:true});
const enforce=!process.argv.includes('--baseline');
const deviceScaleFactor=process.argv.includes('--dpr2')?2:1;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5198','--strictPort'],{stdio:['ignore','pipe','pipe']});
let browser;
const report={status:'running',metric:'sum of response body bytes, cold context per role, mobile 390x844; not wire transfer or time to interactive',deviceScaleFactor,enforce,runs:[],errors:[],external:[]};
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Preview timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5198')){clearTimeout(timer);resolve();}});server.on('error',reject);});
 browser=await chromium.launch({executablePath:process.env.MYTHWOOD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const role of ['tank','fighter','assassin','mage','ranger','healer']){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor});
  const page=await context.newPage(),files=[],bodies=[];
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',response=>{const job=(async()=>{try{const data=await response.body();files.push({url:new URL(response.url()).pathname,bytes:data.length,status:response.status()});}catch{/* aborted requests have no body */}})();bodies.push(job);});
  await page.route('**/*',route=>{if(new URL(route.request().url()).origin==='http://127.0.0.1:5198')return route.continue();report.external.push(route.request().url());return route.abort();});
  await page.goto('http://127.0.0.1:5198/',{waitUntil:'networkidle'});await Promise.all(bodies);
  const homeBytes=files.reduce((sum,f)=>sum+f.bytes,0);
  await page.goto('http://127.0.0.1:5198/demo.html',{waitUntil:'networkidle'});
  const expected=role==='ranger'?'/models/ranger/daria-pass01.glb':`/models/characters/${role}.glb`;
  const loaded=page.waitForResponse(r=>new URL(r.url()).pathname===expected&&r.status()===200);
  await page.locator(`[data-class="${role}"]`).click();await page.locator('#start').click();
  await (await loaded).finished();await page.waitForLoadState('networkidle');await Promise.all(bodies);
  assert.equal(await page.locator('#selection').evaluate(e=>e.open),false);
  assert.ok(files.some(f=>f.url===expected&&f.bytes>0),'Expected character GLB was delivered');
  assert.ok(files.every(f=>f.status<400),'No failed asset responses');
  const total=files.reduce((sum,f)=>sum+f.bytes,0);
  report.runs.push({role,homeBytes,homePlusDemoBytes:total,expectedModel:expected,largest:[...files].sort((a,b)=>b.bytes-a.bytes).slice(0,5)});
  if(enforce){assert.ok(homeBytes<=1_200_000,`Home exceeds 1.2MB: ${homeBytes}`);assert.ok(total<=3_500_000,`${role} exceeds 3.5MB: ${total}`);}
  await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';console.log(JSON.stringify(report.runs.map(({role,homeBytes,homePlusDemoBytes})=>({role,homeBytes,homePlusDemoBytes})),null,2));
}catch(error){report.status='failed';report.error=error.message;throw error;}
finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
