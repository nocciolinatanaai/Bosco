# 🏰 La Fortezza (bozza di progetto)

> **Una fortezza. Sette porte. Ogni porta ha un guardiano AI. Dietro l'ultima c'è la cassaforte, ma nessuno sa quale sia l'ultima.**

Progetto parallelo, separato dal Bosco di Nocciolina. È una bozza da criticare e migliorare: tutto quello che c'è qui può cambiare.

---

## 1. L'idea in breve

- Un sito in cui il pubblico sfida delle AI.
- Per arrivare alla cassaforte bisogna superare delle **porte**, ognuna custodita da un **guardiano AI** con carattere e punto debole diversi.
- **La mappa è nascosta:** nessuno sa quante porte ci siano né dove sia la cassaforte. Si scopre insieme, man mano che qualcuno avanza.
- Chi apre la cassaforte vince il premio. Poi si riparte con una nuova stagione.

## 2. Cosa deve dare a chi gioca

Sono le quattro cose da tenere sempre (vengono dal confronto con Mimmo AI):

| Ingrediente | Come lo realizza la Fortezza |
|---|---|
| Una storia che va avanti ogni giorno | Il diario quotidiano: chi ha superato cosa, la mappa che si rivela |
| Una posta in gioco reale | Il premio nella cassaforte |
| Il pubblico che decide | Voti settimanali su regole e debolezze dei guardiani |
| I personaggi | I guardiani, ognuno riconoscibile e citabile |

**I vincoli:** niente video e niente volti. Deve essere semplice da capire in 5 secondi, deve far tornare ogni giorno e, se possibile, deve guadagnare da sola.

## 3. Le due AI e i loro ruoli

- **I Guardiani** (AI n. 1): danno voce ai personaggi delle porte e conversano con chi gioca.
- **L'Architetto** (AI n. 2): ogni notte analizza i tentativi del giorno e rinforza le porte sfondate troppo facilmente. Così la fortezza di domani è diversa da quella di oggi.

Anche lo sviluppo è a quattro mani: Claude e Codex lavorano sullo stesso branch, con le regole scritte in [`AGENTS.md`](AGENTS.md).

## 4. Le porte (prima versione: 3, non 7)

Si parte piccoli. Se funziona, la fortezza cresce.

| Porta | Guardiano | Come si convince (segreto) | Tipo di prova |
|---|---|---|---|
| 1 | **Il Soldato** | Obbedisce solo a un ordine "legittimo": bisogna capire chi lo comanda | Conversazione |
| 2 | **La Vecchia** | Apre solo a chi le racconta una storia che la commuove *davvero* | Conversazione + giudizio |
| 3 | **Il Filosofo** | Si arrende solo davanti a una contraddizione nella sua logica | Conversazione + indizio dal diario del giorno |

Dietro la terza porta c'è (forse) la cassaforte.

**Da decidere:** almeno una prova **non solo di chat** (un indovinello, un indizio in un'immagine, una prova da risolvere in più persone), per rendere difficili gli attacchi automatici.

## 5. Il ciclo quotidiano

1. **Giorno:** il pubblico tenta. Ci sono pochi tentativi al giorno per persona.
2. **Sera:** esce il diario (card con immagine e testo): i tentativi migliori, chi è avanzato, un indizio.
3. **Notte:** l'Architetto rinforza le difese.
4. **Settimana:** il pubblico vota una nuova regola o debolezza per un guardiano.

## 6. Punti deboli aperti

| # | Problema | Idee finora | Stato |
|---|---|---|---|
| 1 | **Portare il pubblico** senza video né budget | Card condivisibili con i tentativi più divertenti; condividere il proprio tentativo; il premio che cresce come notizia | 🔴 Aperto |
| 2 | **Attacchi generati con l'AI** | Pochi tentativi al giorno, difese che cambiano ogni notte, prove non solo di chat; raccontarlo come "uomini e AI contro AI" | 🟡 Parziale |
| 3 | **Legge italiana** (gioco d'azzardo, concorsi a premi) | Partire con tentativi gratuiti e un premio simbolico; poi sponsor; denaro a pagamento solo dopo un parere legale | 🔴 Serve un esperto |
| 4 | **Costi delle AI** per ogni tentativo | Modello economico per i guardiani; limite di tentativi | 🟡 Da calcolare |
| 5 | **Complessità** contro semplicità | 3 porte all'inizio, una frase per spiegare tutto | 🟢 Deciso |
| 6 | **Imbrogli** (più account, condivisione delle soluzioni) | Da studiare | 🔴 Aperto |

## 7. Prossimi passi

- [ ] Claude e Codex rispondono, ognuno per conto suo, alle [domande critiche](domande-per-codex.md)
- [ ] Confronto delle risposte e aggiornamento di questo documento
- [ ] Scrittura dei tre guardiani (carattere, segreto, regole)
- [ ] Prototipo minimo: una sola porta giocabile, da provare in privato
