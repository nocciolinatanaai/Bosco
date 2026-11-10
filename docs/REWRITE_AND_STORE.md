# Mythwood — riscrittura e store

## Decisioni ricevute

- Nome unico: **Mythwood**. Il CNAME attuale contiene già `mythwood.it`.
- Sostituire completamente il vecchio codice con la nuova implementazione.
- Sostituire lo store collegato alla vecchia esperienza.
- Il proprietario conferma che non ci sono acquisti reali pregressi.
- Evoluzioni dei personaggi centrali, con cambiamenti visivi e di gioco.

## Sostituzione del programma

Preparare un nuovo sorgente autorevole versionato nel repository: client,
configurazione pubblica, backend, migrazioni e test. Non usare il record world.app
come unica copia editabile del gioco. Scegliere toolchain dopo una prova grafica
e cooperativa sui dispositivi di riferimento; non fissarla sulla base del mockup.

Conservare una baseline recuperabile prima della rimozione: Git attuale non
contiene il programma remoto, gli asset completi o la configurazione backend.
L'archivio va separato dal percorso eseguibile: il nuovo gioco non deve caricare
vecchi script o offrire per errore il vecchio catalogo.

Ordine proposto:
1. Inventario e copia redatta dei sorgenti/configurazione/asset necessari.
2. Nuova implementazione locale e staging isolato; nessun delete/reset in produzione.
3. Prova visiva, missione, cooperazione ed evoluzione rappresentative.
4. Nuovo store testato senza denaro reale.
5. Verifica brand, collegamenti, sicurezza e piano di rollback.
6. Cutover autorizzato; rimozione dei percorsi eseguibili obsoleti e delle
   automazioni incompatibili. Decidere separatamente il destino dei dati vecchi.

## Store: progettazione ancora aperta

Vecchio client: link Gumroad per nocciole/oro e Edge Function riscatta. Nuovo
catalogo, prezzi, pagamento e regole non sono ancora scelti. Non rinominare solo
i vecchi prodotti lasciando ricompense e accrediti incoerenti.

Proposta da valutare: dare priorità a elementi estetici coerenti con personaggi,
gilde ed evoluzioni; evitare che la progressione centrale richieda un acquisto.
Non è una politica commerciale già approvata. Le sei classi e le evoluzioni
non diventano automaticamente prodotti a pagamento.

Per ogni prodotto definire ID stabile, nome Mythwood, descrizione, prezzo,
contenuto consegnato, immagini, condizioni, limiti e comportamento su rimborso.
Il server deve determinare prodotto e quantità da una verifica attendibile del
pagamento: non fidarsi di importi o ricompense inviati dal browser.

Registrare ogni consegna una sola volta, con riferimento alla transazione;
verificare retry, richieste simultanee, codici invalidi e pagamento già usato.
Il presunto difetto FOUND è stato smentito e ritirato dopo test su PostgreSQL;
non pianificare una correzione su quella base. Leggere il codice
di riscatta prima di decidere se sostituire anche provider o flusso di verifica.

## Brand e punti di collegamento

Checklist: titolo, icona, caricamento, menu, metadati social, dominio, email di
contatto, privacy/termini, pagine store, immagini prodotto, messaggi di acquisto,
ricevute configurabili, redirect Auth, link social e inviti di gilda.
"Echi del Varco" può restare riferimento artistico interno, non brand concorrente.
Il ruolo pubblico di Tonino non è automaticamente rinominato Mythwood.

## Accettazione prima del passaggio pubblico

- Il nuovo sito carica soltanto la build Mythwood selezionata e identificabile.
- Nessun collegamento attivo conduce ai vecchi pacchetti di nocciole/oro.
- Lo store non propone prodotti senza consegna implementata e verificata.
- Flussi login, salvataggio, cooperazione e acquisti verificati in staging.
- Conservati record necessari e disponibile rollback verificato.
- Approvazione operativa prima di deploy o modifica di prodotti su account esterni.

L'assenza dichiarata di acquisti reali semplifica il passaggio commerciale;
non autorizza a cancellare dati dei giocatori, account o infrastruttura.
