import {chromium} from 'playwright';import {spawn,execFileSync} from 'node:child_process';import {mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const out='/workspace/artifacts/skills-visual-pass';await mkdir(out,{recursive:true});await mkdir('test-results',{recursive:true});
for(const name of ['materials','environment']){
 let source=execFileSync('git',['show',`bc25e7c:src/visuals/${name}.js`],{encoding:'utf8'}).replaceAll("from './","from '/src/visuals/");if(name==='environment')source=source.replace("from '/src/visuals/materials.js'","from '/test-results/materials-before.js'");await writeFile(`test-results/${name}-before.js`,source);
}
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5189','--strictPort'],{stdio:['ignore','pipe','pipe']});let browser;
const report={status:'running',baseline:'bc25e7c',kind:'Material authoring comparison; identical camera, geometry placement, lights and shader time; not gameplay',errors:[],external:[],views:[]};
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Vite timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5189')){clearTimeout(timer);resolve();}});server.on('error',reject);});
 browser=await chromium.launch({executablePath:process.env.MYTHWOOD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1100,height:760}});page.on('pageerror',e=>report.errors.push(e.message));
 await page.route('**/*',r=>{if(new URL(r.request().url()).origin!=='http://127.0.0.1:5189'){report.external.push(r.request().url());return r.abort();}return r.continue();});
 for(const version of ['before','after']){
  await page.goto('http://127.0.0.1:5189/tools/surface-review/'+(version==='before'?'?before=1':''));await page.waitForFunction(()=>window.surfaceReady);
  for(const view of ['wide','detail']){
   const stats=await page.evaluate(v=>window.surfaceFrame(v),view);await page.screenshot({path:`${out}/${version}-${view}.png`});assert.ok(stats.calls>1);assert.ok(stats.triangles>1000);report.views.push({version,view,...stats});
  }
  const stable=await page.evaluate(()=>{const a=window.surfaceFrame('wide');for(let i=0;i<8;i++)window.surfaceFrame('wide');return {start:a,end:window.surfaceFrame('wide')};});
  assert.equal(stable.start.geometries,stable.end.geometries);assert.equal(stable.start.textures,stable.end.textures);
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';console.log(JSON.stringify(report));
}finally{await writeFile(`${out}/surface-report.json`,JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
