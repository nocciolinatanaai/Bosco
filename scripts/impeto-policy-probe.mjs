// Policy counterfactuals, not an Impeto/balance patch. Reuses Tonino's isolated rules.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const out=resolve(process.argv[2]||'test-results/impeto-policy');await mkdir(out,{recursive:true});
const source=await readFile('scripts/decision-experiment-02.mjs','utf8');
const marker='const rows = [], wards = [];';assert.equal(source.split(marker).length,2);
assert.equal(source.split('function wardProbe(').length,2);
let module=source.split(marker)[0].split('function wardProbe(')[0];
function once(before,after){assert.equal(module.split(before).length,2,`Probe anchor changed: ${before}`);module=module.replace(before,after);}
once("function run(g, roleId, policy, attunement = 'ward')", "function run(g, roleId, policy, attunement = 'ward', schedule = 'eager', dodgeMode = 'radial-original')");
once('const m = { completedAttacks:', 'const trace=[]; const m = { completedAttacks:');
once("if (policy !== 'basic' && s.cooldown <= 0) g.cast(s);", "if (policy !== 'basic' && s.cooldown <= 0 && (schedule === 'eager' || s.time < .01 || (schedule === 'finish-combo' && !s.action && s.combo === 3))) g.cast(s);");
once('const dx = s.x - boss.aimX, dz = s.z - boss.aimZ', "const dx = dodgeMode==='tangent'?0:s.x - boss.aimX, dz = dodgeMode==='tangent'?1:s.z - boss.aimZ");
once('for (const e of g.drainEvents(s)) {', `for (const e of g.drainEvents(s)) {
 if(['action-start','hit','artifact-triggered','evaded','miss'].includes(e.type)) trace.push({
  time:+s.time.toFixed(3),event:e.type,kind:e.kind,combo:e.combo,amount:e.amount,bossHp:boss.hp,
  distance:+Math.hypot(s.x-boss.x,s.z-boss.z).toFixed(3),facing:{...s.facing},
  player:{x:s.x,z:s.z},enemy:{x:boss.x,z:boss.z},
  action:s.action?{kind:s.action.kind,range:s.action.range,facing:{...s.action.facing}}:null,
  cooldown:+s.cooldown.toFixed(3)});`);
once('seconds: +s.time.toFixed(2), ...m', 'seconds: +s.time.toFixed(2), schedule, dodgeMode, trace, ...m');
module=module.replaceAll(/from '(\.\.\/src\/[^']+)'/g,(_,path)=>`from '${pathToFileURL(resolve('scripts',path)).href}'`);
module+=`
const rows=[];const g=await load('tempered',variants.tempered);
for(const role of CLASSES)for(const schedule of ['eager','finish-combo','initial-only'])
 for(const attunement of ['ward','surge'])for(const dodgeMode of ['radial-original','tangent'])
  rows.push({role:role.id,attunement,...run(g,role.id,'timed-dodge',attunement,schedule,dodgeMode)});
assert.equal(await readFile('src/combat.js','utf8'),combatSrc);
assert.equal(await readFile('src/artifacts.js','utf8'),artifactSrc);
await writeFile(resolve(out,'report.json'),JSON.stringify({scope:'72 policy counterfactuals. Reuses tempered candidate; no shipped source changes, no humans. Exact simulation timer known to dodge bot.',rows},null,2)+'\\n');
console.log(JSON.stringify(rows.map(({role,attunement,schedule,dodgeMode,seconds})=>({role,attunement,schedule,dodgeMode,seconds})),null,2));
`;
const generated=resolve(out,'probe.mjs');await writeFile(generated,module);
execFileSync(process.execPath,[generated,out],{stdio:'inherit'});
