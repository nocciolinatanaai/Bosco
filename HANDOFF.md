# Mythwood — consegna corrente

Aggiornato da Codex il 10 novembre 2026, fuso Europe/Rome.
Repository nocciolinatanaai/Bosco, ramo mythwood/collaboration-base.
Ultimo commit applicativo: **864f97f**. Verificare sempre git log/status e remoto
prima di continuare. Main e servizio precedente restano separati.

## Ultimo blocco concluso — Ranger e comunicazione della ripartenza

94 test superati, build riuscita (710 kB JS / 190 kB gzip, warning aperto).
Primo corpo Ranger originale integrato, distinto dagli altri cinque ruoli:
giacca, sciarpa/mantello, treccia, faretra, taccuino, arco con corda, freccia
incoccata e risonanza. 8.524 triangoli di mesh totali, 44 mesh e 14 materiali.
Resa semplificata: volto, mani, pieghe e contatti della posa restano da rifinire.
Non equivale alla tavola illustrata o a una scultura finale approvata.

Studio di authoring a quattro pose e regressione integrata superati, così come
il Giardino con nuovo modello su desktop/mobile. Nessun errore/richiesta esterna
nei percorsi completi. Zero nuove createBuffer durante tre rivisite a caldo:
non misura tutte le risorse GPU o FPS. Nessuna prova umana o hardware reale.

CONTENT_SCOPE.md propone per il primo arco sei personaggi, tre NPC, otto tipi
di nemico e dieci missioni. Solo i sei ruoli sono già concordati; gli altri
numeri sono obiettivi adattabili, non contenuti completati. Caption con cinque
hashtag in social/RESTART_CAPTION.md per pubblicazione manuale del proprietario.
TRAILER_BRIEF.md contiene solo appunti per il successivo incarico: nessun video
prodotto o pubblicato. Vecchio kit ritirato. Nessun acquisto/deploy/produzione.

## Mandato e collaborazione

Il proprietario autorizza sviluppo autonomo, commit/push periodici sul ramo
condiviso e aggiornamento dei documenti. Codex coordina direzione, architettura e
integrazione; Claude può implementare incarichi circoscritti, proporre alternative
e revisionare criticamente. Non sono stati ricevuti TONINO_REVIEW o incarichi
accettati da Claude; nessun collegamento automatico fra le chat.

Obiettivo: RPG browser per smartphone e PC, con trama, grafica, combattimento e
crescita convincenti, mondo vasto e gilde (missioni personali, contributi asincroni
e spedizioni simultanee). Sei classi di riferimento, senza obbligo di averle
tutte in squadra. Concept approvato; ispirazione a Solo Leveling senza copiarlo.

Il 35–40% è un traguardo qualitativo richiesto, **non dichiarato raggiunto**.
Lasciare capacità alle richieste reali del pubblico: PLAYER_FEEDBACK.md. Nessun
feedback umano raccolto sulla nuova build. Le stime storiche di tempo/budget
(35 giorni/30 euro residui) vanno riconciliate, non sono contabilità aggiornata.

Merge su main, deploy, SQL di produzione, credenziali e spese non fanno parte di
questo blocco. Post/commenti organici sui canali del progetto autorizzati, ma
account e strumenti/accessi supportati vanno prima identificati; Codex non ha
un'integrazione social attiva. Ads, messaggi privati e account terzi esclusi.

## Implementato e verificato

Prototipo individuale Vite/Three.js, Node >=22 e lockfile. Nessuna chiamata al
backend precedente, account, analytics o pagamenti nella nuova build.

- Sei kit di classe, primo corpo Ranger originale e cinque ruoli con corpo
  condiviso; combo, abilità, proiettili, scatto a vigore e interruzioni.
- Due echi → ricordo di Liora → risveglio → Custode con Frattura/Onda → tre tracce.
- Ranger Tiro di ritorno: schivata d'impatto dopo risveglio, finestra di 4 secondi
  per abilità doppia; seconda freccia ritardata di 140 ms al 65% del danno base.
