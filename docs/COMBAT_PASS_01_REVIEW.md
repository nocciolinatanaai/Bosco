# COMBAT-01 — revisione indipendente Codex della PR #4

Testa esaminata: 39b554838da5540d38a411f1049a669bc91a895b, successiva a 940a947.
Letti nell'ordine COMBAT_PASS_01, domanda in PEER_REVIEW e HANDOFF. Nessun merge
o deploy eseguito. Revisione in corso, con modifiche richieste sotto; distinguere
test passati da quelli ancora in esecuzione. Catture Tonino complete sulla testa,
ma la loro presenza non equivale a verifica indipendente dei dispositivi.

## Esito per parte

- cf7b735: la stessa hit governa resistenza di Custode e Guardiano; il primo
  stagger arma resolute, i successivi danni passano, nessuna estensione dello
  stagger. Regola coerente col contratto; regressione Cave desktop/mobile passata.
- b773f97: guardianAttackFor sceglie la mossa senza alterare il contatore;
  il caso contatore 1 e soglie sono ora coperti. Provocazione e geometria del
  telegraph sono testate, senza importare la sostituzione doppia del prototipo.
- 62aacde: Custodia consumabile separata dallo scudo Tank, niente doppio sconto;
  test mirati su consumo, scadenza, checkpoint e sconfitta passati.
- f719ac9: consumo per azione, chargeId su colpi/proiettili e danno mantenuto
  al lancio sono corretti nei casi coperti. Manca un esito terminale per alcuni
  proiettili persi: rilievo R1.
- Segnali/CSS: testa finale inclusa nella verifica, non attribuire i vecchi
  browser pass pre-CSS a questa testa. Verifica supplementare R2.

## R1 — carica persa senza esito terminale (da correggere)

Caso mirato sulla testa PR: Ranger risvegliato con carica, attacco base lanciato,
bersaglio morto prima dell'arrivo. Alla fine non ci sono più proiettili, ma:
**una carica consumata, zero colpi caricati a segno, zero miss col suo chargeId**.

Riproduzione dalla testa PR, dopo aver creato test-results/pr4-independent:

```sh
node /percorso/projectile-loss.mjs test-results/pr4-independent/projectile-loss.json
```

Il probe è versionato con le evidenze di questa review; inizializza direttamente
la carica per isolare il ramo, non è un playtest. La perdita di bersaglio è
prevista dal contratto e già simulata dal test unitario, ma quel test controlla
solo l'assenza di hit, non la presenza dell'esito di perdita.

tickCooldowns elimina i proiettili senza evento quando il bersaglio sparisce,
quando scade la vita o non è più nell'area. Anche projectile-blocked non porta
chargeId. Il consumatore HUD non può mostrare A VUOTO in quei casi; il confronto
non classifica tutte le cariche perse. Non è un errore del danno inflitto.

Richiesta: un esito terminale con chargeId e ragione, una sola volta per
proiettile, per perdita bersaglio/scadenza/copertura. Distinguere annullamento
del cambio area se viene trattato diversamente. Proiettile pendente non è miss;
colpo già risolto non genera un secondo esito. Usare lo stesso esito per HUD e
report. Aggiungere test espliciti, non modificare i contatori per farli tornare.

## R2 — leggibilità nelle Cave, non solo collisione con pulsanti

La cattura Tonino mobile-warden-resolute.jpg mostra il tag Non interrompibile
sovrapposto al lungo testo della quest. Il suo check esclude quest/HUD e rileva
soltanto collisioni coi comandi. Dimensione 14 px e presenza non garantiscono
leggibilità se due testi occupano lo stesso spazio.

Il driver originale esclude il Guardiano a 844×390. Ho completato un controllo
mirato supplementare su entrambi i formati, con misure e screenshot indipendenti:
- landscape: tag x=507, y=98, 179×25 px, dentro viewport, nessuna intersezione
  con quest/HUD nella posa provata;
- portrait: tag x=131, y=243, 179×25 px; **interseca la quest per circa 95×25 px**.
  La cattura riproduce la collisione testuale già visibile nella consegna Tonino.
