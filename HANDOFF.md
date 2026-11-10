# Consegna condivisa

Aggiornamento: 10 novembre 2026, Europe/Rome.
Baseline codice: `ac9039ea91983a9586b01eeab4a60a02b5e88b54`.

## Ultimo ritocco UI e controllo ripresa preparato

Dopo la build 47b9f36, corretto il testo del bersaglio quando nel giardino non
restano nemici: ora indica l'obiettivo del giardino, non la vecchia pista.
Aggiunto al runner rapido checkpoint un caso v2 con bussola e sentinella già
sconfitta, autosalvataggio spento. 88 test passati, incluso il nuovo controllo
di ripresa della sentinella dopo una sconfitta reale nella simulazione.
Questo ritocco di testo richiede build/smoke alla fine della regressione lunga
attualmente in corso sulla build precedente. Non ricompilare dist durante il
runner attivo. Documentata architettura e limiti in REGIONS.md; roadmap e
istruzioni Claude allineate allo stato effettivo della seconda area.

## Giardino: prova dedicata finale passata, regressione in avvio

Sorgenti 47b9f36. 88 test superati, build riuscita (702 kB JS / 187 kB gzip,
warning aperto). Prova nuova area conclusa con exit 0 su desktop 1440×900 e
mobile 390×844, DPR 1/qualità Leggera/tempo normale; layout 844×390 controllato.
Migrazione v1 senza scrittura al caricamento, scrittura v2 all'uso, bussola,
ricarica con oggetto conservato, segnale, ritorno e tre rivisite superati.
Zero errori/richieste esterne; durante le rivisite a caldo, zero chiamate nuove
a WebGL createBuffer osservate. Non è una misura di tutte le risorse GPU o FPS.

Rapporti garden-latest e unit-latest in docs/verification, catture reali in
assets/prototype. Il giardino è geometria locale costruita al primo ingresso
e conservata. Nessuno streaming di file o server multiplayer. La regressione
completa del primo episodio sulla nuova build resta da eseguire; il rapporto
browser-latest precedente non la copre ancora. Nessun deploy, spesa o produzione.

## Checkpoint intermedio — layout corretto e coperture fisiche

Prova dedicata del giardino superata su desktop/mobile a tempo normale dopo la
correzione landscape: azioni spostate sopra il joystick. Tre rivisite a caldo
senza nuovi buffer WebGL osservati (non una misura di tutte le risorse GPU o FPS).
Un errore locale di sovrascrittura CSS è stato intercettato dalla build e corretto
dal checkpoint, senza push di quella versione non compilabile.

Aggiunta successiva: le colonne fermano anche proiettili del giocatore e colpi
fisici diretti, con scintille d'impatto. Gli impulsi/implosioni ad area restano
magici. 88 test passati. L'ultima patch richiede build/prova dedicata finale e
regressione completa, ancora pendenti. Runners test:garden e test:browser
con rapporti atomici; nessuna produzione o spesa.

## Checkpoint corrente — Giardino dei nomi in verifica

Base 47f1140; remoto controllato e allineato. Seconda area locale implementata:
accesso dopo la pista, bussola, segnale e ritorno. Sentinella rettilinea con
coperture calcolate nella simulazione e stessa geometria di avviso; non richiede
uccisione per completare. Tutte le classi mantengono i propri kit. Scene separate,
geometria del giardino creata al primo ingresso e conservata, non streaming.

Salvataggi v2 sulla chiave storica v1: lettura v1 compatibile senza scritture;
nuove tappe/area e sentinella sconfitta conservate. Nessun dato economico o account.
87 test superati, build riuscita (702 kB JS / 187 kB gzip; warning aperto).
Prova browser della nuova area e regressione completa ancora pendenti a questo
checkpoint. I rapporti versionati precedenti non coprono questo nuovo codice.
File garden.js, visuali, combat/runtime/ui, checkpoint e test dedicati.
Nessuna revisione Claude osservata, produzione/deploy o spesa.

## Stato finale del blocco precedente — Ranger e mandato aggiornato

77 test superati e build riuscita (689 kB JS / 183 kB gzip, warning >500 kB
ancora aperto). Prova Ranger dedicata superata su desktop/mobile con clock
controllato; regressione completa a tempo normale superata su desktop 1440×900
e mobile 390×844, landscape e fallback storage inclusi. Zero errori browser e
richieste esterne nei percorsi completi. Exit 0 e hash in browser-latest.json,
sorgenti ce238c0; ranger-latest.json mantiene commit applicativo edd2d59 e hash
del runner dedicato. Le aggiunte artistiche/documentali successive non cambiano
questa build. Le note di prove pendenti sotto sono storia dei checkpoint.

