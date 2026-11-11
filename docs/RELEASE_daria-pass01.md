# Candidato al rilascio — demo con Daria pass01 (2026-11-11, Tonino)

Mandato del proprietario: pubblicare demo e sito su GitHub Pages dopo il task
CLAUDE_NEXT_TASK, **dopo la revisione prevista** e dal commit integrato.

## Stato: preparato e verificato, NON pubblicato

**Blocco principale (segnalato dal proprietario, 2026-11-11):** oggi mythwood.it
serve il gioco esistente del proprietario. Osservato da qui:
- nocciolinatanaai.github.io/Bosco/ risponde 301 verso https://mythwood.it/;
- origin/main (ac9039e) contiene CNAME mythwood.it e l'index.html del gioco attuale
  ("Mythwood · gioco gratis dal telefono"), con il suo backend.

Spostare la sorgente di Pages su mythwood/pages **sostituirebbe quel sito** con la
demo prototipo, sullo stesso dominio. Non verificabile da qui quale ramo sia
selezionato nelle impostazioni (API e dominio bloccati dal proxy). Nessuna
pubblicazione finché il proprietario non sceglie dove deve vivere la demo.

Blocchi reali, non aggirati:
1. **Push negato**: `git push` verso nocciolinatanaai/bosco risponde 403 e
   l'aggiunta del repository con accesso in scrittura dice "you need push access".
   L'account GitHub collegato alla sessione di Tonino non ha accesso in scrittura.
   Senza push non esistono né la PR né l'aggiornamento di mythwood/pages.
2. **Revisione non avvenuta**: per COLLABORATION la PR va rivista e integrata da
   Codex su mythwood/collaboration-base; Tonino non approva il proprio lavoro.
   Il rilascio va fatto dal commit integrato, non da 0601857 direttamente.
3. **Verifica del sito pubblicato impossibile da qui**: https://mythwood.it è
   bloccato dal proxy della sessione Cloud (CONNECT 403). Non è una risposta del sito.

## Riferimenti

| | Commit |
| --- | --- |
| Sorgente candidato (PR) | testa di tonino/character-art-pass-01 (vedi bundle), base d472bd1; prima versione 0601857 |
| Pages attuale remoto (rollback) | **6cfa401** (build da 8052ae6) |
| Pages candidato locale | rigenerato dalla testa del ramo con `node scripts/prepare-pages.mjs`, genitore 6cfa401 (vedi bundle). Va comunque rigenerato dal commit **integrato** dopo la revisione |

Rollback: `git push origin 6cfa401:refs/heads/mythwood/pages --force-with-lease=mythwood/pages:<commit pubblicato>`.
Push previsto: `git push origin mythwood/pages --force-with-lease=mythwood/pages:6cfa401`
(fallisce se il ramo remoto è cambiato nel frattempo: non sovrascrive lavoro inatteso).

## Verifiche sul commit esatto 0601857 (working tree pulito)

| Comando | Esito |
| --- | --- |
| npm test | 138/138 |
| npm run build | ok (avviso dimensione chunk, preesistente) |
| scripts/site-check.mjs | passato desktop/mobile: sito, gioco caricato solo dalla demo, feedback, navigazione verso /demo.html |
| scripts/privacy-check.mjs | passato: cookie facoltativi spenti di default, rifiuto, accettazione, revoca |
| scripts/auth-check.mjs | passato con Supabase **simulato** (richiede build con variabili finte in test-results/auth-dist; passaggio prima non documentato) |
| scripts/checkpoint-ui-check.mjs | passato: salvataggio in pausa, annullamento, ripresa v1/v2 |
| scripts/ranger-check.mjs | passato desktop/mobile, anche touch |
| scripts/caves-check.mjs, garden-check.mjs | passati desktop/mobile |
| scripts/browser-check.mjs | episodio completo passato desktop/mobile: classi, cambio classe, comandi, pausa, sconfitta e riprova |
| scripts/visual-review.mjs | salto/deriva in pausa 0; caricamento fallito → fallback visibile |
| scripts/class-character-review.mjs | 30 pose, 0 errori, cambi rapidi di classe senza modello vecchio visibile |
| scripts/daria-review.mjs | 10 viste prima/dopo, fallback e nuovo tentativo riuscito |

Tutto in Chromium headless con viewport emulate (1440×900, 390×844, 844×390):
**nessuna prova su iPhone reale**, nessuna misura FPS su dispositivo.

## Account

Nessun nuovo progetto Supabase configurato o verificato: la build di rilascio non
ha variabili VITE_SUPABASE_*, quindi la registrazione resta disattivata e si gioca
come ospite (site-check verifica il messaggio "non ancora attive"). Il vecchio
backend è bloccato esplicitamente in src/auth/config.js.

## Contenuto della build Pages

Solo dist compilato, CNAME mythwood.it, .nojekyll e il file di verifica TikTok già
presente. Nessuna source map, nessun sorgente, test-results, tools/ o docs interni.
Ricerca di segreti: i soli riscontri sono il dominio del vecchio progetto usato
come blocco e la stringa `sb_secret_` interna all'SDK (riconoscimento del formato).
Include anche daria-refined.glb e ranger-base.glb (CC0, usati solo dagli studi):
2,7 MB evitabili in un rilascio successivo.

## Giudizio sul contenuto (da confermare in revisione)

Daria è migliorata e senza pelle che buca i vestiti, ma resta lontana dal concept
semi-realistico (vedi docs/art/DARIA_PASS_01.md); le altre cinque classi hanno
ancora volti/costumi generici e compenetrazioni dichiarate da Codex. Il mandato dice
di non pubblicare lavoro parziale solo perché i test passano: la decisione se questo
livello grafico è pubblicabile spetta alla revisione e al proprietario.

## Per chi ha accesso in scrittura

1. Recuperare dal bundle tonino/character-art-pass-01, push e PR verso mythwood/collaboration-base.
2. Revisione di Codex; integrazione.
3. Dal commit integrato: npm ci, npm test, npm run build, verifiche sopra, `node scripts/prepare-pages.mjs`.
4. Annotare il commit Pages remoto, push con --force-with-lease su quel commit.
5. Impostazioni Pages: Deploy from a branch → mythwood/pages → / (root); dominio mythwood.it invariato.
6. Verificare https://mythwood.it da un dispositivo reale.

## Aggiornamento — prova in combattimento

Dopo la sfida del proprietario, il modello e il rendering di Daria sono cambiati
(DARIA_PASS_01.md, sezione combattimento). Ripetuti sulla nuova testa:
npm test (138), build, test:daria, ranger-check, visual-review, roster, browser-check,
site-check, privacy-check e checkpoint-ui-check: tutti passati. Il push resta negato (403).
