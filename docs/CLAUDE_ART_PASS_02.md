# Tonino — ART-02: rendere convincente la prima arena giocabile

> Aggiornamento: consegna b104b3c revisionata, modifiche richieste. Leggere
> CLAUDE_ART_PASS_02_FEEDBACK prima del mandato originale sotto. Stessa PR #5.

Avvio solo dalla base condivisa che integra COMBAT-01 e la risposta Codex,
mai dal vecchio ramo di combattimento. Nuovo ramo `tonino/art-pass-02`, PR verso
`mythwood/collaboration-base`. Leggi HANDOFF, COLLABORATION,
COMBAT_PASS_01_RECHECK e ART_PASS_02_SCOPE prima di modificare file.

La sfida: migliorare visibilmente la piazza del Custode e il suo accesso nella
build reale, mantenendo Daria, combattimento e segnali. Il concept è direzione
artistica, non prova del risultato. Three.js resta il motore.

La cattura docs/assets/combat-pass-01-recheck/desktop-opening.png mostra molto pavimento
ripetuto, rovine uniformi e poco contrasto fra piani. Un pavimento più dettagliato
da solo non basta: serve una gerarchia di forme e materiali riconoscibile dalla
camera di gioco. Se il limite dominante è la camera o la silhouette del nemico,
mostralo con una proposta separata senza modificare runtime o personaggi di nascosto.

Prima salva le camere/pose e le misure della base. Poi consegna tre passaggi
separati e confrontabili: materiali PBR/asset CC0 a luce invariata; illuminazione;
verifica finale e costo. Rovine e vegetazione devono dare profondità e scala,
non aggiungere solo rumore o bagliori. Il protagonista e il nemico restano
riconoscibili fra sfondo e segnali a terra. Blu profondi, oro e viola sono una
palette, non un motivo per nascondere texture o sagome nell'oscurità.

File assegnati: src/visuals/environment.js, materials.js, stone-surface.js,
geometry.js per helper necessari, src/graphics-quality.js, nuovi moduli
props/materiali, public/art/environment-pass02/ con manifest e licenze,
script/fixture e documenti ART-02. Runtime/combat/caves/telegraph/HUD/personaggi
esclusi da questo primo passaggio: registra l'esigenza prima di cambiare perimetro.
Una proposta 3D per volti/nemico può essere discussa, non sostituisce questo incarico.

Contesta il mio budget se hai prove: ≤3,5 milioni di byte nel percorso home→demo,
per ciascuna classe, è un vincolo iniziale; se impedisce una scelta nettamente
migliore, mostra due opzioni con immagini e costo prima di cambiarlo. Sono byte
dei corpi delle risposte, non byte compressi sul filo né tempo di caricamento.
Niente texture 4K indiscriminate. Specifica memoria texture e trattamento sRGB/dati.

Consegna:
- prima/dopo alle stesse camere, posa, tempo, profilo e viewport: 1440×900,
  390×844, 844×390; vista di gioco, dettaglio materiali e combattimento;
- segnali COMBAT-01 leggibili anche in scala di grigi, nessuna sovrapposizione
  introdotta, test/build/regressioni pertinenti passati sulla testa finale;
- triangoli/draw call/materiali/texture, byte e memoria stimata con metodo e
  fixture. Non chiamare 1,5 fps SwiftShader una misura del telefono reale;
- fonti, licenze del singolo asset, hash e trasformazioni riproducibili;
- rapporto ART_PASS_02, risposta critica in PEER_REVIEW e HANDOFF aggiornato.

Se il guadagno è minimo, scrivilo e proponi la causa (geometria, camera, sagome,
materiali, animazione) con prove. Non chiamare approvata la grafica per i test verdi.
La gittata sicura del Guardiano opzionale resta intenzionalmente invariata nella
demo; nessuna eccezione di classe a Impeto. Il consiglio di sconfitta è stato
corretto da Codex: non riapplicare patch di combattimento.

Commit ai checkpoint e push solo sul tuo ramo. Niente main, deploy, social,
spese, Supabase, nuovi servizi o risvegli. Codex rivede e può rifiutare motivando.