Il nuovo problema non è il font o il bordo: il controllo non considera i pannelli.
Richiesta: segnale persistente leggibile sul bersaglio o nel suo stato HUD,
senza coprire istruzioni o controlli; cattura Cave anche in landscape. La soluzione
non deve essere ridurre il testo sotto soglia o cambiare il solo runner.

## Domanda sull'Assassino — decisione motivata

Confermo spam 3,98 s, nessun attacco completato. Non è una catena infinita di
stagger: l'Assassino abbatte il boss prima che il secondo attacco resistente
arrivi. Il test anti-catena non è per questo falso; prova una cosa differente.

Ho confrontato la stessa fixture con resistenza iniziale già armata, senza
cambiare PV/danni: 6 classi × 4 politiche × 2 condizioni, 48 casi. Sono dati
di un esperimento di stato iniziale, non una patch applicata alla build.

| Assassino | Attuale | Prima resistenza armata |
| --- | --- | --- |
| Spam | 3,98 s, 0 attacchi, 0 danni | 3,98 s, 1 attacco, 26 danni |
| Schivata a tempo | 3,98 s, 0 attacchi, 0 danni | 4,12 s, 1 attacco, 0 danni |
| Uscita dal cerchio | 8,02 s, 2 attacchi, 0 danni | 6,78 s, 2 attacchi, 0 danni |

Tutte le sei classi vincono nei casi provati. Con spam, cinque classi mantengono
gli stessi tempi/danni e solo l'Assassino incontra la pressione assente. Altre
politiche cambiano tempi per diverse classi: non presento la modifica come neutra.

**Preferisco la resistenza iniziale per il Custode introduttivo:** la demo deve
offrire almeno un'occasione leggibile di usare il potere, senza aumentare la vita
per prolungare artificialmente il combattimento. È una scelta di design sostenuta
dai bot, non una prova di divertimento. Segnale attivo fin dall'ingaggio, danno
sempre valido, azzeramento al primo attacco completato e poi regola corrente.
Non generalizzarla automaticamente a echi, Sentinella o Guardiano delle Cave.
Consegnare come commit separato e rifare il confronto, con test su inizio,
riavvio/ripresa e visibilità prima del primo colpo del giocatore.

## Impeto e altri limiti dichiarati

Controprova supplementare nelle Cave, ferma alla gittata base evoluta massima:
Mago a 11,85 vince in 9,84 s, Ranger a 14,25 in 7,26 s e Guaritore a 10,65 in
14,24 s, tutti con zero attacchi completati e zero danni. Il Guardiano non si
avvia oltre 10 unità. Il confronto originale delle Cave prova solo posizione
vicina/spam e schivata: non esclude questa tattica sicura.
È un limite della scelta di incontro statico, non un bug introdotto da resolute;
provocazione/portata in COMBAT-01 sono assegnate al Custode. Registrarlo fra i
limiti del Rintocco, senza allargare di nascosto la Nova per colpire tutti.
Decidere se il vantaggio di gittata è intenzionale per questo guardiano
opzionale prima di promettere uno scontro impegnativo a tutte le classi.

Non introdurrei eccezioni invisibili al rimborso cooldown solo per Combattente
e Guaritore per ottimizzare questo bot. La diagnosi di politica eager resta
valida. Confrontare una politica distinta prima di cambiare i bonus per classe;
vantaggio leggibile e scelta utile non equivalgono al tempo minimo di ogni run.
Custodia va provata con l'errore successivo, non bocciata perché il bot perfetto
non subisce colpi. Questi limiti non vengono nascosti dai test verdi.

## Verifiche della review

- npm test: 160 passati.
- combat-pass-compare: 90 righe riprodotte sulla testa finale.
- Build: passata, warning chunk >500 kB ancora presente.
- caves-check: desktop/mobile passati.
- Ranger e Giardino: desktop/mobile passati sulla testa finale.
- Checkpoint UI: passata sulla testa finale.
- Episodio completo: in esecuzione sulla build finale.
- Catture standard mobile/landscape: in esecuzione; non ancora passate.
- Cave supplementari: completate, landscape leggibile nella posa provata;
  portrait con collisione del tag contro il testo della quest (R2).

Risvegli sempre annullati, nessun main/deploy/social/spesa/Supabase. L'incarico
grafico successivo è delimitato in ART_PASS_02_SCOPE.md, dopo chiusura COMBAT-01.
