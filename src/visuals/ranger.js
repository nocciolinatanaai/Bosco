import * as THREE from 'three';
import { attachSkinnedRanger } from './ranger-skinned.js';
import { block, curve, ellipsoid, link, piece, batchArchitecture } from './geometry.js';

const joint = (parent, name, position) => {
  const group = new THREE.Group(); group.name = name; group.position.set(...position); parent.add(group); return group;
};
// Merge rigid pieces in bone-local space. Animated joints and cloth stay separate.
function pack(node) {
  const source = new THREE.Group();
  for (const child of [...node.children]) if (child.isMesh && !child.userData.dynamic) source.add(child);
  if (source.children.length) node.add(batchArchitecture(source));
}
function loft(parent, material, bands, segments = 20) {
  const points = [], indices = [];
  for (const [y, rx, rz] of bands) for (let i = 0; i <= segments; i++) {
    const angle = i / segments * Math.PI * 2; points.push(Math.sin(angle) * rx, y, Math.cos(angle) * rz);
  }
  for (let row = 0; row < bands.length - 1; row++) for (let i = 0; i < segments; i++) {
    const a = row * (segments + 1) + i, b = a + segments + 1;
    indices.push(a, a + 1, b, a + 1, b + 1, b);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals(); return piece(parent, geometry, material);
}
function cloth(parent, material, width, height, position, tilt = 0) {
  const geometry = new THREE.PlaneGeometry(width, height, 6, 8), vertices = geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i), y = vertices.getY(i), free = (height / 2 - y) / height;
    vertices.setXYZ(i, x * (.65 + free * .5), y + x * tilt, Math.cos(x * 16) * .035 * free - free * .12);
  }
  geometry.computeVertexNormals();
  const mesh = piece(parent, geometry, material, ...position); mesh.userData.dynamic = true;
  return { mesh, vertices, original: Float32Array.from(vertices.array), height };
}

