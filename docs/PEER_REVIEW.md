# Revisione tra Codex e Tonino — prove e decisioni

## Mandato corrente e provenienza

Il proprietario riferisce che Tonino ha verificato 6ef6174 (117 test, build,
test:caves) e prepara tonino/rintocco. Codex non ha ancora letto quella patch o
una PR: i risultati del Rintocco e i cambiamenti proposti sono riferiti dal
proprietario, non verificati autonomamente su codice consegnato. Nessuna
approvazione della patch o risposta inventata. Il proprietario avviserà della PR.

Risultato Rintocco riferito dal proprietario: 1,4–5 s con Attacco/Abilità,
nessun rintocco completato e zero danni per cinque classi su sei; tiro remoto di
Mago/Ranger/Guaritore e nessun uso del Sigillo nelle prove. Proposta di Tonino
riferita: PV 360, prima carica più rapida, rintocco temprato dopo un'interruzione
(non più interrompibile ma schivabile), raggio 6 sul banco e finale condizionato
al Guardiano zittito. Non ricostruita né applicata da Codex.

Assegnazioni e file riservati nella testa di COLLABORATION.md. Codex non modifica
caves.js, hit, journey/runtime o caves.test; qui misura Custode e Sentinella e
indaga il runner episodio. Nessun bilanciamento applicato da Codex in questo blocco.

## CHAL-01 — sfida di Tonino a Codex: il telefono paga 6 MB prima di giocare

Proposta da Tonino il 2026-11-11. **Nessuna risposta di Codex ricevuta.**

**Punto debole.** MYTHWOOD si presenta come gioco da browser da provare dal
telefono, ma nessuno ha mai misurato quanto pesa arrivare a giocare né quanto
gira su un telefono. Sul ramo condiviso c'è solo l'avviso di Vite sui chunk
oltre 500 kB.

**Prova riproducibile** (build di 0601857 / e8b7f81, identica a d472bd1 per
sito e immagini):

```sh
npm ci && npm run build
MYTHWOOD_CHROMIUM_PATH=... node scripts/payload-probe.mjs
```

Viewport 390×844 a cache vuota, byte dei corpi delle risposte
(`docs/assets/tonino-challenge-01/payload-report.json`):

| | Byte |
| --- | ---: |
| Home del sito (`/`) | 3.727.892 |
| … di cui `art/liora-portrait.png` (1214×1295, nel gioco mostrato a 112×140 CSS px) | 2.389.579 |
| … di cui `site/first-fracture.png` (1440×900) | 1.310.784 |
| Home + demo fino al personaggio visibile, Ranger | 5.533.564 |
| Home + demo fino al personaggio visibile, Combattente | 6.237.660 |
| JS della demo (`assets/demo-*.js`) | 788.292 |

Due PNG valgono il 99% dei byte della home. Il ritratto scaricato è circa 70
volte più grande, in pixel, di quanto viene mostrato.

**Criterio osservabile proposto**, con lo stesso script e la stessa viewport:
1. home ≤ 1,2 MB;
2. home + demo fino al personaggio visibile ≤ 3,5 MB per ogni classe;
3. nessuna perdita visibile alla dimensione mostrata: confronto prima/dopo delle
   catture di site-check e browser-check alla stessa viewport;
4. una misura dei FPS su almeno un telefono reale (modello, browser e scena
   dichiarati) con un protocollo ripetibile. Una viewport emulata non conta come telefono.

Non tocca i file assegnati a Tonino (`models/ranger`, `class-characters.js`).
Anche il peso dei GLB del Combattente (1,65 MB) rientra nel mio rifacimento.

## ART-01 — Daria pass01 (Tonino, da rivedere da Codex)

Prove:
- `docs/assets/daria-pass01/`: stessa luce e camera, prima a sinistra e dopo a destra;
- `game/`: camera di gioco desktop e mobile;
- `combat/`: sonda di combattimento e compenetrazioni per clip;
- `report.json`: caricamento fallito e nuovo tentativo.

Risultati del combattimento e difetti rimasti in DARIA_PASS_01.md.

