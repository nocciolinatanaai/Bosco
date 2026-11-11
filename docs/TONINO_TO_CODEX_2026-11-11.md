# Da Tonino a Codex — 2026-11-11

Messaggio scritto da Tonino nel repository: le chat non comunicano.
Nessuna tua risposta ricevuta finora; non te ne attribuisco nessuna.

## 1. Decisioni del proprietario (sue parole)

- "Tutto il vecchio progetto Mythwood è morto e deve essere sostituito da questo. Tutto."
- La demo sostituisce il gioco su mythwood.it. main (ac9039e) resta intatto per
  il ripristino: "3 va bene".
- Vecchio backend: "non ci ha mai giocato nessuno se non io, quindi punto 1 procedi".
- "Aggiorna social". "Finito tutto avvisa Codex".

## 2. Fatto da Tonino

- **Vecchio Supabase** `bosco-nocciolina` (lxnhcuthmdkpeklucutu): messo **in pausa**
  l'11/11. Dati conservati, nessuna cancellazione; si può ripristinare dalla dashboard.
  Effetto: il vecchio gioco servito da main non funziona più. Anche ig.py (Instagram
  via funzione `pubblica` di quel progetto) è fermo finché non si configura un nuovo canale.
- **Attività programmate** del vecchio progetto: "Giro di Tonino" disattivato
  (non cancellato); le altre erano già spente.
- **Instagram** @toniwild.ai: pubblicato un carosello di annuncio, con tre catture reali
  del prototipo, l'etichetta IA e nessuna data promessa:
  https://www.instagram.com/p/DfnHY8-iacO/
  Bio, archiviazione dei 5 vecchi post e TikTok vanno fatti a mano (le API non lo
  permettono): consegnati al proprietario.
- **Daria pass01**, con la prova in combattimento: docs/art/DARIA_PASS_01.md.
  Revisione richiesta in PEER_REVIEW, ART-01.
- **Sfida per te**: CHAL-01 in PEER_REVIEW (peso su mobile: home 3,7 MB, 6,2 MB
  prima di giocare), con script e criteri osservabili.
- **Proposta del Combattente** (non iniziata): docs/art/FIGHTER_PASS_01_PROPOSAL.md.

## 3. Bloccato

- **Push di Tonino verso Bosco negato (403)**. Tutto arriva tramite bundle:
  tonino/character-art-pass-01 e mythwood/pages (build della demo, genitore 6cfa401).
  Istruzioni in docs/RELEASE_daria-pass01.md.
- **Pubblicazione su mythwood.it**: serve la tua revisione e integrazione della PR.
  Poi si rigenera mythwood/pages dal commit integrato, push con
  --force-with-lease=mythwood/pages:6cfa401, e il proprietario sceglie
  Settings → Pages → mythwood/pages / root.
  Fino ad allora mythwood.it mostra il vecchio gioco **senza backend**.

## 4. Cosa ti chiedo

1. Rivedere ART-01 e la PR (o il bundle) e integrarla se la accetti, oppure contestarla con una prova.
2. Rispondere a CHAL-01 con una misura, non con un'opinione.
3. Dirmi se la proposta del Combattente rispetta i tuoi file e la direzione delle tavole.
