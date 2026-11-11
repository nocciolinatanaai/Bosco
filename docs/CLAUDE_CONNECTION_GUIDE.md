# Collegare Claude a Mythwood: guida operativa

Stato: ponte locale predisposto e testato con un worker simulato; nessuna
connessione Claude reale verificata. Questi passi richiedono una nuova sessione
Claude Code. Non collegano né importano automaticamente la vecchia conversazione
web di Tonino: il contesto verrà dai file del repository.

## 1. Scegliere dove gira Claude

Percorso consigliato: Claude Code nello **stesso ambiente Cloud di Codex**, con
lo stesso checkout /workspace/Bosco. Così i due agenti possono leggere la stessa
coda locale, senza server pubblici, webhook o sincronizzazione fra macchine.

I comandi sotto vanno eseguiti nel terminale dell'ambiente di sviluppo, non nel
terminale dell'iPhone. Codex può eseguire installazione e controlli; al proprietario
rimangono il login ufficiale e la scelta del consumo della propria quota.
Non è necessario attivare Canva o altri plugin per questo collegamento.

Se deve essere proprio la chat Claude web esistente, fermarsi qui: il ponte
attuale non la può pilotare. Rimane il passaggio di consegne tramite repository
oppure bundle, descritto in CLAUDE_REVIEW.md.

## 2. Preparare rete e CLI ufficiale

Nelle impostazioni dell'ambiente verificare accesso a registry.npmjs.org per
l'installazione, claude.ai per il login e api.anthropic.com per le richieste al
modello. I primi due host sono già nella configurazione osservata; il dominio
API non risulta abilitato nella configurazione verificata durante questo blocco.
Il flusso ufficiale potrebbe reindirizzare il login ad altri host: aggiungere
quelli effettivamente richiesti, se bloccati. Non disabilitare TLS o i controlli
di rete e non inserire cookie/sessioni della vecchia chat.

Installazione locale della CLI ufficiale, separata dalle dipendenze del gioco:

```sh
npm install --prefix /workspace/claude-tools @anthropic-ai/claude-code
export PATH="/workspace/claude-tools/node_modules/.bin:$PATH"
claude --version
claude --help
```

Questa installazione non è stata eseguita. Verificare i comandi supportati dalla
versione effettivamente installata prima di procedere. Ripetere l'export PATH
nelle nuove sessioni shell; non è una modifica persistente all'ambiente.

## 3. Accedere con il proprio account

```sh
cd /workspace/Bosco
claude
```

Seguire il login guidato ufficiale mostrato dalla CLI. Aprire sul proprio
browser il link fornito e completare personalmente l'accesso. Se un ambiente
remoto richiede un codice, inserirlo nel terminale del flusso ufficiale, non
incollarlo in questa chat. Non condividere password, token o cookie.

Scegliere l'accesso con l'abbonamento Claude Code se il proprio piano lo include.
Se viene proposta fatturazione API separata, non abilitarla implicitamente:
richiede una scelta esplicita di budget. L'abbonamento non elimina i limiti di
utilizzo: se la quota settimanale è ancora esaurita, il ponte non la aggira.
Dopo il login uscire dalla sessione interattiva prima di lanciare il worker.

## 4. Controllare il ponte

Nella stessa shell e nello stesso checkout:

```sh
node scripts/agent-exchange.mjs status
```

Il campo claudeCliInstalled deve diventare true. Questo verifica soltanto che
la CLI risponde a --version: **non dimostra login riuscito o modello disponibile**.
Il campo liveConnectionVerified resta false perché status non effettua una
chiamata al modello. Nessuna autenticazione è deducibile da quel comando.

La coda predefinita è /workspace/Bosco/.agent-exchange. Se entrambi lavorano
nello stesso ambiente e checkout, non serve impostare un trasporto remoto.
Non aprire porte e non pubblicare questa cartella.

## 5. Eseguire una prima revisione reale

Il seguente comando crea una richiesta locale con i file della versione
committata, non con modifiche ancora da salvare:

```sh
node scripts/agent-exchange.mjs request "Esamina il ciclo delle Cave: un problema concreto e una modifica verificabile" docs/CAVES_01.md src/caves.js src/journey.js
```

Il risultato queued-locally non significa che Claude abbia ricevuto qualcosa.
Esiste già una richiesta locale del blocco precedente: prima di aggiungerne
altre, controllare requests/ e replies/ per non accumulare revisione duplicata.

Solo quando il proprietario ha autorizzato l'uso della quota della sessione:

```sh
node scripts/agent-exchange.mjs work-once --allow-model-call
```

Questo comando **consuma una richiesta al modello**, se accesso e quota lo
consentono. Il ponte rifiuta ANTHROPIC_API_KEY: non rimuoverla per nascondere una
configurazione API; verificare invece come è autenticata la CLI.
Il worker è predisposto per una revisione senza strumenti o modifiche al gioco.
I suoi flag non sono ancora stati verificati contro una CLI Claude reale qui:
confrontarli con --help e correggere eventuali incompatibilità prima dell'uso.

Esito atteso: reply-recorded con ID e commit. La risposta è in
.agent-exchange/replies/ID.json. Per considerare il primo collegamento riuscito,
controllare provider=claude-code-cli, requestSha256, commit e testo ricevuto.
Il provider viene assegnato dal worker locale, non è una firma crittografica del
servizio. Codex deve poi esaminare la revisione: nessuna patch viene applicata
automaticamente e nessun parere autorizza deploy o spese.

## 6. Distinguere collegamento e automazione continua

work-once tratta una richiesta ed esce. Dopo la prima risposta reale, Codex può
richiamarlo durante il lavoro per chiedere altre revisioni, entro la quota
concordata. Non significa che i due agenti restino attivi quando la chat è ferma.

Uno scambio continuo senza intervento richiede un worker persistente/scheduler,
limiti di richieste e consumo, arresto e gestione degli errori. **Non è ancora
implementato né avviato.** Configurarlo soltanto dopo la prima prova reale.
La skill da sola non mantiene in vita un processo Cloud o una sessione chat.

## Problemi frequenti

| Risultato | Passo successivo |
| --- | --- |
| Claude CLI assente | Controllare installazione e PATH nella stessa shell del worker |
| Login richiesto | Ripetere il login ufficiale nell'ambiente dove gira il worker |
| Quota esaurita | Attendere ripristino o scegliere esplicitamente un altro budget; non esiste bypass |
| Dominio negato | Abilitare l'host indicato dall'errore nelle impostazioni e ritentare con una nuova connessione |
| API a consumo rilevata | Verificare configurazione di autenticazione e budget, senza esporre la chiave |
| status dice false ma la CLI esiste | liveConnectionVerified non è un controllo di login: serve la prima risposta reale |
| empty | Non ci sono richieste disponibili; quelle fallite possono avere un claim |
| Worker fallito | Leggere claims/ID.json.failed; correggere la causa prima di rimuovere deliberatamente il claim e riprovare |
| Claude è su un'altra macchina | La cartella locale non è condivisa: serve ancora un trasporto reale, non basta lo stesso nome del percorso |

Se il fallimento avviene dopo l'invio al modello, una risposta non registrata
potrebbe comunque avere consumato quota: niente tentativi ripetuti alla cieca.
Non condividere l'intero archivio di autenticazione per diagnosticare un errore.

Riferimenti del progetto: AGENT_EXCHANGE.md per il protocollo, HANDOFF.md per lo
stato del gioco, .agents/skills/mythwood-collaboration/SKILL.md per le istruzioni
agli agenti. Nessuna installazione, login o chiamata reale eseguiti da questa guida.
