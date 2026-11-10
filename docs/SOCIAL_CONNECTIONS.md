# Collegare gli account social a Codex

## Stato e scelta iniziale

Il proprietario conferma account professionali/creator-business e utilizzo da
parte di Tonino di API Meta e TikTok. Riutilizzare prima queste integrazioni,
se appropriate e approvate; non aprire abbonamenti o duplicare app alla cieca.

Questa sessione non offre connettori di pubblicazione social. Le impostazioni
Cloud osservate non contengono binding social né variabili social esportate.
L'autorizzazione a pubblicare e commentare è stata ricevuta: ciò che manca è il
collegamento tecnico, non un'ulteriore approvazione di ogni post.

## Cosa recuperare da Tonino

- @ e ID esatti dei canali del progetto, distinti dai profili usati come ricerca.
- Sorgente dell'integrazione, istruzioni di avvio e versione delle API.
- App/prodotto Meta e flusso usato: Instagram Login oppure Facebook Login.
- Scope effettivi, stato revisione e accesso in produzione.
- App TikTok, Content Posting API, Direct Post oppure upload in-app,
  audit e visibilità consentita, eventuali prodotti diversi per commenti.
- OAuth, scadenze, refresh, webhook, coda, idempotenza e job già attivi.
- Nomi e posizione sicura dei binding: MAI valori segreti nel documento.

## Strumenti

| Necessità | Strumento / percorso | Limite |
|---|---|---|
| Reel e post Instagram | App Meta esistente + Instagram API | Collegare l'account e verificare permessi, flusso OAuth e versione; modalità di login diverse hanno requisiti diversi. |
| Commenti Instagram | API commenti e, se richiesti, webhook dell'app Meta | Permessi separati dalla pubblicazione; verificare le azioni consentite. |
| Post TikTok | Integrazione esistente conforme oppure servizio di pubblicazione approvato | Account professionale non equivale a Direct Post pubblico approvato. |
| Commenti TikTok | Prodotto/API effettivamente abilitato o servizio che lo supporta | Non assumere che Content Posting API includa lettura/risposta ai commenti. |
| File video per le API | Hosting HTTPS dei media con URL accessibili nei modi richiesti | Preview/media distinti dal sito di produzione; proprietà dominio TikTok da verificare se si usa PULL_FROM_URL. |
| Attività programmate | Scheduler già usato da Tonino o job server con registro persistente | La chat non esegue un processo continuo fra turni; evitare due scheduler concorrenti. |
| Segreti | Impostazioni sicure dell'ambiente/backend | Non inviare password, cookie, token o client secret in chat. Collegare solo i binding necessari all'integrazione verificata. |

Per Instagram Login controllare i permessi documentati per pubblicazione e
commenti (le denominazioni dipendono dal prodotto e dalla versione). Se Tonino
usa Facebook Login, controllare anche i collegamenti Pagina/Business necessari
per quel flusso; non imporli indistintamente a qualunque Instagram API.

## Limiti TikTok verificati il 10 novembre 2026

Letti Get Started — Direct Post e Content Sharing Guidelines:
- serve approvazione dello scope video.publish e autorizzazione dell'account;
- client non sottoposti ad audit hanno limitazioni di visibilità privata;
- le linee guida escludono utility interne destinate soltanto agli account
  propri/del proprio team dall'uso previsto per un client Direct Post;
- sono previste informazioni del creator, opzioni di pubblicazione e requisiti
  UX/consenso da rispettare. Il mandato continuativo dell'utente in questa chat
  non sostituisce i requisiti della piattaforma.

Non proporre un nuovo bot personale aggirando questi limiti. Prima chiarire come
operava la vecchia integrazione. In alternativa valutare un servizio già approvato
con API o integrazione utilizzabile, dopo verifica di accesso, costi e funzionalità.
Nessun servizio commerciale è stato scelto o acquistato.

Fonti:
- https://developers.tiktok.com/docs/en/content-posting-api-get-started
- https://developers.tiktok.com/docs/en/content-sharing-guidelines
- https://developers.facebook.com/documentation/instagram-platform/content-publishing
- https://developers.facebook.com/documentation/instagram-platform/comment-moderation
- https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login

Le pagine Meta rispondono ma in questa lettura espongono solo la struttura/titolo
client-side: requisiti dettagliati ancora da verificare, non dichiarati letti.

## Domini aggiuntivi per le API effettive

```text
developers.facebook.com
graph.facebook.com
graph.instagram.com
developers.tiktok.com
open.tiktokapis.com
```

developers.facebook.com e developers.tiktok.com sono già coperti dalle wildcard
social osservate; graph.instagram.com/graph.facebook.com potrebbero esserlo
anch'essi. open.tiktokapis.com non è coperto da *.tiktok.com. Aggiungere solo
gli host mancanti e quelli di upload effettivamente restituiti/documentati dal
flusso scelto; non concedere wildcard globali per ipotesi.

## Prima attivazione

Verifica read-only dell'identità account e permessi, prova del file/spec senza
pubblicare, controllo della coda e dello stato, quindi post reale nel mandato
ricevuto e nel rispetto dei requisiti della piattaforma. Registrare ID e URL
pubblicato; niente retry ciechi che duplicano contenuti. Errori e token redatti.

Non serve una nuova autorizzazione per ogni post organico: serve prima la capacità
tecnica verificata. Nessuna pubblicazione è stata effettuata da Codex finora.
