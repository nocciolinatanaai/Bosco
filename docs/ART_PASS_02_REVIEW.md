# ART-02 — revisione Codex della PR #5

Testa esaminata **b104b3c**, base f881e7d. Letti ART_PASS_02, domande in
PEER_REVIEW e HANDOFF; letti i cinque commit e i file di scena/pipeline.
**Esito: modifiche richieste. Nessun merge della PR.**

## Risultati riprodotti e giudizio visivo

166 test e build passati. Studio prima/dopo ripetuto nei tre formati a camera,
posa e tempo fissati. Budget sei classi DPR1 ripetuto: tutti i valori coincidono
con la consegna. Anche i conteggi dello studio coincidono:

| Vista di gioco desktop | Base | ART-02 |
| --- | --- | --- |
| Draw call, ombre comprese | 168 | 180 |
| Triangoli del fotogramma, ombre comprese | 363.815 | 460.363 |
| Stima mappe dei materiali della scena | 9,25 MiB | 18,92 MiB |
| Byte home→demo, Combattente | 2.597.664 | 3.270.587 |

Audit manifest: 16 file, 670.596 byte, tutti gli hash e le lunghezze coincidono.
Non ho riscaricato le sorgenti: questo verifica i file consegnati rispetto al
manifest, non certifica diritti o gli hash remoti.

Il sentiero e il cerchio organizzano meglio lo spazio: è una gerarchia di forme,
non soltanto due grigi. La muratura regge meglio il dettaglio ravvicinato. Il
salto percepito dalla camera di gioco resta limitato: strada ancora molto ampia,
sagome di edifici piatte e Custode invariato. Non considero raggiunto il concept
né approvata la grafica finale. La nuova felce ha un difetto attuale, sotto.

## R1 — alpha del fogliame mancante (da correggere)

fern.gltf dichiara alphaMode MASK e alphaCutoff 0,5. La baseColorTexture punta a
fern_color.jpg, RGB: nessun canale alfa; baseColorFactor alpha = 1. Il materiale
non può ritagliare gli spazi fra le foglie. Non è solo una futura camera vicina:
le lamine piene sono già visibili nella vista materiali attuale, anche nella mia
cattura indipendente after-desktop-materiali.png.

prepare-art-pass02.py:68 converte comunque la mappa in RGB/JPEG. Non attribuisco
la perdita a una sorgente PNG non verificata: il problema certo è che il pacchetto
finale non fornisce alcuna alpha alla modalità MASK.

Richiesta: recuperare la maschera CC0 corretta e fornire un'immagine colore+alpha
valida (per esempio PNG RGBA), oppure un'altra pipeline glTF supportata con alpha
reale. Allineare URI, mimeType, manifest, hash e riproduzione. Non basta mantenere
la scritta MASK o disattivarla per far sparire il rilievo. Verificare che esistano
pixel opachi e trasparenti, silhouette ravvicinata/di gioco e ombre ritagliate;
ricontrollare il budget dopo la correzione. Nessun acquisto necessario.

## R2 — atmosfera non ripristinata fra aree (da correggere)

Sonda sulla vera API createArtWorld/setArea, nessun hook nel gioco. La base è
estratta da f881e7d, poi confrontata con la testa PR. Risultati:

| | Ingresso piazza | Dopo Giardino→piazza | Dopo Cave→piazza |
| --- | --- | --- | --- |
| Base | #253346 | #253346 | #253346 |
| ART-02 | #22314a | #253346 | #253346 |

Il nuovo colore iniziale in environment.js:90 non coincide con quello che
setArea ripristina a riga 265. La stessa piazza cambia aspetto in base al viaggio.
È una regressione nuova e riproducibile, distinta dal gusto sulla nebbia.

Inoltre densità 0,022, ambiente e luci nuovi sono condivisi: Giardino e Cave
ricevono la nuova illuminazione della piazza. I loro file non modificati non
implicano resa invariata. La sonda registra anche i valori prima/dopo: per
esempio chiave 1,45→2,1, riempimento 0,45→0,32 e densità 0,018→0,022.

Richiesta: configurazione coerente per area, ripristinata anche al ritorno;
limitare il nuovo assetto alla piazza e conservare quello precedente nelle altre
aree per questo incarico. Se si vuole ridisegnare anche le altre aree, proporre
separatamente confronti e motivazione. Testare i due giri completi e i valori
attesi nelle aree, non limitarsi a verificare il solo ingresso. environment.js
è già nel tuo perimetro: nessuna modifica a runtime o regole delle missioni.

## Risposte alle tre domande di Tonino

1. **Gerarchia:** sì a sentiero e cerchio. Il risultato non è ancora una scena
   convincente quanto il riferimento. Conservare la scala; non coprire il limite
   di sagome e composizione con altra grana, bagliori o contrasto.
2. **Memoria / KTX2:** non impongo adesso una migrazione. I 18,92 MiB stimano le
   mappe campionate sui materiali, non l'intera memoria GPU: ambiente PMREM,
   render target, ombre e altri buffer non rientrano in quella somma. Accetto il
   costo come candidato per la demo entro il budget di download, da verificare
   su dispositivo. Prima correggere R1/R2; poi eventuale confronto KTX2 con
   memoria, qualità delle normali/alpha, loader/transcoder locali e costo totale
   del decoder incluso. Un JPEG più piccolo non riduce da solo la memoria GPU.
3. **Felce:** R1 è da correggere qui, non rinviato ad ART-03.

## Altri limiti e prossimo perimetro

L'etichetta del Custode a x −42 sul telefono è preesistente e dichiarata: non
blocca questa PR come nuova regressione. Resta un difetto HUD da trattare
separatamente: nessun permesso implicito a modificare runtime nella PR ART-02.
Non considero tutti i segnali perfetti solo perché il checker principale passa.

Per ART-03 preferisco **prima il Custode, sagoma e volumi**, non solo una mano di
materiali sullo stesso corpo a blocchi. Un solo nemico, fermo e durante carica,
impatto/recupero, con confronto reale alle stesse camere e limiti di costo.
Il volto di Daria è un incarico distinto: non aprire entrambi finché ART-02 non
è integrato. Proposta di direzione, non avvio dell'incarico o approvazione artistica.

## Riproduzione ed evidenze

Le prove sono in docs/assets/art-pass-02-codex. Il ramo
codex/review-art-pass-02 contiene sorgenti PR e documenti; la base condivisa
contiene solo i documenti della review finché non viene accettata la PR.

```sh
npm test
npm run build
node scripts/art-pass-02-review.mjs test-results/art02-review
MYTHWOOD_CHROMIUM_PATH=/usr/bin/chromium node scripts/loading-budget-check.mjs test-results/art02-budget
node docs/assets/art-pass-02-codex/world-cycle.mjs
```

La sonda del giro aree prepara da sola la base e usa WebGL a 2×2 per leggere la
configurazione, senza misurare fps o produrre un playtest. Le immagini dello
studio sono state invece renderizzate nelle risoluzioni dichiarate.

Cinque regressioni browser e catture COMBAT-01 sono esiti riportati da Tonino:
non li dichiaro ripetuti indipendentemente in questa review, prima delle due
correzioni richieste. DPR2 non ripetuto, nessun telefono reale o prova con persone.
Build con il warning chunk >500 kB già noto. Nessun main/deploy/social/spesa/
Supabase/risveglio, nessuna modifica sovrapposta ai file assegnati a Tonino.
