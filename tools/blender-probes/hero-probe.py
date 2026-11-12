"""Prova locale: Combattente con armatura modellata in Blender (non nel repository).

Uso: <venv-bpy>/python hero-probe.py <fighter.glb> <cartella-texture-256> <out.glb>
Importa il GLB attuale (scheletro, pesi, sei clip invariati), aggiunge pezzi d'armatura
rigidi agganciati alle ossa (spallacci, corazza, gorgiera, cintura, falde, bracciali,
schinieri, ginocchiere) e una spada modellata sul palmo destro. Materiali PBR CC0
(Poly Haven metal_plate, brown_leather). Esporta con texture WebP.
"""
import sys, math
import bpy, bmesh
from mathutils import Vector, Matrix

args = [a for a in sys.argv if not a.startswith('--')]
SRC, TEX, OUT = args[-3], args[-2], args[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
scene = bpy.context.scene
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
arm.data.pose_position = 'REST'; bpy.context.view_layer.update()

def img(name, cs):
    i = bpy.data.images.load(f'{TEX}/{name}.png'); i.colorspace_settings.name = cs; return i

def pbr(name, key, tint=None, normal=1.0, metal_scale=1.0):
    mat = bpy.data.materials.new(name); mat.use_nodes = True; nt = mat.node_tree; b = nt.nodes['Principled BSDF']
    c = nt.nodes.new('ShaderNodeTexImage'); c.image = img(f'{key}_diff', 'sRGB')
    n = nt.nodes.new('ShaderNodeTexImage'); n.image = img(f'{key}_nor_gl', 'Non-Color')
    a = nt.nodes.new('ShaderNodeTexImage'); a.image = img(f'{key}_arm', 'Non-Color')
    nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = normal
    sp = nt.nodes.new('ShaderNodeSeparateColor')
    if tint:
        mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1
        mix.inputs['B'].default_value = (*tint, 1)
        nt.links.new(c.outputs['Color'], mix.inputs['A']); nt.links.new(mix.outputs['Result'], b.inputs['Base Color'])
    else: nt.links.new(c.outputs['Color'], b.inputs['Base Color'])
    nt.links.new(n.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    nt.links.new(a.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], b.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], b.inputs['Metallic'])
    return mat

def flat(name, rgb, metal, rough):
    mat = bpy.data.materials.new(name); mat.use_nodes = True; b = mat.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    return mat

def steel(name, rgb, rough):
    mat = pbr(name, 'metal', normal=.6); b = mat.node_tree.nodes['Principled BSDF']; nt = mat.node_tree
    for l in list(b.inputs['Base Color'].links): nt.links.remove(l)
    for l in list(b.inputs['Roughness'].links) + list(b.inputs['Metallic'].links): nt.links.remove(l)
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Metallic'].default_value = 1; b.inputs['Roughness'].default_value = rough
    return mat

M = {'steel': steel('hero-steel', (.62, .64, .68), .34), 'leather': pbr('hero-leather', 'leather', normal=.7),
     'brass': flat('hero-brass', (.55, .38, .14), .9, .32), 'blade': flat('hero-blade', (.78, .8, .84), 1., .22),
     'darksteel': steel('hero-darksteel', (.2, .22, .27), .42)}

def bone_frame(name):
    b = arm.data.bones[name]; return arm.matrix_world @ b.matrix_local, b

def finish(ob, bone, smooth_levels=2, bevel=.03):
    if bevel:
        m = ob.modifiers.new('bev', 'BEVEL'); m.width = bevel; m.segments = 2; m.limit_method = 'ANGLE'
    if smooth_levels:
        s = ob.modifiers.new('sub', 'SUBSURF'); s.levels = smooth_levels
    dg = bpy.context.evaluated_depsgraph_get(); new = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    old = ob.data; ob.modifiers.clear(); ob.data = new; bpy.data.meshes.remove(old)
    for p in new.polygons: p.use_smooth = True
    new.set_sharp_from_angle(angle=math.radians(40))
    # UV a scatola in metri
    bm = bmesh.new(); bm.from_mesh(new); uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        ax = max(range(3), key=lambda i: abs(f.normal[i])); a, c = [(1, 2), (0, 2), (0, 1)][ax]
        for l in f.loops: l[uv].uv = (l.vert.co[a] / .6, l.vert.co[c] / .6)
    bm.to_mesh(new); bm.free()
    frame, b = bone_frame(bone)
    ob.parent = arm; ob.parent_type = 'BONE'; ob.parent_bone = bone
    ob.matrix_parent_inverse = (frame @ Matrix.Translation((0, b.length, 0))).inverted()
    return ob

def mesh(name, mat, build):
    bm = bmesh.new(); build(bm); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob); me.materials.append(M[mat]); return ob

def box(bm, size, center, M_=Matrix.Identity(4), bulge=None):
    r = bmesh.ops.create_cube(bm, size=1)
    for v in r['verts']:
        p = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
        if bulge: p = bulge(p)
        v.co = M_ @ (p + Vector(center))

def ellipsoid(bm, radii, center, M_=Matrix.Identity(4), cut=None):
    r = bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=8, radius=1)
    for v in r['verts']:
        v.co = M_ @ (Vector((v.co.x * radii[0], v.co.y * radii[1], v.co.z * radii[2])) + Vector(center))

def tube(bm, r0, r1, y0, y1, M_, seg=12, flat_back=1.0):
    r = bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r0, radius2=r1, depth=y1 - y0)
    for v in r['verts']:  # cono lungo Z → asse Y dell'osso
        v.co = M_ @ Vector((v.co.x, v.co.z + (y0 + y1) / 2, v.co.y * flat_back))

