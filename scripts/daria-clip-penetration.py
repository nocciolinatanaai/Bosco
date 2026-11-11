"""Garment/hair penetration into the body across every frame of Daria's five clips.

Run: python3.11 scripts/daria-clip-penetration.py -- public/models/ranger/daria-refined.glb public/models/ranger/daria-pass01.glb OUT.json
(Blender 4.3 or bpy 4.3). The full CC0 body of daria-refined.glb (body, head, gloves) is the reference
surface for both models: same skeleton and clips, so poses coincide frame by frame.
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
for clip in clips:
    for rig, objs in ((rigA, A), (rigB, B)):
        act = next(a for a in bpy.data.actions if a.name.startswith('human_female_' + clip) and any(o in objs for o in [rig]) and (a.users or True))
    acts = [a for a in bpy.data.actions if a.name.startswith('human_female_' + clip)]
    rigA.animation_data.action = acts[0]; rigB.animation_data.action = acts[-1]
    start, end = map(int, acts[0].frame_range)
    rows = {'before': [], 'after': []}
    for frame in range(start, end + 1, 2):
        bpy.context.scene.frame_set(frame); dg = bpy.context.evaluated_depsgraph_get()
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
    result['clips'][clip] = {tag: {'meanPct': round(100 * sum(r) / len(r), 3), 'maxPct': round(100 * max(r), 3), 'frames': len(r)} for tag, r in rows.items()}
    print(clip, result['clips'][clip])
json.dump(result, open(out, 'w'), indent=1)
