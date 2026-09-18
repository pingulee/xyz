"""Build all four banners from ONE vector typography template.
Requires fonttools; FONT_PATH points to NotoSansKR-VariableFont_wght.ttf.
Usage: python3 scripts/build-service-banners.py
Text is outlined so browsers never substitute fonts or corrupt Korean glyphs.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
import base64, os, subprocess
ROOT = Path(__file__).resolve().parents[1]
FONT = instantiateVariableFont(TTFont(os.environ['FONT_PATH']), {'wght': 700})
GLYPHS = FONT.getGlyphSet()
CMAP = FONT.getBestCmap()
UNITS = FONT['head'].unitsPerEm
ASSETS = ROOT / 'public/images/lol'
VECTORS = ROOT / 'design/service-banners'
VECTORS.mkdir(parents=True, exist_ok=True)
TITLE_SIZE, SUBTITLE_SIZE = 112, 44
CENTER_X, TITLE_BASELINE, SUBTITLE_BASELINE = 768, 828, 909

def lettering(text, size, baseline):
    names = [CMAP[ord(c)] for c in text]
    width = sum(GLYPHS[n].width for n in names)
    scale = size / UNITS
    left = CENTER_X - width * scale / 2
    paths, advance = [], 0
    for name in names:
        pen = SVGPathPen(GLYPHS)
        GLYPHS[name].draw(pen)
        paths.append(f'<path transform="translate({advance},0)" d="{pen.getCommands()}"/>')
        advance += GLYPHS[name].width
    return f'<g transform="translate({left},{baseline}) scale({scale},{-scale})">'+''.join(paths)+'</g>'

banners = [
    ('boosting','azir.webp','롤 대리','1:1 전담 배정'),
    ('duo','xayah-rakan.webp','롤 듀오','함께하는 승리'),
    ('account','elementalist-lux.webp','롤 계정','나만의 맞춤 계정'),
    ('leveling','garen.webp','롤 육성','100% 수동 육성'),
]
for name, artwork, title, subtitle in banners:
    png = subprocess.check_output(['node', '-e', "require('sharp')(process.argv[1]).png().toBuffer().then(b=>process.stdout.write(b))", str(ASSETS/artwork)], cwd=ROOT)
    image = base64.b64encode(png).decode()
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024" role="img" aria-label="{title} · {subtitle}">
<title>{title} · {subtitle}</title>
<defs>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.3" stop-color="#080806" stop-opacity="0"/><stop offset=".65" stop-color="#080806" stop-opacity=".6"/><stop offset="1" stop-color="#080806" stop-opacity=".96"/></linearGradient>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff1bc"/><stop offset=".55" stop-color="#ebc365"/><stop offset="1" stop-color="#b48935"/></linearGradient>
<radialGradient id="vignette"><stop offset=".4" stop-opacity="0"/><stop offset="1" stop-color="#080806" stop-opacity=".5"/></radialGradient>
</defs>
<image href="data:image/png;base64,{image}" width="1536" height="1024" preserveAspectRatio="xMidYMid slice"/>
<rect width="1536" height="1024" fill="url(#vignette)"/>
<rect width="1536" height="1024" fill="url(#shade)"/>
<rect x="22" y="22" width="1492" height="980" fill="none" stroke="#dabb70" stroke-width="2"/>
<path d="M38 70V38H70 M1466 38H1498V70 M38 954V986H70 M1466 986H1498V954" fill="none" stroke="#dabb70" stroke-width="3"/>
<path d="M488 691H752 M784 691H1048 M768 685L774 691L768 697L762 691Z" fill="none" stroke="#dabb70" stroke-width="2"/>
<g fill="#f5dfa1">{lettering(title,TITLE_SIZE,TITLE_BASELINE)}</g>
<g fill="#f5dfa1">{lettering(subtitle,SUBTITLE_SIZE,SUBTITLE_BASELINE)}</g>
</svg>'''
    vector = VECTORS/f'{name}-centered.svg'
    vector.write_text(svg)
    subprocess.run(['node', '-e', "require('sharp')(process.argv[1]).webp({quality:90,effort:6}).toFile(process.argv[2])", str(vector), str(ASSETS/f'{name}-centered.webp')], cwd=ROOT, check=True)
    print(f'{name}: title={TITLE_SIZE}px baseline={TITLE_BASELINE}, subtitle={SUBTITLE_SIZE}px baseline={SUBTITLE_BASELINE}, center={CENTER_X}, Noto Sans KR 700')