Implementato: Tiro di ritorno del Ranger e miglioramento focus dopo menu.
Preparato: processo richieste giocatori, piano verso il 35–40%, prompt e ruolo
Claude aggiornati, concept/brief Daria e proposta seconda area QUEST_02.md.
Non implementato: modello Daria, seconda area, cooperativa o nuovo backend.
Non dichiarare raggiunto il 35–40% dell'intero progetto. Nessuna revisione di
Claude o prova umana ricevuta; nessun deploy, SQL di produzione o acquisto.

Prossimi passi: tradurre un personaggio in qualità visiva giocabile con catture
confrontabili; verificare comprensione del primo incontro con PLAYTEST_01;
poi implementare seconda area con ripresa coerente. Conservare capacità per le
richieste reali dei giocatori. Non trasformare i brief in feature già disponibili.

## Riferimento artistico e incarico preparato

Tavola originale Daria generata con image_gen, proposta di primo personaggio
Ranger: mantello terracotta, sciarpa salvia, faretra e arco normale/risonante.
PNG in docs/assets, hash e brief di traduzione in CHARACTER_DARIA.md. Nome e
personaggio non approvati; nessun nuovo modello 3D o asset caricato nel gioco.
Proposto a Claude un incarico con catture confrontabili, animazioni e risorse
misurate; nessuna sua accettazione ricevuta. Nessun acquisto esterno.
Aggiunta durante la regressione lunga: non cambia la build sotto verifica.

## Ranger: prova dedicata completata, regressione in avvio

Il runner dedicato è ora passato su desktop 1440×900 e mobile 390×844,
con controllo landscape 844×390. Input tastiera e abilità touch mobile: impatto
schivato → finestra visibile → due frecce → Custode a 171 PV → abilità normale.
Zero errori/richieste esterne. Il clock del browser avanza a piccoli passi per
il tempismo: non è una prova hardware o una misura di FPS. Nessun accesso allo
stato interno; partenza da tappa sintetica. Rapporto ranger-latest.json con hash
runner/build e commit applicativo edd2d59. 77 test e build riusciti.

Correzioni definitive del runner: niente screenshot con clock simulato, attendere
fine scatto prima di usare l'abilità, avvicinamento diverso sui due orientamenti
di camera. I tentativi precedenti non erano esiti passati. Il runner completo
a tempo normale resta da eseguire su questi sorgenti; il rapporto browser-latest
precedente non li copre ancora. Nessuna pubblicazione, produzione o spesa.

## Blocco corrente: crescita e spazio al pubblico

Base bdd9454. Mandato aggiornato: Codex prosegue verso una base più completa
(35–40% come stima da rivalutare), coordina integrazione e prepara incarichi
circoscritti per Claude, con obiezioni e verifiche reciproche. Nessuna risposta
di Claude ancora ricevuta. ROADMAP_40 e PLAYER_FEEDBACK fissano criteri e margine
per richieste reali: nessuna percentuale nuova o feedback inventato.

Ranger Tiro di ritorno implementato: impatto evitato con scatto → 4 secondi per
rispondere con abilità doppia. Otto test nuovi, 77 totali superati; build riuscita
(689 kB JS / 183 kB gzip, warning ancora presente). Specifica RANGER_EVOLUTION.md.
Due tentativi iniziali del runner si sono fermati per errori della prova:
focus rimasto nel menu (Spazio non attiva volutamente lo scatto su quei pulsanti)
e lettura inputValue su un progress. Corretto il runner, aggiunte diagnostiche
e istruzioni sul tempismo. Un tentativo successivo ha saltato la breve indicazione 0,1 s nel rendering
software. Il runner ora usa il tempo del browser avanzato a piccoli passi,
con input reali, senza accesso allo stato interno; la regressione resta a tempo
normale. Emersa anche una frizione UX: movimento/attacco dopo il menu ora
restituiscono il focus al canvas, così Spazio torna a scattare.
Il runner controlla anche l’attesa della fine dello scatto prima di Q e lascia
scorrere il clock del browser durante le catture con il gioco in pausa. Corretto
il messaggio per l’abilità premuta durante lo scatto: attendere la fine, non
suggerire un altro scatto.
La prova aveva eseguito il contrattacco desktop, ma
non è segnata superata finché il runner non termina.
Verifica browser del nuovo comportamento e regressione completa ancora pendenti
al checkpoint. Rapporti versionati precedenti non coprono questo nuovo codice.

## Stato aggiornato della ricostruzione locale

### Salvataggi: verifica finale completata

Sorgenti 2b832e8: 69 test e build riusciti; runner browser concluso con exit 0
su desktop 1440×900 e mobile 390×844, incluso landscape. Ripresa dopo ricarica
alla prima traccia, avanzamento fino alla terza, disattivazione persistita,
cancellazione selettiva, dati corrotti e storage bloccato superati. Nessun
pageerror o richiesta esterna nei percorsi completi. L'assenza di persistenza
è controllata prima dell'opt-in e dopo cancellazione, non durante il salvataggio.
Due richieste ritratto per viewport sono previste perché il percorso ricarica
la pagina. Rapporto e hash in docs/verification/browser-latest.json.

