"""Blender 4.3: -b -t 2 --python SCRIPT -- SOURCE_DIRECTORY OUTPUT_DIRECTORY.

System G6 CC0 anatomy, weights and motion; original class presentation below.
These are first rigged production bases, not reproductions of the concept faces.
No source texture pixels are modified. No image API is used.
"""
import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

source, output = map(Path, sys.argv[sys.argv.index('--') + 1:])
output.mkdir(parents=True, exist_ok=True)
roles = {
    'tank': dict(sex='male', head='head_3', hair='hair_1', armor='heavy_armor',
                 boots='heavy_boots', gloves='heavy_gloves', color=(.12,.21,.28),
                 channel='channel_main_hand_melee', attack='cast_main_hand_melee', special='cast_off_hand_shield'),
    'fighter': dict(sex='female', head='head_default', hair='hair_3', armor='medium_armor',
                    boots='medium_boots', gloves='medium_gloves', color=(.38,.17,.07),
                    channel='channel_main_hand_melee', attack='cast_main_hand_melee', special='cast_main_hand_melee_2'),
    'assassin': dict(sex='male', head='head_4', hair='hair_2', armor='light_armor_2',
                     boots='light_boots', gloves='light_gloves', color=(.16,.10,.22),
                     channel='channel_dual_wield_melee', attack='cast_dual_wield_melee', special='cast_dual_wield_melee_2'),
    'mage': dict(sex='female', head='head_default', hair='hair_2', armor='light_armor_3',
                 boots='light_boots', gloves='light_gloves', color=(.17,.08,.26),
                 channel='channel_unarmed_magic', attack='cast_unarmed_magic', special='cast_unarmed_magic_2'),
    'healer': dict(sex='male', head='head_2', hair='hair_5', armor='light_armor_3',
                   boots='light_boots', gloves='light_gloves', color=(.39,.44,.29),
                   channel='channel_unarmed_magic', attack='cast_unarmed_magic', special='cast_unarmed_magic_2'),
}
report = dict(source='System G6 / Modular RPG Characters', license='CC0-1.0',
              provenance='../ranger/SOURCE.json', status='first rigged bases; concept likeness incomplete', characters={})

