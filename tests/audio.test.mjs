import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CUES, cueForEvent } from '../src/audio/cues.js';
import { createCombatAudio } from '../src/audio/index.js';

class Param {
  value = 0;
  setValueAtTime(v) { this.value = v; }
  exponentialRampToValueAtTime(v) { this.value = v; }
  linearRampToValueAtTime(v) { this.value = v; }
  setTargetAtTime(v) { this.value = v; }
}
class Node {
  gain = new Param(); frequency = new Param(); disconnected = false;
  threshold = new Param(); knee = new Param(); ratio = new Param(); attack = new Param(); release = new Param();
  connect() {} disconnect() { this.disconnected = true; }
  start() {} stop(when) { if (when === undefined) this.onended?.(); }
}
class Context {
  state = 'running'; currentTime = 0; sampleRate = 8000; destination = new Node(); nodes = [];
  node() { const n = new Node(); this.nodes.push(n); return n; }
  createGain() { return this.node(); } createDynamicsCompressor() { return this.node(); }
  createOscillator() { return this.node(); } createBufferSource() { return this.node(); } createBiquadFilter() { return this.node(); }
  createBuffer(_, count) { return { getChannelData: () => new Float32Array(count) }; }
  addEventListener() {} removeEventListener() {}
  async resume() { this.state = 'running'; } async suspend() { this.state = 'suspended'; } async close() { this.state = 'closed'; }
}

test('audio nasce soltanto dopo opt-in, suona solo attivo e si arresta in pausa', async () => {
  let created = 0; const context = new Context(); const audio = createCombatAudio({ contextFactory: () => { created++; return context; } });
  assert.equal(created, 0); assert.equal(audio.play('slash'), false);
  await audio.setEnabled(true); assert.equal(created, 1); assert.equal(audio.play('slash'), false);
  await audio.setPaused(false); assert.equal(audio.play('slash'), true); assert.equal(audio.status().voices, 1);
  await audio.setPaused(true); assert.equal(audio.status().voices, 0); assert.equal(context.state, 'suspended');
  assert.equal(audio.play('nova'), false); await audio.dispose();
});
test('mute e riattivazione ripristinano il volume; zero e valori invalidi non producono suono', async () => {
  const context = new Context(), audio = createCombatAudio({ contextFactory: () => context });
  await audio.setEnabled(true); await audio.setPaused(false); audio.setVolume(.6);
  await audio.setEnabled(false); assert.equal(audio.play('impact'), false);
  await audio.setEnabled(true); assert.equal(audio.status().volume, .6);
  assert.equal(context.nodes[1].gain.value, .6, 'volume master ripristinato dopo mute');
  audio.setVolume(0); assert.equal(audio.status().state, 'muted'); assert.equal(audio.play('impact'), false);
  audio.setVolume(NaN); assert.equal(audio.status().volume, 0);
  audio.setVolume(100); assert.equal(audio.status().volume, 1); audio.setVolume(-1); assert.equal(audio.status().volume, 0);
  await audio.dispose();
});
test('voci limitate, spam ravvicinato filtrato e nodi scollegati alla cancellazione', async () => {
  const context = new Context(), audio = createCombatAudio({ contextFactory: () => context });
  await audio.setEnabled(true); await audio.setPaused(false);
  assert.equal(audio.play('impact'), true); assert.equal(audio.play('impact'), false);
  for (const cue of Object.keys(CUES)) audio.play(cue);
  assert.equal(audio.status().voices, 12); audio.stop(); assert.equal(audio.status().voices, 0);
  assert.ok(context.nodes.slice(2).every(n => n.disconnected));
  await audio.dispose(); assert.equal(context.state, 'closed'); assert.equal(audio.play('slash'), false);
});
test('audio assente o resume rifiutato non generano eccezioni al chiamante', async () => {
  const unsupported = createCombatAudio({ contextFactory: () => null });
  await unsupported.setEnabled(true); await unsupported.setPaused(false); assert.equal(unsupported.status().state, 'unsupported');
  assert.equal(unsupported.play('slash'), false);
  const context = new Context(); context.resume = () => Promise.reject(new Error('NotAllowedError'));
  const blocked = createCombatAudio({ contextFactory: () => context }); await blocked.setEnabled(true); await blocked.setPaused(false);
  assert.equal(blocked.status().state, 'unavailable'); assert.equal(blocked.play('impact'), false);
  await blocked.dispose();
});
test('suoni seguono impatti ed eventi, con avvisi diversi per le due cariche', () => {
  assert.equal(cueForEvent({ type: 'action-start' }), null);
  assert.equal(cueForEvent({ type: 'heal', amount: 0 }), null);
  assert.equal(cueForEvent({ type: 'hit', critical: true }), 'critical');
  assert.equal(cueForEvent({ type: 'enemy-windup', boss: true, kind: 'nova' }), 'nova');
  assert.equal(cueForEvent({ type: 'enemy-windup', boss: true, kind: 'fracture' }), 'fracture');
  assert.equal(cueForEvent({ type: 'strike', style: 'bow' }), 'arrow');
  for (const layers of Object.values(CUES)) for (const l of layers) {
    assert.ok(l.frequency > 0 && l.end > 0 && l.duration > .01 && l.duration < 1 && l.gain <= .2);
  }
});
