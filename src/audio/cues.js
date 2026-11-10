// Original procedural sketches. No recordings, downloaded music or voice clones.
const tone = (frequency, end, duration, gain, delay = 0, wave = 'sine') => ({ frequency, end, duration, gain, delay, wave });
const noise = (frequency, end, duration, gain, delay = 0) => ({ noise: true, frequency, end, duration, gain, delay });
export const CUES = Object.freeze(Object.fromEntries(Object.entries({
  slash: [noise(3400, 600, .12, .15), tone(180, 70, .1, .09)],
  arrow: [noise(5100, 1400, .1, .12), tone(340, 160, .07, .035)],
  cast: [tone(420, 690, .18, .065), noise(2400, 4700, .16, .055)],
  impact: [noise(1700, 180, .11, .14), tone(110, 45, .14, .16)],
  critical: [noise(3600, 260, .16, .19), tone(170, 50, .18, .2)],
  hurt: [tone(150, 58, .2, .15), noise(950, 140, .16, .12)],
  guard: [tone(280, 150, .18, .08, 0, 'triangle'), noise(3000, 900, .08, .08)],
  dash: [noise(700, 3500, .16, .09)],
  echo: [tone(165, 330, .22, .09), tone(247, 494, .25, .05, .035)],
  warning: [tone(210, 190, .1, .07)],
  fracture: [tone(180, 140, .18, .12), tone(180, 140, .18, .12, .25)],
  nova: [tone(65, 200, .65, .1), tone(230, 310, .4, .06, .18), noise(400, 1500, .5, .045)],
  shock: [noise(1800, 130, .3, .17), tone(85, 35, .32, .17)],
  heal: [tone(440, 440, .35, .045), tone(554, 554, .35, .035, .07), tone(660, 660, .4, .035, .14)],
  evolve: [tone(220, 220, .3, .06), tone(330, 330, .35, .06, .12), tone(440, 440, .4, .05, .24), tone(660, 660, .5, .04, .36)],
  victory: [tone(330, 330, .35, .05), tone(440, 440, .4, .05, .15), tone(660, 660, .5, .045, .3)],
  defeat: [tone(170, 55, .7, .1), noise(650, 100, .4, .05)],
}).map(([key, layers]) => [key, Object.freeze(layers.map(Object.freeze))])));

export function cueForEvent(event) {
  switch (event.type) {
    case 'strike': return event.style === 'bow' ? 'arrow' : ['magic', 'light'].includes(event.style) ? 'cast' : 'slash';
    case 'hit': return event.critical ? 'critical' : 'impact';
    case 'hurt': return event.guarded ? 'guard' : 'hurt';
    case 'dodge': return 'dash';
    case 'echo-burst': case 'trail-progress': case 'garden-progress': return 'echo';
    case 'heal': return event.amount > 0 ? 'heal' : null;
    case 'enemy-windup': return !event.boss ? 'warning' : event.kind === 'nova' ? 'nova' : 'fracture';
    case 'enemy-impact': return 'shock';
    case 'evolved': return 'evolve';
    case 'defeated': return 'defeat';
    default: return null;
  }
}
