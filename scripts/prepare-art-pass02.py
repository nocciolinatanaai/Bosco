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
    'cobble': ('patterned_cobblestone', 512, 'pavimento principale della piazza'),
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
        with urllib.request.urlopen(URL.format(slug=slug, kind=kind), timeout=60) as r: path.write_bytes(r.read())
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
(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
total = sum(f['bytes'] for a in manifest['assets'] for f in a['files'])
print(f'{total} byte in {sum(len(a["files"]) for a in manifest["assets"])} file')
