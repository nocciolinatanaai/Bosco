"""Daria character-art pass 01 (Mythwood Ranger).

Run with Blender 4.3 (CLI or the `bpy` 4.3 Python module):
  blender -b --python scripts/prepare-daria-pass01.py -- public/models/ranger/daria-refined.glb public/models/ranger/daria-pass01.glb
  python3.11 scripts/prepare-daria-pass01.py -- IN.glb OUT.glb   (with `pip install bpy==4.3.0 "numpy<2"`)

Input: the CC0 System G6 derived GLB already versioned in the repository
(anatomy, 43-bone skeleton, five clips). The upstream .blend archive is not
needed. Everything this script adds is original Mythwood geometry and
procedurally painted pixels; no third-party image is used.

Main idea against clipping: every garment is a *shell* of the body surface
pushed out along its normals, and every accessory receives the body's own
skin weights by nearest-surface transfer. Covered body faces are deleted, so
skin cannot poke through clothing when the skeleton bends.
"""
import bpy, bmesh, sys, math, random
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

args = sys.argv[sys.argv.index('--') + 1:]
SOURCE, TARGET = args[0], args[1]
rng = random.Random(110)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SOURCE)
scene = bpy.context.scene
rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
rig.data.pose_position = 'REST'
for name in ('Cube', 'Icosphere', 'Daria tailored outfit and swept hair'):
    if name in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects[name], do_unlink=True)
body = bpy.data.objects['human_female_body_default']
head = bpy.data.objects['human_female_head_default']
gloves = bpy.data.objects['human_female_light_gloves_3']
boots = bpy.data.objects['human_female_medium_boots']
BONES = [g.name for g in body.vertex_groups]

# ---------------------------------------------------------------- textures
def image(name, size, pixels):
    img = bpy.data.images.new(name, size, size, alpha=False)
    img.pixels.foreach_set(np.ascontiguousarray(pixels, dtype=np.float32).ravel())
    img.pack()
    return img

def noise(size, scale, seed):
    r = np.random.default_rng(seed)
    out = np.zeros((size, size))
    for octave in range(4):
        n = max(2, int(scale * 2 ** octave))
        g = r.random((n + 1, n + 1))
        g[-1, :] = g[0, :]; g[:, -1] = g[:, 0]
        x = np.linspace(0, n, size, endpoint=False)
        i = x.astype(int); f = x - i; f = f * f * (3 - 2 * f)
        a = g[np.ix_(i, i)] * (1 - f)[None, :] + g[np.ix_(i, i + 1)] * f[None, :]
        b = g[np.ix_(i + 1, i)] * (1 - f)[None, :] + g[np.ix_(i + 1, i + 1)] * f[None, :]
        out += (a * (1 - f)[:, None] + b * f[:, None]) / 2 ** octave
    return out / out.max()

def srgb(c):
    c = np.asarray(c, float)
    return np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)

def disp(c):
    return np.asarray(c, float)

def fabric_texture(name, rgb, seed, weave=.06, wear=.18, size=256):
    yy, xx = np.mgrid[0:size, 0:size]
    tone = noise(size, 3, seed) * wear + noise(size, 24, seed + 1) * .08
    threads = (np.sin(xx * math.pi / 2) * np.sin(yy * math.pi / 2)) * weave
    v = (1 - wear) + tone + threads - weave / 2
    col = disp(np.array(rgb) / 255)[None, None, :] * v[..., None]
    return image(name, size, np.dstack([np.clip(col, 0, 1)[::-1], np.ones((size, size, 1))]))

def leather_texture(name, rgb, seed, size=256):
    v = .78 + noise(size, 4, seed) * .32 - noise(size, 40, seed + 5) * .12
    col = disp(np.array(rgb) / 255)[None, None, :] * v[..., None]
    return image(name, size, np.dstack([np.clip(col, 0, 1), np.ones((size, size, 1))]))

def material(name, color=None, tex=None, roughness=.8, metallic=0., double=False):
    m = bpy.data.materials.new(name); m.use_nodes = True
    bs = m.node_tree.nodes['Principled BSDF']
    bs.inputs['Roughness'].default_value = roughness; bs.inputs['Metallic'].default_value = metallic
    if tex:
        node = m.node_tree.nodes.new('ShaderNodeTexImage'); node.image = tex
        m.node_tree.links.new(node.outputs['Color'], bs.inputs['Base Color'])
    else:
        bs.inputs['Base Color'].default_value = (*srgb(np.array(color) / 255), 1)
    m.use_backface_culling = not double
    return m

