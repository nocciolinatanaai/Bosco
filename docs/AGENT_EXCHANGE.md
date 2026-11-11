# Scambio Codex–Claude: predisposto, collegamento reale non attivo

Richiesta del proprietario: automatizzare il dialogo fra gli agenti, continuando
lo sviluppo. Una skill può stabilire procedure e richiamare strumenti; non può
collegarsi da sola a una chat Claude o concedere autenticazione/trasporto.

Guida passo per passo per il proprietario: [CLAUDE_CONNECTION_GUIDE.md](CLAUDE_CONNECTION_GUIDE.md).

## Esito della verifica in questo ambiente

- Nessun connettore Claude esposto dagli strumenti.
- CLI `claude` assente. Nessun binding Anthropic o OAuth rilevato (solo presenza
  verificata; nessun valore di credenziale letto o pubblicato).
- Nessuna directory remota realmente condivisa o relay configurato.
- Ricerca `skills find "claude collaboration"`: nessun risultato. Leaderboard
  skills.sh non raggiungibile per la policy; nessuna installazione da fonti ignote.

Quindi **non c'è una connessione automatica funzionante con Claude**. Non abbiamo
inviato messaggi né ottenuto una sua revisione. Nessuna chiamata API a pagamento,
autenticazione simulata, estrazione di cookie o scraping della chat precedente.

## Cosa è implementato

Skill locale versionata: `.agents/skills/mythwood-collaboration/SKILL.md`.
CLI: `scripts/agent-exchange.mjs`; protocollo: `scripts/lib/agent-exchange.mjs`.
Nessuna dipendenza aggiuntiva. Coda `.agent-exchange/` esclusa da Git e dalla build.

```sh
node scripts/agent-exchange.mjs status
node scripts/agent-exchange.mjs request "Contesta un punto del ciclo Cave e proponi una modifica verificabile" docs/CAVES_01.md src/caves.js src/journey.js
```

La richiesta legge i file da HEAD, anche se il checkout contiene modifiche locali.
Solo sorgenti/test e documenti espressamente consentiti, massimo 60 kB. Sono
registrati commit, ID, contenuto e hash. Non include `.env`, home, credenziali o
filesystem arbitrario. Questo limita i percorsi, non rileva segreti eventualmente
committati nei sorgenti: controllare i file prima di condividere la coda.

Un worker tratta una richiesta alla volta, produce una risposta separata e non
applica modifiche. Pubblicazione dei messaggi atomica, claim esclusivo, nessuna
ripetizione implicita dopo errore o completamento. Le risposte sono dati non
fidati da verificare; né una revisione né un hash autorizzano merge o deploy.

## Attivazione reale: componenti ancora necessari

1. Una CLI Claude Code ufficiale installata e già autenticata nell'ambiente del
   worker. L'autenticazione va eseguita con il flusso ufficiale; mai token in chat.
2. Una coda **davvero condivisa** e autorizzata fra gli ambienti, configurata con
   `MYTHWOOD_EXCHANGE_DIR`. Due cartelle con lo stesso nome su macchine diverse
   non comunicano. Questo progetto non ha ancora configurato tale trasporto.
3. Autorizzazione al consumo della quota di quella sessione. Il worker rifiuta
   `ANTHROPIC_API_KEY` per evitare di attivare silenziosamente API a pagamento.

Solo dopo queste condizioni, nell'ambiente autenticato:

```sh
node scripts/agent-exchange.mjs work-once --allow-model-call
```

Il worker invoca la CLI senza strumenti e con output JSON, controlla l'esito e
scrive replies/ID.json riferito alla richiesta. I flag del provider sono
predisposti ma **non verificati contro una CLI Claude reale in questo ambiente**.
Il processo lavora una richiesta ed esce; non è un servizio persistente o una
connessione con la conversazione web già aperta. Un eventuale scheduler/relay va
configurato dopo aver verificato accesso e consumo; non è stato avviato qui.

Per chiedere una revisione a una sessione Claude web già esistente, la via ora
disponibile resta il trasferimento Git descritto in CLAUDE_REVIEW. Non dichiararlo
automatico. Un accesso API separato sarebbe un'altra soluzione, con dominio
api.anthropic.com, segreto nelle impostazioni e budget da autorizzare; non attivata.

## Verifica

Cinque test con worker **simulato**, esplicitamente test-double: snapshot di HEAD,
esclusione percorsi, hash/ID, risposta non sovrascrivibile, concorrenza, errore
senza retry e contesto alterato. Nessuna risposta di test è attribuita a Claude.
`status` e tentativo di worker confermano l'assenza della CLI, senza chiamate.