I paragrafi precedenti sotto descrivono checkpoint intermedi: le verifiche
indicate allora come pendenti sono ora concluse. Il testo UI successivo in
ebe0d16 è distinto: prova mirata finale desktop/mobile superata, registrata
separatamente in verification/checkpoint-ui-latest.json. Runner ripetibile
con npm run test:checkpoints; usa fixture sintetica, anche cancellazione annullata. Nessun merge,
deploy o cambiamento a Supabase. Grafica finale, validazione umana, cooperativa,
backend e mondo ampio restano aperti. Prima di aggiungere capitoli, revisione
con Tonino di Liora e trasformazione di classe; protocollo PLAYTEST_01 disponibile.

### Integrazione documentale e prima verifica desktop

Sorgenti del salvataggio pubblicati in 2b832e8. Il runner completo ha superato
il viewport desktop 1440×900, compresi opt-in, ripresa dopo ricarica, preferenza
autosalvataggio e cancellazione selettiva; zero errori/richieste esterne. Mobile
e fallback ancora in esecuzione: non considerarli completati. Rapporto atomico
locale in test-results/browser-report.json, comando avviato con log/exit persistenti.

Aggiornati AGENTS, stato privacy e specifica dell'episodio; aggiunto protocollo
PLAYTEST_01 per le prove umane ancora da effettuare. Corretto il sottotitolo
statico della selezione, che diceva sempre «Progressi non salvati» anche con opt-in.
Questa sola stringa successiva non è nella build attualmente sotto test: richiede
build e smoke finale, senza attribuirle il rapporto browser precedente.

### Checkpoint: salvataggio locale facoltativo (verifica browser pendente)

10 novembre 2026, Codex, base e52d1ca. Implementati opt-in, ripresa da tappa,
preferenza autosalvataggio, cancellazione esplicita e controllo di conflitti fra
schede. Nessun account o chiamata al backend. Cinque campi locali soltanto;
combattimenti ricreati con vita/vigore pieni. Disattivare conserva il progresso;
eliminare rimuove solo la chiave Mythwood. Dettagli in LOCAL_CHECKPOINTS.md.

File checkpoints.js, runtime.js, ui.js, style.css e tests/checkpoints.test.mjs.
69 test superati, build riuscita (687 kB JS / 182 kB gzip, warning dimensione
ancora presente). Runner browser esteso a ricarica/ripresa dopo prima traccia,
preferenza persistita, cancellazione selettiva, dati corrotti e storage bloccato.
Queste nuove verifiche browser sono ancora pendenti a questo checkpoint;
i rapporti versionati precedenti documentano e245bf8, non questa modifica.
Prossimo passo: eseguire il runner, correggere eventuali regressioni e condividere
il rapporto finale. Nessun merge/deploy o revisione ricevuta da Tonino.


### Checkpoint verificato: pista interattiva e ritratto di Liora

10 novembre 2026, Codex. Prosecuzione autonoma sul ramo condiviso, base e732810
(qualità grafica già pubblicata). Nessun incarico sovrapposto osservato,
nessun merge/deploy, spesa o operazione di produzione.

Il sentiero ora ospita tre segni ordinati, visibili dopo il Custode e attivabili
con lo scatto evoluto da vicino. Percorso illuminato progressivamente e nuova
pista Cartiglio; conclusione unica, nessuna ricompensa economica o persistenza.
Pulsante/F per raggiungere il segno col normale movimento; da vicino lo stesso
pulsante può far risuonare il segno spendendo vigore. Il movimento manuale o la
pausa interrompono la navigazione. Non è una nuova regione in streaming.

File: trail.js, visuals/memory-trail.js, combat.js, journey.js, runtime.js, ui.js,
style.css, mappatura audio e test trail/journey/browser. Specifiche e limiti
in MEMORY_TRAIL.md; aggiornata la distinzione fra storia proposta e prototipo.

Verifiche finali recuperabili: 60 test superati, zero fallimenti; build circa
680 kB JS / 180 kB gzip, warning >500 kB presente. Browser finale superato
su desktop 1440×900 e mobile 390×844 a 2×, layout landscape 844×390. Percorso
completo: echi, memoria, risveglio, Frattura/Onda, vittoria, tre tracce, nuova
scena Cartiglio, sconfitta e riprova. Audio, tre qualità grafiche, caricamento
ritratto su richiesta, focus titolo e Chiudi dopo scroll verificati. Fallback
UI del ritratto simulato sul viewport mobile, non un test di guasti di rete.

