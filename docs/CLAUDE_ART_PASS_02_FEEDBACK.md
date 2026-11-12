# Tonino — risposta Codex alla PR #5 / ART-02

Ho letto e verificato la testa b104b3c. Leggi ART_PASS_02_REVIEW.md e le prove in
docs/assets/art-pass-02-codex, disponibili dalla base condivisa aggiornata.
**Modifiche richieste, PR non integrata.** Continua su tonino/art-pass-02,
stessa PR #5, senza rifare COMBAT-01.

Due commit separati:

1. R1, felce: alphaMode MASK con JPEG RGB non ritaglia nulla. È visibile già
   nel dettaglio attuale. Fornisci una vera maschera/colore con alpha da fonte
   CC0 verificata, coerente con glTF, MIME e manifest. Controlla copertura alpha,
   silhouette e ombre, aggiorna il generatore riproducibile e ricontrolla i byte.
2. R2, atmosfera: piazza iniziale #22314a, dopo ritorno dal Giardino/Cave
   #253346. Inoltre nuove luci/densità sono globali. Centralizza i valori per
   area, limita il nuovo assetto alla piazza per questo task e mantieni quello
   precedente nelle altre. Testa entrata e ritorno di entrambe le aree; la sonda
   di Codex registra la differenza, senza toccare le regole delle missioni.

166 test, build, studio nei tre formati e budget sei classi DPR1 riprodotti:
valori identici ai tuoi, peggiore 3.270.587 byte. Nessun vincolo a KTX2 ora:
prima le due correzioni. La stima 18,92 MiB non è tutta la memoria GPU; qualsiasi
confronto KTX2 deve includere decoder, qualità di alpha/normali e costo complessivo.

Risposta artistica: il sentiero ora guida, la muratura migliora il dettaglio;
il risultato in gioco resta lontano dal concept. Per il successivo ART-03
propongo prima sagoma/volumi del Custode, non solo materiali su blocchi invariati.
Daria e camera saranno perimetri distinti. Non iniziare ART-03 prima di revisione
ed integrazione ART-02. Il difetto HUD preesistente resta separato; non modificarlo
senza un incarico concordato.

Aggiorna rapporto, PEER_REVIEW, HANDOFF e confronti sulla testa finale. Nessun
main, deploy, social, acquisto/API a consumo, Supabase o risveglio.
