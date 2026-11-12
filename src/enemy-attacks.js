// Deterministic sequence: the player can learn the boss instead of guessing.
export const GUARDIAN_ATTACKS = Object.freeze([
  Object.freeze({ id: 'fracture', name: 'Frattura', radius: 3.6, windup: 1.15, recovery: 1.5, damage: 26, centered: false }),
  Object.freeze({ id: 'nova', name: 'Onda del sigillo', radius: 5.2, windup: 1.65, recovery: 2, damage: 32, centered: true }),
]);
const STRIKE = Object.freeze({ id: 'strike', radius: 1.8, windup: .9, recovery: 1, damage: 12, centered: false });
// COMBAT-01: oltre questa distanza il Custode non lancia l'Onda (centrata su di lui, a vuoto):
// la casella dell'Onda diventa una Frattura mirata. Un solo passo del contatore per attacco.
export const GUARDIAN_NEAR = 6;
export const GUARDIAN_REACH = 16;
export const GUARDIAN_PROVOKE = 8;

export function guardianAttackFor(attackCount, distance) {
  const slot = GUARDIAN_ATTACKS[attackCount % GUARDIAN_ATTACKS.length];
  return slot.centered && distance > GUARDIAN_NEAR ? GUARDIAN_ATTACKS[0] : slot;
}

export function prepareEnemyAttack(enemy, player) {
  const distance = Math.hypot(player.x - enemy.x, player.z - enemy.z);
  const attack = enemy.boss ? guardianAttackFor(enemy.attackCount, distance) : STRIKE;
  enemy.attackCount += 1; enemy.attackKind = attack.id;
  enemy.reach = Boolean(enemy.boss && distance > GUARDIAN_NEAR);
  enemy.radius = attack.radius; enemy.chargeDuration = attack.windup;
  enemy.recoveryDuration = attack.recovery; enemy.impactDamage = attack.damage;
  enemy.aimX = attack.centered ? enemy.x : player.x;
  enemy.aimZ = attack.centered ? enemy.z : player.z;
  enemy.windup = attack.windup; enemy.phase = 'windup';
}
