import * as THREE from 'three';

// Short-lived geometry is bounded and disposed. No downloaded VFX or screen shake.
export function createCombatEffects(scene) {
  const transient = [], projectiles = new Map();
  const add = (mesh, life, update = () => {}) => {
    scene.add(mesh); transient.push({ mesh, life, age: 0, update });
    while (transient.length > 28) dispose(transient.shift().mesh);
  };
  function dispose(root) {
    scene.remove(root);
    root.traverse((m) => { if (m.isMesh || m.isPoints) { m.geometry.dispose(); m.material.dispose(); } });
  }
  function ring(x, z, radius, color, life = .4) {
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: .8, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(.87, 1, 48), material);
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, .17, z);
    add(mesh, life, (age) => { mesh.scale.setScalar(radius * (.2 + .8 * age / life)); material.opacity = .8 * (1 - age / life); });
  }
  function sparks(x, z, color) {
    const count = 14, positions = new Float32Array(count * 3), velocity = [];
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399;
      velocity.push(new THREE.Vector3(Math.cos(angle) * (1 + i % 3), 1 + i % 4 * .5, Math.sin(angle) * (1 + i % 3)));
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color, size: .09, transparent: true, opacity: 1, depthWrite: false });
    const points = new THREE.Points(geometry, material); points.position.set(x, 1.25, z);
    add(points, .4, (age) => {
      for (let i = 0; i < count; i++) {
        positions[i * 3] = velocity[i].x * age; positions[i * 3 + 1] = velocity[i].y * age - 5 * age * age; positions[i * 3 + 2] = velocity[i].z * age;
      }
      geometry.attributes.position.needsUpdate = true; material.opacity = 1 - age / .4;
    });
  }
  return {
    event(event, state, reducedMotion) {
      const color = state.role.color;
      if(event.type==='artifact-triggered')ring(state.x,state.z,1.2,event.attunement==='ward'?'#86bdd2':'#f0ad76',.5);
      if (event.type === 'strike' && ['blade', 'shield', 'daggers'].includes(event.style)) {
        const radius = event.range;
        const facing = Math.atan2(-event.facing.z, event.facing.x), arc = event.combo === 3 ? Math.PI : Math.PI * .7;
        const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: .8, depthWrite: false });
        const mesh = new THREE.Mesh(new THREE.RingGeometry(radius * .65, radius, 32, 1, facing - arc / 2, arc), mat);
        mesh.rotation.x = -Math.PI / 2; mesh.position.set(event.x, .8, event.z);
        add(mesh, .2, (age) => { mat.opacity = .8 * (1 - age / .2); });
      }
      if (event.type === 'skill-impact') ring(event.x, event.z, event.role === 'mage' ? 3.2 : event.range, color);
      if (event.type === 'enemy-impact' && event.kind === 'beam') {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(event.width, .04, event.length), new THREE.MeshBasicMaterial({ color: '#ffe0a2', transparent: true, opacity: .8, depthWrite: false }));
        mesh.position.set(event.x + event.dx * event.length / 2, .12, event.z + event.dz * event.length / 2); mesh.rotation.y = Math.atan2(event.dx, event.dz);
        add(mesh, .2, age => { mesh.material.opacity = .8 * (1 - age / .2); });
      }
      if (event.type === 'enemy-impact' && event.kind !== 'beam') ring(event.x, event.z, event.radius, event.kind === 'nova' ? '#c5a5ff' : '#f48477', reducedMotion ? .15 : .35);
      if (event.type === 'hit' && !reducedMotion) sparks(event.x, event.z, event.critical ? '#fff3cb' : color);
      if (event.type === 'projectile-blocked' && !reducedMotion) sparks(event.x, event.z, '#e2cf9b');
      if (event.type === 'action-start' && event.kind === 'skill' && state.role.id === 'mage') ring(event.aimX, event.aimZ, 3.2, color, event.windup);
      if (event.type === 'dodge' && !reducedMotion) ring(event.x, event.z, .7, '#9bd7e9', .25);
      if (event.type === 'echo-burst') ring(event.x, event.z, event.radius, '#ffe0a0', .3);
      if (event.type === 'return-shot-ready') ring(state.x, state.z, 1.4, '#d9f2a5', reducedMotion ? .15 : .4);
      if (event.type === 'evolved') ring(state.x, state.z, 5, '#ffe0a0', .8);
    },
    update(dt, state) {
      for (let i = transient.length - 1; i >= 0; i--) {
        const item = transient[i]; item.age += dt;
        if (item.age >= item.life) { dispose(item.mesh); transient.splice(i, 1); }
        else item.update(item.age);
      }
      const living = new Set(state?.projectiles.map((p) => p.id) || []);
      for (const [id, view] of projectiles) if (!living.has(id)) { dispose(view); projectiles.delete(id); }
      for (const p of state?.projectiles || []) {
        let view = projectiles.get(p.id);
        if (!view) {
          view = new THREE.Group();
          const material = new THREE.MeshBasicMaterial({ color: p.echo ? '#ffe3a0' : state.role.color });
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, p.style === 'bow' ? .85 : .4, 6), material);
          shaft.rotation.x = Math.PI / 2; view.add(shaft);
          const tip = new THREE.Mesh(new THREE.OctahedronGeometry(p.style === 'bow' ? .07 : .14), material.clone());
          tip.position.z = .25; view.add(tip); scene.add(view); projectiles.set(p.id, view);
        }
        view.visible = !(p.delay > 0);
        view.position.set(p.x, 1.35, p.z);
        const enemy = state.enemies.find((e) => e.id === p.targetId);
        if (enemy) view.rotation.y = Math.atan2(enemy.x - p.x, enemy.z - p.z);
      }
    },
    clear() {
      for (const item of transient) dispose(item.mesh);
      transient.length = 0;
      for (const view of projectiles.values()) dispose(view);
      projectiles.clear();
    },
  };
}
