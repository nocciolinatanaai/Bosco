export const MEMORY_TRACES = Object.freeze([
  Object.freeze({ id: 'departure', x: 24.5, z: 7, name: 'Il punto di raccolta' }),
  Object.freeze({ id: 'return', x: 31.5, z: 7, name: 'Il passo di ritorno' }),
  Object.freeze({ id: 'signature', x: 38.5, z: 7, name: 'La firma sulla mappa' }),
]);
export const TRACE_RADIUS = 2.3;
export const createTrail = () => ({ found: [], complete: false });
export function activeTrace(state) {
  if (state.status !== 'playing' || !state.evolved || !state.cleared || state.trail.complete) return null;
  return MEMORY_TRACES[state.trail.found.length] || null;
}
export function resonateTrail(state) {
  const trace = activeTrace(state);
  if (!trace || !(Math.hypot(state.x - trace.x, state.z - trace.z) <= TRACE_RADIUS)) return null;
  state.trail.found.push(trace.id); state.trail.complete = state.trail.found.length === MEMORY_TRACES.length;
  return { ...trace, count: state.trail.found.length, complete: state.trail.complete };
}
