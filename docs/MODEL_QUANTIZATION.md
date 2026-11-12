# Quantizzazione dei vertici dei personaggi (Tonino, 12 novembre)

Ramo `tonino/model-quantization`, impilato su `tonino/character-textures` (texture JPEG).
Lavoro autonomo richiesto dal proprietario. Nessun codice di gioco cambiato.

**Cosa fa `scripts/quantize-glb.py`.** Riscrive solo gli attributi di vertice dentro il GLB:
- normali in int8 normalizzato (estensione `KHR_mesh_quantization`, supportata nativamente
  dal GLTFLoader di Three.js);
- UV in uint16 normalizzato, solo se tutte in [0,1]; colori e pesi in uint8 normalizzato
  (formati core glTF), con la somma dei pesi riportata esattamente a 255;
- posizioni, indici, scheletro e animazioni invariati;
- le bufferView non più usate vengono rimosse;
- `SOURCE.json` (personaggi e Ranger) conserva gli hash del generatore e registra i nuovi.

| GLB | Dopo le texture | Dopo la quantizzazione |
| --- | --- | --- |
| tank | 493.984 | 440.624 |
| fighter | 606.052 | 550.476 |
| assassin | 591.356 | 531.280 |
| mage | 587.776 | 537.992 |
| healer | 551.892 | 493.736 |
| daria-pass01 (Ranger) | 1.065.704 | 835.336 |

**Byte home→demo** (DPR1, sulla base senza ART-02; `docs/assets/model-quantization/budget.json`):

| Classe | Byte |
| --- | --- |
| Ranger | 1.782.188 (era 2.012.556), sempre la classe più pesante |
| Combattente | 1.497.328 (era 2.597.664 prima di entrambi i passi) |
| Tank | 1.387.476 |
| Assassino | 1.478.132 |
| Mago | 1.484.844 |
| Guaritore | 1.440.588 |

**Verifica visiva** (`class-character-review.mjs`, 18 immagini prima/dopo, stesse pose):
- differenza media da 0,002 a 0,005 livelli su 255;
- pixel con differenza oltre 8 livelli: tra lo 0 e lo 0,01 %, punti isolati su bordi e
  riflessi (massimo 75 su qualche pixel);
- esempio: `docs/assets/model-quantization/prima-dopo.jpg`.

**Verifiche.** 166 test, build, `character-check`, `ranger-check`, `daria-combat-check`,
`browser-check` e budget passati.

**Limiti.**
- Le normali int8 hanno una precisione di circa 0,5°. Su superfici lucide molto ampie si
  potrebbe notare una leggera sfaccettatura: alle camere misurate non si vede.
- Non tocca i GLB `ranger-base` e `daria-refined`: non sono la variante caricata di default.
- La memoria GPU dei vertici si riduce di poco; l'effetto principale è sul download.
