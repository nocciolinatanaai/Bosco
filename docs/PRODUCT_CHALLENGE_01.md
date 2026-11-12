# PRODUCT-01 — Dieci minuti che uno sconosciuto voglia finire e far provare

Tonino, 2026-11-11. Ramo `tonino/character-art-pass-01`, testa applicativa `2f46c75`.
Incarico registrato in docs/COLLABORATION.md prima di iniziare.

**Stato: analisi e proposta.**
- Nessuna implementazione e nessuna prova con persone esterne eseguita.
- Nessun dato di retention, feedback o disponibilità a pagare: non esistono e non li invento.
- Le durate in minuti sono **stime da verificare** con il protocollo in fondo.

Legenda: **[C]** contenuto già disponibile nella demo · **[M]** modifica necessaria e
piccola · **[F]** idea futura, fuori da questo blocco.

Prove raccolte per questo documento, riproducibili, sulla build di `2f46c75`:
- `scripts/product-first-minute.mjs`: primo minuto su telefono emulato 390×844.
  Rapporto e catture in `docs/assets/product-challenge-01/`.
- `scripts/combat-balance-probe.mjs` di Codex, rieseguito: `balance-report.json` nella stessa cartella.

---

## 1. La promessa distintiva

> **Torni a prendere chi è rimasto indietro, e ogni persona che ritrovi cambia il modo in cui combatti.**

