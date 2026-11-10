import { createGardenWorld, createGardenSentry } from './garden.js';
import { createBeamTelegraph, createTelegraph } from './telegraph.js';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createMaterials } from './materials.js';
import { batchArchitecture, block, curve, ellipsoid, link, piece, random } from './geometry.js';
import { createAdventurer, createGuardian } from './actors.js';

function arch(root, m, x, y, z, radius, thickness = .65, depth = 1, count = 21, rotation = 0) {
  const group = new THREE.Group(); group.position.set(x, y, z); group.rotation.y = rotation; root.add(group);
  for (let i = 0; i < count; i++) {
    const start = i / count * Math.PI + .008, end = (i + 1) / count * Math.PI - .008;
    const shape = new THREE.Shape();
    shape.moveTo(Math.cos(start) * radius, Math.sin(start) * radius);
    shape.lineTo(Math.cos(start) * (radius + thickness), Math.sin(start) * (radius + thickness));
    shape.absarc(0, 0, radius + thickness, start, end, false);
    shape.lineTo(Math.cos(end) * radius, Math.sin(end) * radius);
    shape.absarc(0, 0, radius, end, start, true);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: .04, bevelThickness: .035, bevelSegments: 1, curveSegments: 3, steps: 1 });
    piece(group, geometry, i % 5 === 0 ? m.trim : m.stone);
  }
}

function column(root, m, x, z, height = 7) {
  block(root, m.stone, [1.2, height, 1.2], [x, height / 2, z]);
  for (const y of [.17, .45, height - .3, height]) block(root, m.trim, [1.7, .22, 1.7], [x, y, z]);
  for (const dx of [-.42, .42]) block(root, m.trim, [.1, height - .8, 1.28], [x + dx, height / 2, z]);
  for (let y = 1; y < height - .5; y += 1.1) block(root, m.dark, [1.21, .025, 1.21], [x, y, z]);
}

function ivy(root, m, base, height, seed) {
  const rand = random(seed);
  const path = [];
  for (let i = 0; i < 9; i++) path.push([base[0] + Math.sin(i * 1.7) * .24, height * i / 8, base[1] + Math.cos(i * 1.3) * .14]);
  curve(root, m.wood, path, .035);
  for (let i = 0; i < 35; i++) {
    const y = rand() * height, x = base[0] + (rand() - .5) * .8, z = base[1] + (rand() - .5) * .6;
    const leaf = piece(root, new THREE.SphereGeometry(1, 6, 4), i % 3 ? m.leaf : m.leafLight, x, y, z);
    leaf.scale.set(.08, .22, .025); leaf.rotation.set(rand(), rand() * 6, rand() * 3);
    if (i % 5 === 0) {
      for (let p = 0; p < 5; p++) {
        const a = p * Math.PI * 2 / 5;
        const petal = piece(root, new THREE.SphereGeometry(1, 6, 4), m.blossom, x + Math.cos(a) * .08, y + Math.sin(a) * .08, z + .06);
        petal.scale.set(.065, .04, .02); petal.rotation.z = a;
      }
    }
  }
}

function shrub(root, m, x, z, rand) {
  for (let i = 0; i < 10; i++) {
    const angle = rand() * Math.PI * 2, length = .3 + rand() * .7;
    const leaf = piece(root, new THREE.SphereGeometry(1, 6, 4), i % 2 ? m.leaf : m.leafLight, x + Math.sin(angle) * .2, .16 + length * .3, z + Math.cos(angle) * .2);
    leaf.scale.set(.08, length / 2, .025); leaf.rotation.set(Math.cos(angle) * .9, angle, Math.sin(angle) * .9);
  }
  if (rand() > .4) {
    for (let i = 0; i < 5; i++) {
      const angle = rand() * Math.PI * 2;
      ellipsoid(root, m.blossom, [.15, .04, .09], [x + Math.sin(angle) * .3, .15, z + Math.cos(angle) * .3], 6);
    }
  }
}

