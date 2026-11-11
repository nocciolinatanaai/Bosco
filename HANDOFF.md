# Mythwood — consegna corrente

Aggiornato da Codex il 2026-11-11 (UTC).
Repository nocciolinatanaai/Bosco, ramo mythwood/collaboration-base.

## Turno Codex — consegna verificata, codice e prove condivisi

Integrata per fast-forward la PR #1 corretta alla testa 04f0ca9. Verifiche finali:
138 test, build, test:daria, probe layering indipendente, sito desktop/mobile,
sei classi a DPR1 e DPR2 nei budget e regressione episodio completa desktop/mobile
passati. Evidenze in docs/assets/codex-product-turn/. Nessun deploy/main/social.

Sito: home 3.727.892 → 76.518 byte a DPR1 (−97,95%); 174.136 byte a DPR2.
Home+demo, DPR2: Ranger 2.101.261, Combattente 2.686.369 byte; tutte le classi
sotto 3,5 milioni. Corpi delle risposte, non tempo di caricamento/FPS reali.
Immagini responsive, testo iniziale più concreto e feedback senza Sì predefinito;
No preservato nell'esportazione, nessuna raccolta automatica. Ritratto originale
nel ricordo del gioco ancora 2,39 MB: non dichiarare ottimizzato tutto l'episodio.

PRODUCT_RESPONSE_01 risponde alla proposta di Tonino. Esperimento temporaneo:
75 simulazioni di strategie più due confronti Custodia/Impeto. Resistenza dopo
una perturbazione rende costoso lo spam melee, ma il Ranger fuori aggro vince
ancora in 5,7 s senza rischi. Custodia scade prima del colpo seguente nel caso
isolato (2,2 contro 3,783 s; 32 danni), quindi contarne l'attivazione non prova
utilità. Regola candidata NON applicata alla build, file Rintocco intatti.
Nessun playtest umano o dato commerciale. Prompt pronto in
**docs/CLAUDE_PRODUCT_REPLY_01.md**, da leggere prima dei vecchi incarichi Daria.

## Revisione PR #1 — modifiche richieste a Tonino

Testa letta e testata 2419218, base d472bd1. Nessun merge: bug confermato nel
tiro in movimento (mixer legs-run sovrascrive anche torso/braccia). 138 test,
build, test:daria e regressione Ranger desktop/mobile passati, ma non rilevano
questo difetto. Riproduzione e
evidenze in docs/PR_1_REVIEW.md e docs/assets/pr1-independent-review/.
Prompt per Tonino in docs/CLAUDE_PR1_FEEDBACK.md. Personaggi restano riservati a
Tonino; Codex non corregge il suo ramo alla cieca. Sfida CHAL-01 letta e numeri
riprodotti: home 3,73 MB, home+demo Ranger 5,53 MB, Combattente 6,24 MB.
Ottimizzazione sito presa in carico separatamente, non ancora consegnata.
Le decisioni/azioni operative riferite da Tonino nei documenti PR non sono
state verificate autonomamente: nessun deploy/social/Supabase in questo blocco.

## BOW-01 / PRODUCT-02 (Tonino, 2026-11-11) — ramo tonino/bow-transition-01

- **Transizione dell'arco schiena↔mano senza scatti** (ranger-skinned.js). Salto massimo
  per fotogramma da 1,033 a 0,338 unità (arco sempre in mano: 0,331). Arco in mano a ogni
  colpo, schivata a metà passaggio senza rimbalzi. Controllo in test:daria, che fallisce con
  il codice precedente. Sequenze in docs/assets/bow-transition-01/.
- **Controprove di Codex** (docs/PRODUCT_DECISIONS_02.md, esperimento isolato, sorgenti intatti):
  - tiro fuori aggro risolto da provocazione + Frattura mirata a distanza, e vale anche per
    Mago e Guaritore;
  - Custodia come carica consumabile protegge davvero il colpo successivo (8 invece di 32
    danni, anche con un errore ritardato);
  - due echi dopo la vittoria ritirati;
  - nuova controprova: Impeto peggiora Tank e Combattente.
- Rintocco pubblicato come riferimento (origin/tonino/rintocco), non integrato. `hit()` intatta.
- Limite: il braccio non accompagna l'arco.

## PRODUCT-01 — dieci minuti da far provare a un amico (Tonino, 2026-11-11)

Consegnato docs/PRODUCT_CHALLENGE_01.md:
- promessa distintiva;
- sequenza di 10 minuti fatta solo di contenuti esistenti più modifiche piccole;
- tre critiche al lavoro di Codex con prove riproducibili:
  1. boss che si battono ripetendo Attacco (combat-balance-probe rieseguito);
  2. primo fotogramma su telefono con suggerimento doppio, "WASD" e barra di link
     del sito (scripts/product-first-minute.mjs);
  3. salvataggio opt-in chiesto prima del valore;
- priorità e protocollo per 5 persone **non eseguito**;
- momento social (Tiro di ritorno di Daria) e ipotesi di acquisto, senza implementazioni.

Domanda per Codex in PEER_REVIEW, sezione PRODUCT-01. Nessun file di sito o
caricamento toccato (CHAL-01 è di Codex).

## Decisione del proprietario — vecchio Mythwood chiuso (2026-11-11)

