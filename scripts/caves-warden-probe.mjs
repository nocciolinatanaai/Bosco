const R = new URL('../', import.meta.url).pathname;
const G = await import(R + 'src/game.js'); const CP = await import(R + 'src/checkpoints.js'); const CV = await import(R + 'src/caves.js');
const { CLASSES, attack, cast, movePlayer, advanceEnemies, tickCooldowns, interactCaves, drainEvents } = G;
const fixture = role => ({version:3,attunement:'ward',autoSave:false,role,stage:'guardian',traces:3,garden:{step:4,area:'plaza',sentryDefeated:false}});
const cave = role => { const s = CP.restoreCheckpoint(fixture(role)); Object.assign(s, CV.CAVE_GATE); interactCaves(s, 'enter'); return s; };
const tick = (s, dt = .02) => { tickCooldowns(s, dt); advanceEnemies(s, dt); };
const walk = (s, tx, tz) => { let n = 0; while (Math.hypot(tx - s.x, tz - s.z) > .15 && n++ < 5000) { movePlayer(s, tx - s.x, tz - s.z, .02); tick(s); } return n * .02; };
console.log('A) Aggirare il Guardiano camminando lungo la parete (x=10), senza scatto né attacchi');
for (const c of CLASSES) { const s = cave(c.id), hp = s.hp; let t = walk(s, 10, 12); t += walk(s, 10, -13); t += walk(s, 0, -13);
  const e = s.enemies.find(e => e.type === 'warden'); const dLens = Math.hypot(s.x - e.x, s.z - e.z);
  for (let i = 0; i < 500; i++) tick(s);   // resta fermo 10 s sul banco della lente
  const got = interactCaves(s, 'lens'); t += walk(s, 10, -13); t += walk(s, 10, 12); t += walk(s, 0, 12); const out = interactCaves(s, 'return');
  const ev = drainEvents(s); console.log(' ', c.id.padEnd(9), 'lente', !!got, 'uscita', !!out, 'danni subiti', hp - s.hp, 'sigillo attivato', ev.some(x => /artifact/.test(x.type)), 'distanza banco-guardiano', dLens.toFixed(2), 'raggio', e.radius, 'tempo', t.toFixed(1) + 's'); }
console.log('B) Uccidere il Guardiano restando fuori dal cerchio (distanza 5,2), solo attacco base e abilità');
for (const c of CLASSES) { const s = cave(c.id), hp = s.hp, e = s.enemies.find(e => e.type === 'warden'); walk(s, 0, -2.8); let t = 0, dodges = 0;
  while (e.hp > 0 && t < 120 && s.status === 'playing') { cast(s) || attack(s); tick(s); t += .02; }
  console.log(' ', c.id.padEnd(9), 'portata base', c.basicRange, 'abilità', c.range, '→ guardiano PV', e.hp, 'in', t.toFixed(1) + 's', 'danni subiti', hp - s.hp, 'distanza', Math.hypot(s.x - e.x, s.z - e.z).toFixed(1)); }
console.log('C) Corpo a corpo: resto attaccato al Guardiano e incasso');
for (const c of CLASSES) { const s = cave(c.id), hp = s.hp, e = s.enemies.find(e => e.type === 'warden'); walk(s, 0, -5.5); let t = 0;
  while (e.hp > 0 && t < 120 && s.status === 'playing') { cast(s) || attack(s); tick(s); t += .02; }
  console.log(' ', c.id.padEnd(9), 'guardiano PV', e.hp, 'in', t.toFixed(1) + 's', 'danni subiti', hp - s.hp, 'su', hp, s.status); }
