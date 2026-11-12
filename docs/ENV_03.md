# ENV-03 — arredo della piazza verso il concept (Tonino, 12 novembre)

Ramo `tonino/env-03`, impilato su `tonino/art-03-custode`. Lavoro autonomo chiesto dal
proprietario dopo la domanda «quanto siamo distanti dal concept»: l'ambiente era la distanza
colmabile senza toccare runtime, telegraph o HUD. Non è un incarico assegnato da Codex.

## Cosa aggiunge (`src/visuals/plaza-dressing.js`, chiamato da environment.js)
- **Grappoli di cristalli viola** ai piedi delle colonne laterali e del portale: emissivi e
  semitrasparenti, il bagliore viene dal bloom già esistente.
- **Pozzanghere**: dischi lucidi a contorno morbido sui ciottoli, che riflettono ambiente e
  bagliori. Riflesso ridotto dopo una prima prova troppo bianca a incidenza radente.
- **Fiori di risonanza**: piccoli calici viola su stelo, a ciuffi lungo i cordoli del sentiero
  e ai bordi. Dimensione e numero dimezzati dopo una prima prova da «imbuti giganti».
- **Lanterne a palo** ai lati del sentiero: ferro scuro e vetro caldo emissivo, nessuna luce
  reale aggiunta.
- Tutto è in `InstancedMesh` (una draw call per tipo) e resta fuori dal sentiero e dal cerchio
  dello scontro. Due test nuovi lo verificano (`tests/plaza-dressing.test.mjs`).

## Costo
- Vista di gioco: 176 draw call contro 172, circa 486.000 triangoli contro 483.000.
- Byte home→demo: +3,5 KB di codice, nessuna risorsa nuova. Peggiore Ranger 2.919.215, con
  ART-02, Custode Blender, texture e quantizzazione (`docs/assets/env-03/budget.json`).

## Verifiche
- 175 test, build e regressioni browser, Cave, Giardino e checkpoint UI passati; budget
  passato.
- Catture COMBAT-01 su 390×844 e 844×390 passate. Resta la sola sovrapposizione
  preesistente dell'etichetta sul joystick.
- Desktop non ripetuto: ha lo stesso blocco aperto di ART-03.

## Confronti (sinistra ART-03, destra ENV-03; stesso studio a camere fisse)
- `docs/assets/env-03/desktop.jpg`: vista di gioco e combattimento in scala di grigi. Il
  cerchio di pericolo resta leggibile; le lanterne restano ai lati.
- `docs/assets/env-03/mobile.jpg` e `landscape.jpg`.

## Giudizio onesto
- La piazza è più viva e richiama la palette del concept (viola dei cristalli, caldo delle
  lanterne).
- Le pozzanghere non sono riflessi veri: senza screen-space reflection restano macchie lucide.
- Manca ancora la grande architettura del concept: tettoia di ferro e vetro, stazione, treno.
- Le lanterne fanno ombre lunghe che in alcune inquadrature attraversano il sentiero.
