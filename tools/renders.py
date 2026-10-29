#!/usr/bin/env python3
"""Studio-style product renders for parts without a photo. Writes images/<id>.jpg (600x600).
Run: python3 tools/renders.py   (needs playwright + chromium)"""
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent

DEFS = """
<defs>
 <radialGradient id="bg" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#E4E4E5"/><stop offset="1" stop-color="#C9C9CB"/></radialGradient>
 <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
 <filter id="soft2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
 <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8C9096"/><stop offset=".25" stop-color="#F4F6F8"/><stop offset=".45" stop-color="#B9BDC3"/><stop offset=".7" stop-color="#6F747B"/><stop offset="1" stop-color="#C7CBD0"/></linearGradient>
 <linearGradient id="chromeV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7E838A"/><stop offset=".3" stop-color="#F2F4F6"/><stop offset=".55" stop-color="#AEB3B9"/><stop offset=".8" stop-color="#666B72"/><stop offset="1" stop-color="#B9BEC4"/></linearGradient>
 <linearGradient id="blackCyl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B1D20"/><stop offset=".3" stop-color="#4A4E54"/><stop offset=".5" stop-color="#26292D"/><stop offset="1" stop-color="#0E0F11"/></linearGradient>
 <linearGradient id="navyCyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0D1D3A"/><stop offset=".22" stop-color="#2F5596"/><stop offset=".34" stop-color="#7FA2DA"/><stop offset=".46" stop-color="#2A4C88"/><stop offset=".85" stop-color="#11244A"/><stop offset="1" stop-color="#0A1630"/></linearGradient>
 <linearGradient id="steelTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9DCE0"/><stop offset=".5" stop-color="#9DA2A9"/><stop offset="1" stop-color="#6C7178"/></linearGradient>
 <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".25"/><stop offset=".22" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".35" stop-color="#E9EEF3" stop-opacity=".35"/><stop offset=".8" stop-color="#C9D3DD" stop-opacity=".45"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".7"/></linearGradient>
</defs>
<rect width="600" height="600" fill="url(#bg)"/>
"""

ITEMS = {}

ITEMS['oil-creta'] = """
<ellipse cx="305" cy="478" rx="150" ry="26" fill="#000" opacity=".35" filter="url(#soft)"/>
<path d="M190 200 V440 A110 30 0 0 0 410 440 V200 Z" fill="url(#navyCyl)"/>
<g opacity=".55">""" + ''.join(f'<path d="M{x} 372 V448" stroke="#0A1630" stroke-width="5"/>' for x in range(200, 410, 14)) + """</g>
<path d="M190 372 A110 30 0 0 0 410 372" fill="none" stroke="#5B7FBF" stroke-width="2" opacity=".6"/>
<ellipse cx="300" cy="200" rx="110" ry="30" fill="url(#steelTop)"/>
<ellipse cx="300" cy="200" rx="92" ry="24" fill="none" stroke="#1A1A1A" stroke-width="10"/>
<ellipse cx="300" cy="200" rx="92" ry="24" fill="none" stroke="#444" stroke-width="2" transform="translate(0,-3)"/>
""" + ''.join(f'<ellipse cx="{300+60*__import__("math").cos(a/57.3):.1f}" cy="{200+15*__import__("math").sin(a/57.3):.1f}" rx="7" ry="3.5" fill="#3F444B"/>' for a in range(0, 360, 45)) + """
<ellipse cx="300" cy="200" rx="26" ry="8" fill="#5D6168"/>
<ellipse cx="300" cy="201" rx="17" ry="5" fill="#1E2023"/>
<path d="M283 200 a17 5 0 0 0 34 0" fill="none" stroke="#9AA0A7" stroke-width="1.5" stroke-dasharray="3 2"/>
<path d="M232 210 V420" stroke="#FFFFFF" stroke-width="10" opacity=".18" stroke-linecap="round"/>
"""

ITEMS['shock-city'] = """
<ellipse cx="300" cy="470" rx="230" ry="22" fill="#000" opacity=".3" filter="url(#soft)"/>
<g transform="rotate(-28 300 300)">
  <rect x="300" y="282" width="190" height="20" rx="4" fill="url(#chrome)"/>
  <rect x="120" y="266" width="210" height="52" rx="10" fill="url(#blackCyl)"/>
  <rect x="318" y="270" width="26" height="44" rx="5" fill="url(#blackCyl)"/>
  <rect x="130" y="272" width="190" height="6" rx="3" fill="#fff" opacity=".18"/>
  <rect x="104" y="280" width="30" height="24" rx="4" fill="url(#chrome)"/>
  <circle cx="86" cy="292" r="30" fill="url(#chrome)"/>
  <circle cx="86" cy="292" r="21" fill="#1A1B1E"/>
  <circle cx="86" cy="292" r="10" fill="url(#chrome)"/>
  <circle cx="86" cy="292" r="5" fill="#2A2C30"/>
  <rect x="482" y="280" width="26" height="24" rx="4" fill="url(#chrome)"/>
  <circle cx="526" cy="292" r="28" fill="url(#chrome)"/>
  <circle cx="526" cy="292" r="19" fill="#1A1B1E"/>
  <circle cx="526" cy="292" r="9" fill="url(#chrome)"/>
  <circle cx="526" cy="292" r="4.5" fill="#2A2C30"/>
</g>
"""

