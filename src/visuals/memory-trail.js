import * as THREE from 'three';
import { MEMORY_TRACES } from '../trail.js';

export function createMemoryTrail(scene) {
  const root = new THREE.Group(); root.name = 'Liora-memory-trail'; scene.add(root);
  const nodes = MEMORY_TRACES.map(trace => {
    const group = new THREE.Group(); group.position.set(trace.x, 0, trace.z); root.add(group);
    const material = new THREE.MeshBasicMaterial({ color: '#f3d49c', transparent: true, opacity: .8, depthWrite: false });
    const halo = new THREE.Mesh(new THREE.RingGeometry(.75, .8, 48), material);
    halo.rotation.x = -Math.PI / 2; halo.position.y = .14; group.add(halo);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(.3), material.clone());
    crystal.position.y = 1; group.add(crystal);
    return { group, halo, crystal };
  });
  const points = MEMORY_TRACES.map(trace => new THREE.Vector3(trace.x, .13, trace.z));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#e8cf9b', transparent: true, opacity: .25 })); root.add(line);
  root.visible = false;
  return {
    root,
    update(state, time, reducedMotion) {
      root.visible = Boolean(state?.cleared && state?.evolved); if (!root.visible) return;
      line.material.opacity = state.trail.complete ? .8 : .15 + state.trail.found.length * .18;
      nodes.forEach((node, i) => {
        const found = state.trail.found.includes(MEMORY_TRACES[i].id), current = !state.trail.complete && i === state.trail.found.length;
        node.halo.material.opacity = found ? .35 : current ? .9 : .15;
        node.halo.material.color.set(found ? '#a8d9ca' : '#f3d49c');
        node.crystal.material.opacity = found ? .25 : current ? .9 : .2;
        node.crystal.scale.setScalar(found ? .5 : current ? 1.2 : .65);
        node.crystal.position.y = 1 + (!reducedMotion && current ? Math.sin(time * 2) * .12 : 0);
        node.crystal.rotation.y = reducedMotion ? 0 : time * .3;
      });
    },
    dispose() {
      scene.remove(root); root.traverse(node => { if (node.isMesh || node.isLine) { node.geometry.dispose(); node.material.dispose(); } });
    },
  };
}
