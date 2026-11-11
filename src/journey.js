// Guidance follows actual progress; it does not lock controls or require a class.
export function journey(s) {
  if (s.caves?.step > 0) {
    if (s.caves.step === 3) return { id: 'caves-done', title: 'Due strade nella stessa lente', hint: 'Liora distingue la rotta originale da quella corretta. La firma conduce all’Archivio Cartiglio. Le cave restano esplorabili.' };
    return { id: 'caves-' + s.caves.step + '-' + s.area, title: s.caves.step === 1 ? 'Il banco del cartografo' : 'Una lente per Liora', hint: s.area !== 'caves' ? 'La ricerca è conservata. Torna alle cave per continuare.' : s.caves.step === 1 ? 'Recupera la lente in fondo alle cave. Il guardiano prepara un rintocco circolare: esci dal cerchio o schiva l’impatto.' : 'Lente con te. Torna alla soglia e riportala a Liora.' };
  }
  if (s.garden?.step > 0) {
    if (s.garden.step === 4) return { id: 'garden-done', title: 'Una rotta restituita', hint: 'Il segnale è tornato al sentiero. La bussola punta dentro la frattura: qualcuno corregge ancora la rotta.' };
    if (s.area !== 'garden') return { id: 'garden-return', title: 'Il giardino ti aspetta', hint: 'Il tuo obiettivo resta conservato. Attraversa il passaggio per continuare.' };
    if (s.garden.step === 1) return { id: 'garden-compass', title: 'La bussola dei dispersi', hint: 'Raggiungi il piedistallo. Puoi aggirare la sentinella o interromperla; le colonne fermano la sua linea.' };
    if (s.garden.step === 2) return { id: 'garden-signal', title: 'Porta fuori un segnale', hint: 'Bussola con te. Torna all’arco di ingresso e accendi il segnale con la risonanza.' };
    return { id: 'garden-leave', title: 'Riporta la rotta', hint: 'Il segnale è acceso. Attraversa l’arco per riportarlo al sentiero.' };
  }
  const echoes = s.enemies.filter(e => !e.boss), remaining = echoes.filter(e => e.hp > 0).length;
  if (s.cleared && s.trail.complete) return { id: 'complete', title: 'La mappa ricorda', hint: 'Tre segni, una firma: Cartiglio. Il ricordo ora indica una strada.' };
  if (s.cleared) return { id: 'trail', title: 'La strada che manca', hint: `${s.trail.found.length} / 3 tracce. Raggiungi il segno luminoso e scatta vicino: la risonanza ricostruirà il percorso.` };
  if (s.evolved) return { id: 'guardian', title: 'Spezza il silenzio', hint: s.role.id === 'ranger' ? 'Schiva all’ultimo istante: avrai 4 secondi per rispondere con l’abilità e due frecce.' : 'Il tuo scatto ora colpisce i nemici vicini. Provalo contro il Custode.' };
  if (remaining === 0) return { id: 'resonance', title: 'Ascolta il ricordo', hint: 'Risveglia l’eco: lo scatto diventerà anche un contrattacco.' };
  if (remaining < echoes.length) return { id: 'echoes', title: 'Libera l’ultimo eco', hint: 'Aspetta la carica, esci dal cerchio e sfrutta il recupero.' };
  if (s.lesson.distance < 1 && !s.lesson.hit) return { id: 'move', title: 'Trova gli echi', hint: 'Muoviti con WASD, joystick o toccando il terreno.' };
  if (!s.lesson.hit) return { id: 'attack', title: 'Rompi il primo sigillo', hint: 'Avvicinati a un eco. Premi Attacco o J; puoi tenerlo premuto.' };
  if (!s.lesson.dodged) return { id: 'dodge', title: 'Non restare nel cerchio', hint: 'Scatta con Spazio o Scatto mentre il nemico prepara il colpo.' };
  return { id: 'opening', title: 'Trova l’apertura', hint: 'Dopo l’impatto il nemico recupera: colpisci ora, oppure usa l’abilità.' };
}

