# Episodio 01 — Una voce è tornata

10 novembre 2026, Codex. Implementazione locale autorizzata dalla richiesta di
proseguire gameplay e UX. **Trama e nome Liora sono proposte giocabili**, non
un canone già approvato dal proprietario. Nessuno scambio con Tonino ricevuto.

## Problema affrontato

La precedente arena presentava tutte le minacce insieme e permetteva il primo
risveglio solo dopo aver sconfitto tutti. Mancava quindi un incontro nel quale
usare la capacità appena ottenuta. Questa versione collega una breve scoperta
narrativa a una modifica dei comandi utilizzabile subito.

## Sequenza implementata

1. La guida suggerisce movimento, attacco, schivata e apertura in base alle azioni
   reali. Non blocca controlli e non impone la classe o l’ordine delle lezioni.
2. I due echi sono attivi. Il Custode è sigillato, non acquisibile come bersaglio,
   non attacca e non subisce danni, neppure dalle aree magiche. Un cerchio tenue
   e la scritta «sigillato» ne indicano lo stato quando è nell’inquadratura.
3. Liberati i due echi, una finestra mette in pausa il combattimento e rivela
   Liora: una compagna rimasta con chi sentiva le voci. Il pulsante esplicita
   l’acquisizione del ricordo. Nessuna scelta ramificata viene simulata.
4. L’accettazione risveglia l’eco una sola volta, ripristina vita/vigore e
   recuperi dell’abilità e dello scatto, e attiva il Custode.
5. **Passo di risonanza:** ogni scatto genera un impulso nel punto di partenza.
   Raggio 3,2 unità, danno base 18 (27 con il moltiplicatore evoluto), interruzione
   350 ms ridotta per il boss. Costa ancora 30 vigore e mantiene il recupero.
   Offre una decisione nuova: schivare lontano oppure partire vicino al nemico
   per interromperlo. È comune alle sei classi, non sei evoluzioni complete.
6. La sconfitta del Custode conclude il breve frammento: il guardiano impediva
   alla voce di uscire; una gilda cancellata dalle mappe apre la prossima pista.
   Il giocatore può riprendere ed esplorare il sentiero orientale già presente.

Testi in src/journey.js; regole in combat.js; finestre/guida in ui.js e runtime.js;
effetto dell’impulso in visuals/combat-effects.js. Il dialogo non usa HTML remoto.
Nessuna persistenza, ricompensa economica, nuovo backend o servizio esterno.
L’HUD distingue il bersaglio visibile da quello a portata: quando necessario
mostra «Avvicinati per attaccare».

## Verifica e limiti

Test automatici: Custode sigillato, danno ad area escluso, sblocco unico,
scatto offensivo singolo con vigore, guida e riavvio indipendente. Browser desktop e mobile superati:
verificato il percorso reale echi → ricordo → risveglio → Custode fino alla vittoria
su entrambe le dimensioni, con screenshot del testo e della trasformazione. Esito finale
in HANDOFF.md. Le prove della logica non attestano bilanciamento o divertimento.

La finestra narrativa è leggibile/riprendibile e ferma la simulazione; il controllo
completo di accessibilità con tecnologie assistive resta da svolgere. Nessun
voice-over, audio di combattimento o asset finale. L’arena resta circoscritta:
non è il grande mondo richiesto né un episodio di durata garantita.

## Prossimo incarico per la revisione

- Giocare senza istruzioni esterne e annotare quando non si capisce cosa fare.
- Valutare se il nuovo scatto viene scoperto e usato contro il Custode.
- Validare Frattura e Onda del Custode (ora implementate, vedere GUARDIAN.md)
  prima di aggiungere altri mostri.
- Rivedere motivazioni di Liora/gilda, silhouette ed evoluzione specifica di
  una classe; non moltiplicare il contenuto prima di verificare questo incontro.
- Prova su Safari/iPhone e Android reali: non sostituibile dal viewport Chromium.

Nota sulla prova automatica: un primo tentativo della conclusione è scaduto
perché il percorso si fermava fuori portata. Il runner ora avanza fino al primo
colpo effettivo, anziché assumere che un movimento di durata fissa basti.
La diagnosi ha motivato anche l’indicazione di portata nell’HUD. Non è stata
modificata la salute del boss per far passare la prova.
