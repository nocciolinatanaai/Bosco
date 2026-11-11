// Diagnostic experiment, not a balance patch or proof of human difficulty.
import { CLASSES, attack, cast, movePlayer, tickCooldowns, advanceEnemies, drainEvents, interactGarden, attuneArtifact } from '../src/game.js';
import { restoreCheckpoint } from '../src/checkpoints.js';
import { writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const dt=1/60, horizon=120;
const results=[];
for(const encounter of ['guardian','sentry'])for(const role of CLASSES)for(const policy of ['basic-close','basic-skill-close','basic-skill-far','stationary-skill-close','stationary-skill-far','ranger-outside-aggro']){
 if(policy==='ranger-outside-aggro'&&role.id!=='ranger')continue;
 const state=restoreCheckpoint({version:1,autoSave:false,role:role.id,stage:encounter==='guardian'?'awakened':'guardian',traces:encounter==='guardian'?0:3});
 if(encounter==='sentry')interactGarden(state,'enter');
 const enemy=state.enemies.find(e=>encounter==='guardian'?e.boss:e.type==='sentry');
 attuneArtifact(state,'ward');
 const distance=policy==='ranger-outside-aggro'?14.25:policy.includes('far')?role.basicRange*1.2-.15:2.5;
 const offset=encounter==='sentry'&&policy.includes('far')||policy==='ranger-outside-aggro'?{x:0,z:distance}:{x:-distance,z:0};
 state.x=enemy.x+offset.x;state.z=enemy.z+offset.z;drainEvents(state);
 let impacts=0,windups=0,hurtTotal=0,artifactTriggers=0,interruptions=0,firstImpact=null,minDistance=Infinity,maxDistance=0;
 for(let frame=0;frame<horizon/dt&&enemy.hp>0&&state.status==='playing';frame++){
  if(policy!=='basic-close'&&state.cooldown<=0)cast(state);
  const wasWindup=enemy.phase==='windup';tickCooldowns(state,dt);
  if(wasWindup&&enemy.hp>0&&enemy.stagger>0&&enemy.windup===0)interruptions++;
  // Follow an offset using real public movement and collision rules; never reset position after setup.
  const dx=enemy.x+offset.x-state.x,dz=enemy.z+offset.z-state.z,d=Math.hypot(dx,dz);
  if(!policy.startsWith('stationary')&&d>.001)movePlayer(state,dx/d*Math.min(1,d/(5*dt)),dz/d*Math.min(1,d/(5*dt)),dt);
  advanceEnemies(state,dt);if(!state.action)attack(state);
  const separation=Math.hypot(state.x-enemy.x,state.z-enemy.z);minDistance=Math.min(minDistance,separation);maxDistance=Math.max(maxDistance,separation);
  for(const event of drainEvents(state)){
   if(event.type==='enemy-windup'&&event.enemyId===enemy.id)windups++;
   if(event.type==='enemy-impact'&&event.enemyId===enemy.id){impacts++;firstImpact??=state.time;}
   if(event.type==='hurt')hurtTotal+=event.amount;
   if(event.type==='artifact-triggered')artifactTriggers++;
  }
 }
 const round=n=>n===null?null:Math.round(n*100)/100;
 results.push({encounter,role:role.id,policy,startDistance:round(distance),outcome:enemy.hp<=0?'enemy-defeated':state.status==='defeated'?'player-defeated':'timeout',seconds:round(state.time),enemyHp:enemy.hp,windups,impacts,firstImpact:round(firstImpact),incomingDamage:hurtTotal,remainingPlayerHp:round(state.hp),interruptions,artifactTriggers,minDistance:round(minDistance),maxDistance:round(maxDistance)});
}
const report={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dt,horizon,scope:'Six evolved classes; legitimate milestone fixtures; enemy initial state unchanged; attack held, skill requested as available, no dodge, public movement follows offset at speed 5. Stationary policies perform no movement. Other policies follow a fixed offset at speed 5. Ward equipped, never dodge. No renderer, latency or human behaviour.',results};
await mkdir('test-results/balance-probe',{recursive:true});await writeFile('test-results/balance-probe/report.json',JSON.stringify(report,null,2));
console.log('| Nemico | Classe | Strategia | Esito | s | Cariche | Impatti | Danno ricevuto | Interruzioni |');console.log('|---|---|---|---|---:|---:|---:|---:|---:|');
for(const r of results)console.log(`| ${r.encounter} | ${r.role} | ${r.policy} | ${r.outcome} | ${r.seconds} | ${r.windups} | ${r.impacts} | ${r.incomingDamage} | ${r.interruptions} |`);
