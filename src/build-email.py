#!/usr/bin/env python3
"""Build the email signature: a raster logo plus paste-ready HTML.

Email is not the web. SVG is blocked by most clients, webfonts do not load, and
Outlook needs tables. So the logo is rasterized to PNG at 3x and the signature
is table-based with inline styles only.

    python3 build-email.py     ->  dist/email/
"""
import io
import json
import os
import re
import cairosvg
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(HERE, 'logo', 'ai')
# Two destinations, and the split is a privacy boundary rather than tidiness.
#
# OUT is inside dist/, so everything in it is PUBLISHED. Only the rasters belong
# there: the signature's <img> points at crinaro.ai/email/crinaro-signature.png,
# so that file has to be reachable. The images carry no personal data — they are
# the logo lockup.
#
# LOCAL is outside dist/ and is never published. The signature HTML goes here,
# because it carries a real name, a real mobile number and a real LinkedIn
# profile. Those were live on crinaro.ai for a few hours on 2026-08-20 before
# John caught it. A phone number on a public page is public permanently, whatever
# you do afterwards.
#
# Nothing is lost by keeping the HTML local: it is an install guide and a
# copy-paste source that John opens himself. It never needed a URL.
OUT = os.path.join(HERE, '..', 'email')
LOCAL = os.path.join(HERE, 'signature-local')
os.makedirs(OUT, exist_ok=True)
os.makedirs(LOCAL, exist_ok=True)

# --- who the signature is for. Leave any of these empty to omit it. ---------
# Identity lives OUTSIDE this file, and that is not fussiness.
#
# This generator is published: deploy-site.sh copies it into the public repo's
# src/ so the site can rebuild itself. Real contact details written here are
# published with it — which is exactly how a mobile number reached crinaro.ai on
# 2026-08-20, and it went out in this file even after the HTML was pulled.
#
# So the defaults below are placeholders and they are what the world sees.
# John's real details live in site/signature-identity.json, which is gitignored
# and never leaves this machine. Missing file means placeholders, which is the
# safe direction to fail in.
IDENTITY = os.path.join(HERE, 'signature-identity.json')
_id = {
    'name': 'John Doe',
    'title': '',                    # e.g. 'Founder' — empty omits the line
    'email': 'name@crinaro.ai',
    'site': 'crinaro.ai',
    'mobile': '(555) 555-1234',     # shown as typed; the tel: link is derived
    'linkedin': 'https://www.linkedin.com/in/johndoe',
    'linkedin_label': 'LinkedIn',   # empty prints the address instead of the word
}
if os.path.exists(IDENTITY):
    with open(IDENTITY) as fh:
        _id.update(json.load(fh))
    print('  using site/signature-identity.json — real details, local only')
else:
    print('  no signature-identity.json — placeholder details')

NAME, TITLE, EMAIL = _id['name'], _id['title'], _id['email']
SITE, MOBILE = _id['site'], _id['mobile']
LINKEDIN, LINKEDIN_LABEL = _id['linkedin'], _id['linkedin_label']

NAVY, GREEN, MUTED = '#0B2545', '#1B5C46', '#6A8095'

# Set against the width of the text beneath it: the block reads as one unit only
# while the lockup is the widest thing in it, with nothing hanging off either
# side. It was 190 when the text ran to about 150px. Putting the email, the
# number and LinkedIn on one line took that to 267px, so the logo had to grow
# with it rather than sit marooned above a wider block.
#
# 02-identity.md sets 180px as the FLOOR for the horizontal lockup and no
# ceiling. `node check-signature-fit.js` measures the relationship; change the
# contact lines and re-run it before assuming this number still holds.
DISPLAY_W = 280
SCALE = 3


# The face the wordmark is rasterized in. Poppins is the documented stand-in;
# override with SIGNATURE_FACE when a machine has something better licensed.
FACE = os.environ.get('SIGNATURE_FACE', 'Poppins')


def _face_resolves(name):
    """True if cairo can actually find this face.

    cairo does not report a miss — it silently substitutes its default. So
    rasterize the same string in the requested face and in a name that cannot
    exist: identical bytes mean the request was never honored.
    """
    def probe(font):
        svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="60">'
               f'<text x="4" y="44" font-family="{font}" font-size="36">CRINARO</text></svg>')
        return cairosvg.svg2png(bytestring=svg.encode())
    return probe(name) != probe('NoSuchFace-' + '0' * 12)