M = {
    'jacket': material('Daria petrol jacket', tex=fabric_texture('daria_petrol_weave', (46, 78, 86), 1), roughness=.88),
    'tunic': material('Daria linen tunic', tex=fabric_texture('daria_linen', (168, 148, 112), 2, wear=.12), roughness=.92),
    'trousers': material('Daria brown trousers', tex=fabric_texture('daria_brown_trousers', (70, 50, 38), 3, wear=.26), roughness=.9),
    'cape': material('Daria terracotta capelet', tex=fabric_texture('daria_terracotta', (150, 72, 50), 4, weave=.09, wear=.24), roughness=.95, double=True),
    'scarf': material('Daria sage scarf', tex=fabric_texture('daria_sage', (128, 136, 96), 5, weave=.1, wear=.2), roughness=.97, double=True),
    'leather': material('Daria worn leather', tex=leather_texture('daria_leather', (92, 58, 36), 6), roughness=.6),
    'darkleather': material('Daria dark leather', tex=leather_texture('daria_dark_leather', (54, 36, 26), 7), roughness=.62),
    'brass': material('Daria aged brass', color=(150, 116, 60), roughness=.38, metallic=.8),
    'hair': material('Daria dark brown hair', color=(36, 24, 19), roughness=.55, double=True),
    'hair2': material('Daria hair lowlights', color=(52, 34, 25), roughness=.5, double=True),
    'paper': material('Daria map pages', color=(196, 172, 128), roughness=.95),
    'skin': material('Daria skin hands', color=(200, 148, 116), roughness=.55),
    'wood': material('Daria arrow shafts', color=(120, 86, 52), roughness=.7),
    'fletch': material('Daria fletching', color=(214, 204, 186), roughness=.9, double=True),
}

# ---------------------------------------------------------------- face
def paint_face():
    """Original painted face on the CC0 head UV layout (no upstream pixels kept)."""
    S = 1024
    yy, xx = np.mgrid[0:S, 0:S].astype(float) / S * 512  # coordinates in source 512 space, y down
    skin = disp(np.array([190, 132, 100]) / 255)
    base = np.ones((S, S, 3)) * skin
    n = noise(S, 6, 11)[..., None]
    base *= .93 + n * .1
    def blob(cx, cy, rx, ry, power=2.):
        d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
        return np.clip(1 - d, 0, 1) ** power
    def tint(mask, rgb, amount):
        nonlocal base
        c = disp(np.array(rgb) / 255)
        base = base * (1 - mask[..., None] * amount) + c * mask[..., None] * amount
    # Warm cheeks and nose, soft shading around eyes and under cheekbones.
    for cx in (215, 297):
        tint(blob(cx, 292, 34, 22), (196, 120, 100), .28)
        tint(blob(cx, 266, 30, 12), (150, 104, 88), .22)          # eye socket shadow
        tint(blob(cx + (-1 if cx < 256 else 1) * 22, 318, 18, 28), (160, 112, 90), .2)  # cheek hollow
    tint(blob(256, 296, 9, 26), (232, 186, 154), .25)              # nose bridge highlight
    tint(blob(256, 308, 16, 6), (170, 112, 92), .35)               # nostril shadow
    tint(blob(256, 348, 34, 14), (170, 124, 100), .18)             # chin/jaw
    # Freckles over nose and cheeks.
    r = np.random.default_rng(7)
    for _ in range(160):
        cx = 256 + r.normal(0, 38); cy = 292 + r.normal(0, 12)
        if abs(cx - 256) < 6 and cy < 280: continue
        tint(blob(cx, cy, r.uniform(.6, 1.2), r.uniform(.6, 1.2), 1), (150, 96, 70), r.uniform(.18, .4))
    # Eyes: almond shape, hazel-green iris, defined upper lid, lower lash line.
    for side, cx in ((-1, 225), (1, 287)):
        white = blob(cx, 263, 12.5, 3.8, 1)
        tint(white, (208, 194, 182), .85)
        tint(blob(cx + side * .5, 263, 3.8, 3.8, 1) * (white > 0), (88, 92, 58), .95)
        tint(blob(cx + side * .5, 263, 1.6, 1.6, 1), (20, 16, 12), .9)
        tint(blob(cx - side * 2, 261, 1, 1, 1), (250, 250, 240), .8)
        lid = np.clip(1 - np.abs((yy - (259.4 + ((xx - cx) / 13) ** 2 * 3.6)) / 1.7), 0, 1) * (np.abs(xx - cx) < 14)
        tint(lid, (34, 22, 18), .92)
        crease = np.clip(1 - np.abs((yy - (253 + ((xx - cx) / 16) ** 2 * 3)) / 1.6), 0, 1) * (np.abs(xx - cx) < 14)
        tint(crease, (120, 80, 66), .45)
        low = np.clip(1 - np.abs((yy - (268 - ((xx - cx) / 15) ** 2 * 3)) / 1.2), 0, 1) * (np.abs(xx - cx) < 13)
        tint(low, (110, 72, 60), .4)
        # Strong, straight-to-arched dark brows.
        t = (xx - cx) * side
        browy = 245 - 3.2 * np.clip((t + 16) / 22, 0, 1) + 4.0 * np.clip((t - 6) / 12, 0, 1)
        thick = 5.2 - np.clip((t + 4) / 22, 0, 1) * 2.2
        brow = np.clip(1 - np.abs(yy - browy) / thick, 0, 1) * ((t > -17) & (t < 19))
        tint(np.clip(brow, 0, 1), (40, 26, 20), .9)
    # Lips: natural rose-brown, defined line, fuller lower lip.
    upper = blob(256, 325, 19, 4.4, 1) * (yy < 327)
    lower = blob(256, 329, 17, 5.2, 1) * (yy >= 327)
    tint(upper + lower, (158, 86, 78), .8)
    tint(np.clip(1 - np.abs(yy - 327.2) / 1.0, 0, 1) * (np.abs(xx - 256) < 18), (92, 52, 48), .8)
    tint(blob(256, 330.5, 7, 1.6, 1), (214, 160, 146), .3)
    # Scalp and hairline: dark brown so the hair shell never shows pale gaps.
    scalp = disp(np.array([40, 27, 21]) / 255)
    src = np.array(head_image_rgb)  # 512x512 RGB, sampled only to locate the painted hair area
    hy = np.clip((yy).astype(int), 0, 511); hx = np.clip((xx).astype(int), 0, 511)
    s = src[hy, hx]
    hairmask = ((s[..., 0] - s[..., 2]) < .16) & (s[..., 1] < .62) & (s[..., 0] > .35)
    hairmask = hairmask.astype(float) * ((((xx - 256) / 92) ** 2 + ((yy - 300) / 88) ** 2) > 1)
    base = base * (1 - hairmask[..., None]) + scalp * hairmask[..., None]
    # Soft blur: painted lines read as skin features, not aliased pixel steps.
    for _ in range(2):
        base = (base * 4 + np.roll(base, 1, 0) + np.roll(base, -1, 0) + np.roll(base, 1, 1) + np.roll(base, -1, 1)) / 8
    pixels = np.dstack([np.clip(base, 0, 1)[::-1], np.ones((S, S, 1))])
    return image('daria_face_pass01', S, pixels)

