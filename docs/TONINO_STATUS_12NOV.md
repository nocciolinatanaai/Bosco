# Stato per Codex al rientro (Tonino, 12 novembre)

Il proprietario: Codex è fermo fino al 16 per piano esaurito; si va avanti in autonomia e
si aggiorna Codex al rientro. Nessun merge, deploy, spesa o social.

## ART-02, PR #5 (`tonino/art-pass-02`)
- R1 (alpha della felce) e R2 (atmosfera per area) corretti in commit separati.
- Verifiche passate: 170 test, build, budget, cinque regressioni, catture COMBAT-01 nei tre
  formati.
- Il proprietario ha detto che per lui si può unire. L'unione aspetta la tua verifica di
  R1/R2: la PR è aperta, GitHub CI verde, nessun conflitto con la base dopo il merge di
  `2b1247e`.

## Nuovo: texture dei personaggi (`tonino/character-textures`)
- −3,5 MB sui cinque GLB di classe, aspetto invariato alle camere misurate.
- Dettagli in docs/CHARACTER_TEXTURES.md.
- Ramo pubblicato, PR non ancora aperta.

## Nuovo: quantizzazione dei vertici (`tonino/model-quantization`, impilato sulle texture)
- Normali int8, UV uint16, pesi e colori uint8: −230 KB per il Ranger e −50/60 KB per
  classe; aspetto invariato alle camere misurate.
- Classe peggiore sulla base: Ranger 1.782.188 byte (era 2.012.556).
- Dettagli in docs/MODEL_QUANTIZATION.md.

## Prove Blender conservate (`tonino/blender-probes`, impilato su ART-02)
- Script, GLB e catture; nel gioco si attivano solo con `?glb` o `?hero`.
- Istruzioni in tools/blender-probes/README.md. Nessuna PR.

## Prove grafiche (prima solo locali, ora conservate nel ramo sopra) (non committate, su richiesta del proprietario)
- Blender 5.3 funziona in questo ambiente senza interfaccia (`pip install bpy`).
  `gltf-transform` via npx è bloccato dai permessi della sessione. Draco non è incluso in
  `bpy` da pip.
- **Custode in Blender**, tre iterazioni:
  - volumi di pietra scheggiata CC0 (`rock_boulder_cracked`), giunture con gli stessi nomi
    del procedurale, quindi stessa posa e combattimento invariato;
  - v3 con 12.000 triangoli e 471 KB;
  - da vicino è chiaramente più materico;
  - alla camera di gioco la v2 si confondeva col pavimento; la v3, più scura e con vene
    luminose, si legge in modo simile all'attuale;
  - resta un'estetica a blocchi e la testa si vede poco;
  - peso da aggiungere al budget: serve compressione o caricamento al risveglio.
- **Eroe (Combattente) con armatura Blender:**
  - pezzi rigidi sulle ossa e spada modellata; le animazioni funzionano;
  - aspetto da «costume incollato»: spallacci sferici, corazza a scatola, falde staccate;
  - non raggiunge lo standard richiesto.
- **Conclusione onesta:**
  - con script Blender possiamo fare l'ingegneria (scheletro, aggancio, materiali,
    integrazione, misure) e oggetti duri o architettura;
  - per personaggi al livello mobile attuale serve un modello di partenza migliore:
    generato (Tripo o simili, a pagamento, decisione del proprietario), scolpito, o un
    pacchetto CC0 più ricco.

## ART-03 candidato (`tonino/art-03-custode`, non assegnato: lavoro autonomo chiesto dal proprietario)
- Il Custode Blender (389 KB, 12.000 triangoli) è quello predefinito, con il procedurale come
  ripiego. Combattimento invariato.
- Verifiche passate: 173 test, build, sei regressioni browser e budget (peggiore Ranger
  2.915.707 con tutto incluso).
- Catture COMBAT-01 passate su telefono e landscape. Su desktop lo screenshot dopo la
  seconda carica d'Impeto si blocca, riprodotto tre volte: causa non trovata.
- Rapporto: docs/ART_03_CUSTODE_CANDIDATE.md.

## Distanza dal concept (risposta data al proprietario)
- Distanza molto grande su eroi, Custode ed effetti; grande sulla camera (economica da
  colmare, ma è un file del runtime); media su ambiente e interfaccia.
- Prossimo lavoro autonomo concordato col proprietario: effetti visivi e ambiente, senza
  toccare il runtime. Per la camera serve un incarico con te.

## ENV-03 (`tonino/env-03`, impilato su ART-03, lavoro autonomo)
- Cristalli, pozzanghere, fiori e lanterne fuori da sentiero e cerchio, più due test.
- Costo: 4 draw call e 3,5 KB.
- Verifiche e catture telefono/landscape passate.
- Rapporto: docs/ENV_03.md.

## Decisioni aperte per te e il proprietario
1. Unire la PR #5 dopo la verifica di R1/R2.
2. ART-03: Custode in Blender (base v3) in un incarico vero, con budget e regressioni,
   oppure prima l'HUD (etichetta sul joystick) o la camera.
3. Eroi: prova a pagamento con Tripo su un solo personaggio, entro il tetto di 50 €, se il
   proprietario la autorizza.
