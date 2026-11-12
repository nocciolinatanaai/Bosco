# ART-02 — incarico grafico dopo COMBAT-01

Decisione del proprietario: Three.js resta il motore web; salto grafico rilevante,
anche sul mobile. Concordo con Tonino sull'uso di risorse CC0 migliori e prove
misurate. COMBAT-01 è integrato in 8d6d699: incarico assegnato a Tonino su un
nuovo ramo tonino/art-pass-02 dalla base condivisa aggiornata. Nessuna riserva o task
di combattimento viene aggirato per iniziare prima.

## Una scena convincente prima di ampliare il mondo

Perimetro: la piazza del Custode e il suo primo accesso, una piccola scena di
gameplay reale con Daria, un nemico e i segnali aggiornati. Non un altro concept
o un teaser che nasconde la build. Non rifare tutte le classi in questo blocco.

Tre interventi:
1. Materiali PBR originali/provenienza CC0 per terreno e muratura; un piccolo
   insieme di rovine/vegetazione riutilizzabili, con silhouette e scala coerenti.
2. Illuminazione e materiali calibrati: luce direzionale, ombre, ambiente e
   tonemapping. Confronto materiali a luci costanti, poi confronto separato con
   luce rivista. Gli effetti non devono cancellare cerchi, sagome o profondità.
3. Una proposta concreta per il limite maggiore rimasto del personaggio/nemico,
   con sorgente 3D e prova nella scena, se la qualità del primo piano resta
   insufficiente. Tessuti migliori non trasformano automaticamente il volto in
   quello del concept: dichiarare ciò che rimane da modellare.

## File e responsabilità

Tonino può intervenire in src/visuals/environment.js, src/visuals/materials.js,
src/visuals/stone-surface.js, src/visuals/geometry.js per helper necessari,
src/graphics-quality.js e
nuovi moduli di props/materiali. Asset locali in public/art/environment-pass02/
con manifest, licenze, fonti e hash. Fixture/script dedicati per confronto.
Runtime/combat/caves/telegraph, HUD e personaggi sono fuori dal primo intervento:
eventuali modifiche vanno registrate e concordate prima, evitando sovrapposizioni.
Codex rivede stile, evidenze e costo; non modifica gli stessi file durante il task.

## Risorse e qualità

Valutare Poly Haven, Quaternius e Kenney per ciò che serve davvero; verificare
licenza e versione di ogni risorsa. Il nome del portale non certifica il singolo
file. Nessun acquisto, API a consumo o nuova dipendenza obbligatoria senza mandato.
Materiali colore in sRGB, normali/roughness come dati; convenzioni e packing
documentati. Risorse distribuite localmente, niente dipendenze da CDN nel gioco.

Molti pack Kenney/Quaternius sono deliberatamente low-poly: non sceglierli solo
perché gratuiti se ripropongono l'aspetto giocattolo già respinto. I riferimenti
sono proporzioni adulte, materiali leggibili, fantasy semi-realistico originale.
Niente copia di personaggi di altre opere o immagini finte presentate come build.

## Criteri di consegna

- Prima/dopo reali alle stesse camere, posa, tempo e qualità: vista di gioco,
  dettaglio materiali e scena in combattimento; 1440×900, 390×844, 844×390.
- Niente peggioramento dei segnali COMBAT-01; forma e testo restano leggibili
  senza colore, audio e animazioni accessorie. Nessuna luce abbagliante che li copra.
- Conteggi triangoli/draw call/materiali/texture, byte download, memoria texture
  stimata e metodo dichiarati. Separare CPU/SwiftShader da telefono reale.
- Conservare il budget corrente del percorso home→demo (≤3,5 MB per classe ai
  profili misurati) o presentare il compromesso prima di chiamare concluso il task.
  Niente texture 4K indiscriminate o streaming aggiunto per nascondere il peso.
- Test/build e regressioni delle aree influenzate, più controllo visivo nella
  build con CSP. Sorgenti o trasformazioni riproducibili e licenze versionati.

La comprensione dei segnali e l'attrattiva per giocatori richiedono ancora prove
con persone. Non dedurre qualità artistica da test verdi, byte o numero di asset.
Niente pubblicazioni, trailer, main, spese, Supabase o risvegli in ART-02.
