import * as THREE from 'three';
import { CLASSES, createSession, attack, cast, dodge, movePlayer, tickCooldowns, advanceEnemies, interactGarden, attuneArtifact, evolve, canEvolve, selectedEnemy, setTarget, drainEvents } from './game.js';
import { createCheckpointStore, restoreCheckpoint, checkpointLabel, checkpointFromSession } from './checkpoints.js';
import { gardenObjective, GARDEN_ENTRY, inArea } from './garden.js';
import { activeTrace, TRACE_RADIUS } from './trail.js';
import { createMemoryTrail } from './visuals/memory-trail.js';
import { qualitySettings } from './graphics-quality.js';
import { defeatMessage } from './defeat.js';
import { createCombatAudio } from './audio/index.js';
import { journey, MEMORY } from './journey.js';
import { ATTUNEMENTS, artifactUnlocked } from './artifacts.js';
import { screenMovement, joystickVector } from './controls.js';
import { createArtWorld, createPipeline } from './visuals/environment.js';
import { updateTelegraph } from './visuals/telegraph.js';
import { createCombatEffects } from './visuals/combat-effects.js';

export function startRuntime($) {
  const audio = createCombatAudio({ onStatus(status) {
    $('audio-option').checked = status.enabled; $('audio-start').checked = status.enabled;
    $('audio-volume').value = Math.round(status.volume * 100); $('audio-volume-text').textContent = `${Math.round(status.volume * 100)}%`;
    const messages = { off: 'Audio disattivato', paused: 'Audio in pausa', muted: 'Volume a zero', on: 'Effetti sonori attivi', waiting: 'Audio in attesa: disattivalo e riattivalo per riprovare', unsupported: 'Audio non supportato: puoi continuare senza suoni', unavailable: 'Audio non disponibile: puoi continuare senza suoni' };
    $('audio-status').textContent = messages[status.state]; $('audio-status').dataset.state = status.state;
  } });
  $('audio-start').addEventListener('change', () => { $('audio-option').checked = $('audio-start').checked; });
  $('audio-option').addEventListener('change', () => { void audio.setEnabled($('audio-option').checked); });
  $('audio-volume').addEventListener('input', () => audio.setVolume(Number($('audio-volume').value) / 100));
  window.addEventListener('pagehide', () => { void audio.setPaused(true); });
  let memoryKind = null, lastGuide = null, portraitFailed = false;
  const memory = $('memory'),artifactMenu=$('artifact-menu');
  let pendingAttunement=null,pausedBeforeArtifact=false;
  $('liora-portrait').addEventListener('error', () => { portraitFailed = true; $('liora-portrait').hidden = true; $('liora-frame').hidden = true; memory.classList.remove('with-portrait'); });
  let selected = 'fighter', state = null, paused = false, pausedBeforeInfo = false;
  let target = null, approachId = null, heldAttack = false, pointerId = null;
  let stick = { x: 0, y: 0 }, dpad = false, motionOverride = false;
  let accumulator = 0, moving = false, uiAt = 0, noticeUntil = 0;
  const keys = new Set(), selection = $('selection'), info = $('information'), result = $('result');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionReduced = () => reducedMotion.matches || motionOverride;
  const active = () => state?.status === 'playing' && !paused && !selection.open && !info.open && !result.open && !memory.open && !artifactMenu.open;
  const checkpointStore = createCheckpointStore();
  let saved = checkpointStore.load(), saveEnabled = Boolean(saved.checkpoint?.autoSave);
  function refreshSaveUI(message = '') {
    $('save-start').checked = saveEnabled; $('save-option').checked = saveEnabled;
    $('saved-checkpoint').hidden = !saved.checkpoint && saved.status !== 'invalid';
    $('saved-summary').textContent = saved.checkpoint ? checkpointLabel(saved.checkpoint) : 'La tappa non è leggibile. Puoi eliminarla oppure iniziare senza salvarla.';
    $('resume-saved').hidden = !saved.checkpoint;
    $('delete-save').hidden = !saved.checkpoint && saved.status !== 'invalid';
    $('start').textContent = saved.checkpoint ? 'Nuova spedizione ↗' : 'Attraversa la soglia ↗';
    $('restart').textContent = saveEnabled && saved.checkpoint ? 'Riprova dalla tappa' : 'Riprova';
    const defaultMessage = saved.status === 'unavailable' ? 'Memoria del dispositivo non disponibile. Puoi giocare senza salvataggio.'
      : saveEnabled ? 'Salvataggio attivo alle tappe. I combattimenti in corso non vengono conservati.'
      : saved.checkpoint ? 'Autosalvataggio disattivato. La tappa precedente resta disponibile.'
      : 'Facoltativo: salva solo classe e tappe. Nessun account o invio al server.';
    $('save-start-status').textContent = message || (saved.checkpoint && saveEnabled ? 'Una nuova spedizione sostituirà questa tappa; Riprendi conserva i progressi.' : defaultMessage);
    $('save-status').textContent = message || `${defaultMessage} Attivarlo conserva la spedizione aperta. Elimina tappa rimuove soltanto il salvataggio Mythwood.`;
  }
  function acceptSaveResult(result, operation) {
    if (Object.hasOwn(result, 'checkpoint')) saved = result;
    if (result.status === 'conflict') {
      saveEnabled = false; saved = checkpointStore.load();
      const text = 'Salvataggio sospeso: un’altra scheda ha cambiato la tappa. Apri la selezione per scegliere cosa riprendere.';
      refreshSaveUI(text); notice(text, 6); return;
    }
    if (result.status === 'unavailable') {
      saveEnabled = false;
      const text = operation === 'delete' ? 'Non è stato possibile eliminare la tappa: memoria non accessibile.' : 'Salvataggio non disponibile. La spedizione continua senza nuovi salvataggi.';
      refreshSaveUI(text); notice(text, 6); return;
    }
    refreshSaveUI();
  }
  function saveProgress(overwrite = false) {
    if (saveEnabled && state) acceptSaveResult(checkpointStore.save(state, overwrite), 'save');
  }
  function changeSaving(enabled, fromSelection) {
    if (enabled && !fromSelection && state && saved.checkpoint && checkpointLabel(saved.checkpoint) !== checkpointLabel(checkpointFromSession(state)) &&
        !window.confirm('Conservare la spedizione aperta al posto della tappa precedente?')) { refreshSaveUI(); return; }
    saveEnabled = enabled;
    if (!enabled) { acceptSaveResult(checkpointStore.pause(), 'pause'); return; }
    if (state && !fromSelection) { saveProgress(); return; }
    refreshSaveUI();
  }
  function deleteCheckpoint() {
    if (!window.confirm('Eliminare la tappa salvata su questo dispositivo? La spedizione aperta resterà giocabile.')) return;
    saveEnabled = false; acceptSaveResult(checkpointStore.clear(), 'delete');
  }
  $('save-start').addEventListener('change', () => changeSaving($('save-start').checked, true));
  $('save-option').addEventListener('change', () => changeSaving($('save-option').checked, false));
  $('delete-save').addEventListener('click', deleteCheckpoint); $('forget-saved').addEventListener('click', deleteCheckpoint);
  refreshSaveUI();
  function notice(text, duration = 4) { $('toast').textContent = text; noticeUntil = performance.now() + duration * 1000; }
  function choose(id) {
    selected = id;
    const role = CLASSES.find((r) => r.id === id);
    document.querySelectorAll('[data-class]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.class === id)));
    $('class-description').textContent = `${role.skill} — ${role.description}${role.id === 'ranger' ? ' Risveglio: schiva un impatto e rispondi con un tiro doppio.' : ''}`;
  }
  document.querySelectorAll('[data-class]').forEach((b) => b.addEventListener('click', () => choose(b.dataset.class)));
  choose(selected); selection.showModal();

  function clearControls() {
    keys.clear(); heldAttack = false; stick = { x: 0, y: 0 }; target = null; approachId = null;
    const old = pointerId; pointerId = null;
    if (old !== null && $('joystick').hasPointerCapture(old)) $('joystick').releasePointerCapture(old);
    $('joystick-knob').style.transform = 'translate(0px, 0px)';
    if (state) { state.inputBuffer = 0; state.skillBuffer = 0; }
    accumulator = 0;
  }
  function setPause(value) {
    paused = value; clearControls();
    $('pause').textContent = value ? 'Riprendi' : 'Pausa';
    $('pause-overlay').hidden = !value || state?.status !== 'playing';
    document.body.classList.toggle('is-paused', Boolean(value && state?.status === 'playing'));
    return audio.setPaused(value);
  }
  const showInfo = (title, body, controls = false) => {
    pausedBeforeInfo = paused; setPause(true);
    $('info-title').textContent = title; $('info-body').textContent = body;
    $('input-options').hidden = !controls; info.showModal();
  };
  $('help').addEventListener('click', () => showInfo('Leggi l’attacco. Trova l’apertura.', 'PC: WASD o frecce per muoverti rispetto allo schermo. J o Attacco per la combo; tieni premuto per continuarla. Q usa l’abilità di classe. Spazio scatta e consuma 30 vigore. Tocca il terreno per muoverti o un nemico per avvicinarti e attaccarlo. Touch: joystick a sinistra, azioni a destra. Esci dal cerchio durante la carica e colpisci nel recupero del nemico. E risveglia l’eco dopo aver liberato i due echi. Il nuovo scatto colpisce anche i nemici vicini; usalo contro il Custode. Il Ranger risvegliato può schivare un impatto all’ultimo istante e usare l’abilità entro 4 secondi per un tiro doppio. Dopo la vittoria segui le tracce e scatta vicino ai segni. F segue la traccia successiva oppure interagisce con il passaggio e gli oggetti del giardino; il movimento manuale interrompe il percorso. Esc mette in pausa.', true));
  $('guild').addEventListener('click', () => showInfo('Una storia da costruire insieme', 'Gilde, contributi asincroni e spedizioni cooperative fanno parte del design approvato. Questa prova è esclusivamente individuale: nessun altro giocatore è collegato.'));
  $('store').addEventListener('click', () => showInfo('Store Mythwood', 'Store chiuso durante il prototipo. Nessun prodotto, codice o pagamento attivo. Il catalogo precedente non viene caricato.'));
  $('privacy').addEventListener('click', () => showInfo('Questa prova resta nel browser', 'Il prototipo non crea account, non usa cookie, non invia telemetria e non contatta Supabase. Solo se attivi il salvataggio conserva classe, tappe, tecnica del sigillo, stato della missione nel giardino e preferenza di autosalvataggio in questo browser. Puoi disattivarlo mantenendo la tappa o eliminarla da Comandi e audio. Non vengono salvati credenziali o combattimenti in corso. Il server locale riceve le normali richieste dei file. Non è ancora l’informativa del futuro servizio online.'));
  $('close-info').addEventListener('click', () => { info.close(); setPause(pausedBeforeInfo); });
  info.addEventListener('cancel', () => setPause(pausedBeforeInfo));
  memory.addEventListener('cancel', e => e.preventDefault());
  $('memory-continue').addEventListener('click', () => {
    const awakening = memoryKind === 'resonance'; memory.close(); memoryKind = null; const ready = setPause(false);
    if (!awakening) void ready.then(() => { if (active()) audio.play('victory'); });
    if (awakening) {evolve(state);if(pendingAttunement)attuneArtifact(state,pendingAttunement);}
    pendingAttunement=null;consumeEvents(); updateUI();
  });
  function showMemory(kind) {
    memoryKind = kind;pendingAttunement=null;const text = MEMORY[kind];
    $('memory-artifact').hidden=kind!=='resonance';$('memory-artifact-status').textContent='';
    $('memory-title').textContent = text.title; $('memory-body').textContent = text.body; $('memory-continue').textContent = text.button;
    if (!portraitFailed) {
      const portrait = $('liora-portrait');
      if (!portrait.getAttribute('src')) portrait.src = `${import.meta.env.BASE_URL}art/liora-portrait.png`;
      portrait.hidden = false; $('liora-frame').hidden = false; memory.classList.add('with-portrait');
    }
    setPause(true); memory.showModal();updateArtifactUI(); $('memory-title').focus({ preventScroll: true }); memory.scrollTop = 0;
  }
  function updateArtifactUI(){
    if(!state)return;
    const chosen=memoryKind==='resonance'&&memory.open?pendingAttunement:state.artifact.attunement;
    document.querySelectorAll('[data-attunement]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.attunement===chosen)));
    $('artifact-open').hidden=!artifactUnlocked(state);
    const attuned=ATTUNEMENTS.find(a=>a.id===state.artifact.attunement);
    $('artifact-status').hidden=!artifactUnlocked(state);
    $('artifact-status').textContent=attuned?`Sigillo · ${attuned.name} · ${state.artifact.cooldown>0?Math.ceil(state.artifact.cooldown)+' s':'pronto'}`:'Sigillo ritrovato · scegli una tecnica dal menu Sigillo';
  }
  document.querySelectorAll('[data-attunement]').forEach(button=>button.addEventListener('click',()=>{
    if(!state)return;const id=button.dataset.attunement,choice=ATTUNEMENTS.find(a=>a.id===id);if(!choice)return;
    if(memory.open&&memoryKind==='resonance'){
      pendingAttunement=id;$('memory-artifact-status').textContent=`${choice.name} scelta. Accogli il ricordo per attivarla.`;
    }else{
      const changed=attuneArtifact(state,id);
      $('artifact-menu-status').textContent=changed?`${choice.name} attiva.`:state.artifact.attunement===id?`${choice.name} è già attiva.`:'Torna alla spedizione per completare il recupero e trova un luogo sicuro prima di cambiare tecnica.';
      consumeEvents();
    }
    updateArtifactUI();
  }));
  $('artifact-open').addEventListener('click',()=>{
    if(!state||!artifactUnlocked(state))return;pausedBeforeArtifact=paused;setPause(true);updateArtifactUI();$('artifact-menu-status').textContent='';artifactMenu.showModal();
  });
  $('artifact-close').addEventListener('click',()=>{artifactMenu.close();setPause(pausedBeforeArtifact);});
  artifactMenu.addEventListener('cancel',()=>setPause(pausedBeforeArtifact));
  selection.addEventListener('cancel', (e) => e.preventDefault());
  result.addEventListener('cancel', (e) => e.preventDefault());
  $('pause').addEventListener('click', () => { if (state?.status === 'playing') setPause(!paused); });
  $('resume').addEventListener('click', () => setPause(false));
  $('brand').addEventListener('click', (e) => { e.preventDefault(); setPause(true); saved = checkpointStore.load(); saveEnabled = Boolean(saved.checkpoint?.autoSave); refreshSaveUI(); selection.showModal(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state) setPause(true); });
  window.addEventListener('blur', () => { if (state) setPause(true); else clearControls(); });
  $('dpad-option').addEventListener('change', () => {
    dpad = $('dpad-option').checked; clearControls(); $('movement').hidden = !dpad; $('joystick').hidden = dpad;
  });
  $('motion-option').addEventListener('change', () => { motionOverride = $('motion-option').checked; });
  const expandQuest = (expanded) => {
    $('quest-toggle').setAttribute('aria-expanded', String(expanded)); $('quest-details').hidden = !expanded;
    document.body.classList.toggle('quest-expanded', expanded);
  };
  expandQuest(innerWidth > 700 && innerHeight > 560);
  $('quest-toggle').addEventListener('click', () => expandQuest($('quest-toggle').getAttribute('aria-expanded') !== 'true'));

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: $('world'), antialias: true, powerPreference: 'high-performance' }); }
  catch { $('graphics-error').hidden = false; $('start').disabled = true; $('resume-saved').disabled = true; $('class-description').textContent = 'WebGL non disponibile: la scena non può essere avviata.'; return; }
  let graphics = qualitySettings('balanced', devicePixelRatio);
  renderer.setPixelRatio(graphics.pixelRatio);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const art = createArtWorld(renderer), { scene, player, aura, auraMat } = art;
  const camera = new THREE.PerspectiveCamera(55, 1, .1, 160), focus = new THREE.Vector3(0, 1, -2);
  camera.position.set(11, 13, 20); camera.lookAt(focus);
  const pipeline = createPipeline(renderer, scene, camera), effects = createCombatEffects(scene), trailView = createMemoryTrail(scene);
  const enemyViews = new Map(), labels = new Map(), floats = [];
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ray = new THREE.Raycaster(), pointer = new THREE.Vector2(), hit = new THREE.Vector3();
  const offset = new THREE.Vector3(), desired = new THREE.Vector3(), projected = new THREE.Vector3();
  const targetRing = new THREE.Mesh(new THREE.RingGeometry(.95, 1.02, 64), new THREE.MeshBasicMaterial({ color: '#f6daa8', side: THREE.DoubleSide, transparent: true, opacity: .8, depthWrite: false }));
  targetRing.rotation.x = -Math.PI / 2; scene.add(targetRing); targetRing.visible = false;
  const barrier = new THREE.Mesh(new THREE.SphereGeometry(1.35, 16, 10), new THREE.MeshBasicMaterial({ color: '#9ad5ed', transparent: true, opacity: .1, wireframe: true, depthWrite: false }));
  barrier.scale.y = 1.2; scene.add(barrier); barrier.visible = false;

  function floatText(text, x, z, type = '') {
    const element = document.createElement('span'); element.className = `floating-number ${type}`; element.textContent = text;
    $('world-labels').append(element); floats.push({ element, x, z, age: 0 });
    while (floats.length > 18) floats.shift().element.remove();
  }
  function consumeEvents() {
    if (!state) return;
    for (const event of drainEvents(state)) {
      if (['evolved', 'cleared', 'trail-progress', 'garden-progress','artifact-attuned'].includes(event.type)) saveProgress();
      effects.event(event, state, motionReduced());
      if (event.type === 'evolved') void audio.setPaused(paused).then(() => { if (active()) audio.event(event); });
      else audio.event(event);
      if (event.type === 'hit') floatText(`${event.amount}${event.critical ? '!' : ''}`, event.x, event.z, event.critical ? 'critical' : '');
      if (event.type === 'heal') { if (event.amount > 0) floatText(`+${event.amount}`, state.x, state.z, 'healing'); notice('Risonanza vitale · impulso rilasciato', 2); }
      if (event.type === 'hurt') {
        floatText(`−${event.amount}`, state.x, state.z, 'damage');
        if (!motionReduced()) { $('damage-flash').classList.remove('flash'); void $('damage-flash').offsetWidth; $('damage-flash').classList.add('flash'); }
      }
      if (event.type === 'return-shot-ready') notice('TIRO DI RITORNO · Usa l’abilità entro 4 secondi per scoccare due frecce.', 4);
      if (event.type === 'return-shot-fired') notice('TIRO DI RITORNO · Due frecce, una sola apertura.', 3);
      if(event.type==='artifact-triggered'){notice(event.attunement==='ward'?'CUSTODIA · Protezione del sigillo per 2,2 secondi':'IMPETO · Vigore recuperato e abilità anticipata',2.5);audio.play(event.attunement==='ward'?'guard':'echo');}
      if (event.type === 'evaded') floatText('SCHIVATO', state.x, state.z, 'evade');
      if (event.type === 'enemy-windup' && event.boss) notice(event.kind === 'nova' ? 'ONDA DEL SIGILLO · Allontanati dal Custode, poi torna a colpire' : 'FRATTURA · Spostati dal punto segnato', 2.2);
      if (event.type === 'miss' && !heldAttack && !keys.has('KeyJ')) notice('Fuori portata · avvicinati al bersaglio', 1.8);
      if (event.type === 'garden-progress') {
        if (['enter', 'leave'].includes(event.interaction)) { syncEnemyViews(); switchArea(); }
        const messages = { enter: 'Giardino dei nomi · Recupera la bussola. Puoi aggirare la sentinella.', compass: 'Bussola recuperata · Riportala alla soglia.', signal: 'L’ago punta dentro la frattura. Qualcuno sta correggendo la rotta.', leave: 'Sei tornato al sentiero.', sentry: 'Sentinella disattivata · Il percorso è libero.' };
        notice(messages[event.interaction], 6);
        if (event.completed) showMemory('garden');
      }
      if (event.type === 'enemy-windup' && event.kind === 'beam') notice('LINEA DI SIGILLO · Spostati di lato o riparati dietro una colonna.', 2);
      if (event.type === 'trail-progress') {
        notice(`${event.count} / 3 · ${event.name}`, 4);
        if (event.complete) showMemory('trail');
      }
      if (event.type === 'resonance-ready') showMemory('resonance');
      if (event.type === 'cleared') {
        clearControls(); showMemory('complete');
      }
      if (event.type === 'evolved') {
        auraMat.opacity = .8; player.scale.setScalar(1.34);
        notice(state.role.id === 'ranger' ? 'TIRO DI RITORNO · Schiva all’ultimo istante, poi usa l’abilità per rispondere con due frecce.' : 'PASSO DI RISONANZA · Lo scatto ora colpisce e interrompe. Affronta il Custode.', 7);
      }
      if (event.type === 'defeated') { clearControls(); $('result-text').textContent = defeatMessage(state); result.showModal(); setPause(false); }
    }
  }

  function updateUI() {
    if (!state) return;
    updateArtifactUI();
    const guide = journey(state);
    $('quest-title').textContent = guide.title; $('journey-hint').textContent = guide.hint;
    const trace = activeTrace(state);
    $('follow-trail').hidden = !trace;
    const objective = gardenObjective(state);
    $('world-interact').hidden = !objective;
    if (objective) {
      const distance = Math.hypot(state.x - objective.x, state.z - objective.z);
      $('world-interact').textContent = distance <= 2.2 ? objective.label : `${objective.approach} · ${Math.ceil(distance)} m`;
    }
    $('leave-garden').hidden = state.area !== 'garden' || state.garden.step >= 3;
    $('leave-garden').disabled = Math.hypot(state.x - GARDEN_ENTRY.x, state.z - GARDEN_ENTRY.z) > 2.2;
    $('quest-item').hidden = state.garden.step < 2;
    $('quest-item').textContent = state.garden.step === 4 ? '✓ Segnale riportato' : 'Bussola · con te';
    const traceNear = trace && Math.hypot(state.x - trace.x, state.z - trace.z) <= TRACE_RADIUS;
    $('follow-trail').disabled = Boolean(traceNear && (state.stamina < 30 || state.dashCooldown > 0));
    if (trace) $('follow-trail').textContent = traceNear ? 'Risuona con lo scatto · 30 vigore' : 'Raggiungi la prossima traccia';
    $('objective').textContent = state.garden.step > 0 ? 'La bussola è uno strumento di spedizione. Riporta il segnale: Liora potrà capire se la rotta viene ancora corretta.' : state.trail.complete ? 'La firma Cartiglio non doveva trovarsi qui. Liora ha riconosciuto una strada verso i compagni.' : state.cleared ? 'Il Custode tratteneva la voce di Liora. Una gilda cancellata dalle mappe è la prossima pista.' : state.evolved ? 'Il ricordo di Liora è con te. Il Custode non può più nasconderlo.' : 'Due echi trattengono il frammento di una compagna scomparsa. Il Custode veglia sul sigillo.';
    if (guide.id !== lastGuide) {
      lastGuide = guide.id;
      if (!memory.open) notice(guide.hint, 6);
    }
    $('hp').max = state.maxHp; $('hp').value = state.hp; $('hp-text').textContent = `${Math.ceil(state.hp)} / ${state.maxHp}`;
    $('stamina').value = state.stamina; $('stamina-text').textContent = `${Math.floor(state.stamina)} / 100`;
    const current = selectedEnemy(state, 18);
    const inReach = current && Math.hypot(current.x - state.x, current.z - state.z) <= state.role.basicRange * (state.evolved ? 1.2 : 1);
    $('target-status').textContent = current ? `${current.name} · ${Math.ceil(current.hp)} PV${inReach ? '' : ' · Avvicinati per attaccare'}` : state.area === 'garden' ? gardenObjective(state)?.label || 'Giardino dei nomi' : state.garden.step === 4 ? 'Segnale riportato · il passaggio resta aperto' : trace ? `${trace.name} · segui la traccia luminosa` : state.cleared ? 'Pista conservata · il sentiero ricorda' : 'Tocca un nemico per selezionarlo';
    $('skill').disabled = state.cooldown > 0 || state.status !== 'playing' || state.dodgeRemaining > 0 || state.skillBuffer > 0;
    $('skill').style.setProperty('--cooldown', `${Math.max(0, 1 - state.cooldown / state.role.cooldown) * 100}%`);
    const returnReady = state.evolved && state.role.id === 'ranger' && state.returnShot > 0;
    $('signature-status').hidden = !returnReady;
    $('signature-status').textContent = returnReady ? `TIRO DI RITORNO · ${state.returnShot.toFixed(1)} s · usa l’abilità` : '';
    $('skill').classList.toggle('return-ready', returnReady);
    $('skill-name').textContent = returnReady ? 'Tiro di ritorno' : state.role.skill;
    $('skill').title = returnReady ? 'Tiro di ritorno' : state.role.skill;
    $('skill').setAttribute('aria-label', returnReady ? 'Tiro di ritorno. Usa l’abilità prima dello scadere per scoccare due frecce.' : `${state.role.skill}. Abilità di classe.`);
    $('skill-state').textContent = state.skillBuffer > 0 ? 'IN CODA' : state.cooldown > 0 ? `${state.cooldown.toFixed(1)} s` : 'PRONTA';
    $('dash').disabled = state.stamina < 30 || state.dashCooldown > 0 || state.status !== 'playing';
    $('dash-state').textContent = state.stamina < 30 ? 'POCO VIGORE' : state.dashCooldown > 0 ? `${state.dashCooldown.toFixed(1)} s` : '30 VIGORE';
    $('attack').disabled = state.status !== 'playing';
    $('combo-label').textContent = state.action?.kind === 'basic' ? `COLPO ${state.action.combo} / 3` : 'TIENI PREMUTO';
    $('attack').style.setProperty('--swing', `${state.action?.kind === 'basic' ? state.action.elapsed / state.action.duration * 100 : 0}%`);
    $('region').textContent = `◇ ${state.region}`;
    const boss = state.enemies.find((e) => e.boss); $('boss').hidden = state.area === 'garden' || boss.hp <= 0 || boss.sealed; $('boss-hp').value = boss.hp;
    $('boss-intent').textContent = boss.phase === 'windup' ? `${boss.attackKind === 'nova' ? 'ONDA · ALLONTANATI' : 'FRATTURA · SPOSTATI'} · ${boss.windup.toFixed(1)} s` : boss.phase === 'recovery' || boss.phase === 'stagger' ? `APERTURA · ${boss.recovery.toFixed(1)} s` : 'OSSERVA IL SUO ATTACCO';
    $('boss').classList.toggle('charging', boss.phase === 'windup');
    $('evolve').hidden = state.evolved || !canEvolve(state);
    $('dash').setAttribute('aria-label', state.evolved ? 'Passo di risonanza. Scatta e colpisce i nemici vicini; 30 vigore.' : 'Scatto. Richiede 30 vigore.');
    $('dash').querySelector('strong').textContent = state.evolved ? 'Risonanza' : 'Scatto';
    $('rank').textContent = state.evolved ? 'PRIMA RISONANZA' : 'RANGO INIZIALE';
    for (const enemy of state.enemies) {
      const label = labels.get(enemy.id); if (!label) continue;
      label.querySelector('progress').value = enemy.hp;
      label.querySelector('span').textContent = enemy.sealed ? 'Custode · sigillato' : enemy.name;
      label.classList.toggle('selected', current?.id === enemy.id);
    }
  }

  function primary() { if (active()) { attack(state); consumeEvents(); updateUI(); } }
  function skill() {
    if (!active()) return;
    if (!cast(state)) notice(state.dodgeRemaining > 0 ? 'Termina lo scatto, poi usa l’abilità.' : state.cooldown > 0 ? `Abilità pronta fra ${state.cooldown.toFixed(1)} s` : 'Termina il colpo o scatta per interromperlo', 1.5);
    consumeEvents(); updateUI();
  }
  function movementInput() {
    const x = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
    const y = Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'));
    const yaw = Math.atan2(camera.position.x - focus.x, camera.position.z - focus.z);
    return x || y ? screenMovement(x, y, yaw) : screenMovement(stick.x, stick.y, yaw, .16);
  }
  function dash() {
    if (!active()) return;
    const movement = movementInput(), hasDirection = Math.hypot(movement.x, movement.z) > .01;
    if (!dodge(state, hasDirection ? movement.x : state.facing.x, hasDirection ? movement.z : state.facing.z)) {
      notice(state.stamina < 30 ? 'Servono 30 vigore per scattare' : 'Lo scatto sta recuperando', 1.5);
    } else { target = null; approachId = null; }
    consumeEvents(); updateUI();
  }
  $('attack').addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault(); $('attack').setPointerCapture(event.pointerId); heldAttack = true; primary();
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) $('attack').addEventListener(name, () => { heldAttack = false; });
  $('attack').addEventListener('click', (event) => { if (event.detail === 0) primary(); });
  $('follow-trail').addEventListener('click', () => {
    if (!active()) return; const trace = activeTrace(state); if (!trace) return;
    if (Math.hypot(state.x - trace.x, state.z - trace.z) <= TRACE_RADIUS) dash();
    else { clearControls(); target = { x: trace.x, z: trace.z }; }
    $('world').focus({ preventScroll: true });
  });
  $('world-interact').addEventListener('click', () => {
    if (!active()) return; const objective = gardenObjective(state); if (!objective) return;
    clearControls();
    if (Math.hypot(state.x - objective.x, state.z - objective.z) <= 2.2) { interactGarden(state, objective.id); consumeEvents(); updateUI(); }
    else target = { x: objective.x, z: objective.z };
    $('world').focus({ preventScroll: true });
  });
  $('leave-garden').addEventListener('click', () => { if (active()) { clearControls(); interactGarden(state, 'leave'); consumeEvents(); updateUI(); } });
  $('skill').addEventListener('click', skill); $('dash').addEventListener('click', dash);
  $('evolve').addEventListener('click', () => { if (active()) { evolve(state); consumeEvents(); updateUI(); } });

  function syncEnemyViews() {
    for (const enemy of state.enemies) {
      if (enemyViews.has(enemy.id)) continue;
      const view = art.addEnemy(enemy); view.group.userData.enemyId = enemy.id; enemyViews.set(enemy.id, view);
      {
        const label = document.createElement('div'); label.className = 'enemy-label';
        const name = document.createElement('span'); name.textContent = enemy.sealed ? 'Custode · sigillato' : enemy.name;
        const hp = document.createElement('progress'); hp.max = enemy.maxHp; hp.value = enemy.hp;
        label.append(name, hp); $('world-labels').append(label); labels.set(enemy.id, label);
      }
    }
  }
  function switchArea() {
    art.setArea(state.area); effects.clear();
    focus.set(state.x, 1, state.z - (innerWidth < 700 ? 2 : 3));
    camera.position.copy(focus).add(new THREE.Vector3(innerWidth < 700 ? 1 : 8, innerWidth < 700 ? 14 : 9, innerWidth < 700 ? 20 : 13)); camera.lookAt(focus);
  }

  function beginSession(restoredState = null, replaceSave = false) {
    clearControls(); effects.clear(); audio.stop();
    void audio.setEnabled($('audio-start').checked);
    for (const { group, marker } of enemyViews.values()) {
      scene.remove(group, marker);
      group.traverse((node) => { if (node.isMesh) node.geometry.dispose(); });
      marker.traverse((node) => { if (node.isMesh) { node.geometry.dispose(); node.material.dispose(); } });
    }
    enemyViews.clear(); labels.clear(); $('world-labels').replaceChildren(); floats.length = 0;
    state = restoredState || createSession(selected); lastGuide = null; uiAt = -1; player.userData.setClass(state.role); auraMat.opacity = state.evolved ? .8 : .18;
    player.scale.setScalar(state.evolved ? 1.34 : 1.2); player.position.set(state.x, 0, state.z); player.rotation.y = Math.PI;
    syncEnemyViews(); switchArea();
    for (const id of ['hud', 'actions', 'touch-controls', 'control-hint']) $(id).hidden = false;
    $('role-name').textContent = state.role.name; $('skill-name').textContent = state.role.skill;
    $('skill').setAttribute('aria-label', `${state.role.skill}. Abilità di classe.`); $('skill').title = state.role.skill;
    $('objective').textContent = 'Libera gli echi. Esci dai cerchi di carica e colpisci durante il recupero.';
    if (memory.open) memory.close(); memoryKind = null;
    if (result.open) result.close(); if (selection.open) selection.close();if(artifactMenu.open)artifactMenu.close();pendingAttunement=null;
    setPause(false); notice('Attacca, osserva la carica, scatta fuori dal cerchio.', 5); updateUI();
    if (restoredState) notice('Tappa ripresa. Vita e vigore ripristinati; il combattimento in corso ricomincia.', 6);
    saveProgress(replaceSave);
  }
  $('start').addEventListener('click', () => beginSession(null, true));
  $('restart').addEventListener('click', () => beginSession(saveEnabled && saved.checkpoint ? restoreCheckpoint(saved.checkpoint) : null));
  $('resume-saved').addEventListener('click', () => {
    const previous = saved.checkpoint; saved = checkpointStore.load();
    if (JSON.stringify(previous) !== JSON.stringify(saved.checkpoint)) {
      saveEnabled = Boolean(saved.checkpoint?.autoSave); refreshSaveUI('La tappa è cambiata in un’altra scheda. Controllala prima di riprendere.'); return;
    }
    refreshSaveUI(); const restored = restoreCheckpoint(saved.checkpoint);
    if (restored) { choose(restored.role.id); beginSession(restored); }
  });
  $('change-class').addEventListener('click', () => { result.close(); setPause(true); selection.showModal(); });

  $('world').addEventListener('pointerdown', (event) => {
    if (!active()) return;
    if (event.button === 2) { primary(); return; }
    const bounds = $('world').getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    ray.setFromCamera(pointer, camera);
    const candidates = state.enemies.filter((e) => inArea(state, e) && e.hp > 0 && !e.sealed).map((e) => enemyViews.get(e.id).group);
    const intersects = ray.intersectObjects(candidates, true);
    if (intersects.length) {
      let root = intersects[0].object;
      while (root && !root.userData.enemyId) root = root.parent;
      if (root && setTarget(state, root.userData.enemyId)) {
        const enemy = selectedEnemy(state); approachId = enemy.id; target = null;
        notice(`${enemy.name} · avvicinati per attaccare`, 1.5); updateUI();
      }
    } else if (ray.ray.intersectPlane(plane, hit)) { target = { x: hit.x, z: hit.z }; approachId = null; }
  });
  $('world').addEventListener('contextmenu', (event) => event.preventDefault());
  document.addEventListener('keydown', (event) => {
    if (selection.open || info.open || result.open || memory.open || artifactMenu.open || event.target.matches('input, textarea, select')) return;
    if (event.code === 'Escape') { if (state?.status === 'playing') setPause(!paused); return; }
    if (!active()) return;
    const nonCombatButton = event.target.closest('button:not([data-combat-action])');
    if (event.code === 'Space' && nonCombatButton) return;
    if (nonCombatButton && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyJ', 'KeyQ'].includes(event.code)) $('world').focus({ preventScroll: true });
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    keys.add(event.code);
    if (!event.repeat) {
      if (event.code === 'KeyJ') primary();
      if (event.code === 'KeyQ') skill();
      if (event.code === 'Space') dash();
      if (event.code === 'KeyE') $('evolve').click();
      if (event.code === 'KeyF') { if (!$('follow-trail').hidden) $('follow-trail').click(); else if (!$('world-interact').hidden) $('world-interact').click(); }
    }
  });
  document.addEventListener('keyup', (event) => keys.delete(event.code));
  function updateStick(event) {
    stick = joystickVector(event.clientX, event.clientY, $('joystick').getBoundingClientRect());
    $('joystick-knob').style.transform = `translate(${stick.x * 32}px, ${stick.y * 32}px)`;
    target = null; approachId = null;
  }
  $('joystick').addEventListener('pointerdown', (event) => {
    if (!active() || pointerId !== null) return;
    event.preventDefault(); pointerId = event.pointerId; $('joystick').setPointerCapture(pointerId); updateStick(event);
  });
  $('joystick').addEventListener('pointermove', (event) => { if (event.pointerId === pointerId) updateStick(event); });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('joystick').addEventListener(type, (event) => {
    if (event.pointerId !== pointerId) return; pointerId = null; stick = { x: 0, y: 0 }; $('joystick-knob').style.transform = 'translate(0px, 0px)';
  });
  const codes = { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD' };
  document.querySelectorAll('[data-move]').forEach((button) => {
    const code = codes[button.dataset.move];
    button.addEventListener('pointerdown', (event) => { if (!active()) return; event.preventDefault(); button.setPointerCapture(event.pointerId); keys.add(code); target = null; approachId = null; });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, () => keys.delete(code));
  });

  function resize() { renderer.setSize(innerWidth, innerHeight); pipeline.resize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  function setGraphics(id) {
    graphics = qualitySettings(id, devicePixelRatio);
    renderer.setPixelRatio(graphics.pixelRatio); renderer.shadowMap.enabled = graphics.shadows;
    art.setShadowQuality(graphics.shadows, graphics.shadowSize); pipeline.configure(graphics);
    $('quality-select').value = graphics.id; $('quality-status').textContent = graphics.description;
    resize();
  }
  $('quality-select').addEventListener('change', () => setGraphics($('quality-select').value));
  window.addEventListener('resize', () => { clearControls(); if (innerHeight <= 560) expandQuest(false); setGraphics(graphics.id); });
  setGraphics(graphics.id);
  let then = performance.now();
  const fixedStep = 1 / 60;
  renderer.setAnimationLoop((now) => {
    const delta = Math.min(.2, Math.max(0, (now - then) / 1000)); then = now;
    art.animate(now / 1000, motionReduced());
    moving = false;
    if (active()) {
      accumulator = Math.min(.2, accumulator + delta);
      let steps = 0;
      while (accumulator >= fixedStep && steps++ < 12 && active()) {
        accumulator -= fixedStep;
        tickCooldowns(state, fixedStep);
        const movement = movementInput();
        if (Math.hypot(movement.x, movement.z) > .01) { target = null; approachId = null; }
        else if (approachId) {
          const enemy = state.enemies.find((e) => e.id === approachId && e.hp > 0);
          if (!enemy) approachId = null;
          else {
            const d = Math.hypot(enemy.x - state.x, enemy.z - state.z);
            if (d <= state.role.basicRange * .86) { approachId = null; attack(state); }
            else { movement.x = (enemy.x - state.x) / d; movement.z = (enemy.z - state.z) / d; }
          }
        } else if (target) {
          const dx = target.x - state.x, dz = target.z - state.z, d = Math.hypot(dx, dz);
          if (d < .15) target = null;
          else { const scale = Math.min(1, d / (5 * fixedStep)); movement.x = dx / d * scale; movement.z = dz / d * scale; }
        }
        if (state.dodgeRemaining <= 0) {
          const speed = state.action ? state.action.phase === 'windup' ? 2.4 : 3.6 : 5;
          moving = movePlayer(state, movement.x, movement.z, fixedStep, speed) || moving;
        }
        advanceEnemies(state, fixedStep);
        if ((heldAttack || keys.has('KeyJ')) && !state.action) attack(state);
        consumeEvents();
      }
      state.region = state.area === 'garden' ? 'Giardino dei nomi' : state.x > 24 ? 'Il sentiero delle memorie' : 'Piazza del ritorno';
      if (state.area !== 'garden' && state.x > 24 && !state.explored) { state.explored = true; notice('Hai trovato il sentiero delle memorie.', 3); }
      if (state.time - uiAt > .08) { updateUI(); uiAt = state.time; }
    }
    if (state) {
      player.position.set(state.x, 0, state.z);
      const facing = state.dodgeRemaining > 0 ? state.dodgeDirection : state.facing;
      const angle = Math.atan2(facing.x, facing.z), difference = Math.atan2(Math.sin(angle - player.rotation.y), Math.cos(angle - player.rotation.y));
      if (active()) player.rotation.y += difference * (1 - Math.exp(-delta * 18));
      const action = state.action;
      player.userData.animate(state.time, moving, action ? Math.min(1, action.elapsed / action.duration) : 0, motionReduced(), { action, dodge: state.dodgeRemaining, style: state.role.style, evolved: state.evolved, returnShot: state.returnShot });
      barrier.visible = state.shield > 0; barrier.position.set(state.x, 1.4, state.z);
      const current = selectedEnemy(state, 18); targetRing.visible = Boolean(current && state.status === 'playing');
      if (current) { targetRing.position.set(current.x, .13, current.z); targetRing.scale.setScalar(current.boss ? 1.5 : .9); }
      for (const enemy of state.enemies) {
        const view = enemyViews.get(enemy.id); view.group.visible = inArea(state, enemy) && enemy.hp > 0;
        view.group.position.set(enemy.x, 0, enemy.z); view.group.rotation.y = enemy.facing;
        view.group.userData.animate(state.time, enemy.windup, enemy.phase === 'pursuit', motionReduced(), enemy);
        updateTelegraph(view.marker, enemy); if (!inArea(state, enemy)) view.marker.visible = false;
        const label = labels.get(enemy.id);
        if (label) {
          projected.set(enemy.x, 2.45, enemy.z).project(camera);
          label.hidden = !inArea(state, enemy) || enemy.hp <= 0 || projected.z > 1 || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || Math.hypot(enemy.x - state.x, enemy.z - state.z) > 12;
          label.style.transform = `translate(${(projected.x * .5 + .5) * innerWidth}px, ${(-projected.y * .5 + .5) * innerHeight}px) translate(-50%, -100%)`;
        }
      }
      const narrow = innerWidth < 700;
      offset.set(narrow ? 1 : 8, narrow ? 14 : 9, narrow ? 20 : 13);
      desired.set(state.x, 1, state.z - (narrow ? 2 : 3));
      focus.lerp(desired, motionReduced() ? 1 : 1 - Math.exp(-delta * 3)); camera.position.copy(focus).add(offset); camera.lookAt(focus);
    }
    art.updateGarden(state || { area: 'plaza' }, motionReduced());
    trailView.update(state, state?.time || 0, motionReduced());
    const visualDelta = active() ? delta : 0;
    effects.update(visualDelta, state);
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i]; f.age += visualDelta;
      if (f.age > .75) { f.element.remove(); floats.splice(i, 1); continue; }
      projected.set(f.x, 2 + (motionReduced() ? 0 : f.age * 1.1), f.z).project(camera);
      f.element.style.transform = `translate(${(projected.x * .5 + .5) * innerWidth}px, ${(-projected.y * .5 + .5) * innerHeight}px) translate(-50%, -50%)`;
      f.element.style.opacity = String(Math.min(1, (.75 - f.age) * 4));
    }
    if (now > noticeUntil && $('toast').textContent) $('toast').textContent = '';
    pipeline.render();
  });
}
