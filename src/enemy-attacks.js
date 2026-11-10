// Deterministic sequence: the player can learn the boss instead of guessing.
export const GUARDIAN_ATTACKS = Object.freeze([
  Object.freeze({ id: 'fracture', name: 'Frattura', radius: 3.6, windup: 1.15, recovery: 1.5, damage: 26, centered: false }),
  Object.freeze({ id: 'nova', name: 'Onda del sigillo', radius: 5.2, windup: 1.65, recovery: 2, damage: 32, centered: true }),
]);
const STRIKE = Object.freeze({ id: 'strike', radius: 1.8, windup: .9, recovery: 1, damage: 12, centered: false });

export function prepareEnemyAttack(enemy, player) {
  const attack = enemy.boss ? GUARDIAN_ATTACKS[enemy.attackCount % GUARDIAN_ATTACKS.length] : STRIKE;
  enemy.attackCount += 1; enemy.attackKind = attack.id;
  enemy.radius = attack.radius; enemy.chargeDuration = attack.windup;
  enemy.recoveryDuration = attack.recovery; enemy.impactDamage = attack.damage;
  enemy.aimX = attack.centered ? enemy.x : player.x;
  enemy.aimZ = attack.centered ? enemy.z : player.z;
  enemy.windup = attack.windup; enemy.phase = 'windup';
}