Il proprietario: "Tutto il vecchio progetto Mythwood è morto e deve essere
sostituito da questo. Tutto." Questo repository/ramo è l'unico progetto Mythwood.
La demo sostituirà il gioco su mythwood.it (procedura e ripristino in
docs/RELEASE_daria-pass01.md). Il giro programmato del vecchio progetto è disattivato.
Non riusare il vecchio backend. Vecchio Supabase **in pausa** (dati conservati), annuncio
su Instagram pubblicato, social manuali al proprietario. Messaggio per Codex:
docs/TONINO_TO_CODEX_2026-11-11.md.

## Consegna di Tonino — Daria pass01 (2026-11-11)

Ramo tonino/character-art-pass-01 da d472bd1. **Non ancora sul remoto**: il push
verso Bosco risponde 403 per l'account di Tonino; consegna via bundle (vedi
docs/RELEASE_daria-pass01.md).

Daria rifatta nel modello giocabile:
- volto ridipinto adulto con lentiggini;
- capelli e treccia sulla spalla;
- giacca petrolio con maniche, mantellina terracotta, sciarpa salvia;
- faretra, cinture e taccuino.

Abiti costruiti come gusci del corpo con i suoi pesi, pelle coperta rimossa.
Generatore Blender riproducibile, 13.598 triangoli, 946.716 byte.

Prova in combattimento (sfida del proprietario):
- sonda sulla simulazione reale e verifica delle compenetrazioni per clip in Blender;
- colpo allineato al bersaglio (da 11,7° a 0,2°);
- piede d'appoggio in corsa da 5,1 a 0,8 m/s;
- arco a tracolla in corsa;
- compenetrazioni ridotte in tutte e cinque le clip (misura corretta: vedi docs/PR_1_RESPONSE.md);
- correzioni P1/P2 della revisione Codex consegnate (PR_1_RESPONSE.md).

Danni e tempi invariati.

Verificato: 138 test, build, test:daria, ranger-check, visual-review, roster
30 pose, browser-check completo, site/privacy/checkpoint, desktop e mobile.

Non finito: niente scultura del volto, capelli a card, stoffa statica, clip CC0.
Dettagli in docs/art/DARIA_PASS_01.md. Proposta per il Combattente in
docs/art/FIGHTER_PASS_01_PROPOSAL.md (non iniziata). Sfida per Codex: CHAL-01 in
docs/PEER_REVIEW.md. Rintocco resta separato (3222cd1), non integrato.

## Nuovo incarico Claude — scrittura autorizzata

Il proprietario richiede commit del lavoro e nuovo prompt per Claude. Verificato
39f4ad1 già presente sul remoto; prompt completo in docs/CLAUDE_NEXT_TASK.md.
Claude autorizzato a modificare e verificare sul ramo tonino/character-art-pass-01,
partendo dalla punta aggiornata del ramo condiviso. Priorità Daria fedele al
concept e difetti tecnici del loader, non altre illustrazioni o palette.
Area personaggi riservata a Claude fino a consegna/rilascio, Codex non sovrappone
modifiche. Permessi tecnici della sua sessione non accessibili da qui: il
repository registra il mandato, non una connessione o abilitazione remota.
Nessun deploy/social/spesa/produzione incluso nel nuovo incarico.

## Asset 3D delle classi — base tecnica verificata, arte incompleta

Il proprietario approva la direzione delle sei tavole e chiede personaggi reali.
Sei PNG salvati in docs/assets/character-sheets; cinque nuovi GLB riggati in
public/models/characters (Ranger conserva Daria). Loader locale per classe
integrato in actors.js, asset-pipeline/materials/animation applicate; nessun file
riservato a Tonino modificato. Dettagli, provenienza CC0 e limiti in
docs/art/CHARACTER_MODELS_01.md. **Volti e costumi non ancora fedeli ai concept**.
Verifica finale: 135 test, build, 30 pose studio e regressione episodio completa
desktop/mobile passati. Restano compenetrazioni abiti e volti/costumi generici.
Evidenze in docs/assets/character-models-first-pass/. Il proprietario non vede
i personaggi: non sono pubblicati; richiesta quale vista usi. Server locale
porta 5173 avviato, /tools/character-roster-review/ risponde HTTP 200; nessun
collegamento remoto di anteprima verificato.
Nessun deploy o spesa. Non trattare questo checkpoint come approvazione grafica.


## Concept sheet richiesti — sei classi

Brief in docs/art/CHARACTER_SHEETS_01.md: fronte, profilo e dettagli volto per
le sei classi; Daria coerente con il brief esistente, altri volti proposti.
Mage non configurato (tre variabili assenti); alternativa image_gen comunicata
al proprietario. Le sei immagini sono ora salvate in docs/assets/character-sheets. Il proprietario
le approva come direzione; questo non approva i modelli 3D.


## Skill asset procedurali Python

Creata `.agents/skills/procedural-character-assets/SKILL.md`: istruisce a scrivere
ed eseguire generatori Python riproducibili per normal map, roughness pelle/tessuti
e basi anatomiche OBJ/GLB. Include orientamento normali, tiling, proporzioni,
reimportazione e controlli numerici/visivi; distingue blockout, mesh continua e
asset pronto per animazione. Pillow/NumPy disponibili, trimesh non installato
al controllo; nessuna dipendenza installata e nessun asset generato in questo task.
Verificati struttura skill e calcolo della normale piatta dell'esempio NumPy.


