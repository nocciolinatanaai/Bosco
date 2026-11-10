# Il sentiero ricorda — scoperta dopo il Custode

10 novembre 2026, Codex. Estensione giocabile del sentiero già presente, nella
stessa scena. Non è una seconda regione in streaming o il mondo vasto richiesto.

## Scopo

Dopo la vittoria restava un corridoio vuoto. Ora il giocatore può usare il potere
appena ottenuto anche per esplorare: tre segni ricostruiscono una pista di Liora.
La firma Cartiglio introduce una domanda narrativa concreta; è un nome proposto
nel prototipo, non una gilda di giocatori o un antagonista già implementato.

## Regole implementate

- Le tracce compaiono soltanto dopo risveglio e sconfitta del Custode.
- Tre segni ordinati lungo il sentiero orientale: x 24,5 / 31,5 / 38,5, z 7.
- Scattare entro 2,3 unità dal segno attivo lo fa risuonare. Conta il punto di
  partenza dello scatto: attraversare il segno da lontano non equivale ad attivarlo.
- Il costo resta 30 vigore e il recupero dello scatto resta valido. Tutte le sei
  classi possono completare la sequenza; nessuna classe specifica è obbligatoria.
- Ogni traccia viene raccolta una volta, la conclusione una volta. Nessuna moneta,
  acquisto, ricompensa economica o scrittura sul backend.
- Il segno corrente è più luminoso, quelli ricostruiti cambiano aspetto e la
  linea del percorso si accende progressivamente. I segnali restano in Leggera.
- Al terzo segno una breve scena rivela il marchio Cartiglio. È una pista verso
  i compagni, non la loro salvezza già conclusa o un nuovo capitolo completo.

Il pulsante nella missione (oppure F) segue la traccia attiva usando lo stesso
movimento vincolato del giocatore. Movimento manuale o pausa interrompono il
percorso: non è un teletrasporto. Da vicino il pulsante attiva lo scatto e ne
rispetta risorse/recupero; il giocatore può usare anche i comandi normali.
Il focus torna al canvas per evitare che Spazio riattivi il pulsante di navigazione.

Senza autosalvataggio il nuovo tentativo riparte da zero. Con il salvataggio
locale attivo si riprende dall’ultima tappa; vedi LOCAL_CHECKPOINTS.md.

## File e verifiche

src/trail.js contiene dati e regole; combat.js collega lo scatto; journey.js
aggiorna obiettivo e testo; visuals/memory-trail.js crea una vista riutilizzabile.
Runtime/UI collegano guida e navigazione. Nessun nuovo servizio o dipendenza.

Test: ordine, vicinanza, coordinate non finite, gated progression, tutte le
classi, vigore, conclusione unica, limiti del corridoio, riavvio indipendente e
vista senza nodi aggiunti a ogni frame. Il browser deve percorrere e attivare
le tre tracce dopo il boss; esito finale in HANDOFF.md.

## Revisione richiesta

Una persona capisce che deve usare la risonanza? Il pulsante aiuta senza togliere
il piacere di scoprire? I tre segni raccontano abbastanza o sembrano una raccolta
ripetitiva? Prima di estendere la mappa, verificare queste domande e la pista
narrativa con Tonino; nessuna risposta o prova umana ancora disponibile.
