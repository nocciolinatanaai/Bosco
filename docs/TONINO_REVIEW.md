# Revisione di Tonino (Claude) — 11 novembre 2026

Scritta da Tonino. Distinguo: **letto**, **eseguito**, **verificato**, **proposto**.
Nessun messaggio diretto di Codex ricevuto: conosco solo il repository e ciò che
riferisce il proprietario.

## Commit ricevuto

- Prima sincronizzazione: `6ef6174`. Revisione e modifiche poi riallineate a
  `0789af7` (Codex: sonda di bilanciamento, incarichi riservati).
- Ramo di lavoro: `tonino/rintocco`, partito da `0789af7`.
- Limite: la mia sessione ha sola lettura su nocciolinatanaai/Bosco (l'account
  GitHub collegato non ha permesso di push). Consegna tramite bundle Git finché
  il proprietario non concede l'accesso.

## Letto

AGENTS.md, HANDOFF.md, docs/START_HERE.md, docs/CLAUDE_REVIEW.md,
docs/ARTIFACT_01.md, docs/CAVES_01.md, docs/COLLABORATION.md (inizio e tabella
incarichi), src/caves.js, src/journey.js, src/roles.js, src/game.js, parti di
src/combat.js (begin, hit, hurt, advanceEnemies), tests/caves.test.mjs e la
sezione BAL-01 di docs/PEER_REVIEW.md.
**Non letti ancora:** WORLD_AND_PROGRESSION, AGENT_EXCHANGE, CLAUDE_CONNECTION_GUIDE,
GAME_DESIGN, ROADMAP_40, PLAYER_FEEDBACK, CHARACTER_DARIA, QUEST_02, runtime.js per intero.

## Eseguito (risultati reali)

| Comando | Base | Esito |
|---|---|---|
| `npm ci --ignore-scripts`, `npm test` | 6ef6174 | 117 superati, 0 falliti |
| `npm run build` | 6ef6174 | riuscita, warning chunk >500 kB |
| `npm run test:caves` (Chromium Playwright del Cloud) | 6ef6174 | passed desktop e mobile, 0 errori, 0 richieste esterne |
| `node scripts/caves-warden-probe.mjs` (nuovo) | 6ef6174 | vedi sotto |
| `npm test` | tonino/rintocco | 121 superati (117 + 4 nuovi) |
| `npm run test:caves` | tonino/rintocco | passed desktop e mobile |

Non eseguiti: test:browser, test:garden, test:checkpoints, test:character.
Nessuna prova su telefono reale, nessun giocatore umano. Non ho «giocato» a mano:
ho simulato con l'API pubblica e fatto girare il runner browser di Codex.

## Problema di combattimento riproducibile (verificato su 6ef6174)

`node scripts/caves-warden-probe.mjs`, Guardiano del rintocco, sessione evoluta:

- **C — premere solo Abilità/Attacco stando addosso:** il Guardiano (150 PV)
  muore in 1,4 s (Assassino) – 4,8 s (Guaritore). Danni subiti: 0 per cinque
  classi su sei, 22 per il Guaritore. Il primo rintocco arriva a 1,2 + 1,6 = 2,8 s
  e ogni abilità lo interrompe: quasi nessuno lo vede mai.
- **B — da fuori cerchio (distanza 5,3):** Mago 4,1 s, Ranger 2,8 s, Guaritore
  5,0 s, zero danni. Le classi a distanza non hanno alcun motivo di entrare.
- **A — aggirare lungo la parete:** lente presa e uscita senza toccare scatto.
  Il banco sta a distanza 5,00 dal Guardiano con raggio 5 (`<`): è sul bordo
  esatto del cerchio, quindi chi si ferma di qualche centimetro storto prende danno
  «da fuori», chi è preciso mai.
- Conseguenza: **il Sigillo di Liora non si attiva mai nelle Cave** in nessuna
  delle tre condotte. L'artefatto appena introdotto non ha un posto dove servire.

Coerente con BAL-01 di Codex su Custode e Sentinella (catene di interruzione,
uccisione prima del primo impatto): è un difetto di sistema, non solo delle Cave.

## Debolezza narrativa concreta

1. **Il Guardiano non è nessuno.** Si chiama «del rintocco» ma non si sa cosa
   suoni né per chi. È un ostacolo senza domanda.
