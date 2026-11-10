#!/usr/bin/env python3
"""Original concept-film edit. Requires ffmpeg, ffprobe and numpy; no game/network IO."""
from pathlib import Path
import subprocess, wave, json, hashlib
import numpy as np
ROOT = Path(__file__).resolve().parents[1]
OUT = Path('/workspace/artifacts/mythwood-trailer')
OUT.mkdir(parents=True, exist_ok=True)
SRC = ROOT / 'docs/assets/trailers/source'
SERIF='/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'
SANS='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FPS=30
DURATION=24

def run(args):
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','warning','-y',*args],check=True)

def score():
    sr=48000
    t=np.arange(sr*DURATION)/sr
    rng=np.random.default_rng(310)
    music=np.zeros((len(t),2))
    def add(start, dur, signal, pan=0):
        i=int(start*sr); n=min(int(dur*sr),len(t)-i)
        if n>0:
            music[i:i+n,0]+=signal[:n]*(1-pan*.4)
            music[i:i+n,1]+=signal[:n]*(1+pan*.4)
    # D minor / Bb / F / C, warm detuned strings and an original bell motif.
    for k,notes in enumerate([[50,57,62,65],[46,53,58,62],[41,53,57,60],[48,55,60,64]]):
        u=np.arange(int(6.5*sr))/sr
        env=np.minimum(u/1.1,1)*np.minimum((6.5-u)/1.5,1)
        for j,note in enumerate(notes):
            f=440*2**((note-69)/12)
            sig=sum(np.sin(2*np.pi*(f*h+(.13 if h%2 else -.11))*u+j*.7)/h**1.8 for h in range(1,7))
            add(k*5.6,6.5,.058*sig*env,(j-1.5)/2)
    for i,note in enumerate([74,69,77,76,74,81,77,76,74,69,77,81]):
        u=np.arange(int(2.8*sr))/sr; f=440*2**((note-69)/12)
        sig=(np.sin(2*np.pi*f*u)+.3*np.sin(2*np.pi*f*2.002*u))*.09*np.exp(-u*1.7)*np.minimum(u/.015,1)
        add(.5+i*1.5,2.8,sig,(-1)**i*.65)
    for start in [0,5,9.5,14,19]:
        u=np.arange(int(2.5*sr))/sr
        phase=2*np.pi*(48*u+44*.12*(1-np.exp(-u/.12)))
        hit=(.28*np.sin(phase)+.07*np.sin(phase*2))*np.exp(-u*2.7)*np.minimum(u/.006,1)
        add(start,2.5,hit)
    for start in np.arange(10,19,.75):
        u=np.arange(int(.5*sr))/sr
        sig=.065*(np.sin(2*np.pi*(100*u+4*(1-np.exp(-u*20))))+.18*rng.normal(size=len(u)))*np.exp(-u*15)*np.minimum(u/.003,1)
        add(start,.5,sig,(-1)**int(start*4)*.3)
    for end in [5,9.5,14,19]:
        u=np.arange(int(1.1*sr))/sr
        noise=rng.normal(size=len(u)); noise=np.convolve(noise,np.ones(17)/17,mode='same')
        sig=.17*noise*(u/1.1)**2*np.minimum((1.1-u)/.03,1)
        add(end-1.1,1.1,sig)
    dry=music.copy()
    for delay,gain in [(.19,.17),(.37,.12),(.61,.08)]:
        n=int(delay*sr); music[n:]+=dry[:-n,::-1]*gain
    music*=np.minimum(t/.25,1)[:,None]*np.minimum((DURATION-t)/1.6,1)[:,None]
    music/=max(1,np.max(np.abs(music))/0.85)
    with wave.open(str(OUT/'score.wav'),'wb') as wav:
        wav.setnchannels(2); wav.setsampwidth(2); wav.setframerate(sr)
        wav.writeframes((music*32767).astype('<i2').tobytes())

def draw(text, y, size=68, color='0xffedce', alpha='1', font=SERIF):
    path=OUT/('text-'+hashlib.sha256(text.encode()).hexdigest()[:10]+'.txt')
    path.write_text(text)
    return f"drawtext=fontfile={font}:textfile={path}:fontsize={size}:fontcolor={color}:x=(w-tw)/2:y={y}:shadowcolor=black@0.9:shadowx=2:shadowy=3:alpha='{alpha}'"

