import { createSealedGuardian } from './guardian-redesign.js';
import { createRangerActor } from './ranger.js';
import { attachClassCharacters } from './class-characters.js';
import * as THREE from 'three';
import { block, curve, ellipsoid, link, piece } from './geometry.js';

function joint(parent, position) {
  const group = new THREE.Group(); group.position.set(...position); parent.add(group); return group;
}

function blade(parent, m, length = 1.4) {
  const outline = new THREE.Shape();
  outline.moveTo(-.09, 0); outline.lineTo(-.08, length * .8); outline.lineTo(0, length);
  outline.lineTo(.08, length * .8); outline.lineTo(.09, 0); outline.closePath();
  const sword = piece(parent, new THREE.ExtrudeGeometry(outline, { depth: .035, bevelEnabled: true, bevelSize: .015, bevelThickness: .015, bevelSegments: 1, steps: 1 }), m.steel, 0, -.2, 0);
  sword.rotation.z = Math.PI;
  block(parent, m.brass, [.35, .06, .08], [0, -.12, 0]);
  link(parent, m.leather, [0, -.1, 0], [0, .15, 0], .035);
  return sword;
}

function cape(parent, material) {
  const geometry = new THREE.PlaneGeometry(.95, 1.35, 8, 10);
  const a = geometry.attributes.position;
  for (let i = 0; i < a.count; i++) {
    const x = a.getX(i), y = a.getY(i), f = (.675 - y) / 1.35;
    a.setXYZ(i, x * (.65 + f * .75), y, .08 * Math.cos(x * 14) * f - f * .26);
  }
  geometry.computeVertexNormals();
  const mesh = piece(parent, geometry, material, 0, 1.22, -.3);
  mesh.userData.original = Float32Array.from(a.array);
  return mesh;
}

