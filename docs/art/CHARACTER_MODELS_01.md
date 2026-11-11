# Personaggi 3D — prima base per le sei classi

Mandato del proprietario: le tavole vanno bene, ora creare i personaggi.
Le tavole sono riferimenti, non personaggi già implementati. Questo intervento
crea cinque GLB riggati per Tank, Combattente, Assassino, Mago e Guaritore e li
collega al gioco. Ranger conserva Daria e la sua pipeline già disponibile.
Nessuna modifica a combattimento, danni, collisioni, checkpoint o file di Tonino.

## Provenienza e riproduzione

Anatomia, pesi e clip: System G6 / Modular RPG Characters, CC0. Fonte, archivio
e SHA originali in public/models/ranger/SOURCE.json e licenza adiacente. I nuovi
GLB derivano dai file human_male.blend e human_female.blend dello stesso archivio.
Texture originali non ritoccate; alcuni moduli maschili pesanti non hanno PNG
corrispondente nell'archivio e usano esplicitamente materiali PBR uniformi.
Non attribuire questi modelli o le immagini a Mage Space.

```sh
blender -b -t 2 --python scripts/prepare-class-characters.py -- /percorso/modular_rpg_characters public/models/characters
npm test
npm run build
node scripts/class-character-review.mjs
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium node scripts/browser-check.mjs
```

Per rigenerare servono Blender 4.3 e l'archivio sorgente estratto con textures/
completo; non basta il repository da solo. Per eseguire il gioco i GLB già inclusi
sono sufficienti. Non sovrascrivere raffinamenti artistici successivi con questo
generatore senza confronto e revisione.

## Cosa esiste

Cinque asset distinti, ciascuno con 43 ossa e sei clip (idle, run, prepare,
attack, special, dodge). Equipaggiamento su ossa delle mani; coat e accessori
con pesi sullo scheletro. Moduli pesanti per Tank, medi per Combattente, leggeri
per Assassino, sopravvesti e focus distinti per magia/cura. Borsa da spedizione
per Guaritore. Materiali, taglie e clip dipendono dalla classe.

Loader locale al primo utilizzo della classe, cache per asset, scheletri/mixer
per istanza, fallback procedurale su caricamento fallito. Gestione dei risultati
asincroni per evitare modelli precedenti visibili dopo un cambio classe.
Pose campionate sul tempo simulato, nessun timer che assegni danno.

Studio reale: /tools/character-roster-review/, selezione classe, pose statiche,
riproduzione. È una vista di authoring, non una scena della build pubblicata.

## Limiti che impediscono di chiamarli finiti

Volti e capelli sono quelli generici della base CC0: non corrispondono alle
identità, età e dettagli delle tavole. I costumi non sono ancora la loro
ricostruzione. Il salto resta una posa provvisoria della schivata. Le prese delle
armi, i contatti al colpo, le compenetrazioni delle sopravvesti e il peso del
movimento richiedono rifinitura. Non ci sono shader pelle SSS né texture PBR
specifiche scolpite/baked per ciascun personaggio. Daria non riceve una nuova
scultura in questo blocco. Nessuna qualità UE5/Final Fantasy raggiunta presunta.

Questa è una prima base realmente animabile per sostituire il corpo condiviso;
non è la consegna artistica finale richiesta. Prima di espandere ulteriormente
il cast serve rifinire un personaggio fino al confronto convincente col concept.

## Verifiche del checkpoint

Prima prova: 135 test superati; 30 pose browser nello studio senza page error.
La revisione delle immagini ha però scoperto Tank bianco per mappe mancanti e
normali della sopravveste rivolte all'interno. Correzioni applicate, revisione
e regressione completa dell'episodio in corso: non dichiararle superate finché
non completate. Le metriche non misurano FPS su iPhone né approvazione artistica.