score()
shots=[('city',5.4,['IL MONDO LI HA','DIMENTICATI.']),('liora',4.9,['TU PUOI ANCORA','RICORDARLI.']),('ranger',4.9,['IL RICORDO','DIVENTA POTERE.']),('guardian',5.4,['CHI RIPORTERAI','ALLA LUCE?']),('city',5.0,[])]
for i,(name,duration,lines) in enumerate(shots):
    frames=round(duration*FPS)
    # High-resolution input prevents camera rounding jitter. Every source remains untouched.
    z=f'1.015+0.055*on/{frames}' if i%2==0 else f'1.085-0.055*on/{frames}'
    filters=[f'scale=1440:2560:force_original_aspect_ratio=increase,crop=1440:2560',f"zoompan=z='{z}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d={frames}:s=1080x1920:fps=30",'setsar=1', 'format=yuv420p']
    # Safe-area contrast panels, sparse moving embers and subtle film texture.
    filters+=['drawbox=x=0:y=0:w=iw:h=180:color=0x07131f@0.3:t=fill','drawbox=x=0:y=1350:w=iw:h=570:color=0x07131f@0.44:t=fill']
    for p in range(14):
        filters.append(f"drawtext=fontfile={SANS}:text=·:fontsize={16+p%3*7}:fontcolor=0xffcc78@0.45:x='mod({p*83}+24*sin(t+{p}),1080)':y='1920-mod(t*{42+p*3}+{p*139},1940)'")
    filters.append(draw('CONCEPT TRAILER',118,28,'0xffe7be',font=SANS))
    if lines:
        a='min(1,max(0,(t-0.35)/0.5))'
        filters += [draw(lines[0],1430,62,alpha=a),draw(lines[1],1510,66,alpha=a)]
    else:
        filters += ['drawbox=x=0:y=0:w=iw:h=ih:color=0x030b15@0.66:t=fill',draw('MYTHWOOD',775,132),draw('NESSUNO SCOMPARE',980,40),draw('FINCHÉ QUALCUNO RICORDA.',1040,36),draw('SEGUI LO SVILUPPO',1310,34,font=SANS),draw('RPG FANTASY IN SVILUPPO',1400,26,font=SANS),draw('CONCEPT CINEMATICO · IMMAGINI AI',1490,24,font=SANS)]
    filters += ['noise=alls=2:allf=t+u']
    if i==0: filters+=['fade=t=in:st=0:d=0.3']
    if i==4: filters+=['fade=t=out:st=4.3:d=0.7']
    run(['-i',str(SRC/(name+'.png')),'-vf',','.join(filters),'-an','-c:v','libx264','-preset','fast','-crf','19','-threads','4',str(OUT/f'shot{i}.mp4')])
    print(f'Shot {i+1}/5 ready',flush=True)
# Four .4 s dissolves: 25.6 - 1.6 = exactly 24 seconds.
args=[]
for i in range(5):args+=['-i',str(OUT/f'shot{i}.mp4')]
args+=['-i',str(OUT/'score.wav')]
chain='[0:v][1:v]xfade=transition=fade:duration=0.4:offset=5[v1];[v1][2:v]xfade=transition=fade:duration=0.4:offset=9.5[v2];[v2][3:v]xfade=transition=fade:duration=0.4:offset=14[v3];[v3][4:v]xfade=transition=fade:duration=0.4:offset=19[v];[5:a]loudnorm=I=-14:TP=-2:LRA=9[a]'
run([*args,'-filter_complex_threads','1','-filter_complex',chain,'-map','[v]','-map','[a]','-t','24','-c:v','libx264','-preset','fast','-crf','19','-threads','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',str(OUT/'mythwood-cinematic-trailer.mp4')])
run(['-ss','20.5','-i',str(OUT/'mythwood-cinematic-trailer.mp4'),'-frames:v','1','-update','1',str(OUT/'cover.jpg')])
print('Completed',flush=True)
