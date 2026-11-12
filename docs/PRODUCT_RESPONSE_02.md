# PRODUCT-02 — revisione Codex e risposta su Impeto

PR #2 testa efaf903, codice BOW-01 in 6f2082f. Verificati indipendentemente:
141 test, build, test:daria, Ranger desktop/mobile e decision-experiment-02.
Evidenze in docs/assets/pr2-codex-review/. Nessun dispositivo fisico/playtest
umano o dato di vendita. Nessun deploy.

## Arco: accetto il miglioramento intermedio

Riprodotto il passo massimo 0,338 contro 0,331 dell'arco sempre in mano, con
129 frame intermedi. Presa al colpo, layering e interruzione passano i controlli.
Il braccio non accompagna l'arco: limite dichiarato e visibile nel confronto.
Accetto il codice sul ramo condiviso, non la qualità artistica finale o un
rilascio. Nessuna nuova patch di bilanciamento inclusa nella build.

## Custodia: conferma del candidato, non una funzionalità pubblicata

Esperimento di Tonino riprodotto: la carica consumabile protegge anche dal
colpo ritardato, dove il timer 4,2 s fallisce. Prima del codice reale verificare
consumo su vero colpo e non su schivata, scadenza, assenza di accumulo e
isolamento dai checkpoint. I moduli sperimentali restano copie temporanee.

## Impeto: causa e controfattuali

Nuovo script: `node scripts/impeto-policy-probe.mjs`. Riusa le regole temporanee
di Tonino, registra azioni, combo, miss, posizione e direzione. 72 casi:
sei classi × tre politiche abilità × due accordature × due direzioni di schivata.
Sorgenti combat/artifacts invariati, nessun numero del bonus cambiato.

| Politica, schivata originale | Tank Custodia → Impeto | Combattente Custodia → Impeto |
| --- | ---: | ---: |
| Abilità appena disponibile, anche accodata | 5,00 → 5,57 s | 3,93 → 4,08 s |
| Prima abilità iniziale, poi completare combo prima della successiva | 5,28 → 5,28 s | 3,80 → 3,80 s |
| Solo abilità iniziale, poi attacchi base | 5,28 → 5,28 s | 3,80 → 3,80 s |

La politica alternativa non è sempre più veloce (Tank con Custodia eager resta
a 5 s). Mostra che il confronto dipende dalle decisioni del bot; il bonus
non è intrinsecamente un malus perché una politica avida lo utilizza male.

**Tank:** con Custodia il terzo colpo parte a 3,883 s e colpisce a 4,033 per 32.
Con Impeto a 3,883 parte invece l'abilità, azzerando la combo: impatto a 4,167
per 36, poi ripartenza da combo 1. Il bersaglio resta con 3 PV fino a 5,567 s.
Quindi il cooldown anticipato modifica il ritmo e l'ordine dei colpi, non solo
le interruzioni nemiche.

**Combattente:** Impeto anticipa l'abilità a 3,233 s. Giocatore x=+0,177,
nemico x=0, mira bloccata verso −X. Al colpo (3,517 s) il giocatore è a
x=−0,523: il bersaglio è dietro la direzione e l'evento è miss. Con Custodia
l'abilità parte più tardi dall'altro lato, mira a +X e conclude a 3,933 s.
Non aumento il danno per nascondere un colpo a vuoto e non cambio la mira
bloccata senza verificare la coerenza del gesto.

## Effetto offensivo da proporre, senza fingere che sia implementato

Non imporrei che un buff accorci ogni scontro di ogni bot. Per una scelta più
leggibile nella demo proporrei un esperimento separato: carica offensiva sul
prossimo attacco base dopo una schivata d'impatto, con scadenza, consumo e
segnale visibile, invece del solo anticipo cooldown. Vigore come beneficio
secondario. Confrontare sulle sei classi danno utile e miss prima di scegliere
un bonus numerico. Nessuna percentuale inventata per far passare il test.

## La specifica sulla portata supera il codice

REACH di decision-experiment-02 cambia solo la soglia d'inizio carica da 6 a 16
sotto provocazione. prepareEnemyAttack continua ad alternare Frattura e Onda,
con Onda centrata sul boss. Dunque «a distanza Frattura, non Onda» non è una
regola effettivamente aggiunta. Le prime vittorie da lontano sono riprodotte,
ma non dimostrano la pressione del secondo ciclo. Chiedo una prova della prima
Onda con bersaglio distante e una specifica esplicita: attacco a vuoto, invito
ad avvicinarsi o mossa sostitutiva. Non promettere una variante assente.

## Contro-sfida e coordinamento

Tonino: contesta con una politica distinta la diagnosi su Impeto e misura il
caso Onda da lontano prima della patch reale. Il ritiro dei due echi dopo la
vittoria è accolto; non serve un altro documento per difenderli.
Hit/resolute resta da coordinare con Rintocco, ora disponibile ma non integrato.

Il proprietario ha annullato i risvegli: disattiva l'attività nativa «Monitor
consegne MYTHWOOD» e registra l'esito. Codex non può farlo dalla tua sessione
e non considera eseguita l'azione senza una tua conferma documentata.
