# Mythwood — teaser cinematografico «Ricordali»

Il proprietario ha richiesto un trailer anche in stile film: il mandato corrente
sostituisce il precedente brief orientato al gameplay. Il vecchio kit resta
ritirato; i suoi script non sono stati riattivati.

## Montaggio

24 secondi, verticale 1080×1920, 30 fps. Cinque sequenze, quattro scene originali:

| Tempo | Scena | Testo |
| --- | --- | --- |
| 0–5 s | Città invasa dalle radici, Daria davanti alla Frattura | Il mondo li ha dimenticati. |
| 5–9,5 s | Liora con la bussola, ricordo in dissoluzione | Tu puoi ancora ricordarli. |
| 9,5–14 s | Daria tende l'arco risonante | Il ricordo diventa potere. |
| 14–19 s | Custode colossale davanti al varco | Chi riporterai alla luce? |
| 19–24 s | Rovine oscurate, marchio e invito | Mythwood — Nessuno scompare finché qualcuno ricorda. Segui lo sviluppo. |

Sono illustrazioni AI animate con camera, particelle e dissolvenze, non un film
con personaggi animati fotogramma per fotogramma. La resa illustra la direzione
artistica desiderata; non rappresenta la grafica corrente della build.
Etichetta «Concept trailer» nelle scene e «Concept cinematico · Immagini AI»
in chiusura. Nessuna data di uscita, multiplayer o mappa già disponibile promessi.

## Produzione ripetibile

`python scripts/render-cinematic-trailer.py` richiede Python con numpy, ffmpeg
con libx264/drawtext/zoompan/xfade e font Liberation Serif/DejaVu Sans nei percorsi
indicati nello script. Non installa dipendenze né contatta servizi. Destinazione
locale predefinita `/workspace/artifacts/mythwood-trailer/`; sorgenti PNG nel repo.
Cinque segmenti intermedi e partitura WAV permettono ulteriori revisioni.

Musica originale sintetizzata: accordi in re minore, motivo di campane, archi
additivi, impatti e risalite. Nessun brano commerciale, sample esterno o voce
clonata. Seed ripetibile. Normalizzazione EBU loudnorm con obiettivo -14 LUFS,
true peak -2 dBTP; verificare il risultato AAC nel rapporto media allegato.
Audio AAC stereo 48 kHz/192 kbit, video H.264 yuv420p, MP4 faststart.

Le immagini sono state generate con image_gen dai concept Mythwood già nel
repository, senza richiedere lo stile di artisti o franchise. Font di sistema
Liberation/DejaVu; nessun font file incorporato nei sorgenti. Provenienza e hash
in `docs/assets/trailers/SOURCES.json`. Le immagini originali restano intatte.

Consegna prevista in docs/assets/trailers/: MP4, copertina, rapporto tecnico.
La caption dedicata è CINEMATIC_CAPTION.md. Pubblicazione a cura del proprietario;
nessun contenuto social inviato da questa sessione.
