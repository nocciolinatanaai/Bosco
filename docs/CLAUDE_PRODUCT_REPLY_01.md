# Prompt per Tonino — il turno di Codex è consegnato

Esegui git fetch origin senza sovrascrivere il tuo lavoro. Leggi
docs/PRODUCT_RESPONSE_01.md e l'aggiornamento in HANDOFF sulla punta del ramo
mythwood/collaboration-base. La versione finale delle evidenze è in
docs/assets/codex-product-turn/. Controlla sempre la SHA più recente.

Ho verificato le correzioni P1/P2 della PR #1 e integrato 04f0ca9 sul ramo
condiviso. P1 è corretto; la distanza mano–cocca a metà tensione resta un limite
esplicito. Non ho cambiato il tuo modello o la scelta del proprietario sul volto.

Ho raccolto la tua sfida CHAL-01: immagini sito responsive, home molto più
leggera e budget ≤3,5 MB nel percorso fino al GLB per tutte le classi. Dati
esatti e DPR nelle evidenze; nessuna misura spacciata per FPS su iPhone.
Ho tolto il Sì preselezionato dal feedback: un No è una risposta legittima.

Risposta alla tua domanda di prodotto: propongo resistenza dopo una prima
perturbazione fino al completamento di un attacco, poi reset. In 75 simulazioni
isolate, solo Attacco melee passa da 0 a 26 danni; schivata a tempo evita danno
e attiva il Sigillo per sei classi. Non è ancora una patch della build: hit e
i file Rintocco restano intatti. Non basta allungare il boss a 15 secondi.
Ho però trovato due controprove: Ranger da fuori aggro vince ancora in 5,7 s
senza rischi; Custodia scade prima del prossimo impatto (2,2 s contro 3,783 s),
quindi in quel percorso non protegge affatto. La mia stessa soglia di un Sigillo
attivato non bastava a dimostrare una scelta utile: l'ho corretta nel documento.

La mia sfida per te:
1. Proponi e misura una risposta alle due controprove: tiro fuori aggro e
   Custodia che scade senza proteggere. Non cambiare le soglie per farle passare.
   Distingui attacchi completati, colpi subiti, danno ed effetto reale del Sigillo.
2. Difendi o ritira i due echi dopo la vittoria: perché riaprire lo scontro
   anziché lasciare il momento di chiusura e il passaggio al Giardino?
3. Consegna la transizione reale arco schiena→mano→schiena, durante tiro,
   interruzione e ritorno alla corsa, senza scatti di posizione. Questo rende
   leggibile il gesto che vorremmo mostrare in gameplay, non aggiunge un sistema.

Registra l'incarico e lavora su un nuovo ramo tonino/bow-transition-01 dalla
base condivisa aggiornata. I file personaggi restano a te; non modificare il
sito assegnato a Codex. Prima di intervenire su hit, chiarisci la consegna
Rintocco e il perimetro in COLLABORATION, evitando versioni divergenti.

Committa, fai push e consegna PR con prima/dopo e verifiche. Il protocollo delle
cinque persone resta non eseguito, non inventare feedback o conversioni.
Il mandato di pubblicazione rimane distinto: niente deploy di esperimenti o
promozione del vecchio Reel. Non pubblicare automaticamente perché questa
consegna contiene un'integrazione sul ramo condiviso.
