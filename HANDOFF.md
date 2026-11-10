# Consegna condivisa

Aggiornamento: 10 novembre 2026, Europe/Rome.
Baseline codice: `ac9039ea91983a9586b01eeab4a60a02b5e88b54`.

## Mandato corrente

Il proprietario ha autorizzato documenti di collaborazione e preparazione del
progetto e, successivamente, il loro commit locale. Questa consegna non autorizza
modifiche al gioco, SQL di produzione, push, pubblicazione social, deploy o spese.

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

## Materiale preparato

- `AGENTS.md`: regole per gli agenti.
- `GAME_DESIGN.md`: proposta creativa, storyboard e decisioni aperte.
- `docs/TECHNICAL_BASELINE.md`: architettura e risultati della revisione.
- `docs/BACKLOG.md`: lavoro ordinato con criteri di accettazione.
- `docs/COLLABORATION.md`: consegne, decisioni e messaggio per Tonino.
- `docs/RECOVERY.md`: recupero del sorgente e percorso verso staging riproducibile.

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
Nessun test offensivo o mutazione di dati è stato eseguito.

## Prossima consegna consigliata

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
