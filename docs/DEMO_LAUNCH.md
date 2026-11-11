# Consegna demo, sito e video

Mandato: portare a termine il primo frammento, creare video pubblicabili e sito
su GitHub Pages; aggiunti account email/Google su un nuovo progetto Supabase.
La patch Tonino 3222cd1 non è disponibile: nessun file riservato modificato.

Root index.html è ora il sito; demo.html avvia il gioco. Riepilogo dopo Custode,
ritorno al sito, prosecuzione nelle aree già presenti e link Account. La demo
è una versione di sviluppo individuale: grafica e bilanciamento restano provvisori,
nessuna cooperativa, economia o nuova patch Rintocco viene dichiarata pronta.

Sito: storia, sei classi, immagini del gioco reale, video, feedback locale da
condividere/scaricare. Nessun form finto, iscrizione marketing o checkout. Gestione cookie con preferenze
facoltative e revoca: COOKIE_MANAGEMENT.md. La
registrazione è una funzione separata, inattiva finché il nuovo progetto non è
configurato: leggere ACCOUNTS_SETUP.md. Pagamenti non attivati.

Video nuovo: capture-demo-video e render-demo-video. Gioco reale da checkpoint,
clock campionato per cattura, montaggio con testi e musica sintetizzata originale.
Non è una partita in presa diretta. I vecchi esperimenti cinematici restano fermi.

GitHub Pages: preparare ramo mythwood/pages con soli file dist, CNAME mythwood.it,
.nojekyll. Il record DNS indicato dal proprietario punta a nocciolinatanaai.github.io;
è la destinazione DNS, non il contenuto del file CNAME. API GitHub non autenticata:
la scelta del ramo Pages va verificata/configurata dall'account del proprietario.
Niente merge su main. I risultati finali e il commit sono nella testa di HANDOFF.

## Prove e limiti della consegna

126 test passati. Episodio completo desktop/mobile con riepilogo e prosecuzione
passato; smoke sito, video MP4 e navigazione passati. Account con SDK reale e
HTTP intercettato: signup, email login, reset, Google PKCE e logout verificati,
ma nessuna prova su un progetto Supabase reale o su Google reale. Cookie testati
su desktop/mobile, anche revoca e memorie separate.

La regressione completa precede l'aggiunta del solo link Cookie nel footer demo;
la logica del gioco è invariata e lo smoke finale verifica il layout/navigazione.
Controlli Chromium emulati: non attestano Safari su dispositivo fisico.

Reel 14 s e Story 8 s, 720×1280 H.264/AAC, audio originale del montaggio.
Non pubblicati sui social. Prima cattura scartata perché Space dal focus di un
bottone non attivava la schivata; wrapper e cattura ora restituiscono il focus
al mondo e verificano stamina e Tiro di ritorno prima di dichiarare riuscita.

Sito compilato pronto per ramo Pages; attivazione effettiva non verificata,
nessun accesso API GitHub valido. Registrazioni esplicitamente inattive finché
il proprietario non crea/configura il progetto nuovo, SMTP/Google e informativa.
Nessun incasso, lead raccolto automaticamente o conformità normativa certificata.

## Valutazione economica discussa

Alla domanda 50–100 euro/100 giorni, Codex raccomanda una micro-demo distintiva
e pubblica presto, con perimetro più piccolo dell'open world proposto. Per
incassi a breve, un servizio per clienti identificabili ha una validazione più
diretta; nessuna garanzia di vendita. È una proposta, non una nuova decisione
del proprietario o un aumento del budget autorizzato. Non sono stati aggiunti
altri sistemi/mappe mentre si chiude questo blocco.
