# Processo e decisioni condivise

## Stato corrente 12 novembre — COMBAT-01 integrato, ART-02 assegnato

PR #4 a7926ed integrata in 8d6d699 dopo verifica delle correzioni. Consiglio di
sconfitta Codex in 82a9935. Rapporto COMBAT_PASS_01_RECHECK: 166 test finali,
90 scenari, regressioni delle aree e catture mirate; episodio seriale passato
senza aumentare il timeout dopo primo tentativo parallelo fallito. R1/R2 chiusi.

| Responsabile | Incarico attivo | File riservati | Ramo | Stato |
| --- | --- | --- | --- | --- |
| Tonino | ART-02: prima arena, materiali/asset CC0, luci, confronto misurato | src/visuals/environment.js, materials.js, stone-surface.js, geometry.js per helper; src/graphics-quality.js; nuovi props/materiali, public/art/environment-pass02, script/fixture e documenti ART-02 | tonino/art-pass-02, nuovo dalla base aggiornata | Assegnato; perimetro esatto ART_PASS_02_SCOPE e prompt CLAUDE_ART_PASS_02 |
| Codex | Coordinamento e revisione ART-02 | documenti di coordinamento/review, evidenze e sonde dedicate, senza modifiche ai file riservati a Tonino | mythwood/collaboration-base o ramo codex di review | COMBAT-01 concluso; prossima revisione dopo consegna ART-02 |

Runtime/combat/caves/telegraph/HUD/personaggi fuori da ART-02: prima registrare
l'esigenza e concordare il nuovo perimetro. Il vecchio Rintocco è consolidato,
non va riapplicato. Le vecchie righe di incarichi sotto sono storiche.
Niente main, deploy, social, spese, Supabase o risvegli/monitor periodici.

## Stato 12 novembre — ripresa manuale e PR #2 integrata

Il proprietario ha annullato risvegli e controlli periodici: non avviare watch
o scheduler. Le letture singole durante un turno richiesto restano consentite.
PR #2 testa efaf903 integrata in 252c38b dopo 141 test, build, test:daria e
Ranger desktop/mobile. Risposta attuale in PRODUCT_RESPONSE_02.md. Le vecchie
istruzioni periodiche sotto sono storiche, non un mandato di riattivazione.
Rintocco 3222cd1 è ora recuperato su origin/tonino/rintocco, ma non verificato
né integrato: la riserva su hit e sugli altri file resta finché la revisione
non è conclusa. Nessuna nuova prenotazione automatica di attività notturne.

## Nuovo metodo — lettura diretta delle consegne

Su richiesta del proprietario, ciascun agente controlla Git all'avvio e ai
checkpoint, legge e risponde senza passaggi manuali se la consegna è disponibile.
Procedura e monitor ogni cinque minuti in docs/AGENT_MONITOR.md. Il monitor
non avvia turni AI né notifiche push: non dichiarare collaborazione continua
a chat chiusa. Questo aggiorna il vecchio «il proprietario segnala consegne»
quando gli agenti sono attivi; non modifica rami riservati o condizioni di rilascio.

## Incarichi attivi — mandato del proprietario (2026-11-11)

Il proprietario riferisce che Tonino ha ricevuto 6ef6174, letto i documenti ed
eseguito 117 test/build/test:caves con successo. È una comunicazione del
proprietario, non una revisione letta da Codex nel repository. Ramo/PR rintocco
ancora non consegnati al momento dell'assegnazione; non ricostruire la patch.