if not _face_resolves(FACE):
    raise SystemExit(
        f'REFUSING TO BUILD: "{FACE}" is not installed, and cairo substitutes its\n'
        f'  default without saying so — the signature would ship a grotesque\n'
        f'  wordmark in a PNG nobody re-checks.\n'
        f'  Install {FACE}, or name a face this machine has:\n'
        f'      SIGNATURE_FACE="Futura" python3 build-email.py\n'
        f'  Note that the real face is still unlicensed; see HANDOFF.md.')


def _render(src, width):
    """Rasterise a logo SVG to a PIL image, forcing a real geometric face."""
    svg = open(os.path.join(LOGO, src)).read()
    # The shipped SVGs name Futura first; a silent fallback would bake the wrong
    # letterforms into a PNG nobody re-checks, so FACE is verified above.
    svg = svg.replace(
        "font-family=\"Futura, 'Century Gothic', 'Avenir Next', Avenir, sans-serif\"",
        f'font-family="{FACE}"')
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
        raise SystemExit('logo rasterized empty — check the SVG')

    out_w = DISPLAY_W * SCALE
    results = []
    for src, dst in (('crinaro-ai-horizontal.svg', 'crinaro-signature.png'),
                     ('crinaro-ai-horizontal-reversed.svg', 'crinaro-signature-reversed.png')):
        im = light if src.endswith('horizontal.svg') else _render(src, work)
        im = im.crop(box)
        h = int(round(out_w * im.height / im.width))
        im.resize((out_w, h), Image.LANCZOS).save(os.path.join(OUT, dst))
        display_h = int(round(DISPLAY_W * im.height / im.width))
        results.append(display_h)

        # A second copy at 1x, for the path where the image is uploaded to the
        # client rather than pasted as HTML. Gmail's image insert drops the
        # width attribute, so a 3x file lands three times too large beside
        # 14px text — which looks exactly like a logo that will not line up.
        # When the intrinsic size IS the display size there is nothing to get
        # wrong. Slightly softer on a retina screen; correct everywhere.
        if dst == 'crinaro-signature.png':
            im.resize((DISPLAY_W, display_h), Image.LANCZOS).save(
                os.path.join(OUT, 'crinaro-signature-inline.png'))
    return results


h_light, h_dark = rasterise_signature_pair()
print(f'  crinaro-signature.png           {DISPLAY_W}x{h_light} displayed ({SCALE}x, cropped flush)')
print(f'  crinaro-signature-reversed.png  {DISPLAY_W}x{h_dark} displayed ({SCALE}x, cropped flush)')

IMG_URL = f'https://{SITE}/email/crinaro-signature.png'

title_row = (f'<div style="font-size:13px;line-height:19px;color:{MUTED};">{TITLE}</div>'
             if TITLE else '')


def _tel(number):
    """tel: needs digits, the signature shows the number as typed."""
    d = re.sub(r'\D', '', number)
    return '+1' + d if len(d) == 10 else '+' + d


def _short(url):
    """A profile URL reads as an address; the scheme and www are noise.

    Deliberately does not spell a profile path out in this docstring — the
    publish gate scans every file for one, and a literal here is a false
    positive that would push someone to loosen the check.
    """
    return re.sub(r'^https?://(www\.)?', '', url).rstrip('/')


# One contact line: email, number, LinkedIn. John's layout, and it is the
# tightest of the arrangements tried — three lines total, nothing stranded.
#
# The domain is deliberately NOT here. The lockup above reads CRINARO.AI and
# links to the site, so a crinaro.ai text line says the same thing twice and
# spends a line doing it.
#
# LinkedIn is the word, not the address. Spelled out it added 110px to this
# line for no extra information — the link goes to the same place.
#
# The whole line must stay NARROWER THAN THE LOCKUP or the block comes apart;
# that is what DISPLAY_W is set against, and what check-signature-fit.js
# measures. Adding a TITLE, a longer name or a second number will all push on
# it, and none of it is visible to the build — the markup stays valid however
# far it overhangs.
_row_1 = [(f'mailto:{EMAIL}', EMAIL)] + \
         ([(f'tel:{_tel(MOBILE)}', MOBILE)] if MOBILE else []) + \
         ([(LINKEDIN, LINKEDIN_LABEL or _short(LINKEDIN))] if LINKEDIN else [])
_row_2 = []


def _meta(items, linked):
    """One metadata line. `linked` is False for the preview, which must not
    carry live links a reader might click while judging the layout."""
    if not items:
        return ''
    cells = [(f'<a href="{h}" style="color:{GREEN};text-decoration:none;">{t}</a>' if linked
              else f'<span style="color:{GREEN};">{t}</span>') for h, t in items]
    inner = '\n        &nbsp;&middot;&nbsp;\n        '.join(cells)
    return (f'<div style="font-size:13px;line-height:20px;color:{MUTED};">\n'
            f'        {inner}\n      </div>')

