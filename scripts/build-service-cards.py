"""Export service cards using a shared vector template, separate from hero banners.
Requires fonttools and sharp. FONT_PATH: GmarketSansTTFMedium.ttf.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
import base64, os, subprocess
ROOT = Path(__file__).resolve().parents[1]
FONT = TTFont(os.environ['FONT_PATH'])
GLYPHS, CMAP = FONT.getGlyphSet(), FONT.getBestCmap()
UNITS = FONT['head'].unitsPerEm
ASSETS, VECTORS = ROOT/'public/images/services', ROOT/'design/service-cards'
VECTORS.mkdir(parents=True, exist_ok=True)

def lettering(text, size, x, baseline):
    paths, advance = [], 0
    for char in text:
        name = CMAP[ord(char)]
        pen = SVGPathPen(GLYPHS)
        GLYPHS[name].draw(pen)
        paths.append(f'<path transform="translate({advance},0)" d="{pen.getCommands()}"/>')
        advance += GLYPHS[name].width
    return f'<g transform="translate({x},{baseline}) scale({size/UNITS},{-size/UNITS})">'+''.join(paths)+'</g>'

cards = [
    ('boosting','pantheon','롤 대리','목표 티어까지'),
    ('duo','leona','롤 듀오','함께하는 플레이'),
    ('account','ahri','롤 계정','취향에 맞는 계정'),
    ('leveling','ezreal','롤 육성','매크로 없는 수동 육성'),
]
for i,(name,art,title,subtitle) in enumerate(cards,1):
    png = subprocess.check_output(['node','-e',"require('sharp')(process.argv[1]).png().toBuffer().then(b=>process.stdout.write(b))",str(ASSETS/f'{art}-source.webp')],cwd=ROOT)
    image = base64.b64encode(png).decode()
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800" role="img" aria-label="{title} · {subtitle}">
<title>{title} · {subtitle}</title>
<defs>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset=".25" stop-color="#0b0b0d" stop-opacity="0"/><stop offset=".7" stop-color="#0b0b0d" stop-opacity=".75"/><stop offset="1" stop-color="#0b0b0d" stop-opacity=".98"/></linearGradient>
<linearGradient id="edge"><stop stop-color="#08080a" stop-opacity=".35"/><stop offset=".65" stop-color="#08080a" stop-opacity="0"/></linearGradient>
</defs>
<image href="data:image/png;base64,{image}" width="1280" height="800" preserveAspectRatio="xMidYMid slice"/>
<rect width="1280" height="800" fill="url(#shade)"/>
<rect width="1280" height="800" fill="url(#edge)"/>
<rect x="64" y="56" width="78" height="54" rx="27" fill="#0b0b0d" fill-opacity=".7" stroke="#d8b970" stroke-opacity=".7"/>
<g fill="#ecd39b">{lettering(f'{i:02}',27,84,93)}</g>
<path d="M48 562V708" stroke="#d8b970" stroke-width="4"/>
<g fill="#fff8e9">{lettering(title,104,88,638)}</g>
<g fill="#dfc790">{lettering(subtitle,44,88,714)}</g>
<path d="M64 758H1216" stroke="#d8b970" stroke-opacity=".35"/>
</svg>'''
    vector = VECTORS/f'{name}-card.svg'
    vector.write_text(svg)
    subprocess.run(['node','-e',"require('sharp')(process.argv[1]).webp({quality:90,effort:6}).toFile(process.argv[2])",str(vector),str(ASSETS/f'{name}-card.webp')],cwd=ROOT,check=True)
    print(name, 'Gmarket Sans Medium; title 104px x88 baseline638; subtitle 44px x88 baseline714')
