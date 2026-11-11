# PR #1 — risposta di Tonino alla revisione Codex (docs/PR_1_REVIEW.md)

Revisione letta e integrata nel ramo con un merge (`c07283f`). Ogni punto è
riprodotto, corretto e protetto da un controllo che fallisce con il codice precedente.

## P1 — il mixer delle gambe sovrascriveva busto e braccia: **corretto**

La revisione era fondata: la clip `legs-run` clonava tutte le tracce della corsa e
io ripristinavo solo le gambe. Ora:
- la clip del livello gambe contiene **solo le tracce** di `leg_upper/lower`, `foot`,
  `toes` e `heel`;
- lo stride si misura con una copia completa della clip, usata solo al caricamento.

Il tuo probe è diventato una verifica permanente: `window.layerCheck` in
`tools/daria-combat/probe.js`, controllato da `scripts/daria-combat-check.mjs` e
quindi da `npm run test:daria`. Tre attori dopo 30 fotogrammi:

| Osso | Tiro in movimento vs tiro da fermo (prima → dopo) | Tiro in movimento vs corsa (dopo) |
| --- | --- | --- |
| torso | 42,92° → **0,02°** | 42,92° |
| arm_upper_R | 73,90° → **0°** | 73,90° |
| arm_lower_R | 29,61° → **0°** | 29,61° |
| arm_upper_L | 134,01° → **0°** | 134,01° |
| gambe (leg_upper_L) | — | **0°**: seguono la corsa |

Ripetizione allo stesso tempo: deriva 0.

**Prova che il controllo avrebbe fallito.** Ripristinando solo la riga del filtro,
`test:daria` fallisce con «busto e braccia restano nella posa del tiro» e riproduce
i tuoi valori (42,918 / 73,902 / 134,009).

## P2 — mano destra e cocca: **soglia definita, difetto residuo dichiarato**

Il grip sinistro da solo non basta. Ora la distanza mano destra–cocca si misura per ogni
tensione **completata**, cioè seguita dal fotogramma d'impatto. Le tensioni interrotte
da una schivata sono escluse.

Soglia: **≤ 0,10 unità scena nell'ultimo fotogramma di tensione**. Corrisponde al 3,8%
dell'altezza dell'attore (2,2 × scala 1,2 = 2,64), cioè alla mano visibilmente sulla
cocca al rilascio. Non converto le unità scena in metri.

| Tensione completata | Prima (refined) finale / massimo a metà | Dopo (pass01) finale / massimo a metà |
| --- | --- | --- |
| colpo a bersaglio alle spalle, in movimento | 0,101 / 0,577 | **0,081** / 0,506 |
| abilità da ferma | 0,087 / 0,630 | **0,028** / 0,536 |
| tiro in corsa diagonale | 0,107 / 0,655 | **0,076** / 0,549 |

**Difetto che resta.** A metà tensione la mano si allontana fino a circa 0,55: è il
percorso della mano nella clip CC0 `channel_two_handed_bow`. Non lo nascondo con la
soglia. Serve una clip di tensione nuova o una IK sulla mano destra, ed è dichiarato in
DARIA_PASS_01.md.

## Errore nella mia misura delle compenetrazioni: corretto, conclusione ribaltata

Lo script per clip confrontava fotogrammi con lo stesso numero, ma i due GLB salvano
le clip su intervalli diversi (refined 0,8–15,2, pass01 0–12: export a 24 e a 30 fps).
Le pose erano quindi sfasate, fino a 0,12 unità sulla testa nella corsa.

Ora lo script campiona entrambi i modelli nella stessa **fase normalizzata**. Con il
confronto corretto, **tutte e cinque le clip migliorano**, compresa la corsa. Quello che
avevo scritto in PR e documenti («in corsa leggermente peggio») era un errore mio.

| Clip | Prima (media / max %) | Dopo (media / max %) |
| --- | --- | --- |
| attesa | 3,13 / 3,56 | 1,33 / 1,47 |
| corsa | 2,70 / 3,06 | **1,48 / 2,46** |
| tensione | 2,74 / 2,76 | 0,97 / 1,01 |
| tiro | 2,87 / 2,91 | 1,07 / 1,22 |
| salto | 2,80 / 2,82 | 1,21 / 1,26 |

## Altre modifiche dopo la tua revisione, su richiesta del proprietario

- **Volto e capelli** di nuovo quelli di `daria-refined.glb`. Il proprietario ha giudicato
  peggiori sia il volto ridipinto sia le ciocche nuove: il rimodellamento della testa
  appiattiva il naso e spostava la bocca.
- La treccia del modello precedente seguiva solo la testa e in corsa attraversava il
  petto: sotto la mandibola ora passa gradualmente dalla testa al busto ed è staccata
  di 12 cm dal corpo.
- Restano i ritocchi leggeri: iride verde-nocciola, lentiggini tenui, labbra meno sature.
- Le alternative restano nel generatore, spente: `DARIA_HAIR=cards`, `DARIA_HEAD_EDIT=1`,
  `DARIA_FACE=painted|upstream`.
- 16.370 triangoli, 1.065.704 byte, stesso SHA in due esecuzioni.

## Risposte ai punti ART-01

- **Arco a tracolla:** hai ragione, il passaggio fra schiena e mano è uno scatto
  istantaneo, non un'animazione. Lo dichiaro come difetto aperto; non lo correggo in
  questa PR per non allargarla.
- **Palette del Combattente:** accolta l'obiezione. Tolgo il criterio «nessun terracotta o
  petrolio» dalla proposta e lo sostituisco con differenze di materiali, silhouette e
  postura, con i piedi appoggiati e le hitbox invariate.

## Verifiche sulla nuova testa

- `npm test`: 138/138.
- Build.
- `test:daria` con le nuove soglie P1/P2.
- `daria-clip-penetration` corretto.
- `ranger-check` desktop e mobile.
- `visual-review`.
- Roster: 30 pose.
- `browser-check`: episodio completo desktop e mobile.

Tutto in Chromium/SwiftShader: nessun dispositivo fisico.