export function createGenericAdventurer(m) {
  const root = new THREE.Group(); root.name = 'Mythwood-original-adventurer';
  const cloth = m.cloth.clone();
  const torso = joint(root, [0, 1.15, 0]);
  ellipsoid(torso, cloth, [.34, .44, .21], [0, .22, 0]);
  ellipsoid(torso, m.steel, [.3, .27, .15], [0, .33, .13]);
  for (let i = 0; i < 3; i++) block(torso, m.brass, [.47 - i * .035, .025, .025], [0, .23 - i * .11, .245]);
  ellipsoid(root, m.leather, [.29, .18, .21], [0, 1.03, 0]);
  block(root, m.brass, [.13, .12, .04], [0, 1.1, .24]);
  for (const side of [-1, 1]) {
    const thigh = joint(root, [side * .18, 1.05, 0]);
    link(thigh, m.leather, [0, 0, 0], [0, -.42, .02], .135, .105);
    const knee = joint(thigh, [0, -.42, .02]);
    ellipsoid(knee, m.steel, [.12, .12, .1], [0, 0, .06]);
    link(knee, m.leather, [0, -.03, 0], [0, -.47, 0], .09, .105);
    ellipsoid(knee, m.steel, [.11, .22, .07], [0, -.25, .09]);
    ellipsoid(knee, m.leather, [.13, .09, .22], [0, -.47, .09]);
    root.userData[side < 0 ? 'leftLeg' : 'rightLeg'] = thigh;
    root.userData[side < 0 ? 'leftKnee' : 'rightKnee'] = knee;
  }
  const head = joint(root, [0, 1.93, 0]);
  link(root, m.skin, [0, 1.7, 0], [0, 1.92, 0], .1);
  ellipsoid(head, m.skin, [.205, .265, .185], [0, .04, 0], 20);
  ellipsoid(head, m.skin, [.045, .065, .07], [0, .025, .18]);
  for (const side of [-1, 1]) {
    ellipsoid(head, m.dark, [.055, .014, .015], [side * .08, .07, .17], 10);
    ellipsoid(head, m.skin, [.04, .07, .04], [side * .205, .025, 0]);
  }
  ellipsoid(head, m.hair, [.216, .18, .19], [0, .2, -.02], 20);
  for (let i = 0; i < 12; i++) {
    const angle = i / 12 * Math.PI * 2;
    const hair = piece(head, new THREE.ConeGeometry(.055, .27 + (i % 3) * .035, 5), m.hair,
      Math.sin(angle) * .16, .1, Math.cos(angle) * .13);
    hair.rotation.z = Math.sin(angle) * 2.8; hair.rotation.x = Math.cos(angle) * 2.6;
  }
  for (const side of [-1, 1]) {
    const arm = joint(root, [side * .36, 1.6, 0]);
    ellipsoid(arm, m.steel, [.2, .14, .24], [side * .035, -.02, 0]);
    ellipsoid(arm, m.brass, [.21, .035, .25], [side * .035, .04, 0]);
    link(arm, cloth, [0, -.07, 0], [side * .03, -.33, 0], .09, .11);
    const elbow = joint(arm, [side * .03, -.33, 0]);
    link(elbow, m.leather, [0, 0, 0], [0, -.32, .04], .085, .08);
    ellipsoid(elbow, m.steel, [.095, .18, .075], [0, -.12, .06]);
    ellipsoid(elbow, m.leather, [.07, .095, .07], [0, -.36, .04]);
    root.userData[side < 0 ? 'leftArm' : 'rightArm'] = arm;
    root.userData[side < 0 ? 'leftElbow' : 'rightElbow'] = elbow;
  }
  const weapon = joint(root.userData.rightElbow, [0, -.36, .05]);
  weapon.name = 'class-blade';
  blade(weapon, m);
  const dagger = joint(root.userData.leftElbow, [0, -.36, .05]);
  dagger.name = 'class-dagger'; blade(dagger, m, .85);
  const bow = joint(root.userData.leftElbow, [0, -.32, .06]);
  bow.name = 'class-bow';
  curve(bow, m.wood, [[0, -.65, .05], [0, -.4, .23], [0, 0, .3], [0, .4, .23], [0, .65, .05]], .035, 16);
  curve(bow, m.brass, [[0, -.65, .05], [0, 0, -.05], [0, .65, .05]], .008, 8);
  block(bow, m.brass, [.07, .18, .07], [0, 0, .28]);
  const staff = joint(root.userData.leftElbow, [0, -.35, .05]);
  staff.name = 'class-staff';
  link(staff, m.wood, [0, -.95, 0], [0, 1.15, 0], .035);
  const orb = piece(staff, new THREE.OctahedronGeometry(.14), m.violet, 0, 1.23, 0);
  for (let i = 0; i < 3; i++) {
    const angle = i * Math.PI * 2 / 3;
    curve(staff, m.brass, [[0, 1.05, 0], [Math.sin(angle) * .2, 1.2, Math.cos(angle) * .2], [Math.sin(angle) * .11, 1.4, Math.cos(angle) * .11]], .02, 8);
  }
  const shield = joint(root.userData.leftElbow, [0, -.05, .17]);
  shield.name = 'class-shield';
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, -.5); shieldShape.quadraticCurveTo(-.4, -.17, -.36, .3);
  shieldShape.lineTo(0, .45); shieldShape.lineTo(.36, .3); shieldShape.quadraticCurveTo(.4, -.17, 0, -.5);
  piece(shield, new THREE.ExtrudeGeometry(shieldShape, { depth: .06, bevelEnabled: true, bevelSize: .035, bevelThickness: .02, bevelSegments: 1, steps: 1 }), m.brass);
  const coat = cape(root, cloth);
  root.rotation.y = Math.PI;
  root.userData.setClass = (role) => {
    cloth.color.set(role.id === 'fighter' ? '#723c54' : role.color).multiplyScalar(.7);
    staff.visible = ['mage', 'healer'].includes(role.id);
    shield.visible = role.id === 'tank';
    weapon.visible = !staff.visible && role.id !== 'ranger';
    dagger.visible = role.id === 'assassin'; bow.visible = role.id === 'ranger';
    weapon.scale.setScalar(role.id === 'assassin' ? .65 : 1);
  };
  root.userData.animate = (time, moving, attack, reducedMotion, combat = {}) => {
    const gait = moving ? Math.sin(time * 8) * .55 : 0;
    root.userData.leftLeg.rotation.x = gait;
    root.userData.rightLeg.rotation.x = -gait;
    root.userData.leftKnee.rotation.x = Math.max(0, -gait * .8);
    root.userData.rightKnee.rotation.x = Math.max(0, gait * .8);
    root.userData.leftArm.rotation.x = -.1 - gait * .4;
    const right = root.userData.rightArm, left = root.userData.leftArm;
    const rightElbow = root.userData.rightElbow, leftElbow = root.userData.leftElbow;
    right.rotation.set(-.15 + gait * .4, 0, -.1); left.rotation.z = .1;
    rightElbow.rotation.set(-.15, 0, 0); leftElbow.rotation.set(-.15, 0, 0);
    torso.rotation.set(0, 0, 0);
    if (combat.action) {
      const a = combat.action, preparing = a.elapsed < a.windup;
      const intensity = preparing ? Math.sin(Math.min(1, a.elapsed / a.windup) * Math.PI / 2) : Math.max(0, 1 - (a.elapsed - a.windup) / .24);
      const style = combat.style || 'blade';
      if (['blade', 'daggers', 'shield'].includes(style)) {
        const reverse = a.combo === 2 ? -1 : 1;
        right.rotation.x = preparing ? -1.1 * intensity : -.4 - .35 * intensity;
        right.rotation.z = preparing ? .55 * intensity * reverse : -1.2 * intensity * reverse;
        rightElbow.rotation.x = preparing ? -.75 * intensity : -.15;
        torso.rotation.y = (preparing ? .28 : -.38) * intensity * reverse;
        if (style === 'daggers') { left.rotation.x = -1.1 * intensity; left.rotation.z = .6 * intensity; }
        if (style === 'shield' && a.kind === 'skill') { left.rotation.x = -1.45 * intensity; leftElbow.rotation.x = -.25; }
      } else if (style === 'bow') {
        left.rotation.x = -1.4; leftElbow.rotation.x = -.2;
        right.rotation.x = -1.25; right.rotation.y = preparing ? -.6 * intensity : -.2;
        rightElbow.rotation.x = preparing ? -1.5 * intensity : -.35;
        torso.rotation.y = -.22;
      } else {
        left.rotation.x = -.75 - intensity * .3; leftElbow.rotation.x = -.2;
        right.rotation.x = -1.45 * intensity; rightElbow.rotation.x = -.4;
        torso.rotation.x = -.08 * intensity;
      }
    }
    if (combat.dodge > 0) {
      torso.rotation.x = .35; right.rotation.x = .55; left.rotation.x = .55;
      root.userData.leftLeg.rotation.x = .6; root.userData.rightLeg.rotation.x = -.6;
    }
    orb.rotation.y = reducedMotion ? 0 : time;
    if (!reducedMotion) {
      const p = coat.geometry.attributes.position, original = coat.userData.original;
      for (let i = 0; i < p.count; i++) {
        const f = (.675 - original[i * 3 + 1]) / 1.35;
        p.setZ(i, original[i * 3 + 2] + Math.sin(time * 3 + original[i * 3] * 6) * .065 * f);
      }
      p.needsUpdate = true;
    }
  };
  return { root, body: cloth, weapon };
}