old = bpy.data.images['tex_human_female_head_1']
w, h = old.size
px = np.array(old.pixels[:]).reshape(h, w, 4)[::-1, :, :3]
head_image_rgb = px ** (1 / 2.2)  # back to display values for the colour mask
face_tex = paint_face()
face_mat = material('Daria face', tex=face_tex, roughness=.5)
head.data.materials.clear(); head.data.materials.append(face_mat)

# Adult face proportions: slightly longer midface, defined jaw, nose bridge.
for v in head.data.vertices:
    c = v.co
    if c.z < 3.72 and c.y < -.05:
        k = min(1, (3.72 - c.z) / .2)
        c.x *= 1 - .05 * k
    if c.z < 3.58 and abs(c.x) > .08 and c.y < 0:
        c.x *= 1.03  # jaw angle reads adult, not round-child

# ---------------------------------------------------------------- helpers
def link(obj):
    scene.collection.objects.link(obj); obj.parent = rig
    for name in BONES:
        if name not in obj.vertex_groups: obj.vertex_groups.new(name=name)
    mod = next((m for m in obj.modifiers if m.type == 'ARMATURE'), None) or obj.modifiers.new('Skeleton', 'ARMATURE')
    mod.object = rig
    return obj

def shell(name, src, keep, offset, mat, subdivide=0):
    """Copy of `src` faces passing keep(center, normal), pushed out along vertex normals."""
    me = src.data.copy(); me.name = name
    obj = bpy.data.objects.new(name, me)
    for g in src.vertex_groups: obj.vertex_groups.new(name=g.name)
    bm = bmesh.new(); bm.from_mesh(me); bm.normal_update()
    normals = {v.index: v.normal.copy() for v in bm.verts}
    drop = [f for f in bm.faces if not keep(f.calc_center_median(), f.normal)]
    bmesh.ops.delete(bm, geom=drop, context='FACES')
    for v in bm.verts:
        off = offset(v.co) if callable(offset) else offset
        v.co += normals[v.index] * off
    if subdivide:
        bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=subdivide, use_grid_fill=True, smooth=.6)
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    me.materials.clear(); me.materials.append(mat)
    return link(obj)

# Pristine copy of body + head as the weight source for every accessory.
def weight_source():
    parts = []
    for o in (body, head, gloves):
        c = o.copy(); c.data = o.data.copy(); scene.collection.objects.link(c); parts.append(c)
    with bpy.context.temp_override(active_object=parts[0], selected_editable_objects=parts, object=parts[0]):
        bpy.ops.object.join()
    parts[0].name = 'weight-source'; parts[0].hide_render = True
    return parts[0]
WSRC = weight_source()
bvh_body = BVHTree.FromObject(WSRC, bpy.context.evaluated_depsgraph_get())

def transfer_weights(obj, blend=None):
    """Nearest-surface skin weights from the body; optional blend toward fixed bones."""
    src_groups = {i: g.name for i, g in enumerate(WSRC.vertex_groups)}
    me = obj.data; mw = obj.matrix_world
    src_me = WSRC.data
    for v in me.vertices:
        co = mw @ v.co
        loc, normal, face, dist = bvh_body.find_nearest(co)
        poly = src_me.polygons[face]
        # Inverse-distance blend of the face's corner weights.
        acc = {}
        total = 0
        for vi in poly.vertices:
            d = 1 / ((src_me.vertices[vi].co - loc).length + 1e-4); total += d
            for g in src_me.vertices[vi].groups:
                acc[src_groups[g.group]] = acc.get(src_groups[g.group], 0) + g.weight * d
        weights = {k: w / total for k, w in acc.items()}
        if blend:
            fixed, amount = blend(co)
            if amount > 0:
                weights = {k: w * (1 - amount) for k, w in weights.items()}
                for k, w in fixed.items(): weights[k] = weights.get(k, 0) + w * amount
        s = sum(weights.values()) or 1
        for g in obj.vertex_groups: g.remove([v.index])
        for k, w in sorted(weights.items(), key=lambda kv: -kv[1])[:4]:
            obj.vertex_groups[k].add([v.index], w / s, 'REPLACE')

