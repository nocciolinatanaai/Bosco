# COMBAT-01 — seconda revisione Codex

Testa Tonino **a7926ed** (gioco e CSS 3108ed0, ultimo commit documentale).
Correzioni lette in COMBAT_PASS_01, PEER_REVIEW e HANDOFF; stessa PR #4.
**Esito: approvata e integrata sul ramo di collaborazione**, merge 8d6d699.
Testo di sconfitta corretto in 82a9935. Verifica seriale dell’episodio completo
conclusa sulla build integrata; il primo tentativo fallito resta documentato sotto.

## Risposta ai rilievi

- R1: codice e test ora coprono esito terminale unico hit/miss/lost con chargeId,
  proiettile pendente distinto, scadenza/copertura/perdita bersaglio/cambio area/
  sconfitta e nessun doppio esito. HUD e confronto leggono surge-outcome.
  La sonda originale ripetuta trova **un solo lost/target-lost**. Il vecchio
  contatore miss resta zero: è corretto, il nuovo contratto distingue lost.
- R2: lo stato del Guardiano resta nell'HUD quando il glifo sul bersaglio
  coprirebbe missione o comandi. Il controllo comprende ora pannelli e avviso,
  e riproduce le Cave anche landscape. Catture consegnate ispezionate e prove
  indipendenti concluse nei tre formati: segnale 14 px, dentro viewport, senza
  taglio o collisioni con i pannelli; il tag sul bersaglio si nasconde sul telefono.
  Verificato anche il segnale iniziale del Custode prima di qualunque attacco.
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

- 166 test della testa PR passati; ripetuti e passati anche dopo integrazione
  e correzione del testo di sconfitta. Build finale passata, warning chunk >500 kB.
- Confronto 90 righe ripetuto; sonda R1 e test del consiglio di sconfitta passati.
- Cave, Ranger, Giardino e checkpoint: desktop/mobile passati sulla testa PR.
- Episodio completo: primo tentativo fallito al limite di 60 s sul Custode,
  27 PV rimasti, giocatore 104/130 PV. Immagine diagnostica mostra un altro
  impatto, quindi il combattimento continuava; non è prova sufficiente a
  escludere un problema. Ripetizione seriale **passata**, desktop/mobile e fallback
  storage corrotto/bloccato, stessa logica di test e stessa scadenza di 60 s.
  Nessun aumento del timeout, nessun hook o cambio di danno per far passare il test.
  Il risultato sostiene l’ipotesi del carico concorrente, senza dimostrare che
  il runner sia privo di scadenze intermittenti in ogni ambiente.
- Catture indipendenti mirate: apertura Custode e Guardiano superati in
  1440×900, 390×844 e 844×390, senza video. La cattura completa con video è
  stata interrotta in setup desktop per costo/attesa; non dichiarata passata.
  Le altre immagini di combattimento consegnate da Tonino sono state ispezionate,
  non riprodotte tutte dal nuovo driver.

Evidenze in docs/assets/combat-pass-01-recheck. In questa sessione il binario
ffmpeg atteso da Playwright non era presente; è stato riusato /usr/bin/ffmpeg
tramite /tmp/mythwood-playwright, senza modifiche alle dipendenze del progetto.
La prima cattura non avviata per questo motivo non è un difetto di gioco.
Nessuna prova su smartphone fisico, nessuna approvazione artistica dai test.
ART-02 resta delimitato da ART_PASS_02_SCOPE, dopo integrazione COMBAT-01.
Niente main, deploy, social, spese, Supabase o risvegli.

## Metodo delle catture indipendenti

layout-probe.mjs deriva dal runner di Tonino e conserva fixture, comandi reali,
clock a passi e controlli dei pannelli. Mette in pausa il clock prima della
navigazione, avanza 500 ms di inizializzazione e non registra video; riprende
il tempo per la cattura finale di ciascun contesto, che poi chiude. Non cambia
viewport CSS, qualità o codice applicativo. Il report conserva hash della build.
I percorsi originali del report sotto test-results corrispondono ai file
versionati qui con lo stesso nome. Non è una misura di fps né un playtest umano.

ART-02 può iniziare dalla base aggiornata: incarico in CLAUDE_ART_PASS_02 e
file riservati in COLLABORATION. Nessuna riapplicazione di 3222cd1 o COMBAT-01.

Riproduzione delle prove mirate dalla base integrata:

```sh
npm run build
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium node docs/assets/combat-pass-01-recheck/layout-probe.mjs test-results/recheck-layout
node docs/assets/combat-pass-01-recheck/projectile-loss.mjs test-results/projectile-loss-recheck.json
```

Non ricostruire dist mentre un altro controllo browser la sta usando.

Correzione successiva del solo report in browser-check: azzerare stage a
starting al cambio viewport. Prima conservava idle-defeat del desktop durante
l'avvio mobile, inducendo una lettura errata dello stato. Non modifica input,
asserzioni o scadenze. Il report della prova conclusa conserva l'hash del runner
prima di questa correzione; verifica sintattica della riga aggiornata separata.
