import './main.js';
import './demo-shell.css';
// Wrap the current episode without changing the files reserved to Tonino.
const link=document.createElement('a');link.href='./index.html';link.textContent='Il progetto';link.className='demo-site-link';link.id='demo-home-link';document.querySelector('footer nav').append(link);
const account=document.createElement('a');account.href='./account.html';account.textContent='Account';account.className='demo-site-link';document.querySelector('footer nav').append(account);
const complete=document.createElement('dialog');complete.id='demo-complete';complete.setAttribute('aria-labelledby','demo-complete-title');
complete.innerHTML=`<p class="demo-note">Primo frammento completato</p><h2 id="demo-complete-title" tabindex="-1">Hai liberato una voce.</h2><p>Hai accolto il ricordo di Liora e spezzato il sigillo del Custode. La firma Cartiglio indica un’altra strada.</p><ul><li>Sei ruoli da sperimentare</li><li>Custodia o Impeto per cambiare la risposta agli impatti</li><li>Il Giardino e le Cave ti aspettano oltre il sentiero</li></ul><p class="demo-note">La demo è in sviluppo: grafica e bilanciamento sono ancora provvisori.</p><div class="demo-finish-actions"><button id="demo-continue" class="primary" type="button">Continua l’esplorazione</button><a href="./index.html#feedback">Raccontaci la tua prova</a></div>`;
document.body.append(complete);let pausedByRecap=false;
function resume(){complete.close();if(pausedByRecap&&document.getElementById('pause').textContent==='Riprendi')document.getElementById('pause').click();pausedByRecap=false;document.getElementById('world').focus({preventScroll:true});}
document.getElementById('demo-continue').addEventListener('click',resume);complete.addEventListener('cancel',event=>{event.preventDefault();resume();});
document.getElementById('memory-continue').addEventListener('click',()=>{
 if(!document.getElementById('memory-title').textContent.includes('nascosti'))return;
 pausedByRecap=document.getElementById('pause').textContent==='Pausa';if(pausedByRecap)document.getElementById('pause').click();complete.showModal();document.getElementById('demo-complete-title').focus();
});

document.getElementById('artifact-close').addEventListener('click',()=>document.getElementById('world').focus({preventScroll:true}));
