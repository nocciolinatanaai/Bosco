# Monitor delle consegne — ambiente di Tonino (Claude), capacità verificate

Tonino, 2026-11-11. Complemento a docs/AGENT_MONITOR.md di Codex (74c682e), che resta
la procedura comune. Qui c'è solo ciò che esiste **davvero** nell'ambiente di Tonino
(sessione Claude Code in cloud), verificato oggi.

## Cosa funziona (verificato)

| Capacità | Verifica | Limiti |
| --- | --- | --- |
| **Attività programmata che risveglia questa sessione** | Il controllo "Controllo PR Bosco #1" è scattato da solo alle 22:33 UTC e ha avviato un turno di Tonino. Ora è attivo "Monitor consegne MYTHWOOD", **ogni ora** al minuto 30, ora di Roma (richiesta del proprietario) | Intervallo minimo di circa un'ora. Ogni risveglio è un turno di Tonino, quindi consuma quota. Funziona finché la sessione esiste; il contenitore può essere ricreato, e allora il clone e lo stato locale del monitor vanno ricreati (lo prevede il testo dell'attività) |
| **Eventi GitHub delle PR** | Sulla PR #1 sono arrivati da soli i controlli completati e l'integrazione (`pull_request.closed`), che hanno risvegliato la sessione. La PR #2 è sottoscritta | Solo per le PR sottoscritte: un push diretto sul ramo condiviso non genera eventi, e per questo serve il controllo periodico |
| **Notifica push al proprietario** (`PushNotification`) | Prova inviata l'11/11 alle 23:28 UTC, risposta "Mobile push requested" | La consegna al telefono dipende dalle impostazioni dell'app del proprietario: non verificabile da qui. Se il proprietario è già davanti alla sessione, la notifica viene saltata |
| **Monitor di Codex** (`scripts/delivery-monitor.mjs`) | Eseguito su questo clone: baseline registrata, seconda lettura `unchanged` | Stato in `.agent-exchange/` (ignorato da Git), perso se il contenitore viene ricreato |

## Cosa NON esiste (da non dichiarare)

- Nessuna connessione diretta alle chat di Codex: Tonino non scrive a Codex e non lo
  risveglia. Il canale resta il repository (commit, HANDOFF, PEER_REVIEW, PR).
- Nessuna "risposta automatica di Codex": un nuovo commit va letto e valutato da un turno attivo.
- Nessuna GitHub Action schedulata creata: concordo con Codex che richiederebbe il ramo
  predefinito e un mandato che non abbiamo.

## Procedura che l'attività programmata esegue

Ogni ora, nel clone `/home/user/nocciolinatanaai/bosco`:
1. Se c'è lavoro locale aperto, non cambia il checkout. Poi esegue `node scripts/delivery-monitor.mjs`.
2. Se non è cambiato nulla, termina **in silenzio**: nessuna notifica, nessun messaggio.
3. Se c'è una nuova SHA (ramo condiviso, `codex/*`, PR):
   - legge HANDOFF, PEER_REVIEW e i documenti indirizzati a Tonino;
   - risponde e prosegue entro gli incarichi registrati, su un ramo `tonino/*`, con test,
     commit, push e PR;
   - registra in HANDOFF la SHA esaminata.
4. **Notifica il proprietario solo** per:
   - una DECISIONE PROPRIETARIO, con problema, opzioni e raccomandazione;
   - un accesso mancante indispensabile;
   - un blocco che ferma il lavoro.
5. Nessun merge automatico, deploy, social, spesa o Supabase. Le riserve dei file e il
   mandato di rilascio restano quelli registrati.

Per fermarla: il proprietario può chiederlo in chat, oppure disattivare l'attività
"Monitor consegne MYTHWOOD" dall'elenco delle attività programmate.
