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
const CLAIM = 'AI from higher ground.';
// The hero breaks at the sentence, never mid-clause — left to text-wrap:balance
// it strands "Then" at the end of a line. Meta tags keep the unbroken string.
const CLAIM_HTML = CLAIM.replace(/\. /, '.<br>');

// The problem is reuse, not delivery. Crinaro is not a custom development shop
// — it builds services others can use, and advises the teams using them. The
// old problem copy described a bespoke build engagement and was wrong for that.
const problems = [
  ['Everyone rebuilds the same thing',
   'Each team writes its own scaffolding, its own prompts, its own evaluation. None of it is shared, so the next project starts at zero.'],
  ['Good work stays trapped',
   'One team solves it properly and has nowhere to put it. Without a shelf, solving a problem twice is cheaper than finding it once.'],
  ['Reuse without evidence is a gamble',
   'Nobody will build on someone else’s work if there is no way to tell whether it holds. So nothing is reused, and everything is rebuilt.'],
];

// The services, each with the audience it is for. Careers is described as
// in-build because it is; advisory is described as available because it is.
// Do not upgrade either — see decisions/03-positioning.md.
const builds = [
  ['Careers Plugins', 'For individuals',
   'A marketplace of job-search plugins that help people get more out of Claude. In build now, not yet shipped.'],
  ['AI-SDLC', 'For teams who build software',
   'The patterns, the specialist agents and the evaluation harness that make reuse safe. Available as advice today.'],
  ['Internal marketplaces', 'For businesses',
   'A shelf your own teams publish to and pull from — plugins, prompts and data, with the evaluation that makes reuse safe.'],
];

// Distribution is the differentiator for regulated buyers: components install
// into the customer's own environment rather than calling a hosted service.
// These are architectural commitments, NOT compliance claims. Never write
// HIPAA, SOC 2 or FedRAMP here — none of them have been certified.
const delivery = [
  ['It installs where you already work',
   'Components and patterns deploy inside your environment, alongside the systems you run. There is no hosted service in the middle.'],
  ['Your data does not move',
   'The work happens where the data already lives, against your own model endpoint and your own keys. Nothing is sent back to us, because there is no path for it.'],
  ['You can run it without us',
   'The evaluation harness ships inside the component, so your team can prove it still works on their own. Support is advice, not access.'],
];

// Three, not five. Retail and Recruiting were padding — John has named three
// industries he has actually worked in, and the page claims no more than that.
// See decisions/03-positioning.md.
const verticals = [
  ['Healthcare', 'Records that cannot answer the question at the bedside'],
  ['GovTech', 'Policy that never reaches the citizen as a working service'],
  ['Travel', 'Fragmented inventory that fails the moment something goes wrong'],
];

// Advisory that leaves something behind — not a bespoke build. The engagement
// ends with the client's own team running it, which is the point.
const weeks = [
  ['Week 1', 'We look at how your teams build today. The tools, the handoffs, and what already exists that nobody can find.'],
  ['Weeks 2–4', 'We stand up the smallest useful thing — a shared pattern, a working evaluation, or a shelf people can publish to.'],
  ['Weeks 5–6', 'Your team runs it without us. You keep the patterns and the harness, and get a recommendation. Including “do not build this.”'],
];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Crinaro.AI — AI from higher ground</title>
<meta name="description" content="Crinaro builds AI services that businesses and individuals can use — a job-search plugin marketplace, AI-SDLC patterns, and internal marketplaces — installed in your own environment. Patterns learned in healthcare, government and travel.">
<meta property="og:title" content="Crinaro.AI">
<meta property="og:description" content="${CLAIM} Services that businesses and individuals can use, and advice for the teams putting AI to work.">
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
  .hero h1 { color:#FFFFFF; max-width:32ch; }
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

  a { color:var(--green); }
  :focus-visible { outline:2px solid var(--rgreen); outline-offset:3px; }
</style>
</head>
<body>

<header class="hero">
  <div class="wrap">
    ${svg('crinaro-ai-animated.svg')}
    <h1>${CLAIM_HTML}</h1>
    <p>Services that businesses and individuals can use, and advice for the teams putting AI to
       work.</p>
    <a class="cta" href="mailto:${EMAIL}?subject=Crinaro">Start a conversation</a>
  </div>
</header>

<main>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">The problem</p>
      <h2>Everyone is building the same things, separately.</h2>
      <p>The hard part was never the model. It is that almost nothing built with one survives to
         be used twice.</p>
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
      <p class="eyebrow">How we think</p>
      <h2>See into both valleys at once.</h2>
      <p>Crinaro is a ridge line — from the Italian <i>crinale</i>, the crest path where you can
         see down both sides. That is the method. Stand where the whole system is visible, then
         design end to end, rather than improving one step and moving the cost somewhere else.</p>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">What we build</p>
      <h2>Components other people run.</h2>
      <p>Technology and patterns you install and use yourself. Three of them, each the same move
         for a different audience: build the reusable unit, make it findable, and prove it works
         before anyone depends on it.</p>
    </div>
    <div class="cols">
      ${builds.map(([n, role, b]) => `<div class="col"><div class="rule"></div>
        <p class="eyebrow">${role}</p><h3>${n}</h3><p>${b}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">How it runs</p>
      <h2>In your shop, not ours.</h2>
      <p>AI is going to be distributed — the work moving to where the data already is, rather than
         the data moving to the work. That suits a hospital or an agency, and it is how these
         components are built.</p>
    </div>
    <div class="cols">
      ${delivery.map(([h, b]) => `<div class="col"><div class="rule"></div>
        <h3>${h}</h3><p>${b}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">Advisory</p>
      <h2>Advice that leaves something behind.</h2>
      <p>A fixed-price sprint of four to six weeks, working alongside your teams. It ends with
         them running it without us.</p>
    </div>
    <div class="steps">
      ${weeks.map(([w, b]) => `<div class="step"><div class="when">${w}</div><p>${b}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">Where this comes from</p>
      <h2>Patterns learned in hard places.</h2>
      <p>The components are not industry-specific. The experience behind them is — regulated,
         legacy-heavy, and full of decisions that are judgment calls rather than lookups. What
         holds up there travels.</p>
    </div>
    <div class="verts">
      ${verticals.map(([n, d]) => `<div class="vert"><b>${n}</b><span>${d}</span></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="narrow stack">
      <p class="eyebrow">Next step</p>
      <h2>Find the thing worth building once, and building well.</h2>
      <p>Bring the problem your teams keep solving separately. If it is not worth building, that
         is a finding too.</p>
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
console.log(`wrote dist/index.html — ${kb} KB, 0 external requests`);
console.log('       dist/CNAME, .nojekyll, robots.txt, sitemap.xml');
