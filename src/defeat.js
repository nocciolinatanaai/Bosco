const hints = Object.freeze({
  fracture: 'Frattura fissa il punto dove eri: esci dal cerchio prima dell’impatto, poi rientra durante il recupero.',
  nova: 'Onda parte dal Custode: allontanati oltre il cerchio, oppure interrompila con lo scatto evoluto da vicino.',
  strike: 'L’eco fissa il tuo punto mentre carica: spostati e colpisci quando ha finito.',
});
export function defeatMessage(state) {
  const hit = state.lastDamage;
  if (!hit) return 'Osserva il cerchio di carica, esci dall’area e colpisci durante il recupero. Puoi riprovare o cambiare classe.';
  return `L’ultimo colpo di ${hit.name} ti ha tolto ${hit.amount} PV. ${hints[hit.kind] || 'Aspetta la preparazione del nemico e cerca l’apertura dopo il suo attacco.'}`;
}
