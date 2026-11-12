"""Prova locale: Custode in Blender headless → GLB. Non è nel repository.

Uso: <venv-bpy>/python custode-probe.py <cartella-texture-512> <out.glb>
Costruisce il Custode per volumi di pietra scheggiata (bevel + suddivisione + displacement
+ decimazione), conserva i nomi delle articolazioni del Custode procedurale
(guardian-torso, guardian-left-arm, ...) così la posa di gioco resta quella di
src/visuals/guardian-redesign.js. Coordinate scritte in convenzione Three.js (Y su, fronte +Z).
"""
import sys, math, random
import bpy, bmesh
from mathutils import Vector, Matrix, Euler

args = [a for a in sys.argv if not a.startswith('--')]; TEX, OUT = args[-2], args[-1]
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def T(x, y, z):  # Three.js (Y su, +Z fronte) → Blender (Z su, -Y fronte)
    return Vector((x, -z, y))

# ---------- materiali ----------
def image(name, colorspace):
    img = bpy.data.images.load(f'{TEX}/{name}_256.png'); img.colorspace_settings.name = colorspace; return img

def stone_material():
    mat = bpy.data.materials.new('custode-stone'); mat.use_nodes = True
    nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    col = nt.nodes.new('ShaderNodeTexImage'); col.image = image('diff', 'sRGB')
    nor = nt.nodes.new('ShaderNodeTexImage'); nor.image = image('nor_gl', 'Non-Color')
    arm = nt.nodes.new('ShaderNodeTexImage'); arm.image = image('arm', 'Non-Color')
    nmap = nt.nodes.new('ShaderNodeNormalMap'); sep = nt.nodes.new('ShaderNodeSeparateColor')
    nt.links.new(col.outputs['Color'], bsdf.inputs['Base Color'])
    nt.links.new(nor.outputs['Color'], nmap.inputs['Color']); nt.links.new(nmap.outputs['Normal'], bsdf.inputs['Normal'])
    nt.links.new(arm.outputs['Color'], sep.inputs['Color'])
    nt.links.new(sep.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sep.outputs['Blue'], bsdf.inputs['Metallic'])
    return mat

def flat(name, rgb, metal=0., rough=.8, emit=None, strength=0.):
    mat = bpy.data.materials.new(name); mat.use_nodes = True; b = mat.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = strength
    return mat

M = {
    'stone': stone_material(),
    'iron': flat('custode-iron', (.05, .055, .07), .75, .45),
    'brass': flat('custode-brass', (.42, .29, .12), .9, .35),
    'cloth': flat('custode-cloth', (.10, .06, .15), 0, .92),
    'glow': flat('custode-glow', (1, .78, .45), 0, .4, (1, .74, .42), 2.2),
    'dark': flat('custode-dark', (.03, .03, .04), .1, .7),
}

# ---------- costruzione ----------
joints = {}
def joint(name, parent, x, y, z):
    e = bpy.data.objects.new(name, None); scene.collection.objects.link(e)
    if parent: e.parent = joints[parent]
    e.location = T(x, y, z); joints[name] = e; e['pieces'] = 0
    return e

clouds = bpy.data.textures.new('chips', 'VORONOI'); clouds.noise_scale = .32; clouds.distance_metric = 'DISTANCE'
fine = bpy.data.textures.new('grain', 'CLOUDS'); fine.noise_scale = .12

def box_uv(mesh, unit=1.1):
    bm = bmesh.new(); bm.from_mesh(mesh); uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        a, b = [(1, 2), (0, 2), (0, 1)][ax]
        for l in f.loops: l[uv].uv = (l.vert.co[a] / unit, l.vert.co[b] / unit)
    bm.to_mesh(mesh); bm.free()

