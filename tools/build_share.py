#!/usr/bin/env python3
"""Build WhatsApp / social link previews for every part in js/data.js.

For each part it writes:
  share/<id>.jpg       1200x630 preview image (part drawing, name, part no., fitment, price)
  p/<id>/index.html    small page with Open Graph tags that forwards visitors to ../../#p-<id>
and also share/store.jpg (home page preview) and js/share.js (list of parts that have a page).

WhatsApp reads the Open Graph tags of the first link in a message and shows the image,
title and description as a preview card, so order messages link to p/<id>/.

Run after changing parts or prices in js/data.js:
  pip install playwright && python -m playwright install chromium
  python3 tools/build_share.py
"""
import base64, html, json, os, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = os.environ.get('SITE_URL', 'https://ansarisaalim.github.io/gearline-spares/')
CATS = {'brakes': 'Brakes', 'engine': 'Engine', 'filters': 'Filters', 'electrical': 'Electrical',
        'suspension': 'Suspension', 'bike': 'Two-wheeler'}


def load_seed():
    js = ("const vm=require('vm');const fs=require('fs');const ctx={window:{}};"
          "vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),ctx);"
          "process.stdout.write(JSON.stringify(ctx.window.GEARLINE_SEED));")
    out = subprocess.run(['node', '-e', js, str(ROOT / 'js/data.js')], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def load_icons():
    src = (ROOT / 'js/app.js').read_text()
    block = src[src.index('const ICON={'):src.index('};', src.index('const ICON={'))]
    return dict(re.findall(r"^\s*(\w+):'(.*?)',?$", block, re.M))


def inr(n):
    n = int(round(n))
    s = str(n)
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        head = re.sub(r'(\d)(?=(\d\d)+$)', r'\1,', head)
        s = head + ',' + tail
    return '₹' + s


CSS = """
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;font-family:'Inter',sans-serif;color:#15202A;background:#ECEFF1}
.card{width:1200px;height:630px;display:grid;grid-template-rows:1fr 96px}
.top{display:grid;grid-template-columns:470px 1fr}
.art{position:relative;display:grid;place-items:center;background-color:#E1E6EA;
  background-image:linear-gradient(#CFD6DD 1.5px,transparent 1.5px),linear-gradient(90deg,#CFD6DD 1.5px,transparent 1.5px);
  background-size:28px 28px;border-right:2px solid #C9D1D8}
.art svg{width:250px;height:250px;color:#15202A}
.art img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.art .tag{position:absolute;left:24px;bottom:24px;font:600 22px 'DejaVu Sans Mono',monospace;background:#fff;border:2px solid #C9D1D8;border-radius:6px;padding:4px 12px}
.art .off{position:absolute;right:24px;top:24px;font:700 24px 'Inter';background:#C4430B;color:#fff;border-radius:6px;padding:6px 12px}
.info{padding:44px 48px 36px;display:flex;flex-direction:column;gap:16px;min-width:0;background:#fff}
.eyebrow{font:600 21px 'DejaVu Sans Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#C4430B}
h1{font:800 54px/1.02 'Inter Display','Inter';letter-spacing:-.01em;text-transform:uppercase}
.pn{font-size:24px;color:#566370}.pn b{font:600 24px 'DejaVu Sans Mono',monospace;color:#15202A;background:#E1E6EA;padding:3px 10px;border-radius:5px}
.fits{font-size:23px;color:#566370;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.price{margin-top:auto;display:flex;align-items:baseline;gap:16px}
.price b{font:800 64px 'Inter Display','Inter'}
.price s{font-size:28px;color:#566370}
.stock{font:600 21px 'Inter';padding:5px 12px;border-radius:999px;background:#DCF0E4;color:#1B7148;align-self:center}
.stock.low{background:#FAEDCF;color:#8A5800}.stock.out{background:#F7DDDA;color:#A92A21}
.bar{background:#15202A;color:#EEF2F5;display:flex;align-items:center;gap:18px;padding:0 40px}
.bar svg{width:52px;height:52px;color:#E2571B}
.bar b{font:800 34px 'Inter Display','Inter';text-transform:uppercase;letter-spacing:.02em}
.bar span{margin-left:auto;font:500 24px 'Inter';color:#AAB7C2}
.store{background:#fff;padding:44px 56px 0;display:grid;gap:16px;align-content:start}
.store h1{font-size:72px}
.store p{font-size:28px;color:#566370;max-width:900px;line-height:1.35}
.icons{display:flex;gap:22px;margin-top:10px}
.icons div{width:150px;height:150px;border-radius:10px;display:grid;place-items:center;background-color:#E1E6EA;
  background-image:linear-gradient(#CFD6DD 1px,transparent 1px),linear-gradient(90deg,#CFD6DD 1px,transparent 1px);background-size:14px 14px}
.icons svg{width:70px;height:70px;color:#15202A}
"""
LOGO = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.4"><path d="M24 4l17.3 10v20L24 44 6.7 34V14z" stroke-linejoin="round"/><circle cx="24" cy="24" r="7"/></svg>'


def icon(paths):
    return f'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">{paths}</svg>'


def bar(shop):
    return f'<div class="bar">{LOGO}<b>{html.escape(shop)}</b><span>Order on WhatsApp · Pay by UPI</span></div>'


def photo(p):
    f = ROOT / p['img'] if p.get('img') and not p['img'].startswith('http') else None
    if not f or not f.exists():
        return ''
    return f'<img src="data:image/jpeg;base64,{base64.b64encode(f.read_bytes()).decode()}">'


def product_card(p, icons, shop):
    off = round((1 - p['price'] / p['mrp']) * 100) if p.get('mrp', 0) > p['price'] else 0
    st = p['stock']
    stock = ('<span class="stock out">Out of stock</span>' if st <= 0 else
             f'<span class="stock low">Only {st} left</span>' if st <= 5 else '<span class="stock">In stock</span>')
    return f"""<div class="card"><div class="top">
      <div class="art">{photo(p) or icon(icons.get(p['cat'], icons['engine']))}<span class="tag">{html.escape(p['part'])}</span>{f'<span class="off">{off}% off</span>' if off else ''}</div>
      <div class="info">
        <div class="eyebrow">{html.escape(p['brand'])} · {html.escape(CATS.get(p['cat'], 'Part'))}</div>
        <h1>{html.escape(p['name'])}</h1>
        <div class="pn">Part no. <b>{html.escape(p['part'])}</b></div>
        <div class="fits">Fits {html.escape(p['fits'])}</div>
        <div class="price"><b>{inr(p['price'])}</b>{f"<s>{inr(p['mrp'])}</s>" if off else ''}{stock}</div>
      </div></div>{bar(shop)}</div>"""


def store_card(icons, shop):
    pics = [ROOT / f'images/{i}.jpg' for i in ['bp-swift', 'plug-k12', 'chain-splendor', 'air-nexon', 'clutch-pulsar', 'batt-35']]
    tiles = ''.join(f'<div style="background:url(data:image/jpeg;base64,{base64.b64encode(f.read_bytes()).decode()}) center/cover"></div>' for f in pics if f.exists())
    return f"""<div class="card"><div class="store">
      <div class="eyebrow">Car &amp; bike spare parts</div>
      <h1>{html.escape(shop)}</h1>
      <p>Genuine and OEM-grade parts with part numbers and fitment. Order on WhatsApp, pay by UPI.</p>
      <div class="icons">{tiles}</div></div>{bar(shop)}</div>"""


def share_page(p, shop):
    e = html.escape
    url = f"{BASE}p/{p['id']}/"
    st = 'In stock' if p['stock'] > 5 else (f"Only {p['stock']} left" if p['stock'] > 0 else 'Out of stock')
    title = f"{p['name']} ({p['brand']}) · {inr(p['price'])}"
    desc = f"Part no. {p['part']} · Fits {p['fits']} · {st}. Order on WhatsApp, pay by UPI at {shop}."
    target = f"../../#p-{p['id']}"
    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="{e(shop)}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{e(url)}">
<meta property="og:image" content="{BASE}share/{p['id']}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{e(p['name'])}, part no. {e(p['part'])}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{e(url)}">
<meta http-equiv="refresh" content="0; url={target}">
<script>location.replace({json.dumps(target)})</script>
</head><body style="font-family:system-ui,sans-serif;padding:24px">
<p><a href="{target}">View {e(p['name'])} at {e(shop)}</a></p>
</body></html>
"""


def main():
    from playwright.sync_api import sync_playwright
    seed, icons = load_seed(), load_icons()
    shop = seed['settings']['shop']
    (ROOT / 'share').mkdir(exist_ok=True)
    ids = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1200, 'height': 630})

        def shot(body, out):
            page.set_content(f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>{body}')
            page.wait_for_timeout(50)
            page.screenshot(path=str(out), type='jpeg', quality=84)

        shot(store_card(icons, shop), ROOT / 'share/store.jpg')
        for p in seed['products']:
            shot(product_card(p, icons, shop), ROOT / f"share/{p['id']}.jpg")
            d = ROOT / 'p' / p['id']
            d.mkdir(parents=True, exist_ok=True)
            (d / 'index.html').write_text(share_page(p, shop))
            ids.append(p['id'])
        browser.close()
    (ROOT / 'js/share.js').write_text(
        '/* Generated by tools/build_share.py. Parts listed here have a preview page at p/<id>/. */\n'
        f'window.GEARLINE_SHARE={json.dumps(ids)};\n')
    print(f'Built {len(ids)} part previews + store preview')


if __name__ == '__main__':
    sys.exit(main())
