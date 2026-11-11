"""Run with Blender 4.3: --background --python script -- SOURCE_BLEND OUTPUT_GLB.
Source: System G6, Modular RPG Characters, CC0. No image pixels are modified.
"""
import bpy,sys,json,math
from mathutils import Vector
from pathlib import Path
source,target=map(Path,sys.argv[sys.argv.index('--')+1:])
bpy.ops.wm.open_mainfile(filepath=str(source))
keep={'human_female','human_female_head_default','human_female_body_default','human_female_medium_boots','human_female_light_gloves_3'}
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
# New tailored surfaces and swept hair are modeled in the source bind space.
rig.data.pose_position='REST'

def material(name,color,roughness=.8,metallic=0):
 m=bpy.data.materials.new(name);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=roughness;bs.inputs['Metallic'].default_value=metallic
 return m
coat=material('Daria petrol woven coat',(.028,.105,.128),.88)
leather=material('Daria dark leather',(.055,.027,.016),.56)
trim=material('Daria aged brass',(.40,.25,.085),.4,.72)
hair=material('Daria dark chestnut hair',(.025,.014,.010),.76)
hairlight=material('Daria chestnut strands',(.058,.030,.018),.72)
scarf=material('Daria sage scarf',(.22,.28,.145),.95)
paper=material('Daria notebook pages',(.56,.45,.27),.95)

def bind(obj,kind='torso'):
 obj.parent=rig;obj.matrix_parent_inverse=rig.matrix_world.inverted();obj.select_set(True)
 mod=obj.modifiers.new('Daria weighted garment','ARMATURE');mod.object=rig
 groups={n:obj.vertex_groups.new(name=n) for n in (['head'] if kind=='head' else ['torso','pelvis'])}
 for v in obj.data.vertices:
  if kind=='head':groups['head'].add([v.index],1,'REPLACE')
  else:
   weight=1 if kind=='torso' else 0 if kind=='pelvis' else max(0,min(1,(v.co.z-2.08)/.55))
   if weight:groups['torso'].add([v.index],weight,'REPLACE')
   if weight<1:groups['pelvis'].add([v.index],1-weight,'REPLACE')
 for poly in obj.data.polygons:poly.use_smooth=True
 uv=obj.data.uv_layers.new(name='Daria garment UV')
 for loop in obj.data.loops:
  p=obj.data.vertices[loop.vertex_index].co
  uv.data[loop.index].uv=(math.atan2(p.y+.015,p.x)/math.tau+.5,(p.z-2.0)/1.4)
 return obj

def mesh(name,verts,faces,mat,kind='torso'):
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update();obj=bpy.data.objects.new(name,data);bpy.context.scene.collection.objects.link(obj);obj.data.materials.append(mat);return bind(obj,kind)

def tube(name,path,radius,mat,kind='torso'):
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=2;curve.bevel_depth=radius;curve.bevel_resolution=1
 spline=curve.splines.new('BEZIER');spline.bezier_points.add(len(path)-1)
 for p,co in zip(spline.bezier_points,path):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 obj=bpy.data.objects.new(name,curve);bpy.context.scene.collection.objects.link(obj)
 bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH')
 obj.data.materials.append(mat);return bind(obj,kind)

# Coat body: open V collar, fitted waist, continuous smoothed panels.
bands=[(2.12,.285,.26),(2.27,.305,.27),(2.55,.325,.30),(2.83,.38,.325),(3.05,.395,.30),(3.23,.24,.22)]
verts=[];faces=[];segments=40
for row,(z,rx,ry) in enumerate(bands):
 gap=.11 if row<3 else .12+(row-2)*.10
 for i in range(segments+1):
  a=-math.pi/2+gap+i/segments*(2*math.pi-2*gap)
  fold=math.cos(a*9)*.008*(1-row/len(bands))
  verts.append(((rx+fold)*math.cos(a),-.015+(ry+fold)*math.sin(a),z))
for row in range(len(bands)-1):
 for i in range(segments):
  a=row*(segments+1)+i;b=a+segments+1;faces.append((a,a+1,b+1,b))
mesh('Daria fitted expedition jacket',verts,faces,coat,'blend')
# Front seams frame the opening; small original loops follow the garment.
for side in [-1,1]:
 tube('Daria jacket edge '+str(side),[(side*.03,-.29,2.13),(side*.035,-.315,2.55),(side*.09,-.34,2.9),(side*.13,-.21,3.23)],.009,leather,'blend')
 tube('Daria brass stitching '+str(side),[(side*.06,-.292,2.16),(side*.07,-.32,2.55),(side*.12,-.345,2.91)],.0025,trim,'blend')
 # Raised lapels, bevelled by their folded profile rather than a flat decal.
 mesh('Daria folded lapel '+str(side),[(side*.11,-.225,3.24),(side*.23,-.29,3.15),(side*.13,-.36,2.9),(side*.07,-.34,2.84)],[(0,1,2),(0,2,3)],leather)
# Shoulder-to-waist harness and a belt, all original weighted geometry.
path=[(-.24,-.29,3.16),(-.12,-.365,2.94),(.05,-.33,2.65),(.23,-.285,2.28)]
verts=[];faces=[]
for i,p in enumerate(path):
 direction=Vector(path[min(i+1,len(path)-1)])-Vector(path[max(0,i-1)])
 normal=Vector((direction.z,0,-direction.x)).normalized()*.032
 for offset,depth in [(-1,-.007),(1,-.007),(1,.007),(-1,.007)]:verts.append(tuple(Vector(p)+normal*offset+Vector((0,depth,0))))
