# Requisiti UE e Italia — registro di lavoro

Data: 10 novembre 2026. Stato: analisi preliminare, NON attestazione di conformità.
Le nuove autorizzazioni di rete sono attive. Verificati accesso e contenuti
pertinenti di EUR-Lex, Garante e Commissione. Lettura mirata delle disposizioni,
non revisione legale integrale: resta da valutare applicabilità e attuazione italiana.
Riferimenti consolidati raggiunti: AI Act al 27 luglio 2026 e direttiva diritti
consumatori al 27 settembre 2026, indicati da EUR-Lex come versioni correnti.
Manifest di provenienza: `research/2026-11-10-sources.json`.

## Applicabilità e decisioni operative

| Area | Riferimento ufficiale | Lavoro richiesto prima dell'attivazione |
|---|---|---|
| Dati personali | GDPR, Reg. UE 2016/679, artt. 5, 6, 12–22, 25, 28, 32–35 | Identificare titolare/contatti, finalità e basi giuridiche, fornitori e trasferimenti; minimizzazione; diritti, sicurezza, incidenti; valutare DPIA se ricorrono i presupposti. |
| Identificativi gioco | GDPR, considerando 26 e art. 4 | Device, posizione e log associabili a una persona sono potenzialmente dati personali pseudonimi, non automaticamente anonimi. Rivedere la vecchia informativa. |
| Minori | GDPR art. 8; Codice privacy italiano art. 2-quinquies | Valutare pubblico, base giuridica e flussi adeguati. In Italia i 14 anni riguardano il consenso per specifici servizi della società dell'informazione, non una licenza universale a raccogliere dati o vendere. |
| Cookie e terminale | Dir. 2002/58/CE art. 5(3); indicazioni Garante | Inventariare cookie/storage/SDK; distinguere necessità tecnica e funzioni non necessarie; consenso quando richiesto e revoca effettiva. Non inserire un banner vuoto come prova di conformità. |
| Contenuti digitali e vendite | Dir. 2011/83/UE, Dir. UE 2019/770, Codice del consumo | Identità del venditore, prezzo reale completo, contenuto acquistato, consegna, assistenza, rimedi e recesso. Per eventuale perdita del recesso su contenuto digitale verificare tutte le condizioni, non solo una checkbox. |
| Monete virtuali | Principi CPC del 21 marzo 2025 e pagina Commissione aggiornata con azioni 2026, consultata | Prezzi e conversioni comprensibili, niente costi nascosti, acquisto forzato di moneta o pressione sui minori; rispetto del recesso. Sono indicazioni di enforcement delle norme consumatori, non un autonomo nuovo regolamento. Catalogo non ancora scelto. |
| Chat e contenuti utenti | Reg. UE 2022/2065 (DSA), se applicabile al servizio e alla sua qualificazione | Valutare ruolo, dimensione ed esenzioni; regole, segnalazioni, moderazione e ricorsi proporzionati. Non tutti gli obblighi DSA si applicano indistintamente a qualunque gioco. |
| AI e trasparenza | Reg. UE 2024/1689 consolidato al 27 luglio 2026, artt. 50 e 113; pagina Commissione consultata | Le disposizioni di trasparenza si applicano dal 2 agosto 2026. Valutare obblighi secondo ruolo e uso: un NPC realmente conversazionale richiede un'analisi diversa dall'AI usata per sviluppare codice. Distinguere fornitore/deployer e non estendere automaticamente a ogni asset gli obblighi sui deepfake. |
| Accessibilità | Dir. UE 2019/882 e attuazione italiana, ove applicabili | Valutare soprattutto il servizio e-commerce e possibili esenzioni; predisporre accessibilità reale. WCAG come riferimento tecnico, non attestazione legale automatica. |
| Promozione | Dir. 2005/29/CE, AGCM, regole delle piattaforme | Rendere riconoscibili messaggi commerciali, prezzo e limiti; niente finti utenti, recensioni o gameplay. Dichiarare correttamente concept/AI quando necessario. |
| Proprietà intellettuale | Licenze dei singoli asset, codice, musica e marchi | Inventario provenienza/licenza, uso commerciale e attribuzioni; ispirazione a Solo Leveling senza riproduzione del suo materiale protetto. |

## Fonti da consultare