| Responsabile | Incarico | File riservati | Ramo | Stato |
| --- | --- | --- | --- | --- |
| Tonino / Claude | COMBAT-01, implementazione unica dopo PRODUCT-03 | combat.js inclusa hit; artifacts.js; enemy-attacks.js; caves.js; memoryFor/riga runtime Rintocco; rendering/HUD/test pertinenti. Nuovi file: tests/combat-pass.test.mjs; scripts/combat-pass-compare.mjs e scripts/combat-pass-capture.mjs; docs/COMBAT_PASS_01.md; docs/assets/combat-pass-01/ | tonino/combat-pass-01 | Consegnato in PR (Tonino, 12/11), rapporto docs/COMBAT_PASS_01.md. Assegnato con criteri in COMBAT_PASS_01_ACCEPTANCE.md. Codex revisore; nessuna modifica sovrapposta, nessun deploy o risveglio |
| Codex | CHAL-01 e risposta PRODUCT-01 | index.html; src/site; public/site; copie ritratto sito; script payload/esperimento temporaneo e documenti | mythwood/collaboration-base | Consegna verificata: copie responsive e feedback neutro, budget sei classi DPR1/2, 138 test e regressione desktop/mobile passati. 75 simulazioni + 2 prove Sigillo; limiti in PRODUCT_RESPONSE_01 |
| Tonino / Claude | Personaggi 3D fedeli ai concept, prima Daria; verifiche loader | src/visuals/ranger*.js; class-characters.js; actors.js; generatori/asset personaggi; studio/test dedicati; scripts/daria-*; tools/daria-* | tonino/character-art-pass-01 | Correzione verificata e integrata 04f0ca9. P2 residuo a metà tensione dichiarato; prossimo confronto sulla transizione arco. Nuova consegna su ramo distinto da base aggiornata, senza continuare sul ramo condiviso |
| Tonino / Claude | PRODUCT-01: dieci minuti che uno sconosciuto voglia finire e far provare (solo analisi e proposta, nessuna implementazione) | docs/PRODUCT_CHALLENGE_01.md; sezione PRODUCT-01 in docs/PEER_REVIEW.md; script di sola osservazione in scripts/product-*.mjs | tonino/character-art-pass-01 | Consegnato: docs/PRODUCT_CHALLENGE_01.md, prove in docs/assets/product-challenge-01. Protocollo 5 persone non eseguito. Domanda a Codex in PEER_REVIEW. Le modifiche proposte 1–4 toccano file di Codex: non le implemento senza accordo |
| Codex | Asset 3D delle sei classi da concept, prime basi riggate | src/visuals/class-characters.js; actors.js; scripts/prepare-class-characters.py; public/models/characters; studio e test dedicati; documenti | mythwood/collaboration-base | 135 test, build, 30 pose e regressione episodio desktop/mobile passati. Volti/costumi e clipping ancora da rifinire; non pubblicati |
| Tonino / Claude | PRODUCT-03: Onda da lontano e Impeto, risposta a PRODUCT_RESPONSE_02 (solo esperimento) | scripts/decision-experiment-03.mjs; docs/PRODUCT_DECISIONS_03.md; docs/assets/product-decisions-03 | tonino/decisions-03 | Consegnato il 2026-11-12, base 252c38b. Nessun file di gioco toccato. In attesa dell'accordo di Codex sul perimetro della PR unica di combattimento |
| Tonino / Claude | BOW-01 e PRODUCT-02: transizione arco schiena↔mano senza scatti; risposta misurata alle due controprove di Codex (Ranger fuori aggro, Custodia che scade) | src/visuals/ranger-skinned.js; tools/daria-*; scripts/daria-*; scripts/decision-experiment-02.mjs (solo copie temporanee: combat.js, artifacts.js e hit restano identici); docs/PRODUCT_DECISIONS_02.md | tonino/bow-transition-01 | Consegnato (vedi PRODUCT_DECISIONS_02, HANDOFF), base 99e7fdb. Nessuna modifica a hit/caves/sito. Rintocco: ramo pubblicato come riferimento (tonino/rintocco, 3222cd1 su base 0789af7), non integrato; la resistenza del Custode va implementata una sola volta insieme al `resolute` del Rintocco, dopo accordo |
| Tonino / Claude | Bilanciamento Guardiano del rintocco e finale coerente | src/caves.js; funzione hit in src/combat.js; src/journey.js (memoryFor); riga collegata in src/runtime.js; tests/caves.test.mjs | tonino/rintocco | Pubblicato come riferimento il 2026-11-11 (origin/tonino/rintocco, 3222cd1, base 0789af7), nessuna PR. Da riallineare dopo l'accordo su un'unica resistenza `resolute` in hit() per Guardiano e Custode (PRODUCT_DECISIONS_02) |
| Codex | Regressione episodio completo, indagine timeout, simulazione Custode/Sentinella | scripts/browser-check.mjs; nuovi script di diagnosi/simulazione; docs/PEER_REVIEW.md; docs/COLLABORATION.md; HANDOFF.md; AGENTS.md; evidenze dedicate | mythwood/collaboration-base | Concluso: 2 regressioni complete passate, timeout riprodotto/corretto nel runner, 62 scenari; PEER_REVIEW |
| Codex | Demo con riepilogo, sito statico, video gameplay e preparazione Pages | index.html; demo.html; vite.config.js; src/site/; src/demo-entry.js; src/demo-shell.css; script test/cattura; public/site; documenti di consegna | mythwood/collaboration-base (sorgenti), mythwood/pages (build) | Codice e verifiche concluse; attivazione Pages e nuovo Supabase mancanti; file Tonino invariati |
| Codex | Rifare presentazione Custode e ritirare il video respinto | src/visuals/guardian-redesign.js; src/visuals/actors.js; tools/guardian-review; script studio/cattura; index.html; test presentazione e documenti | mythwood/collaboration-base | Prima revisione consegnata: 129 test, studio visivo, Ranger e sito desktop/mobile superati; approvazione artistica pendente. Nessuna modifica a bilanciamento o file di Tonino |

Codex integra sul ramo di collaborazione; Tonino usa rami tonino/<incarico> e
PR verso quel ramo. Non committare entrambi sullo stesso ramo. Finché la PR
rintocco non è chiusa, Codex non modifica caves.js né hit; per evitare conflitti
rispetta anche gli altri file assegnati a Tonino. Proposte e misure non sono patch
approvate. Revisione in PR e PEER_REVIEW con comando, esito e decisione motivata.
Nessun merge main, deploy, social, spesa o Supabase. Push consentiti ai rami
operativi. Le chat non comunicano; il proprietario segnala nuove consegne.


## Collegamento fra Codex e Tonino

La fonte condivisa è questo repository, non le rispettive chat. Le sessioni non
si comunicano automaticamente. File locali non pubblicati devono essere trasferiti
dal proprietario o condivisi tramite un'operazione Git autorizzata.

Il proprietario mantiene il controllo di budget, credenziali, produzione e scelte
di prodotto. Gli agenti possono proporre e contestare motivando con evidenze.
Nessuno deve assumere che una proposta dell'altro agente sia un ordine approvato.

## Sequenza di lavoro

1. Leggere AGENTS, design, baseline, backlog e handoff.
2. Dichiarare un task, ambito, commit di partenza e file/risorse interessati.
3. Verificare che non ci sia un incarico attivo sovrapposto.
4. Preparare risultato e verifiche entro le autorizzazioni disponibili.
5. Aggiornare handoff e decisioni; chiedere revisione di un risultato concreto.
6. Separare approvazione del risultato da commit, deploy, spesa e pubblicazione.

Per ora usare consegne sequenziali. Quando esisterà un flusso Git autorizzato,
preferire rami/PR separati per incarico. Non crearli durante il solo setup dei documenti.

## Ricerca e apprendimento

Per ogni confronto con un gioco registrare fonte e data, piattaforma, esperienza
osservata, ipotesi sul coinvolgimento e cosa si può verificare nel nostro prototipo.
Separare popularità documentata da preferenze personali. Studiare anche giochi
di nicchia, ma scegliere riferimenti compatibili con risorse e controlli disponibili.

Per ogni prova: domanda, artefatto, persone/dispositivi coinvolti, osservazioni,
decisione e prossimo tentativo. Il mancato miglioramento deve cambiare il piano.

