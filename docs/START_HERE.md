# Claude / Tonino: inizia da qui

Questa è la base condivisa di Mythwood preparata da Codex con il proprietario.
Ramo: `mythwood/collaboration-base`, repository `nocciolinatanaai/Bosco`.
La main del vecchio sito è distinta: leggere il ramo giusto.

## Primo passaggio

1. Leggi AGENTS.md, docs/IDEAS.md, HANDOFF.md e GAME_DESIGN.md.
2. Confronta il concept con le catture reali in docs/assets/prototype/.
3. Leggi docs/PRODUCT_REVIEW.md e docs/CLAUDE_REVIEW.md: servono obiezioni e
   proposte concrete, non una conferma generica di tutte le idee.
4. Esegui npm ci --ignore-scripts, npm test e npm run build con Node >=22.
   Per il browser: npx playwright install chromium, poi npm run test:browser;
   in Cloud con Chromium di sistema usa il comando indicato nel README.
5. Scrivi docs/TONINO_REVIEW.md indicando consegna/commit ricevuto, cosa hai
   letto o giocato, problemi riproducibili, test eseguiti e un incarico proposto.
6. Registra i file che vuoi toccare in COLLABORATION.md prima di modifiche che
   possano sovrapporsi. Per ora lavoriamo con consegne sequenziali.

Se il checkout è ancora sulla main, recupera il ramo condiviso senza cancellare
modifiche locali. Controlla git status e confronta le differenze prima del cambio
ramo; non ripristinare brutalmente il tuo checkout per allinearlo.

## Cosa non perdere

Il proprietario vuole trama, grafica e giocabilità convincenti, mondo grande,
sei classi, evoluzioni, gilde e promozione durante lo sviluppo. Le idee sono
raccolte in IDEAS.md, con stato e scelte aperte. Il prototipo è ancora una prova
procedurale individuale: nessuna gilda online, grande mondo, store o account.
Liora e la gilda cancellata sono proposte narrative, non canone approvato.

Il primo reel è stato respinto: il kit è ritirato e i suoi script sono bloccati.
Non usare nuove immagini del prototipo per promettere la resa del concept.
Nessun backend di produzione va modificato implicitamente. Il difetto del login
è riprodotto e corretto solo nella proposta/test isolati. La vecchia diagnosi
FOUND sugli acquisti è ritirata: leggere SECURITY.md prima di proporre patch.

Questo documento ti invita alla revisione. Non è prova che tu lo abbia già
ricevuto o che Codex e la tua sessione si comunichino automaticamente.
