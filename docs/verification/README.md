# Rapporti del checkpoint verificato

- browser-latest.json: esito per viewport, commit sorgente verificato e hash
  della build, del runner e del ritratto. Chromium con rendering software.
- unit-latest.json: risultato di npm test, inclusi dati PostgreSQL sintetici.
- audio-latest.json: 17 cue renderizzate con Web Audio nativo, silenzio e
  cancellazione verificati; non una valutazione artistica o ascolto su hardware.
- render-buffers.json: dimensioni reali del canvas nelle tre modalità; non FPS.

I rapporti si riferiscono al commit sorgente indicato, non a qualsiasi modifica
successiva del ramo. La consegna documentale che li contiene può avere un commit
più recente, senza cambiare il codice verificato. Non sono attestazioni di
sicurezza, bilanciamento o prestazioni su iPhone fisico.

Il runner salva anche durante l’esecuzione test-results/browser-report.json,
con stato running/passed/failed e hash. Quella cartella è ignorata da Git; nella
repository vengono copiati soltanto i rapporti revisionati del checkpoint.


Il rapporto browser corrente include un opt-in esplicito a localStorage. Il valore
persistentEntries: 0 riguarda la conclusione dopo cancellazione, non l'intero
percorso. storageFallbacks registra le prove separate di dati corrotti e API
negata. I rapporti audio/rendering precedenti mantengono il proprio commit.


checkpoint-ui-latest.json documenta la prova mirata della UI della build successiva:
stringa corretta, fixture con autosave spento, cancellazione annullata e ripresa.
Il commit applicativo e l'hash del runner sono distinti; il runner riutilizzabile
è scripts/checkpoint-ui-check.mjs. La prova non ripete tutta la campagna.


ranger-latest.json: contrattacco con input tastiera/touch e clock browser avanzato
a passi di 100/50 ms. Tappa sintetica, nessuna modifica dello stato interno;
non è un collaudo hardware. Commit applicativo distinto dall'hash del runner.
La regressione generale e le catture usano tempo normale in browser-latest.json.


garden-latest.json: percorso UI a tempo normale, migrazione v1→v2, bussola,
ricarica, segnale e ritorno; viewport mobile DPR 1, modalità Leggera. Contatore
WebGL createBuffer durante tre rivisite a caldo: non misura tutte le allocazioni
GPU, picco di memoria o FPS. Nessuna prova su telefono reale.
