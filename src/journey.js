// Guidance follows actual progress; it does not lock controls or require a class.
export function journey(s) {
  const echoes = s.enemies.filter(e => !e.boss), remaining = echoes.filter(e => e.hp > 0).length;
  if (s.cleared && s.trail.complete) return { id: 'complete', title: 'La mappa ricorda', hint: 'Tre segni, una firma: Cartiglio. Il ricordo ora indica una strada.' };
  if (s.cleared) return { id: 'trail', title: 'La strada che manca', hint: `${s.trail.found.length} / 3 tracce. Raggiungi il segno luminoso e scatta vicino: la risonanza ricostruirà il percorso.` };
  if (s.evolved) return { id: 'guardian', title: 'Spezza il silenzio', hint: 'Il tuo scatto ora colpisce i nemici vicini. Provalo contro il Custode.' };
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
  complete: { title: 'Qualcuno ci ha nascosti.', body: 'Il Custode si spezza. Non custodiva un tesoro: impediva alla voce di uscire. «Altri ricordano», sussurra Liora. Sul frammento compare il simbolo di una gilda cancellata dalle mappe. Il sentiero a est è la prossima pista. Hai liberato una voce; la squadra è ancora da trovare.', button: 'Segui il sentiero' },
});
