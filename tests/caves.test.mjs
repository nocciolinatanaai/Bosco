import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASSES, attack, createSession, interactCaves, interactGarden, movePlayer, advanceEnemies, tickCooldowns, dodge, drainEvents } from '../src/game.js';
import { restoreCheckpoint, checkpointFromSession, validateCheckpoint } from '../src/checkpoints.js';
import { caveObjective, CAVE_GATE, CAVE_ENTRY, CAVE_LENS } from '../src/caves.js';
import { gardenObjective } from '../src/garden.js';
const fixture = role => ({version:3,attunement:'ward',autoSave:false,role,stage:'guardian',traces:3,garden:{step:4,area:'plaza',sentryDefeated:false}});
function ready(role='ranger') { const s=restoreCheckpoint(fixture(role));Object.assign(s,CAVE_GATE);return s; }
function cave(role) { const s=ready(role);assert.equal(interactCaves(s,'enter'),true);return s; }
function step(s,seconds) { for(let t=0;t<seconds;t+=.02){tickCooldowns(s,.02);advanceEnemies(s,.02);} }

test('Cave: accesso dopo il segnale, vicinanza, uscita anticipata e nessuna cura/duplicazione',()=>{
 const locked=createSession('tank');Object.assign(locked,CAVE_GATE);assert.equal(interactCaves(locked,'enter'),false);locked.garden.step=4;assert.equal(interactCaves(locked,'enter'),false);
 const s=ready();s.x=0;assert.equal(interactCaves(s,'enter'),false);Object.assign(s,CAVE_GATE);s.hp=40;
 assert.equal(interactCaves(s,'enter'),true);assert.equal(s.hp,40);assert.equal(gardenObjective(s),null);
 assert.equal(interactGarden(s,'enter'),false);assert.equal(interactCaves(s,'lens'),false);
 assert.equal(interactCaves(s,'leave'),true);assert.equal(s.caves.step,1);
 assert.equal(interactCaves(s,'enter'),true);assert.equal(s.enemies.filter(e=>e.type==='warden').length,1);
});
test('Cave: lente e ritorno per tutte le classi, evento conclusivo una volta sola',()=>{
 for(const role of CLASSES){const s=cave(role.id);const hp=s.hp;Object.assign(s,CAVE_LENS);
 assert.equal(caveObjective(s).id,'lens');assert.equal(interactCaves(s,'lens'),true);assert.equal(interactCaves(s,'lens'),false);
 Object.assign(s,CAVE_ENTRY);assert.equal(interactCaves(s,'return'),true);assert.equal(s.area,'plaza');assert.equal(s.caves.step,3);assert.equal(s.hp,hp);
 assert.equal(drainEvents(s).filter(e=>e.completed).length,1);
 interactCaves(s,'enter');interactCaves(s,'return');assert.equal(drainEvents(s).filter(e=>e.completed).length,0);
 }
});
test('Rintocco: centro fisso, uscita dal volume e schivata reale attivano regole coerenti',()=>{
 const s=cave('mage'), e=s.enemies.find(e=>e.type==='warden');s.x=0;s.z=-6;e.timer=0;
 advanceEnemies(s,.02);assert.equal(e.phase,'windup');assert.equal(e.aimX,e.x);assert.equal(e.aimZ,e.z);
 s.x=7;const hp=s.hp;step(s,1.7);assert.equal(s.hp,hp);assert.equal(s.artifact.cooldown,0);
 e.phase='windup';e.windup=.02;s.x=4;s.z=-8;assert.equal(dodge(s,1,0),true);advanceEnemies(s,.02);
 assert.equal(s.hp,hp);assert.equal(s.artifact.cooldown,6);assert.ok(s.artifact.wardCharge>0);
 e.phase='windup';e.windup=.02;s.invulnerable=0;s.dodgeRemaining=0;advanceEnemies(s,.02);assert.equal(s.hp,hp-6,'Custodia: rintocco successivo ridotto del 75%');assert.equal(s.artifact.wardCharge,0);
 e.phase='windup';e.windup=.02;s.invulnerable=0;advanceEnemies(s,.02);assert.equal(s.hp,hp-6-22,'carica consumata: danno pieno');
 const phase=e.phase;s.area='plaza';step(s,1);assert.equal(e.phase,phase,'Nemico fuori area congelato');
});
test('Cave: confini di movimento e nessun bersaglio del Giardino attivo',()=>{
 const s=cave();for(let i=0;i<300;i++)movePlayer(s,1,-1,.05);assert.equal(s.x,10);assert.equal(s.z,-15);
 const sentry=s.enemies.find(e=>e.type==='sentry');const x=sentry.x;step(s,2);assert.equal(sentry.x,x);
});
test('Checkpoint v4: migrazione v3, tappe Cave e ritorno nel Giardino conservati',()=>{
 const legacy=fixture('ranger');assert.equal(validateCheckpoint(legacy).caves.step,0);
 const s=cave();Object.assign(s,CAVE_LENS);interactCaves(s,'lens');let cp=checkpointFromSession(s);
 assert.equal(cp.version,4);assert.equal(cp.caves.inside,true);let restored=restoreCheckpoint(cp);assert.equal(restored.area,'caves');assert.equal(restored.caves.step,2);assert.equal(restored.artifact.attunement,'ward');
 Object.assign(s,CAVE_ENTRY);interactCaves(s,'return');s.x=38.5;interactGarden(s,'enter');cp=checkpointFromSession(s);restored=restoreCheckpoint(cp);
 assert.equal(restored.area,'garden');assert.equal(restored.z,11);assert.equal(restored.caves.step,3);
 for(const caves of [{...cp.caves,step:9},{...cp.caves,inside:'true'},{...cp.caves,extra:1},{step:0,inside:true,wardenDefeated:false}])assert.equal(validateCheckpoint({...cp,caves}),null);
 assert.equal(validateCheckpoint({...cp,garden:{...cp.garden,step:2}}),null);
});

