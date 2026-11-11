import {chromium} from 'playwright';import {spawn} from 'node:child_process';import {mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const out='/workspace/artifacts/visual-review';await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5188','--strictPort'],{stdio:['ignore','pipe','pipe']});let browser;
const report={errors:[],external:[],status:'running'};
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Vite timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5188')){clearTimeout(timer);resolve();}});server.on('error',reject);});
 browser=await chromium.launch({executablePath:process.env.MYTHWOOD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1200,height:1050}});page.on('pageerror',e=>report.errors.push(e.message));await page.route('**/*',r=>{if(new URL(r.request().url()).origin!=='http://127.0.0.1:5188'){report.external.push(r.request().url());return r.abort();}return r.continue();});
 await page.goto('http://127.0.0.1:5188/tools/visual-review/');await page.waitForFunction(()=>window.reviewReady);report.model=await page.evaluate(()=>window.reviewModel());assert.equal(report.model.status,'ready');assert.ok(report.model.skinned>=5);assert.ok(report.model.triangles<20000);
 report.motion=await page.evaluate(()=>window.reviewMotion());assert.ok(report.motion.startJump<1e-6);assert.ok(report.motion.interruptJump<1e-6);assert.ok(report.motion.pauseDrift<1e-6);assert.equal(report.motion.resetFinite,true);
 report.directions={};for(const pose of ['idle','run','draw','back']){report.directions[pose]=await page.evaluate(p=>window.reviewPose(p),pose);await page.screenshot({path:`${out}/${pose}.png`});}
 const aim=report.directions.draw;assert.ok(aim.bowForward.reduce((sum,n,i)=>sum+n*aim.actorForward[i],0)>.99,'Arco diretto verso il bersaglio della simulazione');
 report.gameViews=[];
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:5188/');
  await page.locator('[data-class="ranger"]').click();
  const loaded=page.waitForResponse(r=>r.url().endsWith('ranger-base.glb')&&r.status()===200);
  await page.locator('#start').click();await loaded;await page.waitForLoadState('networkidle');
  await page.locator('#pause').click();await page.addStyleTag({content:'#pause-overlay{display:none!important}.is-paused #world{filter:none}'});await page.screenshot({path:`${out}/game-${name}.png`});report.gameViews.push(name);
 }
 // Failed local asset must keep a visible fallback and resolve, never stall the game.
 await page.route('**/ranger-base.glb',route=>route.abort());
 await page.goto('http://127.0.0.1:5188/');
 report.assetFailure=await page.evaluate(async()=>{
  const {createRangerActor}=await import('/src/visuals/ranger.js');const actor=createRangerActor();
  const loaded=await actor.root.userData.loadVisual();actor.root.userData.animate(1,true,0,false,{});
  return {loaded,status:actor.root.userData.visualStatus,visibleNodes:actor.root.children.filter(n=>n.visible).length};
 });
 assert.equal(report.assetFailure.loaded,false);assert.equal(report.assetFailure.status,'fallback');assert.ok(report.assetFailure.visibleNodes>0);
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';console.log(JSON.stringify(report));
}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
