# Riprendere una spedizione sul dispositivo

Salvataggio facoltativo, inizialmente spento. Attivabile nella selezione o in
Comandi. Non serve un account e non viene inviato al server. Lo scopo è poter
interrompere la prova senza ripetere tutte le tappe già concluse.

Un solo slot per origine/browser: `mythwood.checkpoint.v1` in localStorage.
I cinque campi sono `version: 1`, `autoSave` booleano, `role` fra le sei classi,
`stage` e `traces` (intero 0–3). Nessun identificativo, data, posizione arbitraria,
credenziale, inventario, salute o stato parziale del combattimento. Le preferenze
audio e qualità grafica continuano a durare solo nella sessione.

| Tappa | Ripresa |
| --- | --- |
| `arrival` | Ingresso: echi e Custode ricreati |
| `awakened` | Ricordo accolto, echi liberati, Custode da affrontare |
| `guardian` | Custode sconfitto, accesso al sentiero, 0–3 tracce conservate |

Salvataggio all'avvio e dopo risveglio, vittoria o ogni traccia. La ripresa
restituisce vita e vigore pieni, senza azioni/proiettili/recuperi precedenti;
il combattimento interrotto ricomincia. I dialoghi delle tappe concluse non si
ripetono. Dopo la vittoria la posizione riparte dal sentiero o dall'ultima traccia.
Con autosalvataggio attivo, Riprova usa la tappa salvata. Senza, riparte da zero.

Disattivare autosalvataggio conserva la tappa e registra `autoSave: false`:
anche dopo ricarica la ripresa resta disponibile senza nuove scritture automatiche.
Elimina tappa chiede conferma e rimuove soltanto la chiave Mythwood; non azzera
il resto di localStorage e non interrompe la spedizione aperta. Nuova spedizione
sostituisce il vecchio slot solo con autosalvataggio attivo; la selezione lo segnala.

Lettura limitata a 1024 caratteri, schema esatto e classi/tappe/tracce validate.
Dati corrotti restano presenti fino a cancellazione esplicita o sostituzione
voluta. API negata o quota esaurita disabilitano il salvataggio, senza bloccare
la partita. Prima delle scritture si confronta il valore letto precedentemente:
una modifica da altra scheda sospende l'autosalvataggio. È un controllo ottimista,
non una transazione atomica né una garanzia contro scritture simultanee.

I dati locali possono essere alterati dal giocatore. Nessun valore di questo
slot deve diventare autorità per economia, premi o multiplayer futuri. Non c'è
sincronizzazione cloud, esportazione o migrazione di versioni ancora implementata.
Cancellare i dati del browser o cambiare origine/dispositivo perde lo slot.

Verifica: nove test di dominio/storage in checkpoints.test.mjs; il runner browser
include opt-in, avanzamento, ricarica/ripresa, disattivazione persistita,
cancellazione selettiva, corruzione e API bloccata. Leggere HANDOFF e il commit
del rapporto per distinguere controlli implementati da esecuzioni completate.
