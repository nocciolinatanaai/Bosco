# Baseline tecnica legacy e revisione

Questa sezione descrive la versione precedente. Per il nuovo prototipo locale
vedere README.md e SECURITY.md. L'audit PAY-01 è stato smentito dai test.

## Architettura osservata

`index.html` → REST `world[key=app]` → HTML/CSS e caricatore JS → Storage JS.
Host: `lxnhcuthmdkpeklucutu.supabase.co`.
Payload letto: versione `2026-11-07-locandina2`.
Script: `/storage/v1/object/public/lib/js/app-2026-11-07-locandina2.js`.
SHA-256 osservato: `cf3b4a0a7ea1336585664b437d8debb9b3a6020acab0bd60fbcb38cdc0c569ca`.
Il file può essere sostituito anche mantenendo lo stesso URL: riverificare l'hash.

Dimensioni osservate: HTML 41.877 caratteri; CSS 66.310; caricatore JS 657;
programma JS 526.757 caratteri e 3.720 righe. Nessun package manifest, lockfile,
build o test versionato nel checkout di baseline.

Dipendenze: Three.js 0.149.0, loader glTF, asset GLB su Storage, fallback Canvas
2D; Supabase REST/RPC, Realtime WebSocket, Auth Google; Edge Function `riscatta`
e acquisti Gumroad. Il programma remoto richiede ancora Google Fonts.

Il client include costruzione, esplorazione, salute, creature, combattimenti,
palestre, raid/dungeon, economia, gilde, chat, storia, votazioni e telemetria.
Presenza del codice non equivale a collaudo o approvazione del prodotto.

## Database esportato

- 210 definizioni di funzione public con permessi osservati.
- 156 eseguibili da anon/authenticated/service_role; 53 solo da service_role
  fra questi ruoli; una da authenticated/service_role (`link_account`).
- 129 funzioni SECURITY DEFINER eseguibili da anon.
- 65 tabelle: 63 public con RLS, due private senza RLS.
- 467 colonne, 113 vincoli, 8 viste, una policy, nessun trigger applicativo
  esportato nei due schemi. Gli indici autonomi non sono inclusi.
- Unica policy osservata: lettura di `world` per anon e authenticated.
- Le viste pubbliche selezionano dati di gioco e non espongono direttamente
  password, device o auth_uid. Opzioni e ACL delle viste non ancora raccolte.

Le funzioni appartenenti a postgres ed eseguite come SECURITY DEFINER possono
superare la RLS: l'autorizzazione deve essere corretta nel percorso RPC.

## Risultati prioritari — analisi statica salvo dove indicato

| ID | Risultato | Evidenza e limite |
|---|---|---|
| SEC-01 | Login con password SQL NULL può superare il ramo di rifiuto | `login`: confronto non sicuro rispetto a NULL; funzione eseguibile da anon. Non provato su account reali. |
| SEC-02 | Device usato come credenziale | Login restituisce device; funzioni come set_password/delete_me lo accettano senza nuova prova d'identità. Proteggerlo come segreto. |
| PAY-01 | Ritirato: diagnosi precedente errata | L'assegnazione con sottoquery non modifica FOUND. Test del codice originale confermano registrazione oro e retry idempotente; vedere SECURITY.md. |
| ADM-01 | Tentativi amministrativi possono essere annullati | Inserimento in admin_fail seguito da eccezione nel chiamante: rollback transazionale. Verifica isolata necessaria. |
| GAME-01 | Mercato rifiuta creature oltre livello 5 | train_creature e creature_levels arrivano a 50; market_listings.level accetta solo 2–5. La transazione dovrebbe annullare la rimozione dall'inventario. |
| DATA-01 | Cancellazione non copre tutti i riferimenti | delete_me cerca colonne device; restano riferimenti seller/buyer/owner/from_device/to_device/by_device/from_dev e storici. Definire cancellazione o anonimizzazione. |
| GAME-02 | Limite boss descritto come giornaliero ma contato per settimana | boss_hits PK week/device; boss_hit limita hits a 60. Eventuale reset esterno ignoto. |
| UI-01 | Splash copre pagina privacy all'apertura | Riprodotto in browser isolato con codice reale; ramo LEGAL termina senza splashEnd; rimozione automatica prevista a 60 s. |
| OPS-01 | Nessuna ricostruzione completa da Git | Sorgente, stato configurabile, asset e backend vivono anche su Supabase. |
| CON-01 | Saldi e limiti potenzialmente vulnerabili a concorrenza | Check prima della scrittura senza lock comune in più funzioni; saldo mostrato con greatest(0,...). Non riprodotto. |

`credit_code`, `credit_purchase`, `bosco_touch`, `raid_apply` e `admin_exec`
non sono eseguibili da anon/authenticated nell'esportazione. Non descriverle
come direttamente pubbliche. Altre funzioni admin usano controllo del segreto.

## Verifiche effettivamente svolte

- Sintassi JS caricatore e programma remoto: superata.
- Pagina e immagine locale servite identiche: superato.
- Risposte simulate valide/vuote/HTTP 500 al caricatore: comportamento osservato.
- Promise rifiutata in codice remoto simulato: non intercettata dal caricatore.
- 390 ID HTML nel payload remoto: nessun duplicato rilevato.
- Browser isolato, backend simulato e WebGL disabilitato: avvio 2D senza errori
  JS osservati nella breve finestra del test, splash rimossa.
- Pagina privacy isolata: heading presente, splash ancora presente.
- Nessun test reale di autenticazione, acquisti, cancellazione o gameplay completo.
- Non esiste una suite automatica versionata; i controlli temporanei non sono
  una suite recuperabile da Git nella baseline. La nuova implementazione include
  test ripetibili in tests/ e scripts/browser-check.mjs.

## Evidenze ricevute e limiti

Il proprietario ha fornito tre esportazioni: prime 100 funzioni; successive 110
con ACL per tutte le 210; struttura con colonne, vincoli, viste, policy e trigger.
Sono allegati della chat e non file versionati del progetto. Non registrarne i
percorsi locali come dipendenze riproducibili. Prima di archiviarli esaminare e
redigere eventuali segreti; le esportazioni non contengono intenzionalmente righe utenti.

Mancano Edge Function, indici completi, ACL di schemi/tabelle/viste/sequenze,
configurazione Auth/Storage/Realtime, estensioni, cron, backup e procedura deploy.
Il frontend è recuperabile; il progetto non è ancora ripristinabile integralmente.

## Aggiornamento del client locale — episodio iniziale

src/journey.js contiene guida e testi del frammento; combat.js mantiene i vincoli
di progressione (Custode sigillato, echi, risveglio unico e scatto offensivo).
Le finestre narrative fermano la simulazione e non ricevono contenuto remoto.
Questi vincoli sono lato client: non sono una protezione anti-cheat o un backend.
Nessun cambiamento alla baseline Supabase o alle valutazioni SQL sopra riportate.

Il client locale ora separa i profili degli attacchi nemici (enemy-attacks.js)
dalla geometria del segnale (visuals/telegraph.js). Il raggio visualizzato viene
scalato dal valore usato dalla simulazione, senza ricreare le mesh a ogni cambio
mossa. Frattura e Onda sono descritte in GUARDIAN.md; non cambiano la baseline SQL.


Seconda area locale: garden.js e visuals/garden.js, regole/filtri condivisi
con combat/runtime; struttura e limiti in REGIONS.md. Checkpoint v2 compatibili
v1 in lettura. Nessun nuovo servizio esterno o cambiamento SQL di produzione.
