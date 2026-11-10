import { CLASSES } from './game.js';

const paths = {
  attack: '<path d="m5 3 10 10m0-10L5 13M3 17l4-4m-4 0 4 4m6-4 4 4m-4 0 4-4"/>',
  skill: '<path d="m10 1 2.5 6.5L19 10l-6.5 2.5L10 19l-2.5-6.5L1 10l6.5-2.5Z"/>',
  dash: '<path d="m3 4 6 6-6 6m8-12 6 6-6 6"/>',
};
const icon = (name) => `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">${paths[name]}</svg>`;

export function mountUI() {
  document.querySelector('#app').innerHTML = `
  <main>
    <canvas id="world" aria-label="Arena di Mythwood. Consulta Comandi per tastiera, tocco e movimento."></canvas>
    <div class="vignette" aria-hidden="true"></div><div id="damage-flash" aria-hidden="true"></div>
    <div id="world-labels" aria-hidden="true"></div>
    <header><a href="#" id="brand">MYTH<span>WOOD</span><small>LA PRIMA FRATTURA</small></a><span class="build">STUDIO GIOCABILE · SOLO</span><button id="pause" type="button">Pausa</button></header>
    <aside class="quest"><button id="quest-toggle" type="button" aria-expanded="true" aria-controls="quest-details"><small class="eyebrow">SPEDIZIONE 01</small><strong><span id="quest-title">Trova gli echi</span> <span aria-hidden="true">⌄</span></strong></button><p id="journey-hint"></p><div id="quest-details"><p id="objective">Il Custode conserva l’ultima memoria della squadra scomparsa.</p><p id="region">◇ Piazza del ritorno</p></div></aside>
    <section id="boss" hidden aria-label="Il Custode Vuoto"><div><span>IL CUSTODE VUOTO</span><small id="boss-intent">OSSERVA IL SUO ATTACCO</small></div><progress id="boss-hp" max="280" value="280" aria-label="Vita del Custode"></progress></section>
    <p id="toast" role="status" aria-live="polite"></p>
    <section id="hud" hidden aria-label="Stato del personaggio"><div class="identity"><strong id="role-name"></strong><small id="rank">RANGO INIZIALE</small></div><div class="meters"><label for="hp">VITA <output id="hp-text"></output></label><progress id="hp" max="100" value="100"></progress><label for="stamina">VIGORE <output id="stamina-text"></output></label><progress id="stamina" max="100" value="100"></progress></div><span id="target-status">Nessun bersaglio selezionato</span></section>
    <section id="actions" hidden aria-label="Combattimento"><button id="attack" type="button" data-combat-action aria-label="Attacco base. Tieni premuto per continuare la combo."><kbd>J</kbd>${icon('attack')}<strong>Attacco</strong><span id="combo-label">COMBO · · ·</span></button><button id="skill" type="button" data-combat-action><kbd>Q</kbd>${icon('skill')}<strong id="skill-name"></strong><strong class="skill-short" aria-hidden="true">Abilità</strong><span id="skill-state">PRONTA</span></button><button id="dash" type="button" data-combat-action aria-label="Scatto. Richiede 30 vigore."><kbd>SPAZIO</kbd>${icon('dash')}<strong>Scatto</strong><span id="dash-state">30 VIGORE</span></button><button id="evolve" type="button" hidden><kbd>E</kbd>Risveglia l’eco</button></section>
    <div id="touch-controls" hidden><button id="joystick" type="button" aria-label="Trascina per muoverti. Le frecce alternative si attivano in Comandi."><span id="joystick-knob"></span><small>MUOVITI</small></button><div id="movement" hidden aria-label="Frecce direzionali"><button data-move="up" aria-label="Avanti">↑</button><button data-move="left" aria-label="Sinistra">←</button><button data-move="down" aria-label="Indietro">↓</button><button data-move="right" aria-label="Destra">→</button></div></div>
    <p id="control-hint" hidden>WASD · Muoviti &nbsp; J · Attacca &nbsp; Q · Abilità &nbsp; Spazio · Scatta</p>
    <section id="pause-overlay" hidden><span class="eyebrow">MODALITÀ INDIVIDUALE</span><h2>Un respiro<br>fra le rovine.</h2><button id="resume" class="primary" type="button">Riprendi</button></section>
    <footer><span>UNA SOGLIA. SEI DESTINI.</span><nav aria-label="Informazioni"><button id="help" type="button">Comandi</button><button id="guild" type="button">Gilde</button><button id="store" type="button">Store</button><button id="privacy" type="button">Privacy</button></nav></footer>
    <dialog id="selection"><small class="eyebrow">SCEGLI CHI ATTRAVERSERÀ LA SOGLIA</small><h2>Il potere lascia<br>sempre <em>un’eco.</em></h2><p class="intro">La squadra non è tornata. Impara a leggere gli attacchi, trova un’apertura e libera il suo ultimo ricordo.</p><div class="classes">${CLASSES.map((r, i) => `<button type="button" data-class="${r.id}" aria-pressed="${i === 1}" style="--class-color:${r.color}"><span>0${i + 1}</span><strong>${r.name}</strong><small>${r.title}</small></button>`).join('')}</div><p id="class-description"></p><div class="selection-actions"><small>Prova locale · Progressi non salvati</small><button id="start" class="primary" type="button">Attraversa la soglia ↗</button></div><p class="note">Studio visivo e di combattimento in sviluppo. Gioco individuale; personaggi e animazioni non sono ancora definitivi.</p></dialog>
    <dialog id="information"><button id="close-info" type="button">Chiudi</button><h2 id="info-title"></h2><p id="info-body"></p><div id="input-options" hidden><label><input type="checkbox" id="dpad-option"> Usa frecce touch al posto del joystick</label><label><input type="checkbox" id="motion-option"> Riduci effetti di movimento</label></div></dialog>
    <dialog id="memory"><small class="eyebrow">UN FRAMMENTO DELLA SQUADRA</small><h2 id="memory-title"></h2><p id="memory-body"></p><button id="memory-continue" class="primary" type="button"></button></dialog>
    <dialog id="result"><small class="eyebrow">LA SPEDIZIONE NON È FINITA</small><h2>Puoi tornare<br>alla soglia.</h2><p id="result-text">Le cariche si evitano uscendo dal cerchio. Usa lo scatto e attacca durante il recupero del nemico.</p><div class="result-actions"><button id="restart" type="button" class="primary">Riprova</button><button id="change-class" type="button">Cambia classe</button></div></dialog>
    <section id="graphics-error" role="alert" hidden><h2>La scena 3D non è disponibile</h2><p>WebGL non è stato inizializzato. Prova con accelerazione grafica attiva.</p></section>
  </main>`;
  return (id) => document.getElementById(id);
}
