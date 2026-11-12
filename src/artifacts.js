// First relic: an optional combat choice unlocked by Liora's memory.
export const ATTUNEMENTS=Object.freeze([
 Object.freeze({id:'ward',name:'Custodia',description:'Dopo una schivata d’impatto, il prossimo colpo che ti raggiunge entro 6 s è ridotto del 75%. Una carica, non si accumula. Recupero: 6 s.'}),
 Object.freeze({id:'surge',name:'Impeto',description:'Dopo una schivata d’impatto il prossimo attacco base entro 3 s fa danno ×1,5, anche se va a vuoto lo consuma. In più recuperi 18 vigore e riduci di 0,8 s l’attesa dell’abilità. Recupero: 6 s.'}),
]);
// Cariche temporanee (secondi rimasti): vivono solo nella sessione, mai nei checkpoint.
export const WARD_WINDOW=6,WARD_FACTOR=.25,SURGE_WINDOW=3,SURGE_FACTOR=1.5;
export const createArtifact=()=>({attunement:null,cooldown:0,wardCharge:0,surgeCharge:0});
export const validAttunement=id=>id===null||ATTUNEMENTS.some(a=>a.id===id);
export const artifactUnlocked=s=>Boolean(s.evolved);
export function selectAttunement(s,id){
 if(!artifactUnlocked(s)||s.status!=='playing'||!ATTUNEMENTS.some(a=>a.id===id)||s.artifact.attunement===id)return false;
 if(s.action||s.dodgeRemaining>0||s.artifact.cooldown>0)return false;
 if(s.artifact.attunement!==null&&s.enemies.some(e=>(e.area||'plaza')===(s.area||'plaza')&&e.hp>0&&!e.sealed&&Math.hypot(e.x-s.x,e.z-s.z)<12))return false;
 s.artifact.attunement=id;return true;
}
export function activateArtifact(s){
 const a=s.artifact;if(!artifactUnlocked(s)||!a.attunement||a.cooldown>0)return null;
 a.cooldown=6;
 if(a.attunement==='ward')a.wardCharge=WARD_WINDOW;
 else{s.stamina=Math.min(100,s.stamina+18);s.cooldown=Math.max(0,s.cooldown-.8);a.surgeCharge=SURGE_WINDOW;}
 return a.attunement;
}
// Custodia: riduce un solo colpo vero (non schivato, non annullato da invulnerabilità).
// Se lo Scudo d'urto del Tank sta già riducendo il colpo, la carica resta per il prossimo.
export function consumeWard(s){
 const a=s.artifact;if(!(a.wardCharge>0)||s.shield>0)return false;
 a.wardCharge=0;return true;
}
// Impeto: consumato alla risoluzione del prossimo attacco base, anche se manca.
// Un attacco annullato prima della risoluzione (schivata, sconfitta) non lo consuma.
export function consumeSurge(s){
 const a=s.artifact;if(!(a.surgeCharge>0))return false;
 a.surgeCharge=0;return true;
}
