import {chromium} from 'playwright';import{spawn,execFileSync}from'node:child_process';import{writeFile,mkdir}from'node:fs/promises';
await mkdir('test-results/pr5-cycle-before',{recursive:true});await mkdir('test-results/pr5-independent',{recursive:true});
execFileSync('tar',['-x','-C','test-results/pr5-cycle-before'],{input:execFileSync('git',['archive','f881e7d','src','public/art'],{maxBuffer:32*1024*1024})});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5196','--strictPort'],{stdio:['ignore','pipe','pipe']});let browser;
try{
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('preview timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5196')){clearTimeout(t);resolve();}});server.on('error',reject);});
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const page=await browser.newPage();const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>{if(new URL(r.request().url()).origin==='http://127.0.0.1:5196')return r.continue();external.push(r.request().url());return r.abort();});
 await page.goto('http://127.0.0.1:5196/docs/assets/art-pass-02-codex/world-cycle.html');await page.waitForFunction(()=>window.probeResult||window.probeError,null,{timeout:90000});const result=await page.evaluate(()=>({result:window.probeResult,error:window.probeError}));Object.assign(result,{errors,external});await writeFile('test-results/pr5-independent/world-cycle.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(result.error||errors.length||external.length)throw Error('Probe failed');
}finally{await browser?.close();server.kill('SIGTERM');}