def new_mesh(name, verts, faces, mat, uvs=None, smooth=True):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    if uvs is not None:
        layer = me.uv_layers.new(name='UVMap')
        for loop in me.loops: layer.data[loop.index].uv = uvs[loop.vertex_index]
    for p in me.polygons: p.use_smooth = smooth
    me.materials.append(mat)
    return link(bpy.data.objects.new(name, me))

def tube(name, path, radius, mat, sides=8, taper=None, flatten=1.):
    """Swept tube along points with per-point radius; returns object (UV along length)."""
    verts, faces, uvs = [], [], []
    pts = [Vector(p) for p in path]
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        a = t.cross(Vector((0, 0, 1)) if abs(t.z) < .9 else Vector((1, 0, 0))).normalized(); b = t.cross(a)
        r = radius * (taper(i / (len(pts) - 1)) if taper else 1)
        for j in range(sides):
            ang = j / sides * math.tau
            verts.append(tuple(p + a * math.cos(ang) * r + b * math.sin(ang) * r * flatten))
            uvs.append((j / sides, i / (len(pts) - 1)))
    for i in range(len(pts) - 1):
        for j in range(sides):
            faces.append((i * sides + j, i * sides + (j + 1) % sides, (i + 1) * sides + (j + 1) % sides, (i + 1) * sides + j))
    return new_mesh(name, verts, faces, mat, uvs)

def box(name, center, size, mat, rot=(0, 0, 0)):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    bmesh.ops.bevel(bm, geom=bm.edges[:], offset=min(size) * .18, segments=2, affect='EDGES')
    R = Matrix.Rotation(rot[2], 3, 'Z') @ Matrix.Rotation(rot[1], 3, 'Y') @ Matrix.Rotation(rot[0], 3, 'X')
    for v in bm.verts: v.co = R @ v.co + Vector(center)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    layer = me.uv_layers.new(name='UVMap')
    for loop in me.loops:
        co = me.vertices[loop.vertex_index].co; layer.data[loop.index].uv = (co.x * 3 + co.y * 3, co.z * 3)
    me.materials.append(mat)
    return link(bpy.data.objects.new(name, me))

def torso_only(_):
    return {'torso': 1}, 1

# ---------------------------------------------------------------- garments
NECK_Z, WAIST_Z = 3.40, 2.22
def opening(c):  # front V opening of the jacket, wider toward the collar
    return c.y < -.06 and c.z > 2.62 and abs(c.x) < .015 + (c.z - 2.62) * .28

on_arm = lambda c: abs(c.x) > .27 and c.z > 2.75
jacket_keep = lambda c, n: (2.05 < c.z < NECK_Z or on_arm(c)) and not opening(c)
jacket = shell('Daria jacket', body, jacket_keep, lambda co: .03 + (.012 if co.z < 2.45 else 0), M['jacket'])
tunic = shell('Daria tunic', body, lambda c, n: opening(c) and c.z < NECK_Z, .012, M['tunic'])
# Long sleeves continue over the glove forearm, which becomes the cuff below the bracer.
forearm = shell('Daria sleeve forearm', gloves, lambda c, n: abs(c.x) < 1.06, .018, M['jacket'])
bracer = shell('Daria bracers', gloves, lambda c, n: .8 < abs(c.x) < 1.07, .036, M['darkleather'])
hands = shell('Daria hands', gloves, lambda c, n: abs(c.x) >= 1.06, 0., M['skin'])
palmwrap = shell('Daria hand wraps', gloves, lambda c, n: 1.06 <= abs(c.x) < 1.24, .006, M['leather'])
trousers = shell('Daria trousers', body, lambda c, n: c.z < 2.3, .006, M['trousers'])

# Jacket skirt: extend the bottom edge into four panels split at front, back and sides.
def jacket_skirt():
    me = jacket.data
    bm = bmesh.new(); bm.from_mesh(me)
    edges = [e for e in bm.edges if e.is_boundary and all(v.co.z < 2.12 for v in e.verts)]
    loop_verts = sorted({v for e in edges for v in e.verts}, key=lambda v: math.atan2(v.co.y, v.co.x))
    loop_cos = [Vector(v.co) for v in loop_verts]
    bm.free()
    verts, faces, uvs = [], [], []
    rows = 6
    ring = [(c, Vector((c.x, c.y, 0)).normalized()) for c in loop_cos]
    n = len(ring)
    for r in range(rows + 1):
        t = r / rows
        for i, (p, out) in enumerate(ring):
            ang = math.atan2(p.y, p.x)
            drop = .5 * t
            if p.y < -.05: drop *= .85
            q = p + out * (.04 + .14 * t) + Vector((0, 0, -drop))
            q.z += math.sin(ang * 9) * .012 * t
            verts.append(tuple(q)); uvs.append((i / n * 4, .4 - t * .3))
    splits = set()
    for i in range(n):
        a = math.atan2(ring[i][0].y, ring[i][0].x); b = math.atan2(ring[(i + 1) % n][0].y, ring[(i + 1) % n][0].x)
        for cut in (-math.pi / 2, math.pi / 2, 0, math.pi):
            da = math.atan2(math.sin(a - cut), math.cos(a - cut)); db = math.atan2(math.sin(b - cut), math.cos(b - cut))
            if da * db < 0 and abs(da) < .6: splits.add(i)
    for r in range(rows):
        for i in range(n):
            if i in splits or (i + 1) % n == 0 and (i + 1) % n != 0: continue
            j = (i + 1) % n
            if abs(ring[i][0].x - ring[j][0].x) > .25: continue
            faces.append((r * n + i, r * n + j, (r + 1) * n + j, (r + 1) * n + i))
    obj = new_mesh('Daria jacket skirt', verts, faces, M['jacket'], uvs)
    # Each panel follows its own thigh softly, anchored to the pelvis near the belt.
    transfer_weights(obj, blend=lambda co: ({'pelvis': 1}, max(0, min(.55, (co.z - 1.62) / .55 * .55))))
    obj.modifiers.new('Daria skirt thickness', 'SOLIDIFY').thickness = .012
    return obj
