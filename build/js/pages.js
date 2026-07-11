// ═══════════════════════════════════════════════════════════════════════════
// pages.js — one render function per route. Each returns { html, label, onMount }.
// Pure string templating (no framework). onMount wires per-page interactions.
// ═══════════════════════════════════════════════════════════════════════════
import {
  PROFILE, MARQUEE, PRACTICES, PROCESS, NUMBERS, PROJECTS, ARTICLES,
  EXPERIENCE, VALUES, STACK, findProject, findArticle,
} from './data.js';

// ── tiny helpers ────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const chips = (arr) => arr.map((t) => `<span class="chip">${esc(t)}</span>`).join('');
const eyebrow = (t, center = false) =>
  `<p class="eyebrow reveal"${center ? ' style="justify-content:center"' : ''}>${esc(t)}</p>`;

// ═══ HOME ════════════════════════════════════════════════════════════════════
export function renderHome() {
  const featured = PROJECTS.slice(0, 4);
  const writing = ARTICLES.slice(0, 3);

  const marquee = MARQUEE.map((m) => `<span class="marquee-item">${esc(m)}</span>`).join('');

  const practices = PRACTICES.map((p) => `
    <article class="practice">
      <span class="idx">${p.n}</span>
      <h3>${esc(p.t)}</h3><p>${esc(p.d)}</p>
      <span class="pill">${esc(p.tag)}</span>
    </article>`).join('');

  const steps = PROCESS.map((s) => `
    <div class="step" data-step="${+s.n}" data-name="${esc(s.name)}">
      <div class="step-top"><span class="idx">${s.n} / 04</span><span class="pill">${esc(s.week)}</span></div>
      <h3>${esc(s.name)}</h3><p>${esc(s.d)}</p>
      <div class="step-tags">${chips(s.tags)}</div>
    </div>`).join('');

  const work = featured.map((p) => `
    <a class="work-card reveal" href="#/work/${p.slug}">
      <div class="wc-cover" style="--c:${p.color}"><span class="wc-year">${esc(p.year)}</span><span class="wc-glyph">${p.initial}</span></div>
      <div class="wc-meta-row"><span class="mono">${esc(p.kind)}</span><span class="mono wc-metric">${esc(p.outcome)}</span></div>
      <h3 class="wc-name">${esc(p.name)}</h3>
      <p class="wc-summary">${esc(p.summary)}</p>
      <div class="wc-tags">${chips(p.tags)}</div>
    </a>`).join('');

  const stats = NUMBERS.map((n) => `
    <div class="stat"><div class="stat-num" data-target="${n.target}" data-suffix="${n.suffix}">0</div>
    <div class="stat-label">${esc(n.label)}</div></div>`).join('');

  const posts = writing.map((a) => `
    <a class="post reveal" href="#/blog/${a.slug}">
      <div class="panel" style="background:${a.color}"><span class="cat">${esc(a.category)}</span></div>
      <h3>${esc(a.title)}</h3><p>${esc(a.deck)}</p>
      <span class="date">${esc(a.date)} · ${esc(a.readTime)}</span>
    </a>`).join('');

  const chapters = EXPERIENCE.map((c) => `
    <article class="chapter${c.current ? ' current' : ''}">
      <span class="yr">${esc(c.years)}</span><h3>${esc(c.org)}</h3>
      <span class="role">${esc(c.role)}</span><p>${esc(c.note)}</p>
    </article>`).join('');

  const html = `
    <section class="hero" id="hero">
      <canvas class="hero-ascii-bg" aria-hidden="true"></canvas>
      <div class="hero-cue">Scroll</div>
    </section>

    <section class="marquee" aria-label="Skills">
      <div class="marquee-track" id="marquee">${marquee}${marquee}</div>
    </section>

    <section class="section" id="practices-sec">
      <div class="container">
        ${eyebrow('What I do')}
        <h2 class="s-title reveal" style="margin-bottom:56px">Four practices, one operating system.</h2>
        <div class="practice-grid reveal">${practices}</div>
      </div>
    </section>

    <section class="section bordered">
      <div class="container">
        ${eyebrow('Process')}
        <h2 class="s-title reveal" style="margin-bottom:64px">Six weeks, four moves, one number.</h2>
        <div class="process-grid">
          <aside class="process-card" id="proc-card">
            <div class="k">Step</div>
            <div class="num"><span id="proc-num">01</span><small> / 04</small></div>
            <div class="process-bar"><i id="proc-bar"></i></div>
            <div class="now" id="proc-now">Diagnose</div>
          </aside>
          <div class="steps" id="steps">${steps}</div>
        </div>
      </div>
    </section>

    <section class="section bordered">
      <div class="container">
        <div class="s-head">
          <div>${eyebrow('Selected work · 2011 — 26')}<h2 class="s-title reveal">Six projects worth talking about.</h2></div>
          <a href="#/work" class="link-arrow reveal">All projects (${PROJECTS.length}) →</a>
        </div>
        <div class="work-grid">${work}</div>
      </div>
    </section>

    <section class="section scoreboard bordered">
      <div class="container">
        ${eyebrow('In numbers')}
        <h2 class="s-title reveal" style="margin-bottom:56px">The scoreboard, kept honest.</h2>
        <div class="stat-grid reveal">${stats}</div>
      </div>
    </section>

    <section class="section bordered">
      <div class="container">
        <div class="s-head">
          <div>${eyebrow('Writing')}<h2 class="s-title reveal">Notes from the design floor.</h2></div>
          <a href="#/blog" class="link-arrow reveal">All writing →</a>
        </div>
        <div class="writing-grid">${posts}</div>
      </div>
    </section>

    <section class="section bordered">
      <div class="container">
        ${eyebrow('Career')}
        <div class="timeline-head reveal"><h2 class="s-title">Fourteen years, five chapters.</h2><span class="cue">Scroll sideways →</span></div>
      </div>
      <div class="container"><div class="timeline-track" id="timeline">${chapters}</div></div>
    </section>`;

  return { html, label: 'Home', route: 'home', onMount: (ctx) => {
    ctx.initHero();
    ctx.initProcess();
    ctx.initTimeline();
  } };
}