- https://eur-lex.europa.eu/eli/reg/2016/679/oj
- https://eur-lex.europa.eu/eli/dir/2002/58/oj
- https://eur-lex.europa.eu/eli/dir/2011/83/oj
- https://eur-lex.europa.eu/eli/dir/2019/770/oj
- https://eur-lex.europa.eu/eli/reg/2022/2065/oj
- https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- https://eur-lex.europa.eu/eli/dir/2019/882/oj
- https://www.garanteprivacy.it/
- https://www.edpb.europa.eu/
- https://www.agcm.it/
- https://commission.europa.eu/law/law-topic/consumer-protection-law_en

## Fonti consultate e conseguenze per il progetto

1. GDPR, artt. 8, 25 e 32 nel testo pubblicato su EUR-Lex: protezione fin dalla
   progettazione, minimizzazione e verifica delle misure. Progettare identità,
   conservazione, log e cancellazione insieme alle funzionalità. La lettura di
   art. 8 conferma che le soglie sul consenso non sono regole generali per ogni trattamento.
2. [AI Act consolidato](https://eur-lex.europa.eu/legal-content/IT/TXT/HTML/?uri=CELEX:02024R1689-20260727),
   artt. 50 e 113: valutare informazione alla prima interazione quando dovuta,
   accessibilità e ruoli effettivi. La decorrenza della trasparenza non è rinviata
   dalle diverse scadenze dei sistemi ad alto rischio; Mythwood non è per questo
   automaticamente un sistema ad alto rischio.
3. [Diritti consumatori, consolidato](https://eur-lex.europa.eu/legal-content/IT/TXT/HTML/?uri=CELEX:02011L0083-20260927),
   art. 16(m): per contenuto digitale a pagamento e perdita del recesso non basta
   l'inizio della consegna. Vanno considerate le condizioni cumulative di consenso
   espresso, riconoscimento della perdita e conferma prevista dalla direttiva.
   Verificare recepimento italiano, qualificazione del prodotto e ruolo del venditore.
4. [Commissione: giochi e valute virtuali](https://commission.europa.eu/topics/consumers/consumer-rights-and-complaints/enforcement-consumer-protection/coordinated-actions/social-media-online-games-and-search-engines_en):
   verificati riepilogo dei principi CPC e azioni descritte nel 2026, inclusa la
   dichiarazione del 30 settembre. Il PDF completo dei principi non è ancora
   stato analizzato. Proporre catalogo/prezzi comprensibili, niente urgenza fittizia,
   sollecitazioni dirette ai bambini o conversioni nascoste.
5. [Garante, linee guida cookie del 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876):
   letti chiarimenti su consenso, scrolling e cookie wall. Il prototipo privo di
   tracking non giustifica l'aggiunta di un banner generico; rivalutare quando
   entrano storage, analytics, embed social e fornitori esterni.
6. DSA, artt. 19 e 28 nel testo pubblicato: la qualificazione del servizio e le
   esclusioni per micro/piccole imprese di quella sezione vanno esaminate prima
   di assegnare obblighi. Non confondere tale esclusione con un'esenzione generale
   da ogni obbligo del DSA. Progettare comunque moderazione e sicurezza per gli utenti.

La verifica non comprende tutti gli atti italiani, ogni modifica alle altre fonti
o i contratti dei fornitori. Il sito e lo store non sono dichiarati conformi.

Prima del rilascio ricontrollare testo consolidato, atti di attuazione, modifiche
entrate in vigore e orientamenti applicabili. Distinguere una proposta legislativa
da una norma vigente. Nessuna dichiarazione di conformità ricavata solo da questa tabella.

## Stato della nuova build locale

- Account, chat, analytics e pagamenti: non implementati, nessuna raccolta nuova.
- Nessun cookie o localStorage usato dall'applicazione.
- I file vengono richiesti al server locale; un futuro hosting può registrare
  IP e log tecnici: da includere nell'analisi prima del servizio pubblico.
- Il vecchio servizio e le vecchie informative sono ancora online: la nuova
  build locale non risolve retroattivamente i loro obblighi o difetti.

## Informazioni necessarie dal proprietario / Tonino

Identità dell'operatore e sede; pubblico e paesi target; fornitore vendite e ruoli
contrattuali; processi già attivi; log/cron; hosting e configurazione Supabase;
contatti assistenza/moderazione; licenze asset; budget effettivo. Non chiedere
password o valori di segreti per documentare queste informazioni.

Store e chat rimangono fuori dal rilascio finché i relativi flussi non sono
verificati e le responsabilità operative non sono assegnate.
