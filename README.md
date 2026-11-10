# Mythwood · La prima frattura

**Per Claude/Tonino:** partire da [docs/START_HERE.md](docs/START_HERE.md).
Idee condivise in [docs/IDEAS.md](docs/IDEAS.md); valutazione critica in
[docs/PRODUCT_REVIEW.md](docs/PRODUCT_REVIEW.md).

Ricostruzione locale di un RPG browser. La direzione di prodotto comprende sei
classi, evoluzioni, esplorazione e cooperazione di gilda. **Questa build è una
prova individuale con uno studio visivo procedurale**, non il gioco completo né
la resa del concept artistico. La bozza social precedente è stata ritirata.

## Avvio

Richiede Node.js 22 o successivo e npm.

```sh
npm ci --ignore-scripts
npm run dev
```

Il server ascolta su loopback. Non contatta Supabase, non crea account, non
usa analytics e non abilita pagamenti. Il salvataggio locale delle tappe è
facoltativo, inizialmente spento: vedi [LOCAL_CHECKPOINTS.md](docs/LOCAL_CHECKPOINTS.md).

Prova rapida del salvataggio: `npm run test:checkpoints` con Chromium Playwright
o MYTHWOOD_CHROMIUM_PATH nel Cloud. Usa dati sintetici e non contatta Supabase.

## Cosa provare

Scegli una delle sei classi. Muoviti con WASD/frecce, toccando il terreno o con
il joystick mobile (frecce alternative in Comandi). J o Attacco esegue una combo
di tre colpi: puoi tenerlo premuto. Q attiva l’abilità di classe; Spazio scatta
e consuma 30 vigore. Esci dal cerchio durante la carica e colpisci nel recupero.
Libera i due echi, accogli il ricordo e prova il nuovo scatto offensivo contro
il Custode. Frattura segna il tuo punto; Onda richiede di allontanarsi dal boss
o interromperlo. Il risveglio avviene prima del boss, non dopo la vittoria finale.
Il sentiero orientale è un'estensione della stessa scena: non è ancora streaming
fra regioni. Dopo il Custode, segui le tre tracce luminose e falle risuonare
con lo scatto; pulsante nella missione o F aiutano a raggiungerle. Esc o Pausa fermano il combattimento. Effetti sonori opzionali alla selezione;
volume, mute e qualità grafica in Comandi e audio. La modalità Leggera mantiene
i segnali del combattimento e riduce il carico del rendering. Dettagli in [docs/COMBAT_UX.md](docs/COMBAT_UX.md) e [docs/EPISODE_01.md](docs/EPISODE_01.md).

## Verifiche

```sh
npm test
npm run build
# Test Web Audio nel browser:
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium npm run test:audio
# Chromium già installato nell'ambiente Cloud:
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
npm audit
```

Su altre macchine: `npx playwright install chromium`, poi `npm run test:browser`.
Il runner serve dist/ su 127.0.0.1:5180 e chiude il processo al termine. Usa
rendering software Chromium: non misura le prestazioni di uno smartphone reale.
Le catture di verifica sono in test-results/ (ignorata da Git).

I test SQL usano PostgreSQL WASM PGlite con pgcrypto e dati sintetici. Le fixture
sono un sottoinsieme di schema, non una copia di Supabase. La proposta login in
database/proposals/ NON è stata eseguita sulla produzione.

## Struttura

- src/: scena 3D, interfaccia e regole del prototipo.
- tests/: regole di combattimento e regressioni SQL.
- scripts/browser-check.mjs: controlli desktop/mobile e isolamento rete.
- database/proposals/: patch SQL revisionabili, non attive automaticamente.
- legacy/index.html.txt: precedente caricatore, conservato come testo non eseguibile.
- docs/: design, audit, backlog, recupero, requisiti UE e revisione fra agenti.

Leggere AGENTS.md e HANDOFF.md prima di lavorare. SECURITY.md spiega risultati
e limiti della revisione. Il sito precedente resta distinto da questa build:
nessun deploy, migrazione online o modifica degli account social è stato eseguito.

## Limiti noti

Nessun multiplayer, mondo vasto, collisioni ambientali complete, asset finali,
salvataggi online, backend nuovo o store operativo. Gli archetipi hanno regole, equipaggiamenti e pose differenti; condividono ancora
il modello procedurale di base. Animazioni, audio e resa artistica finali mancano. Nessuna promessa
di durata o viralità. La prima build contiene un chunk motore superiore a 500 kB
minificati: distribuzione, prestazioni reali e caricamento progressivo sono da
ottimizzare. Per pubblicare va distribuita dist/, non la radice del repository.

## Collaborazione su GitHub

Il proprietario ha autorizzato commit e push della base sul ramo
`mythwood/collaboration-base`. La main del vecchio sito resta separata; questo
ramo non è un deploy. Il workflow CI esegue test e build, senza pubblicare.
I risultati della CI remota vanno controllati: una prova locale non li sostituisce.
