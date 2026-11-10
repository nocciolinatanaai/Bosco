# Custode — due attacchi da imparare

10 novembre 2026, Codex. Prova locale, numeri da validare con persone.
Il sigillo e la sequenza echi → ricordo → evoluzione → Custode sono preservati.

| Mossa | Centro fissato alla preparazione | Raggio | Preparazione | Danno | Recupero | Risposta suggerita |
|---|---|---|---|---|---|---|
| Frattura | Posizione del giocatore | 3,6 | 1,15 s | 26 | 1,5 s | Spostarsi dal punto segnato, poi rientrare |
| Onda del sigillo | Posizione del Custode | 5,2 | 1,65 s | 32 | 2 s | Allontanarsi dal Custode o interromperlo da vicino |

Le mosse si alternano deterministicamente; il conteggio avanza all’inizio della
preparazione, anche se il giocatore la interrompe. Il Custode non insegue né
sposta il punto mirato durante la carica. Non sono proiettili o onde fisiche:
il cerchio intero viene valutato una volta all’impatto, con la normale protezione
dello scatto e il breve intervallo di protezione dopo aver subito danni.

Frattura usa una posa principalmente di un braccio; Onda solleva entrambe le
braccia e aggiunge un secondo contorno al cerchio. L’HUD mostra il nome, il
comportamento suggerito e i secondi rimasti. Colori diversi aiutano, ma nome,
posa e doppio contorno distinguono le mosse anche senza affidarsi solo al colore.
Non sono ancora animazioni artistiche definitive né un collaudo di accessibilità.

Passo di risonanza può interrompere entrambe le cariche se parte entro 3,2 unità:
lo scatto può servire a difendersi, controllare o riavvicinarsi. Il prezzo resta
30 vigore. Non sono aggiunte mosse impossibili da evitare o vulnerabilità a pagamento.

## Implementazione

- src/enemy-attacks.js: profili immutabili e preparazione della mossa.
- src/combat.js: inseguimento, impatto unico, recupero e interruzione.
- src/visuals/telegraph.js: geometria unitaria scalata al raggio reale. Cambiare
  mossa non ricrea geometrie; contorno e riempimento seguono lo stesso fattore.
- src/visuals/actors.js: pose; runtime.js: testo e collegamento alla scena.
- tests/guardian.test.mjs: sequenza, centri, danno, uscita, interruzione,
  corrispondenza del cerchio e pose finite.

## Prove e domande aperte

La suite verifica logica e geometria. Il browser ha osservato entrambe le
cariche e completato il frammento su desktop/mobile; risultati in HANDOFF.md.
Una vittoria automatica del Ranger non prova il bilanciamento delle sei classi.

Da verificare con persone: riconoscere le due mosse senza aiuto, reagire dopo
un errore, capire quando rientrare. Misurare anche smartphone reali e frame time.
Audio, collisioni complete, varietà dei mostri, immunità alle interruzioni e
un eventuale cambio di fase del boss restano decisioni da valutare, non aggiunte.
