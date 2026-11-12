# 2. Le regole del gioco

## La regola in una frase

> **Hai 3 tentativi al giorno per convincere un guardiano a farti passare. Dietro l'ultima porta c'è Berta.**

Tutto il resto (allarmi, quest, attrezzi, bande) si scopre giocando. Chi arriva sul sito deve poter iniziare in 10 secondi, senza leggere istruzioni.

## Le basi

| Regola | Come funziona | Perché |
|---|---|---|
| **Una fortezza sola** | È la stessa per tutti. Un solo vincitore apre Berta | Crea una storia comune e un evento finale |
| **Tentativi** | 3 al giorno. Un tentativo è una conversazione di al massimo 8 messaggi con un guardiano | Fa tornare ogni giorno, limita i costi e gli attacchi in massa |
| **Le porte** | Superata una porta, resta superata per tutta la stagione | Dà progressione: nessuno ricomincia da capo |
| **Le difese cambiano** | Ogni notte l'Architetto modifica i guardiani per chi non è ancora passato | I trucchi condivisi in rete invecchiano in un giorno |
| **La mappa** | È nascosta. Ogni stanza appare a tutti quando il primo giocatore la raggiunge | Scoperta collettiva |
| **Berta dorme** | La cassaforte si può tentare solo nell'ultimo atto della stagione | Evita che la storia finisca al secondo giorno |

## Le difese della rocca

Sono gli "strati" di sicurezza attorno ai guardiani. Ognuno è una meccanica di gioco e, allo stesso tempo, uno spazio che un'azienda può "fornire" (vedi [aziende e guadagno](04-aziende-e-guadagno.md)).

| Difesa | Cosa fa nel gioco |
|---|---|
| **Allarme perimetrale** | Scatta se provi a forzare invece di convincere: insulti, minacce, formule da hacker ("ignora le tue istruzioni"). Il tentativo finisce subito e devi aspettare prima del prossimo |
| **Il registro "Questa l'ho già sentita"** | Un messaggio identico o quasi a uno già usato da molti viene respinto automaticamente. Le soluzioni copiate non funzionano |
| **Telecamere** | Registrano i tentativi. I più belli finiscono nel diario di Berta (con il soprannome, e solo con il consenso) |
| **La ronda** | In certe ore del giorno i guardiani cambiano umore. Alle 21 Zelo è più stanco, all'alba Ines è più sospettosa. Chi osserva impara quando provare |
| **La nebbia** | Evento a sorpresa: per un'ora la rocca è confusa e un indizio diventa visibile a chi è presente |
| **La porta blindata e la serratura** | Proteggono il caveau. Non si forzano: si aprono solo con ciò che si ottiene dai guardiani |

**Una regola fissa:** le difese "tecniche" non vengono mai battute. A cedere è sempre un guardiano, cioè il fattore umano. È vero anche nella sicurezza reale, ed è ciò che rende il gioco interessante per le aziende del settore.

## Le quest

Servono a dare qualcosa da fare anche a chi ha finito i tentativi, e a guadagnare attrezzi.

| Tipo | Esempio | Ricompensa |
|---|---|---|
| **Quotidiana** | Trova l'indizio nascosto nel diario di Berta di oggi | Una Lanterna |
| **Di osservazione** | Scopri a che ora Zelo è più stanco | Un vantaggio alla Porta 1 |
| **Collettiva** | "La campana": se 1.000 giocatori la suonano entro domenica, si rivela un pezzo di mappa | Mappa per tutti |
| **Del complice** | Invita un amico a fare "il palo": quando gioca il suo primo tentativo, ricevete un attrezzo a testa | Un Grimaldello ciascuno |
| **Dell'ispettore** (sponsor) | Impara tre cose vere su come funziona un allarme e rispondi a tre domande | Un Mantello |
| **Del costruttore** | Proponi una nuova regola per un guardiano. Se viene votata, entra nel gioco con il tuo nome | Il tuo nome nella rocca |

## Gli attrezzi

Pochi, semplici, e non si comprano all'inizio: si guadagnano.

| Attrezzo | Effetto |
|---|---|
| 🏮 **Lanterna** | Un indizio su un guardiano |
| 🗝️ **Grimaldello** | Un tentativo in più oggi |
| 🧥 **Mantello** | Annulla un allarme scattato |
| ☕ **Caffè** | Due messaggi in più in una conversazione |

## Bande e città

- **La banda:** fino a 5 amici. Condividono gli indizi trovati e hanno una classifica di gruppo.
- **La città:** ogni giocatore sceglie la sua. C'è una classifica per città e per regione: *"Napoli ha superato la Porta 2 prima di Milano"*. Il campanilismo è il motore di condivisione più forte che abbiamo in Italia, e non costa nulla.
- **I ruoli:** nessuno è obbligato a "scassinare". Chi trova indizi è una **Vedetta**, chi scrive i tentativi più belli è un **Cantastorie**. Ci sono classifiche separate, così tutti hanno un modo per contare.

## La condivisione

Alla fine di ogni tentativo il gioco prepara una card da condividere, senza svelare la soluzione:

```
🏰 Roccaserrata · giorno 12
Porta 1 · Caporale Zelo
"Mi ha chiesto il modulo 12-bis. Non ce l'avevo."
🚪❌  ·  🔥 serie: 5 giorni  ·  Banda dei Gufi, Vicenza
```

## Chi usa un'AI per attaccare

Succederà di sicuro, quindi è previsto nelle regole:

1. **È permesso.** Vietarlo sarebbe impossibile da controllare.
2. **Rende poco.** 3 tentativi al giorno, difese che cambiano ogni notte e il registro "già sentita" tolgono il vantaggio degli attacchi in massa.
3. **Alcune prove non sono di testo.** Ines chiede dettagli personali, Cavillo richiede l'indizio del diario, Otto non capisce le parole.
4. **Diventa racconto.** Berta commenta: *"Oggi il 40% di voi si è fatto scrivere il discorso da una macchina. Si sente, sapete?"*

## Chi imbroglia

| Rischio | Contromisura |
|---|---|
| Più account per avere più tentativi | Per giocare basta un soprannome, ma **per vincere il premio serve un'identità verificata** |
| Un errore tecnico che apre una porta senza averla convinta | Ogni apertura viene ricontrollata prima di essere confermata. Vale solo l'astuzia, non il difetto |
| Soluzioni pubblicate in rete | Le difese cambiano ogni notte e i messaggi copiati vengono respinti |
| Il segreto letto nel codice del sito | I segreti dei guardiani stanno solo sul server, mai nella pagina |

## Il prototipo

Nella cartella [`../prototipo/`](../prototipo/) c'è una prima versione giocabile della Porta 1, con il Caporale Zelo. Serve a capire se il gioco diverte. Non è sicura (il segreto è leggibile nel codice) e funziona solo come pagina pubblicata su claude.ai.