export function createAdventurer(m) {
  const generic = createGenericAdventurer(m), ranger = createRangerActor();
  attachClassCharacters(generic.root);
  const root = new THREE.Group(); root.name = 'Mythwood-original-adventurer';
  generic.root.name = 'prototype-shared-body'; generic.root.rotation.y = 0;
  root.add(generic.root, ranger.root); ranger.root.visible = false;
  let active = generic;
  root.userData.setClass = role => {
    generic.root.userData.setClass(role);
    generic.root.visible = role.id !== 'ranger'; ranger.root.visible = role.id === 'ranger';
    active = role.id === 'ranger' ? ranger : generic;
    if(role.id === 'ranger')void ranger.root.userData.loadVisual();
    else void generic.root.userData.selectVisual(role.id);
  };
  root.userData.animate = (time, moving, attack, reducedMotion, combat) => active.root.userData.animate(time, moving, attack, reducedMotion, combat);
  return { root, body: generic.body, weapon: generic.weapon };
}

export function createGuardian(m, boss = true) {
  if(boss)return createSealedGuardian(m);
  const root = new THREE.Group(); root.name = boss ? 'Custode-vuoto' : 'Eco-corazzato';
  const surface = boss ? m.bone : m.iron;
  const torso = joint(root, [0, 2.3, 0]);
  ellipsoid(torso, m.dark, [.65, .95, .4], [0, .2, 0]);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const plate = ellipsoid(torso, surface, [.38 - i * .04, .19, .2], [side * (.3 - i * .02), .72 - i * .32, .27]);
      plate.rotation.z = side * .3;
    }
    const leg = joint(root, [side * .48, 1.95, 0]);
    link(leg, m.wood, [0, 0, 0], [side * .13, -.85, 0], .17, .24);
    ellipsoid(leg, surface, [.24, .48, .24], [side * .06, -.38, .05]);
    ellipsoid(leg, surface, [.26, .22, .27], [side * .13, -.87, .07]);
    link(leg, m.wood, [side * .13, -.85, 0], [side * .2, -1.75, .1], .13, .18);
    ellipsoid(leg, surface, [.2, .49, .22], [side * .18, -1.35, .1]);
    ellipsoid(leg, surface, [.27, .17, .45], [side * .2, -1.8, .25]);
    const arm = joint(root, [side * .9, 3.2, 0]);
    ellipsoid(arm, surface, [.57, .3, .43], [0, 0, 0]);
    for (let i = 0; i < 3; i++) {
      const spike = piece(arm, new THREE.ConeGeometry(.12, .8, 5), m.violet, side * .2, .2, -.28 + i * .24);
      spike.rotation.z = -side * .65;
    }
    link(arm, m.wood, [0, -.1, 0], [side * .3, -.85, .12], .2, .23);
    ellipsoid(arm, surface, [.23, .49, .27], [side * .2, -.5, .07]);
    const elbow = joint(arm, [side * .3, -.88, .12]);
    ellipsoid(elbow, surface, [.25, .42, .27], [0, -.33, .05]);
    ellipsoid(elbow, surface, [.28, .29, .25], [0, -.82, .08]);
    for (let i = 0; i < 4; i++) link(elbow, surface, [-.18 + i * .12, -.95, .1], [-.2 + i * .13, -1.26, .22], .045, .06, 6);
    root.userData[side < 0 ? 'leftArm' : 'rightArm'] = arm;
  }
  piece(torso, new THREE.OctahedronGeometry(.25), m.luminous, 0, .2, .42);
  curve(torso, m.luminous, [[-.5, .6, .35], [-.14, .3, .45], [0, .2, .47], [.25, -.15, .4], [.42, -.5, .3]], .025);
  const head = joint(root, [0, 3.95, 0]);
  ellipsoid(head, surface, [.32, .5, .28], [0, 0, 0], 12);
  block(head, m.dark, [.37, .07, .06], [0, .06, .27]);
  block(head, m.luminous, [.29, .025, .02], [0, .065, .307]);
  const halo = piece(root, new THREE.TorusGeometry(.85, .025, 5, 40), m.luminous, 0, 4.08, -.45);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const rune = block(root, m.brass, [.1, .26, .07], [Math.sin(a) * 1.02, 4.08 + Math.cos(a) * 1.02, -.45]);
    rune.rotation.z = -a;
  }
  if (!boss) root.scale.setScalar(.43);
  root.userData.animate = (time, windup, moving, reducedMotion, combat = {}) => {
    const charge = combat.phase === 'windup' ? 1 - windup / combat.chargeDuration
      : combat.phase === 'recovery' ? Math.max(0, 1 - ((combat.recoveryDuration || (boss ? 1.5 : 1)) - combat.recovery) / .2) : 0;
    root.userData.leftArm.rotation.x = -.15 - charge * (combat.attackKind === 'nova' ? 1.5 : .45);
    root.userData.rightArm.rotation.x = -.15 - charge * 1.5;
    root.userData.leftArm.rotation.z = combat.attackKind === 'nova' ? charge * .35 : 0;
    root.userData.rightArm.rotation.z = combat.attackKind === 'nova' ? -charge * .35 : 0;
    torso.rotation.x = combat.phase === 'stagger' ? -.18 : -.1 * charge;
    if (!reducedMotion) { torso.rotation.z = Math.sin(time * 1.5) * .025; halo.rotation.z = Math.sin(time * .3) * .1; }
  };
  return root;
}
