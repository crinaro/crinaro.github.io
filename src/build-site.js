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
   'One team solves it properly and has nowhere to put it. Nobody else knows it exists, so the same work happens again somewhere else.'],
  ['Reuse without evidence is a gamble',
   'Nobody will build on someone else’s work if there is no way to tell whether it holds. So nothing is reused, and everything is rebuilt.'],
];

// The maintenance team, by role. These are real agent definitions — the six in
// crinaro/careers-plugins-dev under .claude/agents/. That repo is PRIVATE: it is
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
  ['Architect', 'The shape of the thing — what is an agent, what is a script, what belongs in a manifest.'],
  ['Deployment auditor', 'Where it can actually run: a desktop, a schedule, a headless container — and whether the docs say so truthfully.'],
  ['Gate keeper', 'The checks. The regression suite, the fixtures, and whether CI agrees with what passed locally.'],
  ['Docs steward', 'The written record — decisions, rulebooks, and stale claims about a system that has moved on.'],
  ['Release manager', 'Shipping, so it actually loads for someone. Versions, catalog, cache, and a check from a fresh session.'],
  ['Delivery verifier', 'What people actually install after the push — whether it matches what shipped, and whether a claimed fix is really in it.'],
];

// What the factory maintains. Framed as living assets rather than products,
// because that is the actual claim: not that these were built with AI, but
// that they are kept alive by agent teams. Careers Plugins is public and
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
  ['The AI-SDLC reference', 'Private — not published',
   'How an agentic SDLC runs across an organization rather than one team’s repos. Re-sourced continuously, because a reference nobody maintains is worse than none.'],
  ['This brand', 'Internal — three agents',
   'The page you are reading, the deck, the identity and the rules that govern them. A critic, a copy editor, and one that renders every visual and looks at it before anything ships.'],
  // "Running daily for one person, not yet a second" was here, and it WAS
  // load-bearing for as long as the card described a product — it was the clause
  // that stopped the description implying adoption. John removed it 2026-08-20.
  // That is safe now, and only now, because the card no longer makes a usage
  // claim for the caveat to bound: it says what the marketplace is for and that
  // agent teams get run in it, and says nothing about who uses it. If a usage or
  // adoption claim ever comes back, the caveat has to come back with it.
  ['Careers Plugins', 'Public — nine agents',
   'A Claude Code marketplace for career search and development, and where agent teams get run in the open: how one is structured, and what each agent owns.',
   'https://github.com/crinaro/careers-plugins', 'Read the agents'],
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
     aria-label="A capability spec becomes work items across repos, built by agents on routed compute, then merged and reconciled against the original spec — with a knowledge layer underneath every stage">
  ${STAGES.map(([t, s], i) => {
    const x = i * (BOX_W + BOX_GAP), cx = x + BOX_W / 2;
    return `<g>
    <rect x="${x}" y="${BOX_Y}" width="${BOX_W}" height="${BOX_H}" rx="3" fill="#F2F6F8" stroke="#DCE4EA"/>
    <text x="${cx}" y="${BOX_Y + 38}" text-anchor="middle" fill="#0B2545" font-family="${HEAD_SVG}" font-size="17" font-weight="500">${t}</text>
    <text x="${cx}" y="${BOX_Y + 60}" text-anchor="middle" fill="#6A8095" font-family="Helvetica,Arial,sans-serif" font-size="12.5">${s}</text>
    <path d="M${cx} ${BOX_Y + BOX_H} L${cx} ${KB_Y}" stroke="#93B8D4" stroke-width="1.5" stroke-dasharray="3 5"/>
  </g>`;
  }).join('\n  ')}
  ${STAGES.slice(1).map((_, i) => {
    const gx = (i + 1) * (BOX_W + BOX_GAP) - BOX_GAP / 2;
    return `<path d="M${gx - 5} ${BOX_Y + 36} l7 7 -7 7" fill="none" stroke="#1B5C46" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('\n  ')}
  <rect x="0" y="${KB_Y}" width="1000" height="66" rx="3" fill="#0B2545"/>
  <text x="24" y="${KB_Y + 28}" fill="#FFFFFF" font-family="${HEAD_SVG}" font-size="16" font-weight="500">The knowledge layer</text>
  <text x="24" y="${KB_Y + 50}" fill="#93B8D4" font-family="Helvetica,Arial,sans-serif" font-size="13">Current-state index and deep-research memory — queried, never re-derived.</text>
</svg>`;

// What makes the reference different from every other set of AI-SDLC docs.
// This is the advisory product: not a recommendation, a way of deciding.
const method = [
  ['The options',
   'Every organization arrives with different constraints. Each decision names the real alternatives rather than one best practice.'],
  ['The signal',
   'A decision table that picks between them, against things you can actually observe. Not “it depends”.'],
  ['The trigger',
   'The specific, felt pain that says it is time for the more complex option — so you never buy infrastructure for a problem you do not have yet.'],
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
// The section heading above this list is now "Crinaro is John Kelly.", which no
// longer bridges to the industries the way "Patterns learned in hard places" did.
// The prose names them instead, so this list and that sentence have to move
// together — and both have to match the meta description.
const verticals = [
  ['Healthcare', 'Records that cannot answer the question at the bedside'],
  ['GovTech', 'Policy that never reaches the citizen as a working service'],
  ['Travel', 'Fragmented inventory that fails the moment something goes wrong'],
];

// Advisory that leaves something behind — not a bespoke build. The engagement
// ends with the client's own team running it, which is the point.
// The week-by-week breakdown of a fixed-price four-to-six week sprint was here.
// Removed 2026-08-20 at John's direction — a dated, priced engagement shape is a
// consultancy product, and it narrows a site that has to work for advisory,
// fractional and employment conversations at the same time. The substance of the
// three weeks survives as one paragraph in the section below; what went is the
// calendar and the price, which were the parts that presumed the engagement.
//
// That paragraph opened "Working alongside your teams, not in place of them",
// which said the same thing as its own last sentence — the team ends up running
// it — and said it as a negation of what a supplier does. The positive half is
// kept and the negation is gone. It still says "without us": the page uses the
// company voice throughout, and swapping one paragraph to the singular would
// leave the page half-migrated, which reads worse than either.


// One stylesheet, shared by every page this generator writes. Extracted so a
// second page cannot fork the palette — a duplicated :root is exactly the kind
// of drift check-contrast.js and check-drift.sh exist to catch after the fact.
const CSS = `${FONTS}
  /* The brand commits to one visual world — navy and paper — rather than
     following the viewer's theme. Every ground is painted explicitly. */
  :root {
    --navy:#0B2545; --navy-2:#123256; --paper:#F2F6F8; --ground:#FFFFFF;
    --green:#1B5C46; --rgreen:#4FA98A; --blue:#5B84A9; --rblue:#93B8D4;
    /* --muted was #6A8095 and failed AA as text: 3.76 on paper, 4.09 on white,
       set at 11.2px for eyebrows. Darkened to 43% lightness at the same hue and
       saturation — 4.84 on paper, 5.27 on white. It is the same grey, deeper. */
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
// separation is what lets the site keep standing if John takes a full-time role,
// subcontracts, or works inside another firm — see the note on "Where this
// comes from".
//
// The cadence and the DAO example live HERE and not on the home page. On the
// page they would be arithmetic a reader tests and a second unit of time
// competing with the advisory paragraph. In a piece they are the substance.
const NOTE = {
  slug: 'aligning-teams',
  title: 'Aligning teams to the architecture, and what agents change',
  author: 'John Kelly',
  date: '2026-08-20',
  dateHuman: '20 August 2026',
  standfirst: 'A delivery cadence matters less than what the teams inside it are aligned to. ' +
              'That alignment belongs on the architecture — and agentic delivery pushes it a level ' +
              'deeper than it used to go.',
  body: `
<p>The shape I have used is a ten-week delivery cycle: five two-week sprints inside it, four of them
   on delivery and one on innovation and planning the next cycle. It is a useful rhythm. It is also
   the part that matters least.</p>

<p>What decides whether a cycle works is what the teams are aligned to. If that changes every time
   priorities do, nothing accumulates. Each initiative re-forms the teams, and the patterns and the
   shared components never get an owner long enough to become real. So the alignment has to sit on
   an axis that is stable and does not change often.</p>

<p>In my experience that axis is the architecture. Align teams by the stack and the org chart starts
   reinforcing the architecture, the patterns and the reuse instead of working against them.
   Products change and priorities change. The stack changes slowly, and that is what makes it
   something worth aligning to.</p>

<h2>Ownership is the part that decides it</h2>

<p>The argument about full-stack teams versus teams aligned to a layer of the stack has run for a
   long time, and I no longer think it is the interesting question. What decides success is whether
   a team truly owns something. A team that owns an asset, and expects to still be answerable for
   it next quarter, behaves differently from a team assembled around an initiative.</p>

<p>My own preference is teams that own components of the stack, because that is what drives
   reusability and scalability for the organization. It is also hard to hold onto, and the
   difficulty is not that the idea is complicated. The cost arrives first and the payoff arrives
   later. Judged on a short horizon, component ownership reads as overhead: a team declining work
   that is not theirs, an interface argued over rather than a feature shipped. It takes sustained
   work, the way most things with a real return do — and the return does not show up inside one
   quarter.</p>

<h2>What agentic delivery changes</h2>

<p>It pushes the alignment a level deeper: to the components in the architecture, and to how those
   components are managed.</p>

<p>Take an API team, working the old way. They get an epic — the work for the delivery cycle — and
   break it into user stories. The stories usually name an <em>outcome</em>: the API. But the outcome
   is delivered through changes across several components, often across several repositories. Those
   are the tasks, and most of the time nobody wrote them down. The engineers understood the system
   well enough to execute without being told, so the detail stayed in their heads.</p>

<p>The bridge from the outcome to the components that implement it was real work, done reliably, and
   invisible. It never needed to be written down in order to happen.</p>

<p>Agents have no such bridge. Nothing fills the gap between “build the API” and the specific changes
   in the specific components. So the work has to be broken down to the teams that maintain those
   components — explicitly, in a way it never had to be before.</p>

<h2>What that looks like in practice</h2>

<p>Say the API in question is a facade layer over three services at the data-access layer. On one
   architecture that is two agent teams; on another it is four. Which of those it is depends on how
   complex the data is at that layer, not on how the story was written.</p>

<p>The number of teams is a property of the architecture, not of the requirement. Two organizations
   handed the same user story will staff it differently, and both can be right. Deciding team
   structure from the shape of the backlog means reading the wrong document.</p>

<h2>The boundary is the asset, not the repository</h2>

<p>When I say stack here I mean the code asset a team owns. That may cross several repositories, it
   may be a single repository, or it may be a path inside one. The boundary is not a fact about your
   source control. It is a decision about what makes sense for the business, and about maintaining
   the software asset that enables it. Expect to define it, and then to keep refining it.</p>

<p>Two kinds of capability follow from where that line falls. Some skills and agents are used across
   teams — the shared layer, the same idea a shared stack has always been. Others are specific to
   the boundary a team owns. Both exist, and confusing them is how a shared capability ends up
   maintained by nobody.</p>

<h2>Orchestration is what makes component ownership affordable</h2>

<p>Push ownership down to components and you get reuse and scale. You also get the old objection: a
   request that spans the stack now spans several teams, and somebody has to carry it.</p>

<p>That is what an orchestration team is for. The request arrives in the historic full-stack shape,
   which is how a business actually asks for things, and the orchestration layer breaks it down to
   the component teams that own the pieces and sees it through to fulfilled. The component teams
   keep their ownership. The person asking keeps the simple question. The complexity moves to a
   layer built to hold it.</p>

<p>So the choice between full-stack teams and component-aligned teams stops being a choice. That
   trade was real, and it is why the argument never resolved.</p>

<h2>The hard part is continuous integration</h2>

<p>In any of these shapes, the thing that decides whether it works is continuous integration and
   continuous deployment. That is where an orchestration layer earns its place, and it is the right
   challenge to put to one: not whether it can route work, but whether it can show the capability
   holds once the pieces land.</p>

<p>The components carry their own unit and system-level tests. The orchestration layer adds the
   capability-level test — whether the thing the business asked for works across the components
   that implement it. With a robust enough integration capability you spin up an environment and run
   that end to end.</p>

<h2>What follows from it</h2>

<p>The decomposition that used to live in people’s heads becomes an artifact. That is a cost: it is
   work that used to be free. It is also what makes the rest possible, because an explicit map of
   which team owns which component is what lets work be routed at all.</p>

<p>It also means maintenance stops being incidental. A component with a team has someone answerable
   for whether its documents are still true, its checks still run, and its releases still load.
   Without that, an agent-built component is alive until the first thing about it changes.</p>

<p>Where exactly the component boundary falls is something I expect to keep getting wrong and
   correcting. That it has to be drawn at all, and written down, is the part that has changed.</p>
`,
};

// The second piece. Piece one calls the cadence "the part that matters least"
// and moves on, which leaves the obvious question unanswered: then why that
// shape, and why does one sprint in five not deliver anything? This answers it,
// and joins it to piece one's conclusion that the decomposition is now explicit
// work somebody has to do.
//
// The join is reasoning, not John's recorded words. His material gives the
// cadence and gives the decomposition-as-artifact; putting the second inside the
// first is the argument this piece makes. Flagged so nobody later mistakes it
// for something he said.
const NOTE_CADENCE = {
  slug: 'improving-the-agents',
  title: 'From writing the code to improving the agents',
  author: 'John Kelly',
  date: '2026-08-20',
  dateHuman: '20 August 2026',
  standfirst: 'Teams moving to an agentic approach need time to refine their agents and skills. ' +
              'Most are not given it — and the sprint that was supposed to hold that time is usually already spent.',
  body: `
<p>A ten-week delivery cycle, five two-week sprints. Four on delivery, and the fifth on innovation
   and planning the next cycle. That is the shape I have used, and the fifth sprint is where the
   interesting failure lives.</p>

<p>It is supposed to absorb the overrun. Teams underestimate what it will take to finish something
   — that is not a character flaw, it is what estimating under uncertainty does — and the fifth
   sprint is where that lands. Used that way once, it is doing its job. Used that way every cycle,
   the innovation and the planning never happen, and the estimating does not improve either, because
   the consequence keeps being absorbed before anyone has to look at it.</p>

<p>Without the discipline to change that behavior, teams do not change it. The cadence on its own
   will not do it for you.</p>

<h2>Agentic delivery puts a new demand on the same capacity</h2>

<p>Teams moving to an agentic approach need time to refine their agents and their skills, because
   that is what improves what the team produces. It is real work and it is not delivery, and it
   competes for exactly the capacity the overrun has already taken.</p>

<p>What engineers in that position will tell you is that they are not being given that capacity.
   They are right. In a transition you have to give it to them deliberately and say that you are
   giving it, because the default is that it gets absorbed like everything else.</p>

<p>Where it sits matters less than whether it is real. The fifth sprint is one answer. Spreading it
   through the program increment is another. What does not work is assuming it will happen in the
   gaps, because there are no gaps.</p>

<h2>The shift this is really asking for</h2>

<p>The change is bigger than a calendar. Engineers move from writing the code to improving the
   agents that write it — the design they work to, the coding practices they apply, the unit tests
   they produce, how the thing gets tested, what gets documented. The output is still code. The work
   has moved upstream of it.</p>

<p>That is a genuine shift for an engineering team, and people do not arrive at it at the same
   speed. Someone who has spent a career being good at writing the code is being asked to be good at
   something next to it, with a longer feedback loop: you do not find out whether the change worked
   until the next thing the agent produces.</p>

<p>Which is why the capacity question is not really about scheduling. A team told to improve its
   agents in time it does not have will conclude the organization was not serious, and go back to
   writing the code — because that, at least, is visibly delivery.</p>

<h2>What to protect</h2>

<p>Not the number, and not the sprint. Ten weeks and five sprints is one arrangement that works.
   What has to be true is that the time to maintain and improve the agent team is dedicated, named
   and defended — and that it is not the same time last cycle's overrun is quietly spending.</p>
`,
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Crinaro.AI — AI from higher ground</title>
<!-- No person named here, on purpose — see the note on the "Where this comes
     from" section. "Installed in your own environment" stays dropped: it was a
     deployment claim, sitting in the tag that shows in a search result. -->
<meta name="description" content="Ideas and patterns worked out over a career, now applied with agents. Drawn from delivery in healthcare, government and travel.">
<meta property="og:title" content="Crinaro.AI">
<meta property="og:description" content="${CLAIM} Ideas and patterns worked out over a career, now applied with agents.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://crinaro.ai/">
<meta property="og:image" content="https://crinaro.ai/icons/crinaro-og-1200x630.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Crinaro.AI — AI from higher ground">
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
    <p>Ideas and patterns worked out over a career, now applied with agents.</p>
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
      <h2>The whole view decides the design.</h2>
      <p>Crinaro is a ridge line — from the Italian <i>crinale</i>, the crest path where you can
         see down both sides. That is the method. Stand where the whole system is visible, then
         design end to end, rather than improving one step and moving the cost somewhere else.</p>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">How the work gets done</p>
      <h2>A factory that maintains, not just builds.</h2>
      <p>A user story used to name an outcome — <em>the API</em> — and the engineers filled in the
         rest. The work landed across several components, in several repositories, and nobody wrote
         that part down because nobody needed to. Agents have no such shortcut, so the work has to
         be broken down to the teams that maintain each component. That is why a component has a
         team at all.</p>
      <p>Generating something with AI is the easy half now. The half that decides whether it is
         still alive in six months is the one nobody automates — keeping the documents true, the
         gates green, the releases loading, and the claims about the system honest. That is what
         these agents do. None of them writes features.</p>
    </div>
    <div class="verts">
      ${factory.map(([n, d]) => `<div class="vert"><b>${n}</b><span>${d}</span></div>`).join('\n      ')}
    </div>
    <p class="note">Those six are agent definitions in the private repository that maintains the
       marketplace, so you cannot read them. What they maintain is public: nine installable agents,
       their documentation, and a version history you can walk back.</p>
    <!-- The only route to the written pieces. Still no "Writing" heading: two
         pieces do not make a series, and a section header promises one. When
         there is a third, this becomes a list on its own page. -->
    <p class="note">The argument above is written up at length in
       <a class="src" href="/notes/${NOTE.slug}/">${NOTE.title}</a>, and what it costs to run is in
       <a class="src" href="/notes/${NOTE_CADENCE.slug}/">${NOTE_CADENCE.title}</a>.</p>
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
      <p>Most AI-SDLC advice stops at one team’s repository. This spans the whole path — the spec a
         roadmap team writes, the work it becomes across other people’s repos, and whether what
         shipped is what was asked for.</p>
    </div>
    <div class="flow">${flow}</div>
    <div class="cols" style="margin-top:3.2rem">
      ${method.map(([h, b]) => `<div class="col"><div class="rule"></div>
        <h3>${h}</h3><p>${b}</p></div>`).join('\n      ')}
    </div>
    <p class="note">Kept current as the ground moves — the tools, the vendors and the limits all
       change, and a reference that is not re-sourced is worse than none. It is not published, so
       the diagram above shows how far the work reaches, not the decisions inside it.</p>
  </div>
</section>


<section>
  <div class="wrap">
    <div class="head narrow">
      <p class="eyebrow">Advisory</p>
      <h2>Advice that leaves something behind.</h2>
      <p>The work happens alongside your teams: looking at how they build today, then standing up
         the smallest useful thing — a shared pattern, a working evaluation, a place to publish
         where another team will find it. It ends with your team running it without us, keeping
         the patterns and the harness, and a recommendation. Sometimes that recommendation is
         “do not build this.”</p>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head narrow">
      <!-- The brand is NOT tied to a named person, deliberately. Crinaro is the
           body of work — ideas and patterns from a career — and it has to keep
           standing if that career moves: a full-time role, a subcontract, or
           work inside another firm. A site that reads "Crinaro is <name>" turns
           into a conflict to explain on any of those days. The attribution is
           indirect and sufficient: the contact address reaches the person.
           Reverted 2026-08-20, same day it was added. -->
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
      <!-- This used to read "Find the thing worth building once, and building well" over "Bring the
           problem your teams keep solving separately" — a request for an engagement, at the last
           thing anyone reads. That was right for a page selling services and wrong for a body of
           work, which has to hold whether or not the reader ever becomes a client. It also has to
           keep standing across a change of employment, so it declares no availability. An argument
           to disagree with is the invitation. -->
      <p class="eyebrow">If any of this is useful</p>
      <h2>Say where it breaks.</h2>
      <p>These are patterns, not prescriptions, and the interesting mail is the mail that says a
         piece of it does not hold — in your architecture, at your size, with the constraints you
         actually have. That is a conversation worth having whether or not anything follows it.</p>
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

const NOTES = [NOTE, NOTE_CADENCE];

for (const note of NOTES) {
const other = NOTES.filter(n => n.slug !== note.slug);
const notePath = path.join(DIST, 'notes', note.slug);
fs.mkdirSync(notePath, { recursive: true });
fs.writeFileSync(path.join(notePath, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${note.title} — Crinaro.AI</title>
<meta name="description" content="${note.standfirst}">
<meta name="author" content="${note.author}">
<meta property="og:title" content="${note.title}">
<meta property="og:description" content="${note.standfirst}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://crinaro.ai/notes/${note.slug}/">
<meta property="og:image" content="https://crinaro.ai/icons/crinaro-og-1200x630.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg('crinaro-ai-mark-small.svg'))}">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/crinaro-favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/crinaro-icon-180.png">
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
</style>
</head>
<body>
<div class="note-wrap">
  <a class="note-home" href="/" aria-label="Crinaro.AI">${svg('crinaro-ai-horizontal.svg')}</a>
  <article>
    <h1>${note.title}</h1>
    <p class="standfirst">${note.standfirst}</p>
    <p class="byline">${note.author} &nbsp;·&nbsp; <time datetime="${note.date}">${note.dateHuman}</time></p>
${note.body.trim()}
  </article>
  <p class="note-foot">Written by ${note.author}. Questions or disagreement to
     <a class="src" href="mailto:${EMAIL}">${EMAIL}</a>.${other.length ? `<br>Also:
     ${other.map(o => `<a class="src" href="/notes/${o.slug}/">${o.title}</a>`).join(', ')}.` : ''}</p>
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
  [NOTE, NOTE_CADENCE].map(n =>
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
