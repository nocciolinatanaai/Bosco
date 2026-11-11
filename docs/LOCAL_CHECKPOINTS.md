# Riprendere una spedizione sul dispositivo

Salvataggio facoltativo, inizialmente spento. Attivabile nella selezione o in
Comandi. Non serve un account e non viene inviato al server. Lo scopo è poter
interrompere la prova senza ripetere tutte le tappe già concluse.

Un solo slot per origine/browser: `mythwood.checkpoint.v1` in localStorage.
Il nome della chiave resta stabile; il formato corrente è v4. Gli otto campi sono
`version: 4`, `autoSave`, `role`, `stage`, `traces`, `garden`, `attunement` e `caves`.
`caves` contiene step (0–3), inside e wardenDefeated booleani. Richiede il
segnale del Giardino riportato (step 4); inside distingue la ripresa nelle Cave.
`garden` contiene `step` (0–4), `area` (plaza/garden), `sentryDefeated` booleano.
`attunement` è null, ward o surge; una scelta non nulla richiede una tappa dopo
il ricordo di Liora. Non si salvano bonus o recuperi temporanei del sigillo.
I file v1/v2/v3 vengono normalizzati in memoria senza scrivere: un successivo
salvataggio o cambio della preferenza scrive v4. Versioni ignote restano
illeggibili ma non vengono cancellate automaticamente. Nessun identificativo, data, posizione arbitraria,
credenziale, inventario economico, salute o stato parziale del combattimento. Le preferenze
audio e qualità grafica continuano a durare solo nella sessione.

| Tappa | Ripresa |
| --- | --- |
| `arrival` | Ingresso: echi e Custode ricreati |
| `awakened` | Ricordo accolto, echi liberati, Custode da affrontare |
| `guardian` | Custode sconfitto, accesso al sentiero, 0–3 tracce conservate |

Salvataggio all’avvio, risveglio, vittoria, tracce e transizioni del giardino e delle cave, oltre alla scelta della tecnica del sigillo.
Nel giardino si conservano ingresso, bussola, segnale, ritorno e sentinella
sconfitta; la ripresa ricrea l’ingresso sicuro e un eventuale combattimento
non concluso. La bussola è uno stato di missione, non un oggetto duplicabile. La ripresa
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
sincronizzazione cloud o esportazione. I vecchi client v1/v2/v3 non leggono il formato v4:
un rollback del client non è una migrazione inversa del salvataggio.
Cancellare i dati del browser o cambiare origine/dispositivo perde lo slot.

Verifica: test di dominio/storage in checkpoints.test.mjs; il runner browser
include opt-in, avanzamento, ricarica/ripresa, disattivazione persistita,
cancellazione selettiva, corruzione e API bloccata. Esecuzione completata su desktop/mobile simulato per sorgenti 2b832e8:
rapporto in verification/browser-latest.json. Non è un collaudo iPhone reale.


Prova UI rapida ripetibile: `npm run test:checkpoints` (in Cloud aggiungere
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium). Usa una tappa sintetica con due tracce,
verifica annullamento della cancellazione e ripresa con autosalvataggio spento
su due viewport. Non sostituisce il percorso completo di test:browser.


Blocco Giardino: nuovi test per migrazione v1 senza scritture e v2 sulle sei
classi. Leggere HANDOFF per distinguere la nuova verifica browser da quelle
precedenti, i cui rapporti indicano il proprio commit.

Cave: step 1 ricerca, 2 lente con sé, 3 restituita. Ripresa alla soglia,
Guardiano sconfitto conservato, combattimento parziale azzerato. Le transizioni
non curano; la ripresa segue il comportamento storico dei checkpoint.
