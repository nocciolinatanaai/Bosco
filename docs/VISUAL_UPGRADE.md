# Primo intervento sulla grafica giocabile

Il proprietario ha sospeso il teaser e chiesto di migliorare il lavoro esistente.
Questo blocco conserva regole, classi, quest, controlli e checkpoint; cambia il
Ranger visibile e il trattamento della luce. Nessuna pubblicazione autorizzata.

## Cosa cambia davvero

- Il Ranger può caricare una base anatomica con texture e scheletro di System G6,
  «Modular RPG Characters», CC0. La provenienza esatta, hash e licenza sono in
  public/models/ranger/. Non viene presentata come scultura originale o finale.
- Il pacchetto Blender originale contiene i pesi ma lascia i moduli di armatura e
  capelli senza collegamento allo scheletro. prepare-ranger-model.py li collega,
  ricrea i materiali dalle PNG originali senza cambiarne i pixel ed esporta GLB.
- Cinque componenti, 43 ossa, sei primitive skinned per via dei materiali del busto.
  Cinque clip: attesa, corsa, preparazione arco, rilascio e salto usato come posa
  provvisoria dello scatto. Il salto non equivale a una schivata definitiva.
- Bow/cape/scarf/quiver/braid sono accessori geometrici Mythwood. La preparazione
  tende la corda; la risonanza conserva il segnale visivo dell'evoluzione.
- Le clip sono campionate in base alla fase dell'azione, senza cambiare il momento
  di danno, le collisioni o il movimento. L'asse nativo di mira viene orientato
  verso +Z locale della simulazione; test visivo dedicato controlla la direzione.
- Caricamento GLB e relativo loader al primo Ranger selezionato. Scheletro/mixer
  separati dalle altre classi, fallback al vecchio modello su errore recuperabile.
  Le altre cinque classi conservano il proprio modello provvisorio.
- Portale e illuminazione meno intensi, contrasto e foschia della piazza rivisti.
  Luce condivisa con il Giardino: il suo percorso richiede regressione dedicata.
- CSP: autorizzato lo schema blob per immagini e fetch delle texture incorporate
  nel GLB. Nessun host esterno aggiunto; Safari può usare il percorso img blob.

## Come valutare il risultato

`npm run dev`, poi gioco principale per il Ranger integrato.
`/tools/visual-review/` confronta vecchio segnaposto e nuova base con stessa
camera/luci. È uno studio di authoring, non la camera normale della partita.
`node scripts/visual-review.mjs` produce quattro pose, viste desktop/mobile,
controllo di caricamento fallito e rapporto. Le viste di gioco sono messe in
pausa per la cattura e il solo overlay di pausa/desaturazione è nascosto dal
runner: nessuna modifica equivalente nell'applicazione o foto ritoccata.

Il test Node del GLB verifica skin, clip e assenza di riferimenti remoti. I test
procedurali preesistenti riguardano il fallback; non provano il modello importato.
Le verifiche browser sono necessarie anche dopo un test Node riuscito: hanno
individuato il blocco CSP delle texture, poi corretto. Non dedurre fluidità su
smartphone dalla dimensione del file, dal conteggio dei triangoli o da SwiftShader.

## Limiti artistici ancora aperti

La base offre anatomia e deformazioni più utili, ma è un asset generico datato.
Volto, armatura e capelli non raggiungono l'illustrazione approvata di Daria.
Mantello e accessori richiedono rifinitura, la posa dello scatto va sostituita,
servono transizioni più morbide, contatti precisi mani/corda e passi coerenti
con velocità del movimento. Il Custode resta il vecchio segnaposto.
Nessuna valutazione positiva del proprietario su questa nuova versione presunta.

Il prossimo traguardo resta una sola scena convincente. Prima: identità di Daria
con volto/abiti coerenti e quattro movimenti rifiniti; poi un piccolo insieme di
rovine/materiali vegetazione riutilizzabili e un nemico all'altezza. La scelta
non è ampliare mappa o promozione per nascondere il debito artistico.

## Riproduzione asset

Scaricare l'archivio dall'URL in SOURCE.json e verificare archive_sha256 prima
di aprirlo. Estrarre in una cartella locale mantenendo textures/ accanto a
human_female.blend. Con Blender 4.3.2:

```
blender -b -t 2 --python scripts/prepare-ranger-model.py -- /percorso/human_female.blend /percorso/Bosco/public/models/ranger/ranger-base.glb
```

Nessuna dipendenza Blender richiesta per avviare il gioco: il GLB pronto e le
texture incorporate sono nel checkout. py7zr è stato installato solo in /tmp
per l'estrazione; nessuna dipendenza runtime npm o servizio esterno aggiunti.


## Esito del primo blocco

Checkpoint applicativo locale 35868c3. 95 test passati e build riuscita.
Confronto quattro pose, direzione dell'arco e caricamento fallito verificati.
Regressioni finali Ranger e Giardino passate su desktop/mobile, zero errori
browser e richieste esterne. Rapporti del medesimo buildEntrySha256 conservati
in docs/assets/visual-review/. Warning bundle >500 kB aperto: main 763 kB
(205 kB gzip), loader separato 45 kB (13 kB gzip). Nessun test iPhone reale.
Il conteggio del solo nuovo personaggio/accessori è 5.794 triangoli, 18 mesh
e sei primitive skinned; il fallback conservato comporta memoria aggiuntiva.
