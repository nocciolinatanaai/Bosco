# Daria — prima proposta di Ranger

Concept originale del 10 novembre 2026, generato con image_gen da Codex nel
mandato di sviluppo autonomo. **Proposta creativa**, non personaggio approvato,
modello 3D o cattura del gioco. Prima traduzione procedurale ora implementata
in src/visuals/ranger.js, in verifica; non è una scultura finale. File: assets/daria-ranger-concept.png.

La tavola mostra base, risonanza, retro e dettagli dell'equipaggiamento. È un
riferimento artistico a tre quarti, non una tavola ortografica pronta per rigging.
Proporzioni, presa, corde dell'arco e abiti vanno verificati nella traduzione 3D.
Non viene caricata nel client o usata per fingere una scena già implementata.

## Identità proposta

Adulta, circa 28 anni, ex corriera di spedizione. È abituata a trovare un percorso
quando quello ufficiale finisce, e porta con sé un taccuino di mappe bruciato.
Preferisce correggere un errore concreto a raccontare quanto è stata coraggiosa.
La sua precisione è utile; la fretta di avere un piano può impedirle di ascoltare.

Possibile legame con la trama: una consegna di rientro le è tornata indietro
senza più il nome del destinatario. Vuole capire chi abbia cancellato quel nome.
È un aggancio da discutere, non una nuova scena già presente o una spiegazione
definitiva del mistero di Liora. Non rinominare automaticamente in Daria le altre
cinque classi: classe e personaggio restano distinti.

Silhouette: mantellina corta diagonale terracotta su una spalla, sciarpa salvia,
treccia scura laterale e faretra inclinata. Giacca petrolio, pantaloni e stivali
da viaggio, ottone consumato. Arco riconoscibile con ramo superiore asimmetrico.
Questi elementi devono restare leggibili da lontano, senza dipendere dal volto.

## Trasformazione coerente

La risonanza mantiene la persona e il suo equipaggiamento: prolunga l'arco con
lamine luminose e rivela un segno d'oro sulla fibbia del mantello. Il tiro doppio
è l'interpretazione Ranger del ricordo di ritirata: cogliere l'impegno del nemico
e rispondere dall'apertura. Il contrattacco è già nella logica; questo aspetto
è ora prototipato nel modello procedurale, ancora da valutare visivamente.

Le due frecce illustrate sono una sintesi grafica. Nella simulazione la seconda
parte 140 ms dopo la prima e infligge il 65% del danno base: non cambiare le
regole per farle coincidere con una singola immagine.

## Incarico proposto per Claude: un personaggio rifinito

Partire dal commit corrente e registrare ambito in COLLABORATION. Nessun incarico
è ancora stato accettato da Claude. File probabili: actors.js o nuovo modulo
Ranger, eventuali asset originali, test visuali e documento di provenienza.
Concordare prima qualunque sovrapposizione con runtime/combat.

1. Proporre la traduzione 3D e contestare gli elementi poco realizzabili della
   tavola. Preservare silhouette, abiti pratici e riconoscibilità nella risonanza.
2. Consegnare geometria originale versionata oppure modello glTF/GLB con sorgente,
   autore, provenienza e condizioni d'uso. Niente asset esterni acquistati o
   dipendenze remote senza il mandato necessario. Un PNG non è un modello.
3. Curare idle, corsa, preparazione dell'arco, rilascio e scatto. Allineare rilascio
   alla fase d'impatto già esistente; il rendering non deve assegnare danni.
   Controllare appoggio dei piedi e presa, non soltanto aggiungere particelle.
4. Separare visivamente base, risonanza e contrattacco pronto. Conservare effetti
   ridotti e non cambiare le altre cinque classi o la loro logica.
5. Confrontare catture reali nella stessa scena/camera/qualità: idle, tiro e
   scatto, prima/dopo. Controllare anche 390×844 e landscape; eventuale vista
   ravvicinata di authoring va distinta dalla camera del gioco.
6. Contare geometrie, triangoli, materiali e byte del modello; dichiarare variazioni
   di caricamento/draw call osservate. Un budget iniziale da discutere è 20k
   triangoli per questo personaggio e texture compatte: non prova prestazioni
   sul telefono. Niente allocazioni per frame o residui al cambio classe.
7. Eseguire i test pertinenti e aggiornare HANDOFF. Non chiamare il blocco completo
   se restano soltanto il vecchio corpo condiviso e pochi accessori aggiunti.

Il criterio è un miglioramento visibile e giocabile rispetto al prototipo,
valutato con catture confrontabili, non il numero dei file. L'incarico non promette
fedeltà al concept senza una verifica né autorizza pubblicazione o acquisti.

## Provenienza

PNG, 2.834.111 byte. SHA-256:
561acec912c657c35fa830932d8f2c8b728cee5269c074a60308eb6ebd57bec4.
Generazione originale: tre viste di Ranger adulta, abiti pratici, mantello
terracotta, sciarpa salvia, arco normale/risonante; niente immagini di terzi
fornite al generatore. Direzione cromatica riferita al concept Mythwood approvato.
Nessun asset esterno comprato. Non implica approvazione del nome o del cast.
