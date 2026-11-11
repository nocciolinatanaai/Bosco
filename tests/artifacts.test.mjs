import {test} from 'node:test';import assert from 'node:assert/strict';
import {CLASSES,createSession,evolve,attuneArtifact,dodge,hurt,tickCooldowns,drainEvents} from '../src/game.js';
import {checkpointFromSession,restoreCheckpoint,validateCheckpoint} from '../src/checkpoints.js';
function awakened(role='ranger'){const s=createSession(role);for(const e of s.enemies.filter(e=>!e.boss))e.hp=0;evolve(s);return s;}
test('sigillo bloccato prima del ricordo e tecniche disponibili per tutte le classi',()=>{
 assert.equal(attuneArtifact(createSession('mage'),'ward'),false);
 for(const r of CLASSES)for(const mode of ['ward','surge']){const s=awakened(r.id);assert.equal(attuneArtifact(s,mode),true);assert.equal(attuneArtifact(s,'__proto__'),false);}
});
test('Custodia richiede un impatto evitato, non il solo comando di schivata',()=>{
 const s=awakened();attuneArtifact(s,'ward');dodge(s);assert.equal(s.shield,0);const hp=s.hp;
 hurt(s,40);assert.equal(s.hp,hp);assert.equal(s.shield,2.2);assert.equal(s.artifact.cooldown,6);
 hurt(s,40);assert.equal(drainEvents(s).filter(e=>e.type==='artifact-triggered').length,1);
 s.invulnerable=0;s.dodgeRemaining=0;assert.equal(hurt(s,40),10);
});
test('Impeto restituisce risorse con limiti e recupero indipendente',()=>{
 const s=awakened('mage');attuneArtifact(s,'surge');s.cooldown=3;dodge(s);hurt(s,20);
 assert.equal(s.stamina,88);assert.equal(s.cooldown,2.2);hurt(s,20);assert.equal(s.stamina,88);
 s.status='defeated';tickCooldowns(s,.05);assert.equal(s.artifact.cooldown,6);
});
test('non si cambia tecnica durante un’azione o per azzerare il recupero',()=>{
 const s=awakened();attuneArtifact(s,'ward');dodge(s);hurt(s,10);assert.equal(attuneArtifact(s,'surge'),false);
 s.dodgeRemaining=0;s.artifact.cooldown=0;s.x=0;s.z=-8;assert.equal(attuneArtifact(s,'surge'),false);
 s.x=0;s.z=12;assert.equal(attuneArtifact(s,'surge'),true);
});
test('tappa v3 conserva la scelta ma non i bonus temporanei; v1/v2 restano leggibili',()=>{
 const s=awakened();attuneArtifact(s,'surge');s.artifact.cooldown=4;
 const cp=checkpointFromSession(s);assert.equal(cp.version,3);assert.equal(cp.attunement,'surge');
 const restored=restoreCheckpoint(cp);assert.equal(restored.artifact.attunement,'surge');assert.equal(restored.artifact.cooldown,0);
 for(const version of [1,2]){const legacy={...cp,version};delete legacy.attunement;if(version===1)delete legacy.garden;assert.equal(validateCheckpoint(legacy).attunement,null);}
 assert.equal(validateCheckpoint({...cp,attunement:'admin'}),null);assert.equal(validateCheckpoint({...cp,stage:'arrival'}),null);
});