## Registro decisioni iniziale

| ID | Stato | Decisione / contesto |
|---|---|---|
| D01 | Confermato dal proprietario | Budget originale 50 euro e 50 giorni; autonomia e promozione social. |
| D02 | Confermato dal proprietario | Ambientazione modificabile; qualità visiva/narrativa e soddisfazione centrali. |
| D03 | Confermato dal proprietario | Solo Leveling come riferimento di interesse; pubblico coinvolto durante lo sviluppo. |
| D04 | Confermato dal proprietario | Preparare documenti e collaborazione; successivamente autorizzato il commit locale. Push e deploy non autorizzati. |
| D05 | Proposta | Cacciatore dei falliti, echi e progressione narrativa. Da verificare con concept e prototipo. |
| D06 | Aperta | Turni oppure action; 2,5D oppure 3D; ruolo di Tonino; nome finale. |
| D07 | Proposta tecnica | Staging isolato e sorgente versionato prima di nuove modifiche backend. |
| D08 | Confermato dal proprietario | Missioni personali, cooperazione asincrona e spedizioni simultanee; gilde centrali. Alcune missioni richiedono tutti: perimetro della squadra da precisare. |
| D09 | Confermato dal proprietario | Più personaggi con abilità diverse; ispirazione a Solo Leveling senza copia. Tre archetipi e relativi nomi restano proposte. |
| D10 | Indicazione del proprietario | Riferimenti di classe: Assassini, Maghi, Ranger e Guaritori; considerare mostri, nemici e gilde rivali. Superata la precedente proposta di tre archetipi; abilità, cast e forma della rivalità restano da progettare. |
| D11 | Indicazione del proprietario | Aggiungere Tank e Combattenti: sei classi di riferimento complessive. Non implica sei partecipanti obbligatori né sei kit completi al primo rilascio. |
| D12 | Approvato dal proprietario | Direzione visiva del mockup Echi del Varco e grande mappa esplorabile. Concept generato, non gameplay realizzato; nome e trama non definitivamente scelti. |
| D13 | Indicazione del proprietario | Promuovere con gameplay accattivante. Preparare catture reali e piano; account, spese e pubblicazioni operative non ancora definiti. |
| D14 | Confermato dal proprietario | Evoluzioni importanti; progettare trasformazione visiva e di abilità collegata alla storia. Percorsi specifici ancora proposti. |
| D15 | Confermato dal proprietario | Mythwood come nome di gioco e sito; riscrivere e sostituire completamente il vecchio codice, includendo lo store. Superata la voce D06 sul nome aperto. |
| D16 | Dichiarato dal proprietario | Nessun acquisto reale nel vecchio store. Non implica assenza di utenti o dati; catalogo, provider e prezzi nuovi da definire. |
| D17 | Mandato del proprietario | Ricostruire, interrogarsi reciprocamente, debuggare e affrontare sicurezza e requisiti europei. Confronto diretto con Tonino non ancora disponibile; domande in PEER_REVIEW.md. |
| D18 | Correzione verificata | Ritirata diagnosi PAY-01: assegnazione con sottoquery non altera FOUND. Mantenere test del codice originale, senza patch non necessaria. |
| D19 | Autorizzazione continuativa del proprietario | Post e commenti organici autonomi su Instagram/TikTok del progetto; account dichiarati professionali. Mancano identificativi e accessi tramite strumenti supportati. Non chiedere approvazione per ogni post; nessun mandato a spese, ads o messaggi privati. |
| D20 | Confermato dal proprietario | Avvio e prosecuzione dei lavori autorizzati anche prima del rientro di Claude. Tonino usava API Meta e TikTok: recuperare integrazioni esistenti prima di scegliere altri servizi. |
| D22 | Implementazione locale richiesta | Studio di combattimento action, animazioni e UX; regole e prove in COMBAT_UX.md. Non equivale ad approvazione finale del sistema o della resa. |
| D21 | Feedback e indirizzo del proprietario | Primo reel respinto per grafica/ambientazione/design inadeguati. Kit ritirato: non pubblicare. Prima una piccola scena 3D più curata e confrontabile con il concept; niente nuovi reel basati sui segnaposto. |

## Messaggio da dare a Tonino

> Collaboriamo con Codex sul repository nocciolinatanaai/Bosco. Leggi AGENTS.md,
> GAME_DESIGN.md, HANDOFF.md e docs/ prima di lavorare. La direzione creativa è
> una proposta da verificare, non una specifica già approvata in ogni dettaglio.
> Prima consegna: descrivi i processi autonomi attivi, come aggiornavi Supabase,
> dove sono i sorgenti e le decisioni pregresse; fornisci il codice di riscatta
> senza segreti e l'inventario mancante. Non modificare produzione né pubblicare
> contenuti per effetto di questo messaggio. Segnala eventuali operazioni già
> pianificate e chiedi al proprietario come coordinarle. Proponi poi un incarico
> piccolo e verificabile dal backlog. Registra risultati e consegna nel repository.

## Modello per la prossima consegna

```text
Autore / data:
Task / autorizzazione:
Commit e stato iniziale:
File e risorse interessati:
Risultato:
Verifiche effettive:
Limiti / rischi:
Decisioni nuove (approvate o proposte):
Budget effettivamente usato:
Prossimo incarico:
```

## Consegna Codex — episodio iniziale, 10 novembre 2026

Mandato: procedere con i prossimi step e aggiornare i file comuni. Implementato
localmente il percorso echi → ricordo → evoluzione → Custode; Liora e gilda
scomparsa restano proposte narrative. Leggere EPISODE_01.md e HANDOFF.md per
regole, test, limiti e revisione richiesta. Nessuna risposta di Tonino ricevuta;
nessun push/deploy o spesa. Le modifiche comuni sono nel checkout: non presumere
che un’altra sessione le abbia già ricevute da GitHub.

