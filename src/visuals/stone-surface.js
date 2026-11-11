import * as THREE from 'three';

// Native procedural PBR textures. Coherent mineral grain, worn edges and damp
// patches replace unrelated per-pixel noise; no external images or credentials.
const smooth = THREE.MathUtils.smoothstep;
const hash = (x,y) => { const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v); };
function noise(x,y) {
 const ix=Math.floor(x),iy=Math.floor(y),u=smooth(x-ix,0,1),v=smooth(y-iy,0,1);
 return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix,iy),hash(ix+1,iy),u),THREE.MathUtils.lerp(hash(ix,iy+1),hash(ix+1,iy+1),u),v);
}
export function createStoneSurface(size=256,{paving=true,tiles=1}={}) {
 const cell=size/tiles;
 const height=new Float32Array(size*size),color=new Uint8Array(size*size*4),normal=new Uint8Array(color.length),roughness=new Uint8Array(color.length);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const tileX=Math.floor(x/cell),tileY=Math.floor(y/cell),seed=tileX+tileY*tiles;
  const u=(x%cell)/(cell-1),v=(y%cell)/(cell-1),i=(y*size+x)*4;
  const broad=noise(u*4+9+seed*11,v*4+17+seed*7),grain=noise(u*27+seed*13,v*27+seed*5),fine=hash(x,y);
  const edge=Math.min(u,v,1-u,1-v),wear=1-smooth(edge,.005,.038+grain*.012);
  const vein=Math.abs(u-(.25+seed*.16)-Math.sin(v*7+seed)*.11-noise(v*17+seed,3)*.018);
  const fracture=paving&&seed%4!==0?(1-smooth(vein,.001,.006))*smooth(v,.15,.4)*(1-smooth(v,.7,.9)):0;
  const damp=smooth(noise(u*3+21+seed*9,v*3+4+seed*5),.43,.7);
  const moss=paving?wear*smooth(noise(u*9+13,v*9+5),.47,.7):0;
  height[y*size+x]=.5+broad*.08+grain*.018+fine*.002-(paving?wear*.085:0)-fracture*.03;
  const stone=(153+broad*42+grain*13+(fine-.5)*6)*(1-damp*.16)*(1-fracture*.3)*(1-wear*.13);
  color.set([stone*(1-moss*.2),stone*(.98-moss*.03),stone*(.94-moss*.23),255],i);
  const r=Math.round(255*THREE.MathUtils.clamp(.93-damp*.52+moss*.15,.32,.97));roughness.set([r,r,r,255],i);
 }
 const at=(x,y,tileX,tileY)=>height[THREE.MathUtils.clamp(y,tileY*cell,(tileY+1)*cell-1)*size+THREE.MathUtils.clamp(x,tileX*cell,(tileX+1)*cell-1)];
 const n=new THREE.Vector3();
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const tx=Math.floor(x/cell),ty=Math.floor(y/cell);
  n.set((at(x-1,y,tx,ty)-at(x+1,y,tx,ty))*16,(at(x,y-1,tx,ty)-at(x,y+1,tx,ty))*16,1).normalize();
  normal.set([(n.x*.5+.5)*255,(n.y*.5+.5)*255,(n.z*.5+.5)*255,255],(y*size+x)*4);
 }
 const texture=data=>{const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;};
 const map=texture(color);map.colorSpace=THREE.SRGBColorSpace;
 return {map,normalMap:texture(normal),roughnessMap:texture(roughness)};
}