## Skill pipeline personaggi — Agensi

Aggiunta `.agents/skills/agensi-gamedev-characters/SKILL.md` con contratto comune
e tre attività parallele: concept alta risoluzione, specifiche PBR, importer.
Template eseguibile Three.js in templates/import-character.mjs: glTF/GLB,
material slot espliciti, mappe colore/dati, normali OpenGL/DirectX, Subsurface
conservata come metadata (nessuno shader SSS implementato). Specifiche Agensi
ufficiali non fornite né verificate: conformità dichiarata unverified. Nessuna
generazione, modello o texture creati; nessuna spesa. Verifica locale del template:
sintassi Node e import del modulo; importazione grafica con asset reali ancora
da provare. Skill documentale, non servizio in esecuzione automatica.


## Skill concept personaggi — Mage Space

Creata su richiesta `.agents/skills/mage-character-gen/SKILL.md`: concept
semi-realistici, turnaround fronte/lato/retro neutri e relighting separato,
dettagli pelle/SSS descritti come obiettivi visivi. Configurazione locale
MAGE_API_KEY/MAGE_API_BASE_URL/MAGE_API_MODEL; endpoint, autenticazione e schema
richiedono documentazione ufficiale verificata. Accesso www.mage.space bloccato
dal proxy (CONNECT 403): nessuna API dichiarata funzionante, chiamata di
generazione, immagine prodotta o credito consumato. Prossimo passo: verificare
contratto API e disponibilità dell'account prima di configurare un adapter.

## Sincronizzazione richiesta dal proprietario

Il proprietario richiede di rendere disponibili a Claude gli ultimi cambiamenti
nel repository condiviso: autorizzato il push del ramo mythwood/collaboration-base.
Base del prompt: 220462d, più questo aggiornamento della consegna. Verificare
sempre git log e il riferimento remoto prima di continuare. Nessun merge su main,
deploy, pubblicazione social, spesa o scrittura Supabase inclusi.

I blocchi sotto riportano lo stato storico locale prima di questa sincronizzazione;
le diciture precedenti «nessun push» non impediscono il push ora richiesto.
Esperimenti cinematografici non tracciati e skill installate preesistenti esclusi.
La skill locale mythwood-collaboration e i documenti citati nel prompt sono tracciati.

## Consegna — prima revisione Custode, presentazione ancora provvisoria

Il proprietario chiarisce sviluppo condiviso Codex/Claude, pubblicazioni/social
a Claude. Chiede nemici ispirati ad atmosfera/leggibilità di Solo Leveling e
Signore degli Anelli, senza copiare. Video corrente ritirato nei sorgenti del
sito; niente aggiornamento Pages o upload social da Codex in questo blocco.

Nuovo Custode procedurale in visuals/guardian-redesign.js, integrato solo per
il boss in actors.js: pietra/ferro/tessuto e sigillo nel torace, pose legate
a carica/colpo/recupero. Gli echi e Rintocco non ridisegnati. File di Tonino
intatti. Studio comparativo e test presentazione, 129 test passati; verifica
Ranger desktop/mobile superata (schivata e contrattacco, zero errori/connessioni
esterne). Sito desktop/mobile superato. Una prima prova ha rilevato HUD sovrapposto
ai comandi in orizzontale: corretto e riprovato. Layout mobile ancora da valutare
su dispositivo fisico. Evidenze in docs/assets/guardian-redesign/.
Non sono qualità artistica finale o animazioni del giocatore completamente rifatte.

Video: sorgente 20 fps esportata a 30; ripetizioni incluse anche per menu/finale.
La pipeline futura richiede cattura 60 fps e rifiuta input sotto 50; nessun nuovo
Reel reso o approvato. Dettagli e criteri in ENEMY_ART_DIRECTION.md.

## Consegna — demo, sito, video, account e cookie

Mandato: demo, video e sito GitHub Pages; registrazione email/Google su nuovo
progetto Supabase, poi gestione cookie. Codice implementato su ramo condiviso,
file di Tonino invariati (bundle 3222cd1 ancora non disponibile). Nessun merge main.

Root index.html sito; demo.html gioco con riepilogo dopo Custode e prosecuzione;
account.html accesso email/password, Google PKCE, conferma e reset. Account
inattivi senza URL nuovo progetto, Publishable key, responsabile e contatto.
Nessun progetto Supabase creato: configurazione/Google/SMTP/informativa mancanti,
leggere ACCOUNTS_SETUP. Test con SDK reale e risposte simulate, non login reale.

Cookie: necessari e preferenza facoltativa del ruolo sul sito; nessun tracker.
Default facoltativi spenti, modifica/revoca dal footer, record locale 180 giorni.
Partita su opt-in e account richiesto gestiti separatamente; non si finge che
Solo necessari cancelli sessione/partita. Dettagli in COOKIE_MANAGEMENT.

126 test; regressione episodio completo desktop/mobile passata con riepilogo;
smoke sito/video/navigazione, account simulati e cookie desktop/mobile passati.
La regressione completa precede il solo nuovo link Cookie nel footer del gioco;
nessuna modifica a simulazione o file riservati. Nessuna prova Safari fisica.
Evidenze in docs/assets/demo-launch/. Build finale verificata anche con cookie.

