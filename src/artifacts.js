// First relic: an optional combat choice unlocked by Liora's memory.
export const ATTUNEMENTS=Object.freeze([
 Object.freeze({id:'ward',name:'Custodia',description:'Dopo una schivata d’impatto ottieni protezione per 2,2 s. Riduce del 75% i danni ricevuti. Recupero: 6 s.'}),
 Object.freeze({id:'surge',name:'Impeto',description:'Dopo una schivata d’impatto recuperi 18 vigore e riduci di 0,8 s l’attesa dell’abilità. Recupero: 6 s.'}),
]);
export const createArtifact=()=>({attunement:null,cooldown:0});
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
 if(a.attunement==='ward')s.shield=Math.max(s.shield,2.2);
 else{s.stamina=Math.min(100,s.stamina+18);s.cooldown=Math.max(0,s.cooldown-.8);}
 return a.attunement;
}