function portal(root, m) {
  const shape = new THREE.Shape();
  shape.moveTo(-3.5, 0); shape.lineTo(3.5, 0); shape.lineTo(3.5, 5.4);
  shape.absarc(0, 5.4, 3.5, 0, Math.PI, false); shape.closePath();
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    side: THREE.DoubleSide,
    vertexShader: `varying vec2 vP; void main(){vP=vec2(position.x/7.0+.5,position.y/9.0);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      varying vec2 vP; uniform float uTime;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 p=vP; float n=noise(p*5.+vec2(uTime*.1,-uTime*.06))*.55+noise(p*13.-uTime*.04)*.25;
        float r=length((p-vec2(.5,.48))*vec2(1.2,1.));
        float veil=smoothstep(.08,.65,r); float rip=pow(abs(sin(p.y*25.+n*6.-uTime*.25)),18.);
        vec3 c=mix(vec3(.045,.018,.09),vec3(2.6,1.18,.28),veil);
        c+=vec3(1.4,.7,.2)*rip*.24; gl_FragColor=vec4(c,1.);
      }`,
  });
  const plane = piece(root, new THREE.ShapeGeometry(shape, 40), material, 0, .05, -18.4);
  plane.castShadow = false; plane.receiveShadow = false;
  const edge = new THREE.PointLight('#ffbb68', 120, 23, 1.8); edge.position.set(0, 3.8, -16); root.add(edge);
  const front = new THREE.Group(); root.add(front);
  for (let i = 0; i < 7; i++) {
    const ring = piece(front, new THREE.TorusGeometry(1.3 + i * .19, .015, 4, 70), m.luminous, 0, 4.6, -17.8);
    ring.rotation.x = i * .14; ring.rotation.y = i * .18;
  }
  return { material, rings: front };
}