## Preparazione al rientro — Custode e revisione

Codex ha implementato due attacchi del Custode e segnali coerenti col raggio.
La richiesta di confronto per Tonino è in CLAUDE_REVIEW.md; la risposta prevista
è TONINO_REVIEW.md. Nessuna risposta ancora ricevuta, nessun file assegnato a
un agente che non è collegato. Lavoro locale sequenziale, nessun push o deploy.

## Mandato aggiornato: repository condivisa

Il proprietario chiede di caricare codice, documenti e idee nella repository e
proseguire in autonomia. Codex prepara il ramo mythwood/collaboration-base,
separato dalla main del sito. START_HERE.md è l’ingresso per Tonino; IDEAS.md
raccoglie le richieste e PRODUCT_REVIEW.md distingue risultati e limiti.
Commit e push del ramo sono autorizzati; merge, deploy e operazioni esterne
restano distinti. Pubblicazione confermata solo dopo la verifica del riferimento
remoto. Non dichiarare che Tonino abbia letto o risposto in assenza di evidenza.

Pubblicazione verificata: base bdfd5f9 caricata su
origin/mythwood/collaboration-base; main resta ac9039e. Le istruzioni di revisione
sono ora nel ramo remoto. Questo prova la disponibilità dei file, non la lettura
di Tonino. Test locali 45/45 e build riuscita; stato CI remoto non osservato.

## Lavoro autonomo successivo — audio e comprensione

Il proprietario ha ribadito di continuare senza conferme a ogni passo. Codex
implementa audio originale opzionale e feedback della causa di sconfitta;
ricerca comparativa documentata e proposta narrativa completano la consegna.
La prima lettura di fonti Steam non viene presentata come sessione di gioco.
Nessuna risposta di Tonino ancora ricevuta, nessuna pubblicazione social o deploy.

Avanzamento autonomo successivo: grafica configurabile (GRAPHICS_QUALITY.md).
Profili espliciti, nessun adattamento automatico o valore FPS dichiarato.
Nessuna modifica concorrente di Tonino osservata; il ramo remoto è stato
recuperato senza sostituire la main o il sito pubblicato.

Avanzamento successivo: pista giocabile di Liora sul sentiero esistente.
MEMORY_TRAIL.md descrive sequenza, confini e prove. Il nome Cartiglio è introdotto
come indizio nel prototipo; gilda rivale e cooperativa non sono implementate.
Tutti i cambiamenti restano nel ramo di collaborazione, senza deploy.

Primo ritratto illustrato di Liora generato e integrato nelle memorie: provenienza
in public/art/README.md e limiti in LIORA_PORTRAIT.md. Non sostituisce il futuro
modello 3D. Confrontare stile e leggibilità; non considerarlo approvato dal
proprietario per il solo fatto che Codex lo ha introdotto autonomamente.

## Checkpoint prima dei limiti di sessione

Richiesta esplicita del proprietario: commit e aggiornamento periodico dei file
condivisi. Codex salva questo blocco come checkpoint, dichiarando la verifica
browser finale da ripetere dopo la ripresa. Un nuovo rapporto JSON atomico nel
runner conserva esiti per viewport e hash anche se si perde l’output del processo.
Aggiornare successivamente questo registro con il risultato effettivo; non
inferire un test superato dalla sola presenza di screenshot.

Checkpoint sorgenti pubblicato: e245bf8. Dopo la ripresa, verifica finale
rieseguita con esito positivo su desktop/mobile, 60 test locali superati e
rapporto persistente disponibile in docs/verification/. Le catture aggiornate
non sostituiscono il rapporto e non dimostrano prestazioni hardware. Questa
consegna documentale registra il risultato; nessun merge/deploy o risposta di
Tonino ricevuta. I checkpoint successivi seguono la regola richiesta dal proprietario.


## Salvataggio locale — checkpoint prima della prova browser

Codex, 10 novembre 2026, base e52d1ca. Opt-in e ripresa alle tappe implementati;
69 test e build passano. Nuovi controlli browser ancora pendenti. File assegnati:
checkpoints.js, runtime/ui/style, relativi test e documenti. Dati solo locali,
nessuna produzione. Riprendere dal nuovo paragrafo HANDOFF e da LOCAL_CHECKPOINTS.


Checkpoint successivo: percorso desktop passato su sorgenti 2b832e8;
mobile/fallback in corso. Privacy, istruzioni di ripresa e protocollo di prova
umana aggiornati. Una stringa UI fuorviante corretta dopo la build sotto test:
verificarla separatamente alla conclusione, senza confondere gli hash.


## Salvataggi — risultato conclusivo

Browser completo su 2b832e8 concluso con exit 0: desktop e mobile simulato,
opt-in, tappe, ricarica/ripresa, preferenza off persistita e cancellazione
selettiva. Prove separate di dati corrotti e API bloccata superate. Rapporti
versionati aggiornati, zero errori/richieste esterne nei percorsi completi.
Test rapido UI separato per la stringa corretta in ebe0d16, ripresa con autosave
spento e cancellazione annullata; runner riutilizzabile test:checkpoints.
Nessuna revisione di Tonino, migrazione o pubblicazione di produzione eseguita.


## Incarico attivo — direzione e prima evoluzione specifica

Codex, base bdd9454, 10 novembre. Proprietario chiede spazio ai giocatori e
prosecuzione verso 35–40%, prima della revisione con Claude. La percentuale è
una stima di prodotto, non un avanzamento misurabile ottenuto con documenti.
Codex mantiene direzione e integrazione; Claude potrà implementare incarichi
circoscritti e proporre/contestare, con revisione reciproca. Non è ancora collegato.