export const MEMORY = Object.freeze({
  resonance: { title: 'Non eravamo perduti.', body: 'Una voce attraversa il sigillo: «Mi chiamo Liora. Ci hanno ordinato di lasciare indietro chi sentiva le voci. Io sono rimasta.» Nel frammento riconosci un passo: arretrare senza abbandonare nessuno. Porta con sé un sigillo inciso con un nome cancellato. Puoi accordarlo alla Custodia di chi ritorna o all’Impeto di chi apre la strada. Puoi farlo tuo. Lo scatto lascerà un impulso che colpisce e interrompe i nemici vicini al punto di partenza.', button: 'Accogli il ricordo' },
  trail: { title: 'La mappa ha un nome.', body: 'I tre segni ricompongono una firma: Cartiglio, la gilda che certificava le mappe. Perché il suo marchio compare su un sentiero che ufficialmente non esiste? Liora riconosce i vecchi punti di raccolta: qualcuno voleva che una squadra trovasse l’uscita. Hai ritrovato una pista, non ancora i compagni.', button: 'Conserva la pista' },
  garden: { title: 'Qualcuno cambia ancora le mappe.', body: 'La bussola smette di tremare quando attraversi la soglia. Poi l’ago si volta, lontano dall’uscita. «Questa non è una rotta di ritorno», dice Liora. «Qualcuno la sta correggendo dall’interno.» Hai riportato un segnale e aperto un passaggio. Non sai ancora chi stia rispondendo.', button: 'Conserva il segnale' },
  caves: { title: 'Non erano dispersi.', body: 'Liora posa la lente sulla bussola. Due strade occupano lo stesso spazio. «La squadra seguiva la rotta giusta. Qualcuno ha spostato l’uscita dopo il nostro passaggio.» Sul bordo riconosce un’incisione: Archivio Cartiglio, revisione sette. Il nome cancellato dal sigillo compare sotto una correzione. Hai recuperato una prova; non sai ancora chi abbia firmato l’ordine.', button: 'Conserva la prova' },
  complete: { title: 'Qualcuno ci ha nascosti.', body: 'Il Custode si spezza. Non custodiva un tesoro: impediva alla voce di uscire. «Altri ricordano», sussurra Liora. Sul frammento compare il simbolo di una gilda cancellata dalle mappe. Il sentiero a est è la prossima pista. Hai liberato una voce; la squadra è ancora da trovare.', button: 'Segui il sentiero' },
});

// Narrative detail follows the milestone instead of repeating an obsolete task.
export function storyObjective(s) {
  if (s.caves.step === 3) return 'La lente ha rivelato una rotta sovrapposta. Liora riconosce la firma dell’Archivio Cartiglio; la prova è conservata.';
  if (s.caves.step === 2) return 'La lente è con te. Riportala a Liora attraverso la soglia delle cave.';
  if (s.caves.step === 1) return 'La lente conserva due rotte sovrapposte. Recuperala al banco del cartografo: Liora potrà distinguere la strada dalla correzione.';
  if (s.garden.step === 4) return 'Il segnale è stato riportato. La bussola indica le Cave dei Sussurri, dove cercare una prova della rotta corretta.';
  if (s.garden.step > 0) return 'La bussola è uno strumento di spedizione. Riporta il segnale: Liora potrà capire se la rotta viene ancora corretta.';
  if (s.trail.complete) return 'La firma Cartiglio non doveva trovarsi qui. Liora ha riconosciuto una strada verso i compagni.';
  if (s.cleared) return 'Il Custode tratteneva la voce di Liora. Una gilda cancellata dalle mappe è la prossima pista.';
  if (s.evolved) return 'Il ricordo di Liora è con te. Il Custode non può più nasconderlo.';
  return 'Due echi trattengono il frammento di una compagna scomparsa. Il Custode veglia sul sigillo.';
}