skirt = jacket_skirt()

# Belts, thigh straps and the diagonal quiver strap, all following the body surface.
def band(name, zlo, zhi, offset, mat, xmin=0):
    return shell(name, body, lambda c, n: zlo < c.z < zhi and abs(c.x) >= xmin, offset, mat)
band('Daria waist belt', 2.16, 2.3, .055, M['darkleather'])
band('Daria hip belt', 2.02, 2.12, .05, M['leather'])
band('Daria thigh straps', 1.78, 1.86, .028, M['darkleather'], xmin=.06)

def strap(name, pts, width, mat, lift=.05):
    """Flat strap projected onto the dressed torso."""
    verts, faces = [], []
    dense = []
    for i in range(len(pts) - 1):
        for k in range(8):
            dense.append(Vector(pts[i]).lerp(Vector(pts[i + 1]), k / 8))
    dense.append(Vector(pts[-1]))
    for i, p in enumerate(dense):
        loc, normal, _, _ = bvh_body.find_nearest(p)
        t = (dense[min(i + 1, len(dense) - 1)] - dense[max(i - 1, 0)]).normalized()
        side = normal.cross(t).normalized()
        c = loc + normal * lift
        verts += [tuple(c - side * width), tuple(c + side * width)]
    for i in range(len(dense) - 1):
        faces.append((i * 2, i * 2 + 1, i * 2 + 3, i * 2 + 2))
    obj = new_mesh(name, verts, faces, mat, [(k % 2, k / 2 / len(dense)) for k in range(len(verts))])
    obj.modifiers.new('thickness', 'SOLIDIFY').thickness = .012
    transfer_weights(obj)
    return obj
strap('Daria quiver strap front', [(-.26, -.12, 3.3), (-.15, -.26, 3.05), (.05, -.27, 2.7), (.25, -.22, 2.35)], .03, M['darkleather'])
strap('Daria quiver strap back', [(-.26, .05, 3.3), (-.1, .2, 3.0), (.1, .2, 2.65), (.27, .12, 2.35)], .03, M['darkleather'])
strap('Daria jacket cross belt', [(.1, -.27, 2.62), (-.3, -.2, 2.55)], .022, M['leather'], lift=.04)

# Rigid accessories: weights transferred, then pulled toward one bone.
def rigid(obj, bone='pelvis', amount=.7):
    transfer_weights(obj, blend=lambda co: ({bone: 1}, amount))
for name, c, s, mat, rot in [
    ('Daria belt buckle', (0, -.335, 2.23), (.1, .02, .08), 'brass', (0, 0, 0)),
    ('Daria hip pouch', (-.31, -.2, 2.0), (.13, .08, .15), 'leather', (0, 0, .5)),
    ('Daria hip pouch flap', (-.315, -.245, 2.06), (.135, .02, .07), 'darkleather', (0, 0, .5)),
    ('Daria map notebook', (.33, -.2, 1.98), (.17, .06, .22), 'paper', (0, 0, -.45)),
    ('Daria notebook cover', (.345, -.235, 1.98), (.18, .015, .235), 'leather', (0, 0, -.45)),
    ('Daria notebook clasp', (.35, -.25, 1.98), (.035, .012, .05), 'brass', (0, 0, -.45)),
]:
    rigid(box(name, c, s, M[mat], rot))
for side in (-1, 1):
    rigid(box(f'Daria thigh buckle {side}', (side * .22, -.2, 1.82), (.05, .015, .04), M['brass']), 'leg_upper_' + ('L' if side > 0 else 'R'), .8)