Blocco attivo: Ranger, schivata di un impatto → finestra di tiro doppio;
file combat/runtime/ui/visuals e test dedicati, documenti feedback e roadmap.
Preservare scatto comune, sei classi, tappe locali e sequenza narrativa.
Nessun incarico sovrapposto osservato. Nessuna produzione o spesa.


Checkpoint correttivo del runner Ranger: focus sul canvas prima di Spazio,
percorso di avvicinamento diagonale e lettura value del progress corretti.
I primi due tentativi non sono esiti superati; diagnostiche conservate localmente.
Nessuna modifica a danni o salute per far passare il test. Tempismo del potere
esplicitato nelle istruzioni. Verifica finale ancora da eseguire.


Secondo checkpoint di verifica: focus di gioco ripristinato dopo menu quando
si riprendono movimento/attacco; messaggio abilità durante scatto corretto.
Runner con clock controllato per evitare campionamento non deterministico del
momento di schivata; catture con gioco in pausa e attesa abilità disponibile.
77 test superati, verifica browser finale ancora in corso. Nessun nuovo danno
ritoccato per la prova. Piano e feedback aggiornati anche nel design principale.


## Ranger — verifica dedicata conclusa

Prova finale desktop/mobile passata: impatto evitato, finestra, tiro doppio,
109 danni effettivi complessivi, reset UI, focus dopo menu e layout landscape.
Clock controllato; niente catture in questo runner. Rapporto ranger-latest.json,
applicazione edd2d59 e runner identificato dall'hash. 77 test passati. Il prompt
Claude è riscritto sul mandato attuale. Checkpoint prima della regressione lunga:
full browser a tempo normale ancora pendente, nessun 35–40% dichiarato raggiunto.


## Proposta artistica del primo Ranger

Codex ha generato una tavola originale di Daria (nome/cast proposti, non
approvati), con base/risonanza/retro. File docs/assets/daria-ranger-concept.png,
provenienza e brief di traduzione 3D in CHARACTER_DARIA.md. Non è nel gioco e
non sostituisce il modello: incarico concreto proposto a Claude, ancora non
accettato. Nessun asset esterno acquistato. La regressione completa resta attiva;
questa aggiunta documentale non cambia la build sotto test.


Seconda area: brief proposto in QUEST_02.md, con obiettivo di recupero/ritorno,
nuovo comportamento nemico, percorsi e vincoli di salvataggio. Nessun codice di
area implementato o assegnato; modifica narrativa documentale durante i test.


## Chiusura verificata del blocco

Regressione completa a tempo normale conclusa con exit 0 su desktop/mobile,
layout landscape e storage fallback. Nessun errore JS o richiesta esterna.
Rapporto browser-latest.json aggiornato su sorgenti ce238c0, insieme al rapporto
Ranger dedicato già condiviso. 77 test e build riusciti, warning bundle aperto.
Concept Daria e design seconda area sono proposte separate dalla build.
Pronti handoff/prompt/criteri di incarico, nessuna risposta Claude ricevuta.
Il traguardo 35–40% resta un obiettivo: non è stato dichiarato raggiunto.

## Incarico attivo — Giardino dei nomi

Codex, base 47f1140. Ramo remoto controllato e allineato; nessuna revisione o
assegnazione sovrapposta di Claude registrata. Implementazione seconda area:
garden.js, simulazione combattimento, checkpoint v2 compatibili v1, visuali,
runtime/UI, test dedicati e specifiche. Accesso dopo tre tracce, bussola/segnale/
ritorno, sentinella rettilinea con coperture reali. Arte di Daria separata da
questo incarico. Geometria creata al primo ingresso e conservata, non streaming.
Commit/push ai blocchi funzionali e prima della regressione lunga. Nessuna
produzione, spesa o pubblicazione esterna.


Checkpoint funzionale Giardino: 87 test e build riusciti. Accesso, bussola,
segnale/ritorno, nemico rettilineo e v2 compatibile v1 implementati. Nuovi
controlli browser ancora da eseguire. Nessun risultato dedotto dalla build.


Checkpoint prima della verifica finale: layout landscape corretto dopo un test
fallito per sovrapposizione al joystick. Prova dedicata passata sui due viewport,
zero nuovi buffer WebGL durante tre rivisite a caldo. Poi corretta la copertura
per frecce/armi fisiche del giocatore, 88 test passati. Rilanciare prova dedicata
su questa patch e regressione normale prima di segnare il blocco verificato.


## Giardino — verifica dedicata finale

47b9f36: 88 test/build e percorso UI nuova area superati su desktop/mobile,
landscape controllato, DPR 1 e qualità Leggera. Migrazione/ripresa/ritorno e
rivisite passano; zero createBuffer nuove a caldo, senza dichiarare FPS/memoria
totale. Rapporti e catture condivisi. Regressione primo episodio in avvio,
ancora pendente; nessuna comunicazione Claude o produzione presunta.


Checkpoint documentazione/ultimo testo UI: in assenza di nemici il giardino ora
mostra l'obiettivo corretto. Test rapido v2 sentinella sconfitta/bussola preparato;
88 test passati. Regressione normale in corso sulla build precedente, smoke del
ritocco da eseguire dopo. Non ricompilare dist mentre il runner la sta servendo.


## Consegna Giardino verificata e consolidata

88 test, build, percorso dedicato e regressione normale superati. Regressione
3412915 passata su entrambi i viewport, recuperata dal rapporto persistente dopo
una segnalazione di avvio ambiente; processo rimasto attivo, exit 0 confermato.
Ultimo testo guida e ripresa sentinella sconfitta/bussola su 45f89ba verificati
separatamente dal runner checkpoint. Tutti i rapporti indicano il proprio commit.

HANDOFF riscritto come fotografia corrente; vecchia consegna cumulativa conservata
in docs/history con avviso di contesto storico. Nessuna informazione cancellata
per simulare avanzamento. Nessuna risposta di Claude o prova umana ricevuta,
nessun deploy/produzione/spesa. Prossimo incarico proposto: personaggio rifinito,
prove con giocatori, poi cooperazione autorevole in staging.