// ═══ WORK (index) ════════════════════════════════════════════════════════════
export function renderWork() {
  const allTags = ['All', ...new Set(PROJECTS.flatMap((p) => p.tags))];
  const filters = allTags.map((t, i) =>
    `<button class="chip-filter${i === 0 ? ' active' : ''}" data-tag="${esc(t)}">${esc(t)}</button>`).join('');

  const rows = PROJECTS.map((p, i) => `
    <a class="work-row reveal" href="#/work/${p.slug}" data-tags="${esc(p.tags.join('|'))}">
      <span class="mono wr-idx">${String(i + 1).padStart(2, '0')}</span>
      <span class="wr-thumb" style="--c:${p.color}"><span class="wr-glyph">${p.initial}</span></span>
      <span class="wr-main">
        <span class="h3 wr-name">${esc(p.name)}</span>
        <span class="wr-summary">${esc(p.summary)}</span>
        <span class="wr-tags">${chips(p.tags)}</span>
      </span>
      <span class="wr-meta"><span class="mono">${esc(p.kind)}</span><span class="mono">${esc(p.year)}</span><strong class="wr-outcome">${esc(p.outcome)}</strong></span>
      <span class="wr-arrow">↗</span>
    </a>`).join('');

  const html = `
    <section class="section page-head">
      <div class="container">
        ${eyebrow('Work archive · 2011 — 26')}
        <h1 class="s-title xl reveal">Selected work — six I can show you in detail.</h1>
        <p class="lede reveal">Each one walks through the problem, the process, and the outcome — with the numbers, the dead ends, and the design decisions that actually moved the needle.</p>
      </div>
    </section>
    <section class="section pt0">
      <div class="container">
        <div class="filter-row reveal"><span class="mono filter-label">Filter</span><div class="filter-chips">${filters}</div></div>
        <div class="work-rows" id="work-rows">${rows}</div>
      </div>
    </section>`;

  return { html, label: 'Work', route: 'work', onMount: () => {
    const chipsEls = [...document.querySelectorAll('.chip-filter')];
    const rowsEls = [...document.querySelectorAll('.work-row')];
    chipsEls.forEach((c) => c.addEventListener('click', () => {
      chipsEls.forEach((x) => x.classList.toggle('active', x === c));
      const tag = c.dataset.tag;
      rowsEls.forEach((r) => {
        const show = tag === 'All' || r.dataset.tags.split('|').includes(tag);
        r.style.display = show ? '' : 'none';
      });
    }));
  } };
}

