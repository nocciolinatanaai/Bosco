# Recupero, staging e rilascio — piano

Stato: procedura proposta, non eseguita. Non è uno script di ripristino già testato.

## Inventario da recuperare

| Componente | Evidenza disponibile | Mancante |
|---|---|---|
| Caricatore | index.html in Git | Flusso reale GitHub Pages e impostazioni hosting |
| Programma client | Payload app e JS pubblico letti | Copia versionata approvata e modalità di aggiornamento |
| Database | Funzioni, ACL funzioni, colonne, vincoli, policy e viste esportati | DDL ripristinabile, indici autonomi, estensioni, ACL restanti, configurazione |
| Edge Function | Client chiama riscatta | Sorgente, dipendenze, nomi variabili, verifica licenza, deploy |
| Storage | URL di script, font e modelli | Manifest completo, hash, licenze, policy dei bucket |
| Auth | Google e password/device nel codice | Redirect autorizzati e configurazione provider senza segreti |
| Realtime | Client WebSocket | Policy, configurazione e limiti effettivi |
| Processi | Funzione pulizia_dati | Cron, automazioni di Tonino, eventi e stato di esecuzione |
| Social | Riferimenti del proprietario | Profili effettivi, contenuti, metriche aggregate e processi di pubblicazione |

Le esportazioni ricevute non costituiscono da sole un dump ripristinabile e non
includono tutti i componenti Supabase. Non improvvisare una migrazione in produzione.

## Percorso di ricostruzione

1. Inventariare sorgenti e processi con Tonino/proprietario, senza cambiare risorse.
2. Ottenere esportazioni delle sole definizioni; esaminare e redigere eventuali
   segreti prima del versionamento. Non includere dump utenti o credenziali device.
3. Preparare, con autorizzazione, cartelle per client, migrazioni, Edge Function,
   test e manifest asset. Conservare provenienza e hash del materiale originale.
4. Ricostruire un ambiente isolato con dati sintetici; evitare acquisti di servizi
   finché non è stata valutata un'opzione locale e il budget.
5. Rendere configurabili URL/client key in sviluppo senza modificare implicitamente
   l'hosting statico attuale. Separare credenziali server da configurazione pubblica.
6. Eseguire i test prioritari del backlog e una prova di restore da ambiente vuoto.
7. Definire release identificabili, backup e rollback; ottenere autorizzazione
   separata prima del primo aggiornamento di produzione.

## Regole per le prove

- Bloccare tutte le chiamate esterne quando si usano mock; non affidarsi solo al
  metodo HTTP perché RPC POST possono leggere o scrivere e funzioni state creare righe.
- Non usare ?test=1 come interruttore di isolamento.
- Usare personaggi sintetici per login, cancellazione, acquisti e concorrenza.
- Simulare Gumroad; nessun acquisto reale per dimostrare un test.
- Dichiarare browser, viewport, GPU/modalità software e fallback per le prove grafiche.
- Non disabilitare TLS, firme o verifiche di integrità per aggirare problemi di accesso.

## Destinazioni di rete

Essenziale al caricatore attuale: lxnhcuthmdkpeklucutu.supabase.co, HTTPS e
WebSocket per il multiplayer. Il client include fallback cdn.jsdelivr.net e una
richiesta fonts.googleapis.com; verificare ulteriori font/asset effettivi.
L'accesso Google richiede il flusso Auth e i redirect corretti; acquisti richiedono
Gumroad e i servizi chiamati dalla Edge Function ancora da esaminare.

Non sostituire allowlist sconosciute e non ampliare la rete senza un bisogno
verificato. Le impostazioni Cloud non sono gestite da questi documenti.
