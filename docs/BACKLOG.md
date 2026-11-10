# Backlog iniziale

Gli incarichi sotto sono proposte ordinate, non autorizzazioni a cambiare produzione.
Assegnare un proprietario e registrare l'inizio prima di modificare file condivisi.

| ID | Priorità | Attività | Criterio di completamento |
|---|---|---|---|
| R01 | P0 | Ricostruire inventario e sorgenti | Sorgenti esportati/redatti, hash e provenienza; elenco esplicito dei componenti mancanti. |
| R02 | P0 | Preparare staging con dati sintetici | Nessun collegamento scrivibile alla produzione; installazione ripetibile; restore verificato. |
| S01 | P0 | Correggere e verificare login | Test NULL, vuoto, errato, valido, utente inesistente e rate limit in staging; nessun device restituito su errore. |
| C01 | P0 creativo | Ricerca comparativa | 3–5 riferimenti pertinenti, fonti, elementi osservati, costi e applicabilità; nessuna metrica inventata. |
| C02 | P0 creativo | Due trattamenti della stessa scena | Confronto visivo su telefono e PC, licenze/costi dichiarati, direzione scelta e motivazione. |
| C03 | P0 creativo | Prova del ciclo centrale | Un incontro e un potere trasformativo; confronto turni/action limitato; verificare una sinergia fra personaggi. |
| C05 | P0 creativo | Cast e classi | Un personaggio originale proposto per Assassino, Mago, Ranger, Guaritore, Tank e Combattente; motivazione, silhouette, abilità e crescita; verificare autonomia in solo e complementarità. Definire l'ordine di prototipazione senza imporre squadre da sei. |
| C06 | P1 creativo | Antagonisti e bestiario iniziale | Una gilda rivale proposta con motivazioni e personaggi; nemici con comportamenti distinti e un boss leggibile. Separare rivalità narrativa da PvP, ancora non deciso. |
| W01 | P0 tecnico-creativo | Scena nel mondo esplorabile | Tradurre il mockup approvato in una scena giocabile; provare passaggio fra due aree, prestazioni sui dispositivi dichiarati e densità degli incontri. |
| EV01 | P0 creativo | Prima evoluzione | Una trasformazione con aspetto, abilità, prova narrativa e sinergia; verificare prima/dopo giocabile. |
| RW01 | P0 tecnico | Nuova base Mythwood | Sorgente completo versionabile, staging isolato e baseline vecchia recuperabile; sostituzione del codice senza riattivare percorsi legacy. |
| ST01 | P1 prodotto-tecnico | Nuovo store Mythwood | Catalogo deciso, flusso verificato, consegna idempotente e nessun link ai vecchi prodotti; operazioni esterne solo con mandato. |
| CO01 | P0 tecnico | Prova cooperativa isolata | Due client con stato server coerente, riconnessione senza duplicazioni e ricompensa assegnata una volta. Non basta la presenza Realtime. |
| CO02 | P1 | Primo arco di gilda | Missione personale, contributi asincroni e spedizione simultanea collegati; chiarire requisito partecipanti e assenze. |
| S02 | P1 | Revisionare credenziale device e collegamento account | Mappa accessi, flussi recupero/revoca e abusi; piano migrazione compatibile con utenti esistenti. |
| P01 | P1 | Correggere accredito e idempotenza | Test codice nuovo, già usato, concorrente, normale/oro/misto, limiti e retry; verificare Edge Function. |
| D01 | P1 | Definire cancellazione/anonimizzazione | Inventario riferimenti e test che coprano tutte le tabelle coinvolte; allineare informativa e messaggi. |
| G01 | P1 | Allineare mercato e livelli | Regola di prodotto esplicita; test livelli 2, 5, 6, 50, rollback e acquisto concorrente. |
| U01 | P1 | Correggere splash pagine legali | Privacy/termini subito leggibili, nessuna attesa di 60 s, ritorno al gioco verificato. |
| C04 | P1 creativo | Primo episodio | Storyboard implementato, obiettivo capito, conseguenza visibile e chiusura soddisfacente; prova esterna. |
| O01 | P1 | Release e rollback | Artefatto identificabile, hash, procedura approvata, ripristino provato su staging. |
| A01 | P2 | Rate limit admin | Verifica persistenza dei tentativi falliti e comportamento sotto concorrenza in isolamento. |
| G02 | P2 | Regola boss | Chiarire limite giornaliero/settimanale e implementare testo e contatore coerenti. |
| T01 | P2 | Test concorrenza economica | Nessun saldo effettivo sottozero o premio duplicato nelle operazioni scelte. |
| M01 | Dopo C02/C03 | Primi contenuti social | Video del risultato reale, promessa verificabile, invito a provare; pubblicazione solo se autorizzata. |
| M02 | Dopo W01/CO01 | Tre catture verticali | Abilità, cooperazione e scoperta registrate dalla build; bozze testo/account e risultati attesi, secondo SOCIAL_GAMEPLAY.md. |
| EU01 | Prima dei servizi pubblici | Requisiti UE/Italia | Fonti ufficiali aggiornate, applicabilità, operatore e responsabilità documentati; non dichiarare conformità da una checklist. |

