#!/usr/bin/env node
/*
 * Builds index.html — one self-contained static file.
 *
 * No framework, no bundler, no runtime dependency. The logo SVGs are inlined
 * from ../logo/ai/ at build time, so the site can never drift from the mark,
 * and the deployed artefact makes zero external requests. That is both the
 * cheapest thing to host and the fastest thing to load.
 *
 * Run: node build-site.js   ->   dist/index.html
 */
const fs = require('fs');
const path = require('path');

const LOGO = path.join(__dirname, 'logo', 'ai');
const DIST = path.join(__dirname, '..');   // repo root — Pages serves from here
fs.mkdirSync(DIST, { recursive: true });

const svg = n => fs.readFileSync(path.join(LOGO, n), 'utf8')
  .replace(/<\?xml[^>]*>/, '')
  .replace(/ width="\d+" height="\d+"/, '')
  .trim();

const EMAIL = 'john@crinaro.ai';
const CLAIM = 'Make AI compound.';
// Put the real figure here if you want it stated. "Years" stays vague until you do.
const YEARS = 'Years';

const problems = [
  ['Project two starts at zero',
   'Nothing from the first effort is discoverable. No shared agents, no shared prompts, no evaluation anyone else can pick up and trust.'],
  ['The data has to be re-derived',
   'No lineage, no catalogue, no owner who can say what a field means — so every project pays the same archaeology bill again.'],
  ['The process still assumes people type everything',
   'AI gets bolted onto a delivery method built for a different constraint, then blamed for not changing the outcome.'],
];

// The thesis, as a grid: same three moves, two altitudes.
const mechanism = [
  ['Reusable units',
   'Agents, generators and evaluation harnesses that the next build starts from.',
   'An internal marketplace of plugins and prompts people can actually find.'],
  ['Shared data',
   'Schemas, lineage and golden datasets, versioned like code.',
   'Curated repositories that are catalogued and owned, not rediscovered.'],
  ['Safe reuse',
   'Evaluations in CI, so a change that breaks something is caught before release.',
   'Measurement and human sign-off where the decision carries real risk.'],
];

const verticals = [
  ['Healthcare', 'Thirty years of record drift, and a clinician who will not tolerate a wrong answer'],
  ['GovTech', 'Policy that never reaches the citizen as a working service'],
  ['Travel', 'Fragmented inventory that fails the moment something goes wrong'],
];

