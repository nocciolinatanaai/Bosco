# Attivazione del sito su GitHub Pages

Il proprietario conferma GitHub Pages e il record DNS verso
nocciolinatanaai.github.io. Nel ramo di build il file CNAME contiene mythwood.it,
non il target DNS. Il dominio è già dichiarato nel repository; non abbiamo
modificato i DNS o verificato tutti i record del registrar.

## Operazione preparata da Codex

Build multipagina: / sito, /demo.html gioco, /account.html accesso.
Il ramo mythwood/pages contiene soltanto dist compilato, .nojekyll e CNAME;
nessun sorgente, test, segreto o vecchio caricatore. Nessun merge su main.
Il ramo è generato con node scripts/prepare-pages.mjs dopo npm run build;
lo script non cambia il checkout e non effettua push automaticamente.

## Passaggio nelle impostazioni del proprietario

Aprire https://github.com/nocciolinatanaai/Bosco/settings/pages con il proprio
account. In Build and deployment:

1. Source: Deploy from a branch.
2. Branch: mythwood/pages.
3. Folder: / (root).
4. Save.
5. Custom domain: verificare mythwood.it. Lasciare completare i controlli DNS e
   il certificato, poi usare Enforce HTTPS quando disponibile.

La verifica API non è disponibile: gh auth status segnala accesso non valido,
ma successive richieste senza credenziali ad api.github.com sono negate dalla
policy Cloud (CONNECT 403). Non possiamo distinguere validità del token e
blocco di rete. Codex ha inviato i commit via Git ma non ha verificato/cambiato
questa impostazione. Se la sorgente è
ancora main, il sito pubblico resta quello precedente finché non selezioni il
ramo corretto. La presenza di un ramo remoto non dimostra una pubblicazione live.

## Verifica dopo la pubblicazione

Aprire https://mythwood.it e controllare titolo MYTHWOOD · Segui le voci,
Gioca la demo → /demo.html, account → /account.html, video riproducibile, link di
ritorno e assenza di errori anche da telefono. Un loopback Cloud non è un link
apribile dall’iPhone. Verificare l'esito Pages/Actions nel repository se compare
404 o il sito precedente; considerare cache e tempi effettivi del servizio senza
promettere un tempo di attivazione.

Registrazione email/Google resta inattiva fino alla configurazione del nuovo
progetto: ACCOUNTS_SETUP.md. Non pubblicare la CTA social prima della verifica
reale. Per aggiornare in seguito, compilare dai sorgenti verificati, rigenerare
il ramo e fare push autorizzato a mythwood/pages. Main rimane separata.

## Rami inviati e verificati

Sorgenti applicativi 8052ae6 su mythwood/collaboration-base; build generata
6cfa401 su mythwood/pages. Entrambi i riferimenti remoti confrontati con gli
hash locali dopo push atomico. Il ramo condiviso può avere successivi commit
solo documentali. Download MP4 da raw.githubusercontent.com verificato HTTP 200.
Verifica https://mythwood.it negata dal proxy Cloud (403), non un responso del
sito: attivazione e DNS non possono essere dedotti da quel codice.
