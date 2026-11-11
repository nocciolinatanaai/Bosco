# Revisione tra Codex e Tonino — prove e decisioni

## Mandato corrente e provenienza

Il proprietario riferisce che Tonino ha verificato 6ef6174 (117 test, build,
test:caves) e prepara tonino/rintocco. Codex non ha ancora letto quella patch o
una PR: i risultati del Rintocco e i cambiamenti proposti sono riferiti dal
proprietario, non verificati autonomamente su codice consegnato. Nessuna
approvazione della patch o risposta inventata. Il proprietario avviserà della PR.

Assegnazioni e file riservati nella testa di COLLABORATION.md. Codex non modifica
caves.js, hit, journey/runtime o caves.test; qui misura Custode e Sentinella e
indaga il runner episodio. Nessun bilanciamento applicato da Codex in questo blocco.

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

Quando arriva tonino/rintocco, verificare che PV 360/raggio 6/rintocco temprato
cambino decisioni reali e non soltanto il tempo di uccisione. Coprire il banco
non prova di eliminare il tiro da lontano: richiedere misure di distanza, cariche,
impatti e interruzioni con sei classi e scenari fermi/in movimento. La patch non
è ancora disponibile, quindi nessuna conclusione sul suo esito o merge.

Proposte da assegnare dopo confronto: separare aggancio e distanza di attacco,
limitare la cancellazione ripetuta delle cariche e verificare il tempo disponibile
alla Sentinella nel vero percorso di avvicinamento. Non imporre danni inevitabili:
una risposta attiva riuscita deve poter evitare danno. Serve anche una prova UI.

## REG-01 — episodio completo e timeout Sigillo (in verifica)

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

Indagine controllata in corso con episode-input-probe.mjs, senza altre prove GPU
contemporanee. Nessuna modifica del gioco o aumento dei timeout. Il runner è
stato predisposto a trattenere W fino alla tappa osservata «Rompi il primo
sigillo», con rilascio anche in errore; attesa prima del ricordo resta 60 s.
Esito del riproduttore e seconda regressione verranno registrati prima della
consegna. Non attribuire lo stallo storico al rendering senza ulteriore evidenza.

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