Video: public/site/mythwood-gameplay.mp4 (Reel 14 s) e mythwood-story.mp4 (8 s),
720×1280 H.264/AAC. Gameplay da checkpoint e clock campionato, testi e audio
originale del montaggio; grafica provvisoria, nessuna cinematica finale promessa.
Caption in docs/social/DEMO_GAMEPLAY_KIT. Nessun upload social o spesa.

GitHub Pages: ramo compilato mythwood/pages con CNAME mythwood.it e .nojekyll.
Push remoto verificato: sorgenti applicativi 8052ae6, build Pages 6cfa401.
API e dominio non verificabili per policy Cloud (CONNECT 403); gh auth status
non stabilisce da solo se il token sia valido. Attivazione Pages non eseguita né
verificata; il proprietario deve selezionare mythwood/pages / root nelle
impostazioni Pages. PAGES_ACTIVATION descrive passo esatto. Non chiamarlo online
prima di verifica pubblica. Non condividere la CTA social finché il dominio
non serve il nuovo sito. Nessun pagamento o ricavo attivato.

## Blocco concluso — regressione e revisione coordinata con Tonino

Mandato e tabella incarichi nella testa di COLLABORATION. Tonino/rintocco è
riservato; consegna/PR attese su segnalazione del proprietario. Stato dei suoi
test e della patch comunicato dal proprietario, non letto in una sua PR.
Codex non ha modificato alcun file src/ né tests/caves.test.mjs: confronto byte
per byte con 6ef6174 in assets/peer-review-pass/reserved-files.json.

Due regressioni complete dell'episodio passate desktop/mobile, prima col runner
originale e poi con movimento basato sulla tappa osservata, sulla stessa build:
zero errori/richieste esterne, inclusi sconfitta/riprova e fallback storage.
117 test superati. Riproduttore controllato: 0 frame durante W da 1600 ms causa
il timeout 60 s, secondo eco fermo a 65 PV; aspettando progresso reale la stessa
condizione raggiunge il ricordo. Corretto solo il runner, non il gioco o i timeout.
Causa storica precisa non accertata: la fragilità dimostrata è compatibile, non
una prova delle condizioni GPU/focus di quella vecchia esecuzione.

BAL-01 in PEER_REVIEW: 62 scenari API pubblica ripetuti con risultati identici.
Sentinella da ferma senza impatti per tutte le classi (1,43–3,25 s); Custode
senza impatti per tre classi da vicino; Ranger da fermo a 14,25 uccide Custode
in 5,70 s senza attivarlo. Distinti cariche, impatti, danno ricevuto e casi senza
uccisione. Approccio iniziale escluso, non misura della difficoltà umana.
Non chiamare ogni vittoria rapida un bug: discutere il ruolo dell'incontro.

Evidenze e comandi in docs/PEER_REVIEW.md e docs/assets/peer-review-pass/.
Script nuovi: combat-balance-probe.mjs e episode-input-probe.mjs; aggiornato
browser-check.mjs. File di Tonino invariati, nessuna patch di bilanciamento.
Prossimo passo: leggere la PR tonino/rintocco quando segnalata, contestare con
prove e decidere integrazione/modifiche/rifiuto. Nessuna approvazione presunta.
Push autorizzato sul ramo di collaborazione; nessun merge main, deploy, social,
spesa o accesso alla produzione.

## Blocco corrente — ponte di revisione e orientamento

Richiesta: automatizzare la collaborazione tramite skill e continuare il gioco.
Guida operativa richiesta dal proprietario: docs/CLAUDE_CONNECTION_GUIDE.md,
per nuova CLI nello stesso ambiente, login personale, prima risposta e limiti.
Creazione guida soltanto: nessuna installazione o chiamata al modello.
Skill locale mythwood-collaboration e coda di snapshot HEAD implementate; leggere
AGENT_EXCHANGE. Nessuna connessione reale attiva: mancano CLI Claude autenticata
e trasporto condiviso; nessuna risposta ricevuta o chiamata a pagamento. Cinque
test con worker simulato, esclusione percorsi, hash/commit, claim e nessun retry.

Gioco: obiettivi aggiornati alla consegna della lente, ingresso Cave con distanza
e azione esplicita, messaggi sotto l'altezza reale della missione su telefono.
117 test e percorso Cave desktop/mobile passati. Dopo controllo visivo aggiunto
un limite scorrevole alla missione espansa per separarla da HUD e messaggi;
verifica layout 390×844 e 360×740 passata per Giardino e Cave: messaggio
separato da HUD, nessun overflow orizzontale e uscita raggiungibile scorrendo.
Evidenze in docs/assets/exchange-ux-pass/. Il percorso Cave completo precede
l’ultimo ritocco CSS; il controllo layout usa la build finale.
Nessun nuovo contenuto narrativo o regione; nessun push/deploy/social/spesa.
Una richiesta di revisione è accodata solo localmente (snapshot 1ccf4b4), non
consegnata e non inclusa nel bundle Git. Il proprietario deve chiarire se
collegare una nuova sessione Claude Code o la conversazione web esistente.
La skill non consente di pilotare quella conversazione.

## Blocco precedente — Cave dei Sussurri

Terza area locale dopo il segnale del Giardino, con ingresso dal sentiero,
recupero della lente e ritorno a Liora. Guardiano del rintocco fermo: carica
circolare leggibile, uscita dal volume/interruzione/schivata come risposte.
Uccisione facoltativa. Nuovo frammento narrativo sulle due rotte sovrapposte e
la firma Archivio Cartiglio, revisione sette; proposta, non canone approvato.

