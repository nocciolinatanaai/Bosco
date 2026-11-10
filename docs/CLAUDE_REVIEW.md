# Rientro di Tonino / Claude — revisione concreta

Preparato il 10 novembre 2026. Il proprietario prevede il rientro di Claude
l’11 novembre; disponibilità e accesso alla sua sessione non verificati.
Nessuna risposta o revisione di Tonino è stata ricevuta finora.

## Punto di partenza comune

Leggere AGENTS.md, HANDOFF.md, GAME_DESIGN.md, EPISODE_01.md, COMBAT_UX.md e
GUARDIAN.md. Usare la consegna più recente, non il vecchio caricatore Supabase.
Verificare i file ricevuti prima di sovrascrivere modifiche del proprio checkout.
Il pacchetto sorgente è un trasferimento di file, non un collegamento alle chat.
Non contiene credenziali social, un nuovo backend o una pubblicazione online.

La collaborazione funziona con un risultato scritto e una risposta verificabile:
proposta → obiezione motivata → prova piccola → decisione registrata. Non serve
che i due agenti concordino per forza; serve rendere esplicite ipotesi e prove.

## Prima risposta richiesta a Tonino

Scrivere docs/TONINO_REVIEW.md con identificativo della consegna ricevuta,
problemi osservati, file esaminati e risultati effettivi dei test. Distinguere
«ho giocato», «ho letto», «ho simulato» e «propongo». Non segnare un test come
superato perché il documento precedente lo riporta.

| Tema | Stato attuale / ipotesi Codex | Risposta utile richiesta |
|---|---|---|
| Scopo e storia | Recuperare chi è stato abbandonato; Liora e gilda cancellata sono proposte | Quale motivazione rende il giocatore curioso? Contesta un passaggio preciso e riscrivilo, senza espandere il mondo intero |
| Crescita | Lo scatto acquista danno/interruzione prima del boss | La trasformazione cambia la decisione o soltanto la forza? Proponi una variante realizzabile e una prova prima/dopo |
| Boss | Frattura mirata e Onda centrata, con segnali e recuperi distinti | Dove c’è ambiguità o una strategia dominante? Indica riproduzione e modifica minima |
| Classi | Sei kit, modello di base comune; sinergie online non presenti | Definisci un primo personaggio originale e una sinergia da provare in simulazione, senza promettere cooperativa già pronta |
| Grafica | Concept approvato; scena procedurale ancora distante | Scegli un miglioramento visivo circoscritto, con riferimento, provenienza/licenza, costo e artefatto confrontabile |
| Riferimenti | Ricerca comparativa RPG non ancora completata | Studia tre giochi pertinenti da fonti verificabili: osservazione concreta, adattamento sostenibile, cosa evitare. Nessuna metrica di successo inventata |
| Recupero legacy | Manca la ricostruzione completa Supabase | Dove sono riscatta, asset, scheduler, cron e procedure deploy? Fornisci sorgenti redatti e inventario, senza modificare produzione |

Il bypass NULL del login è stato riprodotto soltanto in isolamento; patch proposta
non applicata online. La vecchia diagnosi FOUND per credit_purchase era errata
ed è stata ritirata: non riproporre quella correzione. Leggere SECURITY.md.

## Ripartizione proposta, da registrare al rientro

1. Tonino svolge la revisione in TONINO_REVIEW.md e propone un incarico piccolo.
2. Codex risponde alle obiezioni con evidenze in PEER_REVIEW.md; poi si assegna
   un solo proprietario per ciascun gruppo di file.
3. Primo incarico consigliato a Tonino: riscrivere una scena/personaggio e
   proporre una silhouette con provenienza degli asset. Non toccare runtime,
   combat o produzione mentre un altro incarico li usa.
4. Prima di qualsiasi modifica concorrente, registrare ambito, file, stato di
   partenza e conclusione in COLLABORATION.md. Per ora consegne sequenziali.
5. Condividere una nuova cattura giocabile e i risultati; nessun video del kit
   ritirato deve essere riattivato o pubblicato.

Non aspettare una risposta inesistente: finché non arriva, il documento è una
richiesta di revisione e non prova un confronto avvenuto.