# ---------------------------------------------------------------- capelet
def capelet():
    """Ragged terracotta capelet, longer over the right shoulder, brass ring brooch."""
    verts, faces, uvs = [], [], []
    cols, rows = 48, 10
    for r in range(rows + 1):
        t = r / rows
        for i in range(cols + 1):
            a = i / cols * math.tau - math.pi / 2           # starts at the front centre
            sx, sy = math.cos(a), math.sin(a)
            right = max(0, -sx)                               # her right side (negative x)
            front = max(0, -sy)
            length = .5 + .36 * right + .22 * max(0, sy) - .14 * front * (1 - right)
            ragged = (rng.random() - .5) * .07 * t ** 2
            rad = .2 + (.2 + .22 * abs(sx)) * t
            z = 3.42 - t * (length + ragged)
            x = sx * rad * (1.05 + .25 * t)
            y = -.02 + sy * (.17 + .11 * t) + math.sin(a * 7 + t * 3) * .015 * t
            if sy < -.2 and abs(sx) < .4:  # open at the front centre over the scarf
                y -= .02
            verts.append((x, y, z)); uvs.append((i / cols * 3, 1 - t))
    for r in range(rows):
        for i in range(cols):
            a = i / cols * math.tau - math.pi / 2
            if abs(math.cos(a)) < .14 and math.sin(a) < 0 and r < rows: continue  # front opening
            faces.append((r * (cols + 1) + i, r * (cols + 1) + i + 1, (r + 1) * (cols + 1) + i + 1, (r + 1) * (cols + 1) + i))
    obj = new_mesh('Daria capelet', verts, faces, M['cape'], uvs)
    # Keep the cloth outside the dressed body.
    me = obj.data
    for v in me.vertices:
        loc, normal, _, dist = bvh_body.find_nearest(v.co)
        if (v.co - loc).dot(normal) < .085:
            v.co = loc + normal * .085
    transfer_weights(obj, blend=lambda co: ({'torso': 1}, .55))
    obj.modifiers.new('thickness', 'SOLIDIFY').thickness = .01
    return obj
capelet()
brooch = tube('Daria capelet brooch', [(-.17 + .045 * math.cos(a), -.32, 3.25 + .045 * math.sin(a)) for a in np.linspace(0, math.tau, 17)], .011, M['brass'], sides=6)
transfer_weights(brooch, blend=torso_only)

# ---------------------------------------------------------------- scarf
def scarf():
    verts, faces, uvs = [], [], []
    cols, rows = 40, 9
    for r in range(rows + 1):
        t = r / rows
        for i in range(cols + 1):
            a = i / cols * math.tau
            sx, sy = math.cos(a), math.sin(a)
            front = max(0, -sy)
            z = 3.56 - t * (.22 + .2 * front ** 2)
            bulge = math.sin(t * math.pi) * (.05 + .04 * front) + math.sin(a * 5 + t * 6) * .012
            rad = .135 + bulge + .07 * t * front
            verts.append((sx * rad * 1.15, .01 + sy * rad, z + math.sin(a * 3) * .015))
            uvs.append((i / cols * 2, 1 - t))
    for r in range(rows):
        for i in range(cols):
            faces.append((r * (cols + 1) + i, r * (cols + 1) + i + 1, (r + 1) * (cols + 1) + i + 1, (r + 1) * (cols + 1) + i))
    obj = new_mesh('Daria sage scarf', verts, faces, M['scarf'], uvs)
    for v in obj.data.vertices:
        loc, normal, _, _ = bvh_body.find_nearest(v.co)
        if (v.co - loc).dot(normal) < .05: v.co = loc + normal * .05
    transfer_weights(obj, blend=lambda co: ({'torso': .8, 'head': .2}, .8))
    obj.modifiers.new('thickness', 'SOLIDIFY').thickness = .012
scarf()

# ---------------------------------------------------------------- hair
HC = Vector((0, .0, 3.73))  # head centre in rest space
bvh_head = BVHTree.FromObject(head, bpy.context.evaluated_depsgraph_get())
def scalp_point(direction, lift):
    hit = bvh_head.ray_cast(HC + direction * 1.0, -direction)
    loc = hit[0] if hit[0] else HC + direction * .2
    return loc + direction * lift

def hairline(c):
    """True for head faces covered by hair: high forehead edge, ears exposed."""
    d = (c - HC)
    if d.z > .14: return True
    if d.y > .02 and d.z > -.2: return True                  # back of head down to the nape
    if d.y > -.06 and d.z > .02 and abs(d.x) > .1: return True  # temples above the ears
    return False
def hair_cap():
    """Hair volume as a dome sampled on the skull, closed by a smooth hairline curve."""
    verts, faces, uvs = [], [], []
    cols, rows = 40, 14
    for r in range(rows + 1):
        for i in range(cols + 1):
            phi = i / cols * math.tau                      # 0 = her left, pi/2 = back, -pi/2 = face
            front = max(0, -math.sin(phi)); back = max(0, math.sin(phi))
            # Hairline elevation: high forehead, temples, down to the nape at the back.
            edge = .62 * front ** 1.5 + .18 * (1 - front - back) - .55 * back ** 1.2
            elev = math.pi / 2 - (r / rows) * (math.pi / 2 - edge)   # from crown to hairline
            d = Vector((math.cos(elev) * math.cos(phi), math.cos(elev) * math.sin(phi), math.sin(elev)))
            fall = 1 - r / rows
            lift = .006 + (.03 + .03 * max(0, math.sin(elev)) + .03 * back) * min(1, fall * 2.2)
            verts.append(tuple(scalp_point(d.normalized(), lift))); uvs.append((i / cols * 4, r / rows))
    for r in range(rows):
        for i in range(cols):
            faces.append((r * (cols + 1) + i, (r + 1) * (cols + 1) + i, (r + 1) * (cols + 1) + i + 1, r * (cols + 1) + i + 1))
    return new_mesh('Daria hair volume', verts, faces, M['hair'], uvs)