export function createArtWorld(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1a273d'); scene.fog = new THREE.FogExp2('#29394d', .012);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture; scene.environmentIntensity = .3;
  room.dispose(); pmrem.dispose();
  const m = createMaterials(), source = new THREE.Group();
  const plazaRoot = new THREE.Group(); plazaRoot.name = 'Piazza-del-ritorno'; scene.add(plazaRoot);
  let gardenWorld = null, area = 'plaza';
  const rand = random(215);
  scene.add(new THREE.HemisphereLight('#93adc9', '#25202d', .6));
  const sun = new THREE.DirectionalLight('#b3c9e4', 2);
  sun.position.set(-10, 22, 14); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: .5, far: 70 });
  sun.shadow.bias = -.0005; sun.shadow.normalBias = .035; scene.add(sun);
  const rim = new THREE.DirectionalLight('#b38acb', 1.2); rim.position.set(10, 7, -10); scene.add(rim);
  block(source, m.dark, [78, .5, 70], [7, -.4, 0]);
  for (let x = -10; x < 20; x++) for (let z = -14; z < 13; z++) {
    if (x > 10 && Math.abs(z - 4) > 2) continue;
    const tile = block(source, rand() > .3 ? m.paving : m.pavingDark, [1.23 + rand() * .06, .15, 1.6 + rand() * .09], [x * 1.32 + (z % 2) * .66, -.06 + rand() * .035, z * 1.75]);
    tile.rotation.y = (rand() - .5) * .025;
  }
  // Sunken tracks and brass inlays break up the regular paving.
  for (const x of [-8.4, -6.7, 6.7, 8.4]) {
    block(source, m.iron, [.1, .08, 39], [x, .04, -1]);
    for (let z = -19; z < 18; z += .9) block(source, m.wood, [2, .06, .14], [x + .8, .01, z]);
  }
  for (const x of [-16.5, 16.5]) {
    for (let i = 0; i < 5; i++) {
      const z = -20 + i * 9;
      column(source, m, x, z, 7.7);
      if (i < 4) arch(source, m, x, 4.3, z + 4.5, 3.65, .55, .9, 15, Math.PI / 2);
      if (i % 2 === 0) ivy(source, m, [x - .65, z - .5], 7, i * 17 + (x > 0 ? 9 : 2));
      block(source, m.brass, [.5, .08, .5], [x, 5.15, z + .9]);
      const lamp = piece(source, new THREE.SphereGeometry(.14, 8, 6), m.luminous, x, 4.8, z + .95);
      lamp.castShadow = false;
      link(source, m.iron, [x, 5.3, z + .7], [x, 4.6, z + .7], .025);
    }
    for (let z = -20; z < 18; z += 3) {
      block(source, m.stone, [1.5, 1, 2.7], [x + Math.sign(x), .5, z]);
      block(source, m.trim, [1.8, .2, 2.9], [x + Math.sign(x), 1.05, z]);
    }
  }
  for (const x of [-5.1, 5.1]) {
    column(source, m, x, -18, 6.3);
    for (let i = 0; i < 3; i++) block(source, m.trim, [2.4 - i * .3, .3, 2.3 - i * .3], [x, i * .3 + .15, -18]);
    block(source, m.stone, [1.7, 2, 1.5], [x, 7.2, -18]);
    piece(source, new THREE.ConeGeometry(1.1, 1.1, 4), m.trim, x, 8.7, -18).rotation.y = Math.PI / 4;
    ivy(source, m, [x + Math.sign(x) * .6, -17.3], 8, x > 0 ? 31 : 61);
  }
  arch(source, m, 0, 5.4, -18.3, 3.7, .85, 1, 25);
  for (let x = -14; x <= 14; x += 3) {
    if (Math.abs(x) < 7) continue;
    block(source, m.stone, [2.7, 6, 1.5], [x, 3, -22]);
    block(source, m.trim, [2.9, .3, 1.8], [x, 6.2, -22]);
    arch(source, m, x, 4.1, -21.1, .75, .2, .2, 9);
    block(source, m.dark, [1.2, 2.7, .1], [x, 2.8, -21.15]);
    for (const dx of [-.35, .35]) block(source, m.iron, [.035, 2.7, .08], [x + dx, 2.8, -21]);
  }
  // Silhouettes of the wider city, still geometry rather than a painted backdrop.
  for (let i = 0; i < 18; i++) {
    const x = (i - 9) * 4, h = 10 + rand() * 16;
    block(source, m.dark, [2.8 + rand() * 2, h, 4], [x, h / 2, -35 - rand() * 9]);
    if (i % 3 === 0) piece(source, new THREE.ConeGeometry(2, 5, 4), m.iron, x, h + 2.5, -37);
  }
  for (const side of [-1, 1]) for (let i = 0; i < 8; i++) {
    const height = 10 + rand() * 9, z = -25 + i * 7;
    block(source, m.stone, [4, height, 5.5], [side * (24 + rand() * 5), height / 2, z]);
    for (let floor = 0; floor < 3; floor++) {
      for (let window = 0; window < 3; window++) {
        block(source, m.dark, [.06, 1.4, .6], [side * 21.94, 3 + floor * 2.7, z - 1.5 + window * 1.5]);
      }
    }
    if (i % 2) piece(source, new THREE.ConeGeometry(3.1, 4, 4), m.iron, side * 25, height + 2, z).rotation.y = Math.PI / 4;
  }
  for (let i = 0; i < 50; i++) {
    const side = i % 2 ? 1 : -1, x = side * (10.2 + rand() * 5), z = -21 + rand() * 42;
    shrub(source, m, x, z, rand);
    if (i % 2 === 0) {
      const shard = piece(source, new THREE.CylinderGeometry(0, .14 + rand() * .15, .5 + rand() * 1.3, 5), m.violet, x + .4, .45, z);
      shard.rotation.z = (rand() - .5) * .5;
    }
    if (i % 4 === 0) {
      const rubble = piece(source, new THREE.DodecahedronGeometry(.3 + rand() * .35), m.stone, x - .4, .2, z);
      rubble.scale.y = .5; rubble.rotation.set(rand(), rand(), rand());
    }
  }
  // Hanging growth, roots and fallen masonry add visual landmarks to the edges.
  for (const side of [-1, 1]) {
    for (let n = 0; n < 7; n++) {
      const x = side * (10 + rand() * 5), z = -17 + rand() * 32;
      curve(source, m.wood, [[x + side * 2, 0, z - 2], [x + side, .3, z], [x, .17, z + 1], [x - side, .06, z + 3]], .1 + rand() * .1);
      for (let p = 0; p < 4; p++) shrub(source, m, x + (rand() - .5) * 2, z + (rand() - .5) * 2, rand);
    }
    for (let n = 0; n < 14; n++) {
      const x = side * 15.3, z = -19 + n * 2.7, height = 1.2 + rand() * 1.5;
      curve(source, m.wood, [[x, 7.5, z], [x - side * .3, 6.5, z + .1], [x - side * .2, 7.5 - height, z + .15]], .025);
      for (let j = 0; j < 10; j++) {
        const flower = ellipsoid(source, m.blossom, [.12, .08, .08], [x - side * .2 + (rand() - .5) * .3, 7.4 - rand() * height, z + (rand() - .5) * .3], 6);
        flower.rotation.z = rand();
      }
    }
    const fallen = new THREE.Group(); source.add(fallen);
    fallen.position.set(side * 11, .7, -4); fallen.rotation.z = Math.PI / 2; fallen.rotation.y = .4 * side;
    block(fallen, m.stone, [.8, 3, .8], [0, 0, 0]);
    block(fallen, m.trim, [1.1, .3, 1.1], [0, 1.4, 0]);
    // Original heraldic banner: geometry, folds and a simple inlaid sigil.
    const banner = new THREE.Group(); source.add(banner); banner.position.set(side * 13, 5.6, -15);
    link(banner, m.iron, [-.9, 0, 0], [.9, 0, 0], .035);
    const cloth = new THREE.PlaneGeometry(1.5, 2.5, 8, 12), vertices = cloth.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i), y = vertices.getY(i);
      vertices.setZ(i, Math.sin(x * 9) * .08 + (.5 - y) * .03);
    }
    cloth.computeVertexNormals(); piece(banner, cloth, m.cloth, 0, -1.3, 0);
    const badge = piece(banner, new THREE.TorusGeometry(.27, .025, 4, 20), m.brass, 0, -.9, .12); badge.rotation.z = Math.PI / 4;
    block(banner, m.brass, [.025, .9, .02], [0, -1.25, .12]);
  }
  for (const side of [-1, 1]) {
    const x = side * 10.5;
    block(source, m.wood, [3, .16, .8], [x, .8, 8]);
    block(source, m.wood, [3, .8, .13], [x, 1.25, 8.35]);
    for (const dx of [-1, 1]) { link(source, m.iron, [x + dx, .1, 7.7], [x + dx, .85, 7.7], .04); link(source, m.iron, [x + dx, .1, 8.25], [x + dx, .85, 8.25], .04); }
    for (let i = 0; i < 3; i++) block(source, m.brass, [.05, .65, .04], [x - .9 + i * .9, 1.25, 8.44]);
  }
  // Circular plaza: inlaid runes around the confrontation.
  for (let i = 0; i < 40; i++) {
    const a = i * Math.PI / 20;
    const rune = block(source, i % 5 === 0 ? m.luminous : m.brass, [.08, .025, i % 5 === 0 ? .5 : .2], [Math.sin(a) * 5.6, .09, -9 + Math.cos(a) * 5.6]);
    rune.rotation.y = a;
  }
  for (let i = 0; i < 7; i++) block(source, m.paving, [2.9, .12, 2.6], [20 + i * 3, 0, 7]);
  plazaRoot.add(batchArchitecture(source));
  const p = portal(plazaRoot, m);
  const actor = createAdventurer(m); scene.add(actor.root);
  const auraMat = new THREE.MeshBasicMaterial({ color: '#edc58c', transparent: true, opacity: .18, side: THREE.DoubleSide, depthWrite: false });
  const aura = piece(actor.root, new THREE.RingGeometry(.62, .68, 64), auraMat, 0, .13, 0); aura.rotation.x = -Math.PI / 2;
  const floorRing = piece(plazaRoot, new THREE.RingGeometry(5.1, 5.13, 100), m.luminous, 0, .08, -9); floorRing.rotation.x = -Math.PI / 2;
  const fireflies = new THREE.BufferGeometry(), positions = new Float32Array(110 * 3);
  for (let i = 0; i < 110; i++) { positions[i * 3] = (rand() - .5) * 26; positions[i * 3 + 1] = .5 + rand() * 9; positions[i * 3 + 2] = -21 + rand() * 32; }
  fireflies.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(fireflies, new THREE.PointsMaterial({ color: '#ffd0a0', size: .055, transparent: true, opacity: .8, depthWrite: false })); plazaRoot.add(dust);
  return {
    scene, materials: m, player: actor.root, body: actor.body, weapon: actor.weapon, aura, auraMat,
    portalRing: p.rings,
    setShadowQuality(enabled, size) {
      sun.castShadow = enabled;
      if (sun.shadow.mapSize.x !== size) {
        sun.shadow.map?.dispose(); sun.shadow.mapPass?.dispose();
        sun.shadow.map = null; sun.shadow.mapPass = null; sun.shadow.mapSize.set(size, size);
      }
      sun.shadow.needsUpdate = true;
    },
    setArea(id) {
      if (id === area) return; area = id;
      if (id === 'garden' && !gardenWorld) gardenWorld = createGardenWorld(scene, m);
      plazaRoot.visible = id !== 'garden'; if (gardenWorld) gardenWorld.root.visible = id === 'garden';
      scene.background.set(id === 'garden' ? '#152e32' : '#1a273d'); scene.fog.color.set(id === 'garden' ? '#24483f' : '#29394d');
    },
    updateGarden(state, reducedMotion) { if (state.area === 'garden' && gardenWorld) gardenWorld.update(state, reducedMotion); },
    addEnemy(enemy) {
      const group = enemy.type === 'sentry' ? createGardenSentry(m) : createGuardian(m, enemy.boss); group.position.set(enemy.x, 0, enemy.z); scene.add(group);
      const marker = enemy.type === 'sentry' ? createBeamTelegraph() : createTelegraph(); scene.add(marker);
      return { group, marker };
    },
    animate(time, reducedMotion) {
      p.material.uniforms.uTime.value = reducedMotion ? 0 : time;
      if (!reducedMotion) dust.rotation.y = Math.sin(time * .04) * .025;
    },
  };
}

export function createPipeline(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .32, .5, 1.15);
  composer.addPass(bloom); composer.addPass(new OutputPass());
  let postprocessing = true;
  return {
    configure(settings) { postprocessing = settings.bloom; bloom.enabled = settings.bloom; composer.setPixelRatio(settings.pixelRatio); },
    resize(width, height) { composer.setSize(width, height); },
    render() { if (postprocessing) composer.render(); else renderer.render(scene, camera); },
  };
}