## Incarico attivo — Ranger originale e piano contenuti

Codex, base 8abd192. Remoto allineato; nessun incarico accettato di Claude
registrato sui file. Proposta quantitativa primo arco in CONTENT_SCOPE, caption
manuale pronta in social/RESTART_CAPTION. Trailer richiesto come incarico
successivo, non prodotto/pubblicato ora. Lavoro attivo: primo modello Ranger
originale da concept, pose arco e risonanza, integrazione visuali e verifiche.
Geometria procedurale originale, non conversione automatica del PNG o asset finale.
File actors/ranger/runtime visuali e test. Preservare sei kit e logica di gioco.


Checkpoint Ranger: prima geometria originale separata dal corpo condiviso,
pose/corda, mantello e arco risonante integrati. 93 test e build passano;
verifica visiva e browser ancora pendenti. Nessun risultato artistico dedotto
dal conteggio di triangoli. Caption/manuale e scope sono proposte condivise.


Rifinitura e studio nativo: 94 test passati; corrette forme del volto, superficie
della giacca e orientamento arco durante il tiro. Quattro pose renderizzate con
stessa camera/luci per confronto col modello precedente, zero errori/richieste
esterne. Non è una cattura gameplay o qualità finale. Checkpoint prima della
regressione integrata; caption e quantità restano proposte pubblicabili come stato/direzione.


Studio visivo condiviso con hash/sorgenti 864f97f e 94 test superati. Immagini
chiaramente etichettate come authoring, non gameplay e non confronto con Bosco
pubblicato. Regressione integrata in corso; nessuna qualità finale o risultato
umano dedotti. Contenuti quantitativi indicati come proposta, non promessa.


## Blocco Ranger originale concluso

864f97f: 94 test, build, studio a quattro pose, regressione completa e Giardino
con nuovo corpo passati su desktop/mobile. Zero errori/richieste esterne nei
percorsi; rivisite a caldo senza nuove createBuffer osservate. Rapporti e
catture aggiornati, senza attribuire risultati hardware o qualità finale.
Caption/hashtag per pubblicazione manuale e quantità proposte condivisi; brief
trailer futuro, nessun video/post prodotto da Codex. Nessuna risposta Claude
ricevuta o incarico accettato presunto. File liberi per revisione registrata.

## Teaser cinematografico — incarico attivo

Il proprietario richiede ora un trailer accattivante anche in stile film,
non necessariamente gameplay. Questo aggiorna il precedente brief. Codex lavora
su quattro illustrazioni AI originali, montaggio verticale e musica sintetizzata
originale. Nuovo script render-cinematic-trailer.py; vecchio kit ritirato intatto.
Render e controlli multimediali pendenti; nessuna pubblicazione/deploy.


## Teaser concluso — file liberi

Consegna di 24 secondi, concept AI animato con musica originale. Sorgenti
condivise in 2e24a4e, MP4/copertina/caption e rapporto nel commit successivo.
Decodifica completa senza errori, 1080×1920/30 fps H.264/AAC, -14,24 LUFS e
-1,96 dBTP misurati; camera/testi verificati su fotogrammi. Nessun test iPhone
reale, ascolto umano o risultato social dichiarato. Solo media/docs modificati,
nessuna pubblicazione o deploy. Il brief gameplay precedente è superato dalla
richiesta esplicita di un concept anche cinematografico.

## Correzione del trailer — lavoro locale nella nuova bozza

Il proprietario chiarisce che desidera una cinematica animata del gioco e della
sua evoluzione, non un montaggio di illustrazioni. Il precedente teaser illustrato
non soddisfa questa richiesta e non va riproposto come soluzione.
Nuova scena di authoring tools/cinematic/ con modelli/ambiente Three.js esistenti,
regia dedicata, arco, schivata e Custode. Script capture-engine-teaser.mjs.
Nessuna modifica alle regole del gioco. Ultima istruzione: non pubblicare nulla;
questo blocco rimane locale, senza push, deploy o invio social. Render in verifica.


## Stop del proprietario — priorità alla grafica

Il proprietario giudica le immagini 3D molto lontane dal risultato desiderato
e sospende il teaser finché la grafica non sarà almeno guardabile. Render
interrotto, nessun nuovo teaser consegnato o pubblicato. Gli esperimenti in
tools/cinematic/ e gli output parziali sono sospesi, non materiale promozionale.
Prossima priorità: una sola scena giocabile convincente con personaggio,
ambiente, illuminazione e animazioni da valutare visivamente col proprietario.
Non riprendere il trailer o dedurre approvazione artistica da test tecnici.
Nessun push, deploy o pubblicazione eseguiti in questo blocco.

## Revisione grafica — blocco locale attivo

Il proprietario autorizza l'avvio della scena giocabile più convincente; teaser
sospeso. Base anatomica CC0 di System G6 importata da OpenGameArt, selezionata,
collegata allo scheletro ed esportata GLB con Blender. Prime animazioni del
Ranger collegate allo stato esistente; accessori e caricamento locale con fallback.
File: ranger-skinned.js, ranger.js, actors.js, environment.js, public/models/ranger,
prepare-ranger-model.py, visual-review.mjs, tools/visual-review, test asset e docs.
Modifiche precedenti al teaser conservate ma non riprese. Nessun push o deploy.
95 test iniziali passati; controlli browser e valutazione visiva ancora in corso.
La base resta provvisoria e non viene dichiarata equivalente al concept approvato.


## Revisione grafica — primo blocco verificato

Checkpoint locale 35868c3; nessun push. 95 test, build e confronto di quattro
pose passati; controllati caricamento reale, asse di mira e fallback su asset
bloccato. Ranger: impatto schivato/tiro doppio/reset; Giardino: migrazione,
bussola, reload, segnale, ritorno e tre rivisite. Entrambi su desktop/mobile
Chromium con zero errori/richieste esterne. Rapporti in assets/visual-review/.
La CSP locale è stata estesa al solo schema blob per le texture incorporate.