test('Guardiano sconfitto: evento, salvataggio e rivisita non lo rigenerano',()=>{
 const s=cave('mage'), e=s.enemies.find(e=>e.type==='warden');s.x=4;s.z=-8;
 for(let i=0;i<50&&e.hp>0;i++){attack(s);for(let n=0;n<40;n++)tickCooldowns(s,.02);}
 assert.equal(e.hp,0);assert.equal(s.caves.wardenDefeated,true);
 assert.equal(drainEvents(s).filter(e=>e.interaction==='warden').length,1);
 const restored=restoreCheckpoint(checkpointFromSession(s));assert.equal(restored.enemies.find(e=>e.type==='warden').hp,0);
 Object.assign(restored,CAVE_ENTRY);interactCaves(restored,'leave');interactCaves(restored,'enter');
 assert.equal(restored.enemies.filter(e=>e.type==='warden').length,1);assert.equal(restored.enemies.find(e=>e.type==='warden').hp,0);
});

// ── Tonino, 11/11: il Guardiano deve arrivare a suonare e il Sigillo deve servire ──
import { cast as castSkill } from '../src/game.js';
import { memoryFor } from '../src/journey.js';
function mash(role, seconds = 120) { const s = cave(role), e = s.enemies.find(x => x.type === 'warden'); Object.assign(s, { x: 0, z: -5.5 }); let t = 0, novas = 0;
  while (e.hp > 0 && t < seconds && s.status === 'playing') { castSkill(s) || attack(s); tickCooldowns(s, .02); advanceEnemies(s, .02); novas += drainEvents(s).filter(x => x.type === 'enemy-impact').length; t += .02; }
  return { s, e, t, novas }; }
test('Rintocco: nessuna classe abbatte il Guardiano premendo soltanto Attacco/Abilità prima che suoni', () => {
  for (const role of CLASSES) { const r = mash(role.id); assert.ok(r.novas >= 1, role.id + ': il Guardiano muore senza aver mai suonato (' + r.t.toFixed(1) + ' s)'); }
});
test('Rintocco: dopo un’interruzione il rintocco successivo arriva prima e non si interrompe, ma si schiva (Sigillo attivo)', () => {
  const s = cave('ranger'), e = s.enemies.find(x => x.type === 'warden'); Object.assign(s, { x: 0, z: -4 });
  step(s, .6); assert.equal(e.phase, 'windup'); assert.equal(e.resolute, false);
  assert.equal(castSkill(s), true); step(s, .6); assert.notEqual(e.phase, 'windup', 'il primo rintocco si interrompe');
  let guard = 0; while (e.phase !== 'windup' && guard++ < 400) step(s, .02);
  assert.equal(e.resolute, true); s.cooldown = 0; castSkill(s); step(s, .7); assert.equal(e.phase, 'windup', 'il rintocco temprato non si interrompe');
  const hp = s.hp; e.windup = .02; s.action = null; assert.equal(dodge(s, 1, 0), true); advanceEnemies(s, .02);
  assert.equal(s.hp, hp); assert.equal(s.artifact.cooldown, 6, 'la schivata d’impatto attiva il Sigillo'); assert.equal(e.resolute, false);
});
test('Rintocco: il banco della lente è dentro il cerchio, la parete laterale resta sicura', () => {
  const s = cave('healer'), e = s.enemies.find(x => x.type === 'warden');
  assert.ok(Math.hypot(CAVE_LENS.x - e.x, CAVE_LENS.z - e.z) < e.radius); assert.ok(Math.hypot(10 - e.x, -8 - e.z) > e.radius);
});
test('Finale delle Cave: il testo ricorda se il Guardiano suona ancora o è stato zittito', () => {
  const a = cave('mage'), b = cave('mage'); b.caves.wardenDefeated = true;
  assert.match(memoryFor(a, 'caves').body, /Finché suona/); assert.match(memoryFor(b, 'caves').body, /ora tacciono/);
  assert.equal(memoryFor(a, 'garden').body.includes('rintocco'), false);
});
