import {restoreCheckpoint} from '../../../src/checkpoints.js';
import {attack,tickCooldowns,drainEvents} from '../../../src/game.js';
import {writeFile} from 'node:fs/promises';
const s=restoreCheckpoint({version:1,autoSave:false,role:'ranger',stage:'awakened',traces:0});
const boss=s.enemies.find(e=>e.boss);s.x=boss.x;s.z=boss.z+8;s.artifact.surgeCharge=3;
attack(s);const events=[];
while(!s.projectiles.length){tickCooldowns(s,.02);events.push(...drainEvents(s));}
const id=events.find(e=>e.type==='surge-consumed').id;
boss.hp=0;boss.phase='dead';
for(let i=0;i<100&&s.projectiles.length;i++){tickCooldowns(s,.02);events.push(...drainEvents(s));}
const result={chargeId:id,projectilesRemaining:s.projectiles.length,consumed:events.filter(e=>e.type==='surge-consumed').length,landed:events.filter(e=>e.type==='hit'&&e.chargeId===id).length,misses:events.filter(e=>e.type==='miss'&&e.chargeId===id).length,events};
await writeFile(process.argv[2]||'test-results/pr4-independent/projectile-loss.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