## Risultati della prima ricostruzione locale

- RW01 parziale: prototipo Vite/Three.js con lockfile; vecchio caricatore fuori
  dal percorso di avvio. Recupero completo del vecchio sistema ancora mancante.
- S01: bypass riprodotto su PostgreSQL isolato e patch locale testata; non applicata online.
- C03/C05/EV01 parziali: sei kit numerici, prima arena, nemici e risveglio; modelli
  e feedback ancora provvisori. Non equivalgono al cast o all'evoluzione finale.
- P01: diagnosi FOUND ritirata; test del codice originale superati. Edge Function
  e percorso completo pagamenti restano da revisionare.
- CO01/CO02, mondo vasto/streaming, grafica del concept e store: non implementati.
- EU01: registro predisposto, verifica aggiornata delle fonti ancora necessaria.

## Cadenza proposta

- Primo blocco: recupero/sicurezza e ricerca creativa possono procedere in parallelo
  come attività separate, senza agenti simultanei sugli stessi file.
- Entro 2–3 giorni effettivi: confronto visivo e prova dell'incontro centrale.
- Entro circa una settimana: primo episodio breve, solo se verificabile e sicuro.
- Ogni pochi giorni: miglioramento giocabile osservabile; cambiare piano in base
  alle prove. Non attendere il giorno 50 per incontrare il pubblico.
- Tenere un margine finale per compatibilità, prestazioni e continuità del servizio.

## Budget

50 euro iniziali; circa 20 spesi secondo il proprietario. Residuo stimato 30 euro.
Nessun nuovo acquisto autorizzato da questo documento. Prima di una spesa:
descrivere costo una tantum/ricorrente, utilità, alternativa gratuita e impatto
sul residuo. Registrare importo effettivo solo con evidenza del pagamento.

## Completamento di un task

Una consegna deve includere risultato, file, verifiche, limiti e rischio residuo.
"Implementato" non significa "rilasciato"; "simulato" non significa "collaudato
in produzione". Le attività creative richiedono un artefatto valutabile, non
soltanto una lista di idee.

## Studio combattimento e UX — 10 novembre

C03/C05 parziali: aggiunti attacco base/abilità distinti, combo, proiettili,
schivata a vigore, cariche fissate e interruzioni. Pose per tipo di arma,
joystick a due dita e HUD separato; dettagli in COMBAT_UX.md. Il confronto fra
sistemi, sinergie cooperative, bilanciamento umano, audio e animazioni finali
restano aperti. Prossima prova: una persona capisce e usa carica/scatto/apertura
senza spiegazioni; poi misurazione su dispositivi reali.

## Episodio iniziale — avanzamento successivo del 10 novembre

C04/EV01 parziali: guida in base alle azioni, breve memoria narrativa proposta,
risveglio prima del boss e scatto che acquista danno/interruzione. Custode sigillato
fino alla trasformazione; conclusione narrativa alla vittoria. Il percorso è
specificato in EPISODE_01.md. Non completati: validazione umana, evoluzioni di
classe, audio, attacchi distinti del boss, grande mondo e cooperazione. Prossimo
incarico: due comportamenti leggibili del Custode, poi prova con giocatori.

## Custode e base per revisione — 10 novembre

C06 parziale: implementate Frattura e Onda con tempi, centri, pose e segnali
distinti. La geometria del cerchio segue il raggio della mossa. Restano prova
umana, audio e bilanciamento. Prossimo incarico: revisione concreta di Tonino
secondo CLAUDE_REVIEW.md; nessuna sua risposta è ancora presente.

## Audio, ricerca e feedback del tentativo — 10 novembre

Prima bozza sonora originale opzionale, volume/mute e gestione pausa implementati;
validazione artistica e hardware reale ancora aperti. Aggiunto riepilogo della
causa di sconfitta con suggerimento specifico e riprova senza conservare quella
causa. C01 parziale: tre fonti ufficiali lette, ancora senza osservazioni di
sessioni di gioco o ricerca utenti. Proposta di storia in STORY_BIBLE.md.
