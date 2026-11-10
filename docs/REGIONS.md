# Due aree locali: struttura e vincoli

Giardino dei nomi implementato da Codex. Stato delle verifiche in HANDOFF;
nessun backend, streaming del mondo o nuova cooperativa.

## Simulazione

createSession crea area plaza e garden.step 0. Le tre tracce sbloccano una
interazione vicino a (38.5, 7), che porta al giardino in (0, 11). La transizione
è esplicita, non un corridoio continuo fra coordinate delle due scene.

In garden.js: regole di accesso/ritorno, obiettivo corrente, missione, coperture
e profilo della sentinella. combat.js conserva il ciclo di simulazione, danni,
interruzioni e proiettili. L'elenco enemies conserva i nemici visitati; inArea
filtra bersagli, danni e aggiornamenti. Le prime tre entità senza area esplicita
appartengono alla piazza, la sentinella ha area garden.

cleared indica il Custode della prima area; non l'eliminazione di tutti i nemici
del gioco. Non reintrodurre un controllo globale enemies.every(dead). Per una
terza regione aggiornare filtri, enum e checkpoint intenzionalmente: il codice
attuale supporta due aree, non un registro generico di regioni arbitrarie.

La sentinella pattuglia tra due postazioni, prepara la linea per 1,4 secondi e
poi infligge 20 danni se il centro del giocatore è nel rettangolo indicato. La
lunghezza si interrompe sulla prima colonna. Schivata/interruzione e protezione
usano le regole condivise. Fuori area il combattimento del nemico resta fermo.

I proiettili del giocatore e i colpi fisici diretti sono fermati dalle colonne
nel giardino. Gli effetti magici ad area possono agire oltre la copertura.
Non estendere implicitamente questo risultato a ogni ostacolo della piazza.

## Visuali

createArtWorld conserva piazza e giardino come radici distinte. Il giardino è
costruito al primo ingresso, poi viene riutilizzato cambiando visibilità. Si
mantengono entrambe le aree in memoria: non si scaricano file o chunk al passaggio.
Le geometrie statiche sono raggruppate per materiale. Luci principali, materiali
e personaggio sono condivisi; sfondo/nebbia cambiano tonalità. I modelli nemici,
indicatori e label sono filtrati anche nel rendering e nel raycast.

Il segnale rettilineo usa gli stessi beamWidth/beamLength della simulazione.
Niente ricreazione della mesh del segnale a ogni frame. Il modello della
sentinella è procedurale provvisorio, distinto dal vecchio guardiano; non è
un asset finale né un modello importato dal concept.

## Missione e salvataggi

step: 0 non visitato, 1 ingresso, 2 bussola, 3 segnale, 4 ritorno concluso.
Si può uscire prima di accendere il segnale conservando la bussola; uscire dopo
il segnale conclude una volta sola. Le rivisite non duplicano oggetti o dialoghi.
La sentinella può essere aggirata o sconfitta; la morte viene conservata nel save.

Schema v2 e migrazione v1 in LOCAL_CHECKPOINTS.md. La ripresa in giardino usa
l'ingresso sicuro, conserva lo stato di missione e ricrea un eventuale scontro
non concluso. Vita/vigore pieni alla ripresa, non al semplice cambio area.
Ogni stato locale resta modificabile dal giocatore: nessuna autorità per premi
online o economia futura.

## Limiti da portare avanti

Movimento assistito facoltativo in linea, non pathfinding; si interrompe usando
i comandi. La nota ambientale sul percorso laterale è ancora proposta. Non c'è
un compagno 3D, raccolta feedback automatica o nuovo personaggio selezionabile.
Il concept Daria resta separato. L'episodio è breve: non dichiara durata del gioco,
qualità artistica finale, divertimento o prestazioni di un dispositivo reale.

Test dedicati: garden.test.mjs (sei classi, collisioni, raggio, migrazione,
missione e riuso), test:garden (UI desktop/mobile, normale), test:browser
(regressione primo episodio). Il contatore WebGL createBuffer osserva solo
nuovi buffer nelle rivisite a caldo, non tutte le risorse o eventuali perdite.
