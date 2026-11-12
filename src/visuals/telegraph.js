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
  // Frattura a distanza: una traccia a terra lega il Custode al cerchio sul giocatore,
  // così il colpo non arriva «dal nulla». Forma, non solo colore.
  const tether = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat('#ffe0ca', .7));
  tether.position.z = .01; tether.visible = false; marker.add(tether);
  marker.userData.tether = tether;
  return marker;
}

// Unit geometry scales to the exact damage radius, including attack changes.
export function updateTelegraph(marker, enemy) {
  if (marker.userData.beam) {
    marker.visible = enemy.hp > 0 && enemy.phase === 'windup';
    marker.position.set(enemy.x, .09, enemy.z); marker.rotation.y = Math.atan2(enemy.beamDX, enemy.beamDZ);
    const line = marker.userData.line, fill = marker.userData.fill;
    line.scale.set(enemy.beamWidth, 1, enemy.beamLength); line.position.z = enemy.beamLength / 2;
    const progress = Math.max(.01, Math.min(1, 1 - enemy.windup / enemy.chargeDuration));
    fill.scale.set(enemy.beamWidth * .6, 1, enemy.beamLength * progress); fill.position.z = enemy.beamLength * progress / 2;
    fill.material.opacity = .35 + progress * .45; return;
  }
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
  const tether = marker.userData.tether;
  if (tether) {
    tether.visible = Boolean(enemy.reach) && enemy.phase === 'windup' && !enemy.sealed;
    if (tether.visible) {
      // Coordinate locali del disco (ruotato di −90° su x e scalato sul raggio): y locale = −z mondo.
      const r = Math.max(.01, enemy.radius), dx = (enemy.x - enemy.aimX) / r, dy = -(enemy.z - enemy.aimZ) / r;
      const length = Math.hypot(dx, dy), start = 1; // dal bordo del cerchio verso il Custode
      tether.visible = length > start;
      tether.scale.set(Math.max(0, length - start), .09 / r * 3, 1);
      tether.rotation.z = Math.atan2(dy, dx);
      tether.position.x = dx / length * (start + length) / 2; tether.position.y = dy / length * (start + length) / 2;
    }
  }
}


export function createBeamTelegraph() {
  const marker = new THREE.Group(); marker.userData.beam = true;
  const material = new THREE.MeshBasicMaterial({ color: '#d1b37a', transparent: true, opacity: .25, depthWrite: false });
  const line = new THREE.Mesh(new THREE.BoxGeometry(1, .025, 1), material); marker.add(line);
  const fill = new THREE.Mesh(new THREE.BoxGeometry(1, .03, 1), material.clone()); marker.add(fill);
  marker.userData.line = line; marker.userData.fill = fill; return marker;
}