- **Giardino dei nomi:** seconda area, bussola, segnale e ritorno. Sentinella
  pattugliante con attacco rettilineo; colonne fermano raggio, proiettili e colpi
  fisici diretti. Effetti magici ad area possono superare la copertura. La missione
  è completabile aggirando il nemico. Visite successive senza duplicare il finale.
- Audio sintetico originale opt-in, volume/mute, pausa e qualità grafica regolabile.
- Checkpoint locali opt-in: formato v2 sulla chiave storica mythwood.checkpoint.v1.
  Lettura v1 compatibile senza scritture; nuove scritture solo su azione autorizzata
  dalla preferenza. Si conservano classe, tappe, area/missione e sentinella sconfitta.
  Ripresa con vita/vigore pieni; combattimento parziale ricreato da ingresso sicuro.
- Interfaccia desktop/touch, controlli separati in landscape e focus ripristinato
  al gioco riprendendo movimento/attacco dopo i menu.

Il passaggio tra aree è un'interazione esplicita. Il giardino viene costruito al
primo ingresso e conservato: entrambe le radici restano in memoria, **non streaming**.
Le scene e i modelli sono procedurali provvisori, ancora distanti dal concept.

## Codice da conoscere

| File | Responsabilità / vincolo |
| --- | --- |
| src/combat.js, roles.js, game.js | Simulazione e API. Filtrare nemici/danni per area; cleared resta il primo Custode |
| src/garden.js | Accesso, missione, sentinella, geometria delle collisioni/coperture |
| src/checkpoints.js | Schema v2, compatibilità v1, ripresa, storage facoltativo e conflitti osservati |
| src/runtime.js, ui.js, style.css | Input, UI, avanzamento fisso, collegamento alla scena e pause |
| src/visuals/environment.js, garden.js, telegraph.js | Radici delle aree e segnale con dimensioni della simulazione |
| src/journey.js | Guida e testi narrativi proposti, non contenuto remoto |

Leggere REGIONS.md, LOCAL_CHECKPOINTS.md, QUEST_02.md, RANGER_EVOLUTION.md e
COMBAT_UX.md prima di modificare questi vincoli. Per una terza area aggiornare
intenzionalmente filtri, enum e schema: non esiste ancora un registro arbitrario
di regioni. I dati locali non sono autorità per economia o premi online futuri.

## Verifiche e provenienza

**94 test superati**, build riuscita: circa 710 kB JS / 190 kB gzip; warning
chunk >500 kB ancora aperto. Rapporti in docs/verification/:

| Rapporto | Sorgenti verificate | Ambito |
| --- | --- | --- |
| unit-latest.json | 864f97f | 94 test, incluse geometria/pose, regole e fixture SQL sintetiche |
| garden-latest.json | 864f97f | Desktop/mobile, missione, migrazione, ricarica, ritorno, rivisite |
| browser-latest.json | 864f97f | Regressione completa del primo episodio a tempo normale, inclusi fallback storage |
| character-latest.json | 864f97f | Confronto di authoring, quattro pose, hash geometria/immagini |
| checkpoint-ui-latest.json | 45f89ba | Precedente controllo testo guida e ripresa v1/v2 con autosave spento, sentinella già sconfitta |

I rapporti indicano sorgenti/hash e ambito; quello rapido checkpoint precedente
mantiene la propria provenienza e non è stato rieseguito in questo blocco.
I runner di studio, regressione e Giardino correnti hanno exit 0.

Chromium SwiftShader, non dispositivi fisici. Nuova area: Leggera, DPR 1,
1440×900/390×844 e layout 844×390. Regressione: mobile DPR 2 e controlli dei tre
profili grafici. Zero errori JS/richieste esterne nei percorsi completi. Tre
rivisite a caldo senza nuove chiamate createBuffer osservate: non misura tutte
le risorse GPU, perdite di memoria o FPS. Catture reali in docs/assets/prototype/.

