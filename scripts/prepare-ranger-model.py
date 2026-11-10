"""Run with Blender 4.3: --background --python script -- SOURCE_BLEND OUTPUT_GLB.
Source: System G6, Modular RPG Characters, CC0. No image pixels are modified.
"""
import bpy,sys,json
from pathlib import Path
source,target=map(Path,sys.argv[sys.argv.index('--')+1:])
bpy.ops.wm.open_mainfile(filepath=str(source))
keep={'human_female','human_female_head_default','human_female_hair_3','human_female_medium_armor','human_female_medium_boots','human_female_medium_gloves'}
for obj in list(bpy.data.objects):
 if obj.name not in keep:bpy.data.objects.remove(obj,do_unlink=True)
for obj in bpy.data.objects:
 if obj.name not in bpy.context.scene.collection.objects:bpy.context.scene.collection.objects.link(obj)
for collection in bpy.data.collections:
 collection.hide_viewport=False;collection.hide_render=False
for obj in bpy.data.objects:
 obj.hide_set(False);obj.hide_render=False;obj.hide_viewport=False;obj.select_set(True)
 if obj.type=='MESH':
  for poly in obj.data.polygons:poly.use_smooth=True
  for mat in obj.data.materials:
   if not mat:continue
   mat.use_nodes=True;nodes=mat.node_tree.nodes;nodes.clear()
   output=nodes.new('ShaderNodeOutputMaterial');shader=nodes.new('ShaderNodeBsdfPrincipled')
   shader.inputs['Roughness'].default_value=.82
   texname=mat.name.replace('mat_','tex_').replace('_skirt','')+'.png'
   path=source.parent/'textures'/texname
   if path.exists():
    tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(path),check_existing=True)
    mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
    # Opaque texture atlas: no transparent glTF sorting surprises.
   mat.node_tree.links.new(shader.outputs['BSDF'],output.inputs['Surface'])
rig=bpy.data.objects['human_female'];bpy.context.view_layer.objects.active=rig
# Modular clothes carry weights but the source does not bind them to the rig.
# Preserve their world transform and explicitly enable weighted deformation.
for obj in bpy.data.objects:
 if obj.type=='MESH':
  transform=obj.matrix_world.copy();obj.parent=rig;obj.matrix_world=transform
  modifier=next((m for m in obj.modifiers if m.type=='ARMATURE'),None)
  if not modifier:modifier=obj.modifiers.new('Mythwood skeleton binding','ARMATURE')
  modifier.object=rig;modifier.show_viewport=True;modifier.show_render=True
# Export just the motion needed for this first character; no unused spells/classes.
keep_actions=['idle','run','channel_two_handed_bow','cast_two_handed_bow','jump']
for action in list(bpy.data.actions):
 if action.name not in ['human_female_'+n for n in keep_actions]:bpy.data.actions.remove(action)
if rig.animation_data:
 rig.animation_data.action=bpy.data.actions.get('human_female_idle')
 for track in list(rig.animation_data.nla_tracks):rig.animation_data.nla_tracks.remove(track)
for action in bpy.data.actions:action.use_fake_user=True
bpy.context.scene.render.fps=30
props=bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
opts=dict(filepath=str(target),export_format='GLB',use_selection=True,export_animations=True,export_force_sampling=True,export_yup=True,use_visible=False,use_renderable=False)
if 'export_animation_mode' in props:opts['export_animation_mode']='ACTIONS'
if 'export_all_armature_actions' in props:opts['export_all_armature_actions']=True
bpy.ops.export_scene.gltf(**opts)
print('EXPORTED',target,[(a.name,tuple(a.frame_range)) for a in bpy.data.actions])
