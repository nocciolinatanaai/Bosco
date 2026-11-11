"""Garment/hair penetration into the body across every frame of Daria's five clips.

Run: python3.11 scripts/daria-clip-penetration.py -- public/models/ranger/daria-refined.glb public/models/ranger/daria-pass01.glb OUT.json
(Blender 4.3 or bpy 4.3). The full CC0 body of daria-refined.glb (body, head, gloves) is the reference
surface for both models: same skeleton and clips, so poses coincide frame by frame.
Both clips are sampled at the same normalised phase (the GLBs store them over different frame ranges).
A vertex counts as penetrating when it lies more than 1.5 cm (model units /3.6*1.75) inside that surface.
Approximation: sign from the nearest-face normal; the reference surface is not perfectly watertight.
"""
import bpy, sys, json
from mathutils.bvhtree import BVHTree
before, after, out = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
def load(path, tag):
    known = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path)
    objs = [o for o in bpy.data.objects if o not in known]
    for o in objs: o['tag'] = tag
    return objs
A = load(before, 'before'); B = load(after, 'after')
rigA = next(o for o in A if o.type == 'ARMATURE'); rigB = next(o for o in B if o.type == 'ARMATURE')
ref = [o for o in A if o.type == 'MESH' and o.name.split('.')[0] in ('human_female_body_default', 'human_female_head_default', 'human_female_light_gloves_3')]
tests = {'before': [o for o in A if o.type == 'MESH' and o.name.startswith('Daria tailored')],
         'after': [o for o in B if o.type == 'MESH' and o.name.startswith(('Daria outfit', 'Daria hair'))]}
DEPTH = .015 / 1.75 * 3.6
clips = ['idle', 'run', 'channel_two_handed_bow', 'cast_two_handed_bow', 'jump']
result = {'threshold_model_units': DEPTH, 'clips': {}}
SAMPLES = 8
for clip in clips:
    acts = [a for a in bpy.data.actions if a.name.startswith('human_female_' + clip)]
    actA = next(a for a in acts if not a.name.endswith('.001')); actB = next(a for a in acts if a.name.endswith('.001'))
    rigA.animation_data.action = actA; rigB.animation_data.action = actB
    # The two GLBs store the clip over different frame ranges (24 vs 30 fps export):
    # sample both at the same normalised phase, otherwise the poses are compared out of step.
    (a0, a1), (b0, b1) = actA.frame_range, actB.frame_range
    rows = {'before': [], 'after': []}
    for k in range(SAMPLES + (0 if clip in ('idle', 'run') else 1)):
        t = k / SAMPLES
        rigA.animation_data.action_extrapolation = 'HOLD'
        sceneA_frame = a0 + t * (a1 - a0); sceneB_frame = b0 + t * (b1 - b0)
        # Drive each rig at its own frame through the NLA-free evaluation time.
        rigA.animation_data.action_blend_type = 'REPLACE'
        bpy.context.scene.frame_set(int(sceneA_frame), subframe=sceneA_frame % 1)
        poseA = {b.name: b.matrix_basis.copy() for b in rigA.pose.bones}
        bpy.context.scene.frame_set(int(sceneB_frame), subframe=sceneB_frame % 1)
        for b in rigA.pose.bones: b.matrix_basis = poseA[b.name]
        rigA.animation_data.action = None
        dg = bpy.context.evaluated_depsgraph_get(); dg.update()
        verts, polys = [], []
        for o in ref:
            m = o.evaluated_get(dg).to_mesh(); base = len(verts)
            verts += [o.matrix_world @ v.co for v in m.vertices]; polys += [[base + i for i in p.vertices] for p in m.polygons]
            o.evaluated_get(dg).to_mesh_clear()
        bvh = BVHTree.FromPolygons(verts, polys)
        for tag, objs in tests.items():
            inside = total = 0
            for o in objs:
                m = o.evaluated_get(dg).to_mesh()
                for v in m.vertices:
                    p = o.matrix_world @ v.co; loc, normal, _, dist = bvh.find_nearest(p)
                    total += 1
                    if loc is not None and (p - loc).dot(normal) < -DEPTH: inside += 1
                o.evaluated_get(dg).to_mesh_clear()
            rows[tag].append(inside / max(1, total))
        rigA.animation_data.action = actA
    result['clips'][clip] = {tag: {'meanPct': round(100 * sum(r) / len(r), 3), 'maxPct': round(100 * max(r), 3), 'samples': len(r)} for tag, r in rows.items()}
    print(clip, result['clips'][clip])
json.dump(result, open(out, 'w'), indent=1)
