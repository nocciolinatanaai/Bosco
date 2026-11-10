# Collaborazione tra agenti — Bosco / Mythwood

## Mandato

Costruire con il proprietario e Tonino un RPG browser coinvolgente, bello da
vedere e appagante da giocare. L'esperimento originale assegna all'agente
50 giorni e 50 euro, includendo la promozione social. Il pubblico deve poter
seguire e provare il gioco durante lo sviluppo.

Leggere, nell'ordine:
1. `GAME_DESIGN.md`: obiettivi e ipotesi creative.
2. `HANDOFF.md`: stato corrente e consegna.
3. `docs/TECHNICAL_BASELINE.md`: architettura, evidenze e rischi.
4. `docs/BACKLOG.md`: attività e criteri di completamento.
5. `docs/COLLABORATION.md`: processo e registro decisioni.
6. Per il gameplay corrente: `docs/COMBAT_UX.md` e `docs/EPISODE_01.md`.
   Preservare la sequenza echi → ricordo → evoluzione → Custode; motivare
   cambiamenti e aggiornare i test. Il testo di Liora resta una proposta narrativa.
7. Audio e riferimenti: `docs/AUDIO.md`, `docs/RPG_RESEARCH.md` e
   `docs/STORY_BIBLE.md`. Distinguere bozza sonora, fonti promozionali e
   trama proposta da risultati osservati o contenuti già implementati.
8. Per salvataggi e ripresa: `docs/LOCAL_CHECKPOINTS.md`. Conservare opt-in,
   cancellazione selettiva e fallback; non fidarsi dei dati locali per premi online.
9. Per la revisione al rientro di Tonino: `docs/GUARDIAN.md` e
   `docs/CLAUDE_REVIEW.md`. Non dichiarare revisioni o sincronizzazioni inesistenti.

## Autonomia e confini

- Proporre, studiare, implementare e verificare entro l'incarico assegnato.
- Conservare decisioni e risultati nel repository; non affidarsi alle chat.
- Distinguere decisioni del proprietario, proposte, fatti osservati e ipotesi.
- Non inventare ricerche, risultati di test, metriche social o feedback utenti.
- Non aggiungere sistemi senza spiegare il beneficio per l'esperienza centrale.
- Non creare commit, push, merge o deploy senza autorizzazione. Il proprietario
  ha dato autorizzazione continuativa a post e commenti organici sui canali
  Instagram e TikTok del progetto: non richiedere approvazione per ogni contenuto.
  Devono prima essere identificati gli account e disponibili strumenti/accessi
  supportati. Non riguarda account terzi, messaggi privati, inserzioni o spese.
- Non scrivere su Supabase di produzione, spendere denaro o cambiare account e
  credenziali senza autorizzazione specifica per l'azione.
- Il proprietario ha autorizzato documenti e loro commit locale e, successivamente,
  richiesto la riscrittura del gioco e dello store sotto il nome Mythwood.
  Preparare e verificare il nuovo codice localmente; push, deploy, cancellazioni
  di dati e aggiornamenti agli account/store esterni richiedono un mandato operativo.

## Ambiente e protezione dei dati

Usare il checkout esistente: il task Cloud è già isolato. Non creare worktree
salvo richiesta esplicita. Controllare `git status` prima e dopo il lavoro e
preservare modifiche preesistenti.

Il checkout ora contiene un prototipo locale Vite/Three.js. Il precedente
caricatore è conservato solo come testo in legacy/index.html.txt. Avvio:

```sh
npm ci --ignore-scripts
npm run dev
```

Il nuovo client non contatta Supabase; le vecchie versioni possono invece
inviare telemetria e chiamare funzioni che scrivono dati.
`?test=1` non rende l'applicazione isolata. Per test senza effetti su produzione,
intercettare tutte le richieste oppure usare uno staging indipendente.
Non assumere che una funzione chiamata `state` o `get` sia priva di effetti.

Non salvare segreti, token, cookie, dati dei giocatori o valori di variabili
riservate nei documenti. `device` va trattato come credenziale. Le credenziali
amministrative non sono necessarie per leggere il frontend pubblico.

## Verifica e consegna

- Un titolo o una splash visibile non dimostrano il funzionamento del gioco.
- Scegliere verifiche pertinenti; distinguere analisi statica, simulazioni e test reali.
- Per gameplay verificare obiettivo, comprensione dei comandi, feedback e progressione.
- Per grafica raccogliere immagini/video rappresentativi e misurare sui dispositivi dichiarati.
- Per sicurezza e migrazioni usare dati sintetici in ambiente isolato.
- A ogni consegna aggiornare `HANDOFF.md` con file, verifiche, limiti e prossimo passo.
- Non eseguire contemporaneamente incarichi sugli stessi file o sulle stesse risorse.

## Direzione e ascolto dei giocatori

Il proprietario chiede prosecuzione verso il 35–40% e spazio alle richieste del
pubblico: leggere ROADMAP_40.md e PLAYER_FEEDBACK.md in docs/. Non dichiarare
questa stima raggiunta contando commit o test. Codex coordina e integra; Claude
può implementare e contestare con prove. Nessun collegamento automatico alle chat.

## Checkpoint continuativi

Il proprietario richiede commit periodici e aggiornamento dei file condivisi per
non perdere lavoro o contesto quando una sessione raggiunge un limite. Sul ramo
di collaborazione: checkpoint a ogni blocco funzionale e prima di verifiche
lunghe; aggiornare HANDOFF e COLLABORATION, fare commit/push e verificarne l’esito.
Se il lavoro è parziale, chiamarlo checkpoint e dichiarare esattamente i test
pendenti. Non attendere la fine dell’intero progetto per condividere i progressi.
Questo non autorizza merge su main, deploy o scritture su produzione.

## Verifiche correnti

`npm test`: regole di gioco e PostgreSQL WASM con dati sintetici.
`npm run build`: build in dist/. `npm run test:browser`: build e Chromium con
isolamento delle richieste. In Cloud: impostare MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium;
altrove installare il browser Playwright con `npx playwright install chromium`.
Leggere SECURITY.md, docs/EU_READINESS.md e docs/PEER_REVIEW.md prima di abilitare
account, pagamenti o servizi pubblici. Non chiamare il progetto conforme o sicuro
in assoluto sulla base di questi controlli.

## Aggiornamento del mandato — repository condivisa

Il 10 novembre 2026 il proprietario ha autorizzato il caricamento di codice,
documenti e idee nella repository condivisa e la prosecuzione autonoma dei
miglioramenti. Commit e push sul ramo di collaborazione Mythwood sono quindi
autorizzati. Conservare la distinzione fra sviluppo condiviso e rilascio: merge
su main, deploy, SQL di produzione, spese e servizi esterni non sono inclusi.
Leggere docs/IDEAS.md e docs/PRODUCT_REVIEW.md; proseguire con prove e motivazioni.

Le regole del task corrente del proprietario prevalgono su questo documento.
