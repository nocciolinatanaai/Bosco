import * as THREE from 'three';
let surface;
// Shared native data maps: subtle weave on original UVs; no edited raster image.
export function rangerFabric() {
 if(surface)return surface;
 const size=128,normal=new Uint8Array(size*size*4),roughness=new Uint8Array(normal.length),v=new THREE.Vector3();
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,a=Math.sin(x*Math.PI/2),b=Math.sin(y*Math.PI/2);
  v.set(a*.18,b*.18,1).normalize();normal.set([(v.x*.5+.5)*255,(v.y*.5+.5)*255,(v.z*.5+.5)*255,255],i);
  const r=232+Math.round(a*b*12);roughness.set([r,r,r,255],i);
 }
 const texture=data=>{const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;};
 surface={normalMap:texture(normal),roughnessMap:texture(roughness)};return surface;
}