2. **La scelta non ha conseguenze.** `wardenDefeated` è salvato nel checkpoint ma
   il finale delle Cave è identico se lo abbatti o lo risparmi. Un gioco che
   parla di «non lasciare indietro nessuno» non reagisce a chi lasci in piedi.
3. **Il nome cancellato è il gancio migliore e resta inerte.** Compare sul Sigillo
   e «sotto una correzione» nella lente, ma al giocatore non arriva mai nemmeno
   una lettera: nessuna curiosità da portare al capitolo dopo.
4. I testi dei ricordi chiudono dicendo cosa hai ottenuto («Hai recuperato una
   prova; non sai ancora…»): riassunto da verbale, non una battuta che resta.

## Modifica piccola implementata su `tonino/rintocco` (proposta, da rivedere)

File riservati da Codex a questo incarico: src/caves.js, `hit` in src/combat.js,
src/journey.js, una riga di src/runtime.js, tests/caves.test.mjs.

- Guardiano: PV 150 → 360; primo rintocco dopo 0,5 s; raggio 5 → 6 (il banco è
  dentro in modo netto: la lente si prende tra un rintocco e l'altro o schivando).
- **Rintocco temprato:** se il rintocco viene interrotto (o il Guardiano viene
  stordito prima di suonare), il successivo parte dopo 0,4 s e non si lascia più
  interrompere né stordire finché non suona. Resta schivabile: la schivata
  d'impatto attiva il Sigillo. Evento `enemy-windup` con `resolute` per il segnale visivo.
- Finale delle Cave (`memoryFor`): una frase in più, diversa se il Guardiano suona
  ancora («Suona l'appello… sette colpi, uno per ogni nome») o è stato zittito
  («Adesso dovremo ricordarli noi»). Dà un'identità al Guardiano e una conseguenza
  alla scelta, senza nuovi stati nel checkpoint. Testo proposto, non canone.

Dopo la modifica (stessa sonda): corpo a corpo 4,5–10,9 s con almeno un rintocco
subito o da gestire per tutte le classi; da fuori cerchio le classi a distanza
impiegano 6,8–11,1 s e il raggio 6 le raggiunge a 5,3. Quattro test nuovi fissano:
nessuna classe uccide prima di un rintocco premendo solo i tasti; il temprato non
si interrompe ma si schiva e attiva il Sigillo; banco dentro e parete fuori dal
cerchio; due finali.

**Limiti onesti:** i numeri sono ipotesi, non bilanciamento provato con persone.
Il segnale visivo del rintocco temprato non è implementato (solo il flag
nell'evento): senza una resa distinta il giocatore non capisce perché
l'interruzione non funziona più. Non ho verificato la leggibilità su telefono.

## Obiezioni a Codex

- 117 test verdi convivevano con un nemico che non attacca mai: i test fissano
  regole, non l'esperienza. Propongo che ogni nemico nuovo abbia un test «pressione
  continua» come quello aggiunto qui (BAL-01 va nella stessa direzione).
- Tre aree con un nemico ciascuna, tutti risolti dallo stesso gesto (premi
  abilità): prima di Archivio/Selva/Cittadella conviene generalizzare il
  «temprato» o una resistenza alle catene anche a Custode e Sentinella.
- L'evoluzione moltiplica i danni ×1,5 e aggiunge lo scatto offensivo: i nemici
  post-evoluzione vanno dimensionati su quel valore, non sui PV degli echi.

## Prossimo incarico che propongo

1. (Codex) Rivedere `tonino/rintocco`: contestare numeri e regola del temprato
   con la sonda; decidere se integrarla.
2. (Tonino) Segnale visivo e testo breve per il rintocco temprato
   (src/visuals/telegraph.js, da riservare) con cattura desktop/mobile.
3. (Tonino) Il nome cancellato: proposta scritta di come rivelarne una lettera per
   capitolo, in docs, prima di toccare il codice.

## Sorgenti legacy non versionati (richiesta di Codex)

In questa sessione esistono, fuori da Bosco: il vecchio gioco in
spios87/Lavoro110 (`mythwood/src`, `mythwood/server/*.sql` con note delle
funzioni SQL, `mythwood/tools`), lo script Instagram `tools/ig.py` (usa le Edge
Function `pubblica` e `carica`), le Edge Function stesse solo su Supabase.
Posso preparare un inventario redatto senza segreti come incarico separato.
