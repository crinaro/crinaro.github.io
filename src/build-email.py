#!/usr/bin/env python3
"""Build the email signature: a raster logo plus paste-ready HTML.

Email is not the web. SVG is blocked by most clients, webfonts do not load, and
Outlook needs tables. So the logo is rasterised to PNG at 3x and the signature
is table-based with inline styles only.

    python3 build-email.py     ->  dist/email/
"""
import io
import os
import re
import cairosvg
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(HERE, 'logo', 'ai')
OUT = os.path.join(HERE, '..', 'email')
os.makedirs(OUT, exist_ok=True)

# --- who the signature is for. Edit these two lines. ------------------------
NAME = 'John Kelly'
TITLE = ''                      # e.g. 'Founder' — leave empty to omit the line
EMAIL = 'john@crinaro.ai'
SITE = 'crinaro.ai'

NAVY, GREEN, MUTED = '#0B2545', '#1B5C46', '#6A8095'

# Displayed at 220px; rendered at 3x so it stays sharp on retina and in print.
DISPLAY_W = 220
SCALE = 3


def _render(src, width):
    """Rasterise a logo SVG to a PIL image, forcing a real geometric face."""
    svg = open(os.path.join(LOGO, src)).read()
    # The shipped SVGs name Futura first; nothing here has it, and a silent
    # fallback would bake the wrong letterforms into a PNG nobody re-checks.
    svg = svg.replace(
        "font-family=\"Futura, 'Century Gothic', 'Avenir Next', Avenir, sans-serif\"",
        'font-family="Poppins"')
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=width,
                           output_height=int(round(width * vb[3] / vb[2])))
    return Image.open(io.BytesIO(png)).convert('RGBA')


def rasterise_signature_pair():
    """Write both signature PNGs, cropped tight to the artwork.

    The shipped lockup carries transparent padding: translate(10,4) plus the
    path's own x=52 origin leave roughly 11px empty at the left edge once
    scaled to 220px. In a signature that reads as the logo being indented
    against the name and address beneath it, which is the defect John saw.
    Cropping to the ink makes the lockup flush left with the text, and lets
    the gap below it be set deliberately in the table rather than inherited
    from whitespace nobody chose.

    The reversed variant paints a navy rectangle across the whole canvas, so
    its own alpha bounding box is the entire frame. It is cropped by the
    fractions measured from the light version — same artwork, same geometry.
    """
    work = DISPLAY_W * SCALE * 2          # measure big, then downscale
    light = _render('crinaro-ai-horizontal.svg', work)
    box = light.getbbox()                 # alpha bounds of the ink
    if box is None:
        raise SystemExit('logo rasterised empty — check the SVG')

    out_w = DISPLAY_W * SCALE
    results = []
    for src, dst in (('crinaro-ai-horizontal.svg', 'crinaro-signature.png'),
                     ('crinaro-ai-horizontal-reversed.svg', 'crinaro-signature-reversed.png')):
        im = light if src.endswith('horizontal.svg') else _render(src, work)
        im = im.crop(box)
        h = int(round(out_w * im.height / im.width))
        im.resize((out_w, h), Image.LANCZOS).save(os.path.join(OUT, dst))
        results.append(int(round(DISPLAY_W * im.height / im.width)))
    return results


h_light, h_dark = rasterise_signature_pair()
print(f'  crinaro-signature.png           {DISPLAY_W}x{h_light} displayed ({SCALE}x, cropped flush)')
print(f'  crinaro-signature-reversed.png  {DISPLAY_W}x{h_dark} displayed ({SCALE}x, cropped flush)')

IMG_URL = f'https://{SITE}/email/crinaro-signature.png'

title_row = (f'<div style="font-size:13px;line-height:19px;color:{MUTED};">{TITLE}</div>'
             if TITLE else '')

signature = f'''<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:0 0 13px 0;">
      <a href="https://{SITE}" style="text-decoration:none;border:0;">
        <img src="{IMG_URL}" width="{DISPLAY_W}" height="{h_light}"
             alt="Crinaro.AI" style="display:block;border:0;outline:none;text-decoration:none;">
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding:0;">
      <div style="font-size:14px;line-height:20px;color:{NAVY};font-weight:bold;">{NAME}</div>
      {title_row}
      <div style="font-size:13px;line-height:20px;color:{MUTED};">
        <a href="mailto:{EMAIL}" style="color:{GREEN};text-decoration:none;">{EMAIL}</a>
        &nbsp;&middot;&nbsp;
        <a href="https://{SITE}" style="color:{GREEN};text-decoration:none;">{SITE}</a>
      </div>
    </td>
  </tr>
</table>'''

