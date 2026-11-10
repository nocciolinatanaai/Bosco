# Ranger — Tiro di ritorno

Prima variazione di crescita specifica, oltre allo scatto di risonanza comune.
Proposta giocabile Codex, non un percorso di evoluzione finale già validato.

Dopo il risveglio, evitare un impatto durante l'invulnerabilità dello scatto
carica una finestra di quattro secondi di simulazione. Scattare senza un impatto
non basta. L'abilità del Ranger, rilasciata nella finestra con bersaglio a portata,
scocca la freccia normale e una seconda freccia dorata dal fianco, ritardata di
140 ms, al 65% del danno base. Entrambe sono proiettili reali verso quel bersaglio.
Restano danni e moltiplicatore del risveglio: 66 + 43 contro un bersaglio sano.

Una finestra alla volta, rinnovabile ma non cumulabile. L'attacco base non la
consuma. Il recupero dell'abilità non viene azzerato; il tempo continua durante
la carica dell'abilità. Fuori portata non consuma il tiro; annullare la carica
con uno scatto non rilascia frecce. Pausa e finestre fermano il tempo di gioco.
La carica transitoria non viene conservata nella tappa e si perde alla sconfitta.

L'impulso dello scatto può interrompere un nemico vicino prima che colpisca:
in quel caso non è avvenuta una schivata d'impatto e non si carica il tiro.
Il Ranger deve scegliere fra interrompere da vicino, tenersi lontano o rischiare
il tempismo a media distanza. Non è necessario attivarlo per vincere.

Feedback: anello verde alla schivata, messaggio, finestra con secondi nell'HUD,
nome e bordo dell'abilità aggiornati; seconda freccia dorata visibilmente distinta.
Supporta effetti ridotti. Nessun nuovo audio scaricato, acquisto o dipendenza.
Modello e animazione rimangono procedurali: non è ancora la trasformazione
artistica completa richiesta dal proprietario.

File: combat.js, journey.js, runtime.js, ui.js, style.css, visuals/combat-effects.js.
Otto test dedicati verificano condizioni, tempo, consumo, annullamento, danno,
singola morte, ripresa e riuso delle viste. Leggere HANDOFF per l'esito browser.
Bilanciamento e comprensione richiedono una prova umana; non dedurli dal bot.


Prova browser ripetibile: npm run test:ranger, con Chromium Playwright o
MYTHWOOD_CHROMIUM_PATH nel Cloud. Parte da una tappa sintetica risvegliata,
usa input tastiera/touch e avanza il clock del browser a passi di 100 ms
(50 ms vicino all'impatto). Non legge o modifica lo stato interno del gioco.
Verifica anche focus dopo menu e ingombri landscape. Nessuna cattura in questo
runner: il clock simulato interferisce con la stabilizzazione screenshot.
La regressione e le catture normali restano nel runner test:browser.


Esito finale: 77 test superati, prova dedicata desktop/mobile superata, regressione
completa a tempo normale superata. Rapporti in verification/ranger-latest.json
e browser-latest.json, con commit/hash distinti. Nessun esito hardware o umano.
La proposta visiva del personaggio è in CHARACTER_DARIA.md: il modello attuale
non la realizza ancora. Non confondere concept e cambiamento effettivo del client.
