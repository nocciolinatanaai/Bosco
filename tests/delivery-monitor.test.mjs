import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseRefs, changedRefs, checkDeliveries } from '../scripts/lib/delivery-monitor.mjs';
const sha='a'.repeat(40),next='b'.repeat(40),branch='refs/heads/mythwood/collaboration-base';
test('monitor filters unrelated branches and detects both changes and deleted PR refs',()=>{
 assert.deepEqual(parseRefs(`${sha}\t${branch}\n${sha}\trefs/heads/main\n`),{[branch]:sha});
 assert.throws(()=>parseRefs('bad refs/pull/1/head'),/Malformed/);
 assert.deepEqual(changedRefs({[branch]:sha,'refs/pull/1/head':sha},{[branch]:next}),[
  {ref:branch,before:sha,after:next},{ref:'refs/pull/1/head',before:sha,after:null},
 ]);
});
test('monitor baselines once and emits one event per observed transition',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'mythwood-monitor-'));
 try{
  const initial=()=>Promise.resolve(`${sha}\t${branch}\n`);
  assert.equal((await checkDeliveries(dir,initial)).status,'baseline-recorded');
  assert.equal((await checkDeliveries(dir,initial)).status,'unchanged');
  const updated=()=>Promise.resolve(`${sha}\t${branch}\n${next}\trefs/pull/2/head\n`);
  const result=await checkDeliveries(dir,updated);assert.equal(result.status,'new-delivery');
  assert.equal(result.event.agentAwakened,false);assert.equal(result.event.externalNotificationSent,false);
  assert.equal((await checkDeliveries(dir,updated)).status,'unchanged');
  assert.equal((await readdir(join(dir,'events'))).length,1);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('failed or incomplete remote reads preserve the baseline and release the lock',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'mythwood-monitor-'));
 try{
  await checkDeliveries(dir,async()=>`${sha}\t${branch}\n`);
  const before=await readFile(join(dir,'state.json'),'utf8');
  await assert.rejects(checkDeliveries(dir,async()=>{throw Error('offline');}),/offline/);
  await assert.rejects(checkDeliveries(dir,async()=>''),/missing/);
  assert.equal(await readFile(join(dir,'state.json'),'utf8'),before);
  assert.equal((await checkDeliveries(dir,async()=>`${sha}\t${branch}\n`)).status,'unchanged');
 }finally{await rm(dir,{recursive:true,force:true});}
});