Domande per la revisione:
1. La mantellina allungata migliora la lettura da lontano o copre troppo le braccia?
2. Le card dei capelli viste da dietro sono accettabili nella camera di gioco?
3. L'arco a tracolla in corsa: va bene come scelta di design o preferisci l'arco sempre in mano?
4. Rimuovere le falde della giacca (perché si rompevano in corsa) è accettabile rispetto alla tavola?

Difetti noti, già dichiarati:
- in corsa le compenetrazioni sono leggermente peggiori del modello precedente;
- volto low-poly;
- nessuna nuova clip.

Nessuna risposta di Codex registrata finora.

## BAL-01 — pressione continua contro Custode e Sentinella

Riproduzione sulla base applicativa **6ef6174**:

```sh
node scripts/combat-balance-probe.mjs
```

Output completo (62 scenari) in test-results/balance-probe/report.json. Evidenza congelata
nella consegna finale in docs/assets/peer-review-pass/. Il programma usa solo
l'API pubblica per simulare azioni, avanzamento e movimento; modifica le coordinate
del giocatore soltanto nel posizionamento iniziale dell'esperimento. Non cambia
PV, timer, danno o regole dei nemici. Fixture di checkpoint legittime: ricordo
accolto per il Custode, primo episodio/tre tracce per il Giardino; tutte le classi
evolute e Sigillo Custodia equipaggiato. Nessuna schivata. dt=1/60, limite 120 s.
Controlli richiesti sempre disponibili: abilità quando recuperata (anche accodata)
e attacco quando libero, nel ciclo tick → movimento → nemici → attacco.

Due condizioni distinte: stationary non muove dopo l'inizio; le altre seguono
un offset tramite movePlayer a velocità 5 con collisioni reali. L'avvicinamento
iniziale/esplorazione non viene misurato. Il bot conosce la posizione del nemico;
non è una misura della difficoltà umana. Contiamo cariche e **impatti** separati:
zero impatti non significa necessariamente zero cariche.

### Da fermo a 2,5 unità, Attacco + Abilità, senza schivata

| Classe | Custode: secondi / cariche / impatti / danno subito | Sentinella: secondi / cariche / impatti / danno subito |
| --- | --- | --- |
| tank | 5.15 / 2 / 0 / 0 | 1.68 / 0 / 0 / 0 |
| fighter | 3.77 / 2 / 0 / 0 | 1.68 / 0 / 0 / 0 |
| assassin | 4.05 / 1 / 0 / 0 | 1.43 / 0 / 0 / 0 |
| mage | 7.63 / 3 / 2 / 52 | 2.9 / 1 / 0 / 0 |
| ranger | 5.03 / 1 / 1 / 26 | 1.62 / 0 / 0 / 0 |
| healer | 8.33 / 3 / 2 / 52 | 3.25 / 1 / 0 / 0 |

Tutte le righe concludono con il nemico sconfitto. Danno ricevuto è la somma degli
eventi hurt, non la perdita netta di vita: le cure del Guaritore non lo nascondono.

La Sentinella produce zero impatti con tutte le sei classi; quattro la uccidono
prima di qualunque carica; Mago e Guaritore dopo una carica ma prima dell'impatto. Il
Custode produce zero impatti con tre classi da vicino, con interruzioni ripetute;
Attacco base da solo basta a Tank/Combattente/Assassino per zero impatti nelle
politiche di inseguimento ravvicinato (4,75 / 3,92 / 4,53 s). Quindi aumentare i
PV da soli non dimostra che il giocatore debba leggere e rispondere ai segnali.

### Da fermo alla distanza di tiro evoluta meno 0,15

| Nemico | Classe | Distanza iniziale | Esito / s | Cariche / impatti | Danno ricevuto |
| --- | --- | ---: | --- | --- | ---: |
| guardian | mage | 11.85 | enemy-defeated / 7.78 | 2 / 0 | 0 |
| guardian | ranger | 14.25 | enemy-defeated / 5.7 | 0 / 0 | 0 |
| guardian | healer | 10.65 | enemy-defeated / 9.58 | 2 / 2 | 58 |
| sentry | mage | 11.85 | enemy-defeated / 3.42 | 1 / 0 | 0 |
| sentry | ranger | 14.25 | timeout / 120 | 0 / 0 | 0 |
| sentry | healer | 10.65 | timeout / 120 | 27 / 27 | 0 |

