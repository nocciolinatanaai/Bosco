# Nemici — direzione richiesta dal proprietario

Sviluppo condiviso: Codex e Claude lavorano entrambi a gameplay, arte e codice;
Claude gestisce anche pubblicazioni e social. Nessuna approvazione artistica
implicita dai test. Il video corrente è respinto e da ritirare dalla promozione.

Riferimenti richiesti: Solo Leveling e Signore degli Anelli. Usare leggibilità
di cariche, crescita della minaccia, peso, materiali usurati e atmosfera; non
riprodurre personaggi, creature riconoscibili, marchi o asset delle opere.

Tre famiglie proposte, non un bestiario già implementato:

| Famiglia | Forma e materiale | Funzione leggibile |
| --- | --- | --- |
| Guardiani dei sigilli | Pietra spezzata, ferro consumato, legature, voce imprigionata | Carica pesante, colpo mirato e onda distinguibili dal corpo |
| Predatori della selva | Masse organiche, arti e mandibole credibili, asimmetria | Aggirare, inseguire e costringere a riposizionarsi |
| Creature della Frattura | Anatomia alterata, cristalli incorporati con una funzione | Pericolo magico comunicato da postura, silhouette e suono |

Custode: prima revisione geometrica reale in guardian-redesign.js, statua corazzata
con apertura nel torace e sigillo sospeso, volto occultato, colonne spezzate e
pannelli di tessuto. La forma resta stilizzata e angolare; se viene letta come
robot, va rivista prima di espanderla. Non dichiararla qualità cinematografica o
modello finale. Studio comparativo in tools/guardian-review, stessa luce/camera.

Pose guidate da stato e game time: anticipazione → colpo al confine impatto →
recupero; onda con entrambe le braccia, barcollamento e passi pesanti. Nessuna
modifica a danni, tempi della simulazione o collisioni. Gli altri nemici conservano
il modello precedente: non fingere di avere ridisegnato tutto il cast.

Critiche ancora da chiudere: animazioni del personaggio, qualità percepita della
mira/contatto, testi HUD, controller su dispositivo reale. Il nuovo layout mobile
è una prova da verificare, non una garanzia di UX migliore o di FPS su iPhone.

## Video respinto

Cattura originale a 20 fps, esportazione a 30: il contenitore non ricostruisce i
fotogrammi intermedi. Il montaggio comprende anche fermate intenzionali di menu
ed epilogo. Questo non misura gli FPS del gioco reale. Pipeline portata a cattura
60 fps per prove future; renderer rifiuta input sotto 50 fps. Non è stato prodotto
un nuovo Reel approvato. Serve prima verificare movimento, leggibilità e ritmo,
poi catturare una sequenza realmente fluida e misurare sul dispositivo dichiarato.