// ═══ CASE (detail) ═══════════════════════════════════════════════════════════
export function renderCase(slug) {
  const p = findProject(slug);
  if (!p) return renderNotFound();
  const idx = PROJECTS.indexOf(p);
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  const spec = [['Role', p.role], ['Duration', p.duration], ['Outcome', p.outcome], ['Focus', p.kind]]
    .map(([k, v]) => `<div class="spec-row"><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  const metrics = p.metrics.map((m) =>
    `<div class="metric"><strong class="metric-v">${esc(m.v)}</strong><span class="mono metric-l">${esc(m.l)}</span></div>`).join('');
  const body = p.body.map((para) => `<p>${esc(para)}</p>`).join('');

  const html = `
    <article class="page-case">
      <section class="case-head" style="--c:${p.color}">
        <div class="container">
          <a class="back-link mono reveal" href="#/work">← All work</a>
          <div class="case-head-grid">
            <div>
              <p class="eyebrow reveal">${esc(p.kind)} · ${esc(p.year)}</p>
              <h1 class="s-title xl reveal">${esc(p.name)}</h1>
              <p class="lede reveal">${esc(p.summary)}</p>
            </div>
            <aside class="case-spec reveal"><dl class="spec">${spec}</dl></aside>
          </div>
          <div class="case-hero reveal" style="--c:${p.color}"><span class="case-hero-glyph">${p.initial}</span></div>
        </div>
      </section>
      <section class="section pt0"><div class="container"><div class="metric-row reveal">${metrics}</div></div></section>
      <section class="section pt0"><div class="container-narrow prose reveal">${body}</div></section>
      <section class="section">
        <div class="container">
          <div class="hairline"></div>
          <a class="next-cta reveal" href="#/work/${next.slug}">
            <span class="mono">Next case</span>
            <h2 class="s-title">${esc(next.name)} — ${esc(next.kind)}</h2>
            <span class="next-arrow">→</span>
          </a>
        </div>
      </section>
    </article>`;

  return { html, label: p.name, route: 'work', onMount: () => {} };
}

// ═══ BLOG (index) ════════════════════════════════════════════════════════════
export function renderBlog() {
  const [feature, ...rest] = ARTICLES;
  const cats = ['All', ...new Set(rest.map((a) => a.category))];
  const filters = cats.map((c, i) =>
    `<button class="chip-filter${i === 0 ? ' active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

  const feat = `
    <a class="bf-card reveal" href="#/blog/${feature.slug}">
      <div class="bf-cover" style="background:${feature.color}"><span class="mono">Featured · ${esc(feature.category)}</span><span class="bf-glyph">¶</span></div>
      <div class="bf-body">
        <span class="mono bf-cat">${esc(feature.category)}</span>
        <h2 class="s-title bf-title">${esc(feature.title)}</h2>
        <p class="lede">${esc(feature.deck)}</p>
        <span class="mono bf-meta">${esc(feature.date)} · ${esc(feature.readTime)}</span>
      </div>
    </a>`;

  const rows = rest.map((a, i) => `
    <a class="article-row reveal" href="#/blog/${a.slug}" data-cat="${esc(a.category)}">
      <span class="mono ar-idx">№ ${String(i + 2).padStart(2, '0')}</span>
      <span class="mono ar-cat">${esc(a.category)}</span>
      <span class="ar-main"><span class="h3 ar-title">${esc(a.title)}</span><span class="ar-deck">${esc(a.deck)}</span></span>
      <span class="mono ar-meta">${esc(a.date)} · ${esc(a.readTime)}</span>
      <span class="wr-arrow">↗</span>
    </a>`).join('');

  const html = `
    <section class="section page-head">
      <div class="container">
        ${eyebrow('Writing · A working journal')}
        <h1 class="s-title xl reveal">Notes on craft, conversion, and design at scale.</h1>
        <p class="lede reveal">Long-form notes on the parts of design that don’t fit in a Figma file — design systems, payments UX, and building with AI.</p>
      </div>
    </section>
    <section class="section pt0"><div class="container blog-feature">${feat}</div></section>
    <section class="section pt0">
      <div class="container">
        <div class="blog-list-head s-head"><h2 class="s-title">All writing</h2><div class="filter-chips">${filters}</div></div>
        <div class="article-rows" id="article-rows">${rows}</div>
      </div>
    </section>`;

  return { html, label: 'Writing', route: 'blog', onMount: () => {
    const chipsEls = [...document.querySelectorAll('.chip-filter')];
    const rowsEls = [...document.querySelectorAll('.article-row')];
    chipsEls.forEach((c) => c.addEventListener('click', () => {
      chipsEls.forEach((x) => x.classList.toggle('active', x === c));
      const cat = c.dataset.cat;
      rowsEls.forEach((r) => { r.style.display = (cat === 'All' || r.dataset.cat === cat) ? '' : 'none'; });
    }));
  } };
}

// ═══ ARTICLE (reading view) ══════════════════════════════════════════════════
export function renderArticle(slug) {
  const a = findArticle(slug);
  if (!a) return renderNotFound();
  const related = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 2);

  const body = a.body.map((para, i) =>
    `<p${i === 0 ? ' class="dropcap"' : ''}>${esc(para)}</p>`).join('');
  const rel = related.map((r) => `
    <a class="related-card reveal" href="#/blog/${r.slug}">
      <div class="rc-cover" style="background:${r.color}"><span class="mono">${esc(r.category)}</span></div>
      <h3 class="h3">${esc(r.title)}</h3><span class="mono rc-meta">${esc(r.date)} · ${esc(r.readTime)}</span>
    </a>`).join('');

  const html = `
    <div class="reading-progress" id="reading-progress"></div>
    <article class="article" id="article">
      <header class="article-head container-narrow">
        <a class="back-link mono reveal" href="#/blog">← Writing</a>
        <p class="eyebrow reveal">${esc(a.category)}</p>
        <h1 class="article-h1 reveal">${esc(a.title)}</h1>
        <p class="lede reveal">${esc(a.deck)}</p>
        <div class="article-byline reveal"><span class="author-avatar">B</span><div><strong>${esc(PROFILE.name)}</strong><span class="mono byline-meta"> · ${esc(a.date)} · ${esc(a.readTime)}</span></div></div>
      </header>
      <div class="article-cover reveal" style="background:${a.color}"><span class="mono">¶ ${esc(a.readTime)}</span></div>
      <div class="container-narrow prose article-prose reveal">
        ${body}
        <hr class="prose-rule" />
        <p class="prose-footer mono">This is a working note — the full essay is on its way. Reach out on <a href="${PROFILE.linkedin}" target="_blank" rel="noopener">LinkedIn</a> if you’d like the long version early.</p>
      </div>
    </article>
    <section class="section related">
      <div class="container">
        ${eyebrow('Keep reading')}
        <div class="related-grid">${rel}</div>
      </div>
    </section>`;

  return { html, label: 'Article', route: 'blog', onMount: (ctx) => ctx.initReadingProgress() };
}

