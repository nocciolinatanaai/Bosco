import * as THREE from 'three';
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
export function createRangerActor() {
  const standard = (color, roughness = .8) => new THREE.MeshStandardMaterial({ color, roughness });
  const m = {
    jacket: standard('#24454b'), trousers: standard('#444735'), boot: standard('#3c2e29'),
    skin: standard('#b98a65'), hair: standard('#30221c'), dark: standard('#1c252a'),
    cape: new THREE.MeshStandardMaterial({ color: '#a95438', roughness: 1, side: THREE.DoubleSide }),
    scarf: new THREE.MeshStandardMaterial({ color: '#849066', roughness: 1, side: THREE.DoubleSide }),
    brass: new THREE.MeshStandardMaterial({ color: '#b99a60', roughness: .42, metalness: .65 }),
    paper: standard('#c9ae79'), wood: standard('#59402b'),
  };
  const root = new THREE.Group(); root.name = 'Daria-ranger-prototype';
  const torso = joint(root, 'daria-torso', [0, 1.24, 0]);
  ellipsoid(torso, m.jacket, [.29, .4, .175], [0, .2, 0], 12);
  for (const side of [-1, 1]) {
    block(torso, m.jacket, [.24, .32, .09], [side * .14, .19, .15], side * .08);
    link(torso, m.brass, [side * .02, -.13, .18], [side * .025, .44, .15], .012, .012, 5);
    block(torso, m.boot, [.16, .12, .04], [side * .16, .02, .2]);
    block(torso, m.brass, [.12, .018, .012], [side * .16, .08, .225]);
  }
  ellipsoid(root, m.trousers, [.26, .19, .18], [0, 1.1, 0], 12);
  block(root, m.boot, [.54, .075, .36], [0, 1.18, 0]);
  block(root, m.brass, [.09, .085, .04], [0, 1.18, .2]);
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
    ellipsoid(knee, m.boot, [.105, .085, .2], [0, -.48, .085], 12);
    for (let n = 0; n < 4; n++) link(knee, m.paper, [-.04, -.15 - n * .06, .09], [.04, -.19 - n * .06, .09], .006, .006, 4);
    pack(leg); pack(knee);
    const arm = joint(torso, `daria-arm-${side}`, [side * .32, .45, 0]); arms.push(arm);
    ellipsoid(arm, m.jacket, [.135, .16, .145], [0, -.04, 0], 10);
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
  ellipsoid(head, m.skin, [.18, .235, .16], [0, .025, .015], 20);
  ellipsoid(head, m.skin, [.032, .055, .055], [0, .015, .165], 12);
  for (const side of [-1, 1]) {
    ellipsoid(head, m.dark, [.042, .013, .012], [side * .07, .06, .156], 10);
    link(head, m.hair, [side * .04, .1, .15], [side * .11, .115, .14], .009, .011, 5);
    ellipsoid(head, m.skin, [.032, .06, .03], [side * .18, .015, 0], 10);
  }
  link(head, m.boot, [-.043, -.07, .155], [.043, -.07, .155], .006, .006, 5);
  ellipsoid(head, m.hair, [.19, .15, .165], [0, .18, -.025], 16);
  for (let lock = 0; lock < 7; lock++) {
    const x = -.16 + lock * .045;
    curve(head, m.hair, [[x, .24, .015], [x - .035, .15, .14], [x - .065, .04 + lock * .012, .16]], .023, 7);
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
  return { root, body: m.jacket, weapon: bow };
}
