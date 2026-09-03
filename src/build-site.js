#!/usr/bin/env node
/*
 * Builds index.html — one self-contained static file.
 *
 * No framework, no bundler, no runtime dependency. The logo SVGs are inlined
 * from ../logo/ai/ at build time, so the site can never drift from the mark,
 * and the deployed artifact makes zero external requests. That is both the
 * cheapest thing to host and the fastest thing to load.
 *
 * Run: node build-site.js   ->   dist/index.html
 */
const fs = require('fs');
const path = require('path');

const LOGO = path.join(__dirname, 'logo', 'ai');
const DIST = path.join(__dirname, '..');   // repo root — Pages serves from here
fs.mkdirSync(DIST, { recursive: true });

// Directories whose MEMBERSHIP this script decides, cleared before they are
// rebuilt. Without this the build only ever creates and overwrites, so a
// renamed note leaves its old directory behind in dist, and deploy-site.sh then
// copies that stale directory back over the public tree it had just wiped. The
// deploy's wipe was written to stop a retired path living forever and could not,
// because the staleness was arriving from this side. Four retired note URLs
// stayed live on 2026-08-26 for exactly that reason.
for (const owned of ['notes', 'icons']) {
  fs.rmSync(path.join(DIST, owned), { recursive: true, force: true });
}

// SVG <text> does not inherit the page's --head, it carries its own stack, and
// the shipped lockups name Futura first. Inlined into a page that embeds
// Poppins, that meant the CSS headings got the webfont while the WORDMARK ITSELF
// still fell back to whatever the visitor happened to own — the one element
// where the shift is most obvious. Rewritten at inline time; the source SVGs are
// left alone, exactly as build-email.py does for the raster.
const HEAD_SVG = "Poppins,Futura,'Century Gothic','Avenir Next',Avenir,sans-serif";
const headStack = s => s.replace(
  /font-family="Futura,\s*'Century Gothic',\s*'Avenir Next',\s*Avenir,\s*sans-serif"/g,
  `font-family="${HEAD_SVG}"`);

const svg = n => headStack(fs.readFileSync(path.join(LOGO, n), 'utf8')
  .replace(/<\?xml[^>]*>/, '')
  .replace(/ width="\d+" height="\d+"/, '')
  .trim());

// The head face, Latin-subset and base64'd by build-fonts.py. Inlined rather
// than linked because the page makes zero external requests — same reason the
// logo SVGs are inlined. Committed, so publishing needs no fonttools; re-run
// build-fonts.py when the face or the weights change.
const FONTS_CSS = path.join(__dirname, 'fonts.css');
if (!fs.existsSync(FONTS_CSS)) {
  console.error('missing site/fonts.css — run: python3 build-fonts.py');
  process.exit(1);
}
const FONTS = fs.readFileSync(FONTS_CSS, 'utf8').trim();

const EMAIL = 'john@crinaro.ai';
// Every page goes out without its build-time comments. Two comments explaining
// brand decisions shipped inside index.html and were live on crinaro.ai until
// 2026-09-02, found by a review rather than by a gate: view-source IS published
// output, and the rule that internal reasoning never crosses into the public repo
// does not stop at file paths. The comments stay in this file, where the team
// reads them, and leave at the door. Write pages through this, never through
// fs.writeFileSync directly.
const writePage = (p, html) => fs.writeFileSync(p, html.replace(/<!--[\s\S]*?-->/g, ''));

const CLAIM = 'AI from higher ground.';
// The hero breaks at the sentence, never mid-clause — left to text-wrap:balance
// it strands "Then" at the end of a line. Meta tags keep the unbroken string.
const CLAIM_HTML = CLAIM.replace(/\. /, '.<br>');

// The subhead, declared once because it was written out four times in this file.
// The meta tags are not only a social-share detail: the og pair renders as the
// preview card wherever the site is linked, so a drift here is a drift in copy a
// reader sees before the page loads. check-drift.sh compares the rendered page
// against build-icons.py, the deck and the decisions file, but it never read the
// meta tags, which is exactly how a second copy goes stale unwatched.
const SUB = 'Ideas and patterns worked out over 30 years in healthcare, GovTech and travel, now applied with agents.';

// The problem is reuse, not delivery. Crinaro is not a custom development shop
// — it builds services others can use, and advises the teams using them. The
// old problem copy described a bespoke build engagement and was wrong for that.
// Rewritten twice on 2026-09-02. They were scaffolding, prompts and evaluation,
// which is an AI TOOLING problem and much smaller than the page argues; measured
// against John's own thesis, ownership arrived 19% into the page and information
// never did. They are a causal chain now, and the ORDER carries it: no owner, so
// no answer anyone can trust, so it gets built again. Duplication is the visible
// end of it, never the disease.
//
// Second pass, John: the cards needed to reach a non-technical executive and to
// name a cost. Card 1 opens on the inversion rather than on an engineering
// artifact, because "finance owns finance, and nobody owns the system that runs
// it" is a thing a COO recognizes and a request touching four components is not.
// Card 3 states the bill and NO LONGER restates principle 4 — it did, clumsily,
// and before that it contradicted it. Do not put the routes-got-cheaper argument
// back in here; it belongs to principle 4 and to five-user-apis.
const problems = [
  ['Nobody is answerable',
   'Ask who owns a part of the business and you get a name. Ask who owns the system that runs it ' +
     'and you get a meeting. The work happens anyway, done by whoever picked it up, and they ' +
     'decide with only their own part of it in view.'],
  ['No answer anyone can trust',
   'What the thing actually does sits with the people who built it, and in whatever copies other ' +
     'teams keep so they can get on. Your people handle that by knowing who to ask. An agent has ' +
     'nobody to ask, and when two answers disagree it cannot tell which one is right. So it picks, ' +
     'confidently.'],
  ['So it gets built again',
   'A second one gets built, correctly, by people doing their jobs well. It surfaces years later, ' +
     'when one change has to be made in several places and no two of them agree. Nothing on a plan ' +
     'ever showed that cost, and it arrives again every time anything changes.'],
];

// The maintenance team, by role. These are real agent definitions — the six in
// crinaro/marketplace-dev under .claude/agents/. That repo is PRIVATE: it is
// the dev repo that maintains the public marketplace. See the dev/public split in
// CLAUDE.md. So they are real and a buyer cannot read them — never write a line
// inviting anyone to go and do so. Keep each description faithful to what the
// agent actually owns; if the team changes, change this list.
//
// Note what they are NOT: none of them writes features. An architect, an auditor,
// a gate keeper, a docs steward, a release manager and a delivery verifier — the
// maintenance half, which is the half that decides whether an AI-built thing is
// still alive in six months.
const factory = [
  ['Architect', 'The shape of the thing: what is an agent, what is a script, what belongs in a manifest.'],
  ['Deployment auditor', 'Where it can actually run: a desktop, a schedule, a headless container, and whether the docs say so truthfully.'],
  ['Gate keeper', 'The checks. The regression suite, the fixtures, and whether CI agrees with what passed locally.'],
  ['Docs steward', 'The written record: decisions, rulebooks, and stale claims about a system that has moved on.'],
  ['Release manager', 'Shipping, so it actually loads for someone. Versions, catalog, cache, and a check from a fresh session.'],
  ['Delivery verifier', 'What people actually install after the push: whether it matches what shipped, and whether a claimed fix is really in it.'],
];

// What the factory maintains. Framed as living assets rather than products,
// because that is the actual claim: not that these were built with AI, but
// that they are kept alive by agent teams. The marketplace is public and
// installable. Nothing here may imply adoption — that rule stands. What changed
// on 2026-08-20 is that the cards stopped making usage claims at all, so the
// caveat that used to bound one is no longer needed. See the note on the
// marketplace card, and decisions/06-evidence-from-the-repos.md.
const assets = [
  // Order is John's, 2026-08-20: the reference, then the brand, then the
  // marketplace. It runs from the accumulated thinking to the thing built on it
  // to the thing put in front of a real problem — which is also the order the
  // page argues in. The standfirst above names the LAST one as the checkable
  // one; if this order changes again, that sentence changes with it.
  //
  // "Private — under engagement" was on the reference card, sitting in a status
  // column beside "Public" and "Internal", so the column read as deployment
  // states and that one read as *there are clients*. There are none. Flagged
  // independently by brand-critic twice, and forbidden outright by the AI-SDLC
  // pack's rule against implying customers or deployments.
  //
  // The eyebrow carries a count, like the other two, because a status column
  // where one cell counts a team and the next does not reads as though the
  // first has no team. It does: twelve agents, verified against the repo by
  // check-claims.sh, not carried forward from a document. "Not published" moved
  // out of this cell and is stated plainly in the note under the diagram below,
  // which is where a reader who wants to go and look would hit it anyway.
  ['The AI-SDLC reference', 'Private · twelve agents',
   'Delivery end to end on an agentic model, not one team’s repos: what gets asked for, how it is built, how you know it shipped. Worked into patterns another team can pick up.'],
  ['This brand', 'Internal · four agents',
   'The page you are reading, the deck, the identity and the rules that govern them. A critic, a copy editor, one that renders every visual and looks at it, and one that argues the other side of anything written.'],
  // "Running daily for one person, not yet a second" was here, and it WAS
  // load-bearing for as long as the card described a product — it was the clause
  // that stopped the description implying adoption. John removed it 2026-08-20.
  // That is safe now, and only now, because the card no longer makes a usage
  // claim for the caveat to bound: it says what the marketplace is for and that
  // agent teams get run in it, and says nothing about who uses it. If a usage or
  // adoption claim ever comes back, the caveat has to come back with it.
  ['The plugin marketplace', 'Public · installable',
   'Where the AI-SDLC reference gets tested in public. The utilities are what comes out along the way: an agent team for the job search, and a connector for several mailboxes.',
   'https://github.com/crinaro/marketplace', 'Read the marketplace'],
];

// The AI-SDLC span, drawn rather than described. The reference is private and
// not published, so this shows the SHAPE of the work — how far it reaches and
// what holds it together — and none of the decisions inside it. "Shared under
// engagement" was here and said what the card's old eyebrow said: that
// engagements exist. They do not. Inline SVG, so the page still makes zero
// external requests. See decisions/06-evidence-from-the-repos.md.
const STAGES = [
  ['Capability spec', 'roadmap team'],
  ['Work items', 'across repos'],
  ['Agents', 'marketplace + local'],
  ['Compute, routing', 'per role, per model'],
  ['Merged, reconciled', 'against the spec'],
];
const BOX_W = 176, BOX_GAP = 30, BOX_Y = 26, BOX_H = 86, KB_Y = 196;
const flow = `<svg viewBox="0 0 1000 272" role="img"
     aria-label="A capability spec becomes work items across repos, built by agents on routed compute, then merged and reconciled against the original spec, with a knowledge layer underneath every stage">
  ${STAGES.map(([t, s], i) => {
    const x = i * (BOX_W + BOX_GAP), cx = x + BOX_W / 2;
    return `<g>
    <rect x="${x}" y="${BOX_Y}" width="${BOX_W}" height="${BOX_H}" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
    <text x="${cx}" y="${BOX_Y + 38}" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="17" font-weight="500">${t}</text>
    <text x="${cx}" y="${BOX_Y + 60}" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">${s}</text>
    <path d="M${cx} ${BOX_Y + BOX_H} L${cx} ${KB_Y}" stroke="#93B8D4" stroke-width="1.5" stroke-dasharray="3 5"/>
  </g>`;
  }).join('\n  ')}
  ${STAGES.slice(1).map((_, i) => {
    const gx = (i + 1) * (BOX_W + BOX_GAP) - BOX_GAP / 2;
    return `<path d="M${gx - 5} ${BOX_Y + 36} l7 7 -7 7" fill="none" stroke="#1B5C46" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('\n  ')}
  <rect x="0" y="${KB_Y}" width="1000" height="66" rx="3" fill="#0B2545"/>
  <text x="24" y="${KB_Y + 28}" fill="#FFFFFF" font-family="${HEAD_SVG}" font-size="16" font-weight="500">The knowledge layer</text>
  <text x="24" y="${KB_Y + 50}" fill="#93B8D4" font-family="Helvetica,Arial,sans-serif" font-size="13">Current-state index and deep-research memory: queried, never re-derived.</text>