const doors = [
  ['Build something', 'Proof',
   'A fixed-price sprint that ends in working software and an honest read — including “do not build this.” Four to six weeks, in your environment, on your data.'],
  ['Fix how things get built', 'Practice',
   'The AI-SDLC work: the process, the factory of specialist agents, the evaluation harness, and the shared library that makes the next project cheaper than the last.'],
];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Crinaro.AI — Make AI compound</title>
<meta name="description" content="Most organisations restart from zero on every AI project. Crinaro builds the shared parts, the process and the evaluation that make the next one faster — in software delivery and in the business itself. Travel, Healthcare, GovTech.">
<meta property="og:title" content="Crinaro.AI — Make AI compound">
<meta property="og:description" content="Most organisations restart from zero on every AI project. Shared parts, a process that produces them, and evaluation that makes reuse safe.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://crinaro.ai/">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg('crinaro-ai-mark-small.svg'))}">
<style>
  /* The brand commits to one visual world — navy and paper — rather than
     following the viewer's theme. Every ground is painted explicitly. */
  :root {
    --navy:#0B2545; --navy-2:#123256; --paper:#F2F6F8; --ground:#FFFFFF;
    --green:#1B5C46; --rgreen:#4FA98A; --blue:#5B84A9; --rblue:#93B8D4;
    --ink:#0B2545; --ink-2:#3D5570; --muted:#6A8095; --hair:#DCE4EA;
    --head:Futura,"Century Gothic","Avenir Next",Avenir,"Trebuchet MS",sans-serif;
    --body:"Helvetica Neue",Helvetica,Arial,system-ui,sans-serif;
    --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  }
  *,*::before,*::after { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  @media (prefers-reduced-motion:reduce) {
    html { scroll-behavior:auto; }
    *,*::before,*::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; }
  }
  body {
    margin:0; background:var(--ground); color:var(--ink);
    font:17px/1.65 var(--body); -webkit-font-smoothing:antialiased;
  }
  .wrap { max-width:62rem; margin:0 auto; padding:0 1.5rem; }
  .narrow { max-width:40rem; }

  h1,h2,h3 { font-family:var(--head); font-weight:500; letter-spacing:.005em;
             text-wrap:balance; margin:0; }
  h1 { font-size:clamp(2rem,5.6vw,3.4rem); line-height:1.05; }
  h2 { font-size:clamp(1.6rem,3.8vw,2.3rem); line-height:1.12; }
  h3 { font-size:1.08rem; font-weight:700; font-family:var(--body); letter-spacing:-.01em; }
  p { margin:0; color:var(--ink-2); }
  .eyebrow { font-family:var(--mono); font-size:.7rem; letter-spacing:.2em;
             text-transform:uppercase; color:var(--muted); margin:0; }

  section { padding:5.5rem 0; border-top:1px solid var(--hair); }
  .stack { display:flex; flex-direction:column; gap:1.1rem; }
  .head { display:flex; flex-direction:column; gap:.75rem; margin-bottom:2.6rem; }

  /* ---- hero ---- */
  .hero { background:var(--navy); border:0; padding:0; }
  .hero .wrap { padding-top:4rem; padding-bottom:4.5rem;
                display:flex; flex-direction:column; gap:2.4rem; }
  .hero svg { width:100%; max-width:26rem; height:auto; display:block; }
  .hero h1 { color:#FFFFFF; max-width:20ch; }
  .hero p { color:var(--rblue); font-size:1.1rem; max-width:44ch; }

  .cta {
    display:inline-flex; align-items:center; gap:.6rem; align-self:flex-start;
    font-family:var(--head); font-size:1rem; letter-spacing:.04em;
    text-decoration:none; padding:.85rem 1.5rem; border-radius:2px;
    background:var(--rgreen); color:var(--navy); font-weight:700;
    transition:background .15s ease, transform .15s ease;
  }
  .cta:hover { background:#6FC4A5; transform:translateY(-1px); }
  .cta.dark { background:var(--green); color:#FFFFFF; }
  .cta.dark:hover { background:#25755A; }

  /* ---- content blocks ---- */
  .cols { display:grid; grid-template-columns:1fr; gap:2rem; }
  @media (min-width:48rem) { .cols { grid-template-columns:repeat(3,1fr); gap:2.4rem; } }
  .col { display:flex; flex-direction:column; gap:.5rem; }
  .col .rule { width:2rem; height:3px; background:var(--green); border-radius:2px; margin-bottom:.4rem; }

  .steps { display:flex; flex-direction:column; gap:0; }
  .step { display:grid; grid-template-columns:1fr; gap:.3rem;
          padding:1.35rem 0; border-bottom:1px solid var(--hair); }
  @media (min-width:44rem) { .step { grid-template-columns:9rem 1fr; gap:2rem; align-items:baseline; } }
  .step:last-child { border-bottom:0; }
  .step .when { font-family:var(--mono); font-size:.72rem; letter-spacing:.14em;
                text-transform:uppercase; color:var(--green); }

  .verts { display:grid; grid-template-columns:1fr; gap:0;
           border-top:1px solid var(--hair); }
  .vert { display:grid; grid-template-columns:1fr; gap:.2rem;
          padding:1.15rem 0; border-bottom:1px solid var(--hair); }
  @media (min-width:44rem) { .vert { grid-template-columns:12rem 1fr; gap:2rem; align-items:baseline; } }
  .vert b { font-family:var(--head); font-size:1.15rem; font-weight:500; color:var(--ink); }
  .vert span { color:var(--ink-2); }

  /* ---- dark band ---- */
  .band { background:var(--navy); border:0; }
  .band h2, .band h3 { color:#FFFFFF; }
  .band p { color:var(--rblue); }
  .band .eyebrow { color:var(--blue); }
  .band .rule { background:var(--rgreen); }
  .band .step { border-color:var(--navy-2); }
  .band .step .when { color:var(--rgreen); }

  /* ---- footer ---- */
  footer { background:var(--navy); padding:3rem 0 3.5rem; }
  footer .wrap { display:flex; flex-direction:column; gap:1.6rem; }
  footer svg { width:100%; max-width:15rem; height:auto; }
  footer a { color:var(--rblue); }
  .fine { font-size:.82rem; color:#6C88A4; }

  /* ---- the mechanism grid: one row per move, one column per altitude ---- */
  .mech { display:grid; grid-template-columns:1fr; gap:0; }
  .mrow { display:grid; grid-template-columns:1fr; gap:.5rem;
          padding:1.6rem 0; border-top:1px solid var(--navy-2); }
  @media (min-width:52rem) {
    .mrow { grid-template-columns:10rem 1fr 1fr; gap:2.2rem; align-items:start; }
  }
  .mrow .move { font-family:var(--head); font-size:1.05rem; color:#FFFFFF; }
  .mhead { display:none; }
  @media (min-width:52rem) {
    .mhead { display:grid; grid-template-columns:10rem 1fr 1fr; gap:2.2rem;
             padding-bottom:.9rem; }
    .mhead span { font-family:var(--mono); font-size:.68rem; letter-spacing:.16em;
                  text-transform:uppercase; color:var(--rgreen); }
  }

  /* ---- two doors ---- */
  .doors { display:grid; grid-template-columns:1fr; gap:1.5rem; }
  @media (min-width:48rem) { .doors { grid-template-columns:1fr 1fr; gap:2.2rem; } }
  .door { border:1px solid var(--hair); border-radius:4px; padding:1.7rem;
          display:flex; flex-direction:column; gap:.55rem; }
  .door .tag { font-family:var(--mono); font-size:.68rem; letter-spacing:.16em;
               text-transform:uppercase; color:var(--green); }

  a { color:var(--green); }
  :focus-visible { outline:2px solid var(--rgreen); outline-offset:3px; }
</style>
</head>
<body>

<header class="hero">
  <div class="wrap">
    ${svg('crinaro-ai-animated.svg')}
    <h1>${CLAIM}</h1>
    <p>Most organisations restart from zero on every AI project. ${YEARS} in Travel, Healthcare
       and GovTech — now spent on the shared parts, the process and the evaluation that make the
       next one faster.</p>
    <a class="cta" href="mailto:${EMAIL}?subject=Crinaro">Start a conversation</a>
  </div>
</header>

<main>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">The problem</p>
      <h2>Everyone has pilots. Nothing accumulates.</h2>
      <p>The models are not the bottleneck and have not been for a while. The bottleneck is that
         effort banks as spend instead of as capability — so the tenth project costs what the
         first one did.</p>
    </div>
    <div class="cols">
      ${problems.map(([h, b]) => `<div class="col"><div class="rule"></div>
        <h3>${h}</h3><p>${b}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">The mechanism</p>
      <h2>Two arenas. The same three moves.</h2>
      <p>Making engineers productive with AI and making a business productive with AI are the same
         problem at different altitudes. Both need parts worth reusing, a substrate worth building
         on, and a way to know reuse is safe.</p>
    </div>
    <div class="mech">
      <div class="mhead">
        <span></span><span>AI-SDLC — how software gets built</span><span>The business — how work gets done</span>
      </div>
      ${mechanism.map(([m, a, b]) => `<div class="mrow">
        <div class="move">${m}</div><p>${a}</p><p>${b}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">Built, not just advised</p>
      <h2>A marketplace of job-search plugins, in build now.</h2>
      <p>Plugins that help an individual get real leverage out of Claude while looking for their
         next role. It is a public instance of the private pattern — discoverable units, a shared
         substrate, reuse that compounds. The same shape you would want inside a company.</p>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">Where the experience is</p>
      <h2>Regulated, legacy-heavy, and full of judgment calls.</h2>
      <p>Three industries where the constraints are real, the data is old, and being wrong has a
         cost somebody can name.</p>
    </div>
    <div class="verts">
      ${verticals.map(([n, d]) => `<div class="vert"><b>${n}</b><span>${d}</span></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">Two ways in</p>
      <h2>Build something, or fix how things get built.</h2>
    </div>
    <div class="doors">
      ${doors.map(([h, tag, b]) => `<div class="door"><div class="tag">${tag}</div>
        <h3>${h}</h3><p>${b}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="narrow stack">
      <p class="eyebrow">Next step</p>
      <h2>Bring one problem worth proving.</h2>
      <p>If it is not worth building, that is a finding too — and it is cheaper to learn in six
         weeks than in six quarters.</p>
      <p style="margin-top:.8rem">
        <a class="cta dark" href="mailto:${EMAIL}?subject=Crinaro">${EMAIL}</a>
      </p>
    </div>
  </div>
</section>

</main>

<footer>
  <div class="wrap">
    ${svg('crinaro-ai-horizontal-reversed.svg')}
    <p class="fine">
      <a href="mailto:${EMAIL}">${EMAIL}</a> &nbsp;·&nbsp; crinaro.ai
    </p>
  </div>
</footer>

</body>
</html>
`;

fs.writeFileSync(path.join(DIST, 'index.html'), html);

// GitHub Pages needs the custom domain declared in the repo itself. Setting it
// in the web UI writes this file; committing it means a redeploy can never drop
// the domain and fall back to <org>.github.io.
fs.writeFileSync(path.join(DIST, 'CNAME'), 'crinaro.ai\n');

// Skip Jekyll. Without this, Pages runs the site through Jekyll, which ignores
// files and folders beginning with an underscore and rewrites things we did not
// ask it to rewrite. This is a plain static site; it needs none of that.
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

fs.writeFileSync(path.join(DIST, 'robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: https://crinaro.ai/sitemap.xml\n');
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  '  <url><loc>https://crinaro.ai/</loc><changefreq>monthly</changefreq></url>\n' +
  '</urlset>\n');

const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`wrote index.html — ${kb} KB, 0 external requests`);
console.log('       CNAME, .nojekyll, robots.txt, sitemap.xml');
