import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { MEMORY } from '../src/journey.js';
// Observation only (PRODUCT-01): what a newcomer meets on a phone before the first move, and how
// much reading the narrative beats ask. Built dist, 390x844, cold cache. No gameplay change, no external requests.
const out=process.argv[2]||'test-results/product-first-minute';await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5197','--strictPort'],{stdio:['ignore','pipe','pipe']});
const words=t=>(t.match(/[\p{L}\p{N}’']+/gu)||[]).length;
const visibleText=()=>{const out=[];const walk=el=>{for(const n of el.childNodes){if(n.nodeType===3){const p=n.parentElement;if(!p)continue;const s=getComputedStyle(p),r=p.getBoundingClientRect();if(s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&n.textContent.trim())out.push(n.textContent.trim());}else if(n.nodeType===1&&!['SCRIPT','STYLE'].includes(n.tagName))walk(n);}};walk(document.body);return out;};
let browser;const report={fixture:'vite preview of dist, Chromium 390x844 mobile emulation, cold cache; observation only, not a player test',steps:[]};
try{
  await new Promise((r,j)=>{const t=setTimeout(()=>j(Error('timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5197')){clearTimeout(t);r();}});});
  browser=await chromium.launch({...(process.env.MYTHWOOD_CHROMIUM_PATH?{executablePath:process.env.MYTHWOOD_CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await ctx.newPage();
  await page.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:5197'?r.continue():r.abort());
  let taps=0;const t0=Date.now();
  const step=async(name)=>{const texts=await page.evaluate(visibleText);const w=texts.reduce((a,t)=>a+words(t),0);await page.screenshot({path:`${out}/${String(report.steps.length+1).padStart(2,'0')}-${name}.png`});report.steps.push({name,taps,seconds:+((Date.now()-t0)/1000).toFixed(1),visibleWords:w,texts});};
  await page.goto('http://127.0.0.1:5197/',{waitUntil:'networkidle'});await step('home');
  const banner=page.locator('#cookie-banner');if(await banner.isVisible().catch(()=>false)){await page.locator('#cookie-banner button').first().tap();taps++;await step('home-after-cookie');}
  await page.locator('.header-play').first().tap();taps++;await page.waitForLoadState('networkidle');await page.locator('[data-class]').first().waitFor();await step('demo-selection');
  report.saveDefaultChecked=await page.locator('#save-start').isChecked();
  await page.locator('[data-class="ranger"]').tap();taps++;await step('ranger-selected');
  await page.locator('#start').tap();taps++;await page.waitForLoadState('networkidle');await page.waitForTimeout(1500);await step('first-playable-frame');
  report.tapsToFirstControl=taps;
  report.memoryWords=Object.fromEntries(Object.entries(MEMORY).map(([k,v])=>[k,words(v.title+' '+v.body)]));
  report.memoryReadingSecondsAt200wpm=Object.fromEntries(Object.entries(report.memoryWords).map(([k,w])=>[k,+(w/200*60).toFixed(0)]));
  console.log(JSON.stringify({taps:report.tapsToFirstControl,steps:report.steps.map(s=>[s.name,s.taps,s.visibleWords]),save:report.saveDefaultChecked,memory:report.memoryWords},null,1));
}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