def piece(jname, mat, size, at, rot=(0, 0, 0), taper=None, chip=.05, levels=2, keep=.24, shape='box'):
    """Blocco in coordinate locali della giuntura (convenzione Three.js)."""
    bm = bmesh.new()
    if shape == 'box': bmesh.ops.create_cube(bm, size=1)
    else: bmesh.ops.create_icosphere(bm, subdivisions=2, radius=.5)
    sx, sy, sz = size
    for v in bm.verts:
        x, y, z = v.co.x, v.co.z, -v.co.y  # Blender cube → assi Three
        if taper:  # taper = (fattore in alto, fattore in basso) su X e Z in funzione di Y
            k = taper[0] if y > 0 else taper[1]; x *= k; z *= (1 + (k - 1) * .5)
        v.co = Vector((x * sx, -z * sz, y * sy))
    me = bpy.data.meshes.new(f'{jname}-{joints[jname]["pieces"]}'); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(me.name, me); scene.collection.objects.link(ob)
    ob.parent = joints[jname]; ob.location = T(*at)
    r = rot; ob.rotation_mode = 'XYZ'; ob.rotation_euler = Euler((r[0], -r[2], r[1]))
    ob.data.materials.append(M[mat]); joints[jname]['pieces'] += 1
    if chip:
        bev = ob.modifiers.new('bev', 'BEVEL'); bev.width = min(size) * .12; bev.segments = 2; bev.limit_method = 'ANGLE'
        sub = ob.modifiers.new('sub', 'SUBSURF'); sub.subdivision_type = 'SIMPLE'; sub.levels = levels; sub.render_levels = levels
        d1 = ob.modifiers.new('chips', 'DISPLACE'); d1.texture = clouds; d1.strength = -chip; d1.mid_level = .15; d1.texture_coords = 'GLOBAL'
        d2 = ob.modifiers.new('grain', 'DISPLACE'); d2.texture = fine; d2.strength = chip * .35; d2.texture_coords = 'GLOBAL'
        dec = ob.modifiers.new('dec', 'DECIMATE'); dec.ratio = keep
    else:
        bev = ob.modifiers.new('bev', 'BEVEL'); bev.width = min(size) * .08; bev.segments = 1
    return ob

def bake_modifiers():
    dg = bpy.context.evaluated_depsgraph_get()
    for ob in [o for o in scene.objects if o.type == 'MESH']:
        new = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
        old = ob.data; ob.modifiers.clear(); ob.data = new; bpy.data.meshes.remove(old)
        # UV in metri nello spazio della giuntura (nessuno stiramento fra pezzi)
        new.transform(ob.matrix_basis); ob.matrix_basis = Matrix.Identity(4)
        box_uv(new)
        for p in new.polygons: p.use_smooth = True
        new.set_sharp_from_angle(angle=math.radians(48))

# Proporzioni: massa alta e larga sulle spalle, testa infossata, braccia lunghe con pugni
# enormi (la carica si legge dalla sagoma), gambe corte e piantate. Altezza ~4,3 m come prima.
joint('guardian-torso', None, 0, 2.15, 0)
piece('guardian-torso', 'dark', (1.25, 1.5, .8), (0, .35, -.08), chip=0)                                         # nucleo scuro: le fessure fra le lastre restano nere
piece('guardian-torso', 'stone', (1.6, 1.15, 1.0), (0, .7, -.12), rot=(.22, 0, 0), taper=(1.25, .72), chip=.08, levels=3, keep=.11)  # torace curvo in avanti
piece('guardian-torso', 'stone', (1.05, .7, .8), (0, -.35, 0), taper=(1.0, .85), chip=.06, keep=.22)          # bacino
for s in (-1, 1):
    piece('guardian-torso', 'stone', (.58, .72, .26), (s * .38, .5, .52), rot=(.1, s * .22, s * .08), chip=.05)  # pettorali
    piece('guardian-torso', 'stone', (.34, 1.7, .32), (s * .62, 1.25, -.62), rot=(.25, 0, -s * .3 + (.1 if s > 0 else 0)), chip=.06)  # architravi spezzati
    piece('guardian-torso', 'iron', (.12, .9, .62), (s * .74, .45, .02), chip=0)                                # fasce laterali
piece('guardian-torso', 'iron', (1.12, .14, .86), (0, -.02, 0), chip=0)                                         # cintura
piece('guardian-torso', 'brass', (.3, .16, .16), (0, -.02, .45), chip=0)
piece('guardian-torso', 'cloth', (.62, .95, .04), (0, -.95, .44), rot=(.08, 0, 0), chip=0)                     # tabarro
piece('guardian-torso', 'brass', (.64, .05, .06), (0, -.5, .47), chip=0)
piece('guardian-torso', 'iron', (.34, .9, .14), (0, .48, .6), chip=0)                                          # telaio del sigillo
joint('guardian-voice-seal', 'guardian-torso', 0, .5, .69)
piece('guardian-voice-seal', 'glow', (.11, .4, .08), (0, 0, 0), shape='ico', chip=0)
for i, (a, l) in enumerate([(.55, .42), (-2.5, .38), (2.6, .3)]):  # crepe luminose
    piece('guardian-voice-seal', 'glow', (.018, l, .02), (math.sin(a) * l * .5, math.cos(a) * l * .5, -.06), rot=(0, 0, -a), chip=0)
