const hints = Object.freeze({
  beam: 'La sentinella fissa una linea: spostati di lato o riparati dietro una colonna prima dell’impatto.',
  fracture: 'Frattura fissa il punto dove eri: esci dal cerchio e contrattacca nel recupero. «Non interrompibile»: schiva, lo scatto non ferma il colpo.',
  nova: 'Onda parte dal Custode: allontanati oltre il cerchio. Lo scatto evoluto da vicino la interrompe solo quando non compare «Non interrompibile».',
  strike: 'L’eco fissa il tuo punto mentre carica: spostati e colpisci quando ha finito.',
});
export function defeatMessage(state) {
  const hit = state.lastDamage;
  if (!hit) return 'Osserva il cerchio di carica, esci dall’area e colpisci durante il recupero. Puoi riprovare o cambiare classe.';
  return `L’ultimo colpo di ${hit.name} ti ha tolto ${hit.amount} PV. ${hints[hit.kind] || 'Aspetta la preparazione del nemico e cerca l’apertura dopo il suo attacco.'}`;
}