Rapporti versionati in docs/verification/: browser-latest.json con hash della
build/runner/ritratto e commit sorgente e245bf8; unit-latest.json, audio-latest.json (17 cue native ricontrollate) e buffer
reali delle tre modalità. Nuove catture in docs/assets/prototype/. Il processo precedente
non era recuperabile dopo la ripresa: il runner è stato rieseguito e ora scrive
esiti atomici su file. Exit code finale 0; nessun risultato dedotto dagli screenshot.
Non dichiarare validazione con persone, FPS o collaudo Safari/iPhone fisico.

Aggiunta successiva nella stessa consegna: ritratto originale generato con
image_gen, caricato soltanto alla prima memoria, con focus sul titolo e
fallback al testo. PNG circa 2,4 MB: peso non ancora ottimizzato, richiesta
assente nella selezione iniziale. Non è un modello 3D. Provenienza e hash in
public/art/README.md, limiti in LIORA_PORTRAIT.md. Barra Chiudi del pannello
informazioni resa persistente allo scroll. Nessun asset acquistato o video social.

Checkpoint richiesto dal proprietario: commit/push periodici prima di verifiche
lunghe, con stato reale in questi file. Aggiunto al runner un rapporto JSON
atomico con esito per viewport e hash della build/ritratto/runner, per evitare
che una ripresa perda l’unica evidenza del risultato. Verifica finale ora completata e rapporti condivisi. Prossimi passi: revisione
di leggibilità e motivazioni di Liora con Tonino, ottimizzazione del peso del
ritratto e prova su dispositivi reali; poi valutare la seconda area. Nessun deploy.

### Intervento precedente: qualità grafica e controlli alla rotazione

10 novembre 2026, Codex. Prosecuzione autonoma richiesta dal proprietario.
Base 96a6466: audio, ricerca e feedback di sconfitta già pubblicati sul ramo
condiviso. Checkout pulito prima dell’intervento; nessun incarico sovrapposto
osservato. Nessun merge/deploy, spesa o operazione su produzione.

Implementate Leggera/Bilanciata/Alta in Comandi e audio. Limiti di pixel ratio,
mappe d’ombra e bloom; percorso diretto in Leggera. Segnali del combattimento e
logica preservati. Riapplicazione al resize con azzeramento dei comandi trattenuti.
File graphics-quality.js, environment.js, runtime.js, ui.js, style.css;
test di profili e runner browser con controllo dei buffer reali, mobile a 2×.
Specifiche e limiti in docs/GRAPHICS_QUALITY.md.

