# Confronto tecnico e creativo — scambio ancora da avviare con Tonino

Questo documento non è una conversazione avvenuta. Codex non può contattare
direttamente la sessione Claude; il proprietario deve rendere disponibili i file
e riportare le risposte oppure autorizzare un flusso condiviso supportato.

## Domande di Codex a Tonino

1. Qual è l'esperienza che rende desiderabile la prima sessione? Mostra una scena,
   non un elenco di sistemi. Quale decisione del giocatore è interessante?
2. Quali dati e automazioni sono ancora attivi su Supabase? Come vengono fermati,
   ripristinati e riconciliati senza perdere giocatori?
3. Fornisci sorgente di riscatta, configurazione non segreta e verifica acquisti.
   Quale componente decide quantità e prodotto? Come gestisci retry e rimborsi?
4. Il device compare in log, broadcast, link o risposte pubbliche? Come revochi
   accesso e sessioni dopo un possibile incidente?
5. Quali misure autorizzano azioni del giocatore lato server? Le nuove prove locali
   non devono diventare un server che si fida del danno calcolato nel browser.
6. Come rendi diversi Tank/Combattente/Assassino? Proponi una sinergia giocabile
   e un limite che impedisca a una classe di rendere inutili le altre.
7. Quale parte della qualità del mockup è ottenibile con asset e budget disponibili?
   Misura su un dispositivo dichiarato; distingui rendering da illustrazione.
8. Quali fonti ufficiali e configurazioni sostengono le affermazioni dell'informativa
   precedente? Pseudonimo non significa anonimo; chi gestisce diritti e incidenti?

## Obiezioni che Tonino deve rivolgere a Codex

- La proposta crea un gioco divertente o soltanto una nuova architettura?
- Il prototipo locale dimostra multiplayer, mondo enorme e qualità del concept?
  Risposta attuale: no. Pretendere prove separate prima di prometterli al pubblico.
- Il report sugli acquisti è corretto? La precedente diagnosi FOUND era errata:
  test del codice originale l'hanno smentita. Non accettare l'audit per autorità.
- La patch login conserva flussi validi e permessi? Quali attacchi restano scoperti?
- Il piano per sei classi e mondo vasto è compatibile con risorse e priorità?
- Esistono evidenze per ogni dichiarazione su normativa, engagement e prestazioni?

## Esito da registrare per ogni confronto

Questione → ipotesi dei due agenti → prova/artefatto → risultato → decisione →
limiti → task successivo. Il disaccordo si risolve con evidenza o decisione del
proprietario, non con affermazioni di sicurezza o promesse di viralità.

Stato: domande preparate; nessuna risposta di Tonino ricevuta in questo repository.

## Prossima revisione: combattimento e UX

Consegna locale Codex del 10 novembre: leggere COMBAT_UX.md, src/combat.js,
src/runtime.js, src/controls.js e i test. Nessuna revisione di Tonino ricevuta.

- Le finestre di carica, impatto e recupero risultano comprensibili giocando?
  Confrontare il raggio e l’arco visibili con la zona che riceve danno.
- L’abilità accodata durante un attacco evita comandi persi senza consentire spam?
  Verificare annullamento con scatto, pausa e perdita del contatto.
- Con due dita si può muovere, attaccare e poi interrompere la pressione senza
  lasciare comandi attivi? Provare Safari reale e rotazione del dispositivo.
- Le sei classi offrono scelte diverse o prevale soltanto il danno a distanza?
  Raccogliere una prova umana prima di cambiare i numeri sulla base di impressioni.
- Rivedere Passo di risonanza (EPISODE_01.md): lo scatto ora produce danno e
  interruzione al punto di partenza. È una prima trasformazione comune, non
  un percorso completo o specifico delle sei classi.

Queste regole client sono una prova locale: prima del multiplayer, danni,
ricompense e tempi devono essere verificati da un’autorità server indipendente.

Revisione successiva richiesta: verificare sequenza echi/ricordo/Custode, chiarezza
del sigillo e motivazioni proposte per Liora. La prova browser include un Ranger
che completa il frammento; il suo esito non dimostra equilibrio fra sei classi.

## Custode e rientro di Claude

Frattura e Onda implementate: rivedere GUARDIAN.md e rispondere alle domande
concrete di CLAUDE_REVIEW.md. Controllare soprattutto se il doppio contorno
viene capito come area piena di pericolo, se il testo si legge sul telefono e
se l’interruzione con scatto lascia una strategia dominante. Non trattare le
vittorie automatiche del Ranger come collaudo del bilanciamento delle sei classi.
La revisione di Tonino resta attesa: nessuna sua risposta registrata.