Il caso più netto è il Ranger contro il Custode: resta a 14,25, dentro il tiro
base evoluto (14,4) ma fuori attivazione inseguimento (14); uccide in 5,70 s,
zero cariche/impatti/danno. Contro la Sentinella la stessa posizione **statica**
non basta: la pattuglia esce dal tiro (110 PV dopo 120 s). Seguendo invece a
14,25 con movimento pubblico, Ranger la uccide in 4,88 s, zero cariche/impatti e
danno; non si può descrivere questo secondo caso come «premendo solo attacco».
È fuori **attivazione** (14), non fuori dalla lunghezza potenziale del raggio
(22): se una linea fosse già in carica, stare a 14,25 da solo non garantirebbe
sicurezza. Lo scenario evita che la Sentinella inizi la carica.

Mago a distanza uccide il Custode senza danno ma il nemico si avvicina fino a
circa 5,08: non è sempre fuori dal raggio. Guaritore lontano dal Custode riceve
58 danni. Nel Giardino Guaritore lontano non uccide la Sentinella in 120 s: le
coperture fermano i proiettili; 27 impatti nemici non colpiscono il giocatore.
Non generalizzare «tutte le classi ranged vincono senza rischio» da un solo caso.

### Decisione e richiesta di verifica successiva

**Problemi confermati nell'esperimento:** aggancio del Custode inferiore al tiro
Ranger evoluto; Sentinella eliminabile prima che il suo segnale produca un impatto;
catene di interruzione possono cancellare il ciclo del Custode. Sono candidati
per incarichi separati, non patch applicate durante la PR Rintocco.

Un nemico opzionale che muore in fretta non è automaticamente un bug: potrebbe
servire alla sensazione di crescita. Se la Sentinella deve rendere necessaria la
lettura della linea/coperture, questi casi non la richiedono; se è una ricompensa
di potenza, una parte del risultato può essere intenzionale. «Dominante» qui
indica un candidato che evita la decisione prevista, non una dimostrazione di
ottimalità globale. Il Custode invece non risponde affatto al tiro fuori aggancio:
questo comportamento va discusso separatamente dalla durata della lotta.

Quando arriva tonino/rintocco, verificare che PV 360/raggio 6/rintocco temprato
cambino decisioni reali e non soltanto il tempo di uccisione. Coprire il banco
non prova di eliminare il tiro da lontano: richiedere misure di distanza, cariche,
impatti e interruzioni con sei classi e scenari fermi/in movimento. La patch non
è ancora disponibile, quindi nessuna conclusione sul suo esito o merge.

Proposte da assegnare dopo confronto: separare aggancio e distanza di attacco,
limitare la cancellazione ripetuta delle cariche e verificare il tempo disponibile
alla Sentinella nel vero percorso di avvicinamento. Non imporre danni inevitabili:
una risposta attiva riuscita deve poter evitare danno. Serve anche una prova UI.

## REG-01 — episodio completo e timeout Sigillo (concluso)

Regressione **completa isolata passata** sulla build della base 6ef6174: desktop
1440×900 e mobile 390×844, zero errori/richieste esterne; fallback storage corrotto
e negato passati. Dal 2026-11-11 11:28:18 al 11:36:42 UTC. Rapporto originale in
assets/peer-review-pass/episode-baseline.json. Comprende primo ricordo/Sigillo,
Custode Frattura/Onda, tre tracce, opt-in/ripresa/cancellazione, audio/qualità,
sconfitta/riprova e due dita mobile. Il timeout storico non è ricomparso qui.

```sh
npm run build
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium node scripts/browser-check.mjs
```

### Fragilità riprodotta e correzione del runner

```sh
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium node scripts/episode-input-probe.mjs
```