Resta una base CC0 generica adattata, non Daria finale né approvazione artistica
del proprietario. Da rifinire volto/abiti, contatti e transizioni/scatto; poi
materiali e architettura del piccolo tratto di rovine e nemico. Altri cinque
corpi e Custode ancora provvisori. Teaser sospeso. Nessuna risposta Claude
presunta, nessun deploy, post, push o spesa esterna. File del blocco liberi.

## Skill applicate — nuovo blocco locale attivo

Il proprietario autorizza l'uso delle skill installate per proseguire Mythwood.
Applicate threejs-animation (raccordi di pose e ripresa), threejs-materials
(superfici PBR), threejs-performance (contatori di tutti i pass di rendering),
e writing-for-agents di Matt Pocock (consegna e istruzioni). Frontend-design e
asset-pipeline consultate come riferimento, senza cambiare HUD o formato GLB.
Non eseguire skill estranee al problema solo perché installate.

Nuovi pose-sampler.js e stone-surface.js; integrazione Ranger e materiali.
Pausa, cambio di azione durante un raccordo e riavvio coperti da test sintetici
con il vero AnimationMixer. Nessun cambiamento a hit timing o controlli.
Confronto ambientale prima/dopo e verifica del modello in browser pendenti.
Checkpoint locale prima delle verifiche lunghe; niente push, deploy o teaser.

Checkpoint prima delle regressioni integrate: 99 test e build passati. Browser
sullo scheletro reale: nessun salto alla commutazione/interruzione o deriva in
pausa nelle tre ossa campionate. Confronto superfici: geometria/draw call identici
prima/dopo, tre texture in più. Atlante 2×2 per variare pietra e crepe senza
nuovi materiali per blocco. Verifiche finali combattimento/Giardino pendenti.
Nessun risultato artistico dedotto dalle misure, nessun push o pubblicazione.


## Blocco skill concluso — pronto per revisione

Checkpoint applicativi locali b999087 e 70a1d20; niente push. 99 test e build
passati; confronto reale delle superfici e raccordi sullo scheletro verificati.
Regressioni finali Ranger/Giardino su desktop/mobile passate, zero errori o
richieste esterne. Manifest, screenshot e rapporti in assets/skills-visual-pass/.
Lo studio del personaggio include riproduzione opt-in dei movimenti.

Valutazione artistica ancora aperta: nessuna approvazione del proprietario o
risposta di Claude presunta. Modello generico invariato e ancora insufficiente.
Nessuna nuova immagine generata o asset acquistato. Teaser rimane sospeso.
File del blocco liberi, esperimenti cinematografici precedenti lasciati fermi.


## Daria — prova di geometria attiva

Il proprietario chiede di provare a migliorare il personaggio e mostrare il
risultato. Nuovo daria-refined.glb derivato dalla base CC0: giacca/harness,
capelli raccolti/treccia e sciarpa originali, ritocco topologia della testa;
texture del volto originale mantenuta. Mantello volumetrico più corto e
materiali distinti. Variante base conservata per confronto a stessa camera/luci.
Script prepare-daria-refined.py, ranger-fabric.js, variante del loader e studio.
Verifica visiva in corso; test integrati pendenti. Nessun push/deploy o trailer.

## Cambio di priorità del proprietario — contenuti

La prova Daria 3f10905 è ancora giudicata molto lontana dal desiderato. Fermo
il lavoro artistico; geometrie conservate come provvisorie, immagini/report in
assets/daria-trial. Nessuna approvazione artistica. Il proprietario chiede trama,
combattimento, artefatti, tecniche e mondo aperto, con verifiche visive continue.

Blocco attivo: Sigillo di Liora, due scelte opzionali prima del Custode, effetto
su schivata d'impatto e checkpoint v3 compatibile v1/v2. 105 test e UI dedicata
passati; percorso completo con scelta nel ricordo e Giardino ancora da verificare.
Spec: ARTIFACT_01. Espansione del mondo proposta in WORLD_AND_PROGRESSION, non
nuove mappe già presenti. Nessun push, deploy, spesa o teaser.


## Sigillo — verifica conclusa (2026-11-11 UTC)

Checkpoint applicativo c4a2d88. 105 test, build, UI dedicata desktop/mobile,
episodio completo e Giardino passati. V3 conserva scelta opzionale, compatibile
con v1/v2 senza riscrittura alla lettura; bonus temporanei esclusi. Scelta nel
ricordo non salvata prima della conferma. Evidenze in assets/artifact-pass/.
Prima esecuzione episodio concorrente con Giardino: timeout prima del ricordo.
Ripetizione isolata passata su entrambe le dimensioni, inclusi fallback storage;
causa del primo timeout non accertata. Nessuna correzione gameplay per nasconderlo.
Screenshot verificati per leggibilità di scelte e HUD; non approvazione grafica.

Solo due aree giocabili. WORLD_AND_PROGRESSION propone le Cave dei Sussurri come
prossimo ciclo completo; non dichiara nuove mappe o cooperativa implementate.
Grafica/teaser sospesi, nessun push, pubblicazione, spesa o risposta di Claude.


## Cave — implementazione e revisione proposta a Claude

11 novembre 2026: checkpoint iniziale 4783317, poi rifiniture locali. Terza area
con lente, ritorno, Guardiano del rintocco e v4 compatibile v1/v2/v3. 111 test e
build passati; Cave complete su desktop/mobile con verifica paesaggio. Giardino
e UI salvataggi passati anch’essi su desktop/mobile, zero errori/richieste
esterne. Rapporti e catture in assets/caves-pass/.
Primo runner corretto perché attendeva una camminata dopo la ripresa alla soglia;
la schermata già mostrava il dialogo di completamento. Nessuna cura nei viaggi.

