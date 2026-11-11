import { chromium } from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.MYTHWOOD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/tools/daria-review/');await page.waitForFunction(()=>window.dariaReady==='ready');
 const result=await page.evaluate(async()=>{
  const {createRangerActor}=await import('/src/visuals/ranger.js');
  const actors=[createRangerActor(),createRangerActor(),createRangerActor()];await Promise.all(actors.map(a=>a.root.userData.loadVisual()));
  const action={elapsed:.2,windup:.28,duration:.7,kind:'basic',facing:{x:0,z:1}};
  for(let frame=1;frame<=30;frame++)for(let j=0;j<3;j++){
   const r=actors[j].root;r.position.x=frame*.05;
   r.userData.animate(frame/60,j!==0,0,false,{action:j===2?null:action});r.updateMatrixWorld(true);
  }
  const bones=['torso','arm_upper_R','arm_lower_R','palm_R','arm_upper_L','palm_L'];
  const comparisons=bones.map(name=>{const q=actors.map(a=>a.root.getObjectByName(name)?.quaternion);return {name,present:q.every(Boolean),movingShotVsStandingShotDeg:q.every(Boolean)?q[1].angleTo(q[0])*180/Math.PI:null,movingShotVsRunDeg:q.every(Boolean)?q[1].angleTo(q[2])*180/Math.PI:null};});
  const r=actors[1].root,snapshot=()=>{const s=[];r.traverse(n=>{if(n.isBone)s.push(...n.quaternion.toArray());});return s;};
  const before=snapshot();r.userData.animate(.5,true,0,false,{action});r.updateMatrixWorld(true);const after=snapshot();
  const pausedDrift=Math.max(...before.map((v,i)=>Math.abs(v-after[i])));
  return {comparisons,pausedDrift,locomotion:actors.map(a=>a.root.userData.locomotion)};
 });console.log(JSON.stringify(result,null,2));await writeFile(process.argv[2]||'test-results/pr1-independent/layer-report.json',JSON.stringify(result,null,2));
}finally{await browser.close();}
