# COMBAT-01 — rapporto di consegna (Tonino)

Ramo `tonino/combat-pass-01`, base `86dbe4c`, PR verso `mythwood/collaboration-base`.
Criteri: docs/COMBAT_PASS_01_ACCEPTANCE.md. Nessun playtest con persone: tutti i numeri
vengono da test e bot deterministici. Le catture mostrano presenza e disposizione dei
segnali, non dimostrano che una persona li capisca.

## Commit

| # | Commit | Contenuto |
| --- | --- | --- |
| 1 | resistenza unica | `hit()`: la prima interruzione di un avversario temprato (Custode, Guardiano del rintocco) vale; poi `resolute` finché non completa un attacco. Il danno passa sempre. Porto rivisto di 3222cd1 (valori del Guardiano, suggerimento delle Cave, finale `memoryFor`, riga runtime, 4 test Cave); il flag `rang` è sostituito dallo stesso `resolute`. |
| 2 | provocazione e portata | Custode colpito: ingaggiato 8 s a qualunque distanza, risponde fino a 16. Oltre 6 la casella Onda diventa Frattura mirata (`guardianAttackFor`), con **un solo** incremento del contatore in `prepareEnemyAttack`. |
| 3 | Custodia | Una carica: il prossimo colpo vero entro 6 s è ridotto del 75%. |
| 4 | Impeto ibrido | +18 vigore, −0,8 s abilità, più carica di 3 s: prossimo attacco base ×1,5. |
| 5 | segnali, testi, verifiche | HUD, etichette, traccia a terra, testi del Sigillo, script di confronto e catture, questo rapporto. |

## Regole rese esplicite

**Resistenza.**
- Se l'interruzione arriva **prima della carica** (inseguimento o recupero), lo stagger
  si applica e la resistenza parte subito. La carica successiva non si può interrompere:
  nessuna catena di stagger può impedirle di partire (test «spam di interruzioni»).
- Si azzera all'impatto (anche se il giocatore schiva o è fuori dal cerchio), alla morte
  e al cambio d'area. Non esiste nei checkpoint, quindi riavvio e ripresa ripartono puliti.
- Gli echi normali non sono temprati.
- Il Guardiano mantiene la regola della patch Rintocco: dopo un'interruzione il rintocco
  successivo arriva prima (0,4 s invece di 1,2), letta ora dallo stesso flag.

**Provocazione e Frattura lontana.**
- Serve un colpo a segno (danno > 0) sul Custode. Il timer scorre solo nella simulazione
  dell'area attiva: in pausa il runtime non la chiama, fuori area resta fermo.
- Non è salvato.
- La sequenza vicino/lontano è nel test con contatore 1, il caso di Codex: lontano dà
  Frattura con contatore 2; vicino dà Frattura (3), poi Onda (4).
- Gli eventi di carica e impatto portano centro, raggio, durata, danno e `reach`. Il test
  confronta il telegraph con l'impatto reale.

**Custodia.**
- Non si consuma con schivata o invulnerabilità.
- Non si accumula: durante il recupero di 6 s il Sigillo non si riattiva.
- Scade a 6 s e si azzera alla sconfitta.
- Se lo Scudo d'urto del Tank sta già riducendo il colpo, la carica resta per il colpo
  successivo, senza doppio sconto.

**Impeto.**
- Si consuma alla **risoluzione** del prossimo attacco base, anche se va a vuoto.
- Annullato prima della risoluzione (schivata), non si consuma.
- L'abilità non lo usa.
- Il proiettile lanciato porta con sé il danno ×1,5; se il bersaglio muore prima,
  conta come usata ma non a segno.
- Per un'azione con più bersagli (falciata del Combattente) il moltiplicatore vale per
  quell'azione: una carica e uno stesso `chargeId` su tutti i colpi.
- Gli eventi `surge-consumed`, `hit.chargeId` e `miss.chargeId` permettono di contare
  separatamente cariche usate, colpi caricati a segno e cariche a vuoto.