// Original procedural translation of the Daria concept, not a final sculpt/GLB.
export function createRangerActor({variant='pass01'}={}) {
  const standard = (color, roughness = .8) => new THREE.MeshStandardMaterial({ color, roughness });
  const m = {
    jacket: standard('#24454b'), trousers: standard('#444735'), boot: standard('#3c2e29'),
    skin: standard('#b98a65'), hair: standard('#30221c'), dark: standard('#1c252a'),
    cape: new THREE.MeshStandardMaterial({ color: '#a95438', roughness: 1, side: THREE.DoubleSide }),
    scarf: new THREE.MeshStandardMaterial({ color: '#849066', roughness: 1, side: THREE.DoubleSide }),
    brass: new THREE.MeshStandardMaterial({ color: '#b99a60', roughness: .42, metalness: .65 }),
    paper: standard('#c9ae79'), eyes: standard('#e4ddc9'), lips: standard('#7b463d'), wood: standard('#59402b'),
  };
  const root = new THREE.Group(); root.name = 'Daria-ranger-prototype';
  const torso = joint(root, 'daria-torso', [0, 1.24, 0]);
  loft(torso, m.jacket, [[-.12,.23,.15],[.02,.24,.16],[.2,.265,.17],[.4,.28,.15],[.5,.22,.12],[.57,.1,.085]]);
  for (const side of [-1, 1]) {
    link(torso, m.brass, [side * .015, -.1, .16], [side * .025, .4, .155], .006, .006, 5);
    block(torso, m.boot, [.12, .08, .025], [side * .14, .03, .16]);
  }
  loft(root, m.trousers, [[.96,.17,.12],[1.05,.24,.16],[1.15,.24,.16],[1.2,.21,.15]]);
  loft(root, m.boot, [[1.16,.246,.165],[1.21,.235,.165]]);
  block(root, m.brass, [.085, .07, .025], [0, 1.18, .18]);
  const notebook = joint(root, 'daria-map-notebook', [.3, 1.03, .09]); notebook.rotation.z = -.2;
  block(notebook, m.boot, [.2, .26, .05], [0, 0, 0]);
  block(notebook, m.paper, [.17, .22, .012], [0, 0, .032]);
  curve(notebook, m.wood, [[-.06, -.07, .042], [.04, -.02, .043], [-.03, .04, .043], [.05, .09, .043]], .005, 6);
  const legs = [], knees = [], arms = [], elbows = [];
  for (const side of [-1, 1]) {
    const leg = joint(root, `daria-leg-${side}`, [side * .16, 1.08, 0]); legs.push(leg);
    link(leg, m.trousers, [0, 0, 0], [0, -.47, .025], .125, .095, 10);
    block(leg, m.boot, [.18, .06, .2], [0, -.2, 0]);
    const knee = joint(leg, `daria-knee-${side}`, [0, -.47, .025]); knees.push(knee);
    ellipsoid(knee, m.boot, [.105, .1, .08], [0, 0, .06], 10);
    link(knee, m.boot, [0, -.02, 0], [0, -.44, 0], .095, .08, 10);
    const bootShape = new THREE.Shape(); bootShape.moveTo(-.075,-.07); bootShape.lineTo(.075,-.07);
    bootShape.lineTo(.1,.15); bootShape.quadraticCurveTo(.1,.23,0,.23); bootShape.quadraticCurveTo(-.1,.23,-.1,.15); bootShape.closePath();
    const boot = piece(knee,new THREE.ExtrudeGeometry(bootShape,{depth:.1,bevelEnabled:true,bevelSize:.015,bevelThickness:.01,bevelSegments:1,steps:1}),m.boot,0,-.48,0); boot.rotation.x=Math.PI/2;
    for (let n = 0; n < 4; n++) link(knee, m.paper, [-.04, -.15 - n * .06, .09], [.04, -.19 - n * .06, .09], .006, .006, 4);
    pack(leg); pack(knee);
    const arm = joint(torso, `daria-arm-${side}`, [side * .32, .45, 0]); arms.push(arm);
    ellipsoid(arm, m.jacket, [.105, .13, .115], [0, -.04, 0], 10);
    link(arm, m.jacket, [0, -.05, 0], [side * .02, -.33, 0], .09, .075, 10);
    const elbow = joint(arm, `daria-elbow-${side}`, [side * .02, -.33, 0]); elbows.push(elbow);
    link(elbow, m.skin, [0, 0, 0], [0, -.33, .035], .065, .06, 10);
    link(elbow, m.boot, [0, -.1, .01], [0, -.3, .03], .073, .067, 10);
    ellipsoid(elbow, m.boot, [.065, .085, .065], [0, -.38, .04], 10);
    for (let finger = 0; finger < 3; finger++) link(elbow, m.skin, [-.04 + finger * .035, -.4, .085], [-.04 + finger * .035, -.45, .085], .013, .011, 5);
    pack(arm); pack(elbow);
  }
  const head = joint(torso, 'daria-head', [0, .73, 0]);
  link(torso, m.skin, [0, .51, 0], [0, .73, 0], .085, .09, 10);
  ellipsoid(head, m.skin, [.16, .215, .15], [0, .025, .015], 20);
  ellipsoid(head, m.skin, [.019, .033, .028], [0, .015, .164], 12);
  for (const side of [-1, 1]) {
    ellipsoid(head, m.eyes, [.037, .019, .01], [side * .063, .06, .151], 12);
    ellipsoid(head, m.hair, [.015, .017, .008], [side * .063, .06, .16], 10);
    ellipsoid(head, m.dark, [.007, .012, .004], [side * .063, .06, .168], 8);
    ellipsoid(head, m.eyes, [.004, .005, .003], [side * .063 - .004, .067, .172], 8);
    link(head, m.hair, [side * .04, .1, .15], [side * .11, .115, .14], .009, .011, 5);
    ellipsoid(head, m.skin, [.032, .06, .03], [side * .16, .015, 0], 10);
  }
  link(head, m.lips, [-.032, -.065, .15], [.032, -.065, .15], .004, .005, 6);
  ellipsoid(head, m.hair, [.171, .13, .155], [0, .18, -.025], 16);
  for (let lock = 0; lock < 6; lock++) {
    const x = -.14 + lock * .045;
    const shape = new THREE.Shape(); shape.moveTo(x-.035,.24); shape.quadraticCurveTo(x-.06,.14,x-.065,.035+lock*.012);
    shape.quadraticCurveTo(x+.015,.11,x+.035,.22); shape.closePath();
    const hair = piece(head,new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.009,bevelThickness:.01,bevelSegments:1,steps:1}),m.hair,0,0,.1);
    hair.rotation.y=-.12;
  }
  const braid = joint(torso, 'daria-braid', [.16, .75, -.11]);
  for (let i = 0; i < 9; i++) {
    const x = Math.sin(i * 2.1) * .022;
    ellipsoid(braid, m.hair, [.052 - i * .002, .065, .043], [x + i * .012, -.08 * i, i * .015], 8);
  }
  piece(braid, new THREE.TorusGeometry(.035, .009, 4, 10), m.brass, .1, -.67, .11).rotation.x = Math.PI / 2;
  const scarfRing = piece(torso, new THREE.TorusGeometry(.14, .07, 8, 20), m.scarf, 0, .6, .025); scarfRing.rotation.x = Math.PI / 2;
  const scarf = cloth(torso, m.scarf, .24, .53, [-.14, .33, .2], .2);
  const cape = cloth(torso, m.cape, .75, 1.12, [-.14, .05, -.23], -.23);
  cape.mesh.name = 'daria-cape'; scarf.mesh.name = 'daria-scarf';
  cape.mesh.rotation.y = -.12;
  const clasp = piece(torso, new THREE.OctahedronGeometry(.065), m.brass, -.22, .49, .16); clasp.scale.z = .3;
  const quiver = joint(torso, 'daria-quiver', [.18, .05, -.35]); quiver.rotation.z = -.25;
  piece(quiver, new THREE.CylinderGeometry(.13, .12, .65, 10), m.boot);
  piece(quiver, new THREE.TorusGeometry(.135, .024, 5, 16), m.brass, 0, .33, 0).rotation.x = Math.PI / 2;
  for (let i = 0; i < 5; i++) {
    const x = -.08 + i * .04, y = .6 + (i % 2) * .08;
    link(quiver, m.wood, [x, -.25, 0], [x, y, 0], .008, .008, 5);
    const feather = piece(quiver, new THREE.PlaneGeometry(.07, .14), m.scarf, x, y - .03, 0); feather.rotation.y = i;
  }
  const bow = joint(elbows[0], 'daria-bow', [0, -.38, .04]);
  curve(bow, m.wood, [[0, -.72, .02], [-.035, -.45, .24], [0, 0, .13], [.06, .48, .28], [0, .83, .04]], .035, 18);
  for (const y of [-.5, .48]) curve(bow, m.brass, [[0, y * .8, .17], [.065, y, .25], [0, y * 1.4, .12]], .016, 9);
  block(bow, m.boot, [.065, .22, .07], [0, 0, .14]);
  const stringGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -.72, .02), new THREE.Vector3(0, 0, .02), new THREE.Vector3(0, .83, .04)]);
  const string = new THREE.Line(stringGeometry, new THREE.LineBasicMaterial({ color: '#d9c6a2' })); string.name = 'daria-bow-string'; bow.add(string);
  const echo = joint(bow, 'daria-resonance-bow', [0, 0, 0]);
  const glow = new THREE.MeshBasicMaterial({ color: '#ffd384', transparent: true, opacity: .8 });
  for (const side of [-1, 1]) curve(echo, glow, [[0, side * .5, .18], [side * .15, side * .8, .28], [side * .04, side * 1.03, .06]], .018, 12);
  pack(echo); echo.visible = false;
  const arrow = joint(bow, 'daria-nocked-arrow', [0,0,.25]);
  link(arrow,m.wood,[0,0,-.25],[0,0,.65],.008,.008,5);
  const tip = piece(arrow,new THREE.ConeGeometry(.025,.1,5),m.brass,0,0,.69);tip.rotation.x=Math.PI/2;
  arrow.visible=false; pack(arrow);
  for (const node of [head, braid, notebook, quiver, bow, torso, root]) pack(node);

  const fabrics = [cape, scarf];
  root.userData.animate = (time, moving, unused, reducedMotion, combat = {}) => {
    const action = combat.action, drawing = action && action.elapsed < action.windup;
    const draw = action ? drawing ? Math.min(1, action.elapsed / action.windup) : Math.max(0, 1 - (action.elapsed - action.windup) / .16) : 0;
    const gait = moving ? Math.sin(time * 9) * .52 : 0;
    torso.rotation.set(combat.dodge > 0 ? .32 : 0, action ? -.24 : 0, 0);
    for (let i = 0; i < 2; i++) {
      const sign = i ? -1 : 1;
      legs[i].rotation.set(gait * sign, 0, 0); knees[i].rotation.x = Math.max(0, -gait * sign * .8);
      arms[i].rotation.set(-.12 - gait * sign * .4, 0, i ? -.08 : .08); elbows[i].rotation.set(-.15, 0, 0);
    }
    if (action) {
      arms[0].rotation.set(-1.4, -.08, .04); elbows[0].rotation.x = -.1;
      arms[1].rotation.set(-1.35, -.5 * draw, -.1); elbows[1].rotation.x = -.35 - draw * .95;
    }
    if (combat.dodge > 0) { legs[0].rotation.x = .6; legs[1].rotation.x = -.6; }
    bow.rotation.x = action ? 1.5 : .27;
    arrow.visible = Boolean(action && drawing); arrow.position.z = .27 - .32 * draw;
    stringGeometry.attributes.position.setXYZ(1, 0, 0, .02 - .32 * draw); stringGeometry.attributes.position.needsUpdate = true;
    echo.visible = Boolean(combat.evolved); glow.opacity = combat.returnShot > 0 ? .95 : .65;
    braid.rotation.z = reducedMotion ? 0 : Math.sin(time * 3) * (moving ? .06 : .015);
    for (const strip of fabrics) {
      for (let i = 0; i < strip.vertices.count; i++) {
        const free = (strip.height / 2 - strip.original[i * 3 + 1]) / strip.height;
        strip.vertices.setZ(i, strip.original[i * 3 + 2] + (reducedMotion ? 0 : Math.sin(time * 4 + strip.original[i * 3] * 6) * .045 * free));
      }
      strip.vertices.needsUpdate = true;
    }
  };
  attachSkinnedRanger(root,{variant});
  return { root, body: m.jacket, weapon: bow };
}
