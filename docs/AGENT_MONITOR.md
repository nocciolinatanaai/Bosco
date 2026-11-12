# Scambio con controllo periodico — stato reale

**Stato attuale: risvegli annullati dal proprietario il 12 novembre.** Non
riavviare watch o scheduler. Nessun processo delivery-monitor --watch trovato
attivo al controllo Codex dopo la riapertura dell'ambiente. Le istruzioni di
avvio sottostanti sono conservate come documentazione, non come task attivi.
Claude riferisce una propria attività «Monitor consegne MYTHWOOD»: va
disattivata tramite gli strumenti della sua sessione, non accessibili a Codex.

Il proprietario richiede di ridurre i passaggi manuali tra Codex e Claude e di
essere coinvolto soprattutto nelle decisioni importanti. Fonte condivisa: Git.
Questa sessione non espone scheduler di task AI o notifiche push; non è possibile
programmare un nuovo turno della chat tramite uno script Git.

## Implementato

### Giro notturno richiesto dal proprietario

Per la notte il proprietario chiede frequenza oraria. Comando attuale:

```sh
node scripts/delivery-monitor.mjs --watch --interval-seconds 3600 --cycles 9
```

Un controllo subito e otto successivi, per circa otto ore. Avviato in un processo
separato con log locale `.agent-exchange/monitor/nightly.log` e piano/PID in
`night-plan.json` nella stessa cartella ignorata da Git. Verificare l'esistenza
del processo e le date dei log prima di dichiarare che ha continuato durante
la notte. Non è un servizio installato e non sopravvive alla chiusura dell'ambiente.
Le istruzioni a cinque minuti sotto restano un'opzione, non la frequenza notturna.

Intercettate PR #2 testa 8f485ee e consegna Rintocco 3222cd1: riferimenti
recuperati e documenti letti. Revisioni indipendenti non ancora svolte; non
considerare approvate le misure o le modifiche solo perché il monitor le vede.

```sh
node scripts/delivery-monitor.mjs
node scripts/delivery-monitor.mjs --watch --interval-seconds 300 --cycles 96
```

Il primo comando legge una volta; il secondo controlla ogni cinque minuti per
massimo 96 controlli (circa otto ore). Richiede Node e accesso Git a origin.
Legge SHA e nomi di rami tonino/*, codex/*, mythwood/collaboration-base e teste PR.
Niente fetch/checkout/reset, modifiche al gioco, merge, chiamate AI o spese.

Prima esecuzione: registra la baseline senza interpretare ogni ramo esistente
come una nuova risposta. Le letture successive registrano modifiche/nuove teste
o ref rimossi in .agent-exchange/monitor/events/*.json e stampano JSON su stdout.
Stato e eventi locali sono ignorati da Git. Non contengono credenziali o corpi
di documenti. Un errore di rete non diventa una cancellazione di tutti i rami.
Il lock impedisce controlli simultanei sullo stesso stato. Se un processo muore
lasciando check.lock, verificare che il PID non sia più attivo prima di rimuoverlo.
In caso di crash tra evento e salvataggio baseline può essere emesso un duplicato:
deduplicare per coppia ref/SHA, non assumere consegna exactly-once.

Lo script **non invia notifiche esterne e non avvia un agente**. Un evento resta
unread finché un agente attivo non lo esamina: il nome del ramo non dimostra
l'autore o la qualità del contenuto. Non attribuire risposte automatiche a Claude.
Il processo richiede un ambiente acceso e accesso di rete: sospensione/chiusura
o arresto del runner ne interrompono l'attività. Nessun servizio persistente
installato, nessuna modifica alle impostazioni di avvio dell'ambiente.

## Procedura per entrambi gli agenti, già autorizzata

All'inizio del turno e a ogni checkpoint:

1. Eseguire il controllo singolo e leggere eventi/consegne nuove senza chiedere
   al proprietario di reinoltrare documenti già raggiungibili nel repository.
2. Fare fetch del riferimento necessario, leggere handoff, riserve e prova del
   nuovo commit. Non cambiare checkout con lavoro locale aperto o durante test
   dipendenti dai sorgenti. Le revisioni si riferiscono a SHA precise.
3. Rispondere e proseguire autonomamente entro incarico/autorizzazioni correnti,
   con test e confronto visivo pertinenti. Rami distinti e niente merge automatico.
4. Registrare in HANDOFF la nuova SHA esaminata e la risposta documentata. Ogni
   consegna deve indicare destinatario, domanda, stato e criterio di completamento.
5. Se serve il proprietario, indicare esplicitamente DECISIONE PROPRIETARIO con
   problema, opzioni, raccomandazione e conseguenza dell'attesa. Continuare i
   lavori indipendenti; non trasformare ogni dettaglio tecnico in una richiesta.

Decisioni tipiche da riservare al proprietario: nuove spese, cambi sostanziali
alla direzione del prodotto, accessi/permessi tecnici mancanti, conflitti di
priorità che gli agenti non riescono a risolvere con prove. Rilasci/social già
autorizzati a Claude restano nel loro mandato, non richiedono una nuova conferma
per principio. Le riserve di file e le condizioni del rilascio restano valide.

## Cosa manca per lavorare a chat chiusa

Serve un runner persistente con scheduler capace di avviare task degli agenti,
CLI ufficiali autenticate con la quota autorizzata e un canale di notifica
autorizzato al proprietario. Queste capacità non sono configurate da questo
monitor. La CLI Claude risulta assente nel controllo corrente; non viene
installata o sostituita da una API a pagamento. Non riutilizzare cookie di chat.

Come opzione senza integrazioni nuove, il proprietario può attivare le notifiche
native delle PR in GitHub/GitHub Mobile e seguire le PR di consegna. Un semplice
push al ramo non garantisce una notifica e questo non risveglia Codex/Claude.

Non è stata creata una GitHub Action schedulata: i workflow schedule richiedono
la configurazione sul ramo predefinito e qui non abbiamo esteso il mandato a
main, runner AI o consumi. Non basta aggiungere uno YAML sul ramo collaborazione.

## Prompt breve per allineare Claude

«Leggi docs/AGENT_MONITOR.md e applica il controllo delle consegne all'avvio e
ai checkpoint. Puoi avviare il watch nel tuo ambiente finché resta acceso, ma
non dichiarare una connessione alle chat o un risveglio automatico. Rispondi nel
repository e continua entro il mandato; coinvolgi il proprietario solo per le
decisioni necessarie. Se disponi davvero di scheduler/CLI/canale notifiche,
documentane capacità e limiti prima di attivare un'automazione più ampia.»
