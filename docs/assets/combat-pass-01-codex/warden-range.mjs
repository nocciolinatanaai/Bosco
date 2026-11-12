import {restoreCheckpoint} from '../../../src/checkpoints.js';
import {interactCaves,attack,cast,tickCooldowns,advanceEnemies,drainEvents} from '../../../src/game.js';
import {writeFile} from 'node:fs/promises';
const rows=[];for(const role of ['mage','ranger','healer']){
 const s=restoreCheckpoint({version:3,attunement:null,autoSave:false,role,stage:'guardian',traces:3,garden:{step:4,area:'plaza',sentryDefeated:false}});
 s.x=35;s.z=7;interactCaves(s,'enter');const w=s.enemies.find(e=>e.type==='warden');
 const startDistance=s.role.basicRange*1.2-.15;s.x=w.x;s.z=w.z+startDistance;drainEvents(s);let impacts=0,damage=0;
 for(let f=0;f<6000&&w.hp>0&&s.status==='playing';f++){if(!cast(s))attack(s);tickCooldowns(s,.02);advanceEnemies(s,.02);for(const e of drainEvents(s)){if(e.type==='enemy-impact')impacts++;if(e.type==='hurt')damage+=e.amount;}}
 rows.push({role,startDistance,won:w.hp<=0,time:+s.time.toFixed(2),impacts,damage});
}
await writeFile(process.argv[2]||'test-results/pr4-independent/warden-range.json',JSON.stringify(rows,null,2));console.log(rows);
