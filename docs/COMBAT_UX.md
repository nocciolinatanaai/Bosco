# Studio di combattimento e comandi

10 novembre 2026. Autore: Codex. Richiesta: lavorare su gameplay, animazioni,
comandi e UX. Prova action locale; non conclude il confronto con i turni e non
è il kit finale delle sei classi. Nessun servizio online collegato.

## Decisione che il giocatore deve poter prendere

Osservare la preparazione → uscire dalla zona o interrompere → colpire durante
il recupero. L’attacco base resta disponibile mentre l’abilità recupera. La
schivata interrompe il proprio attacco: salvare vita può costare un’occasione.
Il recupero nemico è esplicitato anche con testo, non soltanto con il colore.

## Comandi implementati

| Azione | PC | Touch |
|---|---|---|
| Movimento relativo allo schermo | WASD / frecce, clic sul terreno | Joystick analogico; frecce opzionali in Comandi; tocco sul terreno |
| Seleziona e avvicinati al nemico | Clic sul modello | Tocco sul modello |
| Attacco base / combo | J o pulsante Attacco, anche tenuto premuto | Pulsante Attacco, anche tenuto premuto |
| Abilità di classe | Q o pulsante | Pulsante con recupero in secondi |
| Scatto | Spazio o pulsante | Pulsante Scatto |
| Pausa | Esc / Pausa | Pausa |
| Primo risveglio | Accogli il ricordo dopo i due echi; E se disponibile | Accogli il ricordo prima del Custode |

Il joystick mantiene la cattura del dito anche fuori dal suo cerchio. Movimento
e attacco possono essere usati con due dita. Rilascio, cancellazione, perdita
della cattura, cambio finestra, scheda nascosta e apertura informazioni azzerano
i comandi trattenuti. Le preferenze rimangono solo nella sessione corrente.
La tastiera mantiene l’attivazione nativa dei pulsanti informativi con Spazio.

## Regole e differenze reali

- Base: sequenza di tre colpi, il terzo più forte; il Combattente colpisce più
  nemici frontali al terzo colpo. Buffer dell’attacco base soltanto negli ultimi 180 ms del recupero. Un’abilità
  richiesta durante un attacco base viene accodata e parte appena termina: non
  serve rilasciare l’attacco e cercare una finestra di un singolo frame.
- Ogni azione ha preparazione, un impatto e recupero. Il danno non avviene al
  clic; la posa animata usa gli stessi tempi della simulazione.
- Ranger, Mago e Guaritore lanciano proiettili con tempo di viaggio. Il bersaglio
  viene acquisito all’inizio; il proiettile in volo lo segue. Non sono frecce
  fisiche con collisione contro muri o schivata laterale: da progettare.
- Mago: esplosione nel punto mirato alla partenza, evitabile uscendo dall’area.
  Tank: urto che interrompe e barriera temporanea. Assassino: danno extra contro
  una carica in corso. Guaritore: impulso offensivo, interruzione e cura personale.
  Ranger: freccia potenziata che interrompe. Nessuna cura di compagni ancora presente.
- Scatto: 30 vigore, durata 240 ms, invulnerabilità 180 ms, recupero 650 ms.
  Il vigore rigenera a 20/s dopo 750 ms; massimo 100. Annulla l’azione anche
  prima dell’impatto; non restituisce il recupero dell’abilità già avviata.
- Nemici: inseguimento, carica su posizione fissata, impatto, recupero, interruzione.
  Echi: carica 900 ms, recupero 1 s. Custode: Frattura 1150 ms / 1,5 s;
  Onda 1650 ms / 2 s, con centro sul boss e raggio più ampio (GUARDIAN.md).
  Il cerchio mostra il raggio effettivo e il riempimento il tempo restante.