## Segnali

| Segnale | Dove | Forma senza colore |
| --- | --- | --- |
| «Non interrompibile» | barra del Custode (`#boss-resolute`) ed etichetta sopra ogni avversario temprato, quindi anche il Guardiano | glifo scudo con lucchetto + testo, bordo pieno, 14 px |
| Frattura a distanza | barra del Custode (`#boss-reach`), avviso e cerchio sul giocatore dall'inizio della carica, con una traccia a terra dal Custode al cerchio | simbolo ◎ + testo, bordo tratteggiato, 14 px |
| Impeto | desktop: sopra il tasto Attacco «IMPETO ×1,5 · n s», poi «IMPETO A SEGNO ×1,5» / «A VUOTO»; telefono: dentro il tasto Attacco («×1,5 · n s»), al posto della combo, perché sopra c’è l’Abilità; doppio contorno sul tasto; `aria-label` aggiornato | testo + contorno doppio |
| Custodia | stato del Sigillo nell'HUD: «Custodia carica · prossimo colpo −75%»; numero «CUSTODIA −75%» al consumo | testo |

Visibilità: ogni segnale legge lo stato della simulazione a ogni fotogramma (`resolute`,
`reach`, `surgeCharge`, `wardCharge`). Il rendering non assegna danni né consuma cariche.
Il gesto del Custode per la Frattura lontana è la posa della Frattura già esistente
(braccio destro alzato), diversa dalle braccia aperte dell'Onda. Non ho toccato
`guardian-redesign.js`, che è un file di Codex.

## Verifiche

Comandi:
- `npm test`;
- `npm run build`;
- `node scripts/caves-check.mjs`, `ranger-check.mjs`, `garden-check.mjs`,
  `checkpoint-ui-check.mjs` e `browser-check.mjs`;
- `node scripts/combat-pass-compare.mjs docs/assets/combat-pass-01`;
- `node scripts/combat-pass-capture.mjs docs/assets/combat-pass-01`.

Esiti: vedi la sezione «Esiti» in fondo.

### Prima/dopo con le stesse fixture (bot)

`docs/assets/combat-pass-01/compare.md` e `.json`: 90 righe, Custode e Rintocco, sei
classi, sette politiche:
- spam;
- schivata anticipata;
- uscita dal cerchio;
- schivata a tempo;
- due dita (movimento continuo + attacco);
- fermo alla gittata massima;
- kiting.

Totali Custode senza Sigillo, attacchi completati / danno subito:

| Politica | Prima | Dopo |
| --- | --- | --- |
| spam alla distanza d'ingaggio | 0 / 0 | 8 / 208 |
| schivata anticipata | 0 / 0 | 8 / 156 |
| esce dal cerchio | 0 / 0 | 12 / 0 |
| schivata a tempo | 0 / 0 | 8 / 0 |
| due dita | 3 / 0 | 7 / 0 |
| fermo alla gittata massima (Mago, Ranger, Guaritore) | 0 / 0 | 6 / 156 |
| kiting con schivata | 0 / 0 | 6 / 0 |

Prima, nessuna classe veniva mai attaccata con successo in quasi tutte le politiche.
Dopo:
- chi legge il cerchio (uscita, schivata a tempo, kiting) arriva in fondo senza danni;
- chi ignora il cerchio prende colpi;
- nessuna sconfitta in nessuna riga.

## Correzioni dopo la revisione Codex (testa 39b5548, «modifiche richieste»)

Fonti: docs/COMBAT_PASS_01_REVIEW.md e docs/CLAUDE_COMBAT_01_FEEDBACK.md. Un commit
separato per ciascuna correzione, sulla stessa PR #4.

