"""ART-02 — prepara le texture CC0 della piazza (Poly Haven) in modo riproducibile.

Uso: python3 -I scripts/prepare-art-pass02.py <cartella-cache>
Scarica (o riusa dalla cache) le mappe 1k JPG, registra l'hash delle sorgenti, le riduce
alla risoluzione di gioco e scrive public/art/environment-pass02/ con manifest.json.
Convenzioni: *_color = sRGB; *_normal = dati lineari, OpenGL (+Y); *_arm = dati lineari
(R occlusione, G ruvidità, B metallo). Nessuna API a pagamento, nessuna chiave.
"""
import hashlib, io, json, sys, urllib.request, pathlib
from PIL import Image

CACHE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'test-results/art02-sources')
OUT = pathlib.Path('public/art/environment-pass02')
SETS = {
    # id: (Poly Haven slug, lato in px, uso)
    'cobble': ('patterned_cobblestone', 512, 'pavimento principale della piazza'),  # Rob Tuytel
    'flagstone': ('stone_tiles_02', 512, 'lastroni del cerchio dello scontro'),
    'ashlar': ('medieval_blocks_03', 512, 'colonne, archi, basamenti'),
    'slate': ('castle_wall_slates', 256, 'edifici e muri di fondo'),
}
MAPS = {'color': ('diff', 80), 'normal': ('nor_gl', 78), 'arm': ('arm', 72)}
URL = 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/{slug}/{slug}_{kind}_1k.jpg'
sha = lambda b: hashlib.sha256(b).hexdigest()

def source(slug, kind):
    path = CACHE / f'{slug}_{kind}_1k.jpg'
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(URL.format(slug=slug, kind=kind), headers={'User-Agent': 'asset-prep/1.0'})
        with urllib.request.urlopen(req, timeout=60) as r: path.write_bytes(r.read())
    return path.read_bytes()

manifest = {'generator': 'scripts/prepare-art-pass02.py', 'license': 'CC0 1.0 (Poly Haven, https://polyhaven.com/license)',
            'conventions': {'color': 'sRGB', 'normal': 'lineare, OpenGL +Y', 'arm': 'lineare: R=AO, G=ruvidità, B=metallo'}, 'assets': []}
OUT.mkdir(parents=True, exist_ok=True)
for key, (slug, size, use) in SETS.items():
    entry = {'id': key, 'source': f'https://polyhaven.com/a/{slug}', 'slug': slug, 'use': use, 'size': size, 'files': []}
    for name, (kind, quality) in MAPS.items():
        raw = source(slug, kind)
        img = Image.open(io.BytesIO(raw)).convert('RGB').resize((size, size), Image.LANCZOS)
        buf = io.BytesIO(); img.save(buf, 'JPEG', quality=quality, optimize=True, progressive=False, subsampling=2)
        data = buf.getvalue(); out = OUT / f'{key}_{name}.jpg'; out.write_bytes(data)
        entry['files'].append({'file': out.name, 'from': URL.format(slug=slug, kind=kind), 'sourceSha256': sha(raw),
                               'transform': f'1024→{size} Lanczos, JPEG q{quality}', 'sha256': sha(data), 'bytes': len(data)})
    manifest['assets'].append(entry)
# Modelli: glTF 1k di Poly Haven, texture ridotte e ARM sostituita da valori costanti
# (risparmio di byte; la felce resta opaca e non metallica). Il .bin resta identico.
MODELS = {'fern': ('fern_02', 256, 'felci lungo i bordi e fra le rovine')}
def fetch(url, path):
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(url, headers={'User-Agent': 'asset-prep/1.0'})
        with urllib.request.urlopen(req, timeout=60) as r: path.write_bytes(r.read())
    return path.read_bytes()
