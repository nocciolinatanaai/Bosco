import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
// Bytes a phone downloads: landing, then demo until the chosen class is visible in 3D. Built dist, mobile viewport.
const out=process.argv[2]||'test-results/payload';await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5199','--strictPort'],{stdio:['ignore','pipe','pipe']});
let browser;const report={fixture:'vite preview of dist, Chromium 390x844 mobile emulation, cold cache, no throttling; bytes = response body sizes',runs:[]};
try{
  await new Promise((r,j)=>{const t=setTimeout(()=>j(Error('timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5199')){clearTimeout(t);r();}});});
  browser=await chromium.launch({...(process.env.MYTHWOOD_CHROMIUM_PATH?{executablePath:process.env.MYTHWOOD_CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const role of ['ranger','fighter']){
    const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await ctx.newPage();
    const files=[];page.on('response',async r=>{try{const b=await r.body();files.push({url:new URL(r.url()).pathname,bytes:b.length});}catch{}});
    await page.goto('http://127.0.0.1:5199/',{waitUntil:'networkidle'});const landing=files.reduce((a,f)=>a+f.bytes,0);
    await page.goto('http://127.0.0.1:5199/demo.html',{waitUntil:'networkidle'});
    await page.locator(`[data-class="${role}"]`).click();await page.locator('#start').click();await page.waitForLoadState('networkidle');await page.waitForTimeout(1500);
    const total=files.reduce((a,f)=>a+f.bytes,0);
    const top=[...files].sort((a,b)=>b.bytes-a.bytes).slice(0,8);
    report.runs.push({role,landingBytes:landing,landingPlusDemoToPlayableBytes:total,requests:files.length,largest:top});
    await ctx.close();
  }
  console.log(JSON.stringify(report.runs,null,1));
}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
