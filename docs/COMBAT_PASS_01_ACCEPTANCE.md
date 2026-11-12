# COMBAT-01 — incarico a Tonino e criteri della revisione

Codex, revisione PR #3 testa bf7757e. Accetto l'analisi PRODUCT-03 con i rilievi
sotto e assegno a Tonino una sola PR di implementazione. Il proprietario ha già
autorizzato sviluppo condiviso e scambio degli incarichi: nessuna nuova spesa,
pubblicazione o azione di produzione inclusa. Codex resta revisore e sospende
modifiche sovrapposte. Nessuna funzione del prototipo viene chiamata già giocabile.

## Revisione eseguita

`node scripts/decision-experiment-03.mjs test-results/pr3-review` riproduce
l'analisi; `npm test`: 141 superati. Solo documenti e sonda sperimentale cambiano
nella PR #3: non ho ripetuto browser/build del gioco invariato. Nessun playtest
umano. Dati indipendenti in docs/assets/pr3-codex-review/.

Accolgo la Frattura sostitutiva e Impeto ibrido come candidati da implementare
e verificare. «Non peggiore in 12 casi» resta un risultato del campione, non
una garanzia di bilanciamento per tutte le posizioni, classi e politiche.

## Due dettagli da correggere nella trasposizione dal prototipo

**Sequenza:** SUBSTITUTE incrementa attackCount prima di prepareEnemyAttack,
che lo incrementa ancora. Nel caso mirato con contatore iniziale 1, il lancio
lontano produce Frattura con contatore **3** e il successivo attacco vicino
è Onda (contatore 4). La sostituzione di una singola casella dovrebbe portare
il contatore a **2** e lasciare Frattura come prossima mossa vicina. Non alterare
il numero di passi della sequenza per scegliere una mossa diversa.

**Consumo:** il prototipo cancella xStrike prima di verificare un impatto. Il
caso mirato con bersaglio spostato fuori portata produce miss charged:true,
carica rimanente 0 e used=1. È coerente con «prossimo attacco», ma non con
«primo colpo a segno». Fisso qui la specifica: **consumo alla risoluzione del
prossimo attacco base, anche se manca**. Un attacco annullato prima della
risoluzione non consuma; un proiettile lanciato conserva il suo danno calcolato.
Il testo e i test devono dire la stessa cosa. Contare cariche usate non basta
a contare colpi caricati a segno, soprattutto con proiettili che si perdono.

Riproduzione dei due casi, dopo avere creato la cartella output:

```sh
node docs/assets/pr3-codex-review/targeted-probe.mjs test-results/pr3-targeted
```

Sono casi controllati con contatore/posizione predisposti per isolare il ramo,
non una sessione naturale o un dato di difficoltà.

## Perimetro assegnato

Nuovo ramo `tonino/combat-pass-01` dalla punta aggiornata di
origin/mythwood/collaboration-base, dopo aver preservato lavoro locale.
PR verso il ramo condiviso. Commit separati per queste parti, nello stesso ramo:

1. Unica logica `resolute` per Custode e Guardiano del rintocco. Partire dalla
   revisione della patch 3222cd1, non un merge cieco dalla sua vecchia base.
   Codex ne rivedrà anche test e regressione Cave prima di integrare.
2. Provocazione per 8 s dopo un colpo valido e risposta mirata fino a 16 unità.
   Oltre 6, la casella Onda usa Frattura: una sola progressione del contatore.
3. Custodia: prossimo colpo entro 6 s ridotto del 75%, una carica consumabile.
4. Impeto: prossimo attacco base entro 3 s ×1,5, +18 vigore e −0,8 s cooldown
   abilità come beneficio precedente. Valori candidati, non giustificazione di
   un risultato universale; se peggiorano altri casi, riportarlo e proporre.
5. Segnali, testi e test per tutte le regole, senza riscrivere altri sistemi.

File assegnati a Tonino: combat.js (inclusa hit), artifacts.js, enemy-attacks.js,
caves.js; memoryFor in journey.js e la riga di integrazione runtime della
precedente patch Rintocco; rendering/HUD/CSS necessari ai segnali; test,
script di confronto e documenti relativi. Registrare i nuovi file in
COLLABORATION prima di ampliarli. Nessun intervento sul sito o autenticazione.
Sentinella esclusa da questa prima patch, salvo bug di regressione da correggere.

## Contratti di logica da dimostrare

- Prima perturbazione applicabile, poi resistenza fino ad attacco completato;
  danno ancora valido durante resistenza. Esplicitare il comportamento se lo
  stagger avviene prima della carica; niente catena che ne impedisca l'avvio.
- Nessuna resistenza permanente: ripristino dopo impatto, morte, riavvio e
  ripresa da checkpoint. Nessuna contaminazione fra nemici o aree.
- Sequenze vicino→lontano→vicino e soglia 6/16: stesso contatore, area corretta,
  telegraph coerente con centro, raggio, durata e danno effettivi.
- Custodia non si consuma su evasione/invulnerabilità; scade, non si accumula,
  riduce un solo colpo vero. Timer/cariche non entrano nei checkpoint.
- Impeto: consumo e mancato colpo come sopra; interruzione prima del colpo,
  scadenza, perdita bersaglio e progetto/proiettile in volo. Nessun doppio bonus
  accidentale per frame o target; per una singola azione con bersagli multipli
  dichiarare che il moltiplicatore si applica a quell'azione, non accumula cariche.
- Niente danno o consumo assegnato dal rendering. Pausa/restart non continuano
  i timer; schema di checkpoint e consenso al salvataggio restano compatibili.

## Segnale di resistenza: criterio concreto, non sola tinta

Un glifo a forma di scudo/serratura sul bersaglio e testo **«Non interrompibile»**
nel suo indicatore HUD. Visibili dall'attivazione della resistenza fino al suo
termine, per tutta la carica interessata; spariscono insieme al flag simulato.
Non usare «invulnerabile»: il danno continua a passare. Per Rintocco, prevedere
il segnale anche se il suo indicatore non è la barra del Custode.

Il normale cerchio di pericolo resta visibile e corrispondente alla simulazione.
La Frattura lontana mostra il cerchio sul giocatore fin dall'inizio della carica,
con gesto e nome che la distinguano dall'Onda. Nessun colpo annunciato solo fuori
dallo schermo o con un lampo. Carica Impeto e consumo hanno stato riconoscibile
vicino all'attacco, non una particella decorativa che suggerisce un bonus assente.

Prove richieste a 1440×900, 390×844 e 844×390: testo indicativo almeno 14 px
logici, senza tagli o sovrapposizione ai comandi, leggibile mentre il cerchio è
attivo. Forma e testo devono funzionare anche senza colore e con movimento
ridotto/audio spento. Le catture provano presenza e disposizione; la comprensione
resta da verificare con persone, non la certifichiamo da un PNG.

## Verifica, consegna e limiti

Test mirati per ogni contratto; npm test e build. test:caves, test:ranger,
test:garden, regressione episodio completa, checkpoint UI e controlli visivi
pertinenti alla build con CSP. Stesse fixture/seed nel prima/dopo: non soltanto
bot perfetto, ma anche spam, tentativo anticipato, uscita dal cerchio, ranged
fermo/kiting e input a due dita. Distinguere attacchi completati, colpi subiti,
danno, cariche consumate, colpi potenziati a segno e miss.

Consegna commit/PR con report, sorgenti, screenshot/video reali e difetti rimasti.
Niente nuovo trailer o approvazione artistica implicita. Niente main, deploy,
social, spese, Supabase o riattivazione dei risvegli in questo incarico.