Molti action RPG danno poteri da bottino o da albero delle abilità. MYTHWOOD può legare
**ogni potere a una persona ritrovata**: il ricordo di Liora diventa lo scatto che
colpisce. La crescita, quindi, è anche una relazione. Il sito lo dice già ("una promessa:
tornare a prendere chi è rimasto indietro"); il gioco lo mostra una volta sola, in una
finestra di testo.

Cosa questa promessa **non** è oggi:
- non è un mondo vasto;
- non è una grafica di riferimento;
- non è una cooperativa: non presentarla così.

---

## 2. Sequenza dei dieci minuti (dalla demo esistente)

Nessuna nuova mappa, classe o sistema. Si riordina e si stringe ciò che c'è: piazza,
ricordo di Liora, Custode, tracce e Giardino.

### 0:00–0:45 · Apertura: nasce una domanda
- **Cosa fa il giocatore.** Tocca "Gioca", sceglie la classe e si trova nella piazza, con il
  Custode sigillato in fondo.
- **Cosa capisce.** C'è qualcuno dentro il sigillo e gli echi lo trattengono.
- **Cosa rischia.** Ancora niente.
- **Cosa ottiene.** Una domanda: *chi è, e perché non può uscire?*

Elementi:
- [C] Custode sigillato visibile, cerchio e scritta, due echi.
- [M] Avvicinandosi al sigillo, **una sola riga di voce** come sottotitolo nel mondo, non
  in un pannello: «Sei venuto… per me?» (≤ 8 parole). È la domanda, non una spiegazione.
- [M] Il suggerimento iniziale una volta sola e adatto al dispositivo (vedi critica 2).

### 0:45–2:30 · Imparare a leggere un attacco
- **Cosa fa.** Libera i due echi.
- **Cosa capisce.** Cerchio rosso = esci; dopo l'impatto c'è un'apertura.
- **Cosa rischia.** Vita, se resta nel cerchio.
- **Cosa ottiene.** Il primo eco liberato; il secondo arriva più deciso.

Elementi: [C] carica, recupero e guida contestuale già implementate.

### 2:30–3:15 · Momento memorabile: Liora
- **Cosa fa.** Accoglie il ricordo e **sceglie** il sigillo: Custodia (protegge chi ritorna)
  oppure Impeto (apre la strada).
- **Cosa capisce.** Questo potere viene da una persona che ha disobbedito per non lasciare
  nessuno.
- **Cosa rischia.** Una scelta che cambia come combatterà subito dopo.
- **Cosa ottiene.** Il passo di risonanza e il sigillo scelto.

Elementi:
- [C] Finestra del ricordo, ritratto di Liora, scelta Custodia/Impeto (ARTIFACT_01).
- [M] Testo da **76 a ≤ 30 parole**, con il ritratto.
- [M] Il gesto di Liora si gioca invece di leggerlo: alla chiusura, l'eco "arretra senza
  abbandonare", cioè il primo scatto che il giocatore fa lascia un impulso visibile, con
  l'effetto già esistente. Si mostra, non si spiega.
- **Con Daria (Ranger).** È la stessa scena; il ritratto di Liora parla a Daria, che
  porta il taccuino di mappe bruciato (CHARACTER_DARIA).
  - [F] Una riga di Daria in risposta, solo dopo una prova di tono.

### 3:15–6:00 · Decisione in combattimento: il Custode
- **Cosa fa.** Affronta il Custode con Frattura e Onda.
- **Cosa capisce.** Due scelte reali, ognuna con un costo:
  - **scattare lontano**: al sicuro, nessun danno;
  - **scattare vicino**: l'impulso interrompe la carica, ma se sbagli il tempo prendi l'impatto pieno.
  - Ranger: la schivata perfetta apre una finestra di 4 secondi per il **Tiro di ritorno** a due frecce.
- **Cosa rischia.** La vita e la finestra di contrattacco.
- **Cosa ottiene.** La vittoria per lettura, non per ripetizione del tasto.

Elementi:
- [C] Passo di risonanza, Frattura/Onda, Tiro di ritorno del Ranger.
- [M] **Oggi la decisione non serve** (critica 1): il Custode cade prima che la scelta
  conti. Modifica minima proposta nella critica 1.

### 6:00–6:45 · Crescita percepibile (proposta degli echi **ritirata**, vedi PRODUCT_DECISIONS_02)
- **Cosa fa.** Subito dopo il Custode, due echi si rialzano dal sigillo spezzato.
- **Cosa capisce.** Quello che all'inizio richiedeva cinque colpi ora lo risolve un solo
  scatto vicino: *sono diventato più forte grazie a Liora.*
- **Cosa rischia.** Poco, ed è voluto: è la ricompensa.
- **Cosa ottiene.** La sensazione fisica del potere.

Elementi:
- [C] Evoluzione: scala 1,2 → 1,34, aura, impulso ×1,5.
- [M] Riapparizione di 2 echi deboli dopo la vittoria, solo la prima volta, senza ricompensa.
  Da verificare che non contraddica la chiusura del Custode (cleared resta il primo Custode).

### 6:45–9:15 · La pista e il Giardino
- **Cosa fa.** Segue tre tracce attivate dalla risonanza; poi, nel Giardino, recupera la
  bussola scegliendo come passare la sentinella: aggirarla, interromperla o usare le colonne.
- **Cosa capisce.** Il potere serve anche a esplorare; esiste una firma, Cartiglio.
- **Cosa rischia.** La linea della sentinella.
- **Cosa ottiene.** La bussola e un passaggio aperto.

Elementi:
- [C] Tracce (MEMORY_TRAIL), Giardino con bussola, sentinella, ritorno (QUEST_02).
- [M] Stessa obiezione della critica 1 sulla sentinella: muore prima della prima carica
  con 4 classi su 6.

### 9:15–10:00 · Conclusione appagante e motivo preciso per tornare
- **Cosa fa.** Porta il segnale oltre la soglia.
- **Cosa capisce.** L'ago si volta lontano dall'uscita: *qualcuno corregge ancora le mappe
  dall'interno.*
- **Cosa ottiene.**
  - una chiusura: la rotta è restituita e Liora è con te;
  - un motivo nominato: le **Cave dei Sussurri**, la lente, la firma da confrontare.
  - Si vede l'ingresso e si sente il rintocco.

Elementi:
- [C] Ricordo "Qualcuno cambia ancora le mappe", obiettivo successivo alle Cave
  (storyObjective); le Cave esistono.
- [M] **Conservare la tappa in quel momento**, non prima (critica 3), con una frase
  concreta: «La tua tappa è conservata: domani le Cave».
- [F] Il bilanciamento del guardiano delle Cave è nella PR Rintocco separata, da non
  integrare alla cieca.

---

## 3. Tre critiche al lavoro di Codex che possono far abbandonare il giocatore

Ogni critica riporta una prova (o un'ipotesi dichiarata), un intervento piccolo e un
criterio osservabile. Non sono giudizi di gusto.

### Critica 1 — I boss non chiedono decisioni: si battono ripetendo il tasto

**Prova (rieseguita su questa testa).** `node scripts/combat-balance-probe.mjs`, bot vicino
al nemico, nessuna schivata, classi evolute:

| Nemico | Classe | Solo Attacco: secondi / impatti subiti |
| --- | --- | --- |
| Custode | Tank | 4,75 s / 0 |
| Custode | Combattente | 3,92 s / 0 |
| Custode | Assassino | 4,53 s / 0 |
| Custode | Ranger | 6,95 s / 2 |
| Sentinella | Tank / Combattente / Assassino | 1,4–2,0 s / 0, **nessuna carica** |

È il dato BAL-01 di Codex, che ha registrato il problema senza ancora risolverlo.

**Perché fa abbandonare (ipotesi).** Il momento che dovrebbe essere la prova di tutto ciò
che hai imparato dura meno di un caricamento e non usa il potere appena ricevuto.
Chi gioca non vive la crescita, e chi guarda non ha nulla da raccontare a un amico.

**Intervento piccolo.** Dopo la prima interruzione, la carica successiva del Custode è
**temprata**: non si interrompe con i colpi, ma si schiva, e la schivata attiva il Sigillo.
Il tetto delle interruzioni fa sì che solo l'impulso vicino ne apra un'altra. È la stessa
regola già proposta e testata nella PR Rintocco per le Cave; qui va decisa da Codex sui
suoi file, non da me.

**Criterio osservabile.** Con `combat-balance-probe`:
- politica "solo Attacco": per ogni classe almeno 1 impatto subito, oppure il Custode
  sopravvive almeno 15 s;
- politica "schivata a tempo": vittoria con ≤ 1 impatto.

Nei test con persone: almeno 3 su 5 usano lo scatto vicino contro il Custode senza che glielo
si dica.

### Critica 2 — Il primo minuto su telefono parla troppo e mostra il sito invece del gioco

**Prova** (`scripts/product-first-minute.mjs`, catture 01–05):
- 4 tocchi prima del primo comando: cookie, Gioca, classe, Attraversa.
- La finestra di scelta della classe mostra circa **141 parole visibili**.
- Nel primo fotogramma giocabile:
  - lo stesso suggerimento compare **due volte**: nel pannello e in sovraimpressione;
  - cita **"WASD"** su un telefono;
  - la barra dei link del sito (*Comandi e audio, Gilde, Store, Privacy, Il progetto,
    Account, Cookie*) resta visibile sotto i comandi di gioco;
  - "Store" e "Gilde" promettono cose che la demo non ha.

**Perché fa abbandonare (ipotesi).** Prima di giocare si legge; durante il gioco un tocco
sbagliato sotto il pulsante Schiva porta fuori dalla partita. Da verificare: con l'emulazione
non si vedono i tocchi accidentali reali.

**Intervento piccolo.**
- In partita su schermi stretti, nascondere la barra dei link e lasciarla nel menu Pausa.
- Un solo suggerimento, specifico del dispositivo: «Trascina a sinistra per muoverti».
- Scelta della classe con al massimo nome, sottotitolo e una frase.

**Criterio osservabile.**
- Nel primo fotogramma giocabile a 390×844: ≤ 25 parole visibili, nessun link esterno,
  nessuna istruzione da tastiera.
- Nei test: tempo dal primo tocco su "Gioca" al primo movimento, misurato per ognuno dei 5.
  Va riportato com'è: non c'è una soglia di successo predeterminata.

### Critica 3 — Niente fa tornare: la tappa non si salva da sola e la proposta arriva prima del valore

**Prova.** Nella schermata di scelta, «Salva automaticamente le tappe su questo dispositivo»
è **deselezionata** (`saveDefaultChecked: false` nel rapporto). Chi non la nota e chiude la
scheda ricomincia dalla piazza. LOCAL_CHECKPOINTS e AGENTS chiedono di mantenere l'opt-in:
non propongo di toglierlo.

**Perché fa abbandonare (ipotesi).**
- La domanda «vuoi salvare?» arriva quando il gioco non ha ancora dato nulla.
- Il motivo per tornare (le Cave) arriva dopo, quando è troppo tardi per salvare senza
  cercare l'opzione nel menu.

**Intervento piccolo.** Mantenere l'opt-in, ma spostarlo al **momento di valore**: dopo la
vittoria sul Custode, e di nuovo alla chiusura del Giardino.
- Proposta: «Conservare la tappa su questo dispositivo? Potrai cancellarla dal menu», con
  il ricordo appena ottenuto mostrato accanto.
- La cancellazione selettiva resta.

**Criterio osservabile.**
- Nei test: quanti dei 5 scelgono di conservare la tappa, e quanti trovano «Riprendi la
  tappa» alla riapertura senza aiuto.
- Nessuna retention dichiarata da 5 persone.

---

## 4. Modifiche ordinate per impatto, costo e dipendenze

| # | Modifica | Impatto atteso (ipotesi) | Costo | Dipende da | Responsabile proposto |
| --- | --- | --- | --- | --- | --- |
| 1 | Custode e Sentinella: carica temprata dopo la prima interruzione (critica 1) | Alto: crea la decisione e mostra il potere | Basso | Decisione di Codex su combat.js; Rintocco come precedente | Codex |
| 2 | Primo fotogramma mobile: barra dei link nascosta in partita, suggerimento unico e touch (critica 2) | Alto sul primo minuto | Basso | Nessuna; tocca ui/runtime/CSS di Codex, non il sito di CHAL-01 | Codex |
| 3 | Testo del ricordo di Liora a ≤ 30 parole, impulso visibile al primo scatto | Medio-alto: momento memorabile | Basso | Nessuna | Codex (journey.js) |
| 4 | Opt-in del salvataggio al momento di valore (critica 3) | Medio-alto sul ritorno | Basso-medio | Regole LOCAL_CHECKPOINTS | Codex |
| 5 | Riga di voce al sigillo (domanda d'apertura) | Medio | Basso | 3 | Codex o Tonino, da concordare |
| 6 | ~~Due echi deboli dopo il Custode~~ **ritirata** (PRODUCT_DECISIONS_02): nessun comportamento osservabile la giustifica; la crescita si mostra nel Giardino | — | — | — | — |
| 7 | Chiusura del Giardino con ingresso delle Cave e rintocco | Medio | Medio | PR Rintocco rivista | Tonino (Rintocco) + Codex |
| 8 | Daria: transizione animata dell'arco fra schiena e mano | Basso-medio (clip social) | Medio | PR #1 | Tonino |

Si consiglia di **misurare dopo 1–4** e prima di 5–8: se i 5 tester non capiscono la
decisione del Custode, aggiungere contenuto non serve.

---

## 5. Prova con 5 persone esterne — protocollo (NON ESEGUITO)

Tonino non ha accesso a partecipanti. Il protocollo è pronto per il proprietario o per chi
conduce la prova. Cinque sessioni servono a **trovare problemi**, non a dimostrare il
successo né la disponibilità a pagare.

**Partecipanti**
- 5 persone maggiorenni, estranee al progetto.
- Almeno 2 che non giocano abitualmente ad action RPG.
- Sul **proprio telefono**: annotare modello e browser.
- Consenso a essere osservate; nessuna registrazione del volto né dati personali nei documenti.

**Preparazione**
- Link alla demo e cache vuota (finestra privata).
- Nessuna spiegazione oltre a: «Prova questo gioco come faresti a casa. Puoi smettere quando vuoi.»
- L'osservatore non aiuta. Se richiesto, risponde solo «Cosa pensi di dover fare?».

**Durata.** Fino a 12 minuti di gioco, poi 5 minuti di domande.

**Comportamenti da osservare** (scheda per partecipante, con il tempo):
1. Secondi dal tocco su "Gioca" al primo movimento.
2. Esitazioni oltre 5 s: dove e su cosa.
3. Tocchi accidentali su link, pausa o fuori dal gioco.
4. Prima schivata durante una carica: sì/no e a quale tentativo.
5. Finestra di Liora: la legge (tempo sullo schermo), la salta, sceglie il sigillo. Annotare
   le parole dette ad alta voce, senza interpretarle.
6. Contro il Custode: usa lo scatto vicino? Quante volte? Subisce impatti? Muore?
7. Trova le tracce e il Giardino senza aiuto?
8. Dove smette: punto e minuto.
9. Espressioni spontanee (riportate letteralmente, senza attribuire emozioni).
10. Alla fine: conserva la tappa? (Solo se l'intervento 4 è già implementato.)

**Domande neutrali** (dopo il gioco, nell'ordine, senza suggerire risposte):
1. «Raccontami cosa è successo nel gioco.»
2. «C'è stato un momento in cui non sapevi cosa fare? Quale?»
3. «Come descriveresti questo gioco a un amico, in una frase?»
4. «C'è qualcosa che ricordi in particolare? Perché?»
5. «Cosa pensi che succeda dopo?»
6. «Ci rigiocheresti? Cosa ti farebbe tornare, o cosa no?»
7. «Lo faresti provare a qualcuno? A chi?»

Da evitare: «Ti è piaciuto?», «Era divertente?», «Lo compreresti?» e qualsiasi domanda che
nomini una funzione prima che il partecipante la nomini.

**Restituzione**
- Una tabella per partecipante con i fatti osservati e una con le citazioni.
- Una lista di problemi ordinata per numero di persone che l'hanno incontrato.
- Nessuna percentuale presentata come statistica.

---

## 6. Il momento da mostrare sui social (gameplay reale)

**Il Tiro di ritorno di Daria.**
1. Il Custode carica la Frattura.
2. Daria schiva all'ultimo istante.
3. L'impulso esplode alle sue spalle.
4. Due frecce partono a 140 ms una dall'altra, nella finestra di 4 secondi.

È tutto già implementato e verificato da `ranger-check` desktop e mobile. In 6–8 secondi
mostra la promessa: leggere, schivare, restituire.

Condizioni prima di pubblicarlo:
- la critica 1 risolta, altrimenti la clip mostra una mossa che il gioco non richiede;
- la transizione dell'arco (modifica 8) o un'inquadratura che non la mostri;
- l'approvazione del proprietario sulla resa grafica: oggi il teaser è sospeso;
- l'etichetta IA.

Nessun post in questo incarico.

---

## 7. Che cosa potrebbe giustificare un acquisto futuro (ipotesi, nulla da implementare)

**Ipotesi.** Il primo capitolo resta gratuito e completo. Un acquisto futuro sarebbe
giustificato da **nuovi capitoli della stessa promessa**: ogni capitolo riporta indietro un
compagno, con la sua storia, il suo potere e la sua regione circoscritta. È contenuto, non
vantaggio: niente potere a pagamento, niente valute, niente pressione temporale.

In alternativa, o in aggiunta, **costumi e varianti dei personaggi**: puramente estetici, se e
quando la grafica lo meriterà.

**Come verificarla senza vendere nulla.** Nei test, la domanda 5 («Cosa pensi che succeda
dopo?») e la 6 mostrano se le persone desiderano il seguito e per quale motivo. Il desiderio
del seguito non è disponibilità a pagare, e va dichiarato così.

Prima di qualsiasi pagamento valgono SECURITY.md, EU_READINESS.md e un mandato specifico del
proprietario.

---

## 8. Domanda sfidante per Codex (collegata a questa consegna)

Vedi docs/PEER_REVIEW.md, sezione PRODUCT-01.
