import { LoopOnce, MathUtils } from 'three';

// Blend explicitly sampled clips. Mixer fades need elapsed mixer time; this
// renderer samples combat phases with update(0), so weights use game time instead.
export function createPoseSampler(mixer, clips, fadeSeconds = .12) {
  const entries = clips.map(clip => ({
    name: clip.name, duration: clip.duration, action: mixer.clipAction(clip),
    weight: 0, startWeight: 0, playing: false,
  }));
  const byName = new Map(entries.map(entry => [entry.name, entry]));
  for (const entry of entries) { entry.action.setLoop(LoopOnce,1); entry.action.clampWhenFinished=true; }
  let current=null, changedAt=0, lastTime=null;
  return {
    sample(name, phase, time, { immediate=false }={}) {
      const target=byName.get(name);
      if (!target) throw Error(`Unknown character pose: ${name}`);
      const reset=current===null || (lastTime!==null && time<lastTime);
      if (name!==current || reset) {
        for (const entry of entries) entry.startWeight=reset?0:entry.weight;
        if (!target.playing) { target.action.reset().play(); target.playing=true; }
        current=name;changedAt=time;
      }
      const mix=immediate||reset||fadeSeconds<=0 ? 1 : MathUtils.smoothstep(time-changedAt,0,fadeSeconds);
      for (const entry of entries) {
        entry.weight=MathUtils.lerp(entry.startWeight,entry===target?1:0,mix);
        if (entry.weight===0 && entry!==target) {
          if(entry.playing)entry.action.stop();entry.playing=false;continue;
        }
        entry.action.enabled=true;entry.action.paused=false;entry.action.setEffectiveWeight(entry.weight);
      }
      if(mix===1){for(const entry of entries)entry.startWeight=entry.weight;changedAt=time-fadeSeconds;}
      target.action.time=MathUtils.clamp(phase,0,.999999)*target.duration;
      mixer.update(0);lastTime=time;
    },
  };
}