ITEMS['batt-35'] = """
<ellipse cx="300" cy="468" rx="200" ry="26" fill="#000" opacity=".35" filter="url(#soft)"/>
<polygon points="120,230 400,230 400,450 120,450" fill="#17191C"/>
<polygon points="120,230 400,230 400,450 120,450" fill="url(#blackCyl)" opacity=".35"/>
<polygon points="400,230 480,190 480,405 400,450" fill="#0D0E10"/>
<polygon points="120,230 200,190 480,190 400,230" fill="#2C2F34"/>
<polygon points="128,228 204,193 472,193 396,228" fill="#34383E"/>
<rect x="140" y="300" width="240" height="88" rx="4" fill="#1F4E8C"/>
<rect x="140" y="300" width="240" height="14" fill="#2E66B0"/>
<rect x="140" y="368" width="240" height="20" fill="#163C6E"/>
<g>
 <ellipse cx="205" cy="208" rx="22" ry="9" fill="#5A5E64"/>
 <rect x="191" y="186" width="28" height="22" fill="#B5121B"/><ellipse cx="205" cy="186" rx="14" ry="6" fill="#E12C35"/>
 <ellipse cx="400" cy="208" rx="22" ry="9" fill="#5A5E64"/>
 <rect x="386" y="186" width="28" height="22" fill="#141518"/><ellipse cx="400" cy="186" rx="14" ry="6" fill="#3A3D42"/>
</g>
<path d="M255 212 C 270 150, 345 150, 360 212" fill="none" stroke="#0B0C0E" stroke-width="12" stroke-linecap="round"/>
<path d="M258 206 C 273 158, 343 158, 356 206" fill="none" stroke="#4B4F55" stroke-width="3"/>
""" + ''.join(f'<ellipse cx="{x}" cy="{213-(x-240)*0.0}" rx="9" ry="3.5" fill="#202327"/>' for x in range(250, 360, 22)) + """
<rect x="128" y="236" width="6" height="200" fill="#fff" opacity=".08"/>
"""

ITEMS['bulb-h4'] = """
<ellipse cx="300" cy="500" rx="110" ry="16" fill="#000" opacity=".3" filter="url(#soft)"/>
<rect x="262" y="410" width="76" height="80" rx="8" fill="#2A2B2E"/>
<rect x="262" y="410" width="76" height="80" rx="8" fill="url(#blackCyl)" opacity=".5"/>
<rect x="270" y="486" width="10" height="8" fill="#B08A3E"/><rect x="295" y="486" width="10" height="8" fill="#B08A3E"/><rect x="320" y="486" width="10" height="8" fill="#B08A3E"/>
<path d="M190 392 h220 l-12 22 h-196 z" fill="url(#chrome)"/>
<rect x="180" y="384" width="240" height="12" rx="3" fill="url(#chromeV)"/>
<rect x="246" y="330" width="108" height="58" rx="4" fill="url(#chromeV)"/>
<path d="M258 330 C 250 250, 250 170, 270 140 C 285 118, 315 118, 330 140 C 350 170, 350 250, 342 330 Z" fill="url(#glass)" stroke="#B9C2CC" stroke-width="1.5"/>
<path d="M272 140 C 285 116, 315 116, 328 140 C 322 128, 278 128, 272 140 Z" fill="#111" />
<path d="M268 142 C 282 104, 318 104, 332 142 C 325 124, 275 124, 268 142 Z" fill="#1C1C1E"/>
<path d="M286 320 V200 M314 320 V214 M300 320 V260" stroke="#8A8F96" stroke-width="3"/>
<path d="M280 200 h26" stroke="#555" stroke-width="3"/>
<path d="M286 198 q4 -10 8 0 t8 0 t8 0" fill="none" stroke="#C9A24B" stroke-width="3"/>
<path d="M300 214 q4 -10 8 0 t8 0" fill="none" stroke="#C9A24B" stroke-width="3"/>
<rect x="290" y="218" width="22" height="10" rx="2" fill="#70757C"/>
<path d="M268 170 C 262 220, 262 280, 268 320" stroke="#fff" stroke-width="7" opacity=".7" fill="none" stroke-linecap="round"/>
"""