Il runner Ranger precedente usa clock browser controllato, senza hook sullo stato
interno. Rapporto audio precedente su 17 cue native; nessuna nuova sintesi audio
in questo blocco. Mantengono i propri commit, non sono nuovi collaudi hardware.

```sh
npm ci --ignore-scripts
npm test
npm run build
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium npm run test:garden
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium npm run test:checkpoints
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium npm run test:character
```

Altrove installare Chromium Playwright. npm run dev avvia su loopback; il relativo
indirizzo del Cloud non è apribile direttamente da iPhone. Vedere PREVIEW.md.
Non ricompilare dist mentre un altro runner la serve. I rapporti atomici locali
sono in test-results/, ignorata da Git; condividere solo gli esiti verificati.

## Limiti e lavoro successivo

1. **Arte:** tradurre un personaggio in qualità giocabile con confronto reale.
   CHARACTER_DARIA.md e tavola originale sono una proposta per il Ranger;
   nome/cast non approvati; prima interpretazione procedurale presente, qualità
   finale e somiglianza al concept da migliorare. Non presentare
   il concept come screenshot o asset 3D già pronto.
2. **Prova umana:** PLAYTEST_01.md; capire obiettivo, cariche, crescita e orientamento.
   Non dedurre divertimento, bilanciamento o retention dai bot.
3. **Esplorazione:** rifinire Giardino e nota ambientale laterale, ancora assente;
   poi espandere con contenuto distinto. Movimento assistito in linea, non pathfinding.
4. **Cooperazione:** prova autorevole di due client in staging, con riconnessione
   e ricompensa unica. Non esistono ancora gilde/cooperativa online o nuovo backend.
5. **Store:** chiuso nella nuova build. Catalogo, provider e responsabilità da definire.
   Nessun prodotto/account esterno modificato. Vecchio reel ritirato: non riattivarlo.

Rimangono assenti grande mondo, grafica/animazioni definitive, voce narrativa,
collaudo Safari/iPhone reale, backend autorevole e rilascio pubblico della nuova
build. Liora/Cartiglio e dettagli dei nuovi capitoli restano proposte narrative.

## Legacy e sicurezza da non perdere

Baseline vecchio sito: ac9039ea91983a9586b01eeab4a60a02b5e88b54; caricatore archiviato
in legacy/index.html.txt. Audit di 210 funzioni/65 tabelle e sorgenti parziali in
TECHNICAL_BASELINE/SECURITY. Bypass NULL del login riprodotto in PGlite isolato;
patch proposta, non applicata su produzione. La diagnosi FOUND sugli acquisti
è **ritirata perché errata**: non riproporre quella correzione.

Device è una credenziale nel vecchio sistema. Mancano ancora backend/Edge
Function completi, indici/ACL/configurazione, cron, backup e procedure ripristino.
Claude li aggiornava direttamente su Supabase: richiedere sorgenti redatti,
non segreti. Nessun test su account o dati reali. Nessuna attestazione generale
di sicurezza o conformità UE; leggere SECURITY.md ed EU_READINESS.md.

## Consegna a Claude e storia

Fonte condivisa: ramo Git, non chat. START_HERE e CLAUDE_RESTART_PROMPT descrivono
il rientro. Prima risposta attesa in TONINO_REVIEW, con commit ricevuto, file letti,
prove effettive, obiezioni e incarico proposto. Registrare file assegnati prima
di attività che si sovrappongono; preservare modifiche locali e remote.

Cronologia decisioni in COLLABORATION.md. La precedente consegna cumulativa è
conservata in docs/history/HANDOFF-2026-11-10-before-garden-consolidation.md;
contiene note e autorizzazioni storiche superate, non istruzioni correnti.

## In corso — trailer concept richiesto dal proprietario

Nuovo mandato: teaser anche cinematografico, non necessariamente gameplay.
Quattro scene originali AI in docs/assets/trailers/source; nuovo render in
scripts/render-cinematic-trailer.py. Musica originale sintetizzata localmente.
Checkpoint prima del render: video e controlli ancora pendenti, non pubblicato.