**R1, `d69d6ed`: esito terminale unico per ogni carica Impeto.**
- Ogni azione caricata emette **una sola volta** `surge-outcome`, con `chargeId`,
  esito (`hit` | `miss` | `lost`) e ragione:
  - `no-target`: nessun bersaglio alla risoluzione;
  - `target-lost`: il bersaglio muore o sparisce prima dell'arrivo;
  - `expired`: il proiettile scade;
  - `blocked`: copertura del Giardino;
  - `area-change`: annullato dal cambio d'area;
  - `defeated`: sconfitta con proiettile in volo.
- I proiettili persi emettono anche `projectile-lost` (con `chargeId`);
  `projectile-blocked` porta il `chargeId`.
- Un proiettile ancora in volo **non ha esito**: non è un miss.
- HUD e confronto leggono lo stesso evento. L'HUD usa `SURGE_OUTCOME_TEXT`, dove `lost`
  si legge «A VUOTO».
- Il confronto conta: usate, a segno, a vuoto, perse, pendenti a fine scontro (0) ed
  esiti duplicati (0).
- La sonda `projectile-loss.mjs` di Codex sulla nuova testa dà
  `projectile-lost / target-lost` e `surge-outcome lost / target-lost` per la carica
  consumata.

**R2, `bd38b2c`: segnale leggibile nelle Cave, non solo fuori dai pulsanti.**
- La resistenza di un avversario temprato senza barra propria (il Guardiano) vive anche
  nell'HUD del personaggio: «Non interrompibile · Guardiano», glifo, 14 px.
- Il glifo sopra il bersaglio si **nasconde** quando coprirebbe la missione e i suoi
  pulsanti, l'HUD, la barra del Custode, i comandi, l'intestazione o l'avviso,
  invece di sovrapporre due testi. Lo stato resta sempre visibile nell'HUD.
- Lo script di cattura ora considera ostacoli anche quei pannelli e riproduce le Cave
  in tutti e tre i formati (`CAPTURE_PARTS=warden`):
  - 1440×900: glifo sul Guardiano e HUD, nessuna sovrapposizione;
  - 390×844 e 844×390: glifo nascosto perché toccherebbe la missione o i suoi
    pulsanti; HUD leggibile, nessuna sovrapposizione.
- Immagini `r2-*-warden-resolute.jpg`, rapporto `capture-r2-caves.json`.
- L'avviso di resistenza è stato accorciato perché sul telefono veniva tagliato.
- Limite: il controllo è geometrico. Leggibilità e comprensione restano da verificare
  con persone.

**Decisione Assassino, `77741e8`: resistenza iniziale sul solo Custode introduttivo**
(decisione di Codex).
- Al risveglio il Custode ha già la resistenza armata, con segnale visibile prima del
  primo colpo del giocatore.
- Il danno passa sempre. Il primo attacco completato la azzera; poi vale la regola
  normale.
- Riavvio e ripresa da checkpoint ricominciano lo scontro allo stesso modo; nulla è
  salvato.
- Echi, Sentinella e Guardiano invariati. PV e danni invariati.
- Confronto rifatto (sei classi, stesse fixture):
  - spam Assassino: da 0 attacchi / 0 danni a **1 attacco / 26 danni**;
  - schivata a tempo Assassino: 4,12 s, 0 danni;
  - spam delle altre cinque classi: identico;
  - nessuna sconfitta.
  Altre politiche cambiano tempi per più classi (per esempio uscita dal cerchio,
  Combattente 4,68 → 6,74 s): la modifica non è neutra.
- Due test precedenti, che interrompevano il Custode al primo contatto (scatto
  evoluto, Onda), ora partono dallo stato successivo al primo attacco, con commento.
  Nella partita reale l'Onda è la seconda mossa, quindi arriva dopo la fine della
  resistenza iniziale.

## Difetti e limiti rimasti

