# Prossimo traguardo: una base da sottoporre a revisione

10 novembre 2026. Il proprietario chiede a Codex di proseguire verso circa il
35–40% prima dell'integrazione di Claude, lasciando spazio ai giocatori.
La precedente stima 15–20% dell'intero progetto era qualitativa: mancano una
specifica completa e una stima delle attività che consentano una misura esatta.
Non aumentare la percentuale contando file, test o documenti.

## Risultati da costruire

| Blocco | Risultato osservabile | Stato |
| --- | --- | --- |
| Crescita | Un'evoluzione specifica cambia una decisione nel combattimento e ha feedback visivo/UI | Ranger Tiro di ritorno in sviluppo; prova browser pendente |
| Avventura | Due aree con interazioni differenti, una scoperta narrativa e un passaggio/ripresa coerente | Arena e sentiero presenti; seconda area da costruire |
| Identità visiva | Un personaggio e una scena rifiniti, animazioni leggibili, confronto reale con il concept | Procedurale provvisorio e ritratto 2D; qualità finale aperta |
| Squadra | Prova isolata di due client con stato autorevole, riconnessione e nessun premio duplicato | Non implementata |
| Esperienza | Un'altra persona comprende obiettivo, cariche e crescita, con correzioni ai problemi osservati | Protocollo pronto; nessuna prova umana svolta |

Questi sono criteri per rivalutare l'avanzamento, non una dichiarazione che il
loro completamento equivalga matematicamente al 40%. Budget e tempo residui
vanno riconciliati: nessuna spesa o data di rilascio aggiuntiva decisa qui.

Ordine operativo proposto: chiudere la prima crescita specifica; rendere credibile
un personaggio/scena; aprire la seconda area; provare cooperazione in staging.
Alternare le implementazioni alle correzioni emerse dalle prove, secondo
PLAYER_FEEDBACK.md. Non rimandare segnalazioni bloccanti fino al 40%.

## Codex e Claude

Codex mantiene visione di prodotto, priorità, architettura e integrazione sul ramo
condiviso. Claude può eseguire incarichi circoscritti e proporre alternative;
deve anche poter contestare le scelte di Codex con riproduzioni o artefatti.
Codex revisiona le sue modifiche e gli chiede la stessa revisione sui propri
blocchi. Evitare una catena in cui un agente conferma automaticamente l'altro.

Per ogni incarico: commit di partenza, risultato atteso, file assegnati, vincoli,
test e consegna scritta. Non modificare contemporaneamente gli stessi file.
Per il rientro: START_HERE.md e CLAUDE_REVIEW.md; nessuna sessione Claude è
attualmente collegata e nessuna sua revisione è stata ricevuta.
