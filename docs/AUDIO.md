# Audio del combattimento — prima prova originale

10 novembre 2026, Codex. Effetti sintetizzati con Web Audio, senza registrazioni,
musica scaricata, voci imitate, richieste remote o nuova dipendenza. È una bozza
sonora funzionale: qualità artistica e ascolto su dispositivi reali da validare.

## Esperienza implementata

Audio disattivato inizialmente. Il giocatore può selezionare «Attiva effetti
sonori» prima di iniziare oppure aprire «Comandi e audio» durante la partita.
Volume iniziale 35%, regolabile 0–100; preferenza solo in memoria di sessione.
Il gioco non chiede accesso al microfono e non salva o trasmette registrazioni.

17 cue originali: fendente, freccia, magia, impatto, critico, danno, protezione,
scatto, risonanza, avviso comune, Frattura, Onda, impatto nemico, cura,
risveglio, conclusione e sconfitta. Gli impatti seguono gli eventi effettivi;
una cura da zero PV non emette il suono di una cura riuscita. Frattura e Onda
hanno avvisi diversi; i segnali visivi e testuali restano disponibili senza audio.

Pause, informazioni, finestre narrative, perdita del fuoco e scheda nascosta
interrompono le voci e sospendono il contesto. Riattivazione da gesto utente;
nessuna coda di vecchi suoni viene riprodotta al ritorno. Il risveglio suona dopo
aver accettato il ricordo; il breve segnale di conclusione dopo «Segui il sentiero».
Se l’API manca o resume viene rifiutato, l’interfaccia lo segnala e il gioco resta
utilizzabile senza audio. Il comportamento Safari fisico non è ancora collaudato.

## Struttura

- audio/cues.js: ricette immutabili e corrispondenza evento/cue.
- audio/synthesis.js: oscillatori, rumore deterministico, filtri, inviluppi e
  compressore del mix; stesso sintetizzatore per runtime e rendering offline.
- audio/index.js: creazione su opt-in, volume, pausa, stop, cleanup e fallback.
- Massimo 12 cue contemporanei, spam della stessa cue filtrato entro 60 ms;
  ogni voce può avere più strati. Nodi scollegati a fine vita o cancellazione.
- Nessuna musica ambientale continua, motore audio terzo o worker aggiunto.

## Verifiche

`npm test`: opt-in, pausa, riattivazione, volume zero, limiti e fallback con
contesto controllato. Non è una prova di generazione sonora reale.

`npm run test:audio`: harness isolato Chromium con OfflineAudioContext. Tutte
le 17 cue generano campioni finiti, segnale non nullo e coda silenziosa; volume
zero e cancellazione producono silenzio. Verificati gesto reale e fine delle
voci con AudioContext nativo. Genera test-results/audio-report.json e una breve
raccolta WAV per ascolto: nessun microfono o acquisizione dell’audio del computer.
Una copia della bozza e del rapporto è in docs/assets/audio/. Il runner non
dimostra che il suono sia piacevole o distinguibile dal pubblico.

Il runner del gioco verifica opt-in, pausa, mute/riattivazione e controllo volume
con tastiera, oltre al percorso completo. Risultati correnti in HANDOFF.md.
La CI include un job audio Chromium: stato remoto da verificare, non dedotto
dalla riuscita locale.

## Prossima revisione

Ascolto comparativo, bilanciamento dei livelli, frequenze affaticanti, chiarezza
nei combattimenti affollati e Safari/iPhone fisico. Decidere quali cue mantenere
e quali sostituire con sound design rifinito. Non usare il WAV come colonna sonora
promozionale o dichiarare definitivo il risultato.