def solid_material(name, color, roughness=.8, metallic=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bs = mat.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Roughness'].default_value = roughness
    bs.inputs['Metallic'].default_value = metallic
    return mat

for role, spec in roles.items():
    prefix = 'human_' + spec['sex']
    bpy.ops.wm.open_mainfile(filepath=str(source / (prefix + '.blend')))
    selected = {prefix, *(prefix + '_' + spec[k] for k in ['head','hair','armor','boots','gloves'])}
    if role in ['mage','healer']:
        selected.remove(prefix+'_'+spec['armor'])
        selected.add(prefix+'_body_default')
    missing = selected - set(bpy.data.objects.keys())
    if missing:
        raise RuntimeError(f'{role}: source modules missing {missing}')
    for obj in list(bpy.data.objects):
        if obj.name not in selected:
            bpy.data.objects.remove(obj, do_unlink=True)
    for collection in bpy.data.collections:
        collection.hide_viewport = False
        collection.hide_render = False
    rig = bpy.data.objects[prefix]
    rig.data.pose_position = 'REST'
    for obj in list(bpy.data.objects):
        if obj.name not in bpy.context.scene.collection.objects:
            bpy.context.scene.collection.objects.link(obj)
        obj.hide_set(False)
        obj.hide_render = False
        obj.hide_viewport = False
        if obj.type != 'MESH':
            continue
        for poly in obj.data.polygons:
            poly.use_smooth = True
        transform = obj.matrix_world.copy()
        obj.parent = rig
        obj.matrix_world = transform
        modifier = next((m for m in obj.modifiers if m.type == 'ARMATURE'), None)
        if not modifier:
            modifier = obj.modifiers.new('Weighted character binding', 'ARMATURE')
        modifier.object = rig
        modifier.show_viewport = modifier.show_render = True
        for mat in obj.data.materials:
            if not mat:
                continue
            mat.use_nodes = True
            nodes = mat.node_tree.nodes
            nodes.clear()
            surface = nodes.new('ShaderNodeBsdfPrincipled')
            surface.inputs['Roughness'].default_value = .78
            out = nodes.new('ShaderNodeOutputMaterial')
            mat.node_tree.links.new(surface.outputs['BSDF'], out.inputs['Surface'])
            texname = mat.name.replace('mat_', 'tex_').replace('_skirt','') + '.png'
            path = source / 'textures' / texname
            if path.exists():
                tex = nodes.new('ShaderNodeTexImage')
                tex.image = bpy.data.images.load(str(path), check_existing=True)
                mat.node_tree.links.new(tex.outputs['Color'], surface.inputs['Base Color'])
            else:
                # Upstream male heavy gear has no matching PNG in the archive.
                # Explicit opaque PBR fallback, never leave the default white.
                color = (.075,.115,.15) if 'armor' in mat.name else (.045,.027,.018)
                surface.inputs['Base Color'].default_value = (*color,1)
                if 'armor' in mat.name: surface.inputs['Metallic'].default_value = .7
            if 'armor' in mat.name:
                surface.inputs['Roughness'].default_value = .68 if role in ['tank','fighter'] else .88
            if 'head' in mat.name:
                surface.inputs['Roughness'].default_value = .62

    cloth = solid_material(role + ' expedition cloth', spec['color'], .9)
    brass = solid_material(role + ' worn seal brass', (.40,.27,.10), .5, .65)
    leather = solid_material(role + ' leather', (.065,.035,.023), .75)

    def bind(obj, bone='torso'):
        obj.parent = rig
        group = obj.vertex_groups.new(name=bone)
        group.add(list(range(len(obj.data.vertices))), 1, 'REPLACE')
        mod = obj.modifiers.new('Character bone binding', 'ARMATURE')
        mod.object = rig
        return obj

    # A fitted original overgarment with ring weights blended over pelvis/torso.
    # Keep armor visible, no superficial replacement of all materials with a tint.
    if role in ['mage', 'healer', 'assassin']:
        rows = [(1.20,.48,.34),(1.65,.43,.32),(2.12,.38,.32),(2.48,.47,.35),(2.85,.50,.33),(3.10,.34,.24),(3.32,.15,.14)]
        vertices, faces = [], []
        count = 32
        for z, rx, ry in rows:
            for j in range(count):
                angle = j / count * math.tau
                vertices.append((math.sin(angle)*rx, math.cos(angle)*ry, z))
        for row in range(len(rows)-1):
            for j in range(count):
                # Open front below waist prevents the garment bridging both legs.
                if row < 2 and abs((j+.5)/count*math.tau - math.pi) < .38:
                    continue
                a = row*count+j
                b = row*count+(j+1)%count
                faces.append((a,a+count,b+count,b))
        mesh = bpy.data.meshes.new(role+' tailored coat mesh')
        mesh.from_pydata(vertices, [], faces)
        mesh.update()
        coat = bpy.data.objects.new(role+' tailored expedition coat', mesh)
        bpy.context.scene.collection.objects.link(coat)
        coat.data.materials.append(cloth)
        coat.parent = rig
        groups = {name: coat.vertex_groups.new(name=name) for name in ['pelvis','torso']}
        for i, (_,_,z) in enumerate(vertices):
            torso_weight = max(0, min(1, (z-2.15)/.55))
            for name, value in [('torso',torso_weight),('pelvis',1-torso_weight)]:
                if value: groups[name].add([i],value,'REPLACE')
        mod = coat.modifiers.new('Weighted torso coat', 'ARMATURE')
        mod.object = rig
        coat.modifiers.new('Cloth thickness', 'SOLIDIFY').thickness = .014
        for p in mesh.polygons: p.use_smooth=True

    def box(name, center, size, mat, bone='pelvis'):
        bpy.ops.mesh.primitive_cube_add(size=1, location=center)
        obj = bpy.context.object
        obj.name = role + ' ' + name
        obj.scale = size
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        obj.data.materials.append(mat)
        bevel = obj.modifiers.new('Soft equipment edges','BEVEL')
        bevel.width=.012
        bevel.segments=2
        bpy.ops.object.modifier_apply(modifier=bevel.name)
        return bind(obj,bone)

    box('belt buckle',(0,-.345,2.18),(.12,.035,.10),brass)
    if role == 'healer':
        box('expedition medical satchel',(.46,-.05,1.98),(.36,.21,.39),leather)
        box('satchel seal',(.46,-.168,1.98),(.10,.02,.10),brass)
    if role == 'assassin':
        for x in [-.30,.30]: box('dagger sheath',(x,-.23,1.94),(.09,.08,.42),leather)

    # Retain native weighted anatomy and clips; do not turn subdivision into a
    # claim that a generic face now matches an approved cinematic concept.
    mapping = {'idle':'idle', 'run':'run', 'jump':'dodge', spec['channel']:'prepare',
               spec['attack']:'attack', spec['special']:'special'}
    wanted = {prefix+'_'+key:value for key,value in mapping.items()}
    for action in list(bpy.data.actions):
        if action.name not in wanted:
            bpy.data.actions.remove(action)
        else:
            newname = wanted[action.name]
            action.name = newname
            action.use_fake_user = True
    if set(a.name for a in bpy.data.actions) != set(mapping.values()):
        raise RuntimeError(f'{role}: required clips missing')
    if rig.animation_data:
        rig.animation_data.action = bpy.data.actions.get('idle')
        for track in list(rig.animation_data.nla_tracks):
            rig.animation_data.nla_tracks.remove(track)
    rig.data.pose_position = 'POSE'
    bpy.context.scene.render.fps = 30
    bpy.ops.object.select_all(action='SELECT')
    path = output / (role+'.glb')
    options = dict(filepath=str(path),export_format='GLB',use_selection=True,
                   export_animations=True,export_force_sampling=True,
                   export_yup=True,export_animation_mode='ACTIONS',
                   use_visible=False,use_renderable=False)
    if 'export_all_armature_actions' in bpy.ops.export_scene.gltf.get_rna_type().properties.keys():
        options['export_all_armature_actions'] = True
    bpy.ops.export_scene.gltf(**options)
    report['characters'][role] = dict(file=path.name,bytes=path.stat().st_size,
        sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
        clips=sorted(a.name for a in bpy.data.actions),bones=len(rig.data.bones),
        limitations=['generic upstream face; concept likeness not sculpted',
                     'source jump used provisionally for dodge', 'coat needs motion/clipping review'])
    print('CHARACTER_EXPORTED',role,str(path),flush=True)
(output/'SOURCE.json').write_text(json.dumps(report,indent=2)+'\n')
