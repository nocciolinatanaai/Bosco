import * as THREE from 'three';

export function createTelegraph() {
  const mat = (color, opacity) => new THREE.MeshBasicMaterial({ color, opacity, side: THREE.DoubleSide, transparent: true, depthWrite: false });
  const marker = new THREE.Mesh(new THREE.RingGeometry(.01, 1, 64), mat('#f3686c', .25));
  marker.rotation.x = -Math.PI / 2; marker.visible = false;
  const outline = new THREE.Mesh(new THREE.RingGeometry(.985, 1, 64), mat('#ffe0ca', .85));
  outline.position.z = .012; marker.add(outline);
  const fill = new THREE.Mesh(new THREE.CircleGeometry(1, 48), mat('#ff9575', .2));
  fill.position.z = .008; marker.add(fill);
  const inner = new THREE.Mesh(new THREE.RingGeometry(.69, .705, 64), mat('#e4d8ff', .9));
  inner.position.z = .014; marker.add(inner);
  marker.userData.chargeFill = fill; marker.userData.novaRing = inner;
  return marker;
}

// Unit geometry scales to the exact damage radius, including attack changes.
export function updateTelegraph(marker, enemy) {
  const nova = enemy.attackKind === 'nova';
  const progress = enemy.sealed ? 0 : Math.min(1, Math.max(0, 1 - enemy.windup / enemy.chargeDuration));
  marker.visible = enemy.hp > 0 && (enemy.sealed || enemy.phase === 'windup');
  marker.position.set(enemy.sealed ? enemy.x : enemy.aimX, .075, enemy.sealed ? enemy.z : enemy.aimZ);
  marker.scale.setScalar(enemy.radius);
  marker.material.color.set(enemy.sealed ? '#ada7e4' : nova ? '#b18be9' : '#f3686c');
  marker.material.opacity = enemy.sealed ? .08 : .14 + progress * .34;
  marker.userData.chargeFill.scale.setScalar(Math.max(.01, progress));
  marker.userData.chargeFill.material.color.set(nova ? '#c5a5ff' : '#ff9575');
  marker.userData.novaRing.visible = nova && !enemy.sealed;
}
