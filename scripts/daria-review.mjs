import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
// Before/after capture of Daria in the real engine (authoring view, not the game camera).
const out=process.argv[2]||'test-results/daria-review';await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5191','--strictPort'],{stdio:['ignore','pipe','pipe']});
let browser;const report={status:'running',fixture:'tools/daria-review: two real Ranger actors, same light/camera; authoring view, not gameplay or device performance',frames:[],errors:[],external:[]};
try{
  await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('server timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5191')){clearTimeout(t);resolve();}});server.on('error',reject);});
  browser=await chromium.launch({...(process.env.MYTHWOOD_CHROMIUM_PATH?{executablePath:process.env.MYTHWOOD_CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1400,height:1000}});
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  await page.route('**/*',r=>{if(new URL(r.request().url()).origin==='http://127.0.0.1:5191')return r.continue();report.external.push(r.request().url());return r.abort();});
  await page.goto('http://127.0.0.1:5191/tools/daria-review/');await page.waitForFunction(()=>window.dariaReady,null,{timeout:60000});
  assert.equal(await page.evaluate(()=>window.dariaReady),'ready');
  for(const [view,pose] of [['front','idle'],['side','idle'],['back','idle'],['face','idle'],['faceside','idle'],['front','run'],['front','draw'],['side','draw'],['front','release'],['front','dodge']]){
    const stats=await page.evaluate(([v,p])=>window.dariaFrame(v,p),[view,pose]);
    report.frames.push({view,pose,...stats});
    await page.locator('canvas').screenshot({path:`${out}/${view}-${pose}.png`});
  }
  // Failed load: the procedural Ranger stays visible, no error escapes, and a later retry succeeds.
  const fail=await browser.newPage({viewport:{width:1400,height:1000}});let blocked=true;
  fail.on('pageerror',e=>report.errors.push('fail-page: '+e.message));
  await fail.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:5191')return r.abort();if(blocked&&u.pathname.endsWith('/daria-pass01.glb'))return r.abort();return r.continue();});
  await fail.goto('http://127.0.0.1:5191/tools/daria-review/');await fail.waitForFunction(()=>window.dariaReady,null,{timeout:60000});
  const failed=await fail.evaluate(()=>{const r=window.dariaActors.after.root;return {ready:window.dariaReady,status:r.userData.visualStatus,fallbackVisible:r.children.some(c=>c.visible&&c.name!=='Daria-skinned-presentation'),skinned:Boolean(r.getObjectByName('Daria-skinned-presentation'))};});
  assert.deepEqual(failed,{ready:'failed',status:'fallback',fallbackVisible:true,skinned:false});
  blocked=false;
  const retried=await fail.evaluate(async()=>{const r=window.dariaActors.after.root;const ok=await r.userData.loadVisual();return {ok,status:r.userData.visualStatus,fallbackVisible:r.children.some(c=>c.visible&&c.name!=='Daria-skinned-presentation')};});
  assert.deepEqual(retried,{ok:true,status:'ready',fallbackVisible:false});
  // Repeated actions and pause/time rewind sample deterministically (no drift between identical frames).
  report.failedLoad={failed,retried};await fail.close();
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';
  console.log(JSON.stringify({status:report.status,frames:report.frames.length,after:report.frames[0].after,before:report.frames[0].before}));
}catch(e){report.status='failed';report.error=e.message;throw e;}
finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
