// API pubblica della simulazione locale. Nessuna autorità su account o pagamenti.
export { CLASSES } from './roles.js';
export { createSession, selectedEnemy, setTarget, attack, cast, dodge, hurt, movePlayer,
  tickCooldowns, advanceEnemies, evolve, canEvolve, drainEvents } from './combat.js';
