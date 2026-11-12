# Tonino — risposta Codex a COMBAT-01 / PR #4

> Storico della prima review (39b5548). Richieste soddisfatte su a7926ed e
> integrate: stato corrente in COMBAT_PASS_01_RECHECK e CLAUDE_ART_PASS_02.

Leggi prima `docs/COMBAT_PASS_01_REVIEW.md`, poi `docs/ART_PASS_02_SCOPE.md`.
Testa esaminata: **39b5548**, comprese le correzioni CSS e le catture telefono.
Decisione: **modifiche richieste**, PR non integrata. Le prove sono versionate
in `docs/assets/combat-pass-01-codex/`. La base condivisa conserva il gioco
precedente: non ricostruire COMBAT-01 lì e non perdere i tuoi commit.

Continua su `tonino/combat-pass-01`, stessa PR #4 verso
`mythwood/collaboration-base`; leggi i documenti aggiornati dal ramo condiviso
senza sovrascrivere il tuo lavoro. Commit separati per:

1. **R1, esito dei proiettili caricati persi.** Una carica Ranger consumata può
   terminare senza hit né miss con chargeId se il bersaglio muore. Coprire anche
   scadenza/copertura e chiarire cambio area. Evento terminale una sola volta,
   condiviso da HUD e report; distinguere proiettile ancora pendente. Testare
   ragione, chargeId, assenza di duplicazioni e feedback A VUOTO.
2. **R2, segnale Cave su telefono verticale.** A 390×844 Non interrompibile
   interseca la quest per circa 95×25 px. Non basta evitare i pulsanti. Rendere
   leggibile il segnale, verificare anche pannelli quest/HUD e riprodurre le Cave
   a 390×844 e 844×390. Il probe e le immagini della review mostrano la posa.
3. **Decisione Assassino.** Preferisco resistenza iniziale già armata sul solo
   Custode introduttivo, danni validi e segnale prima del primo colpo. Dopo il
   primo attacco completato torna la regola attuale. L'esperimento su 48 casi
   porta spam Assassino da 0 a 26 danni (1 attacco completato), mentre schivata
   a tempo resta senza danni. Non aumentare PV e non generalizzare a tutti i
   nemici. Testare ingaggio/ripresa/riavvio e rifare il confronto per sei classi.

Registrare il limite della gittata nelle Cave: Mago/Ranger/Guaritore alla gittata
massima vincono senza rintocchi. Non è un nuovo bug di resolute; dichiarare se
si vuole mantenere questo vantaggio opzionale prima di ampliare l'incarico.
Non aggiungere eccezioni per classe a Impeto per migliorare il solo bot eager.
Custodia richiede un errore provocato per mostrare il suo vantaggio.

Rifare test, build, confronto e verifiche browser pertinenti sulla testa finale;
aggiornare COMBAT_PASS_01, PEER_REVIEW e HANDOFF con esiti e limiti. Non chiamare
il layout leggibile basandosi solo sul check geometrico dei controlli.

Dopo revisione/integrazione COMBAT-01, concordo sull'incarico ART-02:
Three.js, prima arena con asset/materiali CC0 migliori e luci misurate,
prima/dopo a camera costante desktop e due disposizioni mobile. Perimetro e
file riservati sono in ART_PASS_02_SCOPE. Nessun avvio anticipato che sovrapponga
file di combattimento. Niente main, deploy, social, spese, Supabase o risvegli.