for i in range(3): piece('guardian-voice-seal', 'brass', (.26, .03, .04), (0, -.16 + i * .16, .07), chip=0)
joint('guardian-head', 'guardian-torso', 0, 1.38, .5)                                                         # testa bassa, infossata fra le spalle
piece('guardian-head', 'stone', (.5, .44, .5), (0, -.02, 0), taper=(.8, 1.05), chip=.045)
piece('guardian-head', 'stone', (.82, .24, .56), (0, .22, .08), rot=(.3, 0, 0), chip=.06)                         # arcata pesante
piece('guardian-head', 'dark', (.44, .09, .05), (0, .07, .29), chip=0)
piece('guardian-head', 'glow', (.36, .03, .03), (0, .07, .32), chip=0)                                          # fessura della voce
for s in (-1, 1):
    a = f'guardian-{"left" if s < 0 else "right"}-arm'; e = f'guardian-{"left" if s < 0 else "right"}-elbow'
    joint(a, 'guardian-torso', s * 1.08, .95, 0)
    big = 1.12 if s > 0 else 1.0  # spallacci asimmetrici: il destro (braccio della Frattura) è più massiccio
    piece(a, 'stone', (1.0 * big, .8 * big, .95 * big), (s * .14, .26, -.04), rot=(.12, 0, -s * .22), taper=(.8, 1.12), chip=.08, keep=.22)   # spallaccio
    piece(a, 'iron', (1.0 * big, .12, .94 * big), (s * .14, -.08, -.04), rot=(.12, 0, -s * .22), chip=0)
    piece(a, 'stone', (.46, .66, .46), (0, -.45, 0), chip=.05)
    joint(e, a, 0, -.82, 0)
    piece(e, 'stone', (.52, .72, .54), (0, -.3, .02), taper=(.9, 1.15), chip=.05)
    piece(e, 'iron', (.6, .12, .6), (0, -.12, .02), chip=0)
    piece(e, 'brass', (.62, .05, .62), (0, -.2, .02), chip=0)
    piece(e, 'stone', (.9 * big, .72 * big, .84 * big), (0, -.98, .08), taper=(1.0, .88), chip=.08, keep=.22)                      # pugno
    for i in range(3): piece(e, 'stone', (.2, .2, .22), (-.26 + i * .26, -1.2, .47), chip=.03, levels=1, keep=.5)  # nocche
    piece(e, 'glow', (.025, .55, .025), (s * .27, -.85, .43), chip=0)                                             # vena luminosa sul pugno: segnale leggibile da lontano
    piece(e, 'glow', (.5, .025, .025), (0, -.62, .47), chip=0)
    l = f'guardian-{"left" if s < 0 else "right"}-leg'
    joint(l, None, s * .45, 1.5, 0)
    piece(l, 'stone', (.56, .72, .58), (0, -.3, 0), taper=(1.1, .9), chip=.05)
    piece(l, 'iron', (.42, .14, .46), (0, -.72, .04), chip=0)
    piece(l, 'stone', (.5, .55, .52), (0, -1.0, .05), chip=.05)
    piece(l, 'stone', (.62, .26, .86), (0, -1.38, .15), chip=.05)                                                # piede

bake_modifiers()
# Una mesh per giuntura (primitive per materiale): poche draw call.
for name, j in joints.items():
    kids = [o for o in j.children if o.type == 'MESH']
    if len(kids) > 1:
        with bpy.context.temp_override(active_object=kids[0], selected_editable_objects=kids, object=kids[0]):
            bpy.ops.object.join()
    if kids: kids[0].name = name + '-mesh'
tris = sum(len(p.vertices) - 2 for o in scene.objects if o.type == 'MESH' for p in o.data.polygons)
print('TRIANGOLI', tris, 'MESH', sum(1 for o in scene.objects if o.type == 'MESH'))
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=True,
                          export_image_format='WEBP', export_image_quality=80, export_materials='EXPORT', export_extras=False,
                          export_draco_mesh_compression_enable=('--draco' in sys.argv), export_draco_mesh_compression_level=7)
print('ESPORTATO', OUT)
