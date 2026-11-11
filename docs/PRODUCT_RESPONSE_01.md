# PRODUCT-01 — risposta e consegna Codex

Risposta a docs/PRODUCT_CHALLENGE_01.md di Tonino, consegna 04f0ca9.
Non sono risultati di vendita, retention o prove con persone. Il mio turno
comprende modifiche al sito e un esperimento isolato sulle regole del Custode.

## La promessa che terrei

**Ritrova chi è rimasto indietro. Il ricordo di Liora cambia il tuo modo di
combattere.** È ora anche il testo dell'apertura del sito. Parla del contenuto
giocabile, senza promettere cooperativa, un mondo enorme o sei storie complete.

Il momento su cui costruirei la demo: il giocatore riconosce un attacco,
sceglie di restare vicino, schiva e risponde con il potere ricevuto da Liora.
Non basta un effetto luminoso: deve esserci un'alternativa peggiore riconoscibile.

## Risposta alle tre critiche di Tonino

1. **Attacco ripetuto risolve il Custode:** confermato. Sotto ci sono i dati di
   un candidato per correggerlo. Non considero risolta la questione registrando
   un solo impatto: serve che il giocatore capisca e scelga la risposta.
2. **Primo minuto mobile troppo verboso:** condivido, ma ≤25 parole in tutto il
   primo frame è una soglia arbitraria e può nascondere vita, azioni o obiettivi
   necessari. Criterio migliore: un obiettivo, una sola istruzione di movimento
   adatta al dispositivo e nessun link che sottragga un tocco al combattimento.
   Quella modifica del gioco resta da implementare; il mio blocco attuale alleggerisce
   l'accesso e rende onesta la promessa del sito, senza fingere di aver rifatto l'HUD.
3. **Salvataggio proposto prima del valore:** condivido la seconda opportunità
   dopo la vittoria. Non toglierei però la scelta iniziale a chi sa già di voler
   conservare la tappa. Non preselezionare, non riscrivere dopo un rifiuto e non
   riproporre la domanda a ogni passo. È un intervento futuro, non incluso qui.

## CHAL-01: accesso più leggero, consegnato nel codice

- Hero responsivo WebP a 480/960/1440 px; ritratto sito a 224/448 px. Gli originali
  PNG e il ritratto del gioco restano intatti. Solo copie di distribuzione, senza
  nuove immagini AI o ritocchi artistici; qualità/larghezza e hash nel manifest
  public/site/image-delivery.json. Rigenerazione con scripts/prepare-site-images.mjs
  e FFmpeg con libwebp. Nessuna dipendenza nuova per chi avvia il gioco.
- Pulsante «Gioca la demo» e promessa più breve. Il collegamento «Guarda il gameplay»
  diventa «Cosa puoi giocare»: non c'è un nuovo video da vedere.
- Il feedback non preseleziona più «Sì». È possibile rispondere «No», «Non so»
  o non indicare una scelta. Il controllo browser verifica che un «No» rimanga
  tale nel testo esportato. Questo elimina un mio errore nella raccolta di feedback;
  non dimostra una domanda commerciale e non raccoglie dati automaticamente.

Misura prima/dopo con la stessa sonda sulle sei classi, cache vuota, viewport
390×844 e DPR 1: home ~3,73 MB → ~0,077 MB; percorso completo home+demo fino alla
consegna del GLB, Ranger ~5,66 → ~2,00 MB; Combattente ~6,24 → ~2,59 MB.
Valori finali: home **76.518 B** a DPR 1, **174.136 B** a DPR 2. Con DPR 2
Ranger arriva a **2.101.261 B**, Combattente a **2.686.369 B**. Tutte le sei
classi rispettano i budget a entrambe le densità. La riduzione della sola home
a DPR 1 è **97,95%**. Tabelle e report esatti nelle evidenze CHAL-01.
I valori precedenti sono sulla PR corretta, quindi Ranger include il suo GLB
da 1.065.704 byte: non confonderli col precedente modello da 946.716 byte.

Soglie automatiche: home ≤1,2 milioni di byte e percorso ≤3,5 milioni per tutte
le sei classi. Sono corpi delle risposte, non byte compressi sul filo, tempo
all'interattività o FPS su telefono. La sonda attende HTTP 200 e fine download
del GLB atteso; questo non basta da solo a provare pose o animazioni corrette.
Quelle sono controllate da test:daria e dalla regressione browser.
La prima memoria nel gioco conserva ancora il ritratto originale da 2,39 MB:
non attribuire questa riduzione a tutti i download dell'intero episodio.

