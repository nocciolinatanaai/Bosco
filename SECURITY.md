# Sicurezza Mythwood

## Stato reale

Il nuovo client è un prototipo locale senza account, telemetria, backend o
pagamenti. Conserva tappe e tecnica del sigillo solo con salvataggio locale
facoltativo; non memorizza credenziali o bonus di combattimento. Non contatta il vecchio Supabase. Non è il nuovo servizio
online completo. La produzione precedente non è stata modificata.

Il client include una CSP senza esecuzione di stringhe, script remoti o connessioni
esterne. Gli stili inline sono ancora consentiti per i colori delle classi.
Le texture incorporate nel GLB usano URL blob creati localmente: img-src e
connect-src consentono questo schema per il loader Three.js (anche su Safari).
Non sono stati aggiunti host esterni o wildcard alle connessioni.
La CSP in meta non protegge dall'inquadramento in iframe: l'hosting definitivo
deve impostare header appropriati, incluso frame-ancestors. Non dichiarare
sicurezza completa sulla sola base della CSP.

Il server di sviluppo ascolta su loopback. La build pubblicabile contiene solo
dist/, non fixture, documenti, archivio legacy o variabili riservate. Nessun
valore di credenziale server deve essere inserito in VITE_* o nel bundle.

## Difetto login precedente e proposta

`database/proposals/001_login_null_guard.sql` corregge il bypass con password SQL
NULL. È una proposta testata su PostgreSQL WASM isolato, NON applicata online.
Usa input espliciti, confronto IS DISTINCT FROM, riferimenti qualificati e mantiene
la firma. CREATE OR REPLACE preserva i grant osservati; non aggiorna il proprietario.

Prima di un'applicazione reale: confrontare definizione corrente, dipendenze e
ACL, backup, revisione, prova su staging e piano di rollback autorizzato.
Non eseguire i file .baseline.sql su produzione: contengono volutamente codice
precedente usato per riprodurre i problemi su dati sintetici.

La proposta NON risolve: device come credenziale longeva, rate limit distribuito,
attacchi temporali, vincoli di unicità mancanti o flussi account concorrenti.
Il nuovo backend dovrà usare identità e sessioni verificabili lato server;
nessun saldo, ruolo, acquisto o ricompensa sarà autorevole nel browser.

## Correzione del precedente audit sugli acquisti

La diagnosi PAY-01 basata su FOUND era errata. Il codice originale usa
`week_gold := coalesce((select ...), 0)`, non SELECT INTO. Questa assegnazione
non modifica FOUND. I test eseguono il codice fornito dal proprietario con
pgcrypto reale e confermano registrazione del codice oro, retry idempotente,
rifiuto del riuso da altro giocatore e rollback al limite settimanale.

PAY-01 è ritirato; non applicare una migrazione per correggerlo. I test non
convalidano Gumroad, la Edge Function mancante, tutti i vincoli di produzione
o transazioni concorrenti: la revisione del percorso commerciale rimane aperta.

Anche la [documentazione PostgreSQL](https://www.postgresql.org/docs/current/plpgsql-statements.html#PLPGSQL-STATEMENTS-DIAGNOSTICS),
consultata dopo l'abilitazione della rete, conferma quali istruzioni modificano
FOUND: non l'assegnazione in questione. Conservare questa correzione nella consegna.

## Rilascio del servizio online: condizioni necessarie

- Autorizzazione server su ogni mutazione; negazione predefinita e privilegio minimo.
- Rate limit, convalida input, idempotenza e test concorrenti sulle economie.
- Gestione sicura di sessioni, revoca e recupero; nessun device nelle viste pubbliche.
- Inventario dati, basi giuridiche, conservazione e cancellazione verificabili.
- Store e chat disabilitati fino alle rispettive verifiche tecniche e operative.
- Dipendenze fissate, lockfile, audit e revisione delle licenze/asset.
- Ripristino e rollback provati; log redatti e procedura incidenti.

## Segnalazioni

Non pubblicare credenziali o dati dei giocatori nelle issue. Il proprietario deve
ancora scegliere un contatto privato e una procedura di gestione segnalazioni.
Fino ad allora condividere con lui una descrizione redatta nella sessione di lavoro.
