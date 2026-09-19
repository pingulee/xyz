"""Build all four banners from ONE vector typography template.
Requires fonttools; FONT_PATH points to NotoSerifKR[wght].ttf.
Usage: python3 scripts/build-service-banners.py
Text is outlined so browsers never substitute fonts or corrupt Korean glyphs.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import base64, os, subprocess
ROOT = Path(__file__).resolve().parents[1]
FONT = instantiateVariableFont(TTFont(os.environ['FONT_PATH']), {'wght': 700})
GLYPHS = FONT.getGlyphSet()
CMAP = FONT.getBestCmap()
UNITS = FONT['head'].unitsPerEm
ASSETS = ROOT / 'public/images/lol'
VECTORS = ROOT / 'design/service-banners'
VECTORS.mkdir(parents=True, exist_ok=True)
TITLE_SIZE, SUBTITLE_SIZE = 136, 44
CENTER_X, TITLE_BASELINE, SUBTITLE_BASELINE = 768, 842, 920

def lettering(text, size, baseline):
    names = [CMAP[ord(c)] for c in text]
    width = sum(GLYPHS[n].width for n in names)
    scale = size / UNITS
    left = CENTER_X - width * scale / 2
    paths, advance = [], 0
    for name in names:
        pen = SVGPathPen(GLYPHS)
        GLYPHS[name].draw(TransformPen(pen, (scale, 0, 0, -scale, left + advance * scale, baseline)))
        paths.append(f'<path d="{pen.getCommands()}"/>')
        advance += GLYPHS[name].width
    return '<g>'+''.join(paths)+'</g>'

def metallic_text(text, size, baseline, name):
    outline = lettering(text, size, baseline)
    depth = ''.join(f'<use href="#{name}" transform="translate({i * .25},{i})" fill="#705020"/>' for i in range(4, 0, -1))
    return f'''<defs><g id="{name}">{outline}</g>
<linearGradient id="{name}Gold" gradientUnits="userSpaceOnUse" x1="0" y1="{baseline-size}" x2="0" y2="{baseline}"><stop stop-color="#fff8d8"/><stop offset=".3" stop-color="#f4d68a"/><stop offset=".48" stop-color="#b58432"/><stop offset=".52" stop-color="#ffe7a2"/><stop offset=".8" stop-color="#e5bd61"/><stop offset="1" stop-color="#90601f"/></linearGradient></defs>
<g filter="url(#textShadow)">{depth}
<use href="#{name}" transform="translate(0,-1.5)" fill="#fff5cb"/>
<use href="#{name}" fill="url(#{name}Gold)" stroke="#ffeab5" stroke-width=".5" stroke-linejoin="round"/>
</g>'''

banners = [
    ('boosting','challenger-modern-source.webp','롤 대리','목표 티어를 향한 승리'),
    ('duo','xayah-rakan.webp','롤 듀오','함께 만드는 승리'),
    ('account','../services/account-game-source.webp','롤 계정','나에게 맞는 새로운 시작'),
    ('leveling','leveling-mid-source.webp','롤 육성','30레벨까지 100% 수동 육성'),
]
for index, (name, artwork, title, subtitle) in enumerate(banners, 1):
    png = subprocess.check_output(['node', '-e', "require('sharp')(process.argv[1]).png().toBuffer().then(b=>process.stdout.write(b))", str(ASSETS/artwork)], cwd=ROOT)
    image = base64.b64encode(png).decode()
    artwork_svg = f'<image href="data:image/png;base64,{image}" x="0" y="0" width="1536" height="1024" preserveAspectRatio="xMidYMid slice"/>'
    if name == 'leveling':
        artwork_svg = artwork_svg.replace('xMidYMid slice', 'xMaxYMid slice')
        artwork_svg = f'<g filter="url(#warmGold)">{artwork_svg}</g>'
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024" role="img" aria-label="{title} · {subtitle}">
<title>{title} · {subtitle}</title>
<defs>
<radialGradient id="textBackdrop"><stop stop-color="#000" stop-opacity=".28"/><stop offset=".55" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<filter id="warmGold" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".393 .769 .189 0 0 .349 .686 .168 0 0 .272 .534 .131 0 0 0 0 0 1 0" result="sepia"/><feComposite in="sepia" in2="SourceGraphic" operator="arithmetic" k2=".62" k3=".38"/><feColorMatrix type="saturate" values="1.15"/><feComponentTransfer><feFuncR type="linear" slope="1.08"/><feFuncG type="linear" slope="1.02"/><feFuncB type="linear" slope=".9"/></feComponentTransfer></filter>
<linearGradient id="frameGold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a77932"/><stop offset=".28" stop-color="#fff0c1"/><stop offset=".55" stop-color="#987443"/><stop offset=".78" stop-color="#e5ca85"/><stop offset="1" stop-color="#8e6329"/></linearGradient>
<filter id="textShadow" x="-20%" y="-30%" width="140%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3"/><feOffset dx="0" dy="6"/><feComponentTransfer><feFuncA type="linear" slope=".7"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
{artwork_svg}
<ellipse cx="768" cy="828" rx="440" ry="150" fill="url(#textBackdrop)"/>
<path d="M80 30H1456L1506 80V944L1456 994H80L30 944V80Z" fill="none" stroke="url(#frameGold)" stroke-width="2" stroke-opacity=".7"/>
<path d="M90 44H1446L1492 90V934L1446 980H90L44 934V90Z" fill="none" stroke="#e9d5a3" stroke-width="1" stroke-opacity=".2"/>
<path d="M30 162V80L80 30H162 M1374 30H1456L1506 80V162 M1506 862V944L1456 994H1374 M162 994H80L30 944V862" fill="none" stroke="url(#frameGold)" stroke-width="4"/>
<path d="M66 104L104 66 M1432 66L1470 104 M1470 920L1432 958 M104 958L66 920" stroke="#f2d28b" stroke-width="2"/>
<path d="M592 700H724L742 708 M794 708L812 700H944 M768 688L780 700L768 712L756 700Z" fill="none" stroke="url(#frameGold)" stroke-width="2"/>
<path d="M750 962H680 M786 962H856 M768 954L776 962L768 970L760 962Z" fill="none" stroke="#b69b64" stroke-width="1.5"/>
<g fill="#dfc38a" opacity=".85" transform="translate(-650,0)">{lettering(f'{index:02}',24,98)}</g>
{metallic_text(title,TITLE_SIZE,TITLE_BASELINE,'serviceTitle')}
{metallic_text(subtitle,SUBTITLE_SIZE,SUBTITLE_BASELINE,'serviceSubtitle')}
</svg>'''
    vector = VECTORS/f'{name}-gameplay.svg'
    vector.write_text(svg, encoding='utf-8')
    subprocess.run(['node', '-e', "require('sharp')(process.argv[1]).webp({quality:90,effort:6}).toFile(process.argv[2])", str(vector), str(ASSETS/f'{name}-gameplay.webp')], cwd=ROOT, check=True)
    print(f'{name}: title={TITLE_SIZE}px baseline={TITLE_BASELINE}, subtitle={SUBTITLE_SIZE}px baseline={SUBTITLE_BASELINE}, center={CENTER_X}, Noto Serif KR 700')
