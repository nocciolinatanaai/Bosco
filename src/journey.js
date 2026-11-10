// Guidance follows actual progress; it does not lock controls or require a class.
export function journey(s) {
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
  resonance: { title: 'Non eravamo perduti.', body: 'Una voce attraversa il sigillo: «Mi chiamo Liora. Ci hanno ordinato di lasciare indietro chi sentiva le voci. Io sono rimasta.» Nel frammento riconosci un passo: arretrare senza abbandonare nessuno. Puoi farlo tuo. Lo scatto lascerà un impulso che colpisce e interrompe i nemici vicini al punto di partenza.', button: 'Accogli il ricordo' },
  trail: { title: 'La mappa ha un nome.', body: 'I tre segni ricompongono una firma: Cartiglio, la gilda che certificava le mappe. Perché il suo marchio compare su un sentiero che ufficialmente non esiste? Liora riconosce i vecchi punti di raccolta: qualcuno voleva che una squadra trovasse l’uscita. Hai ritrovato una pista, non ancora i compagni.', button: 'Conserva la pista' },
  garden: { title: 'Qualcuno cambia ancora le mappe.', body: 'La bussola smette di tremare quando attraversi la soglia. Poi l’ago si volta, lontano dall’uscita. «Questa non è una rotta di ritorno», dice Liora. «Qualcuno la sta correggendo dall’interno.» Hai riportato un segnale e aperto un passaggio. Non sai ancora chi stia rispondendo.', button: 'Conserva il segnale' },
  complete: { title: 'Qualcuno ci ha nascosti.', body: 'Il Custode si spezza. Non custodiva un tesoro: impediva alla voce di uscire. «Altri ricordano», sussurra Liora. Sul frammento compare il simbolo di una gilda cancellata dalle mappe. Il sentiero a est è la prossima pista. Hai liberato una voce; la squadra è ancora da trovare.', button: 'Segui il sentiero' },
});
