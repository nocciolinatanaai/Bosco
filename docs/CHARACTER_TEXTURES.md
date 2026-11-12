# Texture dei personaggi ricodificate (Tonino, 12 novembre)

Ramo `tonino/character-textures`, dalla base condivisa `2b1247e`. Non tocca i file di ART-02
(PR #5) né il codice di gioco. Lavoro autonomo chiesto dal proprietario mentre Codex è fermo.

**Cosa cambia.** Le texture di colore dei cinque GLB di classe erano PNG.
- Ora sono JPEG q88 senza sottocampionamento del colore, sostituiti dentro il file con
  `scripts/recompress-character-textures.py`.
- Geometria, pesi, scheletro e clip sono identici: cambiano solo i chunk immagine,
  `mimeType` e gli offset.
- Tutti i materiali sono OPAQUE: per glTF l'alfa della texture base non conta, quindi le
  due PNG con canale alfa (armatura del Combattente, capelli del Guaritore) sono
  ricodificate anche loro.
- `SOURCE.json` conserva hash e byte del generatore (`generatorSha256`, `generatorBytes`)
  e registra i nuovi.

| GLB | Prima | Dopo |
| --- | --- | --- |
| tank | 883.724 | 493.984 |
| fighter | 1.650.812 | 606.052 |
| assassin | 1.395.316 | 591.356 |
| mage | 1.274.420 | 587.776 |
| healer | 1.128.556 | 551.892 |
| totale | 6.332.828 | 2.831.060 |

**Byte home→demo** (`loading-budget-check.mjs`, DPR1, sulla base senza ART-02):

| Classe | Byte |
| --- | --- |
| Combattente | 1.552.904 (era 2.597.664) |
| Tank | 1.440.836 |
| Assassino | 1.538.208 |
| Mago | 1.534.628 |
| Guaritore | 1.498.744 |
| Ranger | 2.012.556 (invariato, ora la classe più pesante) |

Con ART-02 integrato la classe peggiore scenderebbe da circa 3,34 MB a circa 2,7 MB: è una
stima per somma, da rimisurare dopo l'unione.

**Verifica visiva.**
- `class-character-review.mjs` prima/dopo, stesse pose e camere, 18 immagini.
- Differenza media sotto 0,02 livelli su 255, nessun pixel oltre 8 livelli; una sola
  immagine ha un massimo di 31 su un pixel di bordo.
- Ranger invariato.
- Esempio: `docs/assets/character-textures/prima-dopo.jpg`.

**Verifiche.** 166 test (aggiornati solo gli hash attesi tramite `SOURCE.json`), build,
`character-check`, `browser-check` e budget passati.

**Limiti.**
- La ricodifica è con perdita: non cambia l'aspetto alle camere misurate, ma è una
  trasformazione dei pixel delle sorgenti CC0, dichiarata qui e in `SOURCE.json`.
- La memoria GPU non cambia: le texture decodificate hanno la stessa dimensione.
- Nessun telefono reale.
