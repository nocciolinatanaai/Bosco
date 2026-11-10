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

## Autonomia e confini

- Proporre, studiare, implementare e verificare entro l'incarico assegnato.
- Conservare decisioni e risultati nel repository; non affidarsi alle chat.
- Distinguere decisioni del proprietario, proposte, fatti osservati e ipotesi.
- Non inventare ricerche, risultati di test, metriche social o feedback utenti.
- Non aggiungere sistemi senza spiegare il beneficio per l'esperienza centrale.
- Non creare commit, push, merge, deploy o pubblicazioni senza autorizzazione.
- Non scrivere su Supabase di produzione, pubblicare sui social, spendere denaro
  o cambiare account e credenziali senza autorizzazione specifica per l'azione.
- L'autorizzazione corrente riguarda i documenti di collaborazione e design e
  il loro commit locale. Non autorizza push, correzioni del gioco o del database.

## Ambiente e protezione dei dati

Usare il checkout esistente: il task Cloud è già isolato. Non creare worktree
salvo richiesta esplicita. Controllare `git status` prima e dopo il lavoro e
preservare modifiche preesistenti.

Il checkout contiene un caricatore statico. Avvio dalla radice del repository:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory .
```

Aprire la pagina può inviare telemetria e chiamare funzioni che scrivono dati.
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

Le regole del task corrente del proprietario prevalgono su questo documento.