Verifiche: 55 test superati, build circa 673 kB JS / 178 kB gzip; warning >500 kB
presente. Prova browser finale superata su desktop 1440×900 e mobile 390×844 (dispositivo
simulato a 2×), con layout landscape 844×390. Controllati i buffer delle tre
modalità e completato il percorso con audio, Frattura/Onda, vittoria, sconfitta
e riprova; il mobile percorre la prova in Leggera. Nessun errore JS, richiesta
esterna o persistenza osservati. Rapporti in test-results/*-graphics.json. Non dichiarare FPS o prestazioni
iPhone sulla base del rapporto pixel. Le preferenze restano in memoria locale
alla sessione, senza persistenza o telemetria.

### Intervento precedente: audio originale, ricerca e sconfitta leggibile

10 novembre 2026, Codex. Mandato continuativo del proprietario: proseguire in
autonomia e mantenere il ramo condiviso. Partenza 058e7e5, checkout pulito;
nessun incarico di un altro agente osservato. Push del ramo autorizzato,
nessun merge/deploy, SQL online, acquisto o pubblicazione social.

Implementati 17 cue procedurali originali, opt-in, volume 0–100 (iniziale 35),
pausa/mute/cancellazione, fallback senza audio e limite di voci. Creazione su
gesto utente; nessun microfono, asset sonoro scaricato o nuova dipendenza.
File src/audio/, runtime.js, ui.js e style.css; AUDIO.md descrive limiti e prove.
Aggiunto riepilogo della causa di sconfitta (defeat.js e metadati in combat.js),
con suggerimento relativo all’attacco che ha colpito e reset al nuovo tentativo.

Verifiche: 53 test della logica superati; harness Web Audio nativo superato su
17 cue, campioni finiti, volume zero e stop silenziosi, cleanup reale. La prova browser finale passa su desktop 1440×900 e mobile 390×844, con layout
landscape 844×390: opt-in/pausa/mute/volume, Frattura/Onda, vittoria, riepilogo
sconfitta e riprova. Nessun errore JS, richiesta esterna o dato persistente
osservato nei controlli. Build corrente circa
671 kB JS / 177 kB gzip, warning chunk >500 kB aperto. Nessuna prova hardware
Safari/iPhone o ascolto valutato da giocatori. CI audio aggiunta; esito remoto
non osservato.

Ricerca: lette le descrizioni ufficiali Steam di Hades, Hyper Light Drifter e
CrossCode. Fonti e brevi estratti in research/; analisi/ipotesi in RPG_RESEARCH.md.
Non sono demo giocate né misure di engagement. STORY_BIBLE.md propone carattere
di Liora e tre frammenti: solo il primo è implementato. Materiale per obiezioni
di Tonino, non trama interamente approvata o contenuto già sviluppato.

Consegna versionata nel ramo mythwood/collaboration-base; la storia Git
identifica il commit corrente. Nessun merge o deploy. Fonti, prove sonore e
ricerca sono disponibili nei percorsi documentati; la bozza WAV non è
un asset sonoro definitivo o materiale promozionale.

### Intervento precedente: pubblicazione della base condivisa

10 novembre 2026, Codex. Nuovo mandato esplicito del proprietario: caricare
codice, documenti e tutte le idee nella repository condivisa e proseguire
in autonomia con valutazioni e miglioramenti motivati.

Destinazione: ramo mythwood/collaboration-base in nocciolinatanaai/Bosco,
separato da main, verificata ancora sul commit ac9039e. Preparati START_HERE,
IDEAS e PRODUCT_REVIEW, collegati da README e prompt di rientro. Catture reali
del prototipo in docs/assets/prototype, separate dal concept. Il vecchio kit
social resta ritirato; anche lo script di cattura ora si arresta prima di avviare
un browser. Aggiunto workflow GitHub per test/build, senza deploy.

Controllo preliminare di 63 file testuali prima delle nuove aggiunte: nessuna
corrispondenza ai pattern di chiavi private, token provider/GitHub/AWS o JWT.
Non è una certificazione di assenza di segreti. node_modules, dist, cache,
.env, registrazioni e test-results sono esclusi da Git; nessun video ritirato
viene caricato. Il pacchetto della precedente consegna resta storico.

Caricamento confermato: commit base bdfd5f90202c4e62740e27ba9b40cccad43dd97d
pubblicato su origin/mythwood/collaboration-base; riferimento remoto verificato
con git ls-remote. main resta ac9039ea91983a9586b01eeab4a60a02b5e88b54.
Questo aggiornamento di consegna è un commit documentale successivo alla base.

Verifica locale ripetuta: 45 test superati, build riuscita con lo stesso bundle
applicativo dell’ultima prova browser; warning >500 kB presente. Blocco della
vecchia cattura social e struttura YAML del workflow verificati. Controllo finale
su 68 file testuali nello staging: nessun pattern sospetto fra quelli cercati.
CI remota non osservata: CLI GitHub non autenticato/API rifiutata, pur con
trasporto Git funzionante. Non dedurre da questo né successo né fallimento CI.

Nessun merge/deploy, SQL online, spesa o messaggio social. START_HERE invita
Tonino a leggere e rispondere in TONINO_REVIEW.md; nessuna risposta ricevuta.

### Intervento precedente: due attacchi del Custode e base di revisione

10 novembre 2026, Codex. Mandato: proseguire e preparare una base per il rientro
previsto di Claude. Stato iniziale: modifiche locali dopo a395223 mantenute.
Nessun nuovo commit, push, deploy, SQL online, acquisto o pubblicazione social.

Implementate Frattura e Onda del sigillo: centro mirato al giocatore oppure al
Custode, preparazioni/raggi/danni/recuperi distinti e alternanza deterministica.
Cerchi unitari scalati al raggio reale; Onda ha doppio contorno, posa a due braccia,
nome e istruzione HUD. Scatto evoluto può interrompere entrambe da vicino.
Specifiche in docs/GUARDIAN.md. File: enemy-attacks.js, combat.js, telegraph.js,
environment.js, actors.js, runtime.js e combat-effects.js; guardian.test.mjs e
runner browser. Nessun cambiamento al sigillo o alla sequenza dell’episodio.

Verifiche: 45 test superati; build riuscita, circa 664 kB JS minificati / 174 kB
gzip. Warning chunk >500 kB aperto. Browser finale superato: desktop 1440×900,
mobile 390×844 e disposizione landscape 844×390. Su entrambe le dimensioni
verificate sequenza narrativa, Frattura, Onda e vittoria sul Custode con Ranger,
oltre a controlli/pausa; nessun errore JS, richiesta esterna o dato persistente
osservato. Non è un collaudo del bilanciamento o di hardware iPhone.

Pacchetto aggiornato: /workspace/artifacts/mythwood-guardian-review/ contiene
mythwood-guardian-handoff.zip (sorgenti, test e file comuni), build, manifest
con hash e catture delle due mosse. Il pacchetto dell’episodio precedente resta
una consegna storica; usare questa per la revisione del Custode.

Preparato docs/CLAUDE_REVIEW.md: obiezioni richieste su storia, trasformazione,
boss, classi, grafica e inventario legacy. Tonino dovrebbe rispondere in
TONINO_REVIEW.md prima di incarichi sovrapposti. Il documento è una richiesta,
non una revisione ricevuta; non esiste collegamento automatico fra le chat.
Aggiornati AGENTS, design, backlog, collaborazione, episodio e prompt di rientro.

### Intervento precedente: guida, ricordo e prima evoluzione giocabile

10 novembre 2026, Codex. Mandato: proseguire i prossimi step e aggiornare i file
comuni. Checkout a partire dal commit a395223 con modifiche locali preesistenti
preservate; nessun nuovo commit, push, deploy, SQL di produzione o spesa.

Implementato: guida per movimento/attacco/schivata/apertura basata sulle azioni,
Custode inizialmente sigillato e immune, ricordo di Liora dopo i due echi,
risveglio unico e scatto con impulso offensivo al punto di partenza; subito dopo
il Custode diventa attivo. Breve conclusione narrativa alla sua sconfitta. Trama
proposta, non canone approvato. Specifiche in docs/EPISODE_01.md. HUD aggiornato
con indicazione di portata: nome visibile non significa attacco già in raggio.

File: src/journey.js, combat.js, game.js, runtime.js, ui.js, style.css e
visuals/combat-effects.js; test game/journey e runner browser. Aggiornati AGENTS,
README, GAME_DESIGN, BACKLOG, COLLABORATION, COMBAT_UX e prompt di rientro Claude.
Verifiche della logica: 39 test superati. Build riuscita, circa 663 kB JS
minificati / 174 kB gzip; warning chunk >500 kB presente. Browser finale
superato: desktop 1440×900 e mobile 390×844, disposizione landscape 844×390.
Percorso reale con Ranger fino alla vittoria sul Custode e chiusura della scena,
oltre a controlli touch, pausa, assenza di richieste esterne e persistenza.
Nessun errore JS osservato. Non è una prova di bilanciamento delle sei classi
o di fluidità su hardware iPhone.

Catture e build in /workspace/artifacts/mythwood-episode-01/; pacchetto sorgente
mythwood-episode-handoff.zip include i file comuni aggiornati, codice e test.
La prima prova della conclusione è scaduta perché il percorso automatico si
fermava fuori portata: runner corretto e HUD reso esplicito. Nessun valore di
salute/danno del Custode è stato cambiato per ottenere la vittoria del test.

Prossimo passo: diversificare gli attacchi del Custode e validare comprensione
e uso dello scatto con persone. Mancano audio, resa artistica finale, mondo
vasto, backend e cooperazione. Nessuno scambio diretto con Tonino ricevuto;
file locali aggiornati non implicano sincronizzazione con il suo checkout.

### Intervento precedente: combattimento, animazioni e UX

Mandato del proprietario: gameplay, animazioni dei combattimenti, comandi e UX.
Codex ha lavorato da solo nel checkout esistente, dopo il commit locale a395223;
le modifiche di codice preesistenti sono state mantenute. Nessun contatto con
Tonino simulato, nessun acquisto, commit aggiuntivo, push, deploy o operazione SQL.

Regole in src/combat.js e roles.js; input in controls.js; DOM in ui.js e runtime
in runtime.js. Attacco base con combo a tre colpi, preparazione/impatto/recupero,
abilità separate e accodabili durante il colpo base, proiettili con viaggio,
scatto con vigore e invulnerabilità limitata. Nemici con mira fissata alla carica,
cerchio del raggio effettivo, recupero e interruzione. Pose articolate per lama,
doppie lame, scudo, arco e magia; effetti temporanei limitati e ripuliti.

Joystick analogico con cattura, comandi simultanei a due dita, alternativa con
frecce, movimento rispetto alla camera, pausa automatica e azzeramento dei
comandi su interruzioni. Vita/vigore, bersaglio, cooldown numerici e fasi boss;
missione comprimibile, impostazione movimento ridotto, sconfitta/riprova.
Corretto un problema osservato nei test: pannelli informativi consecutivi
potevano preservare erroneamente la pausa. Corrette etichette che debordavano
dai pulsanti in landscape. Dettagli, tempi e limiti in docs/COMBAT_UX.md.

Verifiche: npm test, 34 test superati, zero fallimenti. Build riuscita; chunk
JS circa 659 kB minificati / 172 kB gzip, warning oltre 500 kB ancora presente.
Browser finale superato: desktop 1440×900, mobile 390×844 con due dita e
landscape 844×390. Nessun errore JS, richiesta esterna o dato persistente nei
controlli. Catture in test-results/ e copia con ZIP build e hash in
/workspace/artifacts/mythwood-combat-study/.
Chromium usa rendering software: nessuna misura di fluidità o prova Safari su
iPhone fisico, nessun test umano di divertimento/bilanciamento.

La scena conserva lo studio visivo precedente: arcate, vegetazione, portale,
materiali originali procedurali e illuminazione/bloom. La resa è ancora distante
dal concept; queste pose non sono animazioni artistiche definitive. Kit social
precedente ritirato, marcato DO NOT PUBLISH: non riutilizzarlo. Nessun nuovo reel.
Asset ambientCG non scaricato: dominio acg-download.struffelproductions.com
ancora non abilitato nell’attuale policy osservata. Mappe correnti procedurali.

Il checkout avvia ora un prototipo Vite/Three.js da src/, non il vecchio
caricatore Supabase. Quel caricatore è conservato come testo in legacy/.
Sei classi, movimento desktop/touch, abilità, attacchi anticipati, tre nemici,
pausa e primo risveglio. Nessun multiplayer, grande mondo in streaming, backend,
account, persistenza, telemetria o pagamento. Geometrie segnaposto: non è la
qualità visiva del mockup. Nessuna modifica al servizio online.

La suite npm test include regole del prototipo e PostgreSQL WASM con pgcrypto.
Riprodotto il bypass NULL del login originale; proposta SQL locale testata in
database/proposals/, non eseguita in produzione. **Ritirato PAY-01**: la diagnosi
FOUND era errata e i test del codice acquisti originale la smentiscono.

Nuovi documenti: SECURITY.md, docs/EU_READINESS.md e docs/PEER_REVIEW.md.
Aggiornamento rete: raggiunte fonti UE/Garante, AI Act consolidato al 27 luglio
2026 e direttiva consumatori consolidata al 27 settembre 2026; lettura mirata
registrata in EU_READINESS.md e docs/research/. Applicabilità e attuazione italiana
restano da verificare: nessuna attestazione di conformità. Domande di revisione
preparate, nessuna risposta di Tonino ricevuta.
Concept approvato conservato in docs/assets/, distinto dalle catture reali.

Ultima consegna: docs/CLAUDE_RESTART_PROMPT.md contiene il prompt di rientro;
docs/SOCIAL_CONNECTIONS.md descrive il riuso delle API Meta/TikTok già usate da
Tonino secondo il proprietario. App, account esatti, scope, audit, refresh e
scheduler restano da recuperare. Le regole TikTok lette limitano Direct Post
non approvato e utility interne: non promettere pubblicazione pubblica automatica
senza verificare l'integrazione effettiva. Nessun token social presente qui.

Storico, RITIRATO: primo kit editoriale in social/launch-kit/ e una bozza video
verticale locale di 16,2 s in /workspace/artifacts/mythwood-social-kit/.
Concept etichettato e cattura periodica reale del prototipo, senza musica terza.
Non pubblicare né rigenerare questo kit. Nessun post o commento inviato.

Tutte le modifiche successive ad a395223 sono locali, non committate né inviate.
Avvio e verifiche aggiornati in README.md. Non usare le istruzioni storiche di
hosting statico per eseguire i moduli npm non compilati.

Esito storico della prima ricostruzione (superato dalle verifiche sopra): npm test riportava 20 test superati e zero fallimenti;
browser desktop 1440×900 e mobile 390×844 superati con Chromium software,
incluse assenza di richieste remote/persistenza e conservazione della pausa.
npm run build riuscito; avviso chunk >500 kB, ancora da ottimizzare. npm audit
riporta zero vulnerabilità note nelle dipendenze al momento della verifica.
Non sono prove di prestazioni hardware reali né certificazioni di sicurezza.

## Mandato corrente

Il proprietario ha autorizzato documenti di collaborazione e preparazione del
progetto e, successivamente, il loro commit locale. Ha poi richiesto la riscrittura
del gioco e dello store come Mythwood. Preparazione locale autorizzata; nessun
mandato operativo per SQL di produzione, push, deploy o spese. Aggiornamento:
autorizzati post e commenti organici autonomi sui canali Instagram/TikTok del
progetto, senza approvazione per contenuto; account dichiarati professionali.
Nessuno strumento di pubblicazione collegato e nessuna pubblicazione effettuata.

Il proprietario vuole affiancare Codex a Tonino per dare al gioco un'identità
precisa e una qualità visiva e narrativa migliore. Ha approvato la preparazione
del percorso; la proposta creativa non equivale all'approvazione di ogni dettaglio.

## Contesto che non deve andare perso

- Esperimento originale: agente autonomo, 50 euro e 50 giorni, promozione social.
- Stima riferita: circa 20 euro spesi e circa 35 giorni residui; non è una contabilità verificata.
- L'ambientazione può cambiare; Solo Leveling è un riferimento esplicito.
- Il pubblico deve partecipare durante lo sviluppo, non soltanto al termine.
- Il proprietario riferisce assenza di follower portati da Tonino e qualità
  insoddisfacente di video, grafica e storia. Dati e cause non ancora verificati.
- Claude aggiornava direttamente Supabase. Non è nota una copia completa versionata.
- Non esiste un collegamento diretto tra questa chat e la sessione Claude.
- Il limite settimanale Claude ha impedito l'accesso precedente; stato attuale ignoto.
- Si può sviluppare mentre Claude è bloccato, ma non simulare uno scambio con
  Tonino: domande e consegne vanno conservate finché potrà rispondere.
- Anteprima iPhone: nessun URL HTTPS pubblico del nuovo prototipo è stato creato.
  Test viewport Chromium mobile non equivalgono a Safari/iPhone reali.

## Materiale preparato

- `AGENTS.md`: regole per gli agenti.
- `GAME_DESIGN.md`: proposta creativa, storyboard e decisioni aperte.
- `docs/TECHNICAL_BASELINE.md`: architettura e risultati della revisione.
- `docs/BACKLOG.md`: lavoro ordinato con criteri di accettazione.
- `docs/COLLABORATION.md`: consegne, decisioni e messaggio per Tonino.
- `docs/RECOVERY.md`: recupero del sorgente e percorso verso staging riproducibile.
- `docs/SOCIAL_GAMEPLAY.md`: scene da catturare, qualità, metriche e piano social.
- `docs/REWRITE_AND_STORE.md`: sostituzione del gioco e allineamento dello store.

I documenti vengono inclusi nel commit locale di questa consegna; non è stato
autorizzato un push a GitHub. Un altro agente non può vederli dal proprio checkout
finché il proprietario non li trasferisce o ne autorizza la pubblicazione nel
repository. Il riferimento al commit sarà comunicato nella consegna in chat.

## Verifiche precedenti

Checkout statico servito correttamente; sintassi JS del caricatore e programma
remoto verificata. Prove browser con risposte simulate: avvio con fallback 2D
riuscito; pagina privacy coperta dalla splash all'apertura. Nessun collaudo
completo del gameplay, login, acquisti o progressione reale.

Analizzate esportazioni: 210 funzioni public e relativi permessi; 65 tabelle,
467 colonne, 113 vincoli, 8 viste e una policy nei due schemi esaminati.
Nessun test su account reali o mutazione di dati di produzione è stato eseguito.

## Prossima consegna consigliata

Ultime decisioni: Mythwood è il nome confermato per gioco, sito e store. Il
proprietario richiede sostituzione completa del vecchio codice e conferma che
non ci sono acquisti reali pregressi; non dedurre per questo assenza di giocatori,
dati o automazioni. Evoluzioni centrali: aspetto, abilità e significato narrativo.
Nuovo catalogo, prezzi e provider non ancora decisi. Nessun prodotto esterno
modificato. Il client locale è stato sostituito nella successiva ricostruzione
descritta all'inizio del documento; non il client online.

Aggiornamento del proprietario dopo il primo commit: gilde e collaborazione
sono centrali, con missioni personali, contributi in orari diversi e missioni
simultanee che richiedono tutti. Più personaggi con abilità differenti, ispirati
alla fantasia di crescita di Solo Leveling senza copiarlo. Aggiornati design,
registro decisioni e backlog; queste integrazioni sono locali e non ancora
committate. Aggiornamento successivo: il proprietario indica Assassini, Maghi,
Ranger, Guaritori, Tank e Combattenti come riferimenti, oltre a mostri e gilde rivali. Superata la
proposta di tre archetipi. Personaggi originali, abilità, squadra 2–4, tipo di
rivalità e storia degli echi restano proposte. Il proprietario ha poi approvato
la direzione visiva del mockup e richiesto un mondo vasto esplorabile e gameplay
accattivante per i social. Registrati criteri per scena giocabile, streaming delle
aree e catture reali; nessun gameplay nuovo è stato implementato o pubblicato.
Le modifiche successive al commit a395223 restano locali. Chiarire se
"tutti" significhi squadra iscritta oppure intera gilda.

Tonino: leggere questi documenti; descrivere come aggiornava Supabase e quali
attività/processi sono già in esecuzione; fornire sorgente di `riscatta`, inventario
dei componenti e decisioni storiche. Non eseguire correzioni o deploy implicitamente.

Codex: completare il recupero autorizzato, confrontare riferimenti con fonti,
preparare prove creative e piano delle correzioni in staging.

Il lavoro creativo può proseguire con mock e dati sintetici mentre si completa
la ricostruzione del backend. Non promuovere nuovi accessi al gioco prima di
aver affrontato il difetto del login.

## Aggiornamento a ogni passaggio

Registrare: autore, task, commit di partenza, file toccati, risultati effettivi,
verifiche con ambiente e dati usati, problemi aperti, autorizzazioni ricevute e
prossimo incarico. Non sostituire questo contesto con un generico "tutto pronto".
