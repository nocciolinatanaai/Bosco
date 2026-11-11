# Prompt per Claude / Tonino — aggiornamento personaggi

Puoi incollare il testo seguente nella sessione Claude che accede al repository.
Il documento concede il mandato di sviluppo; non modifica autenticazione o
permessi tecnici dell'ambiente Claude. Nessun collegamento automatico alle chat.

---

Riprendiamo MYTHWOOD nel repository nocciolinatanaai/Bosco. Il proprietario ti
autorizza esplicitamente a leggere, creare e modificare i file del progetto per
questo incarico, eseguire verifiche locali, committare e fare push sul tuo ramo
di lavoro. Sei sviluppatore attivo insieme a Codex, non soltanto revisore.

## Allineamento senza perdita di lavoro

Esegui git status e conserva eventuali cambiamenti locali. Poi git fetch origin.
Leggi origin/mythwood/collaboration-base aggiornato: contiene almeno 39f4ad1
(asset 3D e verifiche), più il commit che aggiunge questo prompt. Verifica git log;
non partire da main o dal ramo Pages. Crea tonino/character-art-pass-01 dalla
punta aggiornata di origin/mythwood/collaboration-base solo con checkout pulito;
se esiste già, ispezionalo prima. Non usare reset --hard o sovrascritture.

Non lavorare direttamente sul ramo condiviso. Consegna commit e PR verso
mythwood/collaboration-base; se il push non è disponibile, consegna un bundle
verificabile con base e SHA reali. Il precedente 3222cd1 / tonino/rintocco non è
stato ricevuto da Codex: resta separato, non dichiararlo integrato e non rifarlo
alla cieca. Recuperalo solo se presente nel tuo ambiente.

## Cosa leggere e cosa esiste davvero

Leggi AGENTS.md, HANDOFF.md, docs/START_HERE.md, docs/COLLABORATION.md,
docs/art/CHARACTER_SHEETS_01.md, docs/art/CHARACTER_MODELS_01.md,
docs/CHARACTER_DARIA.md, docs/ENEMY_ART_DIRECTION.md e docs/PEER_REVIEW.md.
Le sezioni recenti prevalgono sui vecchi blocchi storici contraddittori.

Il proprietario approva la direzione delle sei tavole in
docs/assets/character-sheets/, ma chiede di realizzare i personaggi nel gioco.
Cinque nuovi GLB con scheletro sono in public/models/characters/; Ranger conserva
public/models/ranger/daria-refined.glb. Sono basi CC0 System G6 più accessori,
non riproduzioni fedeli dei concept. Restano volti generici, vestiti che si
compenetrano, capelli e armi provvisori. Non chiamarli personaggi finiti.

Codex ha verificato 135 test, build, 30 pose nello studio e regressione episodio
completa desktop/mobile. Evidenze in docs/assets/character-models-first-pass/.
Questi risultati non approvano la grafica né misurano prestazioni su iPhone.
Il nuovo Custode è ancora una proposta procedurale; vecchio Reel respinto e
ritirato dai sorgenti. Il ramo Pages non è aggiornato con questi lavori.

## Incarico: prima un personaggio convincente

Parti da Daria come riferimento completo. Apri il modello e il concept reali,
confronta fronte/profilo/volto e consegna modifiche al modello giocabile:
volto adulto e silhouette, capelli/treccia, mantello terracotta, sciarpa salvia,
giacca petrolio, abiti senza compenetrazioni, presa dell'arco e preparazione/
rilascio coerenti. Non limitarti a cambiare palette o a produrre un'altra tavola.
Preserva anatomia/scheletro utilizzabili e dichiara ciò che non riesci a ottenere.

Prima di ampliare le altre classi, correggi eventuali regressioni tecniche
dimostrate del loader; testa cambi rapidi classe e caricamento fallito. Verifica
anche pausa, riavvio e ripetizione delle azioni. Non cambiare danni, collisioni
o tempistiche per nascondere un difetto visivo.

Puoi modificare src/visuals/ranger*.js, src/visuals/class-characters.js,
src/visuals/actors.js per l'integrazione, scripts/prepare-daria-refined.py,
scripts/prepare-class-characters.py, asset nelle due cartelle personaggi,
studio/test dedicati e documentazione pertinente. Questa area è ora assegnata
a te; Codex non la modifica finché non consegni o rilasci l'incarico.
Mantieni Rintocco in un incarico/ramo separato. Non toccare i suoi file per
questo lavoro artistico. Non eseguire incarichi paralleli sugli stessi file.

Usa le skill locali mage-character-gen, agensi-gamedev-characters e
procedural-character-assets quando pertinenti; animation/materials/asset-pipeline
se installate. Skill non significa API attiva: Mage non ha credenziali, gli
standard Agensi non sono verificati. Non inventare accessi o consumare crediti.
La fonte Blender non è inclusa: recupera l'archivio CC0 documentato in
public/models/ranger/SOURCE.json, verifica SHA e usa la licenza esistente.

## Verifica e consegna

Esegui npm ci se necessario, npm test e npm run build. Per modello/pose esegui
node scripts/class-character-review.mjs e la verifica Ranger pertinente
(MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium node scripts/ranger-check.mjs in Cloud;
altrove configura Chromium disponibile). Verifica la build con CSP reale.
Se tocchi integrazione/classe o comportamento visivo condiviso, esegui anche
la regressione episodio con scripts/browser-check.mjs dopo il build.

Consegna prima/dopo reali alla stessa luce/camera, fronte/profilo/volto e movimento,
file sorgenti o generatore riproducibile, licenza, hash, byte, triangoli e limiti.
Aggiorna HANDOFF, COLLABORATION e PEER_REVIEW con prove e difetti ancora presenti.
Non considerare una preview statica prova del combattimento o di fluidità mobile.

Nessun merge main, deploy Pages, pubblicazione social, spesa, nuovo account o
scrittura Supabase in questo incarico. La tua responsabilità operativa per
pubblicazioni/social resta distinta: il materiale attuale non è approvato per
la promozione. Non modificare permessi GitHub o disabilitare sandbox per aggirare
un accesso in sola lettura; segnala il blocco preciso al proprietario.