File: src/caves.js, visuals/caves.js, combat, runtime/ui e checkpoints.
Checkpoint v4 conserva step/inside/wardenDefeated; legge v1/v2/v3 senza scrivere,
con la stessa chiave. Filtri per plaza/garden/caves, combattimenti fuori area
fermi. Viaggi senza cura; ripresa alla soglia con risorse piene come in precedenza.
Niente rigenerazione del Guardiano sconfitto o completamenti duplicati.

111 test e build passati. Percorso Cave completo desktop/mobile, ripresa v3→v4,
scelta del Sigillo, ritorno a piedi e dopo ricarica, dialogo e rivisita passati.
Controllo visivo anche in paesaggio mobile: pulsanti missione separati dal
joystick. Giardino e UI salvataggi passati anch’essi su entrambe le dimensioni, senza
errori browser o richieste esterne. Evidenze in docs/assets/caves-pass/.
Il percorso intero del primo episodio non è stato rieseguito in questo blocco;
l’ultima regressione completa resta quella v3 nel blocco Sigillo.
Errore iniziale del nuovo runner: aspettava movimento dopo una ripresa già alla
soglia; screenshot mostrava il dialogo corretto. Corretto il test, non il gioco.

Grafica ancora respinta/provvisoria. Le pareti delimitano la zona ma non esiste
pathfinding generico, streaming o modello nuovo del nemico. Bundle JS 778,72 kB
(210,01 gzip), warning >500 kB aperto. Nessun playtest esterno o prova iPhone reale.
Teaser fermo; nessun push, deploy, spesa, social o Supabase di produzione.

Per Claude: docs/START_HERE.md e CLAUDE_REVIEW.md aggiornati. Richiesta revisione
circostanziata di motivazione, strategia dominante e modifica minima con prova.
Alle 11 è il rientro indicato dal proprietario, non una connessione automatica o
una revisione ricevuta. Verificare che il suo checkout contenga i commit locali.

Prossimo passo: feedback sul ciclo delle Cave e sulle tecniche prima di
moltiplicare mappe. Archivio, Selva e Cittadella rimangono proposte future.

## Blocco precedente — Sigillo di Liora e priorità ai contenuti

Il proprietario giudica anche la prova Daria molto lontana dal concept e chiede
trama, gameplay, personaggi, artefatti, magie, tecniche e mondo, mantenendo le
verifiche visive. Grafica provvisoria conservata, ulteriore rifinitura sospesa.
Nessuna approvazione artistica; teaser fermo. Nessun push, deploy, spesa o post.

Implementato il Sigillo di Liora nel primo ricordo, prima del Custode: Custodia
(protezione 2,2 s) o Impeto (+18 vigore, -0,8 s recupero abilità), attivati solo
quando una schivata evita un impatto, con recupero 6 s. Tutte le sei classi,
scelta opzionale e modificabile in sicurezza. Nessun nuovo comando di lotta.
La selezione nel ricordo resta provvisoria fino alla conferma del ricordo.
Menu/HUD, feedback sonoro e anello VFX integrati. Spec: docs/ARTIFACT_01.md.

Checkpoint v3 sulla stessa chiave storica: conserva solo scelta e tappe, mai
bonus o cooldown. v1/v2 leggibili senza scritture; salvataggio sempre opt-in.
Regole in src/artifacts.js e combat.js; persistenza in checkpoints.js;
interfaccia in ui/runtime, effetti in visuals/combat-effects.js.

105 test e build passati. UI Sigillo, episodio completo e Giardino superati su
desktop/mobile; dati corrotti o storage bloccato gestiti. Nessun errore browser
o richiesta esterna nelle esecuzioni passate. Prima prova episodio concorrente
con Giardino scaduta prima del ricordo; ripetizione isolata superata. Causa non
accertata: non dichiarare assenza di flakiness. Runner ora registra stato e
screenshot in caso di errore. Evidenze in docs/assets/artifact-pass/.

Sono giocabili due aree: nessuna terza regione, cooperativa o grande open world
aggiunti. docs/WORLD_AND_PROGRESSION.md propone arco e criteri per le prossime
regioni. Prossimo blocco: Cave dei Sussurri, ingresso/ritorno, un incontro diverso
e uso dell'artefatto; serve ancora implementazione e verifica completa.

Limiti: bilanciamento senza playtest esterni; grafica respinta; warning bundle
>500 kB aperto; prove Chromium emulate, nessuna misura su iPhone reale. La prova
Daria precedente è tecnicamente verificata ma non soddisfa il proprietario:
report e confronti congelati in docs/assets/daria-trial/. Non riprendere trailer.
Nessun contatto automatico con Claude: deve leggere questa consegna nel checkout.

## Blocco precedente — prima sostituzione grafica del Ranger

Il proprietario chiede di iniziare a migliorare la scena giocabile; teaser fermo.
Base GLB CC0 di System G6, con scheletro e cinque clip, integrata al primo Ranger
selezionato. Moduli vestiti/capelli collegati alle ossa, texture incorporate,
accessori Mythwood e asse dell'arco allineato alla simulazione. È una base
generica provvisoria; volto/abiti, transizioni, scatto e contatti vanno rifiniti.
Gli altri cinque personaggi e il Custode restano segnaposto.

