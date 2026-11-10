import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

// Separate authoring fixture: real Three.js geometry, not the game's camera.
const fixture = `<!doctype html><html lang="it"><meta charset="utf-8"><title>Mythwood — studio Ranger</title>
<style>body{margin:0;background:#15212a;color:#e9dbbd;font:16px system-ui;text-align:center}h1{font:28px Georgia;margin:20px 0 6px}p{margin:8px}canvas{display:block;width:100%;height:820px}.labels{display:flex;justify-content:space-around}small{color:#a5b1b6}</style>
<h1>MYTHWOOD · Studio Ranger</h1><p>Corpo condiviso precedente / Prima traduzione originale</p><div class="labels"><span>PRIMA</span><span>RANGER · PROTOTIPO</span></div><canvas id="study"></canvas><small>Vista di authoring · geometria reale · non è la camera del gioco</small>
<script type="module">
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createGenericAdventurer} from '/src/visuals/actors.js';
import {createRangerActor} from '/src/visuals/ranger.js';
import {createMaterials} from '/src/visuals/materials.js';
import {CLASSES} from '/src/roles.js';
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('study'),antialias:true});
renderer.setSize(1200,820,false);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
const scene=new THREE.Scene();scene.background=new THREE.Color('#15212a');
const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(room,.04);
scene.environment=env.texture;scene.environmentIntensity=.3;room.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight('#dceafa','#33342c',1.2));
const key=new THREE.DirectionalLight('#ffdfb3',2.5);key.position.set(3,6,5);scene.add(key);
const fill=new THREE.DirectionalLight('#8aabd2',.7);fill.position.set(-3,4,-3);scene.add(fill);
const camera=new THREE.PerspectiveCamera(35,1200/820,.1,30);camera.position.set(0,2.5,5.1);camera.lookAt(0,1.15,0);
const old=createGenericAdventurer(createMaterials()),ranger=createRangerActor();
old.root.rotation.y=0;old.root.userData.setClass(CLASSES.find(r=>r.id==='ranger'));
old.root.position.x=-1.05;ranger.root.position.x=1.05;scene.add(old.root,ranger.root);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(9,7),new THREE.MeshStandardMaterial({color:'#263540',roughness:1}));floor.rotation.x=-Math.PI/2;scene.add(floor);
window.studyPose=(pose)=>{
 const combat={style:'bow',evolved:pose!=='base',returnShot:pose==='draw'?3:0,action:pose==='draw'?{elapsed:.24,windup:.28,duration:.7,kind:'skill'}:null};
 old.root.rotation.y=pose==='back'?Math.PI: .2;ranger.root.rotation.y=pose==='back'?Math.PI:.2;
 old.root.userData.animate(1.25,false,0,true,combat);ranger.root.userData.animate(1.25,false,0,true,combat);
 renderer.render(scene,camera);
};
window.studyPose('base');
let meshTriangles=0,meshes=0;const materials=new Set();ranger.root.traverse(n=>{if(n.isMesh){meshes++;meshTriangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;materials.add(n.material);}});
window.studyStats={meshTriangles,meshes,materials:materials.size};window.studyReady=true;
</script></html>`;

await mkdir('test-results', { recursive: true }); await writeFile('test-results/character-study.html', fixture);
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5185', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let browser;
const report = { status: 'running', fixture: 'authoring comparison with the same lighting/camera; not gameplay', startedAtUtc: new Date().toISOString(), images: [] };
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Studio server timeout')), 15000);
    server.stdout.on('data', data => { if (String(data).includes('5185')) { clearTimeout(timer); resolve(); } });
    server.once('error', reject); server.once('exit', code => reject(Error('Studio exit ' + code)));
  });
  report.runnerSha256 = createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
  report.rangerSourceSha256 = createHash('sha256').update(await readFile('src/visuals/ranger.js')).digest('hex');
  browser = await chromium.launch({ ...(process.env.MYTHWOOD_CHROMIUM_PATH ? { executablePath: process.env.MYTHWOOD_CHROMIUM_PATH } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 960 } }), errors = [], external = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    if (new URL(route.request().url()).origin !== 'http://127.0.0.1:5185') { external.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  await page.goto('http://127.0.0.1:5185/test-results/character-study.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.studyReady);
  report.model = await page.evaluate(() => window.studyStats); assert.ok(report.model.meshTriangles < 20000);
  for (const pose of ['base', 'resonance', 'draw', 'back']) {
    await page.evaluate(pose => window.studyPose(pose), pose);
    const path = 'test-results/ranger-model-' + pose + '.png'; await page.screenshot({ path });
    report.images.push({ pose, sha256: createHash('sha256').update(await readFile(path)).digest('hex') });
  }
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  report.status = 'passed'; report.errors = 0; report.externalRequests = 0; report.finishedAtUtc = new Date().toISOString();
  console.log('PASS Ranger authoring: four poses, real geometry, no page errors/external requests');
} catch (error) { report.status = 'failed'; report.error = error.message; throw error; }
finally { await writeFile('test-results/character-report.json', JSON.stringify(report, null, 2)); await browser?.close(); server.kill('SIGTERM'); }
