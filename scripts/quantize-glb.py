"""Quantizza gli attributi di vertice di un GLB, senza toccare posizioni, indici e animazioni.

Uso: python3 -I scripts/quantize-glb.py <file.glb>...
- NORMAL float → BYTE normalizzato (KHR_mesh_quantization, stride 4)
- TEXCOORD_n float → UNSIGNED_SHORT normalizzato, solo se tutti i valori sono in [0,1] (core)
- COLOR_n float → UNSIGNED_BYTE normalizzato VEC4 (core)
- WEIGHTS_n float → UNSIGNED_BYTE normalizzato, somma riportata a 255 (core)
Le bufferView non più usate vengono rimosse. Con perdita: verificare a camere fisse.
"""
import json, struct, sys, hashlib
from array import array

CT = {5120: ('b', 1), 5121: ('B', 1), 5122: ('h', 2), 5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}

def pad(b, fill=b'\x00'): return b + fill * ((4 - len(b) % 4) % 4)

def read(js, binary, a):
    v = js['bufferViews'][a['bufferView']]; fmt, size = CT[a['componentType']]; n = NC[a['type']]
    stride = v.get('byteStride') or size * n; base = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    out = []
    for i in range(a['count']):
        out.append(struct.unpack_from('<' + fmt * n, binary, base + i * stride))
    return out

def quantize(path):
    data = open(path, 'rb').read(); assert data[:4] == b'glTF'
    n = struct.unpack('<I', data[12:16])[0]; js = json.loads(data[20:20 + n]); off = 20 + n
    bl = struct.unpack('<I', data[off:off + 4])[0]; binary = data[off + 8:off + 8 + bl]
    views = [binary[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']] for v in js['bufferViews']]
    done = {}; stats = {'NORMAL': 0, 'TEXCOORD': 0, 'COLOR': 0, 'WEIGHTS': 0, 'skipped': 0}
    def new_view(payload, stride):
        js['bufferViews'].append({'buffer': 0, 'byteLength': len(payload), 'byteStride': stride, 'target': 34962}); views.append(payload)
        return len(js['bufferViews']) - 1
    for mesh in js['meshes']:
        for prim in mesh['primitives']:
            for key, ai in list(prim['attributes'].items()):
                a = js['accessors'][ai]
                if ai in done or a.get('componentType') != 5126 or a.get('sparse'): continue
                kind = key.split('_')[0]; vals = read(js, binary, a)
                if kind == 'NORMAL':
                    buf = bytearray()
                    for x, y, z in vals: buf += struct.pack('<bbbx', *(max(-127, min(127, round(c * 127))) for c in (x, y, z)))
                    a.update(componentType=5120, normalized=True, bufferView=new_view(bytes(buf), 4), byteOffset=0); a.pop('min', None); a.pop('max', None)
                elif kind == 'TEXCOORD':
                    if not all(0 <= c <= 1 for v in vals for c in v): stats['skipped'] += 1; continue
                    buf = array('H', [round(c * 65535) for v in vals for c in v]).tobytes()
                    a.update(componentType=5123, normalized=True, bufferView=new_view(buf, 4), byteOffset=0); a.pop('min', None); a.pop('max', None)
                elif kind == 'COLOR':
                    if not all(0 <= c <= 1 for v in vals for c in v): stats['skipped'] += 1; continue
                    buf = bytearray()
                    for v in vals: buf += bytes(round(c * 255) for c in (list(v) + [1.0] * (4 - len(v))))
                    a.update(componentType=5121, normalized=True, type='VEC4', bufferView=new_view(bytes(buf), 4), byteOffset=0); a.pop('min', None); a.pop('max', None)
                elif kind == 'WEIGHTS':
                    buf = bytearray()
                    for v in vals:
                        s = sum(v) or 1; q = [round(c / s * 255) for c in v]; q[q.index(max(q))] += 255 - sum(q); buf += bytes(q)
                    a.update(componentType=5121, normalized=True, bufferView=new_view(bytes(buf), 4), byteOffset=0); a.pop('min', None); a.pop('max', None)
                else: continue
                done[ai] = True; stats[kind] += 1
    if stats['NORMAL']:
        for k in ('extensionsUsed', 'extensionsRequired'):
            js.setdefault(k, []); 'KHR_mesh_quantization' in js[k] or js[k].append('KHR_mesh_quantization')
    used = sorted(set(a['bufferView'] for a in js['accessors'] if 'bufferView' in a) | set(i['bufferView'] for i in js.get('images', []) if 'bufferView' in i))
    remap = {old: new for new, old in enumerate(used)}
    out = b''; new_views = []
    for old in used:
        v = dict(js['bufferViews'][old]); v['byteOffset'] = len(out); v['byteLength'] = len(views[old]); out = pad(out + views[old]); new_views.append(v)
    js['bufferViews'] = new_views
    for a in js['accessors']:
        if 'bufferView' in a: a['bufferView'] = remap[a['bufferView']]
    for i in js.get('images', []):
        if 'bufferView' in i: i['bufferView'] = remap[i['bufferView']]
    js['buffers'][0]['byteLength'] = len(out)
    jb = pad(json.dumps(js, separators=(',', ':')).encode(), b' ')
    glb = b'glTF' + struct.pack('<II', 2, 28 + len(jb) + len(out)) + struct.pack('<I', len(jb)) + b'JSON' + jb + struct.pack('<I', len(out)) + b'BIN\x00' + out
    open(path, 'wb').write(glb)
    return len(data), len(glb), hashlib.sha256(glb).hexdigest(), stats

if __name__ == '__main__':
    for p in sys.argv[1:]:
        before, after, digest, stats = quantize(p); print(p, before, '→', after, digest[:16], stats)