for key, (slug, size, use) in MODELS.items():
    # Gli URL dei file inclusi vengono dall'API pubblica dei file di Poly Haven (salvata in cache).
    maps = json.loads(fetch(f'https://api.polyhaven.com/files/{slug}', CACHE / f'{slug}_files.json')); files = maps['gltf']['1k']['gltf']
    urls = {pathlib.Path(n).name: v['url'] for n, v in files['include'].items()}
    MODEL_URL_OF = lambda name: files['url'] if name.endswith('.gltf') else urls[pathlib.Path(name).name]
    gltf_raw = fetch(files['url'], CACHE / f'{slug}_1k.gltf')
    gltf = json.loads(gltf_raw)
    entry = {'id': key, 'source': f'https://polyhaven.com/a/{slug}', 'slug': slug, 'use': use, 'size': size, 'files': []}
    keep = {}
    for image in gltf['images']:
        uri = image['uri']; kind = 'color' if '_diff_' in uri else 'normal' if '_nor_gl_' in uri else 'arm'
        raw = fetch(MODEL_URL_OF(uri), CACHE / pathlib.Path(uri).name)
        if kind == 'arm': image['uri'] = None; continue
        img = Image.open(io.BytesIO(raw)).convert('RGB').resize((size, size), Image.LANCZOS)
        if kind == 'color':
            # Il materiale è alphaMode MASK: il colore porta la maschera CC0 «Alpha» del set nel canale A
            # (PNG RGBA), altrimenti il ritaglio non avrebbe alcun dato. Maschera binarizzata a 0/255.
            alpha_url = maps['Alpha']['1k']['png']['url']
            alpha_raw = fetch(alpha_url, CACHE / pathlib.Path(alpha_url).name)
            mask = Image.open(io.BytesIO(alpha_raw)).convert('L').resize((size, size), Image.LANCZOS).point(lambda v: 255 if v >= 128 else 0)
            img.putalpha(mask)
            buf = io.BytesIO(); img.save(buf, 'PNG', optimize=True); data = buf.getvalue()
            name = f'{key}_{kind}.png'; image['mimeType'] = 'image/png'
            entry['files'].append({'file': name, 'from': [MODEL_URL_OF(uri), alpha_url], 'sourceSha256': [sha(raw), sha(alpha_raw)],
                                   'transform': f'colore 1024→{size} Lanczos + maschera Alpha 1024→{size} Lanczos soglia 128 → PNG RGBA', 'sha256': sha(data), 'bytes': len(data)})
        else:
            buf = io.BytesIO(); img.save(buf, 'JPEG', quality=80, optimize=True, subsampling=2); data = buf.getvalue()
            name = f'{key}_{kind}.jpg'; image['mimeType'] = 'image/jpeg'
            entry['files'].append({'file': name, 'from': MODEL_URL_OF(uri), 'sourceSha256': sha(raw), 'transform': f'1024→{size} Lanczos, JPEG q80', 'sha256': sha(data), 'bytes': len(data)})
        (OUT / name).write_bytes(data); image['uri'] = name; keep[name] = True
    # Rimuove l'ARM: immagini, texture e riferimenti nei materiali; ruvidità/metallo costanti.
    dropped = [i for i, im in enumerate(gltf['images']) if im['uri'] is None]
    remap_img = {old: new for new, old in enumerate(i for i in range(len(gltf['images'])) if i not in dropped)}
    gltf['images'] = [im for im in gltf['images'] if im['uri'] is not None]
    keep_tex = [i for i, t in enumerate(gltf['textures']) if t['source'] not in dropped]
    remap_tex = {old: new for new, old in enumerate(keep_tex)}
    gltf['textures'] = [dict(t, source=remap_img[t['source']]) for i, t in enumerate(gltf['textures']) if i in remap_tex]
    def fix(node):
        if isinstance(node, dict):
            for k in list(node):
                v = node[k]
                if isinstance(v, dict) and 'index' in v and k.endswith('Texture'):
                    if v['index'] in remap_tex: v['index'] = remap_tex[v['index']]
                    else: del node[k]
                else: fix(v)
        elif isinstance(node, list):
            for v in node: fix(v)
    fix(gltf['materials'])
    for mat in gltf['materials']:
        pbr = mat.setdefault('pbrMetallicRoughness', {}); pbr['metallicFactor'] = 0; pbr['roughnessFactor'] = .85
    for buf in gltf['buffers']:
        raw = fetch(MODEL_URL_OF(buf['uri']), CACHE / buf['uri'])
        name = f'{key}.bin'; (OUT / name).write_bytes(raw); buf['uri'] = name
        entry['files'].append({'file': name, 'from': MODEL_URL_OF(f'{slug}.bin'), 'sourceSha256': sha(raw), 'transform': 'invariato', 'sha256': sha(raw), 'bytes': len(raw)})
    out = json.dumps(gltf, separators=(',', ':')).encode(); (OUT / f'{key}.gltf').write_bytes(out)
    entry['files'].append({'file': f'{key}.gltf', 'from': files['url'], 'sourceSha256': sha(gltf_raw), 'transform': 'URI locali; ARM rimossa, ruvidità 0,85 e metallo 0 costanti', 'sha256': sha(out), 'bytes': len(out)})
    manifest['assets'].append(entry)

(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
total = sum(f['bytes'] for a in manifest['assets'] for f in a['files'])
print(f'{total} byte in {sum(len(a["files"]) for a in manifest["assets"])} file')
