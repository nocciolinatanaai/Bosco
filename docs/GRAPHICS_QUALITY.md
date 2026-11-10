# Qualità grafica selezionabile

10 novembre 2026, Codex. Opzioni in «Comandi e audio» → Grafica; preferenza
solo nella sessione. Non sono un adattamento automatico o un benchmark hardware.

| Modalità | Limite del rapporto pixel | Ombre | Bloom |
|---|---|---|---|
| Leggera | 1× | Disattivate | Escluso, rendering diretto |
| Bilanciata — iniziale | 1,35× | Mappa 1024×1024 | Attivo |
| Alta | 1,75× | Mappa 2048×2048 | Attivo |

Il rapporto effettivo è il minimo fra rapporto del dispositivo e limite scelto:
su uno schermo a 1× non si promettono più pixel con Alta; cambiano le ombre.
Con un dispositivo a 2×, passare da 1,35× a 1× riduce di circa il 45% i pixel del
buffer principale. È un calcolo sulle dimensioni, non una misura del frame rate.
Ombre e bloom aggiungono altri costi; geometrie e materiali di base restano uguali.

I segnali funzionali non vengono disattivati: preparazioni, aree di danno,
proiettili, bersaglio, vita e numeri d’impatto. Le regole di combattimento non
leggono il livello grafico. MSAA e contesto WebGL non vengono ricreati a ogni
cambio. Le vecchie mappe d’ombra vengono eliminate quando cambia risoluzione;
il composer segue lo stesso rapporto del renderer.

Modificare qualità non riavvia la partita. Alla rotazione/ridimensionamento si
azzera l’input trattenuto per evitare movimento o attacco bloccati mentre cambia
la disposizione dei comandi. Nessuna preferenza o statistica viene inviata online.

## Codice e prove

- src/graphics-quality.js: profili immutabili, limiti e fallback per input invalidi.
- visuals/environment.js: configurazione ombre e percorso diretto/composer.
- runtime.js: applicazione del profilo e resize; ui.js/style.css: controllo.
- tests/graphics-quality.test.mjs: rapporti, limiti, valori non finiti, fallback.
- scripts/browser-check.mjs: attraversa le tre modalità, controlla width/height
  reali del canvas e produce test-results/*-graphics.json. Viewport mobile con
  deviceScaleFactor 2, poi percorso completo in modalità Leggera.

Esiti finali in HANDOFF.md. Chromium software non sostituisce Safari fisico,
misure di temperatura, caricamento su rete mobile o verifica ergonomica. Il
chunk del motore oltre 500 kB resta un limite di caricamento da affrontare.

## Decisione successiva

Scegliere telefoni/PC di riferimento e misurare frame time, picchi e consumo
nella stessa scena e con impostazioni dichiarate. Soltanto dopo valutare default
per dispositivo o un adattamento automatico. Non compensare problemi di codice
abbassando silenziosamente la qualità a ogni cambio di area.