# --- busto (coordinate mondo, posa di riposo; fronte = -Y) ---
def cuirass(p):
    k = max(0, 1 - abs(p.x) / .34)
    if p.y < 0: p.y -= .035 * k * (1 - abs(p.z) / .4)         # petto bombato
    p.x *= 1 - .2 * max(0, -p.z) / .35                         # vita più stretta
    return p
finish(mesh('hero-cuirass', 'steel', lambda bm: box(bm, (.6, .46, .7), (0, -.04, 2.86), bulge=cuirass)), 'torso', 1, .12)
finish(mesh('hero-cuirass-ridge', 'darksteel', lambda bm: box(bm, (.04, .04, .56), (0, -.31, 2.86))), 'torso', 1, .015)
finish(mesh('hero-gorget', 'darksteel', lambda bm: ellipsoid(bm, (.24, .22, .09), (0, .0, 3.27))), 'torso', 0, 0)
finish(mesh('hero-emblem', 'brass', lambda bm: box(bm, (.15, .03, .15), (0, -.325, 3.0), Matrix.Rotation(math.pi / 4, 4, 'Y') if False else Matrix.Identity(4))), 'torso', 1, .02)
finish(mesh('hero-belt', 'leather', lambda bm: box(bm, (.62, .5, .1), (0, -.03, 2.4))), 'torso', 1, .04)
finish(mesh('hero-buckle', 'brass', lambda bm: box(bm, (.14, .04, .1), (0, -.29, 2.4))), 'torso', 1, .015)
for s in (-1, 1):
    finish(mesh(f'hero-tasset-{s}', 'steel', lambda bm: box(bm, (.26, .05, .3), (s * .17, -.3, 2.16), Matrix.Rotation(s * .12, 4, 'Y'))), 'pelvis', 2, .03)

# --- arti (coordinate dell'osso: Y lungo l'osso) ---
for side, s in (('L', 1), ('R', -1)):
    F, b = bone_frame(f'arm_upper_{side}')
    up = F.inverted().to_3x3() @ Vector((0, 0, 1))  # «su» del mondo nello spazio dell'osso
    finish(mesh(f'hero-pauldron-{side}', 'steel', lambda bm: ellipsoid(bm, (.25, .27, .25), Vector((0, .1, 0)) + up * .1, F)), f'arm_upper_{side}', 1, 0)
    finish(mesh(f'hero-pauldron-lame-{side}', 'darksteel', lambda bm: ellipsoid(bm, (.21, .1, .21), Vector((0, .3, 0)) + up * .05, F)), f'arm_upper_{side}', 1, 0)
    finish(mesh(f'hero-pauldron-trim-{side}', 'brass', lambda bm: ellipsoid(bm, (.255, .03, .255), Vector((0, .2, 0)) + up * .08, F)), f'arm_upper_{side}', 0, 0)
    F, b = bone_frame(f'arm_lower_{side}')
    finish(mesh(f'hero-vambrace-{side}', 'steel', lambda bm: tube(bm, .105, .085, .06, .36, F)), f'arm_lower_{side}', 1, .01)
    finish(mesh(f'hero-vambrace-trim-{side}', 'brass', lambda bm: tube(bm, .11, .11, .05, .085, F)), f'arm_lower_{side}', 0, 0)
    F, b = bone_frame(f'leg_lower_{side}')
    finish(mesh(f'hero-greave-{side}', 'steel', lambda bm: tube(bm, .175, .15, .12, .68, F)), f'leg_lower_{side}', 1, .01)
    fwd = F.inverted().to_3x3() @ Vector((0, -1, 0))
    finish(mesh(f'hero-knee-{side}', 'darksteel', lambda bm: ellipsoid(bm, (.13, .11, .13), Vector((0, .03, 0)) + fwd * .1, F)), f'leg_lower_{side}', 1, 0)

# --- spada sul palmo destro (Y = direzione della mano) ---
F, b = bone_frame('palm_R')
finish(mesh('fighter-sword-grip', 'leather', lambda bm: tube(bm, .032, .03, -.1, .1, F, 8)), 'palm_R', 0, 0)
finish(mesh('fighter-sword-pommel', 'brass', lambda bm: ellipsoid(bm, (.05, .05, .05), (0, -.13, 0), F)), 'palm_R', 0, 0)
finish(mesh('fighter-sword-guard', 'brass', lambda bm: box(bm, (.36, .05, .07), (0, .13, 0), F)), 'palm_R', 1, .015)
def blade(bm):
    r = bmesh.ops.create_cube(bm, size=1)
    for v in r['verts']:
        t = v.co.y + .5                                   # 0 alla guardia, 1 in punta
        w = .095 * (1 - .55 * t) if v.co.y < .45 else 0   # punta
        v.co = F @ Vector((v.co.x * 2 * max(w, .004), .17 + t * 1.3, v.co.z * .028 * (1 - .4 * t)))
    bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs((F.inverted() @ e.verts[0].co).y - (F.inverted() @ e.verts[1].co).y) > .5], cuts=4)
finish(mesh('fighter-sword-blade', 'blade', blade), 'palm_R', 0, 0)

arm.data.pose_position = 'POSE'
tris = sum(len(p.vertices) - 2 for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith(('hero', 'fighter-sword')) for p in o.data.polygons)
print('TRIANGOLI ARMATURA', tris)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_image_format='WEBP', export_image_quality=82,
                          export_animations=True, export_skins=True, export_materials='EXPORT', export_extras=False)
print('ESPORTATO', OUT)
