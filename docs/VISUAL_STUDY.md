# Studio visivo 01 — Piazza del ritorno

Obiettivo del lavoro corrente: trasformare la prima arena in una scena
renderizzata più curata. Il mockup approvato resta il riferimento; questo
studio non sostituisce l'approvazione del risultato e non promette quella fedeltà.

## Interventi

- Modulo scena separato dalle regole: src/visuals/.
- Arcate a conci, colonne con basamenti, binari, facciate, banchi, stendardi,
  detriti, radici e crescita vegetale. Una cornice urbana, oltre il solo pavimento.
- Materiali con colore, rugosità e normali procedurali; ambiente per riflessi,
  illuminazione direzionale e luce del varco.
- Portale con shader animato, alone luminoso contenuto e particelle.
- Figura umanoide originale con articolazioni, volto, capelli, armatura, mantello
  e oggetti di classe. Non è ancora un cast di sei modelli definitivi.
- Guardiano con piastre, nucleo, radici, mani e corona; animazione della preparazione
  dell'attacco collegata alla regola del combattimento.
- Camminata e attacco delle braccia, movimento del mantello e opzione sistema
  di riduzione del movimento; nessuna animazione cinematografica dichiarata pronta.
- Statiche unite per materiale per contenere le chiamate di rendering.

## Materiali esterni

Esaminati Kenney Animated Characters Retro e un possibile pacchetto KayKit.
Non importati: il primo non corrisponde al riferimento, il secondo URL non è
stato trovato. Nessun acquisto effettuato e nessuna licenza presunta.

Individuato ambientCG PavingStones142 tramite API ufficiale: pacchetto 1K-JPG.
La pagina presenta l'asset come Public Domain. Il download reindirizza a
acg-download.struffelproductions.com e il proxy lo blocca. Richiesta l'aggiunta
del dominio al proprietario. Nessun asset ambientCG è incluso finché il download
e la verifica della provenienza non saranno completati; le mappe correnti sono
generate dal nostro codice, non fotografie copiate.

## Verifica necessaria

Catturare immagini reali di desktop e mobile dalla build. Controllare camera,
leggibilità del personaggio e del boss, UI, errori shader, riavvii e isolamento
rete. Il rendering software nel runner non misura le prestazioni di un telefono.

Confrontare con il concept per composizione, palette, dettaglio, personaggi,
materiali e movimento. Registrare le distanze rimaste. Non promuovere il risultato
come equivalente al concept o usarlo automaticamente sui social.

## Limiti del lavoro

Scena circoscritta, arte procedurale ancora da rifinire, nessun asset umano
scansionato o animazione scheletrica importata, nessun multiplayer o mondo vasto.
La nuova inquadratura non dimostra qualità o prestazioni sull'intera mappa futura.
