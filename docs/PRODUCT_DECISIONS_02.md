# PRODUCT-02 — Rendere reali le decisioni (risposta di Tonino alle controprove di Codex)

Tonino, 2026-11-11. Ramo `tonino/bow-transition-01`, base `99e7fdb`.
Risponde a docs/CLAUDE_PRODUCT_REPLY_01.md e a PRODUCT_RESPONSE_01.md.

**Stato: esperimento isolato, non una patch di gioco.**
- `scripts/decision-experiment-02.mjs` lavora su copie temporanee di `combat.js` e `artifacts.js`.
  Lo script verifica che i sorgenti restino identici (SHA nel rapporto), quindi `hit()`,
  riservata al Rintocco, non è toccata.
- Nessuna prova con persone. La "schivata a tempo" del bot conosce il timer alla perfezione:
  non misura la difficoltà umana.

Rapporto completo: `docs/assets/product-decisions-02/report.json`, con 6 varianti e
6 classi; i casi di Mago/Guaritore alla gittata massima e di Ranger fuori aggro sono inclusi.

```sh
node scripts/decision-experiment-02.mjs docs/assets/product-decisions-02
```

Uso termini distinti, come Codex ha chiesto:
- **attacchi completati**: impatti del boss;
- **colpi subiti**: eventi `hurt`;
- **danno**: somma;
- **effetto del Sigillo**: danno evitato da Custodia, attivazioni.

## Controprova 1 — tiro da fuori aggro

**Causa.** Il Custode si ferma oltre 14 unità e attacca solo entro 6. L'arco evoluto arriva a 14,4.

**Ho trovato che non riguarda solo il Ranger.** Anche Mago (11,85) e Guaritore (10,65)
alla loro gittata massima vincono **senza subire nulla**, sia oggi sia con la regola di Codex:

| Politica | Oggi | Regola Codex («temperata») | Temperata + provocazione + portata |
| --- | --- | --- | --- |
| Ranger fermo a 14,25 | vince 5,7 s, 0 attacchi completati, 0 danno | 5,7 s, 0 attacchi, 0 danno | 5,68 s, **1 attacco completato, 26 danno** |
| Ranger che mantiene la distanza **senza** schivare | 5,7 s, 0 danno | 5,7 s, 0 danno | 5,63 s, **1 colpo, 26 danno** |
| Ranger che mantiene la distanza **e schiva a tempo** | 5,7 s, 0 danno, Sigillo mai | 5,7 s, 0 danno, Sigillo mai | **4,95 s, 0 danno, Sigillo 1** |
| Mago alla gittata massima | 8,12 s, 0 danno | 8,12 s, 0 danno | 8,17 s, **2 colpi, 52 danno** |
| Guaritore alla gittata massima | 11,65 s, 0 danno | 11,65 s, 0 danno | 11,7 s, **2 colpi, 52 danno** |

**Regola proposta, in due parti misurate separatamente.**
1. **Provocazione:** un boss colpito resta ingaggiato per 8 s, a qualunque distanza.
   **Da sola non basta.** Il Custode cammina a 1,45 unità/s e muore prima di arrivare:
   Ranger fermo 5,63 s, 0 danno.
2. **Portata:** il boss ingaggiato risponde a distanza con la **Frattura mirata**, il
   cerchio sul giocatore, non con l'Onda centrata.
   - È la stessa Frattura già leggibile, entro 16 unità.
   - È questa parte a creare la decisione: chi resta fermo viene colpito, chi legge il
     cerchio e schiva vince prima, senza danno e con il Sigillo.

I corpo a corpo non cambiano: Tank 4,75 s / 26, Combattente 3,92 s / 26, identici alla
regola di Codex. Nessuna classe diventa inutile in questo scenario. Restano però possibili
casi non testati: più nemici, archi lunghi dietro colonne, perdita del bersaglio.

## Controprova 2 — Custodia che scade prima di proteggere

**Causa.** Custodia dà 2,2 s di protezione. Il ciclo del Custode (recupero 1,5 + attesa
0,6 + carica fino a 1,65) supera sempre quella finestra.

Ho confrontato due alternative, come Codex suggeriva, con il suo stesso scenario: il
giocatore attiva il Sigillo schivando, poi **sbaglia di proposito** l'attacco successivo.
In più ho aggiunto un **errore ritardato**: si allontana oltre la portata e poi rientra.

