# Account MYTHWOOD — progetto separato richiesto dal proprietario

Frontend implementato per email/password, conferma email, Google OAuth PKCE,
recupero e aggiornamento password, uscita dal dispositivo. Non crea o migra utenti
del vecchio gioco. Nessun salvataggio cloud, acquisto o account online viene
simulato; demo ospite e checkpoint locale restano indipendenti.

## Passi che richiedono l'account del proprietario

1. In Supabase creare un nuovo progetto dedicato a MYTHWOOD, scegliendo regione e
   piano dopo averne verificato limiti/costi. Non riutilizzare lxnhcuthmdkpeklucutu.
2. In Authentication abilitare Email con conferma email. Configurare un mittente
   SMTP adatto all'uso pubblico: il servizio email di test integrato può limitare
   destinatari e frequenza; non promettere consegna a tutti senza prova reale.
3. URL Configuration: Site URL https://mythwood.it e redirect autorizzato esatto
   https://mythwood.it/account.html. Per recupero aggiungere
   https://mythwood.it/account.html?intent=recovery. Per prove locali usare solo
   le URL di staging effettive; niente wildcard generiche verso siti esterni.
4. Per Google, creare/configurare OAuth nel proprio progetto Google Cloud,
   schermata consenso e domini autorizzati. In Supabase, provider Google: inserire
   lì client ID e client secret. Nella console Google autorizzare il callback
   HTTPS /auth/v1/callback del nuovo progetto Supabase indicato dal pannello.
   Se il progetto Google è in modalità test, verificare gli account di prova
   autorizzati e lo stato di pubblicazione prima di aprire al pubblico.
   Il client secret Google NON va nel sito, in VITE_, nel repository o in chat.
5. Impostare nel builder Cloud i quattro valori di .env.example: URL del nuovo
   progetto, **Publishable key** sb_publishable_…, nome del responsabile e email
   di contatto reale per account/dati. Sono configurazione pubblica del client;
   non usare service_role, sb_secret o password database.
6. Completare informativa/condizioni del progetto (responsabile, finalità, basi
   giuridiche, conservazione, fornitori/trasferimenti, diritti/contatti e gestione
   minori se applicabile). Definire la procedura effettiva di cancellazione.
   Il testo tecnico del frontend non certifica conformità normativa.
7. Ricompilare, rieseguire le prove e aggiornare il ramo Pages. Senza URL/chiave
   pubblica/contatto/responsabile validi il frontend resta esplicitamente inattivo.
8. Provare un account reale controllato dal proprietario: conferma email, login,
   uscita, recupero, Google e cancellazione. Questo non è stato eseguito qui.

## Email di conferma su un altro dispositivo

Il flusso PKCE con code richiede il verificatore del browser che ha iniziato
l'operazione. Il frontend accetta anche link one-time token_hash, verificati dal
server con verifyOtp, per le email configurate con il template ufficiale del
progetto. Se si usa questa variante, impostare i template con SiteURL/account.html,
TokenHash e type=signup (conferma) oppure type=recovery (recupero), verificando
la sintassi corrente nel pannello Supabase. Il token viene tolto subito dall'URL;
non va inviato a terzi o salvato nei log. Non inventare link per utenti reali.

## Limiti e sicurezza

- SDK ufficiale supabase-js, sessione con chiave mythwood.auth.v1; progressi con
  chiave distinta. Nessuna query a tabelle del vecchio gioco, niente SQL/RLS nuovi.
- Vecchio host e chiavi riservate respinti dalla configurazione. La CSP concede
  soltanto l'origin HTTPS del nuovo progetto nella pagina Account, quando valido.
- Callback locale, nessun parametro next/redirect esterno accettato; URL iniziale
  OAuth limitata a /auth/v1/authorize del progetto configurato.
- Risposte signup/recovery generiche per limitare la divulgazione di account.
  Servono anche rate limit e corretta configurazione del servizio: il client non
  rende il backend sicuro o autorevole per future ricompense.
- Nessuna cancellazione admin dal client. Richieste dati/cancellazione al contatto
  operativo; implementare il processo server prima dell'apertura pubblica.
- Test browser intercettano un host fittizio, non inviano email e non contattano
  Google. Il corretto setup reale del provider rimane da verificare.
