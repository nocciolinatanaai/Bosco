// Delivery encodings only: original artwork is preserved; no new art or remote API.
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const variants = [
  ...[480, 960, 1440].map(width => ({source:'public/site/first-fracture.png',file:`public/site/first-fracture-${width}.webp`,width,quality:85})),
  ...[224, 448].map(width => ({source:'public/art/liora-portrait.png',file:`public/site/liora-portrait-${width}.webp`,width,quality:88})),
];
const manifest={tool:execFileSync('ffmpeg',['-version'],{encoding:'utf8'}).split('\n')[0],purpose:'Responsive website delivery copies; originals and in-game portrait unchanged',variants:[]};
for(const variant of variants){
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',variant.source,'-vf',`scale=${variant.width}:-2`,'-c:v','libwebp','-quality',String(variant.quality),'-frames:v','1','-y',variant.file]);
  const data=await readFile(variant.file),original=await readFile(variant.source);
  const dimensions=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','json',variant.file],{encoding:'utf8'})).streams[0];
  manifest.variants.push({...variant,...dimensions,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),sourceSha256:createHash('sha256').update(original).digest('hex')});
}
await writeFile('public/site/image-delivery.json',JSON.stringify(manifest,null,2)+'\n');
console.log(manifest.variants.map(v=>({file:v.file,bytes:v.bytes,width:v.width,height:v.height})));
