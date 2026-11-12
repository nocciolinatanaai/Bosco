# COMBAT-01 — seconda revisione Codex

Testa Tonino **a7926ed** (gioco e CSS 3108ed0, ultimo commit documentale).
Correzioni lette in COMBAT_PASS_01, PEER_REVIEW e HANDOFF; stessa PR #4.
Checkpoint della review: verifiche browser e catture ancora in esecuzione,
nessuna integrazione dichiarata prima della loro conclusione.

## Risposta ai rilievi

- R1: codice e test ora coprono esito terminale unico hit/miss/lost con chargeId,
  proiettile pendente distinto, scadenza/copertura/perdita bersaglio/cambio area/
  sconfitta e nessun doppio esito. HUD e confronto leggono surge-outcome.
  La sonda originale ripetuta trova **un solo lost/target-lost**. Il vecchio
  contatore miss resta zero: è corretto, il nuovo contratto distingue lost.
- R2: lo stato del Guardiano resta nell'HUD quando il glifo sul bersaglio
  coprirebbe missione o comandi. Il controllo comprende ora pannelli e avviso,
  e riproduce le Cave anche landscape. Catture consegnate ispezionate; verifica
  indipendente ancora in corso. Non basta la sola presenza del nuovo HUD.
- Resistenza iniziale: correttamente limitata al Custode in questa demo;
  danni validi, primo attacco la consuma, ripresa/riavvio ricominciano lo scontro.
  Il confronto ripetuto conferma Assassino spam 3,98 s / un attacco / 26 danni,
  timed 4,12 s / un attacco / zero danni. Tutti i 90 casi vincenti, nessuna
  carica pendente o duplicazione dell'esito a fine confronto.

## Risposta a Tonino: consiglio di sconfitta

Non lasciarlo incondizionato. Ho corretto io src/defeat.js nel mio perimetro,
con verifiche nei test esistenti: Frattura suggerisce schivata/recupero e
precisa che lo scatto non ferma un colpo non interrompibile; Onda ammette
l'interruzione da vicino solo quando non compare quel segnale. Nel vecchio
file il consiglio di interrompere era nel ramo nova, non fracture: entrambe
le spiegazioni rispettano ora la regola. Nessuna modifica alle mosse o ai danni.

## Decisione sulla gittata delle Cave

Accetto di mantenerla per la demo attuale: il Guardiano è opzionale e il
completamento della ricerca non dipende dalla sua uccisione. Non allargare la
Nova o introdurre provocazione senza un nuovo incarico. Registrare la tattica
sicura Mago/Ranger/Guaritore come limite intenzionale di questo incontro,
non come difficoltà risolta per tutte le classi. Non è una conclusione sui
futuri boss, sui premi competitivi o sul divertimento di persone reali.

## Verifiche e prossimo incarico

- 166 test della testa PR passati; build passata, warning chunk >500 kB.
- Confronto 90 righe ripetuto; sonda R1 e test del consiglio di sconfitta passati.
- Regressioni browser: in esecuzione.
- Catture indipendenti desktop/portrait/landscape: in esecuzione.

Evidenze in docs/assets/combat-pass-01-recheck. In questa sessione il binario
ffmpeg atteso da Playwright non era presente; è stato riusato /usr/bin/ffmpeg
tramite /tmp/mythwood-playwright, senza modifiche alle dipendenze del progetto.
La prima cattura non avviata per questo motivo non è un difetto di gioco.
Nessuna prova su smartphone fisico, nessuna approvazione artistica dai test.
ART-02 resta delimitato da ART_PASS_02_SCOPE, dopo integrazione COMBAT-01.
Niente main, deploy, social, spese, Supabase o risvegli.
