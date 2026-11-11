import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
// Daria in combat: real simulation + runtime yaw rule, measured per 1/60 s frame for the previous and new model.
const out=process.argv[2]||'test-results/daria-combat';await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5193','--strictPort'],{stdio:['ignore','pipe','pipe']});
let browser;const report={status:'running',fixture:'tools/daria-combat: combat.js session, runtime.js yaw/animate rule, fixed 1/60 s; Chromium/SwiftShader, not a device',variants:{},errors:[],external:[]};
const stats=frames=>{
  const pick=(f,k)=>frames.filter(f).map(x=>x[k]).filter(n=>n!==undefined);
  const max=a=>a.length?Math.max(...a):null,mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  // Foot slip: horizontal world speed of the contact foot (within 3 cm of the run's lowest height and
  // 3 cm below the other foot) on straight running frames (yaw error < 5°, >0.15 s after a state change).
  const run=frames.filter(f=>f.phase==='run');const ground=Math.min(...run.flatMap(f=>f.feet.map(p=>p[1])));const slips=[];let since=0;
  for(let i=1;i<frames.length;i++){const a=frames[i-1],b=frames[i];since=b.phase===a.phase?since+1/60:0;if(b.phase!=='run'||a.phase!=='run'||since<.15||b.yawError>5)continue;
    for(const k of [0,1]){if(b.feet[k][1]<=ground+.03&&b.feet[k][1]<b.feet[1-k][1]-.03)slips.push(Math.hypot(b.feet[k][0]-a.feet[k][0],b.feet[k][2]-a.feet[k][2])*60);}}
  slips.sort((x,y)=>x-y);const q=p=>slips.length?slips[Math.min(slips.length-1,Math.floor(p*slips.length))]:null;
  // Draw-hand on the string (review P2): judged on COMPLETED draws (followed by the impact frame),
  // at full draw. Interrupted draws (dodge) are excluded. Units: scene units; the actor is 2.2 x 1.2 = 2.64 tall.
  const draws=[];let cur=[];
  for(let i=0;i<frames.length;i++){const f=frames[i];if(f.phase==='windup')cur.push(f);else{if(cur.length&&f.impactNow)draws.push(cur);cur=[];}}
  const fullDraw=draws.map(d=>({start:d[0].t,frames:d.length,finalNockHand:d.at(-1).nockHand,lastQuarterMean:d.slice(Math.floor(d.length*.75)).reduce((a,x)=>a+x.nockHand,0)/Math.max(1,d.length-Math.floor(d.length*.75)),midDrawMax:Math.max(...d.map(x=>x.nockHand))}));
  const impacts=frames.filter(f=>f.impactNow);
  return {
    frames:frames.length,
    gripErrorMax:max(pick(f=>f.gripError!==undefined&&f.phase!=='run','gripError')),bowInHandFrames:frames.filter(f=>f.phase!=='run').length,
    nockHandDuringDrawMean:mean(pick(f=>f.phase==='windup','nockHand')),nockHandDuringDrawMax:max(pick(f=>f.phase==='windup','nockHand')),
    impacts:impacts.map(f=>({t:f.t,aimError:f.aimError,yawError:f.yawError,arrowVisibleOnImpactFrame:f.arrowVisible})),
    aimErrorDuringDrawMax:max(pick(f=>f.phase==='windup','aimError')),
    plantedFootSlipMedian:q(.5),plantedFootSlipP90:q(.9),plantedSamples:slips.length,
    yawErrorMaxWhileRunning:max(pick(f=>f.phase==='run','yawError')),
    arrowVisibleDuringDodge:frames.some(f=>f.phase==='dodge'&&f.arrowVisible),
    drawFrames:frames.filter(f=>f.phase==='windup').length,completedDraws:fullDraw,
  };
};
try{
  await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('server timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('5193')){clearTimeout(t);resolve();}});server.on('error',reject);});
  browser=await chromium.launch({...(process.env.MYTHWOOD_CHROMIUM_PATH?{executablePath:process.env.MYTHWOOD_CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1200,height:900}});
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.route('**/*',r=>{if(new URL(r.request().url()).origin==='http://127.0.0.1:5193')return r.continue();report.external.push(r.request().url());return r.abort();});
  await page.goto('http://127.0.0.1:5193/tools/daria-combat/');await page.waitForFunction(()=>window.combatReady);
  for(const variant of ['refined','pass01']){
    assert.equal(await page.evaluate(v=>window.combatSetup(v),variant),true);
    const frames=[];const shots=new Set(['0.5','1.2','1.66','2.42','3.05','3.1','4.1','4.17']);
    for(;;){const f=await page.evaluate(()=>window.combatStep());if(f.done)break;frames.push(f);
      const key=String(+f.t.toFixed(2));
      if(shots.has(key)||f.impactNow){await page.evaluate(()=>window.combatRender(true));await page.locator('canvas').screenshot({path:`${out}/${variant}-${key.replace('.','_')}${f.impactNow?'-impact':''}.png`});}
    }
    report.variants[variant]={summary:stats(frames)};
    await writeFile(`${out}/${variant}-frames.json`,JSON.stringify(frames));
  }
  report.layer=await page.evaluate(()=>window.layerCheck('pass01'));
  // Acceptance criteria for the playable model (the previous model is measured for comparison only).
  const a=report.variants.pass01.summary;
  assert.ok(a.gripErrorMax<.01,'Arco nel punto di presa della mano');
  assert.ok(a.impacts.length===3&&a.impacts.every(i=>i.aimError<2),'Al colpo l\'arco punta il bersaglio (<2°)');
  assert.ok(a.plantedFootSlipMedian<1.5,'Piede d\'appoggio quasi fermo in corsa (mediana <1,5 m/s)');
  const L=report.layer,mx=o=>Math.max(...Object.values(o));
  assert.ok(mx(L.upperMovingVsStanding)<1,'Tiro in movimento: busto e braccia restano nella posa del tiro (review P1)');
  assert.ok(mx(L.legsMovingVsStanding)>5,'Tiro in movimento: le gambe seguono la corsa');
  assert.ok(L.repeatDrift<1e-6,'Stesso tempo ripetuto: nessuna deriva');
  // 0.10 scene units = 3.8% of the actor height: the hand visibly holds the nock at release.
  assert.ok(a.completedDraws.length===3&&a.completedDraws.every(d=>d.finalNockHand<=.10),'A trazione completa la mano destra è sulla cocca (≤0,10, review P2)');
  assert.equal(a.arrowVisibleDuringDodge,false,'La schivata interrompe tiro e freccia');
  assert.ok(a.impacts.every(i=>i.arrowVisibleOnImpactFrame===false),'Freccia incoccata solo fino al rilascio');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';
  console.log(JSON.stringify(Object.fromEntries(Object.entries(report.variants).map(([k,v])=>[k,v.summary])),null,1));
}catch(e){report.status='failed';report.error=e.message;throw e;}
finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
