# Skill e continuità del lavoro

## Prima di cambiare grafica o animazioni

1. Leggere HANDOFF, VISUAL_UPGRADE e il concept approvato: il proprietario ha
   giudicato insufficiente anche la base CC0. Test riusciti non provano qualità
   artistica. Il teaser rimane sospeso.
2. Aprire solo le skill pertinenti in .agents/skills/. animation per mixer e
   scheletri; materials/lighting per superfici e luce; performance per misure;
   asset-pipeline per importazioni/compressione; frontend-design per HUD/menu.
   Esempi Three.js r186: verificarli su r187, versione del progetto.
3. Scegliere una conseguenza osservabile, conservare il confronto e misurarla.
   Per animazioni: pausa, interruzione e riavvio, non soltanto la posa finale.
   Per superfici: stessa geometria, camera, luci e tempo nel prima/dopo.
4. Verificare il gioco nella build con CSP, non soltanto una fixture permissiva.
5. Registrare fonti, hash, controlli e limiti nel commit locale. Non pubblicare.

skills-lock.json conserva provenienza/hash delle skill installate dal CLI.
Le cartelle locali .agents possono non essere versionate: ripristinarle con
`npx skills add CloudAI-X/threejs-skills --skill threejs-animation threejs-materials threejs-lighting threejs-asset-pipeline threejs-performance --agent codex --yes`
e `npx skills add anthropics/skills --skill frontend-design --agent codex --yes`.
Il plugin mattpocock-skills è installato nella CLI dell'ambiente, versione 1.3.2.
Per documenti consumati dagli agenti è stato applicato writing-for-agents.
Le skill sono istruzioni; non sono un collegamento a Canva, né asset artistici,
né accesso alla chat di Claude. Non installare altri pacchetti automaticamente.

## Contratti di questo intervento

- Il sampler miscela pose usando il tempo della simulazione. Il mixer è campionato
  con update(0): fadeIn/crossFadeTo da soli non avanzerebbero la dissolvenza.
- I raccordi hanno durata massima 120 ms e non ritardano danni, schivate o eventi.
  Comandi interrotti ripartono dai pesi correnti; pausa congela; riavvio azzera.
- Le superfici sono DataTexture procedurali native, non foto o immagini AI.
  Colore in sRGB, normali/roughness come dati. Pietra non metallica e macchie
  d'umidità coerenti; UV ruotate senza consumare il seed del layout del livello.
- I contatori del pipeline sommano scena, ombre e postprocessing. Non confondere
  i triangoli dell'ultimo quad con quelli del mondo o i conteggi con byte/FPS.


## Evidenze del blocco applicato

99 test, build e regressioni Ranger/Giardino desktop/mobile passati. Manifest
e immagini in assets/skills-visual-pass/. Il confronto a camera fissa conferma
stessi draw call/triangoli e tre texture in più; atlante pavimento 512×512 con
quattro varianti, mappe muratura 128×128. Più memoria rispetto alla base: circa
4 MiB in più di soli texel RGBA con mipmap, stima dimensionale non misura GPU.
8 frame a caldo senza crescita dei conteggi geometrie/texture nel confronto.

`node scripts/surface-review.mjs` prepara la baseline bc25e7c in test-results/
e genera le due viste prima/dopo; serve la storia Git che contiene quel commit.
Non pubblicare test-results/ o tools/ come parte della build. Lo studio
/tools/visual-review/ consente riproduzione esplicita; non esporta un trailer.
Il codice del gioco continua a funzionare senza queste fixture e senza skill.

## Skill locale di collaborazione

mythwood-collaboration è versionata separatamente dalle skill installate.
Definisce il protocollo di review; non procura un connettore. Leggere
AGENT_EXCHANGE per componenti reali mancanti e limiti delle prove simulate.
