"""Read-only check of the delivered fern's glTF cutout, from repository root."""
from pathlib import Path
import json
from PIL import Image
root=Path('public/art/environment-pass02')
gltf=json.loads((root/'fern.gltf').read_text())
result=[]
for mat in gltf['materials']:
    pbr=mat['pbrMetallicRoughness']
    image=gltf['images'][gltf['textures'][pbr['baseColorTexture']['index']]['source']]
    tex=Image.open(root/image['uri'])
    extrema=tex.getchannel('A').getextrema() if 'A' in tex.getbands() else (255,255)
    factor=pbr.get('baseColorFactor',[1,1,1,1])[3]
    cutoff=mat.get('alphaCutoff',.5)
    result.append({'name':mat['name'],'alphaMode':mat.get('alphaMode'),'image':image['uri'],
        'mode':tex.mode,'alphaExtrema':extrema,'alphaFactor':factor,'cutoff':cutoff,
        'hasCutoutAndOpaquePixels':extrema[0]/255*factor<cutoff<=extrema[1]/255*factor})
print(json.dumps(result,indent=2))
