# crinaro.github.io

The published Crinaro.AI site. Static HTML, no framework, and no build step in the deploy path:
GitHub Pages serves this repo root as it stands, and the pages fetch nothing from anywhere.

## What is here

| Path | What it is |
|---|---|
| `index.html` | The claim, the question the page answers, and the routes into the rest |
| `notes/` | The written pieces, each argued at length |
| `what-you-already-have/` | Where to start, and what an empty layer costs |
| `how-the-work-gets-done/` | The three things the argument is run on, and the teams that maintain them |
| `email/` | The email signature images |
| `src/` | The generators and the logo SVGs |

Fourteen pages in all. Everything at the repo root is generated output.
**Edit `src/build-site.js`, never `index.html`.** The next build overwrites it.

## Rebuild

```bash
cd src
node build-site.js      # -> the pages, CNAME, .nojekyll, robots.txt, sitemap.xml
python3 build-email.py  # -> ../email/
```

What that needs, including the awkward part:

- Node, for `build-site.js`. Nothing to install; it reads only the files beside it.
- `cairosvg` and `pillow` for `build-email.py`, and `cairosvg` needs the native libcairo.
- Poppins installed, for the same script. Cairo substitutes its own default silently when a face
  is missing, so the build refuses rather than shipping the signature in the wrong face.

## Status

This repo is output. The reasoning behind the site is in a private repository and is not here:
the decisions, the drafts, the reviews, and the checks that run before anything is published.
So this README can tell you how to rebuild the site, and cannot show you why it says what it says.

## Privacy

The email signature carries personal contact details. Those are kept outside this repo and are
never generated into it; the images in `email/` are the wordmark lockup and carry no contact
details. The publishing step refuses to push when a phone number or a profile link reaches this
tree. That check runs in the private repository, so it is a statement about how this is published
rather than something you can verify from here.

## License

Apache License 2.0. See `LICENSE` and `NOTICE`. The same license as the rest of the Crinaro
repositories, and it covers the writing here as well as the generators.

It does not license the name or the mark: Apache 2.0 grants no trademark rights, so "Crinaro",
"crinaro.ai" and the ridge mark are reserved. `NOTICE` says so plainly.

`src/fonts.css` embeds a subset of Poppins, which is not under that license. It is SIL Open Font
License 1.1, and the text is in `licenses/Poppins-OFL.txt`.
