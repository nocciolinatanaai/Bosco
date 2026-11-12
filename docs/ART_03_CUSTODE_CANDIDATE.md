# ART-03 (candidato) — Custode modellato in Blender (Tonino, 12 novembre)

Ramo `tonino/art-03-custode`. Contiene ART-02 (PR #5), le prove Blender, le texture
ricodificate e la quantizzazione dei vertici. **Non è un incarico assegnato da Codex**:
Codex aveva chiesto di non iniziare ART-03 prima dell'integrazione di ART-02. Il proprietario,
con Codex fermo fino al 16, ha chiesto di andare avanti in autonomia. Va trattato come
proposta da rivedere, senza PR finché Codex non lo valuta.

## Cosa cambia
- Il Custode del primo scontro carica `public/art/custode-probe/custode.glb`, generato da
  `tools/blender-probes/custode-probe.py` (Blender 5.3 senza interfaccia, texture CC0 Poly
  Haven `rock_boulder_cracked`).
- Le giunture hanno gli stessi nomi del procedurale: `guardianPose`, colpi, raggi,
  telegraph e combattimento sono invariati.
- Il procedurale resta come ripiego (errore di caricamento, Node/test) e come riferimento
  con `?noglb`.
- Il caricamento è asincrono e non blocca la piazza: il procedurale è visibile finché il
  GLB non è pronto.
- La pietra è tinta lato codice (`STONE_TINT`).

## Costo
- GLB 388.892 byte dopo la quantizzazione delle normali (`scripts/quantize-glb.py`).
  Texture WebP 256 px (`EXT_texture_webp`, richiesto: niente WebP, niente modello, si usa il
  ripiego).
- 11.988 triangoli. Draw call nel primo piano dello studio 124 contro 136; vista di gioco
  172 contro 180.
- Byte home→demo con ART-02, texture, quantizzazione e Custode (`budget.json`):

| Classe | Byte |
| --- | --- |
| Ranger | 2.915.707 (la peggiore) |
| Combattente | 2.630.847 |
| Mago | 2.618.363 |
| Assassino | 2.611.651 |
| Guaritore | 2.574.107 |
| Tank | 2.520.995 |

  Tutte sotto i 3,5 MB.

## Confronti (studio a camere fisse; sopra o a sinistra l'attuale)
- `docs/assets/art-03-custode/primo-piano.jpg`: fermo, in carica e dopo l'impatto.
- `gioco.jpg`: camera di gioco e combattimento in scala di grigi.
- `mobile.jpg`: 390×844.

## Verifiche sulla testa del ramo
- 173 test (3 nuovi in `tests/custode-glb.test.mjs`: giunture, limiti di costo,
  estensioni) e build passati.
- Regressioni browser passate: browser, Ranger, Cave, Giardino, checkpoint UI, personaggi.
- Budget passato.
- Catture COMBAT-01 nella build reale: vedi la sezione seguente.

## Catture COMBAT-01 (build reale, `scripts/combat-pass-capture.mjs`)
- **390×844 e 844×390: passate**, comprese le Cave e l'Impeto «A SEGNO ×1,5».
  L'unica sovrapposizione è quella preesistente: l'etichetta del Custode sul joystick
  (x −42).
- **1440×900: parziale.** Passano la Frattura a distanza (anche in grigio), la misura di
  Impeto e il suo esito «A SEGNO ×1,5». Poi lo screenshot dopo la seconda carica
  d'Impeto si blocca per 120 s.
  - Riprodotto tre volte su questa testa, anche senza registrazione video
    (`CAPTURE_NO_VIDEO=1`, opzione aggiunta per isolare la causa).
  - Non è mai successo sulla testa di ART-02 senza il GLB.
  - Nessun errore di pagina registrato.
  - Ipotesi non verificata: dopo `clock.resume()` il fotogramma reale diventa un compito
    lungo del thread principale sotto SwiftShader. **Causa non trovata: resta un punto
    aperto, non un risultato.**
- Immagine: `docs/assets/art-03-custode/build-reale.jpg` (computer e telefono, con il
  nuovo Custode e i segnali visibili).

## Giudizio onesto
- Da vicino il Custode è più materico e massiccio; dalla camera di gioco si legge in modo
  simile all'attuale (sagoma scura con vene luminose).
- È ancora un'estetica a blocchi e la testa si vede poco.
- Rispetto al concept (colosso di radici e lastre di porcellana, artigli, aureola) la
  distanza resta molto grande.
- Non è un'approvazione artistica: decidono il proprietario e la revisione di Codex.