Portale meno intenso e luce/foschia riviste. CSP consente blob locale per le
texture incorporate, senza aggiungere host esterni. Loader e GLB caricati solo
quando richiesti; fallback visibile se il file fallisce. Gameplay invariato.
95 test e build riusciti; studio quattro pose, mira e fallback passati, viste
app desktop/mobile catturate. Regressione finale Ranger e Giardino passata su
entrambe le dimensioni: zero errori browser/richieste esterne. Tre rivisite a
caldo senza nuove createBuffer osservate; non misura FPS o tutte le risorse GPU.
Build: 763 kB JS / 205 kB gzip, loader separato 45 kB / 13 kB gzip, GLB 1,6 MB.
Il warning bundle >500 kB resta aperto; nessuna prova hardware reale.

Vedere docs/VISUAL_UPGRADE.md, public/models/ranger/SOURCE.json e screenshot/
rapporto in docs/assets/visual-review/. Le catture non sono concept AI.
Nessun push, deploy o pubblicazione. Modifiche precedenti al teaser preservate
ma sospese: non eseguire i relativi script.

## Blocco precedente — Ranger procedurale e comunicazione della ripartenza

94 test superati, build riuscita (710 kB JS / 190 kB gzip, warning aperto).
Primo corpo Ranger originale integrato, distinto dagli altri cinque ruoli:
giacca, sciarpa/mantello, treccia, faretra, taccuino, arco con corda, freccia
incoccata e risonanza. 8.524 triangoli di mesh totali, 44 mesh e 14 materiali.
Resa semplificata: volto, mani, pieghe e contatti della posa restano da rifinire.
Non equivale alla tavola illustrata o a una scultura finale approvata.

Studio di authoring a quattro pose e regressione integrata superati, così come
il Giardino con nuovo modello su desktop/mobile. Nessun errore/richiesta esterna
nei percorsi completi. Zero nuove createBuffer durante tre rivisite a caldo:
non misura tutte le risorse GPU o FPS. Nessuna prova umana o hardware reale.

CONTENT_SCOPE.md propone per il primo arco sei personaggi, tre NPC, otto tipi
di nemico e dieci missioni. Solo i sei ruoli sono già concordati; gli altri
numeri sono obiettivi adattabili, non contenuti completati. Caption con cinque
hashtag in social/RESTART_CAPTION.md per pubblicazione manuale del proprietario.
Il successivo incarico trailer è stato completato: vedere il blocco qui sotto.
Vecchio kit ritirato. Nessun acquisto/deploy/produzione.

## Mandato e collaborazione

Il proprietario autorizza sviluppo autonomo, commit/push periodici sul ramo
condiviso e aggiornamento dei documenti. Codex coordina direzione, architettura e
integrazione; Claude può implementare incarichi circoscritti, proporre alternative
e revisionare criticamente. Non sono stati ricevuti TONINO_REVIEW o incarichi
accettati da Claude; nessun collegamento automatico fra le chat.

Obiettivo: RPG browser per smartphone e PC, con trama, grafica, combattimento e
crescita convincenti, mondo vasto e gilde (missioni personali, contributi asincroni
e spedizioni simultanee). Sei classi di riferimento, senza obbligo di averle
tutte in squadra. Concept approvato; ispirazione a Solo Leveling senza copiarlo.

Il 35–40% è un traguardo qualitativo richiesto, **non dichiarato raggiunto**.
Lasciare capacità alle richieste reali del pubblico: PLAYER_FEEDBACK.md. Nessun
feedback umano raccolto sulla nuova build. Le stime storiche di tempo/budget
(35 giorni/30 euro residui) vanno riconciliate, non sono contabilità aggiornata.

Merge su main, deploy, SQL di produzione, credenziali e spese non fanno parte di
questo blocco. Post/commenti organici sui canali del progetto autorizzati, ma
account e strumenti/accessi supportati vanno prima identificati; Codex non ha
un'integrazione social attiva. Ads, messaggi privati e account terzi esclusi.

## Implementato e verificato

Prototipo individuale Vite/Three.js, Node >=22 e lockfile. Nessuna chiamata al
backend precedente, account, analytics o pagamenti nella nuova build.

- Sei kit di classe, primo corpo Ranger originale e cinque ruoli con corpo
  condiviso; combo, abilità, proiettili, scatto a vigore e interruzioni.
- Due echi → ricordo di Liora → risveglio → Custode con Frattura/Onda → tre tracce.
- Ranger Tiro di ritorno: schivata d'impatto dopo risveglio, finestra di 4 secondi
  per abilità doppia; seconda freccia ritardata di 140 ms al 65% del danno base.
- **Giardino dei nomi:** seconda area, bussola, segnale e ritorno. Sentinella
  pattugliante con attacco rettilineo; colonne fermano raggio, proiettili e colpi
  fisici diretti. Effetti magici ad area possono superare la copertura. La missione
  è completabile aggirando il nemico. Visite successive senza duplicare il finale.
- Audio sintetico originale opt-in, volume/mute, pausa e qualità grafica regolabile.
- Checkpoint locali opt-in: formato v2 sulla chiave storica mythwood.checkpoint.v1.
  Lettura v1 compatibile senza scritture; nuove scritture solo su azione autorizzata
  dalla preferenza. Si conservano classe, tappe, area/missione e sentinella sconfitta.
  Ripresa con vita/vigore pieni; combattimento parziale ricreato da ingresso sicuro.
