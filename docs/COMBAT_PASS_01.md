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
| Impeto | sopra il tasto Attacco: «IMPETO ×1,5 · n s», poi «IMPETO A SEGNO ×1,5» / «A VUOTO»; doppio contorno sul tasto; `aria-label` aggiornato | testo + contorno doppio |
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

## Difetti e limiti rimasti

1. **L'Assassino vince ancora senza subire attacchi** (spam e schivata, 3,98 s): la
   prima carica è interrotta, la seconda, non interrompibile, non arriva in tempo.
   Non ho cambiato PV o danni: è una decisione di bilanciamento da concordare.
2. **Impeto non migliora tutte le classi rispetto a nessun Sigillo** in questo bot:
   - schivata a tempo: Combattente 3,38 → 3,68 s, Guaritore 9,44 → 9,66, Ranger 4,46 → 4,50;
   - migliora Tank 4,96 → 4,70, Mago 7,80 → 7,26 e, nel kiting, Ranger 4,90 → 4,30.
   Probabile causa: l'anticipo di 0,8 s dell'abilità riordina i colpi, come già visto in
   PRODUCT-02. La carica stessa va sempre a segno (usate = a segno in tutte le righe).
   Proposta: provare la variante senza anticipo dell'abilità per Combattente e
   Guaritore, oppure accettarlo come scambio. Non la applico senza accordo.
3. **Custodia non compare mai nel confronto** (0 consumi): con il bot a tempo il colpo
   successivo non arriva entro 6 s, perché il bot non sbaglia. La riduzione è provata
   dai test mirati e dalla prova «errore successivo» di PRODUCT-02, non da questa tabella.
4. Il confronto prima/dopo mescola tre regole: per i numeri di una regola alla volta
   vale PRODUCT-03.
5. Segnali verificati solo come presenza, dimensione e posizione. Sulla comprensione
   servono persone.
