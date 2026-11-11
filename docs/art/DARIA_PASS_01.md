# Daria — character-art pass 01 (Tonino / Claude)

Ramo `tonino/character-art-pass-01`, base `d472bd1`. Incarico in
`docs/CLAUDE_NEXT_TASK.md`. Riferimento: tavola approvata
`docs/assets/character-sheets/ranger.png`. **Non è un personaggio finito**:
è un passo misurabile verso la tavola, giocabile nel prototipo.

## Cosa cambia nel modello giocabile (`public/models/ranger/daria-pass01.glb`)

| Elemento | Prima (`daria-refined.glb` + accessori runtime) | Dopo (pass01) |
| --- | --- | --- |
| Volto | texture generica CC0, tratti da bambola, labbra rosse | texture ridipinta in modo procedurale: pelle calda, lentiggini, occhi nocciola-verdi, sopracciglia scure, labbra naturali; mento/mascella leggermente adulti |
| Capelli | calotta rigida a casco e due "bacchette" alle tempie | volume campionato sul cranio, onde laterali, ciocche sulla corona, due ciocche davanti alle orecchie e fronte scoperta |
| Treccia | tubi intrecciati dietro la testa | treccia a tre capi sulla spalla sinistra fino al petto, legaccio e ciuffo; pesi testa→torso lungo la lunghezza |
| Giacca | busto senza maniche, braccia coperte da guanti lunghi marroni | giacca petrolio con maniche lunghe, apertura a V con tunica di lino, falde in quattro pannelli divise davanti/dietro/fianchi |
| Mantello | piano terracotta aggiunto a runtime dietro la schiena, staccato dal corpo | mantellina terracotta sfrangiata sulle spalle, più lunga sul lato destro, spilla ad anello in ottone, pesata sullo scheletro |
| Sciarpa | tre anelli rigidi | sciarpa salvia drappeggiata al collo |
| Pantaloni/accessori | pantaloni oliva | pantaloni marroni, cinture, cinghie alle cosce, bracciali, cinghia della faretra, faretra con sei frecce sulla schiena, borsa e taccuino delle mappe |
| Mani | guanti scuri interi | mani nude con fasciature al polso (come nel concept) |

## Compenetrazioni: la correzione strutturale

Causa nel modello precedente: gli abiti originali erano pesati solo su
`torso`/`pelvis`, mentre braccia e gambe seguivano le proprie ossa; il corpo
completo restava sotto i vestiti. Nel pass01:

1. ogni capo è un **guscio** della superficie del corpo spinto lungo le normali,
   quindi eredita gli stessi pesi dei vertici del corpo;
2. ogni accessorio riceve i pesi della **superficie del corpo più vicina**
   (fusione dei pesi dei vertici della faccia più vicina);
3. le **facce del corpo coperte dai vestiti sono eliminate**: la pelle sotto la
   giacca o i pantaloni non può più attraversare il tessuto.

Restano possibili intersezioni **tra capi** (mantellina e braccio durante la
tensione dell'arco, treccia e mantellina in corsa): sono visibili come piccoli
punti, non come pelle che buca il vestito.

## Movimento, presa e rilascio

- L'arco è tenuto dall'osso `wep_pos_L` (punto d'impugnatura del rig), non dal polso.
- Durante la preparazione la **corda segue la mano destra** (`wep_pos_R`) quando
  la mano è vicina al piano dell'arco; la freccia parte dalla cocca. Al rilascio
  la corda torna a riposo. Nessun cambiamento a danni, tempi o collisioni: il
  rendering legge solo `action.elapsed/windup` come prima.
- Le clip restano le cinque originali CC0 (attesa, corsa, tensione, tiro, salto
  usato per lo scatto): **non ho scritto nuove animazioni**.
- Pausa e ripetizione: `scripts/visual-review.mjs` misura salto all'avvio 0,
  salto all'interruzione 0, deriva in pausa 0.

## Numeri

| | Prima | Dopo |
| --- | --- | --- |
| File GLB | 1.129.388 byte | 980.816 byte |
| Triangoli nel GLB | — | 14.158 (budget 20k) |
| Triangoli visibili dell'attore nello studio (con arco) | 16.752 | 14.734 |
| Mesh visibili / skinned / materiali (studio) | 18 / 13 / 16 | 21 / 18 / 20 |

SHA-256 e provenienza in `public/models/ranger/SOURCE.json` (`pass01`). Nessuna
misura FPS su iPhone: i numeri non provano le prestazioni sul telefono.

## Riproduzione e licenza

```sh
pip install bpy==4.3.0 "numpy<2"          # oppure Blender 4.3
python3.11 scripts/prepare-daria-pass01.py -- public/models/ranger/daria-refined.glb public/models/ranger/daria-pass01.glb
```

Due esecuzioni producono lo stesso SHA-256 (verificato). Non serve l'archivio
upstream: il sito opengameart.org era bloccato dal proxy della sessione Cloud,
quindi il generatore parte dal GLB CC0 già versionato. Base anatomica, scheletro
e clip: System G6, CC0 (`LICENSE.txt`). Geometria aggiunta, texture del volto e
dei tessuti: originali Mythwood, generate dallo script; nessuna immagine di terzi,
nessuna API a pagamento, nessuna spesa. Le texture della pelle non riusano i pixel
del volto upstream (lo script li legge solo per individuare l'area del cuoio capelluto).

## Prove (stessa luce e camera)

- `docs/assets/daria-pass01/concept-before-after.png`: concept, prima, dopo.
- `docs/assets/daria-pass01/` (PNG, volti in JPEG): fronte, profilo, schiena, volto, volto di
  profilo, corsa, tensione (fronte e profilo), rilascio, scatto. A sinistra prima,
  a destra dopo, generate da `tools/daria-review/` con `scripts/daria-review.mjs`.
- `docs/assets/daria-pass01/game/`: camera di gioco reale desktop 1440×900 e
  mobile 390×844, prima/dopo.
- `report.json`: anche il caricamento fallito (fallback procedurale visibile,
  nessun errore) e il nuovo tentativo riuscito.

## Ancora lontano dal concept (onesto)

- Il volto resta una testa low-poly con texture dipinta: niente scultura,
  niente pelle SSS, niente capelli a ciocche fini. Da vicino è leggibile ma
  stilizzato; il concept è semi-realistico.
- Capelli in "card" piatte: da dietro si vedono come lamelle scure.
- Le falde della giacca e la mantellina sono statiche (nessuna simulazione di stoffa).
- Stivali e silhouette delle gambe sono quelli CC0.
- Nessuna nuova animazione: la posa di tensione CC0 non è la presa del concept
  e lo scatto usa ancora il salto.
- Arco procedurale a runtime, non ancora modellato come quello della tavola.
- Le altre cinque classi non sono toccate da questo passaggio.