1. **Gittata nelle Cave** (controprova di Codex): Mago, Ranger e Guaritore alla gittata
   massima vincono contro il Guardiano senza rintocchi, perché il Guardiano non si avvia
   oltre 10 unità.
   - Non è un bug di `resolute`: è la scelta di un incontro statico. Provocazione e
     portata di COMBAT-01 riguardano solo il Custode.
   - Proposta di Tonino: **mantenere** il vantaggio. Il Guardiano è opzionale (la lente
     si può prendere senza ucciderlo) e la gittata è identità di classe.
   - Va confermato dal proprietario e da Codex prima di promettere uno scontro
     impegnativo per tutte le classi. Non allargo la Nova di nascosto.
2. **Impeto non migliora tutte le classi** rispetto a nessun Sigillo con il bot «abilità
   appena pronta»: Combattente e Guaritore più lenti di qualche decimo.
   - Accolta l'obiezione di Codex: niente eccezioni per classe al rimborso.
   - Prima di toccare i bonus serve una politica di gioco distinta, non il solo bot eager.
3. **Custodia** mostra il suo vantaggio solo con un errore provocato (prova «errore
   successivo» di PRODUCT-02 e test mirati). Il bot perfetto non subisce il colpo
   successivo.
4. Il confronto prima/dopo mescola più regole: per una regola alla volta vale PRODUCT-03.
5. Il nome e la barra dell'etichetta del Guardiano (preesistenti) possono stare sotto la
   missione o l'HUD su telefono. Il segnale di resistenza no: si sposta nell'HUD.
6. Nessuna prova con persone: comprensione e divertimento non sono dimostrati dai bot o
   dalle catture.

## Catture reali (build con CSP, input da tastiera)

Lo script `scripts/combat-pass-capture.mjs` guida la build con l'orologio controllato di
Playwright. Il motivo: SwiftShader headless va a circa 1,5 fps, e a tempo reale le
schivate falliscono. Così ogni passo è un fotogramma di gioco da 16 ms; durante gli
screenshot il tempo riprende per pochi decimi di secondo.

Per ogni segnale verifica:
- dimensione ≥ 14 px;
- tutto dentro lo schermo;
- nessun taglio;
- nessuna sovrapposizione ai comandi.

Movimento ridotto attivo, audio spento. Rapporto: `capture-desktop.json`.

**1440×900, completo:**
- `desktop-far-fracture.jpg`: cerchio sul giocatore e traccia dal Custode;
- `desktop-impeto-charge.jpg`;
- `desktop-impeto-used.jpg`, con esito reale «IMPETO A SEGNO ×1,5»;
- `desktop-resolute.jpg`: barra ed etichetta;
- `desktop-warden-resolute.jpg`: Guardiano del rintocco;
- versioni `-gray` in scala di grigi;
- `desktop-boss.webm`: sequenza accelerata 16×.

Lo script verifica anche che «Non interrompibile» sparisca all'impatto successivo.

**390×844 e 844×390, completi** (`capture-mobile.json`).

Le catture hanno trovato due difetti reali del riquadro Impeto, entrambi corretti prima
delle immagini definitive:
1. usciva dal bordo destro;
2. poi copriva il tasto Abilità.

Sul telefono lo stato ora sta dentro il tasto Attacco.

Immagini e controlli:
- `mobile-*` e `landscape-*`: Frattura a distanza, carica Impeto, esito «A SEGNO ×1,5»,
  «Non interrompibile» sul Custode;
- `mobile-warden-resolute` per il Guardiano. A 844×390 il Guardiano non è catturato:
  lo script lo esclude in orizzontale;
- in entrambi i formati: segnali ≥ 14 px, dentro lo schermo, senza tagli né
  sovrapposizioni ai comandi;
- «Non interrompibile» sparisce all'impatto successivo.

## Esiti delle verifiche

- `npm test`: 160 superati.
- `npm run build`: ok.
- caves-check, ranger-check, garden-check, checkpoint-ui-check e browser-check: superati
  su desktop e mobile, anche ripetuti sulla testa finale 39b5548, dopo le correzioni CSS.
- Catture: 1440×900, 390×844 e 844×390 superate.
