"""Compone un diario verticale con concept dichiarato e cattura locale.

Richiede FFmpeg e font DejaVu. Non pubblica e non usa API remote.
Uso: python3 scripts/render-social.py /workspace/artifacts/mythwood-social-kit
"""
from pathlib import Path
import hashlib
import json
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
if (root / 'social/launch-kit/RETIRED').exists():
    raise SystemExit('Kit ritirato: non rigenerare il vecchio reel. Preparare una nuova proposta dopo la verifica visiva.')
output = Path(sys.argv[1]).resolve()
output.mkdir(parents=True, exist_ok=True)
raw = output / 'raw'
font = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
serif = '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
concept = root / 'docs/assets/mythwood-visual-concept.png'
if not (raw / 'frames.ffconcat').is_file():
    raise SystemExit('Manca la cattura: eseguire scripts/capture-social.mjs prima del rendering')

def text(name, contents, y, size=28, color='white', face=font):
    path = output / f'{name}.txt'
    path.write_text(contents)
    return f'drawtext=fontfile={face}:textfile={path}:fontcolor={color}:fontsize={size}:line_spacing=12:x=(w-text_w)/2:y={y}'

def run(args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)

encoding = ['-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
intro_filter = '[1:v]crop=iw:ih*0.72:0:ih*0.12,scale=720:-2[art];[0:v][art]overlay=0:360:shortest=1,' + ','.join([
    text('intro-label', 'LA DIREZIONE', 145, 20, '#e4bd7e'),
    text('brand', 'MYTHWOOD', 200, 62, '#ead7b4', serif),
    text('intro-promise', 'Un mondo da esplorare.\nUn potere da conquistare.', 920, 30),
    text('concept-label', 'CONCEPT ART · GENERATO CON IA', 1080, 20, '#e4bd7e'),
    text('concept-disclosure', 'Non è una cattura dal gioco.', 1130, 22, '#b9c7d4'),
])
run(['-f', 'lavfi', '-i', 'color=c=0x0b1524:s=720x1280:r=30:d=5', '-loop', '1', '-i', str(concept),
     '-filter_complex', intro_filter, '-t', '5', *encoding, str(output / '01-concept.mp4')])
game_filter = ','.join([
    'fps=30', 'scale=720:1280',
    'drawbox=x=0:y=0:w=720:h=100:color=0x0b1524@0.96:t=fill',
    text('game-label', 'PROTOTIPO · CATTURA REALE', 36, 25, '#e4bd7e'),
    'drawbox=x=0:y=1050:w=720:h=230:color=0x0b1524@0.96:t=fill',
    text('game-note', 'Modelli provvisori.\nLa ricostruzione è iniziata.', 1080, 28),
    text('game-limit', 'Prova individuale · nessun multiplayer online', 1210, 19, '#b9c7d4'),
])
run(['-safe', '0', '-f', 'concat', '-i', str(raw / 'frames.ffconcat'), '-vf', game_filter,
     '-t', '8', *encoding, str(output / '02-prototype.mp4')])
outro_filter = ','.join([
    text('outro-brand', 'MYTHWOOD', 185, 60, '#ead7b4', serif),
    text('outro-question', 'IL TUO PRIMO RUOLO?', 380, 29, '#e4bd7e'),
    text('outro-classes', 'Tank · Combattente\nAssassino · Mago\nRanger · Guaritore', 480, 31),
    text('outro-cta', 'Segui la nascita del gioco.\nQuale classe sceglieresti?', 870, 28),
    text('outro-state', 'Progetto in sviluppo', 1120, 22, '#b9c7d4'),
])
run(['-f', 'lavfi', '-i', 'color=c=0x0b1524:s=720x1280:r=30:d=4', '-vf', outro_filter,
     '-t', '4', *encoding, str(output / '03-outro.mp4')])
concat = output / 'segments.ffconcat'
concat.write_text(''.join(f"file '{output / name}'\n" for name in ['01-concept.mp4', '02-prototype.mp4', '03-outro.mp4']))
video = output / 'mythwood-reel-01.mp4'
run(['-safe', '0', '-f', 'concat', '-i', str(concat), '-c', 'copy', '-movflags', '+faststart', str(video)])
probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_name,width,height,pix_fmt',
                        '-of', 'json', str(video)], check=True, capture_output=True, text=True)
manifest = {
    'file': video.name,
    'sha256': hashlib.sha256(video.read_bytes()).hexdigest(),
    'probe': json.loads(probe.stdout),
    'concept': 'AI-generated concept approved as art direction, not gameplay',
    'gameplay': 'Real screenshots of local prototype; software Chromium with timestamped sampling; no native FPS claim',
    'audio': 'none; no third-party music',
    'publication': 'not published; API connection missing',
    'editorial_source': 'social/launch-kit/README.md',
}
(output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'file': str(video), 'bytes': video.stat().st_size, 'probe': manifest['probe']}))