page = f'''<!doctype html>
<html><head><meta charset="utf-8"><title>Crinaro email signature</title>
<style>
  body {{ margin:0; padding:2.5rem 1.5rem; background:#EFF3F6;
         font:15px/1.6 "Helvetica Neue",Helvetica,Arial,sans-serif; color:#0B2545; }}
  .wrap {{ max-width:44rem; margin:0 auto; display:flex; flex-direction:column; gap:1.6rem; }}
  h1 {{ font-size:1.3rem; margin:0; font-weight:600; }}
  ol {{ margin:0; padding-left:1.2rem; color:#3D5570; }}
  li {{ margin-bottom:.45rem; }}
  .card {{ background:#fff; border:1px solid #DCE4EA; border-radius:4px; padding:1.6rem; }}
  .label {{ font:600 11px/1 ui-monospace,Menlo,monospace; letter-spacing:.14em;
            text-transform:uppercase; color:#6A8095; margin-bottom:1rem; }}
  .warn {{ background:#FFF6E5; border:1px solid #E8CF9A; border-radius:4px;
           padding:1rem 1.2rem; font-size:.92rem; color:#6B4E12; }}
  code {{ font-family:ui-monospace,Menlo,monospace; font-size:.88em;
          background:#EFF3F6; padding:.1em .35em; border-radius:2px; }}
</style></head>
<body><div class="wrap">

  <h1>Email signature</h1>

  <div class="card">
    <div class="label">How it looks</div>
    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
      <tr><td style="padding:0 0 13px 0;">
        <img src="crinaro-signature.png" width="{DISPLAY_W}" height="{h_light}" alt="Crinaro.AI" style="display:block;border:0;">
      </td></tr>
      <tr><td style="padding:0;">
        <div style="font-size:14px;line-height:20px;color:{NAVY};font-weight:bold;">{NAME}</div>
        {title_row}
        <div style="font-size:13px;line-height:20px;color:{MUTED};">
          <span style="color:{GREEN};">{EMAIL}</span> &nbsp;&middot;&nbsp;
          <span style="color:{GREEN};">{SITE}</span>
        </div>
      </td></tr>
    </table>
  </div>

  <div>
    <h1 style="font-size:1.05rem;margin-bottom:.6rem;">Install it — pick one</h1>
    <p style="margin:0 0 1rem;color:#3D5570;font-size:.95rem;">
      Gmail &rarr; Settings &rarr; See all settings &rarr; General &rarr; Signature &rarr; Create new.
    </p>
    <p style="margin:0 0 .5rem;"><b>A &mdash; works right now, before the site is live.</b></p>
    <ol>
      <li>In the signature editor click the <b>Insert image</b> button and upload
          <code>crinaro-signature.png</code> from your machine. Gmail hosts it itself, so the
          signature never depends on your site being up.</li>
      <li>Set its size to <b>Small</b> if Gmail inserts it oversized, then type the three text
          lines under it and link the email and domain by hand.</li>
    </ol>
    <p style="margin:1rem 0 .5rem;"><b>B &mdash; after the site is deployed. Paste-and-go, keeps the exact spacing.</b></p>
    <ol>
      <li>Open <code>signature-hosted.html</code> in a browser once
          <code>{IMG_URL}</code> resolves.</li>
      <li>Select the whole signature, copy, paste into the editor. Formatting and links come with it.</li>
    </ol>
    <p style="margin:1rem 0 0;color:#3D5570;font-size:.95rem;">Then, either way:</p>
    <ol>
      <li>Under <b>Signature defaults</b>, set it for new mail <em>and</em> replies.</li>
      <li>Set <b>Send mail as</b> to <code>{EMAIL}</code> as the default, or the signature will
          contradict the from-address.</li>
      <li>Send yourself a test, then check it on your phone.</li>
    </ol>
  </div>

  <div>
    <h1 style="font-size:1.05rem;margin-bottom:.6rem;">Notes</h1>
    <ol>
      <li>The PNG has a transparent background so it sits on any ground. In a client
          that renders signatures on a dark background the navy wordmark will go murky —
          <code>crinaro-signature-reversed.png</code> is there if that turns out to matter.</li>
      <li>No phone number and no confidentiality boilerplate. Both are noise; add a phone
          only if you want inbound calls.</li>
      <li>The wordmark is rasterised in <b>Poppins</b>, standing in for the geometric face
          you have not bought yet. Re-run this script after you license Futura PT or Avenir.</li>
    </ol>
  </div>

</div></body></html>'''

open(os.path.join(OUT, 'signature.html'), 'w').write(page)

# Paste-and-go version. Points at the live URL, so it is only useful once the
# site is deployed — which is exactly why it is a separate file from the guide.
hosted = ('<!doctype html><html><head><meta charset="utf-8">'
          '<title>Crinaro signature — select all and copy</title></head>'
          '<body style="margin:0;padding:28px;background:#fff;">'
          + signature + '</body></html>')
open(os.path.join(OUT, 'signature-hosted.html'), 'w').write(hosted)
open(os.path.join(OUT, 'signature-snippet.html'), 'w').write(signature + '\n')
print('  signature.html                  (start here — preview + install steps)')
print('  signature-hosted.html           (select-all-and-copy, after the site is live)')
print('  signature-snippet.html          (raw markup, if a client takes HTML directly)')