ITEMS['belt-innova'] = """
<ellipse cx="300" cy="470" rx="240" ry="26" fill="#000" opacity=".28" filter="url(#soft)"/>
<g transform="translate(0,10)">
 <ellipse cx="250" cy="300" rx="190" ry="110" fill="none" stroke="#141517" stroke-width="30"/>
 <ellipse cx="250" cy="300" rx="190" ry="110" fill="none" stroke="#2C2E32" stroke-width="30" stroke-dasharray="6 7" opacity=".9"/>
 <ellipse cx="250" cy="300" rx="176" ry="97" fill="none" stroke="#000" stroke-width="3" opacity=".5"/>
 <ellipse cx="250" cy="298" rx="204" ry="122" fill="none" stroke="#4A4E54" stroke-width="2" opacity=".7"/>
</g>
<g transform="translate(410 330)">
 <ellipse cx="6" cy="14" rx="80" ry="70" fill="#000" opacity=".3" filter="url(#soft2)"/>
 <circle r="78" fill="url(#chromeV)"/><circle r="66" fill="url(#steelTop)"/>
 <circle r="40" fill="#2B2E33"/><circle r="30" fill="url(#chrome)"/><circle r="12" fill="#3B3F45"/>
 <circle r="78" fill="none" stroke="#5E636A" stroke-width="2"/>
</g>
<g transform="translate(300 420)">
 <ellipse cx="4" cy="10" rx="54" ry="46" fill="#000" opacity=".3" filter="url(#soft2)"/>
 <circle r="52" fill="url(#chromeV)"/><circle r="42" fill="url(#steelTop)"/>
 <circle r="22" fill="#2B2E33"/><circle r="15" fill="url(#chrome)"/><circle r="6" fill="#3B3F45"/>
</g>
"""

ITEMS['shoe-activa'] = """
<ellipse cx="300" cy="475" rx="190" ry="22" fill="#000" opacity=".3" filter="url(#soft)"/>
<g transform="translate(300 300) scale(1,0.92)">
 <path d="M-150 -18 A150 150 0 0 1 150 -18 L120 -18 A120 120 0 0 0 -120 -18 Z" fill="#5F646B"/>
 <path d="M-140 -26 A142 142 0 0 1 140 -26 L128 -26 A130 130 0 0 0 -128 -26 Z" fill="#3D4146"/>
 <path d="M-120 -18 A120 120 0 0 1 120 -18 L104 -18 A104 104 0 0 0 -104 -18 Z" fill="url(#chrome)"/>
 <path d="M-150 18 A150 150 0 0 0 150 18 L120 18 A120 120 0 0 1 -120 18 Z" fill="#5F646B"/>
 <path d="M-140 26 A142 142 0 0 0 140 26 L128 26 A130 130 0 0 1 -128 26 Z" fill="#3D4146"/>
 <path d="M-120 18 A120 120 0 0 0 120 18 L104 18 A104 104 0 0 1 -104 18 Z" fill="url(#chrome)"/>
 <path d="M-104 -18 L-60 -18 L-60 -40 Z M104 18 L60 18 L60 40 Z" fill="#9BA0A7"/>
 <path d="M-90 -30 L-90 30" stroke="#B4121B" stroke-width="0"/>
 <path d="M-80 -24 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12" transform="translate(0,-6)" fill="none" stroke="#9A9EA4" stroke-width="5" stroke-linejoin="round"/>
 <path d="M-80 30 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12" fill="none" stroke="#9A9EA4" stroke-width="5" stroke-linejoin="round"/>
 <circle cx="-84" cy="-30" r="6" fill="#2A2C30"/><circle cx="84" cy="-30" r="6" fill="#2A2C30"/>
 <circle cx="-84" cy="30" r="6" fill="#2A2C30"/><circle cx="84" cy="30" r="6" fill="#2A2C30"/>
</g>
"""

_pleats = ''.join(
    f'<polygon points="{150+i*14},{260-i*4} {164+i*14},{256-i*4} {244+i*14},{396-i*4} {230+i*14},{400-i*4}" fill="{"#2E3136" if i%2 else "#15171A"}"/>'
    for i in range(18))
ITEMS['cabin-xuv'] = """
<ellipse cx="320" cy="468" rx="210" ry="24" fill="#000" opacity=".32" filter="url(#soft)"/>
<polygon points="136,258 400,182 492,330 228,406" fill="#D6D7D9"/>
<polygon points="228,406 492,330 492,350 228,428" fill="#9EA1A6"/>
<polygon points="136,258 228,406 228,428 136,280" fill="#B5B8BC"/>
""" + _pleats + """
<polygon points="146,262 398,190 400,182 136,258" fill="#E8E9EB"/>
<polygon points="228,406 492,330 482,326 230,398" fill="#C8CACD"/>
<polygon points="136,258 146,262 236,402 228,406" fill="#ECEDEF"/>
<polygon points="400,182 492,330 482,326 398,190" fill="#C2C4C8"/>
<path d="M236 404 l14 -4 l-4 18 l14 -4 l-4 18" fill="none"/>
"""


SCALE = {'oil-creta': 1.2, 'batt-35': 1.12, 'bulb-h4': 1.18, 'belt-innova': 1.08, 'shoe-activa': 1.25, 'cabin-xuv': 1.5, 'shock-city': 1.05}


def main():
    from playwright.sync_api import sync_playwright
    out = ROOT / 'images'
    out.mkdir(exist_ok=True)
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={'width': 600, 'height': 600})
        for pid, body in ITEMS.items():
            pg.set_content(f'<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">{DEFS}<g transform="translate(300 300) scale({SCALE.get(pid,1)}) translate(-300 -300)">{body}</g></svg></body></html>')
            pg.screenshot(path=str(out / f'{pid}.jpg'), type='jpeg', quality=88)
        b.close()
    print('rendered', len(ITEMS))


if __name__ == '__main__':
    main()
