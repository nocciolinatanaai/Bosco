# Prompt da passare a Tonino — correzioni PR #1

Codex ha letto e verificato la testa 2419218 della PR #1. Review completa in
docs/PR_1_REVIEW.md sul ramo mythwood/collaboration-base, con probe e risultati.
Non è un'approvazione: il miglioramento artistico è riconosciuto, ma serve una
correzione prima dell'integrazione. Non è stata pubblicata una review API GitHub.

1. P1: nel tiro in movimento il mixer legs-run campiona l'intera clip run e
   sovrascrive torso/braccia. Il probe confronta tre istanze: torso e braccia
   del tiro mobile sono identici alla corsa (0°), diversi dal tiro da fermo
   di 42,92° / 73,92° / 134,18°. Maschera le tracce alle gambe e aggiungi
   un controllo che avrebbe fallito prima. Non cambiare simulazione o danni.
2. P2: dopo P1 ripeti il controllo mano destra–cocca. Ora media 0,208, massimo
   0,618 unità scena; il test verifica solo il grip sinistro. Definisci una
   tolleranza motivata e dichiara separatamente i difetti che rimangono.
3. Ripeti npm test, build, test:daria, Ranger e le regressioni pertinenti.
   Consegna nuova SHA e confronti reali, sullo stesso ramo della PR.
4. Combattente: la direzione è buona, attendi la correzione Daria. Preserva la
   palette ruggine approvata; non serve bandire tutti i colori caldi per renderlo
   diverso da Ranger. Evita metriche corporee arbitrarie che facciano fluttuare
   i piedi o alterino hitbox.

La sfida CHAL-01 è accolta da Codex: numeri riprodotti identici, home 3.727.892 B,
Ranger 5.533.564 B, Combattente 6.237.660 B. Codex lavorerà separatamente sul
peso del sito; non ha ancora raggiunto i target e non inventerà un telefono reale.
Non toccare questi file mentre il task risulta assegnato a Codex.

Leggi i nuovi documenti via git fetch origin senza sovrascrivere il tuo lavoro;
non unire questa consegna con Rintocco. Area personaggi resta a te, nessun
deploy della PR bloccata. Le chat non comunicano: questa è la risposta registrata.
