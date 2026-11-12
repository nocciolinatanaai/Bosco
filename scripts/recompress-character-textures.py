"""Ricodifica le texture PNG opache dei GLB dei personaggi in JPEG, dentro il file.

Uso: python3 -I scripts/recompress-character-textures.py <qualità> <file.glb>...
Solo i chunk immagine cambiano: JSON (salvo mimeType/byteLength/offset) e dati di
geometria, pesi e animazioni restano identici. Ricodifica con perdita: la differenza
va misurata a camere fisse (scripts/class-character-review.mjs o studio ART-02).
Rifiuta file con materiali non OPAQUE (lì l'alfa conta); con OPAQUE l'alfa è ignorata da glTF.
"""
import io, json, struct, sys, hashlib
from PIL import Image

def chunks(data):
    assert data[:4] == b'glTF'
    n = struct.unpack('<I', data[12:16])[0]; js = json.loads(data[20:20 + n])
    off = 20 + n; bl = struct.unpack('<I', data[off:off + 4])[0]; assert data[off + 4:off + 8] == b'BIN\x00'
    return js, data[off + 8:off + 8 + bl]

def pad(b, fill=b'\x00'):
    return b + fill * ((4 - len(b) % 4) % 4)

def recompress(path, quality):
    data = open(path, 'rb').read(); js, binary = chunks(data)
    if any(m.get('alphaMode', 'OPAQUE') != 'OPAQUE' for m in js.get('materials', [])): raise SystemExit(f'{path}: materiale non opaco')
    views = [binary[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']] for v in js['bufferViews']]
    log = []
    for image in js.get('images', []):
        if image.get('mimeType') != 'image/png': continue
        raw = views[image['bufferView']]; im = Image.open(io.BytesIO(raw))
        # Tutti i materiali sono OPAQUE: per glTF l'alfa della texture base è ignorata in rendering.
        buf = io.BytesIO(); im.convert('RGB').save(buf, 'JPEG', quality=quality, optimize=True, subsampling=0)
        views[image['bufferView']] = buf.getvalue(); image['mimeType'] = 'image/jpeg'
        log.append((image.get('name'), len(raw), len(buf.getvalue())))
    out = b''
    for v, view in zip(js['bufferViews'], views):
        v['byteOffset'] = len(out); v['byteLength'] = len(view); out = pad(out + view)
    js['buffers'][0]['byteLength'] = len(out)
    jb = pad(json.dumps(js, separators=(',', ':')).encode(), b' ')
    glb = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(jb) + 8 + len(out)) + struct.pack('<I', len(jb)) + b'JSON' + jb + struct.pack('<I', len(out)) + b'BIN\x00' + out
    open(path, 'wb').write(glb)
    return len(data), len(glb), hashlib.sha256(glb).hexdigest(), log

if __name__ == '__main__':
    q = int(sys.argv[1])
    for p in sys.argv[2:]:
        before, after, digest, log = recompress(p, q)
        print(p, before, '→', after, digest[:16]); [print('  ', *l) for l in log]
