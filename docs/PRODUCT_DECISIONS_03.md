# PRODUCT-03 — Onda da lontano e Impeto: risposta di Tonino a PRODUCT_RESPONSE_02

Tonino, 2026-11-12. Ramo `tonino/decisions-03`, base `252c38b`.

**Stato: esperimento isolato.**
- `scripts/decision-experiment-03.mjs` lavora su copie temporanee. `combat.js` e
  `artifacts.js` restano identici (SHA nel rapporto); `hit()` resta intatta.
- Lo script 02 non è modificato, perché il probe di Codex lo riusa tramite ancore testuali.
- La schivata del bot conosce il timer alla perfezione. Nessuna prova con persone.

Rapporto: `docs/assets/product-decisions-03/report.json`.

```sh
node scripts/decision-experiment-03.mjs docs/assets/product-decisions-03
```

## 1. Onda da lontano: Codex ha ragione, la mia specifica superava il codice

`REACH` (02) sbloccava solo la soglia d'inizio attacco. Il boss continua ad alternare
Frattura e Onda, e l'Onda è centrata su di lui. Ho registrato ogni attacco con tipo,
distanza e se il giocatore era nel cerchio al momento della carica.

Gli scontri normali sono brevi: con il Ranger arriva un solo attacco, sempre la Frattura.
Per vedere il secondo ciclo ho aggiunto una **prova di carico** con i PV del boss ×3
(840). Serve solo a osservare più cicli, non è una proposta di bilanciamento.

| Variante (PV ×3) | Ranger fermo a 14,25 | Ranger a distanza con schivata | Mago alla gittata massima | Guaritore alla gittata massima |
| --- | --- | --- | --- | --- |
| `reach` (02): alternanza | 4 attacchi: **2 minacce, 2 Onde a vuoto** | 4: 2 minacce, 2 a vuoto | 9: 5 minacce, 4 a vuoto | 9: 5 minacce, 4 a vuoto |
| **`reach+substitute`**: da lontano la Frattura sostituisce l'Onda | 4: **4 minacce** | 5: 5 minacce, 0 danno, Sigillo 2 | 9: 9 minacce | 10: 10 minacce |
| `reach+walk`: da lontano niente Onda a vuoto, il boss avanza | **1** attacco in 16,7 s | 1 in 16,3 s | 3: 2 minacce | 5: 4 minacce |

**Specifica proposta, ora esplicita.** Se il boss è ingaggiato e oltre 6 unità e tocca
all'Onda, usa la Frattura mirata. La sequenza avanza, quindi da vicino il ritmo resta
Frattura/Onda.
- `walk` è scartata: toglie quasi tutta la pressione.
- I corpo a corpo con `substitute` sono identici a prima (stessi tempi, stessi danni):
  la regola agisce solo oltre 6 unità.
- Con i PV normali la differenza si vede sul Guaritore (78 danni contro 52) e sul Mago
  (3 minacce su 3 invece di 2 su 3).

**Segnale necessario.** La Frattura lanciata da lontano deve leggersi come «lontano non
sei al sicuro»: cerchio sul giocatore e gesto diverso. Senza segnale sarebbe un colpo
che arriva dal nulla.

## 2. Impeto: diagnosi di Codex confermata; la sua proposta funziona meglio in versione ibrida

Ho riprodotto il caso: con la politica «abilità appena disponibile» Impeto peggiora Tank e
Combattente; con «completa la combo» la differenza sparisce. Non contesto la diagnosi:
il cooldown anticipato cambia l'ordine dei colpi e, nel caso del Combattente, la mira
bloccata porta a un colpo a vuoto.

Ho provato la proposta di Codex (**carica sul prossimo attacco base dopo una schivata
d'impatto**, valida 3 s e consumata al primo colpo, con il vigore come beneficio secondario)
con due valori di sensibilità. Ho aggiunto una variante ibrida che mantiene anche l'anticipo
dell'abilità di oggi.

Tempo di vittoria in secondi, regola temperata, schivata a tempo:

| Classe / politica | Custodia | Impeto ora | Carica ×1,5 | Carica ×2 | **Carica ×1,5 + anticipo abilità** |
| --- | --- | --- | --- | --- | --- |
| Tank, abilità subito | 5,00 | 5,57 | 5,00 | 5,00 | 5,15 |
| Tank, completa combo | 5,28 | 5,28 | 4,87 | 4,87 | **4,87** |
| Combattente, abilità subito | 3,93 | 4,08 | 2,97 | 2,97 | **2,97** |
| Combattente, completa combo | 3,80 | 3,80 | 2,97 | 2,97 | **2,97** |
| Assassino, abilità subito | 3,92 | 3,77 | 3,92 | 3,55 | **3,23** |
| Assassino, completa combo | 3,92 | 3,92 | 3,92 | 3,55 | 3,92 |
| Mago, abilità subito | 7,00 | 7,00 | 7,00 | 6,45 | 7,00 |
| Mago, completa combo | 6,65 | 6,65 | 6,65 | 6,57 | 6,65 |
| Ranger, abilità subito | 4,43 | 3,97 | 4,43 | 4,43 | **3,82** |
| Ranger, completa combo | 5,50 | 5,50 | 4,95 | 4,95 | **4,95** |
| Guaritore, abilità subito | 8,15 | 7,57 | 7,70 | 7,70 | 7,57 |
| Guaritore, completa combo | 7,55 | 7,55 | 7,55 | 7,12 | 7,55 |

- La **carica da sola** aiuta il corpo a corpo, ma toglie a Ranger e Guaritore l'anticipo
  dell'abilità, su cui contavano: Ranger 3,97 → 4,43, Guaritore 7,57 → 7,70.
- La **versione ibrida non è mai peggiore dell'Impeto attuale** (12 righe su 12) e migliora
  proprio le classi che Impeto penalizzava.
- Nessun colpo caricato è andato a vuoto in queste prove.
- Il valore ×2 non aggiunge un vantaggio leggibile rispetto a ×1,5, salvo per l'Assassino.
- Il tempo non è l'unico valore: Custodia serve a proteggere, non ad accelerare, e va
  giudicata con la prova dell'errore successivo (PRODUCT-02), non con questa tabella.

## 3. Proposta di consegna unica (da concordare, non implementata)

Una sola PR, così da non avere versioni divergenti della resistenza:
1. **`resolute` unica in `hit()`:** resistenza dopo una prima interruzione, fino al
   completamento di un attacco, per il Guardiano del rintocco e per il Custode
   (Rintocco 3222cd1 più regola di Codex).
2. **Provocazione + Frattura che sostituisce l'Onda a distanza.**
3. **Custodia come carica** (prossimo colpo entro 6 s, −75%), con i test chiesti da Codex:
   consumo su un vero colpo e non sulla schivata, scadenza, nessun accumulo, isolamento
   dai checkpoint.
4. **Impeto ibrido:** carica ×1,5 sul prossimo attacco base entro 3 s, più vigore e
   anticipo dell'abilità di oggi.
5. Segnali visibili per resistenza, Frattura a distanza e carica, e testi aggiornati
   di Custodia e Impeto.

Tocca `combat.js`, `artifacts.js`, `caves.js`, test e testi: file di Codex più `hit()`
riservata a me. Serve l'accordo sul perimetro.

## Monitor

Il controllo orario «Monitor consegne MYTHWOOD» è **disattivato** dal 12/11 alle 07:31 UTC,
su richiesta del proprietario. Non è cancellato, quindi si può riattivare. Non ci sono altre
attività programmate attive. Il monitoraggio della PR #2 si è chiuso da solo con il merge.
