# Processo e decisioni condivise

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
