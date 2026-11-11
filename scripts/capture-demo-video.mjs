// Montage from the playable demo and checkpoint fixtures, with simulation clock stepped for capture.
import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {once} from 'node:events';import {mkdir,writeFile} from 'node:fs/promises';import {chromium} from 'playwright';
const out='/workspace/artifacts/mythwood-demo-video';await mkdir(out,{recursive:true});const fps=60,seconds=12,report={status:'running',source:'Actual demo UI/combat, awakened Ranger checkpoint; browser time stepped; not an uncut player session',width:540,height:960,fps,frames:0,errors:[],external:[],dodge:false,returnShot:false};
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5197','--strictPort'],{stdio:['ignore','pipe','pipe']});let browser,encoder,page;
try{
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Preview timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5197')){clearTimeout(t);resolve();}});server.on('error',reject);});
 browser=await chromium.launch({executablePath:process.env.MYTHWOOD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});page=await browser.newPage({viewport:{width:540,height:960},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(e.message));await page.route('**/*',r=>{if(new URL(r.request().url()).origin!=='http://127.0.0.1:5197'){report.external.push(r.request().url());return r.abort();}return r.continue();});
 const start=new Date('2026-11-11T12:00:00Z');await page.clock.install({time:start});await page.clock.pauseAt(new Date(+start+1000));
 await page.addInitScript(()=>localStorage.setItem('mythwood.checkpoint.v1',JSON.stringify({version:3,attunement:'ward',autoSave:false,role:'ranger',stage:'awakened',traces:0,garden:{step:0,area:'plaza',sentryDefeated:false}})));
 await page.goto('http://127.0.0.1:5197/demo.html',{waitUntil:'networkidle'});await page.locator('#resume-saved').click({force:true});await page.locator('#help').click({force:true});await page.locator('#quality-select').selectOption('light');await page.locator('#close-info').click({force:true});
 await page.addStyleTag({content:'header{visibility:hidden}'});await page.keyboard.down('KeyW');
 for(let t=0;t<15000;t+=100){await page.clock.runFor(100);if((await page.locator('#boss-intent').textContent()).includes('FRATTURA'))break;if(t===14900)throw Error('No Guardian charge');}await page.keyboard.up('KeyW');
 await page.locator('#world').focus();
 encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','19','-threads','2','-pix_fmt','yuv420p','-movflags','+faststart',`${out}/gameplay-raw.mp4`],{stdio:['pipe','inherit','inherit']});const encoded=once(encoder,'close');encoder.on('error',e=>report.errors.push(e.message));let dodgedThisCharge=false,previousCharging=false,shotUsed=false,lastDashFrame=-100;
 for(let frame=0;frame<fps*seconds;frame++){
  if(frame===fps*8)await page.locator('#artifact-open').click({force:true});
  if(frame===fps*10){await page.locator('#artifact-close').click({force:true});await page.locator('#world').focus();await page.keyboard.down('KeyJ');}
  if(frame<fps*8||frame>=fps*10){
   const intent=await page.locator('#boss-intent').textContent(),charging=/FRATTURA|ONDA/.test(intent);
   if(charging&&!previousCharging)dodgedThisCharge=false;previousCharging=charging;
   if(charging&&!dodgedThisCharge&&/0\.1 s/.test(intent)){const before=parseInt(await page.locator('#stamina-text').textContent());await page.keyboard.press('Space');dodgedThisCharge=true;lastDashFrame=frame;await page.clock.runFor(1);report.dodge ||= parseInt(await page.locator('#stamina-text').textContent())<before;}
   if(await page.locator('#signature-status').isVisible())report.returnShot=true;
   if(report.returnShot&&!shotUsed&&frame-lastDashFrame>Math.ceil(fps*.3)&&await page.locator('#skill').isEnabled()){await page.keyboard.press('KeyQ');shotUsed=true;}

  }
  await page.clock.runFor(1000/fps);const bytes=await page.screenshot({type:'jpeg',quality:91});if(!encoder.stdin.write(bytes))await once(encoder.stdin,'drain');report.frames++;
  if(frame%40===0){console.log(`Captured ${frame}/${fps*seconds}`);await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
 }
 await page.keyboard.up('KeyJ');encoder.stdin.end();const [code]=await encoded;if(code!==0)throw Error('Encoder failed');
 assert.ok(report.dodge);assert.ok(report.returnShot);assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);await page.screenshot({path:`${out}/last-frame.png`});report.status='passed';
} catch(e){report.status='failed';report.error=e.message;if(page)await page.screenshot({path:`${out}/failure.png`}).catch(()=>{});throw e;}
finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));encoder?.stdin?.end();await browser?.close();server.kill('SIGTERM');}
