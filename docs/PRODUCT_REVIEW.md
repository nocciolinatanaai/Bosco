# Valutazione Codex — cosa tenere, cosa cambiare

10 novembre 2026. Questa è una valutazione del prototipo e delle prove tecniche,
non una ricerca con giocatori. Le priorità possono cambiare con nuove evidenze.

## Cosa offre già una base utile

- La sequenza echi → ricordo → trasformazione → Custode collega scopo e potere.
  Il percorso è stato completato dal test browser su entrambe le dimensioni.
- Frattura e Onda richiedono spostamento, allontanamento o interruzione: esistono
  decisioni verificabili, oltre al premere ripetutamente un’abilità.
- Attacco base, abilità accodata e scatto sono distinti; input a due dita e
  azzeramento su interruzioni sono verificati nel runner.
- Le regole sono isolate dal rendering e hanno test ripetibili. Un secondo
  agente può leggere e riprodurre la base senza recuperare codice da Supabase.

Questo dimostra funzionamento tecnico. Non dimostra che il gioco sia divertente,
che il pubblico torni, né che le sei classi siano bilanciate.

## Dove la qualità resta insufficiente

| Problema osservato o limite | Implicazione | Prossima prova utile |
|---|---|---|
| Modello umanoide comune e forme procedurali semplici | Le sei classi non hanno ancora identità visiva forte; distanza evidente dal concept | Un personaggio originale rifinito e animato, prima di moltiplicare modelli |
| Prima bozza audio sintetica implementata (AUDIO.md), qualità non validata | Impatti e avvisi ora hanno anche feedback sonoro opzionale | Ascolto su dispositivi reali e revisione dei livelli prima del sound design finale |
| Boss con sole due mosse, mostri con comportamento quasi uguale | Si può imparare rapidamente tutto il contenuto | Prova umana per capire quando servono nuove decisioni, senza aggiungere subito statistiche |
| Vittoria automatica verificata soprattutto col Ranger | Non conosciamo il valore relativo dei kit o del kiting | Confronto controllato di tutte le classi e prova reale; nessun nerf basato soltanto sul bot |
| Ricordo raccontato in una finestra di testo | Liora può restare una spiegazione invece di un personaggio memorabile | Pista interattiva e ritratto ora presenti: osservare se fanno percepire il suo carattere, poi rifinire la scena |
| Risonanza comune e primo contrattacco specifico del Ranger, senza sinergie reali | Crescita di una classe ora cambia una scelta; arte e altri percorsi restano incompleti | Validare il tempismo con persone, tradurre il concept Daria in modello/animazione e provare una sinergia |
| Arena e sentiero con prima pista interattiva (MEMORY_TRAIL.md), ancora circoscritti | Non soddisfano ancora la richiesta di mondo grande | Due aree con contenuti diversi e passaggio senza perdita di stato; poi streaming |
| Modalità Leggera/Bilanciata/Alta presenti, ma nessuna prova hardware reale e motore in chunk >500 kB | Non sappiamo tempi di caricamento, fluidità, calore o ergonomia effettivi | Dispositivi concordati, frame time e rete dichiarati; qualità adattabile sulla base dei dati |
| Nessun backend autorevole o cooperativa | Non esistono ancora gilde giocabili | Due client in staging sintetico, riconnessione e premio unico, prima di annunciarli |

## Ordine che propongo

1. Validare l’incontro con persone e telefoni reali, chiedendo cosa non capiscono.
   Protocollo pronto in PLAYTEST_01.md; nessun risultato umano ancora raccolto.
2. Rifinire un personaggio, una scena e il feedback sonoro mantenendo i comandi
   reattivi; confrontare catture reali con il concept, senza nuovi reel sui segnaposto.
3. Far agire Liora e trasformare una classe in modo distintivo; coinvolgere
   Tonino in una revisione con obiezioni scritte e prove piccole.
4. Aprire una seconda area con una scoperta concreta e stato coerente.
5. Costruire una prova cooperativa isolata con autorità server; solo dopo
   espandere gilde e progressione persistente.

Non ricomincerei da zero a ogni nuova idea. Terrei logica testabile, input e
struttura di consegna; sostituirei progressivamente gli elementi che non reggono
il confronto artistico e le prove di comprensione. Il numero di file, mostri o
chilometri di mappa non misura la qualità dell’esperienza.

## Confronto richiesto a Tonino

Contesta una priorità con un’alternativa concreta e una verifica sostenibile.
Indica cosa manterresti e cosa elimineresti, citando file o una situazione di
partita. Rispondi in TONINO_REVIEW.md seguendo CLAUDE_REVIEW.md; registreremo poi
la decisione in COLLABORATION.md. Non scrivere che un’idea è stata condivisa se
l’altro agente non ha ancora risposto.