for i in range(len(path)-1):
 for j in range(4):faces.append((i*4+j,i*4+(j+1)%4,(i+1)*4+(j+1)%4,(i+1)*4+j))
mesh('Daria flat leather shoulder harness',verts,faces,leather,'blend')
for z in [2.18,2.25]:
 path=[(.30*math.cos(i/32*math.tau),-.015+.235*math.sin(i/32*math.tau),z) for i in range(33)]
 tube('Daria waist binding '+str(z),path,.022,leather,'pelvis')
# Organic cap with a high frontal hairline and low nape, following the skull.
verts=[];faces=[];around=48;rings=14
for j in range(rings+1):
 for i in range(around+1):
  phi=i/around*math.tau
  edgeZ=3.65+.20*max(0,-math.sin(phi))**3+.08*(1-abs(math.sin(phi)))
  limit=math.acos(max(-1,min(1,(edgeZ-3.74)/.29)))
  theta=.025+j/rings*(limit-.025)
  verts.append((.215*math.sin(theta)*math.cos(phi),.018+.282*math.sin(theta)*math.sin(phi),3.74+.30*math.cos(theta)))
for j in range(rings):
 for i in range(around):
  a=j*(around+1)+i;b=a+around+1;faces.append((a,b,b+1,a+1))
mesh('Daria swept hair cap',verts,faces,hair,'head')
for lock in range(18):
 start=-math.pi/2+(lock-8.5)*.075
 path=[]
 for n in range(9):
  t=n/8;phi=start+(1 if lock>5 else -1)*t*(2.70 if lock>5 else 2.10);theta=.15+t*1.35
  path.append((.223*math.sin(theta)*math.cos(phi),.018+.293*math.sin(theta)*math.sin(phi),3.74+.309*math.cos(theta)))
 tube('Daria swept lock '+str(lock),path,.006+(lock%3)*.002,hairlight if lock%4==0 else hair,'head')
for side in [-1,1]:
 tube('Daria temple wisp '+str(side),[(side*.17,-.11,3.85),(side*.205,-.14,3.72),(side*.188,-.18,3.57)],.009,hair,'head')
# Dense three-strand braid, anchored to the head and resting over the shoulder.
for strand in range(3):
 path=[]
 for n in range(27):
  t=n/26;a=t*math.pi*12+strand*math.tau/3
  path.append((.12+.26*t+math.sin(a)*(.036-.012*t),.22-.51*t**1.1+math.cos(a)*(.027-.009*t),3.72-.87*t))
 tube('Daria braided strand '+str(strand),path,.023,hairlight if strand==1 else hair,'head')
# A proper cloth neckline; folds are geometry, not a torus primitive.
for band in range(3):
 path=[(.22*math.cos(i/32*math.tau),.005+.16*math.sin(i/32*math.tau),3.36+band*.038+.018*math.cos(i/32*math.tau*4)) for i in range(33)]
 tube('Daria scarf fold '+str(band),path,.024,scarf)
# Subdivide only the anatomical head; UVs and original painted features survive.
head=bpy.data.objects['human_female_head_default'];bpy.context.view_layer.objects.active=head
for vertex in head.data.vertices:
 if vertex.co.z<3.75:vertex.co.x*=.96;vertex.co.z=3.75+(vertex.co.z-3.75)*1.045
bpy.ops.object.select_all(action='DESELECT');head.select_set(True)
sub=head.modifiers.new('Daria smooth facial topology','SUBSURF');sub.levels=1
bpy.ops.object.modifier_move_up(modifier=sub.name)
bpy.ops.object.modifier_apply(modifier=sub.name)
# Replace the coarse shared clothing palette, retaining anatomical geometry/weights.
body=bpy.data.objects['human_female_body_default']
shirt=material('Daria dark expedition undershirt',(.025,.060,.065),.9)
trousers=material('Daria olive fitted trousers',(.045,.055,.035),.92)
body.data.materials.clear()
for m in [shirt,trousers,coat]:body.data.materials.append(m)
for poly in body.data.polygons:
 center=sum((body.data.vertices[i].co for i in poly.vertices),Vector())/len(poly.vertices)
 poly.material_index=1 if center.z<2.23 else 2 if abs(center.x)>.29 else 0
for obj in bpy.data.objects:
 if obj.type=='MESH' and 'gloves' in obj.name:
  obj.data.materials.clear();obj.data.materials.append(leather)
# An original map notebook on the belt, with dimensional pages and clasp.
def box(name,center,size,mat):
 bpy.ops.mesh.primitive_cube_add(size=1,location=center);obj=bpy.context.object;obj.name=name;obj.scale=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 bevel=obj.modifiers.new('Soft leather edges','BEVEL');bevel.width=.009;bevel.segments=2;bpy.ops.object.modifier_apply(modifier=bevel.name)
 obj.data.materials.append(mat);return bind(obj,'pelvis')
box('Daria notebook pages',(.37,-.12,2.03),(.20,.085,.30),paper)
for y in [-.175,-.065]:box('Daria notebook leather cover',(.37,y,2.03),(.23,.022,.34),leather)
box('Daria notebook brass clasp',(.37,-.194,2.03),(.042,.018,.075),trim)
# Merge authored pieces while preserving their per-vertex bone weights.
parts=[o for o in bpy.data.objects if o.type=='MESH' and o.name.startswith('Daria ')]
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();bpy.context.object.name='Daria tailored outfit and swept hair'
rig.data.pose_position='POSE'
# Restore every selected mesh after operators used during modeling.
for obj in bpy.data.objects:obj.hide_set(False);obj.select_set(True)

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
