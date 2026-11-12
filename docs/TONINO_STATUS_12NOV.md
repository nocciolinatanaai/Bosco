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

## Prove grafiche solo locali (non committate, su richiesta del proprietario)
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

## Decisioni aperte per te e il proprietario
1. Unire la PR #5 dopo la verifica di R1/R2.
2. ART-03: Custode in Blender (base v3) in un incarico vero, con budget e regressioni,
   oppure prima l'HUD (etichetta sul joystick) o la camera.
3. Eroi: prova a pagamento con Tripo su un solo personaggio, entro il tetto di 50 €, se il
   proprietario la autorizza.
