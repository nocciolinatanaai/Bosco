import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, unlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { queueRequest, loadRequest, recordReply, processNext, reviewPrompt } from '../scripts/lib/agent-exchange.mjs';
const exec = promisify(execFile);
async function fixture(t) {
 const root=await mkdtemp(path.join(os.tmpdir(),'mythwood-exchange-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(path.join(root,'src'));await writeFile(path.join(root,'src/caves.js'),'export const value = 1;\n');
 await mkdir(path.join(root,'docs'));await writeFile(path.join(root,'docs/CAVES_01.md'),'Cave fixture');
 await exec('git',['init','--quiet'],{cwd:root});await exec('git',['add','src/caves.js','docs/CAVES_01.md'],{cwd:root});
 await exec('git',['-c','user.name=Test','-c','user.email=test@example.invalid','commit','--quiet','-m','fixture'],{cwd:root});
 return {root,queue:path.join(root,'exchange')};
}
test('scambio: include soltanto snapshot committato e rifiuta segreti/percorso arbitrario',async t=>{
 const {root,queue}=await fixture(t);await writeFile(path.join(root,'src/caves.js'),'uncommitted secret');
 const request=await queueRequest(root,queue,'Rivedi il combattimento',['src/caves.js']);assert.equal(request.context[0].content,'export const value = 1;\n');
 for(const file of ['.env','../src/caves.js','/etc/passwd','docs/private.json'])await assert.rejects(queueRequest(root,queue,'review',[file]));
 assert.ok(reviewPrompt(request).includes('untrusted review data'));
 const documented=await queueRequest(root,queue,'Review mission',['docs/CAVES_01.md']);assert.equal(documented.context[0].content,'Cave fixture');
});
test('scambio: risposta vincolata a ID/hash/commit e non sovrascrivibile',async t=>{
 const {root,queue}=await fixture(t),r=await queueRequest(root,queue,'review',['src/caves.js']),loaded=await loadRequest(queue,r.id);
 await assert.rejects(recordReply(queue,r.id,'wrong','review','test-double'),/differente/);
 const reply=await recordReply(queue,r.id,loaded.digest,'Simulated review','test-double');assert.equal(reply.commit,r.commit);
 await assert.rejects(recordReply(queue,r.id,loaded.digest,'replacement','test-double'),e=>e.code==='EEXIST');
 await assert.rejects(loadRequest(queue,'../../.env'),/ID non valido/);
});
test('scambio: due worker concorrenti non consumano due volte la richiesta',async t=>{
 const {root,queue}=await fixture(t);await queueRequest(root,queue,'review',['src/caves.js']);let calls=0;
 const worker=async()=>{calls++;return {provider:'test-double',text:'Review simulated, not Claude'};};
 const results=await Promise.all([processNext(queue,worker),processNext(queue,worker)]);
 assert.equal(calls,1);assert.equal(results.filter(Boolean).length,1);assert.equal(await processNext(queue,worker),null);
 const reply=results.find(Boolean);await unlink(path.join(queue,'replies',`${reply.id}.json`));
 assert.equal(await processNext(queue,worker),null,'Completed claim prevents implicit paid retry even if response deleted');
});
test('scambio: fallimento resta bloccato, senza tentativi di modello automatici',async t=>{
 const {root,queue}=await fixture(t),r=await queueRequest(root,queue,'review',['src/caves.js']);let calls=0;
 await assert.rejects(processNext(queue,async()=>{calls++;throw Error('offline');}),/offline/);
 assert.equal(await processNext(queue,async()=>{calls++;return {provider:'test-double',text:'unexpected'};}),null);assert.equal(calls,1);
 assert.ok((await readFile(path.join(queue,'claims',`${r.id}.json.failed`),'utf8')).includes('offline'));
});
test('scambio: alterazione dello snapshot rilevata prima di invocare il worker',async t=>{
 const {root,queue}=await fixture(t),r=await queueRequest(root,queue,'review',['src/caves.js']);r.context[0].content='tampered';
 await writeFile(path.join(queue,'requests',`${r.id}.json`),JSON.stringify(r));let calls=0;
 await assert.rejects(processNext(queue,async()=>{calls++;return {provider:'test-double',text:'unexpected'};}),/alterato/);assert.equal(calls,0);
});