cap = hair_cap()
for g in cap.vertex_groups: g.remove(list(range(len(cap.data.vertices))))
cap.vertex_groups['head'].add(list(range(len(cap.data.vertices))), 1, 'REPLACE')

def hair_card(name, pts, width, mat, twist=0.):
    """Two-sided ribbon strand of hair: wavy, tapering to a point."""
    verts, faces, uvs = [], [], []
    pts = [Vector(p) for p in pts]
    for i, p in enumerate(pts):
        t = i / (len(pts) - 1)
        tan = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        out = (p - HC); out.z *= .3; out.normalize()
        side = tan.cross(out).normalized()
        side = (Matrix.Rotation(twist * t, 3, tan) @ side)
        w = width * (1 - t ** 1.6 * .85)
        verts += [tuple(p - side * w), tuple(p + side * w)]
        uvs += [(0, t), (1, t)]
    for i in range(len(pts) - 1):
        faces.append((i * 2, i * 2 + 1, i * 2 + 3, i * 2 + 2))
    return new_mesh(name, verts, faces, mat, uvs)

strands = []
# Loose waves at the sides: from the temples back to behind the ears, down to the jaw/neck.
for k in range(22):
    side = -1 if k % 2 else 1
    s = (k // 2) / 10
    start_dir = Vector((side * (.62 + .2 * s), -.42 + .9 * s, .62 - .25 * s)).normalized()
    p0 = scalp_point(start_dir, .045)
    pts = [p0]
    length = .34 + .2 * s + rng.random() * .1
    for i in range(1, 12):
        t = i / 11
        q = Vector(pts[-1]) + Vector((side * .012 * (1 - t), .006 + .01 * s, -length / 11))
        q.x += side * math.sin(t * 6 + k) * .01
        loc, normal, _, _ = bvh_head.find_nearest(q)
        if (q - loc).dot(normal) < .04 and q.z > 3.46: q = loc + normal * .04
        if q.y < -.06 and abs(q.x) < .2: q.x = side * .2
        pts.append(q)
    strands.append(hair_card(f'Daria hair wave {k}', pts, .045 + rng.random() * .015, M['hair2' if k % 3 == 0 else 'hair'], twist=0))
# Two loose face-framing locks escaping in front of the ears (as in the concept).
for side in (-1, 1):
    pts = [scalp_point(Vector((side * .55, -.6, .58)).normalized(), .02)]
    for i in range(1, 9):
        t = i / 8
        pts.append(pts[0] + Vector((side * (.025 + .02 * math.sin(t * 6)), -.02 * t, -.36 * t)))
    strands.append(hair_card(f'Daria face lock {side}', pts, .022, M['hair2'], twist=.8 * side))
# Swept-back top strands over the crown into the braid root.
for k in range(16):
    a = (k / 15 - .5) * 1.6
    pts = []
    for i in range(10):
        t = i / 9
        d = Vector((math.sin(a) * (1 - .6 * t) + .25 * t, -.42 + 1.4 * t, .9 - .95 * t ** 1.4)).normalized()
        pts.append(scalp_point(d, .07 - .03 * t + .015 * math.sin(t * math.pi)))
    strands.append(hair_card(f'Daria crown strand {k}', pts, .06, M['hair' if k % 4 else 'hair2'], twist=0))
for obj in strands:
    for g in obj.vertex_groups: g.remove(list(range(len(obj.data.vertices))))
    obj.vertex_groups['head'].add(list(range(len(obj.data.vertices))), 1, 'REPLACE')

# Three-strand braid: from behind the left ear, over the shoulder, onto the chest.
def braid():
    spine = [Vector(p) for p in [(.1, .17, 3.66), (.17, .14, 3.48), (.22, .03, 3.3), (.25, -.12, 3.12),
                                 (.25, -.22, 2.95), (.24, -.26, 2.78), (.23, -.27, 2.62)]]
    # Smooth Catmull-Rom spine.
    path = []
    for i in range(len(spine) - 1):
        p0, p1, p2, p3 = spine[max(i - 1, 0)], spine[i], spine[i + 1], spine[min(i + 2, len(spine) - 1)]
        for k in range(8):
            t = k / 8
            path.append(.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    path.append(spine[-1])
    objs = []
    lobes = 15
    for strand in range(3):
        pts = []
        for i, p in enumerate(path):
            t = i / (len(path) - 1)
            tan = (path[min(i + 1, len(path) - 1)] - path[max(i - 1, 0)]).normalized()
            a = tan.cross(Vector((0, 1, 0)) if abs(tan.y) < .9 else Vector((1, 0, 0))).normalized(); b = tan.cross(a)
            phase = t * lobes * math.pi + strand * math.tau / 3
            r = .034 * (1 - .45 * t)
            pts.append(p + a * math.sin(phase) * r + b * math.cos(phase) * r * .6)
        objs.append(tube(f'Daria braid strand {strand}', pts, .03, M['hair2' if strand == 1 else 'hair'], sides=7, taper=lambda t: 1 - .5 * t))
    tie = tube('Daria braid tie', [path[-6] + Vector((0, 0, .02)), path[-6] - Vector((0, 0, .02))], .03, M['leather'], sides=8)
    objs.append(tie)
    tuft = []
    for k in range(5):
        a = k / 5 * math.tau
        tuft.append(hair_card(f'Daria braid tuft {k}', [path[-6] + Vector((math.cos(a) * .01, math.sin(a) * .01, -.02 * i)) for i in range(5)], .018, M['hair']))
    for obj in objs + tuft:
        # Upper braid follows the head; resting part follows the chest.
        me = obj.data
        for g in obj.vertex_groups: g.remove(list(range(len(me.vertices))))
        for v in me.vertices:
            w = max(0., min(1., (v.co.z - 3.2) / .35))
            if w > 0: obj.vertex_groups['head'].add([v.index], w, 'REPLACE')
            if w < 1: obj.vertex_groups['torso'].add([v.index], 1 - w, 'REPLACE')
        for v in me.vertices:  # keep the braid outside scarf and capelet
            loc, normal, _, _ = bvh_body.find_nearest(v.co)
            if v.co.z < 3.35 and (v.co - loc).dot(normal) < .12: v.co = loc + normal * .12 + (v.co - loc) * 0
braid()

# ---------------------------------------------------------------- quiver
def quiver():
    base = Vector((-.1, .27, 2.6)); top = Vector((-.3, .25, 3.35))
    q = tube('Daria quiver', [base, base.lerp(top, .5), top], .075, M['leather'], sides=12, taper=lambda t: .85 + .15 * t)
    rim = tube('Daria quiver rim', [top + Vector((.075 * math.cos(a), .075 * math.sin(a) * .8, 0)) for a in np.linspace(0, math.tau, 13)], .012, M['brass'], sides=5)
    parts = [q, rim]
    for k in range(6):
        off = Vector(((k % 3 - 1) * .035, (k // 3 - .5) * .035, 0))
        tip = top + off + (top - base).normalized() * (.22 + .03 * (k % 2))
        parts.append(tube(f'Daria arrow shaft {k}', [top + off - (top - base).normalized() * .2, tip], .007, M['wood'], sides=4))
        d = (top - base).normalized()
        for f in range(3):
            a = f / 3 * math.tau + k
            side = Vector((math.cos(a), math.sin(a), 0)) * .028
            parts.append(new_mesh(f'Daria fletch {k}{f}', [tuple(tip - d * .02), tuple(tip - d * .1), tuple(tip - d * .12 + side), tuple(tip - d * .03 + side)], [(0, 1, 2, 3)], M['fletch'], [(0, 0), (0, 1), (1, 1), (1, 0)]))
    for obj in parts: rigid(obj, 'torso', 1.)
quiver()

# ---------------------------------------------------------------- clean up body
# Body faces fully covered by clothes are removed: no skin can poke through.
def cull_body():
    bm = bmesh.new(); bm.from_mesh(body.data)
    drop = [f for f in bm.faces if jacket_keep(f.calc_center_median(), f.normal) and not opening(f.calc_center_median())
            or f.calc_center_median().z < 2.3]
    bmesh.ops.delete(bm, geom=drop, context='FACES'); bm.to_mesh(body.data); bm.free()
    body.data.materials.clear(); body.data.materials.append(M['tunic'])
cull_body()
bpy.data.objects.remove(gloves, do_unlink=True)
bpy.data.objects.remove(WSRC, do_unlink=True)
if len(body.data.polygons) == 0: bpy.data.objects.remove(body, do_unlink=True)

# Merge every authored mesh into one skinned garment mesh (fewer draw calls).
def merge(names_pred, name):
    objs = [o for o in bpy.data.objects if o.type == 'MESH' and names_pred(o)]
    for o in objs:
        for m in list(o.modifiers):
            if m.type != 'ARMATURE':
                with bpy.context.temp_override(object=o, active_object=o):
                    bpy.ops.object.modifier_apply(modifier=m.name)
    with bpy.context.temp_override(active_object=objs[0], selected_editable_objects=objs, object=objs[0]):
        bpy.ops.object.join()
    objs[0].name = name
    return objs[0]
outfit = merge(lambda o: o.name.startswith('Daria') and 'hair' not in o.name and 'braid' not in o.name and 'lock' not in o.name and 'strand' not in o.name, 'Daria outfit pass01')
hairobj = merge(lambda o: o.name.startswith('Daria') and o != outfit, 'Daria hair pass01')
for o in (outfit, hairobj):
    for g in list(o.vertex_groups):
        pass

# ---------------------------------------------------------------- export
rig.data.pose_position = 'POSE'
for action in bpy.data.actions:
    action.name = action.name.replace('_human_female', '') if action.name.endswith('_human_female') else action.name
    action.use_fake_user = True
if rig.animation_data:
    rig.animation_data.action = bpy.data.actions.get('human_female_idle')
    for track in list(rig.animation_data.nla_tracks): rig.animation_data.nla_tracks.remove(track)
scene.render.fps = 30
for o in bpy.data.objects: o.select_set(o.type in ('MESH', 'ARMATURE'))
props = bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
opts = dict(filepath=TARGET, export_format='GLB', use_selection=True, export_animations=True, export_force_sampling=True,
            export_yup=True, export_image_format='JPEG', export_jpeg_quality=86)
if 'export_animation_mode' in props: opts['export_animation_mode'] = 'ACTIONS'
bpy.ops.export_scene.gltf(**opts)
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
print('EXPORTED', TARGET, 'triangles(before solidify-free count)', tris, [a.name for a in bpy.data.actions])
