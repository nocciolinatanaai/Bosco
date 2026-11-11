# PR #1 — revisione indipendente Codex

PR: https://github.com/nocciolinatanaai/Bosco/pull/1
Testa verificata: `241921873585cf2693ff31fcac72328ca7a76773`.
Base condivisa: `d472bd1`. Esito: **richieste modifiche, non integrata**.
Questo documento non equivale a una review pubblicata tramite API GitHub.

## Risultato utile

Ho letto il codice e visto le immagini reali: nuovo abbigliamento, pelle,
capelli, treccia e mantellina costituiscono un passaggio sostanziale rispetto
alla base precedente. Non è ancora la qualità del concept. Le metriche e i
limiti dichiarati sono apprezzabilmente distinti dall'approvazione artistica.

## P1 — il mixer delle gambe sovrascrive anche torso e braccia

In `src/visuals/ranger-skinned.js` alla testa PR, riga 50 clona l'intera clip run
senza filtrare le tracce. Alle righe 120–126 la posa di tiro è applicata prima,
poi il secondo mixer riscrive tutto lo scheletro. La successiva interpolazione
agisce solo sulle ossa delle gambe: torso e braccia restano nella corsa.
Durante il tiro in movimento l'arco segue la mano, ma la mano non mantiene la
posa della tensione. Questo invalida la descrizione «gambe in corsa sotto la
posa dell'arco» e compromette proprio il caso richiesto dal proprietario.

Riproduzione sulla testa PR, dopo npm ci (se necessario):

```sh
npm run dev -- --port 5173 --strictPort
# In un altro terminale, con il probe della consegna di revisione:
mkdir -p test-results/pr1-independent
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium node /percorso/layer-probe.mjs test-results/pr1-independent/layer-report.json
```

Il probe versionato accanto alle evidenze crea tre istanze identiche: tiro
da fermo, tiro in movimento e corsa. Dopo 30 frame confronta le rotazioni locali
delle ossa (quindi non confonde la rotazione dell'attore verso il bersaglio):

| Osso | Tiro in movimento vs tiro da fermo | Tiro in movimento vs corsa |
| --- | ---: | ---: |
| torso | 42,92° | 0° |
| arm_upper_R | 73,92° | 0° |
| arm_lower_R | 29,45° | 0° |
| arm_upper_L | 134,18° | 0° |

Il valore misurato di deriva su ripetizione allo stesso tempo è ~3,2e-8 nelle
componenti quaternion: **non è una prova di un bug di pausa**. Il difetto
confermato è la sovrascrittura della parte superiore, non una deriva inventata.

Correzione richiesta: mascherare le tracce del mixer secondario al sottoinsieme
delle gambe, o ripristinare esplicitamente tutti i canali superiori dopo il
campionamento. Testare che il torso/braccia durante il tiro restino nella posa
di attacco mentre le gambe cambiano con la corsa. Aggiungere il caso di
interruzione e ripetizione dello stesso tempo. Non correggere danni o simulazione.

## P2 — la prova della presa non verifica la mano che tende la corda

La sonda ripetuta conferma il punto d'impugnatura sinistro, ma misura una
distanza mano destra–cocca durante windup di circa 0,208 unità scena in media
e 0,618 al massimo. `daria-combat-check.mjs` non impone limiti a questo valore.
È un limite già dichiarato da Tonino, non un difetto nascosto scoperto qui.
Non tradurre le unità scena automaticamente in metri fisici, né chiamare
«presa risolta» il solo grip sinistro. Dopo la correzione P1 misurare di nuovo
la distanza e fissare una tolleranza motivata rispetto all'altezza del personaggio.

## Verifiche eseguite da Codex

- `npm test`: **138/138** superati sulla testa PR.
- `npm run build`: riuscita, avviso chunk demo >500 kB.
- `MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium npm run test:daria`: passato,
  dieci viste, fallback e retry, più sonda combattimento 312 frame per variante.
- Probe aggiuntivo della sovrapposizione: difetto P1 riprodotto, dati sopra.
- `scripts/payload-probe.mjs`: numeri della sfida CHAL-01 riprodotti.
- Regressione Ranger nella build: passata su desktop e mobile, schivata al
  vero impatto e contrattacco doppio, HUD e ripristino.

Non ho rieseguito tutta la regressione dell'episodio: un blocco confermato
impedisce già l'integrazione. Le regressioni complete riferite da Tonino restano
sue prove; quelle Codex della vecchia base non si attribuiscono alla PR.

Evidenze in docs/assets/pr1-independent-review/. Chromium/SwiftShader,
nessuna misura su dispositivo fisico. I dati unit test non sono un giudizio
di qualità della pelle, dei capelli o dei vestiti.

## Risposta alle quattro domande ART-01

1. Mantellina: rende più riconoscibile l'asimmetria; chiederei meno frammenti
   triangolari prima di chiamarla stoffa rifinita. Non blocco il lavoro per gusto.
2. Capelli dietro: accettabili come passaggio provvisorio nella camera distante,
   non approvati per un primo piano promozionale.
3. Arco a tracolla: scelta possibile, ma va mostrata la transizione alla mano;
   lo scatto istantaneo fra due posizioni non è un'animazione completa.
4. Falde rimosse: compromesso provvisorio motivato per togliere un difetto;
   non rinominare il risultato «costume fedele» senza dichiarare la differenza.

## Risposta CHAL-01 — obiezione accolta, soluzione ancora da consegnare

Numeri indipendenti, byte dei corpi delle risposte, stessa sonda e viewport:

| Percorso | Byte |
| --- | ---: |
| Home | 3.727.892 |
| Home + demo Ranger | 5.533.564 |
| Home + demo Combattente | 6.237.660 |

Home e immagini sono un mio debito tecnico: la critica è fondata. Prendo in
carico una consegna distinta su immagini/caricamento del sito, senza toccare i
file personaggi riservati a Tonino. I target 1,2 MB / 3,5 MB restano obiettivi,
non risultati raggiunti. La misura su telefono reale richiede un dispositivo
fisico; non verrà sostituita da un numero SwiftShader chiamato FPS iPhone.

La sonda misura corpi delle risposte, non traffico compresso sul filo né tempi
di interattività: la verifica futura dovrà mantenere quella metrica per il
confronto e dichiarare separatamente le altre misure. Il probe non asserisce
direttamente lo stato ready dell'asset: non basta il timeout fisso a provarlo.

## Combattente e operazioni esterne

La proposta FIGHTER_PASS_01_PROPOSAL è coerente come direzione di silhouette e
armatura, ma attende P1. Chiedo di non vietare in assoluto terracotta/ruggine:
il concept approvato usa un tono caldo; differenziare materiali, silhouette e
postura, non stravolgerne la palette per soddisfare un test arbitrario. La
postura più bassa deve conservare piedi appoggiati e non cambiare hitbox.

Ho letto le comunicazioni su vecchio Supabase in pausa e annuncio Instagram:
sono azioni riferite da Tonino nei documenti, non verificate qui da Codex.
Nessun accesso o intervento su produzione/social in questa revisione. Non uso
la vecchia SHA Pages come permesso di force-push e non pubblico una PR bloccata.
