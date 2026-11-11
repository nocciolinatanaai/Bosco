import { validAttunement } from './artifacts.js';
import { CLASSES, createSession, evolve, drainEvents } from './game.js';
import { enterGarden, GARDEN_ENTRY } from './garden.js';
import { MEMORY_TRACES } from './trail.js';

export const CHECKPOINT_KEY = 'mythwood.checkpoint.v1';
const stages = new Set(['arrival', 'awakened', 'guardian']);
export function validateCheckpoint(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const keys = Object.keys(value).sort().join(',');
  if (![1, 2, 3].includes(value.version) || keys !== (value.version === 1 ? 'autoSave,role,stage,traces,version' : value.version===2?'autoSave,garden,role,stage,traces,version':'attunement,autoSave,garden,role,stage,traces,version')) return null;
  if (typeof value.autoSave !== 'boolean' || !CLASSES.some(r => r.id === value.role) || !stages.has(value.stage)) return null;
  if (!Number.isInteger(value.traces) || value.traces < 0 || value.traces > MEMORY_TRACES.length || (value.stage !== 'guardian' && value.traces !== 0)) return null;
  const garden = value.version === 1 ? { step: 0, area: 'plaza', sentryDefeated: false } : value.garden;
  if (!garden || typeof garden !== 'object' || Array.isArray(garden) || Object.keys(garden).sort().join(',') !== 'area,sentryDefeated,step') return null;
  if (!Number.isInteger(garden.step) || garden.step < 0 || garden.step > 4 || !['plaza', 'garden'].includes(garden.area) || typeof garden.sentryDefeated !== 'boolean') return null;
  if ((garden.step > 0 && (value.stage !== 'guardian' || value.traces !== 3)) ||
      (garden.step === 0 && (garden.area !== 'plaza' || garden.sentryDefeated)) || (garden.step === 3 && garden.area !== 'garden')) return null;
  const attunement=value.version===3?value.attunement:null;
  if(!validAttunement(attunement)||(attunement!==null&&value.stage==='arrival'))return null;
  return { version: 3, attunement, autoSave: value.autoSave, role: value.role, stage: value.stage, traces: value.traces,
    garden: { step: garden.step, area: garden.area, sentryDefeated: garden.sentryDefeated } };
}
export function checkpointFromSession(state, autoSave = true) {
  const stage = state.cleared && state.evolved ? 'guardian' : state.evolved ? 'awakened' : 'arrival';
  const found = state.trail.found, plazaEnemies = state.enemies.filter(e => e.area !== 'garden');
  if ((state.cleared && !state.evolved) || (state.evolved && plazaEnemies.some(e => !e.boss && e.hp > 0)) ||
      (state.cleared && plazaEnemies.some(e => e.hp > 0)) || !Array.isArray(found) || found.length > MEMORY_TRACES.length ||
      found.some((id, i) => id !== MEMORY_TRACES[i].id) || (found.length > 0 && stage !== 'guardian')) throw new Error('Tappa incoerente');
  const sentry = state.enemies.find(e => e.type === 'sentry');
  if (state.garden.step > 0 && (!sentry || (sentry.hp <= 0) !== state.garden.sentryDefeated)) throw new Error('Stato sentinella incoerente');
  const data = validateCheckpoint({ version: 3, attunement:state.artifact.attunement, autoSave, role: state.role.id, stage, traces: stage === 'guardian' ? found.length : 0,
    garden: { ...state.garden, area: state.area } });
  if (!data) throw new Error('Tappa non supportata');
  return data;
}
export function restoreCheckpoint(value) {
  const data = validateCheckpoint(value); if (!data) return null;
  const state = createSession(data.role);
  if (data.stage !== 'arrival') {
    for (const enemy of state.enemies.filter(e => !e.boss)) { enemy.hp = 0; enemy.phase = 'dead'; }
    evolve(state); state.resonanceReady = true; state.lesson = { distance: 1, hit: true, dodged: true };
  }
  if (data.stage === 'guardian') {
    const boss = state.enemies.find(e => e.boss); boss.hp = 0; boss.phase = 'dead'; state.cleared = true;
    state.trail.found = MEMORY_TRACES.slice(0, data.traces).map(t => t.id); state.trail.complete = data.traces === MEMORY_TRACES.length;
    const anchor = data.traces ? MEMORY_TRACES[data.traces - 1] : { x: 19, z: 7 };
    state.x = anchor.x; state.z = anchor.z;
    if (state.x > 24) { state.explored = true; state.region = 'Il sentiero delle memorie'; }
  }
  if (data.garden.step > 0) {
    state.x = 38.5; state.z = 7; state.garden.sentryDefeated = data.garden.sentryDefeated;
    enterGarden(state); state.garden.step = data.garden.step; state.area = data.garden.area;
    if (state.area === 'garden') { Object.assign(state, GARDEN_ENTRY); state.region = 'Giardino dei nomi'; }
    else { state.x = 38.5; state.z = 7; state.region = 'Il sentiero delle memorie'; }
  }
  state.artifact.attunement=data.attunement;
  drainEvents(state); state.sequence = 0;
  return state;
}
export function checkpointLabel(data) {
  if (!data) return '';
  const role = CLASSES.find(r => r.id === data.role)?.name || '';
  if (data.garden?.step) return `${role} · ${['', 'Giardino dei nomi', 'Bussola recuperata', 'Segnale acceso', 'Segnale riportato'][data.garden.step]}`;
  const stage = data.stage === 'arrival' ? 'Ingresso nella frattura' : data.stage === 'awakened' ? 'Ricordo di Liora accolto' : data.traces === 3 ? 'Pista Cartiglio ricostruita' : `Custode sconfitto · ${data.traces} / 3 tracce`;
  return `${role} · ${stage}`;
}
export function createCheckpointStore(storage = () => globalThis.localStorage) {
  let baseline;
  function readRaw() { return storage().getItem(CHECKPOINT_KEY); }
  return {
    load() {
      try {
        baseline = readRaw(); if (baseline === null) return { status: 'empty', checkpoint: null };
        if (typeof baseline !== 'string' || baseline.length > 1024) return { status: 'invalid', checkpoint: null };
        let data; try { data = validateCheckpoint(JSON.parse(baseline)); } catch { return { status: 'invalid', checkpoint: null }; }
        return { status: data ? 'ready' : 'invalid', checkpoint: data };
      } catch { return { status: 'unavailable', checkpoint: null }; }
    },
    save(state, overwrite = false) {
      try {
        const data = checkpointFromSession(state), current = readRaw();
        if (!overwrite && (baseline === undefined ? current !== null : current !== baseline)) return { status: 'conflict' };
        const raw = JSON.stringify(data); storage().setItem(CHECKPOINT_KEY, raw); baseline = raw;
        return { status: 'ready', checkpoint: data };
      } catch { return { status: 'unavailable' }; }
    },
    pause() {
      try {
        const raw = readRaw();
        if (baseline === undefined ? raw !== null : raw !== baseline) return { status: 'conflict' };
        if (raw === null) return { status: 'empty', checkpoint: null };
        const checkpoint = typeof raw === 'string' && raw.length <= 1024 ? validateCheckpoint(JSON.parse(raw)) : null;
        if (!checkpoint) return { status: 'invalid', checkpoint: null };
        checkpoint.autoSave = false; const next = JSON.stringify(checkpoint); storage().setItem(CHECKPOINT_KEY, next); baseline = next;
        return { status: 'ready', checkpoint };
      } catch { return { status: 'unavailable' }; }
    },
    clear() {
      try {
        const raw = readRaw(); if (baseline === undefined ? raw !== null : raw !== baseline) return { status: 'conflict' };
        storage().removeItem(CHECKPOINT_KEY); baseline = null; return { status: 'empty', checkpoint: null };
      } catch { return { status: 'unavailable' }; }
    },
  };
}