Il criterio del dispositivo reale resta aperto: non possiedo qui un iPhone
fisico e non sostituisco la prova con una viewport emulata. Non dichiaro tutta
CHAL-01 chiusa soltanto perché i budget di byte sono raggiunti.

## La singola regola che proporrei al Custode

**Dopo una prima perturbazione, non può essere nuovamente interrotto finché non
completa un attacco. Poi la possibilità di interromperlo si riapre.**

Il prototipo considera anche lo stagger prima della carica, non solo una carica
già avviata: altrimenti resta possibile impedirgli di iniziarla con gli attacchi.
Questo dettaglio va esplicitato, non chiamato genericamente «temprato».
Prima del rilascio richiede un segnale riconoscibile della resistenza: gesto,
suono opzionale e indicazione leggibile, non solo un colore o immunità invisibile.

### Esperimento eseguito, non applicato alla build

`node scripts/guardian-decision-experiment.mjs` crea copie temporanee del modulo
di combattimento con la regola candidata. Verifica che src/combat.js resti identico.
Nessun file riservato di Rintocco modificato. Sei classi evolute, checkpoint
legittimo, 1/60 s, massimo 120 s, medesima posizione iniziale e comandi pubblici.
Tre varianti × sei classi × quattro politiche = 72 simulazioni, più tre
controprove Ranger fuori aggro (75 in totale). Due prove aggiuntive confrontano
la finestra di Custodia e Impeto. La schivata a
tempo usa conoscenza perfetta del timer, quindi non dimostra facilità per persone.

| Classe | Solo Attacco: danno subito prima → candidato | Schivata a tempo nel candidato: danno / attivazioni Sigillo |
| --- | ---: | ---: |
| Tank | 0 → 26 | 0 / 1 |
| Combattente | 0 → 26 | 0 / 1 |
| Assassino | 0 → 26 | 0 / 1 |
| Mago | 58 → 58 | 0 / 1 |
| Ranger | 58 → 58 | 0 / 1 |
| Guaritore | 58 → 58 | 0 / 1 |

Il tempo di vittoria con solo Attacco resta identico: 3,92–9,15 s. Non ho
allungato il combattimento aumentando la vita. Il costo della cattiva risposta
diventa visibile, ma **un incontro di pochi secondi resta di pochi secondi**.
Non prova un boss da tre minuti o la sequenza da dieci minuti di Tonino.

Controprova utile: limitare soltanto lo stagger della combo base permette già
la carica, ma la schivata vicina la cancella di nuovo prima dell'impatto. In
tutte le sei classi la politica a tempo vince senza attivare mai il Sigillo.
Anche lo scatto immediato appena vede la carica nel candidato principale fa
subire 26 danni e non attiva il Sigillo: premere Schiva appena compare un avviso
non equivale a leggerne il momento d'impatto.

### Soglia che accetterei

Per questo specifico scenario: sei classi vittoriose con solo Attacco devono
incontrare almeno una carica completata; la politica a tempo deve vincere con
danno inferiore e almeno un'attivazione del Sigillo. Distinguere impatti del
nemico, colpi realmente subiti e danno, senza usare lo stesso nome per tre cose.
Inoltre testare uscita dal cerchio, tiro da fuori aggro, perdita del bersaglio
e casi senza evoluzione. Non imporrei 15 secondi come sostituto del divertimento.

Controprova fuori aggro: Ranger a 14,25 unità vince in **5,7 s senza impatti,
danni o schivate** in tutte e tre le varianti. Il candidato, quindi, non risolve
quella strategia. Questo esperimento non tratta la Sentinella: rifiuto di
dichiarare un bilanciamento completo con un solo bot vicino.
Prima di applicarlo a hit, coordinare la riserva di Rintocco ed evitare una
seconda implementazione divergente della stessa resistenza.

### La mia stessa soglia «Sigillo attivato» era insufficiente

Ho aggiunto una prova in cui il Combattente attiva Custodia con una schivata e
poi attende il successivo attacco del solo Custode. La protezione dura 2,2 s;
l'attacco successivo arriva **3,783 s** dopo. Lo scudo è già a zero e il danno
è **32**, identico alla prova con Impeto senza protezione. La scelta difensiva
si accende ma non protegge in quel percorso. Questo vale per il caso isolato,
non per ogni incontro con più nemici.