# Where the lockup sits relative to the text. 'below' puts the person first and
# lets the brand sign off, which also stacks the three widths in ascending
# order — name, contact line, lockup — instead of hanging a 71px name in the
# middle of two full-width rows with a hole of white beside it.
LOGO_POSITION = 'below'         # 'above' | 'below'

_logo_cell = f'''  <tr>
    <td style="padding:{'13px 0 0 0' if LOGO_POSITION == 'below' else '0 0 13px 0'};">
      <a href="https://{SITE}" style="text-decoration:none;border:0;">
        <img src="{IMG_URL}" width="{DISPLAY_W}" height="{h_light}"
             alt="Crinaro.AI" style="display:block;border:0;outline:none;text-decoration:none;">
      </a>
    </td>
  </tr>'''

_text_cell = f'''  <tr>
    <td style="padding:0;">
      <div style="font-size:14px;line-height:20px;color:{NAVY};font-weight:bold;">{NAME}</div>
      {title_row}
      {_meta(_row_1, True)}
      {_meta(_row_2, True)}
    </td>
  </tr>'''

_rows = (_text_cell + '\n' + _logo_cell) if LOGO_POSITION == 'below' \
        else (_logo_cell + '\n' + _text_cell)

# The preview card shows the same thing with a local image and no live links —
# a reader judging the layout should not be able to click out of it.
_pv_logo = f'''      <tr><td style="padding:{'13px 0 0 0' if LOGO_POSITION == 'below' else '0 0 13px 0'};">
        <img src="crinaro-signature.png" width="{DISPLAY_W}" height="{h_light}" alt="Crinaro.AI" style="display:block;border:0;">
      </td></tr>'''
_pv_text = f'''      <tr><td style="padding:0;">
        <div style="font-size:14px;line-height:20px;color:{NAVY};font-weight:bold;">{NAME}</div>
        {title_row}
        {_meta(_row_1, False)}
        {_meta(_row_2, False)}
      </td></tr>'''
_preview_rows = (_pv_text + '\n' + _pv_logo) if LOGO_POSITION == 'below' \
                else (_pv_logo + '\n' + _pv_text)

signature = f'''<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
{_rows}
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
{_preview_rows}
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
          <b><code>crinaro-signature-inline.png</code></b> — <b>not</b> the other one. Gmail's
          image insert discards the size attribute, and that file is already the right size, so
          there is nothing left to get wrong. Gmail hosts it itself, so the signature never
          depends on your site being up.</li>
      <li>Type the two text lines under it and link the email and domain by hand. If the logo
          still comes in oversized, set its size to <b>Small</b>.</li>
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
      <li>The domain is not repeated in the text. The lockup above reads CRINARO.AI and links
          to the site, so a <code>crinaro.ai</code> line would say the same thing twice.</li>
      <li>Email, number and LinkedIn on one line, and LinkedIn is the word rather than the
          address — spelled out it added 110px for no extra information, and the link goes to
          the same place. The number is a <code>tel:</code> link, so it dials from a phone.</li>
      <li>The logo is sized to that line, not the other way round. The block reads as one unit
          only while the lockup is the widest thing in it, so adding a title, a longer name or
          a second number means re-running <code>node check-signature-fit.js</code> — the
          markup stays valid however far the text overhangs, so nothing else will tell you.</li>
      <li>No confidentiality boilerplate. It is noise, and nobody reads it.</li>
      <li>The wordmark is rasterized in <b>{FACE}</b> — verified present, not assumed, because
          cairo substitutes silently. It stands in for the geometric face you have not bought
          yet. Re-run this script after you license Futura PT or Avenir.</li>
    </ol>
  </div>

</div></body></html>'''

open(os.path.join(LOCAL, 'signature.html'), 'w').write(page)

# Paste-and-go version. Points at the live URL, so it is only useful once the
# site is deployed — which is exactly why it is a separate file from the guide.
hosted = ('<!doctype html><html><head><meta charset="utf-8">'
          '<title>Crinaro signature — select all and copy</title></head>'
          '<body style="margin:0;padding:28px;background:#fff;">'
          + signature + '</body></html>')
open(os.path.join(LOCAL, 'signature-hosted.html'), 'w').write(hosted)
open(os.path.join(LOCAL, 'signature-snippet.html'), 'w').write(signature + '\n')
print('  signature.html                  (start here — preview + install steps)')
print('  signature-hosted.html           (select-all-and-copy, after the site is live)')
print('  signature-snippet.html          (raw markup, if a client takes HTML directly)')
