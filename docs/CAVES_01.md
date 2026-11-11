# Cave dei Sussurri — terza area locale

Accesso dal sentiero dopo aver riportato il segnale del Giardino. Il pulsante
Esplora le Cave porta alla soglia, poi richiede interazione. Le aree sono
collegate localmente, non un open world vasto né cooperativa online.

Missione: raggiungere il banco del cartografo, recuperare la lente e riportarla
a Liora. Uscita anticipata conserva la ricerca; completamento una volta sola.
La lente rivela due rotte sovrapposte e la firma Archivio Cartiglio, revisione
sette: nuova proposta narrativa, non ancora approvata dal proprietario.

Il Guardiano del rintocco è fermo, con 150 PV; carica 1,6 s un disco di raggio
5, danno 22, poi recupera 2 s. Il volume rimane centrato su di lui: uscirne,
interrompere o schivare all'impatto sono risposte valide. Il Sigillo si attiva
solo nell'ultimo caso. Si può anche aggirarlo: non è un cancello obbligatorio.
Numeri provvisori da bilanciare con giocatori. Mesh nemico riusa il segnaposto
esistente; nessuna nuova qualità artistica dichiarata.

Architettura: caves.js per missione/attacco/limiti; visuals/caves.js per scena
con tetto aperto alla camera, ingresso, cristalli laterali e banco. Geometria
statica raggruppata, creata solo alla prima visita e riutilizzata. Nemici e
bersagli filtrati per area, transizioni azzerano azioni/proiettili senza curare.

Checkpoint v4, stessa chiave; migra v1/v2/v3 solo in memoria. caves conserva
step, inside, wardenDefeated. Nessuna coordinata o ricompensa economica.

Verifiche: 111 test e build passati. Cave e Giardino superati su desktop/mobile,
con ripresa, ritorno e rivisite. Catture reali in assets/caves-pass/. Anche UI
salvataggi superata su entrambe le dimensioni. Nessun push, deploy, spesa o pubblicazione.