- Interfaccia desktop/touch, controlli separati in landscape e focus ripristinato
  al gioco riprendendo movimento/attacco dopo i menu.

Il passaggio tra aree è un'interazione esplicita. Il giardino viene costruito al
primo ingresso e conservato: entrambe le radici restano in memoria, **non streaming**.
Le scene e i modelli sono procedurali provvisori, ancora distanti dal concept.

## Codice da conoscere

| File | Responsabilità / vincolo |
| --- | --- |
| src/combat.js, roles.js, game.js | Simulazione e API. Filtrare nemici/danni per area; cleared resta il primo Custode |
| src/garden.js | Accesso, missione, sentinella, geometria delle collisioni/coperture |
| src/checkpoints.js | Schema v2, compatibilità v1, ripresa, storage facoltativo e conflitti osservati |
| src/runtime.js, ui.js, style.css | Input, UI, avanzamento fisso, collegamento alla scena e pause |
| src/visuals/environment.js, garden.js, telegraph.js | Radici delle aree e segnale con dimensioni della simulazione |
| src/journey.js | Guida e testi narrativi proposti, non contenuto remoto |

Leggere REGIONS.md, LOCAL_CHECKPOINTS.md, QUEST_02.md, RANGER_EVOLUTION.md e
COMBAT_UX.md prima di modificare questi vincoli. Per una terza area aggiornare
intenzionalmente filtri, enum e schema: non esiste ancora un registro arbitrario
di regioni. I dati locali non sono autorità per economia o premi online futuri.

## Verifiche e provenienza

**94 test superati**, build riuscita: circa 710 kB JS / 190 kB gzip; warning
chunk >500 kB ancora aperto. Rapporti in docs/verification/:

| Rapporto | Sorgenti verificate | Ambito |
| --- | --- | --- |
| unit-latest.json | 864f97f | 94 test, incluse geometria/pose, regole e fixture SQL sintetiche |
| garden-latest.json | 864f97f | Desktop/mobile, missione, migrazione, ricarica, ritorno, rivisite |
| browser-latest.json | 864f97f | Regressione completa del primo episodio a tempo normale, inclusi fallback storage |
| character-latest.json | 864f97f | Confronto di authoring, quattro pose, hash geometria/immagini |
| checkpoint-ui-latest.json | 45f89ba | Precedente controllo testo guida e ripresa v1/v2 con autosave spento, sentinella già sconfitta |

I rapporti indicano sorgenti/hash e ambito; quello rapido checkpoint precedente
mantiene la propria provenienza e non è stato rieseguito in questo blocco.
I runner di studio, regressione e Giardino correnti hanno exit 0.

Chromium SwiftShader, non dispositivi fisici. Nuova area: Leggera, DPR 1,
1440×900/390×844 e layout 844×390. Regressione: mobile DPR 2 e controlli dei tre
profili grafici. Zero errori JS/richieste esterne nei percorsi completi. Tre
rivisite a caldo senza nuove chiamate createBuffer osservate: non misura tutte
le risorse GPU, perdite di memoria o FPS. Catture reali in docs/assets/prototype/.

Il runner Ranger precedente usa clock browser controllato, senza hook sullo stato
interno. Rapporto audio precedente su 17 cue native; nessuna nuova sintesi audio
in questo blocco. Mantengono i propri commit, non sono nuovi collaudi hardware.

```sh
npm ci --ignore-scripts
npm test
npm run build
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium npm run test:garden
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium npm run test:checkpoints
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium npm run test:character
```

Altrove installare Chromium Playwright. npm run dev avvia su loopback; il relativo
indirizzo del Cloud non è apribile direttamente da iPhone. Vedere PREVIEW.md.
Non ricompilare dist mentre un altro runner la serve. I rapporti atomici locali
sono in test-results/, ignorata da Git; condividere solo gli esiti verificati.

## Limiti e lavoro successivo

1. **Arte:** tradurre un personaggio in qualità giocabile con confronto reale.
   CHARACTER_DARIA.md e tavola originale sono una proposta per il Ranger;
   nome/cast non approvati; prima interpretazione procedurale presente, qualità
   finale e somiglianza al concept da migliorare. Non presentare
   il concept come screenshot o asset 3D già pronto.
2. **Prova umana:** PLAYTEST_01.md; capire obiettivo, cariche, crescita e orientamento.
   Non dedurre divertimento, bilanciamento o retention dai bot.
3. **Esplorazione:** rifinire Giardino e nota ambientale laterale, ancora assente;
   poi espandere con contenuto distinto. Movimento assistito in linea, non pathfinding.
4. **Cooperazione:** prova autorevole di due client in staging, con riconnessione
   e ricompensa unica. Non esistono ancora gilde/cooperativa online o nuovo backend.
5. **Store:** chiuso nella nuova build. Catalogo, provider e responsabilità da definire.
   Nessun prodotto/account esterno modificato. Vecchio reel ritirato: non riattivarlo.

Rimangono assenti grande mondo, grafica/animazioni definitive, voce narrativa,
collaudo Safari/iPhone reale, backend autorevole e rilascio pubblico della nuova
build. Liora/Cartiglio e dettagli dei nuovi capitoli restano proposte narrative.

## Legacy e sicurezza da non perdere

