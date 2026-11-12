# Prove Blender (Tonino, 12 novembre) — non da integrare così

Ramo `tonino/blender-probes`, impilato su `tonino/art-pass-02` per riusare lo studio a
camere fisse. Conservato su richiesta del proprietario. **Nessuna PR**: il gioco normale non
cambia, i modelli di prova si attivano solo con parametri d'indirizzo.

## Ambiente
- Blender 5.3 senza interfaccia, in un ambiente virtuale:
  `python3.13 -m venv bvenv && bvenv/bin/pip install bpy==5.3.0` (circa 1,1 GB).
- Attenzione: non chiamare uno script `inspect.py`, altrimenti sostituisce il modulo della
  libreria standard e `bpy` va in crash all'avvio.
- Texture CC0 di Poly Haven, scaricate a 1k e ridotte con PIL:
  - Custode: `rock_boulder_cracked` (colore desaturato al 75 % e contrasto ×1,25), 256 px;
  - eroe: `metal_plate` e `brown_leather`, 256 px.

## Custode (`custode-probe.py`)
- Uso: `bvenv/bin/python custode-probe.py <cartella-texture> <out.glb>`.
- Blocchi di pietra con bevel, suddivisione, displacement (Voronoi e nuvole) e decimazione;
  un solo oggetto per giuntura.
- Le giunture hanno gli stessi nomi del Custode procedurale, quindi `guardianPose` e il
  combattimento restano invariati.
- v3: 11.988 triangoli, 471 KB (WebP), 124 draw call nella vista primo piano contro 136.
- Attivazione nello studio: `tools/art-pass-02/?glb`. Il procedurale resta ripiego e
  riferimento.

## Eroe (`hero-probe.py`)
- Uso: `bvenv/bin/python hero-probe.py <fighter.glb> <texture> <out.glb>`.
- Pezzi rigidi d'armatura agganciati alle ossa e spada sul palmo destro; scheletro, pesi e
  sei clip invariati.
- 13.312 triangoli in più, file da 921 KB contro 1,65 MB (WebP).
- Attivazione: `tools/art-pass-02/?cls=fighter&hero`. Viste dello studio: `eroe-fermo`,
  `eroe-carica`, `eroe-attacco`.

## Catture
- `node tools/blender-probes/custode-probe-capture.mjs <out>`; per l'eroe aggiungere
  `MODE=hero` e `VIEWS=eroe-fermo,eroe-carica,eroe-attacco,gioco`.
- Immagini in `docs/assets/blender-probes/`: `cp5`/`cp4` per il Custode (sopra l'attuale,
  sotto la prova), `hp2` per l'eroe.

## Giudizio
- Custode v3: più materico da vicino; alla camera di gioco si legge in modo simile
  all'attuale. Resta a blocchi, testa poco visibile, peso da gestire.
- Eroe: tecnicamente funziona (animazioni, aggancio, byte), ma l'aspetto è da «costume
  incollato» e il volto resta generico. Non raggiunge lo standard richiesto senza un modello
  di partenza migliore.

## Limiti dell'ambiente
- `npx @gltf-transform/cli` è bloccato dai permessi della sessione.
- Draco non è incluso in `bpy` da pip.
- Nessuna GPU e nessun telefono reale; SwiftShader non misura gli fps.