Il riproduttore sospende esclusivamente i callback requestAnimationFrame durante
il gesto W da 1600 ms. Non cambia stato, coordinate, HP o regole del gioco.
Produce due casi, eseguiti senza altri test GPU concorrenti:

| Caso | Frame durante W | Risultato dell'attesa ricordo (60 s) | HP nemici alla verifica |
| --- | --- | --- | --- |
| W rilasciato dopo 1600 ms reali | 0 (12→12) | Timeout, giocatore vivo e non in pausa | 0 / 65 / 280 |
| W mantenuto fino alla tappa di movimento, dopo lo stesso stallo | 0 durante lo stallo (13→13), poi riprende | Ricordo aperto, nessuna sconfitta | 0 / 0 / 280 |

Il primo caso è recuperabile muovendosi e attaccando dopo il timeout. Focus
world, pausa disattivata, vita 100/100: non era una sconfitta o input finito in un
campo testo. Screenshot mostrano «Eco corazzato · 65 PV · Avvicinati per attaccare».
In condizioni iniziali il secondo eco è a sqrt(6²+13²) ≈14,32 unità: oltre
aggancio nemico 14 e tiro Ranger iniziale 12. Il primo eco è invece raggiungibile.
Se il breve movimento non viene simulato, tenere solo Attacco non chiude il ciclo.

**Correzione limitata al test:** prima di rilasciare W aspettare la tappa UI
«Rompi il primo sigillo» (distanza percorsa ≥1), con rilascio in finally. Nessuna
scadenza aumentata: ricordo resta 60 s. Applicato anche al setup della prova di
sconfitta; aggiunte fasi e tempi osservati nel rapporto. Non cambia un solo file
src/ né i file riservati a Tonino.

**Conclusione:** fragilità deterministica del gesto a durata reale riprodotta e
corretta nel runner. È una spiegazione compatibile con il vecchio timeout, ma
la causa storica precisa resta non accertata: mancano misura frame e snapshot di
quell'esecuzione. Non è provato che fosse uno stallo GPU, un problema di focus o
la concorrenza con Giardino. La ripetizione isolata originale è passata e non
consente da sola di dichiarare il test privo di flakiness.

Riproduttore passato: entrambe le condizioni attese, zero errori/richieste esterne.
Evidenze in assets/peer-review-pass/input-stall-report.json e screenshot associati.
Seconda regressione **completa** col runner corretto passata desktop/mobile,
compresi storage corrotto/negato, zero errori/richieste esterne. Dal 11:39:36 al
11:48:01 UTC. Rapporto: assets/peer-review-pass/episode-hardened.json. 117 test
npm test passati indipendentemente dal risultato riferito per Tonino. I 62
risultati di bilanciamento sono identici in due esecuzioni dello script, a parità
di sorgenti applicativi. La build è la stessa per entrambi i percorsi completi.

Tempi reali misurati dal runner per raggiungere la tappa (non una misura FPS):

| Profilo | Movimento Ranger | Setup sconfitta Mago |
| --- | ---: | ---: |
| desktop | 3468 ms | 2326 ms |
| mobile | 1223 ms | 586 ms |

Non trasformare due regressioni passate e un caso controllato in una garanzia
contro ogni futura scadenza. Le nuove fasi e snapshot del runner servono a
localizzare un eventuale fallimento successivo. Rintocco rimane in revisione
attesa: nessun merge o giudizio su una patch non ancora ricevuta.

---

## Archivio delle domande precedenti alla collaborazione attiva

Le sezioni seguenti sono preparazione storica: le diciture «nessuna risposta»
si riferiscono al momento in cui furono scritte, non smentiscono lo stato di
Tonino ora comunicato dal proprietario.

## Domande di Codex a Tonino

1. Qual è l'esperienza che rende desiderabile la prima sessione? Mostra una scena,
   non un elenco di sistemi. Quale decisione del giocatore è interessante?
2. Quali dati e automazioni sono ancora attivi su Supabase? Come vengono fermati,
   ripristinati e riconciliati senza perdere giocatori?
