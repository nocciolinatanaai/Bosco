# ART-02 — la prima arena giocabile (rapporto di Tonino)

Ramo `tonino/art-pass-02`, base `f881e7d` (COMBAT-01 integrato). Incarico e criteri:
docs/CLAUDE_ART_PASS_02.md e docs/ART_PASS_02_SCOPE.md.

**Limiti di ciò che dimostro.**
- È un miglioramento misurato della scena, non un'approvazione artistica: questa spetta
  al proprietario.
- Nessuna prova con persone e nessun telefono fisico.
- SwiftShader headless non misura il frame rate reale.

## Cosa limitava la scena (dalla base, stesse camere)

`docs/assets/art-pass-02/before-*.jpg`:
- metà dello schermo era un pavimento a lastre uguali e ripetute, senza direzione;
- le colonne e gli edifici erano scatole con texture procedurali stirate;
- la vegetazione era a foglie appuntite, con l'aspetto «giocattolo»;
- la luce di riempimento appiattiva i piani: pavimento e muri avevano quasi la stessa
  luminosità.

## Tre passaggi separati (commit distinti)

| Passaggio | Commit | Cosa cambia |
| --- | --- | --- |
| 0. Base | `d37a820` | Studio a camere fisse `tools/art-pass-02` (camera di gioco del runtime: fov 55, offset 8/9/13 desktop e 1/14/20 sotto i 700 px), misure, pipeline delle texture |
| 1. Materiali e asset a luce invariata | `73324dd` | PBR CC0 sul terreno e sull'architettura della piazza, sentiero e cerchio, felci CC0 |
| 2. Luce | `3a2456d` | Calibrazione delle luci esistenti, nessuna luce aggiunta |

**Passaggio 1, gerarchia di forme e materiali.**
- Ciottoli a ventaglio su tutta la piazza: la scala dei ciottoli rende la distanza.
- Un **sentiero di lastroni** con cordoli porta dall'ingresso al **cerchio dello scontro**,
  anche questo a lastroni e con cordolo.
- Conci squadrati su colonne, archi e basamenti; muratura grezza sugli edifici di fondo.
- UV in metri (`worldPlane`, `worldDisc`, `worldBoxUV`): niente stiramenti sui blocchi e
  niente cuciture fra i pezzi del terreno.
- Tolte le traversine dei binari, che aggiungevano linee senza dare scala.
- Le felci `fern_02` sostituiscono i cespugli appuntiti: una variante per punto, tinta
  spenta verso la palette, una draw call per variante.
- I cristalli viola sono ridotti a un quarto.

**Passaggio 2, luce.**
- Chiave lunare fredda più bassa e più forte: ombre più lunghe, piani separati.
- Riempimento ridotto; luce viola di bordo ridotta (toglie lo sfarfallio sulla muratura).
- Ambiente un po' più forte, per dare definizione ai materiali PBR.
- Nebbia un po' più densa: prospettiva aerea sugli edifici di fondo.
- I lastroni sono stati scuriti perché il cerchio di pericolo restasse leggibile in
  scala di grigi sul sentiero (`pass2-*-combattimento-gray.jpg`). I file dei telegraph
  non sono stati toccati.

## Confronti

- `confronto-desktop-gioco.jpg`, `confronto-desktop-combattimento.jpg`,
  `confronto-desktop-materiali.jpg`: prima | dopo, 1440×900.
- `confronto-mobile.jpg`: 390×844, gioco e combattimento, prima/dopo alternati.
- `confronto-landscape.jpg`: 844×390, sopra prima, sotto dopo.
- Tutte le viste e le copie in scala di grigi: `before-*`, `pass1-*`, `pass2-*` in
  `docs/assets/art-pass-02/`.

Riproduzione:

```sh
node scripts/art-pass-02-review.mjs test-results/art-pass-02
```

Estrae `f881e7d` come «prima».

## Costo (stesso studio, stesse camere; metodo in `pass2-report.json`)

| | Base f881e7d | ART-02 |
| --- | --- | --- |
| Draw call (vista di gioco, con il passaggio delle ombre) | 168 | 180 |
| Triangoli del fotogramma (ombre incluse) | ~364.000 | ~460.000 |
| Materiali nella scena | 64 | 68 |
| Texture nella scena | 15 | 26 |
| Memoria texture stimata (RGBA 8 bit + mipmap, senza compressione GPU) | ~9,3 MiB | ~18,9 MiB |
| Byte home→demo, classe peggiore (Combattente), budget 3,5 MB | 2.597.664 | **3.270.587** |
| Byte home→demo, Ranger | 2.012.556 | 2.685.479 |

- Le nuove risorse pesano 670.596 byte:
  - quattro set di texture a 512/256 px;
  - la felce, 176 KB di geometria e due texture a 256 px.
- Budget rispettato per tutte e sei le classi: `docs/assets/art-pass-02/budget-final.json`.
- La memoria texture raddoppia e resta sotto i 20 MiB. Su telefoni datati è il costo
  da verificare per primo.
- La felce è caricata in modo asincrono: la piazza è giocabile prima che compaia.

## Fonti e licenze

- `public/art/environment-pass02/manifest.json` registra, per ogni file:
  - URL della sorgente Poly Haven;
  - hash SHA-256 della sorgente e del risultato;
  - trasformazione applicata e byte.
- Licenza CC0 1.0 (polyhaven.com/license). Asset: `patterned_cobblestone`,
  `stone_tiles_02`, `medieval_blocks_03`, `castle_wall_slates`, `fern_02`.
- Riproducibile con `python3 -I scripts/prepare-art-pass02.py <cache>`.
- Convenzioni:
  - colore in sRGB;
  - normali OpenGL e ARM come dati lineari (R occlusione, G ruvidità, B metallo);
  - per la felce l'ARM è sostituita da valori costanti per risparmiare byte.
- Kenney non è raggiungibile da questo ambiente (403). Di Quaternius non ho usato nulla:
  i pacchetti low-poly riproporrebbero l'aspetto respinto.

## Perimetro rispettato

- Toccati solo `environment.js` e `geometry.js` (aiuti UV) fra i file assegnati, più due
  moduli nuovi (`plaza-surfaces.js`, `plaza-props.js`).
- `materials.js` condiviso è invariato: personaggi e Custode non cambiano.
- Runtime, combattimento, Cave, telegraph e HUD non sono stati toccati. L'esposizione del
  renderer resta quella del runtime.

## Verifiche sulla testa finale

Vedi la sezione «Esiti» in fondo: test, build, budget, regressioni browser e catture di
gioco reali con controllo dei segnali COMBAT-01.

## Cosa resta debole (onesto)

1. **Edifici di fondo**: scatole con finestre piatte. La muratura migliora la grana, non la
   silhouette. Serve geometria (cornici, tetti spezzati, profondità delle finestre).
2. **Radici e rampicanti**: i tubi viola restano procedurali e lisci; con la luce nuova si
   notano di più.
3. **Personaggi e Custode**: fuori da questo intervento. Nella vista di gioco sono piccoli,
   ma il primo piano (volto di Daria, materiali del Custode) resta il limite maggiore
   quando la camera si avvicina. La proposta separata è nella domanda in PEER_REVIEW.
4. **Camera**: la camera di gioco desktop mostra molto pavimento. Il sentiero e il cerchio
   ora lo organizzano, ma una camera più bassa darebbe più spazio alle rovine. È un file
   del runtime, quindi lo segnalo senza cambiarlo.
5. La memoria texture raddoppiata va misurata su un telefono reale.
