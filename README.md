# crinaro.github.io

The Crinaro.AI site. One static HTML file, **14 KB, zero external requests**, no framework and no
build pipeline in the deploy path — GitHub Pages serves the repo root as-is.

## Rebuild

```bash
cd src
node build-site.js      # -> ../index.html, CNAME, .nojekyll, robots.txt, sitemap.xml
python3 build-email.py  # -> ../email/  (needs: pip install cairosvg)
```

`src/` holds the generators and the logo SVGs; everything at the repo root is generated output.
**Edit `src/build-site.js`, never `index.html`** — the next build overwrites it. Copy lives in the
`problems`, `weeks` and `verticals` arrays near the top.

The logo SVGs are inlined at build time, so the page can never drift from the mark and the
deployed file fetches nothing from anywhere.

## Positioning

The claim is **Make AI compound**. The argument: most organisations restart from zero on every AI
project, and the fix has the same three moves whether you are making engineers productive
(AI-SDLC) or making a business productive (internal marketplaces, curated data). Lead with that
mechanism, never with "leverage AI effectively" — that sentence is the most crowded in the market.

`YEARS` is a constant at the top of the builder. It reads "Years"; put the real number in if you
want it stated.

## Deploy

Settings → Pages → deploy from branch `main`, folder `/` (root). Push to `main` and it is live.

`CNAME` is committed, so the custom domain survives redeploys instead of reverting to
`crinaro.github.io`. `.nojekyll` stops Pages running a plain static site through Jekyll.

### DNS (Squarespace)

    A      @     185.199.108.153
    A      @     185.199.109.153
    A      @     185.199.110.153
    A      @     185.199.111.153
    CNAME  www   crinaro.github.io.

**Do not touch the MX or TXT records** — they carry Google Workspace mail, SPF, DKIM and DMARC.

Tick **Enforce HTTPS** in Settings → Pages once GitHub's DNS check passes and the certificate is
issued. The checkbox is greyed out until then.

## Known gaps

- **The wordmark calls a font stack**, so `CRINARO.AI` renders in whatever geometric face the
  visitor has. Buy Futura PT or Avenir, then convert the logo to outlines.
- **No case study anywhere on the page.** That is the honest gap, not a design one.
- No analytics, no cookie banner, no contact form — all deliberate. The CTA is a `mailto:`.