// ═══ ABOUT ═══════════════════════════════════════════════════════════════════
export function renderAbout() {
  const values = VALUES.map((v) => `
    <div class="value reveal"><span class="mono value-n">${v.n}</span><h3 class="h3 value-t">${esc(v.t)}</h3><p class="value-b">${esc(v.b)}</p></div>`).join('');
  const exp = EXPERIENCE.slice().reverse().map((e) => `
    <li class="exp-row reveal"><span class="mono exp-years">${esc(e.years)}</span>
      <div class="exp-main"><h3 class="h3 exp-role">${esc(e.role)} <span class="exp-org">/ ${esc(e.org)}</span></h3><p class="exp-note">${esc(e.note)}</p></div></li>`).join('');
  const stack = STACK.map((s) => `
    <div class="stack-col"><span class="mono">${esc(s.label)}</span><ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('');

  const html = `
    <section class="section page-head about-head">
      <div class="container about-head-grid">
        <div>
          ${eyebrow('About · Bala Kumaran')}
          <h1 class="s-title xl reveal">Head of Product Design — design systems, payments, and AI-augmented craft.</h1>
          <p class="lede reveal">Fourteen years turning ambiguous product problems into shipped, measurable interfaces — from a one-person design function to a team of eighteen.</p>
        </div>
        <div class="about-portrait reveal"><span class="mono">Kochi → Dubai</span></div>
      </div>
    </section>

    <section class="section pt0"><div class="container-narrow prose about-bio reveal">
      <p class="dropcap">I design at the seams — where a design system meets twenty-five bank brands, where a checkout meets a failing payment, where a Claude pipeline meets a designer’s afternoon of repetitive work. The common thread across fourteen years is a stubborn question: does this design actually move a number?</p>
      <p>I’ve built the design function at Hatio · BillDesk from a single hire to a peak of eighteen, founded a multi-tenant design system running at national-bank scale, and led the Payment Gateway SDK that now sits inside a super-app handling 30,000+ transactions a minute. Lately, much of my energy goes into AI-augmented design ops — compressing the careful, repetitive parts of the job from days into minutes.</p>
      <p>I’m relocating from Kochi to Dubai and open to Head / Lead Product Design roles. If your team cares about both craft and conversion — which, in my experience, are the same problem seen from two sides — let’s talk.</p>
    </div></section>

    <section class="section bordered">
      <div class="container">
        ${eyebrow('How I work')}
        <h2 class="s-title reveal" style="margin-bottom:56px">Four operating principles.</h2>
        <div class="values-grid">${values}</div>
      </div>
    </section>

    <section class="section bordered">
      <div class="container">
        ${eyebrow('CV · The short version')}
        <h2 class="s-title reveal" style="margin-bottom:48px">Where I’ve worked.</h2>
        <ul class="exp-list">${exp}</ul>
      </div>
    </section>

    <section class="section bordered">
      <div class="container stack-grid">
        <div>${eyebrow('Tools I reach for')}<h2 class="s-title reveal">The working stack.</h2></div>
        <div class="stack-cols">${stack}</div>
      </div>
    </section>`;

  return { html, label: 'About', route: 'about', onMount: () => {} };
}

// ═══ CONTACT ═════════════════════════════════════════════════════════════════
export function renderContact() {
  const html = `
    <section class="section page-head contact-head">
      <div class="container">
        ${eyebrow('Contact · Open to Dubai roles')}
        <h1 class="s-title xl reveal">Let’s talk about the role.</h1>
        <p class="lede reveal">I’m relocating to Dubai and open to Head / Lead Product Design positions. Tell me about the team, the product, and the number you’re trying to move.</p>
      </div>
    </section>
    <section class="section pt0"><div class="container contact-grid">
      <form class="contact-form reveal" id="contact-form">
        <div class="form-row two">
          <label><span class="mono">Your name</span><input name="name" required placeholder="Jane Doe" /></label>
          <label><span class="mono">Email</span><input name="email" type="email" required placeholder="jane@company.com" /></label>
        </div>
        <label><span class="mono">Company / team</span><input name="company" placeholder="Acme" /></label>
        <label><span class="mono">What’s the role?</span>
          <div class="radio-row">
            ${['Head of Design', 'Lead Product Designer', 'Design Systems', 'Just exploring'].map((r, i) =>
              `<button type="button" class="radio-pill${i === 0 ? ' active' : ''}" data-val="${r}">${r}</button>`).join('')}
          </div>
        </label>
        <label><span class="mono">Tell me about it</span><textarea name="message" rows="6" required placeholder="The team, the product, the problem, what success looks like."></textarea></label>
        <div class="form-foot"><button class="btn btn-accent" type="submit">Send message →</button><span class="mono">I reply within 2 working days.</span></div>
      </form>
      <aside class="contact-aside reveal">
        <div class="aside-card"><span class="mono">Direct</span>
          <a class="aside-link" href="mailto:${PROFILE.email}">${PROFILE.email}</a>
          <a class="aside-link" href="${PROFILE.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
        </div>
        <div class="aside-card"><span class="mono">Currently</span>
          <div class="aside-status"><span class="status-dot"></span>${esc(PROFILE.status)}</div>
          <p class="aside-note">${esc(PROFILE.location)} · ${esc(PROFILE.availability)}.</p>
        </div>
        <div class="aside-card"><span class="mono">How this goes</span>
          <ol class="aside-list"><li>You send a message.</li><li>We talk for thirty minutes.</li><li>I share work &amp; references.</li><li>We take it from there.</li></ol>
        </div>
      </aside>
    </div></section>`;

  return { html, label: 'Contact', route: 'contact', onMount: () => {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.querySelectorAll('.radio-pill').forEach((b) => b.addEventListener('click', () => {
      form.querySelectorAll('.radio-pill').forEach((x) => x.classList.toggle('active', x === b));
    }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (form.querySelector('[name=name]').value || '').split(' ')[0] || 'thanks';
      form.innerHTML = `<div class="contact-success">
        <div class="success-glyph">✓</div>
        <h2 class="s-title">Got it, ${esc(name)}.</h2>
        <p class="lede">I read every message myself, usually within two working days. If it’s a fit, I’ll send a calendar link.</p>
        <a class="btn btn-primary" href="#/">Back to home</a>
      </div>`;
    });
  } };
}

// ═══ 404 ═════════════════════════════════════════════════════════════════════
export function renderNotFound() {
  return { html: `
    <section class="section page-head"><div class="container">
      ${eyebrow('404')}
      <h1 class="s-title xl reveal">That page moved.</h1>
      <p class="lede reveal">Let’s get you back on track.</p>
      <p style="margin-top:32px"><a class="btn btn-primary" href="#/">Home</a></p>
    </div></section>`, label: 'Not found', route: '', onMount: () => {} };
}