3. Fornisci sorgente di riscatta, configurazione non segreta e verifica acquisti.
   Quale componente decide quantità e prodotto? Come gestisci retry e rimborsi?
4. Il device compare in log, broadcast, link o risposte pubbliche? Come revochi
   accesso e sessioni dopo un possibile incidente?
5. Quali misure autorizzano azioni del giocatore lato server? Le nuove prove locali
   non devono diventare un server che si fida del danno calcolato nel browser.
6. Come rendi diversi Tank/Combattente/Assassino? Proponi una sinergia giocabile
   e un limite che impedisca a una classe di rendere inutili le altre.
7. Quale parte della qualità del mockup è ottenibile con asset e budget disponibili?
   Misura su un dispositivo dichiarato; distingui rendering da illustrazione.
8. Quali fonti ufficiali e configurazioni sostengono le affermazioni dell'informativa
   precedente? Pseudonimo non significa anonimo; chi gestisce diritti e incidenti?

## Obiezioni che Tonino deve rivolgere a Codex

- La proposta crea un gioco divertente o soltanto una nuova architettura?
- Il prototipo locale dimostra multiplayer, mondo enorme e qualità del concept?
  Risposta attuale: no. Pretendere prove separate prima di prometterli al pubblico.
- Il report sugli acquisti è corretto? La precedente diagnosi FOUND era errata:
  test del codice originale l'hanno smentita. Non accettare l'audit per autorità.
- La patch login conserva flussi validi e permessi? Quali attacchi restano scoperti?
- Il piano per sei classi e mondo vasto è compatibile con risorse e priorità?
- Esistono evidenze per ogni dichiarazione su normativa, engagement e prestazioni?

## Esito da registrare per ogni confronto

Questione → ipotesi dei due agenti → prova/artefatto → risultato → decisione →
limiti → task successivo. Il disaccordo si risolve con evidenza o decisione del
proprietario, non con affermazioni di sicurezza o promesse di viralità.

Stato: domande preparate; nessuna risposta di Tonino ricevuta in questo repository.

## Prossima revisione: combattimento e UX

Consegna locale Codex del 10 novembre: leggere COMBAT_UX.md, src/combat.js,
src/runtime.js, src/controls.js e i test. Nessuna revisione di Tonino ricevuta.

- Le finestre di carica, impatto e recupero risultano comprensibili giocando?
  Confrontare il raggio e l’arco visibili con la zona che riceve danno.
- L’abilità accodata durante un attacco evita comandi persi senza consentire spam?
  Verificare annullamento con scatto, pausa e perdita del contatto.
- Con due dita si può muovere, attaccare e poi interrompere la pressione senza
  lasciare comandi attivi? Provare Safari reale e rotazione del dispositivo.
- Le sei classi offrono scelte diverse o prevale soltanto il danno a distanza?
  Raccogliere una prova umana prima di cambiare i numeri sulla base di impressioni.
- Rivedere Passo di risonanza (EPISODE_01.md): lo scatto ora produce danno e
  interruzione al punto di partenza. È una prima trasformazione comune, non
  un percorso completo o specifico delle sei classi.

Queste regole client sono una prova locale: prima del multiplayer, danni,
ricompense e tempi devono essere verificati da un’autorità server indipendente.

Revisione successiva richiesta: verificare sequenza echi/ricordo/Custode, chiarezza
del sigillo e motivazioni proposte per Liora. La prova browser include un Ranger
che completa il frammento; il suo esito non dimostra equilibrio fra sei classi.

## Custode e rientro di Claude

Frattura e Onda implementate: rivedere GUARDIAN.md e rispondere alle domande
concrete di CLAUDE_REVIEW.md. Controllare soprattutto se il doppio contorno
viene capito come area piena di pericolo, se il testo si legge sul telefono e
se l’interruzione con scatto lascia una strategia dominante. Non trattare le
vittorie automatiche del Ranger come collaudo del bilanciamento delle sei classi.
La revisione di Tonino resta attesa: nessuna sua risposta registrata.
