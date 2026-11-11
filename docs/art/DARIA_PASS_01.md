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
| Giacca | busto senza maniche, braccia coperte da guanti lunghi marroni | giacca petrolio con maniche lunghe e apertura a V sulla tunica di lino. Le falde in quattro pannelli sono state **tolte** dopo la prova di combattimento: in corsa entravano nelle cosce |
| Mantello | piano terracotta aggiunto a runtime dietro la schiena, staccato dal corpo | mantellina terracotta sfrangiata sulle spalle, più lunga sul lato destro, spilla ad anello in ottone, pesata sullo scheletro |
| Sciarpa | tre anelli rigidi | sciarpa salvia drappeggiata al collo |
| Pantaloni/accessori | pantaloni oliva | pantaloni marroni, cinture, cinghie alle cosce, bracciali, cinghia della faretra, faretra con sei frecce sulla schiena, borsa e taccuino delle mappe sui fianchi |
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
| File GLB | 1.129.388 byte | 1.004.408 byte |
| Triangoli nel GLB | — | 13.598 (budget 20k) |
| Triangoli visibili dell'attore nello studio (con arco) | 16.752 | 14.174 |
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

## In combattimento (sfida del proprietario)

Strumenti:
- `tools/daria-combat/` con `scripts/daria-combat-check.mjs` guida la **simulazione
  reale** (`combat.js`) con la stessa regola di posizione e rotazione di `runtime.js`,
  a passo fisso di 1/60 s, e misura ogni fotogramma per il modello precedente e per il nuovo.
- Copione: corsa, inversione di direzione, tiro verso un bersaglio alle spalle,
  tiro interrotto da una schivata, abilità da fermo, tiro in corsa in diagonale.
- `scripts/daria-clip-penetration.py` (Blender) conta, in ogni fotogramma delle cinque
  clip, i vertici di abiti e capelli più di 1,5 cm dentro il corpo CC0 completo.

| Misura | Prima | Dopo | Come è stata corretta |
| --- | --- | --- | --- |
| Arco rispetto al punto di presa del rig (max, fotogrammi con arco in mano) | 0,108 | **0** | arco sull'osso `wep_pos_L` |
| Errore di mira nel fotogramma del colpo (3 colpi) | 11,7° / 0,6° / 0,0° | **0,2° / 0,4° / 0,0°** | durante l'azione la figura si orienta verso il bersaglio della simulazione (solo rendering) |
| Errore di mira massimo durante la tensione | 99° | 51° (primi 2–3 fotogrammi della girata, poi < 3°) | come sopra |
| Scivolamento del piede d'appoggio in corsa (mediana / 90° percentile) | 5,1 / 8,3 m/s | **0,8 / 2,9 m/s** | fase della corsa legata alla velocità reale (stride lock); gambe in corsa anche durante il tiro in movimento |
| Distanza mano destra–corda in tensione (media) | 0,35 | 0,21 | corda e cocca seguono la mano anche in altezza; resta lo scarto laterale della clip |
| Freccia visibile durante la schivata | no | no | la schivata annulla l'azione nella simulazione |
| Arco che attraversa le gambe in corsa | sì | **no** | in corsa a mani libere l'arco va a tracolla sulla schiena, come nella tavola |

Compenetrazioni per clip, in % dei vertici di abiti e capelli dentro il corpo
(media su tutti i fotogrammi; per il modello precedente il mantello a runtime è escluso):

| Clip | Prima | Dopo |
| --- | --- | --- |
| attesa | 3,16 | **1,57** |
| tensione | 2,72 | **0,96** |
| tiro | 2,88 | **0,97** |
| salto (scatto) | 2,79 | **1,63** |
| corsa | 2,83 (max 3,5) | 2,99 (max 6,4) |

Prima della correzione la corsa era al 5,3% e il salto al 5,2%. Le cause trovate:
- le falde della giacca entravano nelle cosce: tolte;
- borsa, taccuino e fibbie rigide entravano nelle cosce sollevate: spostati sui fianchi, e le fibbie che galleggiavano sono state tolte;
- la mantellina veniva attraversata dalle braccia: i suoi lati ora seguono le braccia.

**In corsa resta un leggero peggioramento rispetto a prima.** È distribuito tra
attaccatura dei capelli, sciarpa e spalle nell'oscillazione delle braccia, e mani.
Una parte potrebbe essere un errore della misura (la testa di pass01 è rimodellata,
mentre il riferimento usa quella precedente): è un'ipotesi, non l'ho verificata.

Nessun cambiamento a simulazione, danni, tempi o collisioni: tutto avviene nel
rendering di `ranger-skinned.js`, solo per il modello pass01.

Prove: `docs/assets/daria-pass01/combat/`
- `combat-before-after.jpg`: sei momenti, prima sopra e dopo sotto;
- `*-frames.json`: misure per fotogramma;
- `report.json`: riepilogo e soglie di accettazione;
- `penetration.json`: compenetrazioni per clip.

```sh
npm run test:daria      # studio prima/dopo + sonda di combattimento con soglie
python3.11 scripts/daria-clip-penetration.py -- public/models/ranger/daria-refined.glb public/models/ranger/daria-pass01.glb out.json
```

## Correzione del volto (segnalazione del proprietario)

Il proprietario ha notato che il volto era meno definito di prima. Aveva ragione. Le cause:
- texture del volto in JPEG da 20 KB, contro il PNG da 135 KB precedente;
- due passaggi di sfocatura;
- solo 1024 px per un'area UV piccola.

Ora il volto è dipinto a 2048 px con bordi anti-alias e senza sfocatura, ed è esportato in JPEG qualità 95.
Dettagli aggiunti:
- iride con anello e fibre, punto luce;
- palpebre e ciglia nette, piega della palpebra;
- narici;
- labbra con arco di Cupido.

Il GLB passa da 946.716 a 1.004.408 byte (sotto il limite di 1,5 MB del test).

## Ancora lontano dal concept (onesto)

- Il volto resta una testa low-poly con texture dipinta: niente scultura,
  niente pelle SSS, niente capelli a ciocche fini. Da vicino è leggibile ma
  stilizzato; il concept è semi-realistico.
- Capelli in "card" piatte: da dietro si vedono come lamelle scure.
- La mantellina è statica (nessuna simulazione di stoffa). Le falde della tavola non ci sono più.
- Corsa: compenetrazioni leggermente sopra il modello precedente (vedi tabella).
- La girata verso un bersaglio alle spalle richiede 2–3 fotogrammi all'inizio della tensione.
- Stivali e silhouette delle gambe sono quelli CC0.
- Nessuna nuova animazione: la posa di tensione CC0 non è la presa del concept
  e lo scatto usa ancora il salto.
- Arco procedurale a runtime, non ancora modellato come quello della tavola.
- Le altre cinque classi non sono toccate da questo passaggio.