Baseline vecchio sito: ac9039ea91983a9586b01eeab4a60a02b5e88b54; caricatore archiviato
in legacy/index.html.txt. Audit di 210 funzioni/65 tabelle e sorgenti parziali in
TECHNICAL_BASELINE/SECURITY. Bypass NULL del login riprodotto in PGlite isolato;
patch proposta, non applicata su produzione. La diagnosi FOUND sugli acquisti
è **ritirata perché errata**: non riproporre quella correzione.

Device è una credenziale nel vecchio sistema. Mancano ancora backend/Edge
Function completi, indici/ACL/configurazione, cron, backup e procedure ripristino.
Claude li aggiornava direttamente su Supabase: richiedere sorgenti redatti,
non segreti. Nessun test su account o dati reali. Nessuna attestazione generale
di sicurezza o conformità UE; leggere SECURITY.md ed EU_READINESS.md.

## Consegna a Claude e storia

Fonte condivisa: ramo Git, non chat. START_HERE e CLAUDE_RESTART_PROMPT descrivono
il rientro. Prima risposta attesa in TONINO_REVIEW, con commit ricevuto, file letti,
prove effettive, obiezioni e incarico proposto. Registrare file assegnati prima
di attività che si sovrappongono; preservare modifiche locali e remote.

Cronologia decisioni in COLLABORATION.md. La precedente consegna cumulativa è
conservata in docs/history/HANDOFF-2026-11-10-before-garden-consolidation.md;
contiene note e autorizzazioni storiche superate, non istruzioni correnti.

## Trailer cinematografico «Ricordali» — consegna

Il proprietario ha richiesto anche uno stile film, senza obbligo di gameplay.
Teaser MP4 di 24 s, verticale 1080×1920/30 fps, H.264/AAC stereo, faststart;
versione 720×1280 più leggera e copertina in docs/assets/trailers/.
Quattro illustrazioni AI originali: città, Liora, Daria e Custode. Camera animata,
particelle, dissolvenze e musica originale sintetizzata; non animazione completa
dei personaggi. Etichette concept/immagini AI e caption esplicita distinguono
la direzione desiderata dalla grafica corrente del gioco.

Script autonomo scripts/render-cinematic-trailer.py; font di sistema e numpy,
nessun riuso del kit ritirato, nessuna dipendenza dal runtime del gioco.
Fonti/hash in SOURCES.json, controlli in MEDIA_REPORT.json, brief e caption in
docs/social/. Decodifica completa senza errori; audio misurato -14,24 LUFS,
-1,96 dBTP. Fotogrammi rappresentativi ispezionati; nessuna prova reale iPhone
o giudizio umano sull'audio. Test gameplay non ripetuti: codice invariato.
Checkpoint sorgenti 2e24a4e; consegna nel commit successivo. Nessun post inviato,
nessun deploy, nessuna risposta di Claude presunta.

## Correzione richiesta — cinematica 3D, non illustrazioni

La consegna illustrata precedente è stata respinta come interpretazione della
richiesta. Il proprietario intende personaggi/ambienti/azioni del gioco in movimento.
Nuovo lavoro locale tools/cinematic/, script scripts/capture-engine-teaser.mjs:
scene dirette usando la vera geometria corrente, nessuna immagine generata.
Resa dei modelli ancora provvisoria e semplificata; non paragonabile al concept.
Nessun push/deploy/pubblicazione, come da ultima istruzione. Render in verifica.


## Stop del proprietario — priorità alla grafica

Il proprietario giudica le immagini 3D molto lontane dal risultato desiderato
e sospende il teaser finché la grafica non sarà almeno guardabile. Render
interrotto, nessun nuovo teaser consegnato o pubblicato. Gli esperimenti in
tools/cinematic/ e gli output parziali sono sospesi, non materiale promozionale.
Prossima priorità: una sola scena giocabile convincente con personaggio,
ambiente, illuminazione e animazioni da valutare visivamente col proprietario.
Non riprendere il trailer o dedurre approvazione artistica da test tecnici.
Nessun push, deploy o pubblicazione eseguiti in questo blocco.

## Cronologia — avvio del blocco superfici e raccordi (concluso sopra)

Pose sampler campionato su game time, raccordi 120 ms, pausa/interruzione/riavvio
coperti da quattro test sintetici. Ranger usa il sampler e raccorda l'orientamento;
fase dello scatto legata alla durata reale anziché al tempo globale della corsa.
Nuove superfici procedurali coerenti per pietra, bordi consumati e umidità,
mappe separate per muratura e pavimento, nessuna immagine o asset acquistato.
Statistiche pipeline corrette per conteggiare tutti i pass. Vedere SKILLS_WORKFLOW.
Checkpoint iniziale prima delle verifiche; esiti nel blocco corrente sopra.
Asset Ranger generico invariato; non risolta la distanza artistica dal concept.
Nessun push, deploy o post. Teaser sospeso; esperimenti preesistenti preservati.


## Cronologia — prova Daria conclusa e respinta artisticamente

Checkpoint locali cebdc8c e 3f10905: geometria abiti/capelli, mantello e materiali;
base CC0 conservata. 99 test, build, studio pose e regressioni Ranger/Giardino
passati. Non è un nuovo volto finale e non riproduce la qualità del concept.
Il proprietario sposta la priorità ai contenuti: riferirsi al blocco corrente.
