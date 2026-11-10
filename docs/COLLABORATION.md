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
