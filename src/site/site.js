import {initCookies} from '../privacy/cookies.js';import {privacyStore} from '../privacy/preferences.js';
import { CLASSES } from '../roles.js';
import './site.css';
initCookies();
const symbols={tank:'◇',fighter:'╱',assassin:'⋈',mage:'✧',ranger:'⌁',healer:'✣'};
for(const button of document.querySelectorAll('[data-role]'))button.addEventListener('click',()=>{
 privacyStore.setRole(button.dataset.role);
 const role=CLASSES.find(r=>r.id===button.dataset.role);
 for(const item of document.querySelectorAll('[data-role]'))item.setAttribute('aria-pressed',String(item===button));
 document.getElementById('class-symbol').textContent=symbols[role.id];document.getElementById('class-title').textContent=role.title;document.getElementById('class-skill').textContent=role.skill;document.getElementById('class-description').textContent=role.description;
});
const form=document.getElementById('feedback-form'),status=document.getElementById('feedback-status');
function response(){return `MYTHWOOD · Demo\nTornerei a giocare: ${document.getElementById('return-answer').value}\n${document.getElementById('feedback-text').value.trim()}\nInteresse a un futuro pacchetto sostenitore: ${document.getElementById('support-interest').checked?'sì':'non indicato'}`;}
function download(){const url=URL.createObjectURL(new Blob([response()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='mythwood-feedback.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Testo scaricato. Nessuna risposta inviata automaticamente.';}
document.getElementById('download-feedback').addEventListener('click',()=>{if(form.reportValidity())download();});
form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;
 if(navigator.share){try{await navigator.share({title:'La mia prova di MYTHWOOD',text:response()});status.textContent='Condivisione completata con la destinazione scelta.';}catch(error){status.textContent=error.name==='AbortError'?'Condivisione annullata. La risposta resta qui.':'Condivisione non disponibile. Puoi scaricare il testo.';}}
 else download();
});

const remembered=privacyStore.getRole();if(remembered)document.querySelector(`[data-role="${remembered}"]`)?.click();