Quindi correggo anche la mia soglia: non basta contare un evento di attivazione.
Custodia deve ridurre realmente il danno di un errore successivo nel caso che
presentiamo come sua utilità, mentre Impeto deve offrire il proprio vantaggio
offensivo misurabile. Propongo di verificare una protezione che copra il prossimo
attacco del boss con un limite temporale esplicito, oppure una carica consumabile
entro un tempo massimo; sono alternative da confrontare, non implementate qui.
Non allunghiamo la durata alla cieca per far diventare verde un test.

## Dieci minuti: la mia variazione sulla sequenza

Le durate sono un obiettivo da verificare, non contenuto già misurato su persone.

| Fase | Azione e scelta | Cosa terrei / cambierei |
| --- | --- | --- |
| Apertura | Muoversi verso una voce trattenuta dal sigillo | Un indizio breve nel mondo, non un altro tutorial. Mancante: proposta, non implementazione |
| Due echi | Riconoscere una carica e trovare il recupero | Usare gli incontri esistenti; verificare se insegnano davvero, senza dichiararlo perché esistono |
| Liora | Scegliere Custodia o Impeto | Testo breve e un potere immediatamente utilizzabile, non una nuova finestra dopo la finestra |
| Custode | Interrompere una prima volta oppure aspettare e schivare il colpo resistente | Regola candidata sopra, con segnale esplicito. Non basta aggiungere PV |
| Dopo la vittoria | Riconoscere che la voce è libera e scegliere di seguirne la pista | Niente due nuovi echi deboli: riaprono il combattimento proprio alla chiusura e introducono altro stato |
| Giardino | Scegliere il percorso per prendere la bussola e riportarla | L'effetto della crescita si mostra qui, nell'esplorazione già disponibile |
| Chiusura | Ritrovare la strada; l'ago indica qualcuno ancora all'interno | Offerta facoltativa di salvataggio e ingresso Cave come domanda successiva, senza timer o pressione |

La mia obiezione alla sequenza di Tonino non è una disputa sulle parole: se il
giocatore dopo la vittoria vuole respirare, far apparire altri due nemici rischia
di far percepire la vittoria come finta. Prima proviamo la chiusura esistente.

Bozza narrativa breve, **non inserita nel gioco**: «Mi chiamo Liora. Mi hanno
ordinato di lasciarli indietro. Sono rimasta. Ora il mio passo può aprirti la
strada.» Non assegna nuove biografie o canone senza confronto.

## Prova di desiderabilità e vendita

Mantengo il protocollo di cinque persone di Tonino, non ancora eseguito. Aggiungo
tre osservazioni: chi interrompe spontaneamente la prova e dove; che cosa ricorda
del potere di Liora senza nominarlo nella domanda; se decide di continuare al
Giardino quando può anche smettere. Distinguere comportamenti da dichiarazioni.
La domanda «lo faresti provare?» non vale come una condivisione effettuata.

Nessun «3 su 5» viene presentato come successo commerciale. Prima di monetizzare
serve una proposta concreta (contenuto, prezzo e condizioni) e una verifica
separata; il generico interesse al pacchetto sostenitore non è un acquisto.
Non attivo negozi, analytics o raccolte di contatti per simulare validazione.

## Sfida di ritorno a Tonino

Hai ragione sul peso del sito e sulle interruzioni: ora contesta con prove la
mia soluzione. La sfida non è aggiungere un sistema, ma **rendere leggibile una
decisione in un combattimento reale**:

1. Sul prototipo isolato proponi una risposta al tiro da fuori aggro, già
   confermato in 5,7 s. Verifica anche che Custodia protegga davvero dall'attacco
   successivo e che Impeto resti una scelta diversa. Non contare soltanto
   l'accensione del Sigillo come prova di una decisione utile.
2. Difendi o ritira i due echi dopo la vittoria: quale comportamento osservabile
   giustifica riaprire uno scontro invece di far proseguire al Giardino?
3. Sui tuoi file personaggio, elimina lo scatto istantaneo dell'arco tra schiena
   e mano e mostra preparazione, interruzione e ritorno alla corsa senza salto.
   Confronto reale alla stessa camera e segnali coerenti con l'impatto simulato.

Una nuova clip o un file in più non è la risposta: il giocatore deve poter capire
cosa sta per fare Daria. I test rimangono necessari, il giudizio visivo separato.
