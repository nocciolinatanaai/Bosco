# Anteprima su iPhone

## Stato

La build del nuovo prototipo è locale. Nessun URL HTTPS pubblico è stato creato.
Gli indirizzi 127.0.0.1/localhost appartengono alla macchina che li apre: da
iPhone non raggiungono il server dell'ambiente Cloud. Una cattura mobile o una
immagine concept non costituisce un'anteprima interattiva pubblicata.

In questa sessione non sono disponibili tool di esposizione porte, preview
pubbliche o deploy. Il desktop Cloud è dichiarato disponibile, ma non ci sono
strumenti di controllo desktop collegati; non può essere usato come link di gioco.

## Pacchetto pronto per un hosting separato

`npm ci --ignore-scripts` seguito da `npm run build` produce dist/. Distribuire
il contenuto di quella directory a un hosting statico HTTPS separato dal sito
in produzione. La base relativa permette l'uso anche sotto un percorso dedicato.

Il pacchetto preparato nella sessione è `/workspace/artifacts/mythwood-preview.zip`.
Contiene soltanto index.html, asset compilati e avvisi di licenza della build.
Il percorso è un artefatto locale, non una URL giocabile. iOS non avvia un sito
completo estraendo semplicemente uno ZIP nell'app File.

Per un caricamento manuale usare un sito preview già controllato dal proprietario
oppure un servizio statico scelto da lui, caricando dist/ o il suo contenuto
secondo le istruzioni dell'hosting. Non distribuire la radice del repository,
fixture SQL, dipendenze, segreti o archivio legacy.

## Verifica dopo la pubblicazione preview

- HTTPS funzionante; index e asset serviti con tipi corretti.
- Se il sito è sotto percorso, nessun 404 sugli asset relativi.
- Avvio e orientamento su Safari/iPhone reale; stato WebGL, pulsanti e dialoghi.
- Nessuna richiesta al backend legacy o a pagamenti.
- Controllare console, errori, frequenza fotogrammi e comportamento in background.
- Se WebGL non parte, raccogliere versione iOS/modello e messaggio: non attribuire
  ogni errore alla rete né dichiarare compatibilità sulla sola emulazione Chromium.

La build ha modelli provvisori, gioco individuale e progressi non salvati. Il
concept approvato resta un riferimento artistico, non una cattura di questa build.
