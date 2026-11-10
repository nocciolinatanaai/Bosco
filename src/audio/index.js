import { CUES, cueForEvent } from './cues.js';
import { scheduleCue, createMix } from './synthesis.js';

export function createCombatAudio({ contextFactory = () => {
  const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
  return Context ? new Context() : null;
}, onStatus = () => {} } = {}) {
  let context = null, master = null, input = null, enabled = false, paused = true, volume = .35, failure = null, disposed = false;
  const voices = new Set(), last = new Map();
  const status = () => ({ enabled, paused, volume, voices: voices.size,
    state: failure || (!enabled ? 'off' : paused ? 'paused' : volume === 0 ? 'muted' : context?.state === 'running' ? 'on' : 'waiting') });
  const notify = () => onStatus(status());
  function stop() { for (const voice of [...voices]) voice.stop(); voices.clear(); last.clear(); }
  function sync() {
    if (!context || disposed) { notify(); return Promise.resolve(); }
    try {
      if (master) master.gain.setTargetAtTime(enabled ? volume : 0, context.currentTime, .015);
      // Invoke inside the input handler; Safari may require the user gesture.
      const operation = enabled && !paused ? context.resume() : context.suspend();
      return Promise.resolve(operation).then(notify, () => { failure = 'unavailable'; stop(); notify(); });
    } catch { failure = 'unavailable'; stop(); notify(); return Promise.resolve(); }
  }
  function initialize() {
    if (context || disposed) return;
    try {
      context = contextFactory();
      if (!context) { failure = 'unsupported'; return; }
      ({ input, master } = createMix(context, volume));
      context.addEventListener('statechange', notify);
    } catch {
      failure = 'unavailable'; const broken = context; context = null; master = null; input = null;
      void Promise.resolve(broken?.close?.()).catch(() => {});
    }
  }
  return {
    status,
    setEnabled(value) {
      if (disposed) return Promise.resolve();
      enabled = Boolean(value); failure = null;
      if (enabled) initialize(); else stop();
      return sync();
    },
    setPaused(value) { paused = Boolean(value); if (paused) stop(); return sync(); },
    setVolume(value) {
      if (disposed || !Number.isFinite(value)) return;
      volume = Math.min(1, Math.max(0, value));
      if (master) master.gain.setTargetAtTime(enabled ? volume : 0, context.currentTime, .015);
      if (volume === 0) stop(); notify();
    },
    play(name) {
      if (!enabled || paused || disposed || failure || !context || context.state !== 'running' || volume === 0 || !CUES[name]) return false;
      const now = context.currentTime;
      if (now - (last.get(name) ?? -Infinity) < .06) return false;
      last.set(name, now);
      while (voices.size >= 12) voices.values().next().value.stop();
      let voice;
      voice = scheduleCue(context, input, CUES[name], () => voices.delete(voice)); voices.add(voice);
      return true;
    },
    event(event) { const cue = cueForEvent(event); return cue ? this.play(cue) : false; },
    stop,
    async dispose() {
      disposed = true; enabled = false; stop();
      if (context) { context.removeEventListener('statechange', notify); master?.disconnect(); input?.disconnect(); await context.close().catch(() => {}); }
      notify();
    },
  };
}
