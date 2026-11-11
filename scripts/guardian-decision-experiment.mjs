// Isolated candidates, not a gameplay patch. Reserved source files stay byte-identical.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { restoreCheckpoint } from '../src/checkpoints.js';
import { CLASSES } from '../src/roles.js';
const out='test-results/guardian-decision-experiment';await mkdir(out,{recursive:true});
const original=await readFile('src/combat.js','utf8');
const marker='if (stagger > 0 && enemy.hp > 0) {';
assert.equal(original.split(marker).length,2,'Candidate patch must match exactly once');
const variants={
 baseline:marker,
 'tempered-once':'if (stagger > 0 && enemy.hp > 0 && (!enemy.boss || !enemy.experimentalTempered)) { if (enemy.boss) enemy.experimentalTempered = true;',
 'basic-no-stagger':'if (stagger > 0 && enemy.hp > 0 && (!enemy.boss || stagger !== .3)) {',
};
const rows=[];
for(const [variant,replacement] of Object.entries(variants)){
 let module=original.replace(marker,replacement);
 if(variant==='tempered-once'){
  const impact="enemy.phase = 'recovery'; enemy.recovery = enemy.recoveryDuration;";
  assert.equal(module.split(impact).length,2);
  module=module.replace(impact,impact+' enemy.experimentalTempered = false;');
 }
 module=module.replaceAll(/from '(\.\/[^']+)'/g,(_,relative)=>`from '${pathToFileURL(resolve('src',relative)).href}'`);
 const path=resolve(out,`${variant}.mjs`);await writeFile(path,module);const game=await import(pathToFileURL(path));
 for(const role of CLASSES)for(const policy of ['basic','spam','timed-dodge','impulse-on-charge']){
  const s=restoreCheckpoint({version:1,autoSave:false,role:role.id,stage:'awakened',traces:0});
  const boss=s.enemies.find(e=>e.boss);s.x=boss.x-2.5;s.z=boss.z;game.attuneArtifact(s,'ward');game.drainEvents(s);
  let impacts=0,damage=0,evaded=0,artifact=0,dodges=0;
  const dt=1/60;
  for(let frame=0;frame<120/dt&&boss.hp>0&&s.status==='playing';frame++){
   const timed=policy==='timed-dodge'&&boss.phase==='windup'&&boss.windup<=.10;
   const impulse=policy==='impulse-on-charge'&&boss.phase==='windup';
   if((timed||impulse)&&s.dashCooldown<=0&&s.stamina>=30){if(game.dodge(s,0,1))dodges++;}
   if(policy!=='basic'&&s.cooldown<=0)game.cast(s);
   game.tickCooldowns(s,dt);
   const dx=boss.x-2.5-s.x,dz=boss.z-s.z,d=Math.hypot(dx,dz);
   if(d>.001)game.movePlayer(s,dx/d*Math.min(1,d/(5*dt)),dz/d*Math.min(1,d/(5*dt)),dt);
   game.advanceEnemies(s,dt);if(!s.action)game.attack(s);
   for(const e of game.drainEvents(s)){
    if(e.type==='enemy-impact'&&e.enemyId===boss.id)impacts++;
    if(e.type==='hurt')damage+=e.amount;
    if(e.type==='evaded')evaded++;
    if(e.type==='artifact-triggered')artifact++;
   }
  }
  rows.push({variant,role:role.id,policy,outcome:boss.hp<=0?'won':s.status==='defeated'?'lost':'timeout',seconds:+s.time.toFixed(2),impacts,incomingDamage:damage,evaded,artifactTriggers:artifact,dodges,
   satisfiesToninoBasicThreshold:policy==='basic'?(impacts>=1||s.time>=15):null});
 }
}
assert.equal(await readFile('src/combat.js','utf8'),original,'Reserved combat source must remain unchanged');
const report={scope:'Experimental stagger rules only in temporary modules. Tempered candidate blocks further staggers after the first, until an enemy attack completes; resets at that impact. Six evolved classes, 120s cap, legitimate checkpoint, 1/60s. Not a shipped change or human playtest. Timed-dodge reacts with perfect knowledge of simulation windup.',sourceSha256:createHash('sha256').update(original).digest('hex'),variants,rows};
await writeFile(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(rows.filter(r=>r.policy==='basic'),null,2));
