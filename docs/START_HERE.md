# Claude / Tonino: inizia da qui

## Consegna attuale — review COMBAT-01, 12 novembre

Leggi HANDOFF.md, COMBAT_PASS_01_REVIEW.md e CLAUDE_COMBAT_01_FEEDBACK.md.
PR #4 testa 39b5548 non integrata: correzioni su proiettili caricati persi e
segnale Cave portrait, più decisione sulla prima resistenza del Custode.
Continua sulla stessa PR, senza rifare le attività storiche sotto. Prossimo
intervento grafico delimitato in ART_PASS_02_SCOPE.md, dopo integrazione.
Niente main/deploy/social/spese/Supabase/risvegli.

Consegna più recente: leggi HANDOFF.md e docs/CLAUDE_PRODUCT_REPLY_01.md.
La PR #1 corretta è integrata sul ramo condiviso. Codex ha consegnato CHAL-01
e la risposta PRODUCT-01 con prove e limiti; il vecchio incarico di rifare
Daria non va riapplicato. Nuovo lavoro solo su ramo Tonino dalla base aggiornata.

Aggiornamento corrente: leggi prima docs/CLAUDE_NEXT_TASK.md. Il proprietario
autorizza scrittura, verifiche, commit e push sul ramo tonino/character-art-pass-01.
I modelli e le tavole recenti sono sul ramo di collaborazione; la grafica è ancora
incompleta. I vecchi riferimenti sotto sono storia, non il punto di partenza.

Questa è la base condivisa di Mythwood preparata da Codex con il proprietario.
Ramo: `mythwood/collaboration-base`, repository `nocciolinatanaai/Bosco`.
La main del vecchio sito è distinta: leggere il ramo giusto.

## Mandato corrente (11 novembre 2026)

Priorità ai contenuti con verifiche visive: artefatti, combattimento, trama ed
esplorazione. La prova grafica Daria non soddisfa il proprietario; niente nuovo
teaser o rifinitura artistica in questo blocco. Sigillo e Cave: ARTIFACT_01 e
CAVES_01. Stato dei test e ultimo checkpoint nella testa di HANDOFF.

Il proprietario ha richiesto la sincronizzazione degli ultimi checkpoint sul
ramo di collaborazione: confrontare il checkout con origin prima di procedere. Nessun
collegamento automatico fra le chat; il checkout ricevuto deve contenere i file
aggiornati prima di iniziare la revisione. Non riapplicare modifiche alla cieca.
Push sul ramo di collaborazione autorizzato per questa sincronizzazione. Nessun
merge su main, deploy, social, spesa o scrittura Supabase autorizzati.

## Ponte di revisione predisposto

Leggere docs/AGENT_EXCHANGE.md e la skill mythwood-collaboration. Esistono
coda locale e worker predisposto, ma nessun collegamento Claude reale verificato.
Non trattare le risposte dei test come pareri dell'altro agente.

## Primo passaggio

1. Leggi AGENTS.md, docs/IDEAS.md, HANDOFF.md e GAME_DESIGN.md.
   Quantità proposte e stato effettivo: docs/CONTENT_SCOPE.md.
   Nuovo mandato: docs/ROADMAP_40.md e docs/PLAYER_FEEDBACK.md.
2. Confronta il concept con le catture reali in docs/assets/prototype/.
   Architettura delle tre aree: docs/REGIONS.md.
   Proposta del primo Ranger e incarico artistico: docs/CHARACTER_DARIA.md.
3. Leggi anche docs/AUDIO.md, docs/RPG_RESEARCH.md e docs/STORY_BIBLE.md, docs/MEMORY_TRAIL.md, docs/LIORA_PORTRAIT.md e docs/GRAPHICS_QUALITY.md e docs/LOCAL_CHECKPOINTS.md;
   separa prototipo e proposte successive. Leggi docs/PRODUCT_REVIEW.md e docs/CLAUDE_REVIEW.md: servono obiezioni e
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
