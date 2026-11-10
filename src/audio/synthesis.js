const noiseBuffers = new WeakMap();
function noiseBuffer(context) {
  if (noiseBuffers.has(context)) return noiseBuffers.get(context);
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate), context.sampleRate), values = buffer.getChannelData(0);
  let seed = 731;
  for (let i = 0; i < values.length; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; values[i] = seed / 2147483648 - 1; }
  noiseBuffers.set(context, buffer); return buffer;
}

// One handle owns all sources/nodes, including layers scheduled in the future.
export function scheduleCue(context, destination, layers, onEnded = () => {}) {
  const start = context.currentTime + .005, nodes = [], sources = [];
  let remaining = layers.length, finished = false;
  function finish() {
    if (finished) return; finished = true;
    for (const node of nodes) node.disconnect();
    onEnded();
  }
  for (const layer of layers) {
    const when = start + layer.delay, end = when + layer.duration;
    const source = layer.noise ? context.createBufferSource() : context.createOscillator();
    sources.push(source); nodes.push(source);
    if (layer.noise) source.buffer = noiseBuffer(context);
    else {
      source.type = layer.wave; source.frequency.setValueAtTime(layer.frequency, when);
      source.frequency.exponentialRampToValueAtTime(layer.end, end);
    }
    const filter = context.createBiquadFilter(); filter.type = 'lowpass';
    filter.frequency.setValueAtTime(layer.noise ? layer.frequency : 7500, when);
    if (layer.noise) filter.frequency.exponentialRampToValueAtTime(layer.end, end);
    const gain = context.createGain(); gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.setValueAtTime(0, when); gain.gain.linearRampToValueAtTime(layer.gain, when + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, end); gain.gain.setValueAtTime(0, end + .005);
    source.connect(filter); filter.connect(gain); gain.connect(destination); nodes.push(filter, gain);
    source.onended = () => { if (--remaining === 0) finish(); };
    source.start(when); source.stop(end + .01);
  }
  return { stop() { if (finished) return; for (const source of sources) { try { source.stop(); } catch { /* Already ended. */ } } finish(); } };
}

export function createMix(context, volume = .35) {
  const input = context.createDynamicsCompressor(), master = context.createGain();
  input.threshold.value = -18; input.knee.value = 12; input.ratio.value = 10;
  input.attack.value = .003; input.release.value = .12;
  master.gain.value = volume; input.connect(master); master.connect(context.destination);
  return { input, master };
}
