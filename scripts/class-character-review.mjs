import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
await mkdir('test-results/character-roster',{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5190','--strictPort'],{stdio:['ignore','pipe','pipe']});
let browser;
const report={status:'running',characters:[],errors:[],external:[],limitations:'Authoring fixture, not gameplay or physical iPhone performance'};
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Preview timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5190')){clearTimeout(timer);resolve();}});server.on('error',reject);});
  browser=await chromium.launch({executablePath:process.env.MYTHWOOD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1200,height:1050}});
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.route('**/*',route=>{if(new URL(route.request().url()).origin==='http://127.0.0.1:5190')return route.continue();report.external.push(route.request().url());return route.abort();});
  await page.goto('http://127.0.0.1:5190/tools/character-roster-review/');await page.waitForFunction(()=>window.rosterReady);
  for(const role of ['tank','fighter','assassin','mage','ranger','healer']){
    assert.equal(await page.evaluate(r=>window.rosterSelect(r),role),'ready');
    for(const pose of ['idle','run','prepare','attack','special']){
      const stats=await page.evaluate(p=>window.rosterFrame(p),pose);
      assert.ok(stats.skinned>=5);assert.ok(stats.bounds.every(Number.isFinite));assert.ok(stats.triangles<60000);
      report.characters.push(stats);
      if(['idle','attack'].includes(pose))await page.screenshot({path:`test-results/character-roster/${role}-${pose}.png`});
    }
    await page.evaluate(()=>window.rosterFrame('idle',1.25,Math.PI/2));
    await page.screenshot({path:`test-results/character-roster/${role}-side.png`});
  }
  // Revisit already-loaded classes: no stale model visible after asynchronous loads.
  await page.evaluate(()=>Promise.all(['tank','mage','fighter'].map(r=>window.rosterSelect(r))));
  assert.equal((await page.evaluate(()=>window.rosterFrame('idle'))).role,'fighter');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';
  console.log(JSON.stringify({status:report.status,poses:report.characters.length,errors:report.errors.length}));
}catch(error){report.status='failed';report.error=error.message;throw error;}
finally{await writeFile('test-results/character-roster/report.json',JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