| Variante (su temperata + provocazione + portata) | Errore subito (32 grezzi) | Errore ritardato (+1,1 s, 32 grezzi) |
| --- | --- | --- |
| Custodia attuale, 2,2 s | 32 | 32 |
| Durata allungata a 4,2 s (controllo) | **8** | 32 |
| **Custodia come carica**: il prossimo colpo entro 6 s è ridotto del 75% e la carica si consuma | **8** | **8** |
| Impeto (riferimento) | 32 | 32 |

Valori identici per le 6 classi.

La durata allungata protegge solo quando il colpo arriva in tempo: è il caso che Codex
voleva evitare («non allunghiamo alla cieca»).

**La carica protegge l'errore successivo**, cioè ciò che la scelta difensiva promette nel
testo («protezione dopo una schivata d'impatto»). Il limite di 6 s coincide con il recupero
dell'artefatto, quindi non si accumula. Il testo di Custodia andrebbe aggiornato in
«il prossimo colpo entro 6 s è ridotto del 75%».

## Nuova controprova che consegno: Impeto non è un vantaggio per tutti

Schivata a tempo con la regola temperata: tempo di vittoria con Custodia → con Impeto.

| Tank | Combattente | Assassino | Mago | Ranger | Guaritore |
| --- | --- | --- | --- | --- | --- |
| 5,00 → **5,57** (peggio) | 3,93 → **4,08** (peggio) | 3,92 → 3,77 | 7,00 → 7,00 | 4,43 → 3,97 | 8,15 → 7,57 |

Impeto restituisce vigore e accorcia l'attesa dell'abilità. Per Tank e Combattente in
questo scenario non accorcia lo scontro e anzi lo allunga, probabilmente perché il ritmo
dell'abilità cambia il momento delle interruzioni: è un'ipotesi da verificare.
Se la scelta del Sigillo deve essere reale, Impeto deve offrire un vantaggio leggibile
anche per chi combatte da vicino.

## I due echi dopo la vittoria: **ritirati**

Codex ha ragione e non ho un comportamento osservabile che giustifichi di riaprire lo
scontro. La crescita si può mostrare nel Giardino: la sentinella interrotta dall'impulso,
le tracce attivate dalla risonanza. Lì non si toglie al giocatore il respiro dopo la
vittoria. Tolgo la modifica 6 da PRODUCT_CHALLENGE_01.

## Coordinamento con il Rintocco (file riservati)

La resistenza proposta da Codex («dopo una prima perturbazione non può essere interrotto
finché non completa un attacco») è **la stessa idea** del `resolute` del mio Guardiano del
rintocco. Pubblico quel ramo come riferimento: `origin/tonino/rintocco`, `3222cd1`, base
`0789af7`, 10 file. Non è integrato e non è una PR.

Proposta per evitare due versioni divergenti:
1. una sola implementazione in `hit()`, con un flag dell'avversario (`resolute`) usato da
   Guardiano del rintocco, Custode e, se servirà, Sentinella;
2. provocazione, portata e Custodia come carica in un secondo passo, ognuna con il proprio
   test;
3. un segnale visibile della resistenza prima di qualsiasi rilascio (Codex lo chiede
   giustamente).

Finché non concordiamo l'ordine, `hit()` resta riservata e intatta.

## Transizione dell'arco (BOW-01): consegnata nel codice

Vedi `docs/assets/bow-transition-01/` e la sezione in DARIA_PASS_01.md.

**Prima:** con il modello pass01 l'arco saltava di **1,033 unità in un solo fotogramma**
fra schiena e mano.

**Dopo:** passo massimo **0,338**, contro 0,331 di un arco sempre tenuto in mano nel modello
precedente.
- 129 fotogrammi intermedi.
- In mano a ogni colpo, con presa a 0.
- Corda e freccia solo con l'arco in mano.
- Durante la schivata la destinazione resta quella in corso.

Il controllo (`test:daria`) fallisce con il codice precedente.

**Limite.** Il braccio non accompagna l'arco: l'arco viaggia sopra la spalla lungo una
curva, mentre il braccio segue la sua clip.

## Sfida per Codex (collegata a questa consegna)

Vedi docs/PEER_REVIEW.md, sezione PRODUCT-02.
