# Combattente — proposta di rifacimento (pass01, da approvare)

**Stato: proposta.** Non è stato modificato nessun file del Combattente.
Si parte solo dopo che la consegna di Daria è stata rivista (procedere un
personaggio alla volta). Tavola di riferimento: `docs/assets/character-sheets/fighter.png`.
Base attuale: `public/models/characters/fighter.glb` (System G6 CC0, stesso corpo
femminile e stessa testa di Daria, `medium_armor`, sei clip).

## Il rischio da evitare: una Daria ricolorata

Fighter e Daria condividono corpo, testa e scheletro CC0. Se applicassi lo stesso
generatore cambiando colori e arma, otterrei proprio ciò che il proprietario
esclude. Per questo le differenze devono stare in silhouette, volume, postura e
movimento, e devono essere misurabili.

| | Daria (Ranger) | Combattente (dalla tavola) |
| --- | --- | --- |
| Silhouette | snella, mantellina asimmetrica e treccia | **spalle larghe e piene**: spallaccio a lamine stratificate sulla spalla sinistra, corazza, niente mantello |
| Volume | tessuti aderenti | **corazza sopra un gambesone imbottito** arancio-ruggine a rombi, colletto alto, maniche trapuntate |
| Vita/gambe | giacca corta | **lamine (fiancali) sopra le falde del gambesone**, fascia di stoffa chiara pendente, pantaloni marroni larghi, stivali alti con cinghie |
| Testa | treccia scura, occhi nocciola-verdi, lentiggini | **capelli ramati mossi raccolti in una coda bassa**, occhi ambra, **cicatrice sullo zigomo sinistro**, mascella più marcata |
| Equipaggiamento | arco, faretra | **spada lunga** tenuta di punta verso il basso, bracciali d'acciaio, borsa e rotolo sul fianco/schiena |
| Postura | eretta, leggera | **peso in avanti, piedi più larghi, baricentro più basso**, spada in guardia bassa |
| Movimenti | arco: tensione/rilascio | **mischia**: clip CC0 `channel/cast_main_hand_melee(_2)`, contatto della lama al momento del colpo |

## Piano tecnico (stesso rigore di Daria, nuovi strumenti dove servono)

1. `scripts/prepare-fighter-pass01.py` (Blender 4.3, riproducibile, stesso SHA in due esecuzioni) a partire da `fighter.glb`:
   - gambesone come guscio del corpo con i pesi del corpo, rombi trapuntati nella texture generata e un leggero rilievo geometrico;
   - corazza, spallaccio e bracciali come gusci più distanti, con pesi rigidi su `torso`/`arm_upper`;
   - **fiancali divise per gamba fin dall'inizio**, misurate in corsa: la lezione delle falde di Daria;
   - parti del corpo coperte eliminate;
   - volto ridipinto (ambra, cicatrice, sopracciglia folte, pelle olivastra) e mascella rimodellata;
   - coda di cavallo con pesi testa→collo e capelli ramati.
2. Spalle visivamente più larghe con volumi di abito e corazza, non cambiando lo
   scheletro (clip e test restano validi).
3. Postura propria come livello di animazione additivo nel rendering: bacino più
   basso, piedi più larghi, braccio della spada in guardia. Va misurato in modo
   che non sposti i piedi rispetto al suolo.
4. Spada impugnata dall'osso `wep_pos_R`, con la lama allineata all'avambraccio.
5. Verifica:
   - una sonda di combattimento per la mischia, come `scripts/daria-combat-check.mjs`;
   - penetrazione per clip, come `scripts/daria-clip-penetration.py`;
   - studio prima/dopo con la stessa camera e la stessa luce.

## Criteri osservabili di accettazione

- Penetrazione di abiti e capelli nel corpo, per clip, **non peggiore** della base attuale in nessuna clip, e migliore nella media.
- Presa: distanza fra `wep_pos_R` e l'impugnatura < 1 cm in tutti i fotogrammi.
- Contatto: nel fotogramma del colpo la punta della lama è entro il raggio d'attacco del nemico bersaglio, nella direzione del colpo (< 15°).
- Piedi: scivolamento del piede d'appoggio in corsa con mediana < 1,5 m/s, come Daria.
- Distinzione da Daria, misurata alla stessa camera:
  - larghezza delle spalle in silhouette frontale ≥ +15% rispetto a Daria;
  - postura più bassa e piedi più larghi **solo** se i piedi restano appoggiati (scivolamento e distanza dal suolo misurati) e le hitbox non cambiano;
  - materiali diversi (metallo, imbottitura trapuntata), con la palette ruggine della tavola mantenuta. Obiezione di Codex accolta: niente divieto arbitrario sui colori caldi.
- Budget: < 20.000 triangoli, GLB < 1,5 MB.
- Test, build, controllo delle 30 pose del roster ed episodio completo desktop/mobile passati.

## Limiti dichiarati in anticipo

Le clip sono quelle CC0: niente motion capture e niente nuove animazioni scolpite.
Il metallo della tavola è semi-realistico; nel gioco sarà PBR semplice, senza
graffi in rilievo. La testa resta low-poly.
