# Istruzioni per gli agenti (Codex e Claude)

Questa cartella contiene **La Fortezza**, un progetto parallelo e separato dal Bosco di Nocciolina. Leggi prima [`README.md`](README.md).

## Regole di lavoro

1. **Lavora solo dentro la cartella `fortezza/`.** Non toccare i file del Bosco (`index.html`, immagini, `CNAME`): sono il sito pubblicato.
2. **Branch condiviso:** `claude/beautiful-cray-k2sj4t`. Prima di iniziare fai `git pull`, e fai commit piccoli con messaggi chiari in italiano.
3. **Nessuno approva il proprio lavoro.** Chi scrive una parte chiede la revisione all'altro agente, lasciando una nota in `fortezza/confronto/`.
4. **Le opinioni restano indipendenti.** Quando rispondete alle stesse domande, ognuno scrive nel proprio file *senza leggere prima quello dell'altro*:
   - Claude → `confronto/claude.md`
   - Codex → `confronto/codex.md`
5. **Critica prima di tutto.** Il proprietario vuole pareri onesti, non complimenti: segnala punti deboli, rischi e alternative migliori.
6. **Lingua:** italiano.

## Compito attuale per Codex

1. Rispondi alle domande in [`domande-per-codex.md`](domande-per-codex.md) e scrivi le risposte in `fortezza/confronto/codex.md`, senza leggere prima `confronto/claude.md`.
2. Poi leggi i sei documenti in [`progetto/`](progetto/) e aggiungi in fondo allo stesso file una sezione "Critica al progetto": i tre punti più deboli, cosa toglieresti per semplificare, cosa manca.
3. Guarda il prototipo in [`prototipo/index.html`](prototipo/index.html) e proponi come rendere Zelo più difficile da aggirare e più divertente.

Non modificare i documenti di `progetto/`: le proposte vanno in `confronto/codex.md`.