- Sconfitta: combattimento fermo, possibilità di riprovare o cambiare classe.
  Risveglio: dopo i due echi, prima del Custode. Una scena introduce Liora;
  lo scatto acquista un impulso offensivo al punto di partenza, oltre agli
  incrementi numerici. Specifiche e limiti in EPISODE_01.md.

## Animazioni e feedback

Pose articolate di preparazione, fendente alternato, doppie lame, scudo, tiro
con arco e lancio magico. Scatto inclinato, guardiano che carica e abbatte le
braccia. Scie brevi, impatti, frecce/dardi visibili, numeri di danno/cura,
anello del bersaglio, vita degli echi e stato del boss. Sono animazioni
procedurali originali: niente motion capture, modelli finali o audio ancora.

Niente scuotimento della camera. Riduzione del movimento da preferenza di
sistema e interruttore: riduce effetti decorativi e feedback intensi, mantenendo
segnali funzionali. La leggibilità e l’accessibilità complete non sono certificate.

Interfaccia separa vita/vigore, azioni e navigazione; missione comprimibile su
telefono, bersaglio e recuperi espliciti, informazioni e pausa senza perdere lo
stato precedente. Disposizioni portrait/landscape con aree sicure CSS.

## Architettura e verifica

`combat.js` contiene regole senza DOM/Three.js; `roles.js` i kit immutabili;
`controls.js` trasforma gli assi rispetto alla camera. `ui.js` crea il DOM;
`runtime.js` collega input, simulazione a passo fisso di 1/60 s, eventi e viste.
`visuals/actors.js` anima le pose; `visuals/combat-effects.js` gestisce effetti
brevi limitati e geometrie eliminate a fine vita. Nessuna autorità server.

Le verifiche e i risultati correnti sono registrati in HANDOFF.md. Gli screenshot
provengono dalla build reale, con Chromium software: non attestano velocità,
fluidità o ergonomia su un iPhone fisico.

## Prossime prove necessarie

1. Prova umana: capire senza spiegazioni attacco, carica, schivata e recupero;
   registrare dove il giocatore non comprende il danno subito.
2. Safari/iPhone e Android reali: due dita, interruzioni, rotazione, tastiera,
   contrasto all’aperto, frame time e temperatura. Dispositivi da scegliere.
3. Valutare bilanciamento, auto-mira, durata combo, invulnerabilità e distanze;
   nessun dato di engagement o divertimento è stato raccolto.
4. Attacchi del boss realmente diversi, collisioni coerenti col mondo,
   audio, tutorial da validare con persone e evoluzione specifica per una classe.
5. Kit cooperativi soltanto dopo una simulazione autorevole e prove multi-client.


Dopo aver chiuso informazioni, movimento o attacco da tastiera riportano il
focus al canvas. Spazio su un pulsante del menu continua ad attivare quel
pulsante; dopo aver ripreso i comandi di gioco torna a essere lo scatto.
Nessun trasferimento del focus durante la compilazione di input o nei dialoghi.
Ranger risvegliato: nuova finestra di contrattacco in RANGER_EVOLUTION.md.


## Primo artefatto — Sigillo di Liora

Accordatura opzionale nel ricordo prima del Custode, modificabile dal menu
Sigillo in condizioni sicure. Custodia protegge dopo una schivata d'impatto;
Impeto recupera vigore e anticipa l'abilità. Nessun quarto comando obbligatorio
nel combattimento. Regole, limiti e numeri in ARTIFACT_01.md. La scelta provvisoria
non è salvata prima di accogliere il ricordo. Checkpoint v3 con lettura v1/v2.

## Guardiano del rintocco nelle Cave

Volume circolare fermo, carica 1,6 s e recupero 2 s. Uscire dal volume evita il
colpo; schivare mentre arriva attiva il Sigillo. L'impulso di risonanza può
interromperlo da vicino, mentre le classi a distanza possono aggirarlo. Nessun
obbligo di uccisione per la lente. Vedere CAVES_01 per numeri e limiti provvisori.