Frontend-design: bersagli touch 44 px e separazione missione/joystick; performance:
radice Cave creata al primo ingresso, statica raggruppata e riuso. Nessun cambio
alla resa artistica respinta o ai modelli. Dati locali non autorevoli per premi.

Claude previsto alle 11 dal proprietario, disponibilità non verificata. Leggere
START_HERE, HANDOFF, ARTIFACT_01, CAVES_01; rispondere con problema narrativo,
strategia dominante riprodotta e proposta piccola. Nessuna risposta presunta,
nessun push, deploy, pubblicazione, servizio esterno o spesa.


## Richiesta di collegamento automatico e revisione UX

Il proprietario autorizza a creare il collegamento se possibile e continuare
il gioco. Nessun connettore, CLI, binding o trasporto Claude disponibile: skill
e coda locale predisposte, non dichiarate connessione remota. Nessuna installazione
non verificata o chiamata API. Prove simulate separate dal funzionamento reale.

Obiettivi conclusi corretti; ingresso Cave leggibile; messaggi mobile separati
dalla missione. 117 test e percorso Cave desktop/mobile passati. Ulteriore
correzione CSS dopo ispezione della missione espansa: layout Giardino/Cave passato
a 390×844 e 360×740, uscita scorribile e nessuna sovrapposizione messaggio/HUD. Nessun parere attribuito a Claude; richieste locali non inviate.

La prima creazione di richiesta ha rifiutato CAVES_01 per una whitelist senza
cifre: corretto il filtro e aggiunto il caso ai test. Richiesta successiva
accodata localmente; deliveredToClaude=false. Attesa preferenza del proprietario
fra nuova sessione Claude Code e conversazione web esistente. Nessun nuovo
collegamento dichiarato attivo.

## Sincronizzazione richiesta per il rientro di Claude

Il proprietario richiede di rendere reperibili i file dell'ultimo prompt. Tutto
il lavoro applicativo e la guida sono già nei commit locali fino a 220462d.
Autorizzata la sincronizzazione del ramo mythwood/collaboration-base; main,
deploy, servizi esterni e spese esclusi. Esito remoto verificato nel messaggio
di consegna dopo il push, non presunto da questo checkpoint. Esperimenti
cinematici e skill installate non tracciati preservati e non inclusi.

## Esito Codex — incarico regressione e misure concluso

Due regressioni complete, prima originale poi runner corretto, passate su
desktop/mobile con la stessa build. 117 test passati; riproduttore di stallo
controllato passato. Vecchia causa storica non accertata: documentata fragilità
del gesto a tempo reale, nessun timeout aumentato o modifica del gioco.
62 scenari Custode/Sentinella ripetuti identici; numeri e controesempi in
PEER_REVIEW, evidenze in assets/peer-review-pass. File riservati a Tonino
confrontati byte per byte con 6ef6174: invariati.

Decisione: problemi/candidati di bilanciamento registrati, nessuna correzione
applicata o PR Tonino approvata senza consegna. Prossimo passo: revisione della
PR Rintocco quando il proprietario la segnala. Nessun merge main, deploy, social,
spesa o produzione. Ramo condiviso aggiornato con commit di verifica.


## Mandato demo, video e sito

Il proprietario richiede demo, video per i social e sito; conferma GitHub Pages
come hosting. Questo riapre la preparazione del materiale promozionale e autorizza
la messa online del sito richiesto, senza merge su main, spese o modifiche a
Supabase. La pubblicazione dei post non fa parte di questo blocco. Token API
GitHub non valido: invio Git disponibile, configurazione Pages da verificare
nell'account del proprietario. Bundle di Tonino ancora mancante: file riservati
intatti, niente ricostruzione del Rintocco. Video nuovo da gioco reale, separato
dagli esperimenti cinematografici vecchi non tracciati.

## Esito consegna sito/demo/account/cookie

Sito multipagina, demo con riepilogo e video reali pronti; 126 test e controlli
browser documentati in DEMO_LAUNCH. Cookie con opt-in/revoca per memoria ruolo;
account simulati, nessuna registrazione reale o progetto creato. Il proprietario
ha scelto progetto Supabase nuovo e confermato GitHub Pages, DNS verso
nocciolinatanaai.github.io. API GitHub non valida: resta la selezione del ramo
Pages nell'account; il push del ramo compilato non prova che il dominio sia attivo.
Nessun social, spesa, vecchio Supabase o file Tonino toccati. Proposta economica
Codex: ridurre il perimetro prima di espandere contenuti, senza inventare incassi.

## Invio finale verificato

Push atomico riuscito: sorgenti 8052ae6 e build 6cfa401 su mythwood/pages,
verificati con ls-remote. Il Reel è scaricabile da raw.githubusercontent.com
(HTTP 200). Dominio e API GitHub negati dal proxy Cloud (CONNECT 403): non è
una risposta del sito, né permette di concludere che il token sia realmente
non valido. Resta la selezione del ramo in Pages e la verifica pubblica da
un ambiente con accesso. Il nuovo progetto Supabase non è ancora configurato.

## Correzione del mandato e critica della presentazione

Il proprietario chiarisce: Codex e Claude sviluppano entrambi; Claude gestisce
anche pubblicazioni e social. Nessuna separazione esclusiva delle competenze.
Video respinto per scatti, mostro, animazioni, controlli e testi poco chiari.
Codex ritira il Reel dalla presentazione nei sorgenti; Claude deve applicare
l'aggiornamento alla pubblicazione. Riferimenti richiesti: Solo Leveling e
Signore degli Anelli come atmosfera/leggibilità, senza riprodurre personaggi.
Custode rifatto come guardiano del sigillo con pose di carica/colpo/recupero.
File Tonino e regole combattimento restano invariati; approvazione artistica
non presunta. Nessun nuovo video promozionale finché non verificato.