</svg>`;

// What makes the reference different from every other set of AI-SDLC docs.
// This is the advisory product: not a recommendation, a way of deciding.
const method = [
  ['The options',
   'Constraints differ by organization. Each decision names the real alternatives rather than one best practice.'],
  ['The signal',
   'A decision table that picks between them, against things you can actually observe. Not “it depends”.'],
  ['The trigger',
   'The specific, felt pain that says it is time for the more complex option, so you never buy infrastructure for a problem you do not have yet.'],
];

// Distribution is the differentiator for regulated buyers: components install
// into the customer's own environment rather than calling a hosted service.
// These are architectural commitments, NOT compliance claims. Never write
// HIPAA, SOC 2 or FedRAMP here — none of them have been certified.
// The "In your shop, not ours" section lived here — deployment topology, your own
// keys, no hosted service in the middle. Cut 2026-08-20. It was a procurement
// answer for a software vendor, and this site is a body of work rather than a
// company selling a product. It also carried the page's strongest present-tense
// deployment claims ("components and patterns deploy inside your environment",
// "the evaluation harness ships inside the component"), which read as a description of what
// happens today when nothing is deployed anywhere. Both problems left with it.

// Three, not five. Retail and Recruiting were padding — John has named three
// industries he has actually worked in, and the page claims no more than that.
// No span of years is attached to any of them, on the site or in the meta: John
// has given no figure and one must not be inferred. See decisions/03-positioning.md.
//
// The heading above this list is "Patterns learned in hard places." It briefly
// read "Crinaro is John Kelly." and was reverted the same day, 2026-08-20 — the
// brand is not tied to a named person. Do not restore that. This list and the
// heading have to move together, and both have to match the meta description.
const verticals = [
  ['Healthcare', 'Records that cannot answer the question at the bedside'],
  ['GovTech', 'Policy that never reaches the citizen as a working service'],
  ['Travel', 'Fragmented inventory that fails the moment something goes wrong'],
];

// Advisory that leaves something behind — not a bespoke build. The engagement
// ends with the client's own team running it, which is the point.
// The week-by-week breakdown of a fixed-price four-to-six week sprint was here.
// Removed 2026-08-20 — a dated, priced engagement shape is a consultancy
// product, and this is a body of work rather than a services catalog. It also
// narrows the page to one kind of reader. The substance of the
// three weeks survives as one paragraph in the section below; what went is the
// calendar and the price, which were the parts that presumed the engagement.
//
// That paragraph opened "Working alongside your teams, not in place of them",
// which said the same thing as its own last sentence — the team ends up running
// it — and said it as a negation of what a supplier does. The positive half is
// kept and the negation is gone. "without us" is also gone, and so is the
// company voice it belonged to. Decided 2026-08-20: the page read as a
// consultancy, which is not what this is. There is no first-person plural
// anywhere in the copy now. Do not reintroduce one.


// One stylesheet, shared by every page this generator writes. Extracted so a
// second page cannot fork the palette — a duplicated :root is exactly the kind
// of drift check-contrast.js and check-drift.sh exist to catch after the fact.
const CSS = `${FONTS}
  .principles { counter-reset:pr; margin:2.6rem 0 0; }
  .principle { counter-increment:pr; position:relative; padding-left:2.6rem;
               margin:0 0 1.7rem; max-width:44rem; }
  .principle::before { content:counter(pr); position:absolute; left:0; top:.15rem;
                       font-family:var(--mono); font-size:.78rem; color:var(--green);
                       letter-spacing:.06em; }
  .principle b { color:var(--ink); font-weight:500; font-family:var(--head); }
  .principle span { display:block; color:var(--ink-2); margin-top:.3rem; }
  .principle span.sep { display:inline; color:var(--muted); margin:0 .15rem; }

  /* The brand commits to one visual world — navy and paper — rather than
     following the viewer's theme. Every ground is painted explicitly. */
  :root {
    --navy:#0B2545; --navy-2:#123256; --paper:#F2F6F8; --ground:#FFFFFF;
    --green:#1B5C46; --rgreen:#4FA98A; --blue:#5B84A9; --rblue:#93B8D4;
    /* --muted was #5B6E80 and failed AA as text: 3.76 on paper, 4.09 on white,
       set at 11.2px for eyebrows. Darkened to 43% lightness at the same hue and
       saturation — 4.84 on paper, 5.27 on white. It is the same gray, deeper. */
    --ink:#0B2545; --ink-2:#3D5570; --muted:#5B6E80; --hair:#DCE4EA;
    /* Poppins is embedded (see FONTS above) and therefore FIRST — the point is
       that every visitor sees the same face. Naming Futura first meant the
       wordmark was geometric only for people who happened to own it, and a
       grotesque everywhere else. The local names stay as a fallback for the
       case where the embedded face fails to decode. When Futura is licensed,
       embed it and put it in front of Poppins. */
    --head:Poppins,Futura,"Century Gothic","Avenir Next",Avenir,"Trebuchet MS",sans-serif;
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
  /* That margin separates a head from the rows or cards beneath it. The advisory
     section has no rows any more, so it was left holding 2.6rem of dead space
     above the next section's own padding, which read as an unfinished section. */
  .head:last-child { margin-bottom:0; }

  /* ---- hero ---- */
  .hero { background:var(--navy); border:0; padding:0; }
  .hero .wrap { padding-top:4rem; padding-bottom:4.5rem;
                display:flex; flex-direction:column; gap:2.4rem; }
  .hero svg { width:100%; max-width:26rem; height:auto; display:block; }
  .hero h1 { color:#FFFFFF; max-width:32ch; }
  /* 54ch, measured rather than chosen. 44ch broke the old subhead after "now",
     stranding it, at every viewport from 1000px up; 56ch and above break the
     current one after "GovTech" or "and". 54ch breaks at the comma, which is
     the same break the social card draws, so the page and the share image read
     identically. Poppins is embedded, so this holds on every machine. Re-probe
     it if the subhead changes — the number is a fact about this string. */
  .hero p { color:var(--rblue); font-size:1.1rem; max-width:54ch; }
  .hero .src { color:var(--rblue); border-bottom-color:rgba(147,184,212,.45);
               align-self:flex-start; margin-top:.4rem; }
  .hero .src:hover { color:#FFFFFF; border-bottom-color:#FFFFFF; }

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
  /* The one outbound link on the page. It exists so a claim can be checked,
     so it is set to read as an invitation rather than as navigation. */
  .src { font-family:var(--head); font-size:.92rem; letter-spacing:.02em;
         text-decoration:none; border-bottom:1px solid rgba(27,92,70,.35);
         padding-bottom:1px; }
  .src:hover { border-bottom-color:var(--green); }

  .steps { display:flex; flex-direction:column; gap:0; }
  .step { display:grid; grid-template-columns:1fr; gap:.3rem;
          padding:1.35rem 0; border-bottom:1px solid var(--hair); }
  @media (min-width:44rem) { .step { grid-template-columns:9rem 1fr; gap:2rem; align-items:baseline; } }
  .step:last-child { border-bottom:0; }
  .step .when { font-family:var(--mono); font-size:.72rem; letter-spacing:.14em;
                text-transform:uppercase; color:var(--green); }

  /* The diagram scrolls inside its own box rather than squashing: below about
     44rem the five stages cannot hold their labels, and a legible thing you
     drag beats an illegible thing that fits. */
  .flow { overflow-x:auto; -webkit-overflow-scrolling:touch; }
  .flow svg { width:100%; min-width:38rem; height:auto; display:block; }
  .note { margin-top:2.4rem; font-size:.95rem; color:var(--muted); max-width:46rem; }

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
  /* --blue is the candidate color for LIGHT grounds; on navy the palette in
     02-identity.md specifies --rblue. Using the light one here measured 3.90,
     below AA; the documented one is 7.36. The palette already had the answer. */
  .band .eyebrow { color:var(--rblue); }
  .band .rule { background:var(--rgreen); }
  .band .step { border-color:var(--navy-2); }
  .band .step .when { color:var(--rgreen); }

  /* ---- footer ---- */
  footer { background:var(--navy); padding:3rem 0 3.5rem; }
  footer .wrap { display:flex; flex-direction:column; gap:1.6rem; }
  footer svg { width:100%; max-width:15rem; height:auto; }
  footer a { color:var(--rblue); }
  /* Lightened from #6C88A4, which measured 4.17 on navy — below AA, and missed
     by every review because it is a one-off hex rather than a token. Same hue
     and saturation at 57% lightness: 4.72, and still quieter than --rblue. */
  .fine { font-size:.82rem; color:#7891AB; }

  a { color:var(--green); }
  :focus-visible { outline:2px solid var(--rgreen); outline-offset:3px; }`;

// ---- the written piece -----------------------------------------------------
//
// One piece, published on its own. Deliberately NOT a "Writing" section with a
// heading that promises a series: a feed that goes quiet reads worse than a
// single essay that stands. When there is a second, this becomes a list.
//
// It carries a BYLINE, and that is the only place a person is named on the
// site. The brand is the body of work; the author of a piece is a person. That
// separation is deliberate and load-bearing: the work outlives any one context
// it was written in — see the note on "Where this comes from".
//
// The cadence and the DAO example live HERE and not on the home page. On the
// page they would be arithmetic a reader tests and a second unit of time
// competing with the advisory paragraph. In a piece they are the substance.
// Split out of the 2,500-word alignment note on 2026-08-25. John: the notes
// need to be short messages, driven by a diagram, and each one should run the
// same shape — a challenge that is not new, and what an agentic model changes
// about it. This is the first of the three that note was carrying.
const NOTE = {
  slug: 'five-user-apis',
  series: 'ownership',
  part: 1,
  next: ['the-last-hop', 'The last hop nobody wrote down',
         'Ownership settles who answers for a component. The next piece is about the work of ' +
         'getting a request to them at all.'],
  title: 'Why do we have five user APIs',
  author: 'John Kelly',
  date: '2026-08-20',
  dateHuman: '20 August 2026',
  standfirst: 'Nobody ever decided to build the same component five times. Projects have goals, ' +
              'and maintaining the platform is not one of them, so the system ends up being ' +
              'whatever the projects left behind.',
  gist: [
    'Deliver the project, or look after the system. The conflict is old, and it has always ' +
      'resolved the same way, because the project has a goal and a date and the system has ' +
      'neither.',
    'Agents do not resolve it by themselves. Every agent team is scoped to a component, so an ' +
      'organization that never settled who owns what has taken the brake off rather than slowed ' +
      'anything down.',
  ],
  body: `
<p>Every organization I have worked in has asked a version of that question, and it is worth
   understanding where it comes from, because it is not incompetence and nobody ever decided it.</p>

<p>We had projects, and a project has a goal. It is funded to deliver that goal, it is measured on
   that goal, and maintaining the platform underneath is not on the list. That is not a criticism of
   projects. It is what a project is for.</p>

<p>So the project defines the system it needs in order to reach its goal, the team stands that
   system up, and when the project ends the team is left owning the whole of what it touched,
   because that is what got defined. Run another one next year, with a different goal and a
   different team, and you have two.</p>

<div class="flow"><svg viewBox="0 0 1000 336" role="img"
     aria-label="Three projects, each building its own slice of the system. Each slice contains a User API, so the same component exists three times. Nobody decided that.">
  <text x="176" y="64" text-anchor="end" fill="#5B6E80" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.2">ONE PROJECT</text>
  <rect x="200" y="30" width="252" height="56" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="326" y="64" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Portal</text>
  <rect x="468" y="30" width="252" height="56" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="594" y="64" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="16" font-weight="500">User API</text>
  <rect x="736" y="30" width="252" height="56" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="862" y="64" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Reporting</text>
  <text x="176" y="150" text-anchor="end" fill="#5B6E80" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.2">ANOTHER, LATER</text>
  <rect x="200" y="116" width="252" height="56" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="326" y="150" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Checkout</text>
  <rect x="468" y="116" width="252" height="56" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="594" y="150" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="16" font-weight="500">User API</text>
  <rect x="736" y="116" width="252" height="56" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="862" y="150" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Events</text>
  <text x="176" y="236" text-anchor="end" fill="#5B6E80" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.2">ANOTHER, LATER STILL</text>
  <rect x="200" y="202" width="252" height="56" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="326" y="236" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Mobile</text>
  <rect x="468" y="202" width="252" height="56" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="594" y="236" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="16" font-weight="500">User API</text>
  <rect x="736" y="202" width="252" height="56" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="862" y="236" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Search</text>
  <path d="M468 274 L468 288 L720 288 L720 274" stroke="#7DBFA3" stroke-width="1.5" fill="none"/>
  <text x="594" y="316" text-anchor="middle" fill="#0B2545" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11.5" letter-spacing="1.2">THE SAME COMPONENT, THREE TIMES. NOBODY DECIDED IT.</text>
</svg></div>

<p>Each of those was a reasonable decision. Every project was right locally. Nothing in the process
   was capable of noticing that the thing being asked for already existed somewhere else, because
   nothing in the process was looking at the whole. That is Conway's law read as a diagnostic rather
   than as advice: the duplicates are the communication structure of the teams, made visible.</p>

<h2>The correction sits above team design</h2>

<p>Systems thinking, enterprise architecture in the old sense of the phrase, is what defines the
   system architecture, and the architecture is what defines the breakdown into teams. The order
   matters: teams downstream of the architecture, not the architecture downstream of whoever shipped
   last.</p>

<p>A cadence still carries the communication across the organization, and it has to hold. But it is
   not what decides this. What the teams inside it are aligned to is.</p>

<h2>What agents change, and it is not what people expect</h2>

<p>This is the part I would not treat as history. Agents do not fix an ownership model and they do
   not break one. They amplify whichever one you already have, so the question is only ever which
   one that is.</p>

<p>And the amplification is not even-handed, which is the part worth sitting with. A team that needs
   a component changed has two ways to get it. Ask the team that owns it, or build its own. Both
   just got cheaper to do. Only the first still ends in front of somebody who can say no, because
   the review standing between a team and its own second copy sits inside the team that wants it,
   run by the people taking the cheaper option today rather than by whoever carries the bill later.</p>

<p>So what was holding the estate's shape was never only the architecture. It was partly how much
   any one project could afford to build for itself, and that is the part agents relax. The
   conditions that produced five user APIs are unchanged. What has changed is how quickly they can
   produce the next five, and nothing in that mechanism prefers a good ownership model to a bad
   one.</p>

<p>Set up the other way, the same property is the fix. A team that owns an asset and expects to
   still be answerable for it next quarter behaves differently from a team assembled around an
   initiative, and an agent team is the most literal version of that there has ever been: it is
   scoped to the component whether anybody writes the ownership down or not. The only question is
   whether the organization chose the scope or inherited it.</p>

<h2>The question worth asking</h2>

<p>One question, asked at the organization level rather than the team level. Does it make sense for
   this system to have more than one of these?</p>

<p>If the answer is yes, there is no issue and nothing should block. Bounded contexts are a
   perfectly good yes, and forcing one canonical model is its own well-documented mistake. If the
   answer is no, the duplicate is not the problem. It is where the problem became visible. What I
   object to is the case where nobody asked.</p>

<p>One thing this does not do, and it matters more than it looks. Getting ownership right contains
   the problem: it stops the sixth user API being created without anybody deciding to. It does not
   remove the five you already have. That is remediation, it is its own funded work, and it will not
   happen inside the project that noticed it, because that project has a goal and this is not it.
   Anybody telling you the alignment fixes what you already built is selling you something.</p>
`,
};

// Second of the three. The mechanism, and the only one of them that needed the
// chain drawn.
const NOTE_HOP = {
  slug: 'the-last-hop',
  series: 'ownership',
  part: 2,
  next: ['shared-skills', 'A shared skill is not a consistency mechanism',
         'Decomposition gets the work to the right teams. It does nothing about several teams ' +
         'inside one layer, which is the last piece.'],
  title: 'The last hop nobody wrote down',
  author: 'John Kelly',
  date: '2026-08-22',
  dateHuman: '22 August 2026',
  standfirst: 'Engineers always did the final decomposition in their heads, and it worked because ' +
              'they knew the system. Agents have no such bridge, which turns documentation from ' +
              'overhead into the input.',
  gist: [
    'The bridge from an outcome to the components that implement it was real work, done reliably, ' +
      'and invisible. It never had to be written down in order to happen.',
    'It does now. Which means the teams that already had the discipline start ahead, and the ones ' +
      'running lean on it are further behind than they think.',
  ],
  body: `
<p>Take an API team, working the old way. They get an epic and break it into user stories. The
   stories usually name an outcome: the API. But the outcome is delivered through changes across
   several components, often across several repositories, and how much of that got written down
   varied by team.</p>

<p>Some broke it down and recorded it. Most, in my experience, minimize documentation wherever they
   are allowed to. Not out of carelessness: the engineers understood the system well enough to
   execute without being told, and writing it down bought them nothing at the time. The bridge from
   the outcome to the components that implement it was real work, done reliably, and invisible.</p>

<p>Agents have no such bridge. Nothing fills the gap between “build the API” and the specific
   changes in the specific components, so the work has to be broken down to the teams that maintain
   those components, explicitly, in a way it never had to be before.</p>

<div class="flow"><svg viewBox="0 0 1000 400" role="img"
     aria-label="An initiative becomes one capability, the capability becomes one component delivery per stack team, and the API delivery alone becomes four specifications: a facade and three domain services. A dashed line marks where decomposition used to stop, above the specification row.">
  <text x="140" y="46" text-anchor="end" fill="#5B6E80" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.4">INITIATIVE</text>
  <rect x="160" y="16" width="840" height="46" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="580" y="45" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">One thing the business asked for</text>
  <path d="M580 62 L580 90" stroke="#93B8D4" stroke-width="1.5"/>

  <text x="140" y="120" text-anchor="end" fill="#5B6E80" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.4">CAPABILITY</text>
  <rect x="160" y="90" width="840" height="54" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="580" y="114" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">What we want for the sales team, or the customer</text>
  <text x="580" y="133" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">the level a product manager can still explain</text>
    <path d="M580 144 C580 162 238 158 238 176" stroke="#93B8D4" stroke-width="1.5" fill="none"/>
  <path d="M580 144 C580 162 408 158 408 176" stroke="#93B8D4" stroke-width="1.5" fill="none"/>
  <path d="M580 144 C580 162 578 158 578 176" stroke="#93B8D4" stroke-width="1.5" fill="none"/>
  <path d="M580 144 C580 162 748 158 748 176" stroke="#93B8D4" stroke-width="1.5" fill="none"/>
  <path d="M580 144 C580 162 918 158 918 176" stroke="#93B8D4" stroke-width="1.5" fill="none"/>

  <text x="140" y="205" text-anchor="end" fill="#5B6E80" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.4">COMPONENT</text>
  <text x="140" y="220" text-anchor="end" fill="#5B6E80" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.4">DELIVERY</text>
    <rect x="160" y="176" width="156" height="54" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="238" y="208" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="15" font-weight="500">UI</text>
  <rect x="330" y="176" width="156" height="54" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="408" y="200" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="15" font-weight="500">API</text>
  <text x="408" y="218" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">the one worked below</text>
  <rect x="500" y="176" width="156" height="54" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="578" y="208" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="15" font-weight="500">Core logic</text>
  <rect x="670" y="176" width="156" height="54" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="748" y="208" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="15" font-weight="500">Analytics</text>
  <rect x="840" y="176" width="156" height="54" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="918" y="208" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="15" font-weight="500">Reporting</text>

  <path d="M160 268 L1000 268" stroke="#B9C6D0" stroke-width="1" stroke-dasharray="4 5"/>
  <rect x="160" y="255" width="196" height="17" fill="#FFFFFF"/>
  <text x="164" y="268" fill="#0B2545" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.2">WHERE IT USED TO STOP</text>
    <path d="M408 230 C408 272 257 262 257 300" stroke="#7DBFA3" stroke-width="1.5" fill="none"/>
  <path d="M408 230 C408 272 472 262 472 300" stroke="#7DBFA3" stroke-width="1.5" fill="none"/>
  <path d="M408 230 C408 272 687 262 687 300" stroke="#7DBFA3" stroke-width="1.5" fill="none"/>
  <path d="M408 230 C408 272 902 262 902 300" stroke="#7DBFA3" stroke-width="1.5" fill="none"/>

  <text x="140" y="335" text-anchor="end" fill="#1B5C46" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.4">SPEC</text>
  <text x="140" y="350" text-anchor="end" fill="#5B6E80" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.4">PER TEAM</text>
    <rect x="160" y="300" width="195" height="58" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="257" y="326" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="15" font-weight="500">Facade layer</text>
  <text x="257" y="344" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">new interface</text>
  <rect x="375" y="300" width="195" height="58" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="472" y="326" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="15" font-weight="500">Domain service</text>
  <text x="472" y="344" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">one</text>
  <rect x="590" y="300" width="195" height="58" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="687" y="326" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="15" font-weight="500">Domain service</text>
  <text x="687" y="344" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">two</text>
  <rect x="805" y="300" width="195" height="58" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="902" y="326" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="15" font-weight="500">Domain service</text>
  <text x="902" y="344" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">three</text>
</svg></div>

<p>Take the API delivery. The new experience needs a facade layer interface, and the facade calls
   three domain services, so one line on the plan is four specifications for four agent teams. How
   many depends on the repositories and the architecture rather than on the requirement: two
   organizations handed the same capability will staff it differently and both can be right.
   Deciding team structure from the shape of the backlog means reading the wrong document.</p>

<p>None of those four can write the others. The facade team cannot specify a domain service it does
   not own, and no domain team can see the whole path. Being wrong about the cut does not surface as
   a bad specification. It surfaces as four teams delivering exactly what they were asked for and a
   capability that does not work.</p>

<h2>What that is worth, and to whom</h2>

<p>The teams that already had the discipline start ahead. Documentation that read as overhead for
   years is now the input. That is an uncomfortable thing to tell a team that has been running lean
   on it, and it is the most concrete advantage I have seen change hands so far.</p>

<p>It also changes what skipping it costs. Generation is cheap now and getting cheaper, so a team
   that is not aligned to the components it maintains still produces the work. It just produces it
   in places nobody is answerable for. That used to be limited by how much a team could write by
   hand, and it is not limited by that any more.</p>
`,
};

// Third of the three, and the one the AI-SDLC team answered by disagreeing with
// the premise, which made it better material than the question was.
const NOTE_SKILL = {
  slug: 'shared-skills',
  series: 'ownership',
  part: 3,
  title: 'A shared skill is not a consistency mechanism',
  author: 'John Kelly',
  date: '2026-08-25',
  dateHuman: '25 August 2026',
  standfirst: 'Standards, review boards and reference implementations all degraded the same way: ' +
              'each team read them differently. A shared skill removes the re-reading. It does not ' +
              'remove the interpretation.',
  gist: [
    'One layer is usually several teams. Four API teams now means four agent teams producing API ' +
      'code, and nothing in the decomposition makes their output agree.',
    'Publishing the convention once is a real advance and it is the distribution half. The half ' +
      'that checks what each team actually produced does not exist yet.',
  ],
  body: `
<p>Aligning teams to components handles a request that spans components. It does nothing about
   several teams inside one of them. Four API teams means four agent teams producing API code, and
   nothing in the decomposition makes their output agree with each other.</p>

<p>Standards, review boards, reference implementations and templates have all been the answer to
   this at different times, and they degrade the same way. Each team reads the document slightly
   differently, and what the teams actually do drifts from what it says.</p>

<p>A shared skill looks like it fixes that, and it half does. Publish the convention once, install
   it everywhere, and the same instruction is executing in every team rather than a document each
   team interprets. That is real, and it removes the step where a human re-reads a standard once per
   team.</p>

<div class="flow"><svg viewBox="0 0 1000 356" role="img"
     aria-label="One published convention is installed by four teams. Every installed file is byte-identical and is checked. What each team then produced is different, and nothing checks that.">
  <rect x="330" y="20" width="452" height="56" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="556" y="53" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">One published convention</text>
  <path d="M556 76 L556 92" stroke="#93B8D4" stroke-width="1.5"/>
  <path d="M556 92 C556 116 222 110 222 134" stroke="#93B8D4" stroke-width="1.5" fill="none"/>
  <rect x="130" y="134" width="184" height="56" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="222" y="158" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="15" font-weight="500">Team A</text>
  <text x="222" y="177" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">installed file, identical</text>
  <path d="M222 190 L222 250" stroke="#B9C6D0" stroke-width="1.5" stroke-dasharray="3 5"/>
  <rect x="130" y="250" width="184" height="56" rx="3" fill="#FFFFFF" stroke="#DCE4EA"/>
  <text x="222" y="274" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="15" font-weight="500">what it produced</text>
  <text x="222" y="293" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">different codebase, different result</text>
  <path d="M556 92 C556 116 440 110 440 134" stroke="#93B8D4" stroke-width="1.5" fill="none"/>
  <rect x="348" y="134" width="184" height="56" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="440" y="158" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="15" font-weight="500">Team B</text>
  <text x="440" y="177" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">installed file, identical</text>
  <path d="M440 190 L440 250" stroke="#B9C6D0" stroke-width="1.5" stroke-dasharray="3 5"/>
  <rect x="348" y="250" width="184" height="56" rx="3" fill="#FFFFFF" stroke="#DCE4EA"/>
  <text x="440" y="274" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="15" font-weight="500">what it produced</text>
  <text x="440" y="293" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">different codebase, different result</text>
  <path d="M556 92 C556 116 658 110 658 134" stroke="#93B8D4" stroke-width="1.5" fill="none"/>
  <rect x="566" y="134" width="184" height="56" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="658" y="158" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="15" font-weight="500">Team C</text>
  <text x="658" y="177" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">installed file, identical</text>
  <path d="M658 190 L658 250" stroke="#B9C6D0" stroke-width="1.5" stroke-dasharray="3 5"/>
  <rect x="566" y="250" width="184" height="56" rx="3" fill="#FFFFFF" stroke="#DCE4EA"/>
  <text x="658" y="274" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="15" font-weight="500">what it produced</text>
  <text x="658" y="293" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">different codebase, different result</text>
  <path d="M556 92 C556 116 876 110 876 134" stroke="#93B8D4" stroke-width="1.5" fill="none"/>
  <rect x="784" y="134" width="184" height="56" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="876" y="158" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="15" font-weight="500">Team D</text>
  <text x="876" y="177" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">installed file, identical</text>
  <path d="M876 190 L876 250" stroke="#B9C6D0" stroke-width="1.5" stroke-dasharray="3 5"/>
  <rect x="784" y="250" width="184" height="56" rx="3" fill="#FFFFFF" stroke="#DCE4EA"/>
  <text x="876" y="274" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="15" font-weight="500">what it produced</text>
  <text x="876" y="293" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="11.5">different codebase, different result</text>
  <text x="112" y="166" text-anchor="end" fill="#1B5C46" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.2">CHECKED</text>
  <text x="112" y="276" text-anchor="end" fill="#0B2545" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.2">NOT</text>
  <text x="112" y="291" text-anchor="end" fill="#0B2545" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.2">CHECKED</text>
  <text x="556" y="340" text-anchor="middle" fill="#0B2545" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11.5" letter-spacing="1.2">THE FILE IS THE SAME. THE WORK IS NOT.</text>
</svg></div>

<p>What it does not do is make the output consistent. The instruction is executed by a model, once
   per team, against a different codebase with a different existing shape, so conforming installs
   can still produce divergent work while every report reads clean, because what is being compared
   is the file rather than what the file produced. <b>A shared capability is the distribution
   mechanism for consistency. It is not the consistency mechanism.</b></p>

<p>Interpretation did not leave the system when the standard became a shared file. It moved
   somewhere less observable. A human who reads a standard differently argues about it in review. A
   model that reads it differently ships work that conforms in appearance.</p>

<p>What would close it is a check on the output rather than on the file, published alongside the
   convention and run by whoever installs it. I have not built that, and I have not seen it built.</p>
`,
};


// Reframed 2026-08-26. It argued misdelivery, a reader acting on the wrong
// document, which is a general software-publishing argument that works without
// agents anywhere in it. John's framing is the one that belongs on this site:
// agent definitions are your engineering practice written down, so coaching
// became an artifact for the first time, and an artifact has to be somewhere.
//
// The turn is the part to protect. Coaching was previously unpublishable not
// because it was secret but because it was not a thing: it lived in a review
// comment and in what somebody said in a design meeting. That is what changed.
const NOTE_BOUNDARY = {
  slug: 'coaching-is-a-file',
  series: 'boundary',
  part: 1,
  title: 'Coaching is a file now',
  author: 'John Kelly',
  date: '2026-08-24',
  dateHuman: '24 August 2026',
  standfirst: 'One public repository used to be fine. With agent teams, the thing that says how ' +
              'your engineers work is an artifact for the first time, and most teams will not want ' +
              'it published alongside the product.',
  gist: [
    'You used to coach engineers in review comments and design meetings. None of it could be ' +
      'published, because none of it was a thing you could publish.',
    'Now it is a directory. So for the first time you have to decide whether it goes out with the ' +
      'product, and I would expect most teams to decide it does not.',
  ],
  body: `
<p>One public repository used to be fine. The product was the code, and publishing the code
   published the product. Whatever else the team knew stayed where it had always been, which was
   nowhere you could point at.</p>

<h2>What agent teams add that was never there before</h2>

<p>An agent team is a set of definitions. Which agent owns what, how each one behaves, what it
   refuses, what it hands back and to whom. Written down, versioned, reviewed. That is not
   documentation about your engineering practice. It <em>is</em> your engineering practice, in the
   only form it has ever existed in outside somebody's head.</p>

<p>Think about what your engineers are actually doing now. They used to be coached, and now they are
   doing the coaching, through configuration. Same job, and a different medium: instead of telling a
   colleague what good looks like on this team, they are writing it down where an agent will act on
   it every time rather than once.</p>

<p>That coaching used to be unpublishable, and not because anybody was hiding it. It was not a
   thing. It lived in a review comment, in what a senior engineer said in a design meeting, in the
   standard everyone on the team knew and nobody had typed. There was no file, so there was no
   question about where the file went.</p>

<p>Now there is a file, and a file has to be somewhere. For the first time you have to decide
   whether how your team works ships alongside what your team built.</p>

<h2>I would keep it private, and I think most teams will</h2>

<p>Not because there is anything embarrassing in it. Because it is the accumulated judgment of your
   team about how work should be done, it is the thing that decides whether the output is any good,
   and it is now copyable in a way it never was when it lived in people. A user installing your
   product needs the product. They do not need the roster, the decisions behind it, or the
   half-finished argument about what an agent should refuse.</p>

<p>So: a private repository where the team and its definitions live, a public one that is what a
   user installs, and a publish step between them.</p>

<h2>Publishing is a filter, not a branch</h2>

<p>The step that makes it hold is that publishing writes a tree rather than a history. Each release
   lands as a single commit carrying the current published set, at the same paths the files occupy
   in private.</p>

<div class="flow"><svg viewBox="0 0 1000 340" role="img"
     aria-label="A private repository holds every version it ever had, including a design record that was added and later deleted, still fetchable from the log. The public repository holds one commit per release, each carrying the whole current tree and nothing before it, so the deleted file was never there at all.">
  <text x="150" y="62" text-anchor="end" fill="#5B6E80" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.2">PRIVATE</text>
  <path d="M180 62 L960 62" stroke="#93B8D4" stroke-width="1.5"/>
  <circle cx="180" cy="62" r="4.5" fill="#93B8D4" stroke="#0B2545" stroke-width="0"/>
  <circle cx="276" cy="62" r="4.5" fill="#93B8D4" stroke="#0B2545" stroke-width="0"/>
  <circle cx="372" cy="62" r="6" fill="#FFFFFF" stroke="#0B2545" stroke-width="1.6"/>
  <path d="M372 70 L372 88" stroke="#B9C6D0" stroke-width="1" stroke-dasharray="3 4"/>
  <text x="372" y="104" text-anchor="middle" fill="#0B2545" font-family="Helvetica,Arial,sans-serif" font-size="12.5">design record added</text>
  <circle cx="468" cy="62" r="4.5" fill="#93B8D4" stroke="#0B2545" stroke-width="0"/>
  <circle cx="564" cy="62" r="6" fill="#FFFFFF" stroke="#0B2545" stroke-width="1.6"/>
  <path d="M564 70 L564 88" stroke="#B9C6D0" stroke-width="1" stroke-dasharray="3 4"/>
  <text x="564" y="104" text-anchor="middle" fill="#0B2545" font-family="Helvetica,Arial,sans-serif" font-size="12.5">and deleted</text>
  <circle cx="660" cy="62" r="4.5" fill="#93B8D4" stroke="#0B2545" stroke-width="0"/>
  <circle cx="756" cy="62" r="4.5" fill="#93B8D4" stroke="#0B2545" stroke-width="0"/>
  <circle cx="852" cy="62" r="4.5" fill="#93B8D4" stroke="#0B2545" stroke-width="0"/>
  <circle cx="948" cy="62" r="4.5" fill="#93B8D4" stroke="#0B2545" stroke-width="0"/>
  <text x="180" y="132" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">every version it ever held, still fetchable from the log</text>
  <text x="150" y="220" text-anchor="end" fill="#1B5C46" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" letter-spacing="1.2">PUBLIC</text>
  <path d="M180 220 L960 220" stroke="#7DBFA3" stroke-width="1.5"/>
  <circle cx="310" cy="220" r="7" fill="#EAF3EE" stroke="#1B5C46" stroke-width="1.6"/>
  <path d="M310 228 L310 246" stroke="#A8D5C0" stroke-width="1"/>
  <text x="310" y="262" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14" font-weight="500">One commit</text>
  <text x="310" y="280" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12">the whole current tree</text>
  <circle cx="570" cy="220" r="7" fill="#EAF3EE" stroke="#1B5C46" stroke-width="1.6"/>
  <path d="M570 228 L570 246" stroke="#A8D5C0" stroke-width="1"/>
  <text x="570" y="262" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14" font-weight="500">One commit</text>
  <text x="570" y="280" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12">the whole current tree</text>
  <circle cx="830" cy="220" r="7" fill="#EAF3EE" stroke="#1B5C46" stroke-width="1.6"/>
  <path d="M830 228 L830 246" stroke="#A8D5C0" stroke-width="1"/>
  <text x="830" y="262" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14" font-weight="500">One commit</text>
  <text x="830" y="280" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12">the whole current tree</text>
  <text x="180" y="192" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">one per release, and nothing before it</text>
  <text x="570" y="322" text-anchor="middle" fill="#0B2545" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11.5" letter-spacing="1.2">DELETED IN PRIVATE. NEVER HELD IN PUBLIC.</text>
</svg></div>

<p>Which answers a problem most people meet the hard way, by never creating it. A repository keeps
   every blob it has ever held, so deleting a file at the head does not remove the version you
   deleted. Publishing a tree means the public repository never held it. Not "no longer holds".
   Never held. That also rules out the arrangement that looks safest and is not, a private branch
   and a public branch in one repository: branches share a single object store, so a blob committed
   on either is fetchable from the whole thing.</p>

<p>The corollary is that nobody works in the public repository. Its history is a publish log, and a
   hand edit there is a change no gate reviewed that the next publish will silently revert.</p>
`,
  next: ['the-direction-people-forget', 'The direction people forget',
         'Publishing is the easy direction. What comes back the other way is the harder problem, ' +
         'and it is the one most designs leave open.'],
};

// Second of the two. The traffic, and the asymmetry that is the whole point.
const NOTE_CROSSING = {
  slug: 'the-direction-people-forget',
  series: 'boundary',
  part: 2,
  title: 'The direction people forget',
  author: 'John Kelly',
  date: '2026-08-26',
  dateHuman: '26 August 2026',
  standfirst: 'The front door is public and the work is private, so reports have to cross inward. ' +
              'Everyone guards the outbound direction. The inbound one carries text an agent will ' +
              'read as instructions.',
  gist: [
    'A report arrives where somebody found the problem. The team that can fix it works somewhere ' +
      'else, and the fix has to arrive back as a release.',
    'Every arrow across that boundary crosses a trust domain, and the two directions are not ' +
      'symmetric. A design that guards only one has guarded the easy one.',
  ],
  body: `
<p>Publishing is the easy direction. The harder problem is that the front door is public and the
   work is private.</p>

<p>Someone who installed a plugin reports a defect where they found it, on the public repository.
   That is correct, and they should not have to know anything about how the thing is maintained. But
   the team that can fix it works in the private repository, often against real data, and the fix has
   to arrive back on the public side as a release.</p>

<div class="flow"><svg viewBox="0 0 1000 396" role="img"
     aria-label="Two repositories. The private one holds the agent team, the decisions and the work in flight. The public one holds only what a user installs. Publishing sends one commit outward carrying the current tree. Mirroring sends reports inward only. Acknowledging a reporter is a separate outward step.">
  <rect x="40" y="16" width="392" height="168" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="64" y="48" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Private</text>
  <text x="132" y="48" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">where the team works</text>
  <text x="64" y="80" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="13">The agent team and its roster</text>
  <text x="64" y="106" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="13">Architecture decisions</text>
  <text x="64" y="132" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="13">Work in flight</text>
  <text x="64" y="158" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="13">The source it all comes from</text>
  <rect x="568" y="16" width="392" height="168" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="592" y="48" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Public</text>
  <text x="654" y="48" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">what leaves the building</text>
  <text x="592" y="80" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="13">What a user installs</text>
  <text x="592" y="106" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="13">Its documentation</text>
  <text x="592" y="132" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="13">A version history</text>
  <text x="592" y="158" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="13">and nothing else</text>
  <path d="M64 232 L930 232" stroke="#7DBFA3" stroke-width="1.5" fill="none"/>
  <path d="M922 227 L932 232 L922 237 Z" fill="#7DBFA3"/>
  <rect x="60" y="202" width="564" height="22" fill="#FFFFFF"/>
  <text x="64" y="210" text-anchor="start" fill="#1B5C46" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="10.5" letter-spacing="1.2">PUBLISH</text>
  <text x="64" y="226" text-anchor="start" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">One commit carrying the current tree. Never a history, so no old blob exists to leak.</text>
  <path d="M70 300 L936 300" stroke="#93B8D4" stroke-width="1.5" fill="none"/>
  <path d="M78 295 L68 300 L78 305 Z" fill="#93B8D4"/>
  <rect x="376" y="270" width="564" height="22" fill="#FFFFFF"/>
  <text x="936" y="278" text-anchor="end" fill="#0B2545" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="10.5" letter-spacing="1.2">MIRROR</text>
  <text x="936" y="294" text-anchor="end" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">Reads public, writes private, one direction. Nothing in it can push private content out.</text>
  <path d="M64 368 L930 368" stroke="#7DBFA3" stroke-width="1.5" fill="none"/>
  <path d="M922 363 L932 368 L922 373 Z" fill="#7DBFA3"/>
  <rect x="60" y="338" width="564" height="22" fill="#FFFFFF"/>
  <text x="64" y="346" text-anchor="start" fill="#1B5C46" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="10.5" letter-spacing="1.2">ACKNOWLEDGE</text>
  <text x="64" y="362" text-anchor="start" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">A separate, deliberate step. Posting outward is never a side effect of reading in.</text>
</svg></div>

<h2>What the inward path has to guarantee</h2>

<p>So reports are mirrored across: read public, write private, one direction, with nothing in that
   path able to push private content outward. That constraint is what makes it safe to run
   unattended. Acknowledging the reporter on the public thread is a separate, deliberate step,
   because posting outward is a different act from reading inward and should never be a side effect
   of a mirror.</p>

<p>Filing runs the same way from the inside. A request against the team that owns a capability is an
   issue on that team's repository, which is the private one, and the tool that files it refuses
   outright when the target is public. A public issue is permanent, the scan that would catch a leak
   is a pattern match, and a pattern match cannot see an employer's name inside a URL slug. It also
   never files partially: either an issue URL comes back or a refusal does, with a non-zero exit. A
   printed report is not a filed report.</p>

<h2>Inbound is the one that carries instructions</h2>

<p>Every arrow crossing that boundary crosses a trust domain, and the two directions are not
   symmetric. Outbound risks publishing something that should not have left, and everybody can
   picture that failure. Inbound risks importing text that an agent will read as instructions.</p>

<p>A mirrored issue body is written by anyone with an account, and it lands in a repository where
   agents read issues and act on them. So it is carried across fenced and labeled as
   reporter-supplied data. An agent acting on <em>please run X</em> found inside an issue body is
   executing a stranger's instructions. A design that guards only one direction has guarded the easy
   one, and outbound is the easy one, because it is the one everybody already imagines.</p>
`,
};

const NOTE_CADENCE = {
  slug: 'prompting-to-specifying',
  title: 'From prompting to specifying',
  author: 'John Kelly',
  date: '2026-08-26',
  dateHuman: '26 August 2026',
  standfirst: 'The shift is not that engineers write less code. It is that when the output is ' +
              'wrong, the thing you edit stops being the prompt and becomes the spec or the agent ' +
              'definition.',
  gist: [
    'A prompt is a conversation you have once. A spec and an agent definition are files you ' +
      'change, version and re-run, so the fix applies next time and to everybody.',
    'Which creates a problem the old way never had. You cannot tell from a single run whether the ' +
      'change did what you wanted, so teams need several branches going at once.',
  ],
  body: `
<p>The first way anybody works with an agent is by prompting it. You ask, it answers, the answer is
   not quite right, so you ask again with more detail. It works, and it is the right place to start.
   What it does not do is accumulate. The understanding you built up getting to a good answer lives
   in that session and goes when the session does, and the next person starts where you started.</p>

<div class="flow"><svg viewBox="0 0 1000 348" role="img"
     aria-label="Two loops side by side. Prompting: you ask, it answers, it is not right so you ask again, and nothing persists. Specifying: the spec and the agent definition produce the work, it is not right so you change a file, and everyone gets it on the next run.">
  <text x="40" y="26" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Prompting</text>
  <text x="40" y="46" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">the fix lives in the session and dies with it</text>
  <rect x="40" y="70" width="384" height="46" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="232" y="98" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">You ask</text>
  <path d="M232 116 L232 136" stroke="#93B8D4" stroke-width="1.5"/>
  <rect x="40" y="136" width="384" height="46" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="232" y="164" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">It answers</text>
  <path d="M232 182 L232 202" stroke="#93B8D4" stroke-width="1.5"/>
  <rect x="40" y="202" width="384" height="46" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="232" y="230" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">Not right, so you ask again</text>
  <text x="576" y="26" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Specifying</text>
  <text x="576" y="46" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">the fix is a file, and it applies next time</text>
  <rect x="576" y="70" width="384" height="46" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="768" y="98" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">The spec and the agent definition</text>
  <path d="M768 116 L768 136" stroke="#7DBFA3" stroke-width="1.5"/>
  <rect x="576" y="136" width="384" height="46" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="768" y="164" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">They produce the work</text>
  <path d="M768 182 L768 202" stroke="#7DBFA3" stroke-width="1.5"/>
  <rect x="576" y="202" width="384" height="46" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="768" y="230" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">Not right, so you change a file</text>
  <path d="M232 264 L232 300 L22 300 L22 84" stroke="#93B8D4" stroke-width="1.5" fill="none" stroke-dasharray="3 5"/>
  <path d="M768 264 L768 300 L978 300 L978 84" stroke="#7DBFA3" stroke-width="1.5" fill="none"/>
  <path d="M973 92 L978 80 L983 92 Z" fill="#7DBFA3"/>
  <path d="M17 92 L22 80 L27 92 Z" fill="#93B8D4"/>
  <text x="232" y="330" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">nothing persists</text>
  <text x="768" y="330" text-anchor="middle" fill="#1B5C46" font-family="Helvetica,Arial,sans-serif" font-size="12.5">and everyone gets it next run</text>
</svg></div>

<p>The shift is that when the output is wrong you stop reaching for a better prompt and start
   changing one of two things: the specification the work was written against, or the definition of
   the agent that did the work. Both are files. Both are versioned and reviewed like anything else.
   Both apply on the next run, to everyone, without anybody having to be told.</p>

<p>That is a different skill from prompting, and it is closer to something engineers already know. A
   bad output is a defect, and a defect has a cause that lives somewhere you can edit. The question
   stops being <em>how do I ask for this better</em> and becomes <em>which file was wrong, the one
   describing what I wanted or the one describing who does it</em>.</p>

<h2>The problem this creates</h2>

<p>Prompting answers immediately. Changing a spec or an agent definition does not, because what you
   are moving is how it behaves rather than what it said once, and one run tells you little. You want
   the old version and the new one on the same work at the same time.</p>

<p>How you run them depends on what you changed, and it is a fork rather than a ladder. I had it as
   a ladder until somebody corrected me.</p>

<p>Change a <b>spec</b> and two working directories of one clone is right: one repository, two
   directories, already comparing against a shared base.</p>

<p>Change an <b>agent definition</b> and that shape tells you nothing. Two working directories are
   one machine, so everything at the machine level, your environment, your tools, your authenticated
   connections, is shared between the arms and cannot be varied. A change whose effect depends on any
   of it reads as <em>no effect</em>. You need two environments, two machines or two workspaces in a
   remote one, so that tier becomes something you can move. The bill is that a shared constant is now
   a per-arm variable somebody has to equalize on purpose.</p>

<h2>Two things to do before you believe the result</h2>

<p><b>Freeze the task before you write the change.</b> A task picked afterwards is one the change
   happens to help, and nothing in either run will show you that.</p>

<p><b>Run an identical pair first.</b> Same task, same procedure, no change between the arms. If two
   identical arms differ about as much as two different arms did, the method has no resolution on
   that task and any verdict from it is noise. <em>Cannot tell</em> has to be an answer you are
   willing to record, or you will only ever get the answer you went looking for.</p>

<p>Two smaller ones, and neither is a control. Run the arms close together and note when each ran,
   because the model can move underneath a stable name between them, and that is the one difference
   nobody can find afterwards. Read the results without knowing which is which, if you can. The
   timing note bounds how much drift could explain rather than removing it, and where one person
   writes the change and reads the results, which is most of the time, reading blind is not available
   at all.</p>

<h2>The question to keep asking</h2>

<p>Is it producing the outcome you wanted? Not is the code good, and not was the run green. Whether
   the change you made to the spec or to the agent definition moved the work in the direction you
   intended, and whether it will keep doing that when somebody else runs it.</p>

<p>None of that is a way of knowing it did. It is a way of finding out, and the difference matters:
   it ranks two arms and measures neither, it is one run each at unknown resolution, and it is
   manual, so it cannot run on every change. I have not seen a verdict produced this way, mine or
   anybody's. What it does prevent is changing a file, liking the next answer, and calling that
   evidence.</p>

<p>Teams that get here need time for it and most are not given it. Refining an agent team produces
   nothing shippable that week, so it is the first thing traded away when delivery is late. It is
   also the thing that decides what every following week produces.</p>
`,
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Crinaro.AI · AI from higher ground</title>
<!-- No person named here, on purpose — see the note on the "Where this comes
     from" section. "Installed in your own environment" stays dropped: it was a
     deployment claim, sitting in the tag that shows in a search result. -->
<meta name="description" content="${SUB}">
<meta property="og:title" content="Crinaro.AI">
<meta property="og:description" content="${CLAIM} ${SUB}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://crinaro.ai/">
<meta property="og:image" content="https://crinaro.ai/icons/crinaro-og-1200x630.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Crinaro.AI · AI from higher ground">
<meta name="twitter:card" content="summary_large_image">
<!-- The SVG favicon is first and wins wherever it is supported: it stays sharp
     at any size and costs no request. The PNGs are there for Safari and for
     the clients that still ignore SVG icons. -->
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg('crinaro-ai-mark-small.svg'))}">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/crinaro-favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/crinaro-favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/crinaro-icon-180.png">
<style>
${CSS}
</style>
</head>
<body>

<header class="hero">
  <div class="wrap">
    ${svg('crinaro-ai-animated.svg')}
    <h1>${CLAIM_HTML}</h1>
    <p>${SUB}</p>
    <a class="src" href="/notes/">Read the notes <span aria-hidden="true">&rarr;</span></a>
  </div>
</header>

<main>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">The problem</p>
      <h2>Everyone is building the same things, separately.</h2>
      <p>The hard part was never the model. It is that when a request arrives, often nobody is
         clearly answerable for the things it touches, and nothing can be pointed at that settles
         what those things do. Both were survivable while a person could walk over and ask.
         Neither is now:
         <a class="src" href="/notes/${NOTE.slug}/">why do we have five user APIs</a>.</p>
    </div>
    <div class="cols">
      ${problems.map(([h, b]) => `<div class="col"><div class="rule"></div>
        <h3>${h}</h3><p>${b}</p></div>`).join('\n      ')}
    </div>
    <!-- A diagnosis stated from outside the work is the thing a reader discounts,
         so this says where it comes from. It cites only what a reader can already
         see on this page. An earlier version also claimed a continuing read of
         tools and vendors that "is not published", which is a credential whose
         only stated property is that you cannot examine it, and it implied
         adoption besides. That read belongs in the AI-SDLC section, which already
         carries it and bounds it. -->
    <p class="note">None of this is argued from the outside. It comes from delivery in those
       industries, and from agent teams maintaining repositories that have to keep working today.
       It is reasoning about how the failure happens rather than a result anybody has measured.</p>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">The method</p>
      <h2>The whole view decides the design.</h2>
      <p>Crinaro is a ridge line, from the Italian <i>crinale</i>: the crest path where you can
         see down both sides. That is the method. Stand where the whole system is visible, then
         design end to end, rather than improving one step and moving the cost somewhere else.</p>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">What follows from it</p>
      <h2>Five principles for designing agent teams.</h2>
      <p>These are the whole argument. The first four are worked out at length below, and each
         links to where. The fifth is the one nothing here has measured yet, and it is written
         down because it is the target, not because it is evidence.</p>
    </div>
    <div class="principles">
      <p class="principle"><b>Optimize for the platform, not the project.</b>
        <span>An agent configuration scoped to one request will hit that request's goal. What it
        costs after that is paid by everyone, on every run, and only a deliberate act removes it.
        <a class="src" href="/notes/${NOTE.slug}/">${NOTE.title}</a></span></p>
      <p class="principle"><b>Assign ownership at the component level.</b>
        <span>Agent teams aligned to components support the velocity an organization needs and drive
        its costs down. Teams aligned to projects do the opposite.
        <a class="src" href="/notes/${NOTE_HOP.slug}/">${NOTE_HOP.title}</a>
        <span class="sep" aria-hidden="true">·</span>
        <a class="src" href="/notes/${NOTE.slug}/">${NOTE.title}</a></span></p>
      <p class="principle"><b>Treat duplication as the primary cost driver.</b>
        <span>Getting ownership right contains it. Removing what already exists is remediation work,
        and it does not happen inside the project that noticed it.
        <a class="src" href="/notes/${NOTE.slug}/">${NOTE.title}</a></span></p>
      <p class="principle"><b>Assume agents amplify whatever ownership model you already have.</b>
        <span>Both paths get cheaper: asking the team that owns a component to change it, and
        building your own second copy. Only the first still ends in front of somebody who can say
        no. What held the estate's shape was partly how much any one project could afford to build
        for itself, and that is the part agents relax.
        <a class="src" href="/notes/${NOTE.slug}/">${NOTE.title}</a></span></p>
      <p class="principle"><b>Define success as flat or declining maintenance cost as scale
        increases.</b>
        <span>Not project completion. That is the number this is all aimed at, and the one nobody
        here has measured yet.</span></p>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">How the work gets done</p>
      <h2>A factory that maintains, not just builds.</h2>
      <p>A user story used to name an outcome, <em>the API</em>, and the engineers filled in the
         rest. The work landed across several components, in several repositories, and nobody wrote
         that part down because nobody needed to. Agents have no such shortcut, so the work has to
         be broken down to the teams that maintain each component. That is why a component has a
         team at all.</p>
      <p>Generating something with AI is the easy half now. The half that decides whether it is
         still alive in six months is the one nobody automates: keeping the documents true, the
         gates green, the releases loading, and the claims about the system honest. That is what
         these agents do. None of them writes features.</p>
    </div>
    <div class="verts">
      ${factory.map(([n, d]) => `<div class="vert"><b>${n}</b><span>${d}</span></div>`).join('\n      ')}
    </div>
    <p class="note">Those six are agent definitions in the private repository that maintains the
       marketplace, so you cannot read them. What they maintain is public: a plugin carrying nine
       installable agents, a connector, their documentation, and a version history you can walk
       back. That is one repository run this way, not an organization.</p>
    <!-- The only route to the written pieces. Still no "Writing" heading: two
         pieces do not make a series, and a section header promises one. When
         there is a third, this becomes a list on its own page. -->
    <p class="note" id="notes">Most of this is argued at length in the notes, and the first three
       are one argument: why an organization ends up with several systems doing the same thing, the
       decomposition that used to live in an engineer's head, and why publishing a convention once
       does not make the output agree. Start at
       <a class="src" href="/notes/${NOTE.slug}/">${NOTE.title}</a>, or take
       <a class="src" href="/notes/">all of them</a>.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">What it maintains</p>
      <h2>Three assets, kept alive.</h2>
      <p>Not projects that shipped and stopped. Each is still under maintenance by an agent team.
         The last is public and installable, so you can check it for yourself.</p>
    </div>
    <div class="cols">
      ${assets.map(([n, role, b, href, cta]) => `<div class="col"><div class="rule"></div>
        <p class="eyebrow">${role}</p><h3>${n}</h3><p>${b}</p>${href ? `
        <p><a class="src" href="${href}">${cta} <span aria-hidden="true">&rarr;</span></a></p>` : ''}</div>`).join('\n      ')}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">Inside AI-SDLC</p>
      <h2>One capability, across every team it touches.</h2>
      <p>Most AI-SDLC advice stops at one team’s repository. This spans the whole path: the spec a
         roadmap team writes, the work it becomes across other people’s repos, and whether what
         shipped is what was asked for.</p>
    </div>
    <div class="flow">${flow}</div>
    <div class="cols" style="margin-top:3.2rem">
      ${method.map(([h, b]) => `<div class="col"><div class="rule"></div>
        <h3>${h}</h3><p>${b}</p></div>`).join('\n      ')}
    </div>
    <p class="note">Kept current as the ground moves. The tools, the vendors and the limits all
       change, and a reference that is not re-sourced is worse than none. It is not published, so
       the diagram above shows how far the work reaches, not the decisions inside it.</p>
  </div>
</section>


<section class="band">
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">What it is aimed at</p>
      <h2>Three outcomes, none of them measured.</h2>
      <p>The model is aimed at three things: maintenance costing less, delivery moving faster, and
         investment shifting from keeping what exists running to building what does not exist yet.
         Those are the aims. Every claim in the material is a claim about mechanism rather than
         about outcome. It argues how those would be reached rather than reporting having reached
         them, and no outcome has been measured.</p>
      <p>Saying that is the point rather than a hedge. A description of a method is exactly the
         thing a reader supplies a payoff to, and staying quiet about the payoff is a different
         position from stating it and declining to claim it.</p>
      <p>The first attempt to measure one is on the record, and it did not work. In the material's
         own words: <em>“It did not work as expected. The sequence is not falsified, but it is not
         yet demonstrated either.”</em> Read the mechanism on its merits, and treat the outcomes as
         open rather than as likely.</p>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">On advisory work</p>
      <h2>Advice that leaves something behind.</h2>
      <p>The advice that gets used leaves something running behind it: a shared pattern, a
         working evaluation, a place to publish where another team will find it. The test is
         whether a team still has the thing a year later, and whether “do not build this” was
         ever an available answer.</p>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <!-- The brand is NOT tied to a named person, deliberately. Crinaro is the
           body of work; the author of a piece appears as a byline on that piece.
           A site that reads "Crinaro is <name>" makes the body of work into a
           person instead. The attribution is indirect and sufficient: the
           contact address reaches the author. Tried and reverted 2026-08-20,
           the same day it was added. -->
      <p class="eyebrow">Where this comes from</p>
      <h2>Patterns learned in hard places.</h2>
      <p>The components are not industry-specific. The experience behind them is: regulated,
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
      <!-- This used to read "Find the thing worth building once, and building well" over "Bring the
           problem your teams keep solving separately" — a request for an engagement, at the last
           thing anyone reads. That was right for a page selling services and wrong for a body of
           work, which has to hold whether or not the reader ever becomes a client. The page
           declares no availability. An argument to disagree with is the invitation. -->
      <p class="eyebrow">If any of this is useful</p>
      <h2>Say where it breaks.</h2>
      <p>These are patterns, not prescriptions, and the interesting mail is the mail that says a
         piece of it does not hold: in your architecture, at your size, with the constraints you
         actually have. That is a conversation worth having whether or not anything follows it.</p>
      <p>Today I read it myself, and I do not expect enough of it that I will not. If that changes,
         the answer will be the one this whole page argues for: an agent team to help with the
         replying, maintained the way the rest of this is, with the questions and the disagreement
         going back to the team that keeps the material. Which is a fair test of whether any of it
         works.</p>
      <p style="margin-top:.8rem">
        <a class="src" href="mailto:${EMAIL}?subject=Crinaro">${EMAIL}</a>
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

writePage(path.join(DIST, 'index.html'), html);

// 2026-09-02. The first argument on this site that is specific to agents rather
// than a rerun of the feature-team debate, and it came from John: a team scoped
// to the whole stack can only be prompted, and a prompt is not repeatable.
// Stated as REPEATABILITY, not as context size — "the window is too small" dates
// the moment windows grow, and the claim does not depend on any model's limits.
const NOTE_SCOPE = {
  slug: 'same-request-same-answer',
  title: 'Same request, same answer',
  author: 'John Kelly',
  date: '2026-09-02',
  dateHuman: '2 September 2026',
  standfirst: 'How you scope a team used to be a question about coordination cost. It now decides ' +
              'whether you can hand that team a specification at all, and a team you can only ' +
              'prompt does not give you the same answer twice.',
  gist: [
    'A team scoped to everything it touches can only be prompted, because no specification can be ' +
      'written that does not span the whole system. A team scoped to something it owns can be ' +
      'handed a spec.',
    'That is not a matter of taste. A prompt is a conversation and gives a different answer each ' +
      'time it is run. Systems a business depends on need the same request to produce the same ' +
      'answer.',
  ],
  body: `
<p>For twenty years the argument about how to shape delivery teams was an argument about
   coordination. Split people by feature and one team carries a change from end to end, paying for
   it in breadth. Split them by component and each team goes deep, paying for it in handoffs. Both
   sides had evidence, and both were arguing about the same thing: what it costs for one group of
   people to get something from another group of people.</p>

<p>That argument assumed a person on each end. The receiving team could be told roughly what was
   wanted and work the rest out, because working the rest out is what people do. It is why the
   handoff was expensive, and it is also why it was survivable.</p>

<h3>What an agent team can be given</h3>

<p>An agent team is scoped to what it can be pointed at, and the question is whether that scope has
   an edge. A team whose remit is everything a request might touch has nothing to write a
   specification against. Not because breaking the request into parts is impossible: people do it
   every day. Because there is no reason to. A team that owns the whole surface can always absorb
   the work, so the decomposition happens only when a boundary makes it happen. What gets handed
   over instead is a description of intent, refined by asking again.</p>

<p>This is not an argument about vertical against horizontal. A team aligned to a stream of work,
   owning one bounded context end to end, has an edge and passes the same test. The failing case is
   not a slice through the stack. It is a remit with no boundary anywhere in it.</p>

<p>A team scoped to something it owns has a request with an edge. It can be written down, against a
   contract, and handed over.</p>

<div class="flow"><svg viewBox="0 0 1000 300" role="img"
     aria-label="Two columns. A team scoped without a boundary takes in everything a request might touch, has nothing to specify against, and its output varies with nothing to test it. A team scoped to something it owns works against one contract, can be given a specification, and its output varies inside something testable.">
  <text x="40" y="26" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Scoped without a boundary</text>
  <text x="40" y="46" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">the request has no edge</text>
  <rect x="40" y="70" width="384" height="46" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="232" y="98" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">Everything a request might touch</text>
  <path d="M232 116 L232 136" stroke="#93B8D4" stroke-width="1.5"/>
  <rect x="40" y="136" width="384" height="46" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="232" y="164" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">Nothing to specify against</text>
  <path d="M232 182 L232 202" stroke="#93B8D4" stroke-width="1.5"/>
  <rect x="40" y="202" width="384" height="46" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
  <text x="232" y="230" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">Variation with nothing to test it</text>
  <text x="576" y="26" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="16" font-weight="500">Scoped to something it owns</text>
  <text x="576" y="46" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">the request has an edge</text>
  <rect x="576" y="70" width="384" height="46" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="768" y="98" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">One contract it is answerable for</text>
  <path d="M768 116 L768 136" stroke="#7DBFA3" stroke-width="1.5"/>
  <rect x="576" y="136" width="384" height="46" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="768" y="164" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">You can write it a specification</text>
  <path d="M768 182 L768 202" stroke="#7DBFA3" stroke-width="1.5"/>
  <rect x="576" y="202" width="384" height="46" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="768" y="230" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">Variation inside something testable</text>
  <text x="500" y="284" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">The difference is not speed. It is whether there is anything to check the second run against.</text>
</svg></div>

<h3>Why that is not a preference</h3>

<p>Prompting is the right way to explore, and it is where everybody starts. What it does not give
   you is a result you can check. Ask a second time and you get a second answer, usually reasonable,
   often different, and nothing in the exchange tells you which one to keep.</p>

<p>Runs vary for reasons that have nothing to do with scope. The model moves under a stable name,
   sampling is not deterministic, and the same request can be served differently depending on what
   else the machine is doing. Drawing a boundary does not fix any of that, and a note on this site
   already says so: the method in <a href="/notes/prompting-to-specifying/">the piece on
   specifying</a> starts by running two identical arms, which is only worth doing because two
   identical arms differ.</p>

<p>So the claim here is not that a specification produces the same output twice. It does not. The
   claim is narrower and more useful: a bounded request constrains the space an answer can land in,
   and a constrained space is what makes a test mean something. A contract can be replayed against
   whatever came back. Intent cannot.</p>

<p>It is not fine in a system a business runs on. Enterprise systems earn their keep by being
   predictable: the same input produces the same behavior, a release does what the last release
   did except where it was meant to change, and a customer relying on it can plan around it. That
   is what quality means at that scale, and it is built out of repeatability rather than out of any
   single good answer.</p>

<p>So the question of how you scope a team stopped being an organizational preference and became a
   question about whether your delivery is repeatable. Not how fast the team is. Whether running the
   same request twice gives you the same system.</p>

<h3>The objection, and why it does not hold</h3>

<p>The obvious answer is that a party who does not own something cannot write a good specification
   for it: it will miss the invariants, the failure modes and the couplings that only the owner
   knows, so the work satisfies the request and does not work. If that were disqualifying,
   contract-first development would never work, and it does.</p>

<p>But it works for a reason worth being precise about, because the reason is the answer to the
   objection. A contract is agreed by both parties and then verified against the real thing, every
   build. The requester writes what it needs; the owner says whether that is what the component
   does; the test replays it. Nobody in that practice believes a specification thrown over a wall
   is sufficient, and nothing here should be read as proposing one. A contract never fully
   describes behavior either. Somebody always ends up depending on something it did not promise,
   which is an argument for the owner being in the loop rather than against writing it down.</p>

<p>In my experience the specification is usually wrong upstream of the team receiving it, because
   the analysis was not done. That was true before agents. What has changed is the cost of being
   wrong: the turnaround is hours, so a specification that missed something gets corrected and
   re-run rather than absorbed into a release nobody wants to reopen. The argument for keeping the
   work inside one team was that going outside it was slow. That is the part that moved, and it is
   worth saying that it moved for the writing rather than for the agreeing. Getting another team to
   care is the same problem it always was.</p>

<p>And the specification is not overhead you pay for the privilege of splitting the work. The team
   receiving it has to update what its component says about itself, and the specification is what
   that update is written from. A request that never got written down leaves nothing behind for the
   next one to read.</p>

<h3>What to call the unit, which matters more than it sounds</h3>

<p>Component, service, module, capability: organizations fill these words in differently, which is
   most of why arguments between delivery frameworks talk past each other. Two people can agree
   completely about features and disagree entirely about what a feature is.</p>

<p>So the unit here is defined by a test rather than by a word. It is whatever satisfies two
   conditions at once: one team can own what it says about itself, and a specification can be
   written against it without describing anything else. If those hold, the name does not matter. If
   they do not hold, no name will fix it.</p>

<p><b>What is not known.</b> That a bounded request produces output which varies less, or varies
   more usefully, than an unbounded one is stated here as a mechanism and not as a measurement.
   Nothing here has run the comparison. It is a real experiment: the same request given to a
   broadly scoped team and to a narrowly scoped one, several times each, with the runs compared to
   each other rather than to a target. Until somebody does that, the honest version of this note is
   that the bounded request is the one you can write a test for, which is a claim about what is
   checkable rather than about what varies.</p>
`,
  next: ['prompting-to-specifying', 'From prompting to specifying',
         'What changes for an engineer once the spec, not the prompt, is the thing being edited.'],
};

// 2026-09-02. The knowledge tier. The home page's second problem card, "No
// answer anyone can trust", promises this argument and had nothing behind it.
// Everything specific here came from John on 2026-09-02: the two kinds of
// content in the central store, the polling job that makes the view derived
// rather than authored, bounded staleness as a stated cost, and the inversion
// where a component that documents nothing reads as blank. Do not soften the
// consolidation warning; a central team owning all the knowledge is the middle
// layer this removes.
const NOTE_ANSWER = {
  slug: 'who-owns-the-answer',
  title: 'Who owns the answer',
  author: 'John Kelly',
  date: '2026-09-02',
  dateHuman: '2 September 2026',
  standfirst: 'Duplicate services and duplicate facts both fail quietly. The difference is that ' +
              'you can count the services. Nothing anywhere enumerates the facts, so the first ' +
              'person to find out is usually a customer.',
  gist: [
    'Every team that cannot get an answer keeps a copy of its own. That is a fork, the same as a ' +
      'forked component, except that nothing anywhere reports the divergence.',
    'A person handles two conflicting answers by knowing who to trust. An agent has no such ' +
      'prior, so it does not hesitate. Which makes this an ownership question before it is a ' +
      'tooling one.',
  ],
  body: `
<p>Two teams end up with two implementations of the same thing. Neither of them breaks. They run
   side by side and drift, and one day a customer is locked out of one channel and not the other, or
   two totals disagree. Nothing pages anybody for that, which is the subject of
   <a href="/notes/five-user-apis/">another note</a>. But the duplicates can at least be counted.
   Each has a repository, a deployment, a bill and a name, so an organization that decides to go
   looking will find them.</p>

<p>Now the same thing in the record. Support keeps its own description of how a feature behaves,
   because asking took a week and the release could not wait. Engineering changes the feature.
   Nothing reports that the two have drifted apart, and this time there is nothing to count either.
   No repository, no bill, no name. You cannot build the list. Nobody finds out until a customer is
   told something engineering stopped believing months ago.</p>

<h3>Why a person survives this and an agent does not</h3>

<p>People carry an unwritten prior. Trust the team that owns a thing over the team that consumes
   it. Trust the recent page over the old one. Trust the person who actually wrote it. None of that
   is written down anywhere, and it is the thing that makes a scattered record workable.</p>

<p>An agent has none of it unless somebody encodes it. Handed two answers that disagree, it has no
   tie-breaker, so it will be wrong and it will not hesitate. It also pays that cost on every
   request rather than once, because every breakdown of a request pulls from whatever it can reach
   and reconciles them again.</p>

<h3>Two tiers, and the second one is not authoritative</h3>

<div class="flow"><svg viewBox="0 0 1000 352" role="img"
     aria-label="A routing layer holds two kinds of thing side by side: decisions that span the parts, owned there, and a current-state view of everything below, a mirror that is authoritative nowhere. Underneath, the parts of the estate each own what they say about themselves, and a job polls them for what changed and feeds the mirror.">
  <text x="40" y="24" fill="#0B2545" font-family="${HEAD_SVG}" font-size="16" font-weight="500">The layer that routes a request</text>
  <text x="40" y="44" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">holds two kinds of thing, and has to say which is which</text>
  <rect x="40" y="64" width="440" height="72" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="260" y="94" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">Decisions that span the parts</text>
  <text x="260" y="116" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">owned here, because no one part can own them</text>
  <rect x="520" y="64" width="440" height="72" rx="3" fill="#F2F6F8" stroke="#DCE4EA" stroke-dasharray="5 4"/>
  <text x="740" y="94" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">Current state of everything below</text>
  <text x="740" y="116" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">a mirror, authoritative nowhere</text>
  <path d="M180 258 L180 208 M500 258 L500 208 M820 258 L820 208 M180 208 L820 208 M740 208 L740 148" stroke="#7DBFA3" stroke-width="1.5" fill="none"/>
  <path d="M736 156 L740 144 L744 156 Z" fill="#7DBFA3"/>
  <text x="192" y="200" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">a job polls them for what changed since it last looked</text>
  <rect x="40" y="258" width="280" height="44" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="180" y="286" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">One part of the estate</text>
  <rect x="360" y="258" width="280" height="44" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="500" y="286" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">Another</text>
  <rect x="680" y="258" width="280" height="44" rx="3" fill="#EAF3EE" stroke="#A8D5C0"/>
  <text x="820" y="286" text-anchor="middle" fill="#1B5C46" font-family="${HEAD_SVG}" font-size="14.5" font-weight="500">And another</text>
  <text x="500" y="332" text-anchor="middle" fill="#5B6E80" font-family="Helvetica,Arial,sans-serif" font-size="12.5">each owns what it says about itself, and is the source of truth for it</text>
</svg></div>

<p>The shape that works mirrors the ownership already in place. Each part of the estate owns what it
   says about itself: what it does, how it behaves, how to use it. Above that sits a layer holding
   the things no single part can own, the decisions that span them, and those are genuinely owned
   there and are the real thing.</p>

<p>The same layer also carries a current-state view of everything underneath. That view is not
   authoritative and should never be treated as though it were. The parts are. It exists so that
   whoever is breaking a request down, a person or an agent, can see across the estate well enough
   to route it.</p>

<p><b>And the layer has to mark which of its contents is which.</b> A person infers it from context
   and from tone. An agent reads a mirrored fact as a settled decision and acts on it.</p>

<h3>None of this shape is new, and it still does not hold</h3>

<p>Anyone who has run a service catalog has this already: an entry for each part, living as a file
   in that part's own repository, with a loop that re-reads them and refreshes the view. It works.
   The same shape, under an older name and fed by discovery rather than by files, has been in
   enterprise estates for a generation. So the argument here is not that somebody should build the
   thing. Most of the readers who need it can already point at one.</p>

<p>It is that the thing gets built and then is not believed, and the reasons are not tooling
   reasons. A part that writes down something wrong gets mirrored faithfully, and the wrong answer
   now travels further and looks endorsed. Two parts describing the same interface differently both
   qualify as saying what they say about themselves, so the mirror ends up carrying the
   disagreement, sourced and owned, with no rule for settling it. And the mirror only ever sees what
   somebody chose to publish.</p>

<p>Which is the caveat on the best part of this. A blank entry fails loudly only if something reads
   the blank. Left alone, a catalog fills with parts that have an owner and nothing else, and no
   one is paged for that either. Making absence loud takes an explicit completeness check with a
   threshold and a name against it. That is the machinery, and it is the part people skip.</p>

<h3>What keeps it current, and what that costs</h3>

<p>A job polls the parts for what changed since it last looked. The view is generated rather than
   written, and that is what makes "not authoritative" a property of the thing rather than a rule
   somebody has to remember. A central architecture document that people edit by hand is a fork
   with a better name.</p>

<p>The cost is that the view is always slightly behind. Between two runs it describes a system that
   has already moved, and a routing decision made inside that window can be wrong. The interval is
   an architecture decision rather than a detail.</p>

<p>And a mirror is not the only way. Where the parts can answer a query, the better answer is to
   compose the shape of the estate centrally and resolve the contents on demand, which has no
   staleness in it at all. What is centralized then is the map, not the state. Polling is what you
   are left with when the parts are of different generations and most of them cannot serve a query,
   which is the honest condition of most estates. That is a constraint, not a preference, and it is
   worth knowing which one you are in.</p>

<h3>Consolidated means addressable, not centralized</h3>

<p>One warning about that word, because it is where this gets built wrong. Consolidating the record
   means one place to address, with each slice owned by whoever owns the thing it describes. It does
   not mean one team owning all of the knowledge. That team ends up owning everything and knowing
   nothing, and it rebuilds the middle layer this whole shape exists to remove. The consolidation
   is in the addressing, not in the authorship.</p>

<h3>The part worth having, and it inverts the failure</h3>

<p>A projection can only show what a part actually wrote down. So a part that documents nothing
   shows up blank. Compare that with the case this replaces, where the same gap gets filled by
   somebody else's copy: plausible, sourced from nobody, and true once. Same missing information,
   opposite visibility.</p>

<p>Both fail quietly. Only one of them can be listed. That is the whole trade, and it is worth
   making.</p>

<p><b>What is not known, and one thing this does not solve.</b> The separation between addressing
   and authorship is an intention rather than a mechanism. Nothing in the shape enforces it, and the
   gradient runs the wrong way: every genuinely hard question is one no single part can own, so it
   arrives upstairs, and the layer thickens one reasonable decision at a time. Keeping it thin is a
   discipline somebody has to defend, and this note has no answer for what happens when nobody
   does.</p>

<p>The rest is a shape rather than a result. I have not run it across an organization, and the
   interval question is open: nothing here has measured what a stale view costs a routing decision,
   which is the number that would tell you how often to poll. The argument is about which failures
   can be found, not about what any of it saves.</p>
`,
  next: ['five-user-apis', 'Why do we have five user APIs',
         'The same failure in the code rather than in the record, and the one people already recognize.'],
};

const NOTES = [NOTE, NOTE_HOP, NOTE_SKILL, NOTE_BOUNDARY, NOTE_CROSSING, NOTE_CADENCE, NOTE_SCOPE, NOTE_ANSWER];

// Shared by the article pages and the index. Extracted 2026-08-24 when /notes/
// became real: two pages carrying two copies of the same <head> is how one of
// them quietly stops matching the other.
const noteHead = (title, desc, url) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Crinaro.AI</title>
<meta name="description" content="${desc}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://crinaro.ai/icons/crinaro-og-1200x630.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg('crinaro-ai-mark-small.svg'))}">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/crinaro-favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/crinaro-icon-180.png">`;

// The three-part argument in reading order, then everything else newest first.
// Sorting the whole list by date publishes a sequence backwards, which is how
// the payoff ended up first and the setup last.
// A note declares its series and its place in it. Anything without one is
// standalone. Adding a series means adding a heading here and nothing else.
const SERIES = [
  ['ownership', 'The argument, in three parts'],
  ['boundary',  'Two repositories, in two parts'],
];
const seriesOf = k => NOTES.filter(n => n.series === k).sort((a, b) => a.part - b.part);
const standalone = NOTES.filter(n => !n.series).sort((a, b) => b.date.localeCompare(a.date));

fs.mkdirSync(path.join(DIST, 'notes'), { recursive: true });
writePage(path.join(DIST, 'notes', 'index.html'), `${noteHead(
  'Notes', 'Pieces on delivery, ownership and agentic development, written as they are worked out.',
  'https://crinaro.ai/notes/')}
<style>
${CSS}
  .note-wrap { max-width:38rem; margin:0 auto; padding:3.5rem 1.5rem 5rem; }
  .note-home { display:inline-block; margin-bottom:3rem; }
  .note-home svg { width:11rem; height:auto; display:block; }
  h1 { font-family:var(--head); font-weight:500; font-size:clamp(1.8rem,4vw,2.6rem);
       line-height:1.12; margin:0 0 1rem; }
  .standfirst { font-size:1.12rem; color:var(--ink-2); margin:0 0 3rem;
                padding-bottom:2.6rem; border-bottom:1px solid var(--hair); }
  .entry { margin:0 0 2.8rem; }
  .entry time { font-family:var(--mono); font-size:.72rem; letter-spacing:.14em;
                text-transform:uppercase; color:var(--muted); display:block; margin-bottom:.5rem; }
  .entry h2 { font-family:var(--head); font-weight:500; font-size:1.3rem; margin:0 0 .5rem;
              line-height:1.25; }
  .entry h2 a { color:var(--ink); text-decoration:none;
                border-bottom:1px solid rgba(27,92,70,.35); padding-bottom:1px; }
  .entry h2 a:hover { border-bottom-color:var(--green); }
  .entry p { margin:0; color:var(--ink-2); }
  .index-foot { margin-top:3.5rem; padding-top:1.6rem; border-top:1px solid var(--hair);
                font-size:.92rem; color:var(--ink-2); }
  .series-head { font-family:var(--mono); font-size:.7rem; letter-spacing:.14em;
                 text-transform:uppercase; color:var(--muted); margin:0 0 1.6rem;
                 padding-bottom:.7rem; border-bottom:1px solid var(--hair); }
  .entry + .series-head { margin-top:3.4rem; }
</style>
</head>
<body>
<div class="note-wrap">
  <a class="note-home" href="/" aria-label="Crinaro.AI">${svg('crinaro-ai-horizontal.svg')}</a>
  <h1>Notes</h1>
  <p class="standfirst">If your organization has ended up with several systems doing the same
     thing, and nobody can point at the decision that caused it, the first three of these are one
     argument about why that happens and what an agentic model changes about it. The two after them
   are about where the agent team itself lives, and what has to cross between there and whatever
   you publish.</p>
  ${SERIES.map(([key, head]) => `<p class="series-head">${head}</p>
  ` + seriesOf(key).map((n, i) => `<div class="entry">
    <time datetime="${n.date}">Part ${i + 1}</time>
    <h2><a href="/notes/${n.slug}/">${n.title}</a></h2>
    <p>${n.standfirst}</p>
  </div>`).join('\n  ')).join('\n  ')}
  <p class="series-head">On their own</p>
  ${standalone.map(n => `<div class="entry">
    <time datetime="${n.date}">${n.dateHuman}</time>
    <h2><a href="/notes/${n.slug}/">${n.title}</a></h2>
    <p>${n.standfirst}</p>
  </div>`).join('\n  ')}
  <p class="index-foot">Written by John Kelly. If a piece of this does not hold in your
     architecture, at your size, that is the mail worth sending:
     <a class="src" href="mailto:${EMAIL}">${EMAIL}</a>. Today I read it myself.</p>
</div>
</body>
</html>
`);
console.log(`       dist/notes/ — index of ${NOTES.length}`);

for (const note of NOTES) {
const other = NOTES.filter(n => n.slug !== note.slug);
const notePath = path.join(DIST, 'notes', note.slug);
fs.mkdirSync(notePath, { recursive: true });
writePage(path.join(notePath, 'index.html'), `${noteHead(
  note.title, note.standfirst, `https://crinaro.ai/notes/${note.slug}/`)}
<meta name="author" content="${note.author}">
<meta property="og:type" content="article">
<style>
${CSS}
  /* Article-only. The home page has no long-form prose, so these rules exist
     nowhere else; everything above is shared, palette included. */
  .note-wrap { max-width:38rem; margin:0 auto; padding:3.5rem 1.5rem 5rem; }
  .note-home { display:inline-block; margin-bottom:3rem; }
  .note-home svg { width:11rem; height:auto; display:block; }
  article h1 { font-family:var(--head); font-weight:500; font-size:clamp(1.8rem,4vw,2.6rem);
                line-height:1.12; letter-spacing:.005em; margin:0 0 1rem; text-wrap:balance; }
  article .standfirst { font-size:1.12rem; color:var(--ink-2); margin:0 0 1.6rem; }
  .byline { font-family:var(--mono); font-size:.72rem; letter-spacing:.14em;
            text-transform:uppercase; color:var(--muted); margin:0 0 2.6rem;
            padding-bottom:2.6rem; border-bottom:1px solid var(--hair); }
  article h2 { font-family:var(--head); font-weight:500; font-size:1.3rem;
                margin:2.6rem 0 .9rem; letter-spacing:.005em; }
  article p { margin:0 0 1.2rem; color:var(--ink-2); }
  .note-foot { margin-top:3.5rem; padding-top:1.6rem; border-top:1px solid var(--hair);
               font-size:.92rem; color:var(--ink-2); }
  /* A figure may run wider than the measure. Inside the 38rem article column
     the shared .flow min-width overflows and clips its right-hand boxes. */
  article .flow { margin:2.4rem 0 2.8rem; }
  /* A finished note is a dead end unless it says what to read next and why. */
  .onward { margin-top:3.5rem; padding-top:1.6rem; border-top:1px solid var(--hair); }
  .onward .eyebrow { margin-bottom:.7rem; }
  .onward h2 { margin:0 0 .5rem; font-size:1.2rem; }
  .onward h2 a { color:var(--ink); text-decoration:none;
                 border-bottom:1px solid rgba(27,92,70,.35); padding-bottom:1px; }
  .onward h2 a:hover { border-bottom-color:var(--green); }
  .onward p { margin:0; color:var(--ink-2); font-size:.97rem; }
  /* Nine minutes is a long read to enter blind. The gist lets somebody decide
     in ten seconds whether the rest is for them. */
  .gist { margin:0 0 2.8rem; padding:1.3rem 1.5rem; background:var(--paper);
          border-left:2px solid var(--green); }
  .gist p { font-family:var(--mono); font-size:.68rem; letter-spacing:.14em;
            text-transform:uppercase; color:var(--muted); margin:0 0 .8rem; }
  .gist > div p { font-family:inherit; font-size:1rem; letter-spacing:0;
                  text-transform:none; color:var(--ink-2); margin:0 0 .9rem; }
  .gist > div p:last-child { margin-bottom:0; }
  @media (min-width:62rem) {
    article .flow { width:52rem; margin-left:-7rem; }
    article .flow svg { min-width:0; }
  }
</style>
</head>
<body>
<div class="note-wrap">
  <a class="note-home" href="/" aria-label="Crinaro.AI">${svg('crinaro-ai-horizontal.svg')}</a>
  <article>
    <h1>${note.title}</h1>
    <p class="standfirst">${note.standfirst}</p>
    <p class="byline">${note.author} &nbsp;·&nbsp; <time datetime="${note.date}">${note.dateHuman}</time></p>
${note.gist ? `    <div class="gist"><p>The argument</p><div>
      ${note.gist.map(g => `<p>${g}</p>`).join('\n      ')}
    </div></div>` : ''}
${note.body.trim()}
  </article>
${note.next ? `  <div class="onward">
    <p class="eyebrow">Next</p>
    <h2><a href="/notes/${note.next[0]}/">${note.next[1]}</a></h2>
    <p>${note.next[2]}</p>
  </div>` : ''}
  <p class="note-foot">Written by ${note.author}. If a piece of this does not hold in your
     architecture, at your size, that is the mail worth sending:
     <a class="src" href="mailto:${EMAIL}">${EMAIL}</a>. Today I read it myself.${other.length ? `
     <br>The rest are in <a class="src" href="/notes/">the notes</a>.` : ''}</p>
</div>
</body>
</html>
`);
console.log(`       dist/notes/${note.slug}/ — bylined piece`);
}


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
  `  <url><loc>https://crinaro.ai/notes/</loc><changefreq>monthly</changefreq></url>\n` +
  NOTES.map(n =>
    `  <url><loc>https://crinaro.ai/notes/${n.slug}/</loc><lastmod>${n.date}</lastmod></url>\n`).join('') +
  '</urlset>\n');

// Icons, generated by logo/build-icons.py. Only the four the web actually
// asks for are published — the rest of that set is for GitHub, LinkedIn and
// the like, and has no business being fetched by a browser.
const ICON_SRC = path.join(__dirname, 'logo', 'icons');
const ICON_DIR = path.join(DIST, 'icons');
const WEB_ICONS = ['crinaro-favicon-16.png', 'crinaro-favicon-32.png',
                   'crinaro-icon-180.png', 'crinaro-og-1200x630.png'];
if (fs.existsSync(ICON_SRC)) {
  fs.mkdirSync(ICON_DIR, { recursive: true });
  WEB_ICONS.forEach(f => fs.copyFileSync(path.join(ICON_SRC, f), path.join(ICON_DIR, f)));
} else {
  console.warn('  ! logo/icons missing — run: cd logo && python3 build-icons.py');
}

const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`wrote dist/index.html — ${kb} KB, 0 external requests`);
console.log('       dist/CNAME, .nojekyll, robots.txt, sitemap.xml');
console.log(`       dist/icons/ — ${WEB_ICONS.length} files`);
