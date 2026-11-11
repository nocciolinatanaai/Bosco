# Il sigillo di Liora — primo artefatto giocabile

Il proprietario sposta la priorità su trama, gameplay, personaggi, artefatti,
magie, tecniche e mondo aperto. La grafica rimane provvisoria; verifiche visive
periodiche per comandi, leggibilità, ingombri e feedback restano necessarie.
Questa è una prima fetta giocabile, non l'intero sistema RPG o un open world.

## Storia e scelta

Il ricordo di Liora contiene un sigillo inciso con un nome cancellato. La sua
promessa di non lasciare indietro le persone si traduce in due accordature:
Custodia di chi ritorna o Impeto di chi apre la strada. È una proposta narrativa
aggiunta al frammento già esistente, senza riscriverne il finale o dichiarare
nuovo canone approvato. Si sceglie prima del Custode, non dopo l'ultimo scontro.

La scelta nel ricordo è provvisoria fino ad «Accogli il ricordo». Si può continuare
senza scegliere e usare successivamente il menu Sigillo. Nessun bonus automatico
per chi non lo equipaggia. Le sei classi possono usare entrambe le tecniche.

| Tecnica | Attivazione | Effetto | Limite |
| --- | --- | --- | --- |
| Custodia | Evitare un impatto durante l'invulnerabilità dello scatto | Protezione per 2,2 s, 75% danni in meno | Recupero 6 s, non somma durata alla barriera del Tank |
| Impeto | Stessa schivata d'impatto | +18 vigore, -0,8 s al recupero dell'abilità | Vigore massimo 100, recupero mai negativo, 6 s tra attivazioni |

Il semplice scatto non attiva il sigillo. Due impatti nello stesso intervallo
non danno due premi. Il tiro di ritorno del Ranger resta indipendente e può
combinarsi con il sigillo. La scelta non richiede un nuovo comando durante la
lotta. Per cambiare una tecnica già equipaggiata: nessuna azione/scatto in corso,
recupero del sigillo concluso e nessun nemico attivo entro 12 unità nell'area.
La prima equipaggiatura è consentita anche più tardi, senza risorse gratuite.

Le durate e quantità sono ipotesi di bilanciamento, non risultati con giocatori.
Il sigillo è un oggetto narrativo e una meccanica UI/VFX: nessun modello 3D
collezionabile o inventario completo viene dichiarato implementato.

## Salvataggio e verifica

Introdotto nel checkpoint v3; ora incluso nel v4 delle Cave, stessa chiave storica mythwood.checkpoint.v1. Legge v1/v2/v3 e li
normalizza senza scrivere; salva soltanto scelta, classe e tappe con opt-in.
Non conserva cooldown, barriera o risorse del combattimento. Proprietà e valori
extra rifiutati; scelta non nulla impossibile nella tappa arrival.

API pubblica attuneArtifact in game.js; regole in artifacts/combat; scelta e
feedback in ui/runtime; anello VFX e suono originali già esistenti riutilizzati.
Test pubblici della simulazione e persistenza, più browser e screenshot reali.
Niente account, pagamenti, produzione o risorse online autorevoli.

## Evidenze del blocco

105 test superati; per ogni classe entrambe le accordature, danno evitato reale,
limiti delle risorse, cambio in sicurezza e migrazione. UI, episodio completo e
Giardino passati su Chromium desktop/mobile, senza errori o richieste esterne.
Rapporti e schermate: assets/artifact-pass/. Un primo episodio eseguito insieme
al Giardino è scaduto prima del ricordo; ripetizione isolata passata, causa non
accertata. Non una prova su hardware mobile reale o di bilanciamento pubblico.
