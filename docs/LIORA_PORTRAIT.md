# Primo volto di Liora

10 novembre 2026, Codex. Ritratto illustrato generato con image_gen per dare un
volto alle scene del ricordo. È un’interpretazione originale proposta, non un
modello 3D o la qualità già ottenuta per i sei personaggi giocabili.

L’immagine usa la palette blu/viola e oro del mondo e dettagli coerenti con la
proposta di personaggio: bussola, mappe, vestiti da spedizione, atteggiamento
vigile e protettivo. Non sono copiati personaggi, volti, marchi o screenshot di
altri giochi. Provenienza e hash in public/art/README.md.

## Integrazione

Il ritratto compare nelle scene di Liora, con testo e pulsante espliciti. Il
primo download avviene quando si apre il ricordo; le scene successive riusano
lo stesso elemento. Non blocca l’accesso al testo o il proseguimento della partita.
In caso di errore viene nascosto e il layout torna al testo. Focus iniziale sul
titolo della scena e descrizione accessibile del ritratto; nessuna animazione
obbligatoria del volto o voce sintetizzata di una persona.

Il PNG è ancora circa 2,4 MB: la richiesta differita evita peso nella selezione,
ma non risolve il costo su rete lenta. Non descriverlo come asset finale ottimizzato.
La miniatura va valutata nel contesto della finestra su telefono; il confronto
artistico con il modello di base del gioco resta aperto.

Il pannello Comandi e audio ha inoltre la barra Chiudi sempre visibile durante
lo scroll delle impostazioni. È una correzione di accesso ai controlli, non una
certificazione completa di accessibilità.

## Prove

Runner: nessuna richiesta del ritratto nella selezione, un caricamento quando
serve, immagine decodificata con dimensioni native non nulle, titolo a fuoco,
scene e percorso completabili. Sul viewport mobile il fallback UI viene
simulato con un evento error: non equivale a un test completo di guasti di rete.
Risultati finali in HANDOFF.md; nessun collaudo Safari/iPhone fisico.
