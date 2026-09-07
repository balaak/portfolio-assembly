// ═══════════════════════════════════════════════════════════════════════════
// motion.js — dependency-free motion layer (vanilla, matches v3 behaviour).
// mount(scope) runs per route; boot* helpers run once globally.
// ═══════════════════════════════════════════════════════════════════════════
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;

// ── reveals (per route) ──────────────────────────────────────────────────────
function initReveals(scope) {
  const els = scope.querySelectorAll('.reveal:not(.in)');
  if (reduce) { els.forEach((el) => el.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.14 });
  els.forEach((el) => io.observe(el));
}

// ── lazy media (per route) ───────────────────────────────────────────────────
// Case pages carry up to nine clips. Fetching them all on mount saturates the
// browser's concurrent-media cap, so the tail never starts loading. Each video
// ships as data-src and only fetches once it nears the viewport; clips that
// scroll well clear of it pause to free a decoder.
function initLazyMedia(scope) {
  const vids = scope.querySelectorAll('video[data-src]');
  if (!vids.length) return;
  const load = (v) => {
    if (!v.dataset.src) return;
    v.src = v.dataset.src;
    delete v.dataset.src;
    v.preload = 'auto';
  };
  const play = (v) => { if (!reduce) v.play?.().catch(() => {}); };
  if (!('IntersectionObserver' in window)) { vids.forEach((v) => { load(v); play(v); }); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { load(v); play(v); }
      else if (!v.paused) v.pause();
    });
  }, { rootMargin: '300px 0px', threshold: 0.01 });
  vids.forEach((v) => io.observe(v));
}

// ── stat counters (per route) ────────────────────────────────────────────────
function initCounters(scope) {
  const pureSuf = (s) => /^[+%]?$/.test(s);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      const el = e.target, target = +el.dataset.target, suf = el.dataset.suffix || '';
      const show = (v) => (v >= 1000 ? v.toLocaleString() : String(v).padStart(pureSuf(suf) && target < 100 ? 2 : 1, '0')) + suf;
      if (reduce) { el.textContent = show(target); return; }
      const t0 = performance.now(), D = 1500, ease = (t) => 1 - Math.pow(1 - t, 3);
      (function tick(now) {
        const p = Math.min((now - t0) / D, 1);
        el.textContent = show(Math.round(ease(p) * target));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.5 });
  scope.querySelectorAll('.stat-num').forEach((el) => io.observe(el));
}

// ── velocity-reactive marquee (per route) ────────────────────────────────────
// Speed is driven via WAAPI playbackRate, not animation-duration: changing
// duration on a running CSS animation keeps elapsed time and recomputes
// progress as elapsed/newDuration, which teleports the track every scroll
// frame. playbackRate changes are continuous — same position, new speed.
function initMarquee(scope, signal) {
  const track = scope.querySelector('.marquee-track');
  if (!track || reduce) return;
  const anim = track.getAnimations()[0];
  if (!anim) return;

  let last = window.scrollY, target = 1, rate = 1, raf = null;

  const onScroll = () => {
    const v = Math.abs(window.scrollY - last);
    last = window.scrollY;
    target = Math.min(3.5, 1 + v * 0.06);
    if (!raf) raf = requestAnimationFrame(loop);
  };

  const loop = () => {
    rate += (target - rate) * 0.12;        // critically damped ease toward target
    anim.playbackRate = rate;
    target += (1 - target) * 0.05;         // decay back to 1x on its own
    if (Math.abs(rate - 1) > 0.01) raf = requestAnimationFrame(loop);
    else { anim.playbackRate = 1; raf = null; }
  };

  window.addEventListener('scroll', onScroll, { passive: true, signal });
}

// ── process step rail (home) ─────────────────────────────────────────────────
export function initProcess() {
  const card = {
    num: document.getElementById('proc-num'),
    bar: document.getElementById('proc-bar'),
    now: document.getElementById('proc-now'),
  };
  if (!card.num) return;
  const steps = [...document.querySelectorAll('.step')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const s = e.target;
      steps.forEach((x) => x.classList.toggle('dim', x !== s));
      const n = +s.dataset.step;
      card.num.textContent = String(n).padStart(2, '0');
      card.bar.style.width = (n / steps.length * 100) + '%';
      card.now.textContent = s.dataset.name;
    });
  }, { threshold: 0.6, rootMargin: '-20% 0px -30% 0px' });
  steps.forEach((s) => io.observe(s));
}

// ── timeline: vertical wheel → horizontal (home) ─────────────────────────────
export function initTimeline() {
  const tl = document.getElementById('timeline');
  if (!tl) return;
  tl.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { tl.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });
}

// ── article reading progress (article) ───────────────────────────────────────
export function initReadingProgress() {
  const bar = document.getElementById('reading-progress');
  const article = document.getElementById('article');
  if (!bar || !article) return;
  const onScroll = () => {
    const rect = article.getBoundingClientRect();
    const total = article.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    bar.style.transform = `scaleX(${total > 0 ? scrolled / total : 0})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

// ── magnetic buttons (per route, pointer:fine only) ──────────────────────────
function initMagnetic(scope) {
  if (!finePointer || reduce) return;
  scope.querySelectorAll('.btn, .theme-btn, .magnetic, .next-cta').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.26;
      const y = (e.clientY - r.top - r.height / 2) * 0.26;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// ── custom cursor (once, global) ─────────────────────────────────────────────
export function bootCursor() {
  if (!finePointer || reduce) return;
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  document.documentElement.classList.add('has-cursor');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
  (function loop() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();
  // hover states via delegation (survives route swaps)
  const HOVER = 'a, button, .work-card, .work-row, .post, .article-row, .chip-filter, .radio-pill';
  const LABEL = '.work-card, .work-row, .post, .article-row, .next-cta';
  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest(HOVER);
    ring.classList.toggle('hover', !!t);
    ring.classList.toggle('label', !!(t && t.closest(LABEL)));
  });
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest?.(HOVER)) { ring.classList.remove('hover', 'label'); }
  });
  document.addEventListener('mousedown', () => ring.classList.add('down'));
  document.addEventListener('mouseup', () => ring.classList.remove('down'));
}

// ── name letter-roll on hover (once, global) ─────────────────────────────────
// Splits every .brand-name on the page — the nav wordmark and the footer
// signature — so both carry the same moment.
//
// Each letter sits in a 1em window over a stack of five identical glyphs, resting
// on the middle one. Hovering travels two glyph-heights — odd letters up, even
// letters down, so neighbours always counter-rotate — and un-hovering travels back
// the way it came. Every stop is the same glyph, so the name only ever appears to
// scroll through itself.
//
// Timing is lifted off the Framer original (57fps capture, six hover cycles,
// letter-by-letter vertical tracking): the settle is a first-order exponential
// with tau = 108ms, and each letter carries its own fixed head-start delay.
// ROLL_DELAYS are those measured values, in letter order, for "Bala Kumaran".
const ROLL_COPIES = 5;
const ROLL_REST = 2;                                     // index of the resting glyph
const ROLL_DELAYS = [1, 3, 25, 0, 105, 105, 10, 3, 3, 12, 124];

export function bootBrandRoll() {
  if (reduce || !finePointer) return;
  document.querySelectorAll('.brand-name').forEach(splitName);
}

function splitName(name) {
  const text = name.textContent;
  name.textContent = '';
  name.setAttribute('aria-label', text);

  let letter = 0;
  [...text].forEach((ch) => {
    if (ch === ' ') { name.appendChild(document.createTextNode(' ')); return; }
    const mask = document.createElement('span');
    mask.className = 'roll';
    mask.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.className = 'roll-i';
    for (let i = 0; i < ROLL_COPIES; i++) {
      const glyph = document.createElement('span');
      glyph.textContent = ch;
      inner.appendChild(glyph);
    }
    // even letters roll up, odd letters roll down — the two land on the glyph two
    // rows either side of the resting one
    const up = letter % 2 === 0;
    inner.style.setProperty('--to', (up ? -(ROLL_REST + 2) : -(ROLL_REST - 2)) + 'em');
    inner.style.transitionDelay = ROLL_DELAYS[letter % ROLL_DELAYS.length] + 'ms';
    letter += 1;
    mask.appendChild(inner);
    name.appendChild(mask);
  });
}

// ── top scroll-progress hairline (once, global) ──────────────────────────────
export function bootScrollProgress() {
  const bar = document.getElementById('progress');
  if (!bar) return;
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h * 100) : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

// ── work-list hover: the cover card follows the cursor ───────────────────────
// One rAF loop for the whole list, running only while a row is hovered. Each
// row's card eases toward the pointer instead of snapping to it — a plain lerp
// per frame, which settles like a critically-damped spring with no overshoot.
// Pointer-only: on touch there is no hover state to drive it, and the card
// would just sit invisible.
function initWorkHover(scope) {
  const rows = scope.querySelectorAll('.work-row');
  if (!rows.length || reduce || !finePointer) return;

  let active = null;   // the row under the cursor
  let raf = 0;
  const at = { x: 0, y: 0 };   // where the card is now (0..1 of the row box)
  const to = { x: 0.5, y: 0.5 };  // where the cursor is

  // These rows carry a full summary line, not just a heading, so a card free to
  // roam the whole width parks on top of the copy. It tracks the cursor within
  // the right-hand band instead — still trailing, never over the sentence.
  const X_MIN = 0.62, X_MAX = 0.98;
  const clampX = (v) => Math.min(X_MAX, Math.max(X_MIN, v));

  // How hard the card chases the cursor each frame. Higher tracks tighter;
  // at 0.14 it sat almost on the pointer, which killed the sense of the card
  // having any weight. 0.07 lets it lag half a beat behind and coast in.
  const EASE = 0.07;

  const frame = () => {
    at.x += (to.x - at.x) * EASE;
    at.y += (to.y - at.y) * EASE;
    if (active) {
      const card = active.querySelector('.wr-float');
      if (card) {
        card.style.left = (at.x * 100) + '%';
        card.style.top = (at.y * 100) + '%';
      }
    }
    // Keep running one beat past the settle so the card lands rather than
    // freezing a pixel short of the cursor.
    if (active || Math.abs(to.x - at.x) > 0.001 || Math.abs(to.y - at.y) > 0.001) {
      raf = requestAnimationFrame(frame);
    } else { raf = 0; }
  };

  rows.forEach((row) => {
    // Real cover art where a project has it; otherwise the card keeps the
    // gradient-and-initial treatment the small thumb already uses. No stock
    // photography — a placeholder image next to a named client reads as if it
    // were that client's work.
    const card = row.querySelector('.wr-float');
    if (card && card.dataset.thumb) {
      card.style.backgroundImage = `url("${card.dataset.thumb}")`;
      card.classList.add('has-thumb');
    }

    row.addEventListener('pointerenter', (e) => {
      active = row;
      // Start the card where the cursor entered, so it grows from under the
      // pointer instead of flying in from the row's centre.
      const r = row.getBoundingClientRect();
      at.x = to.x = clampX((e.clientX - r.left) / r.width);
      at.y = to.y = (e.clientY - r.top) / r.height;
      if (!raf) raf = requestAnimationFrame(frame);
    });

    row.addEventListener('pointermove', (e) => {
      const r = row.getBoundingClientRect();
      to.x = clampX((e.clientX - r.left) / r.width);
      to.y = (e.clientY - r.top) / r.height;
    });

    row.addEventListener('pointerleave', () => { if (active === row) active = null; });
  });
}

// ── per-route entry point ────────────────────────────────────────────────────
// scope (the #app element) survives every route swap, only its innerHTML is
// replaced — so a controller stashed on it persists across mount() calls and
// lets each new mount tear down the previous route's window-level listeners
// before attaching its own.
// ── auto-scrolling pills (per route) ─────────────────────────────────────────
// The practice pills sit in equal-width cards, so a long label (e.g. the
// four-domain tag on card 02) would overflow its slot. We wrap each label in a
// two-copy .pill-run and toggle .is-scroll only on pills whose label is wider
// than its slot at the current width — a seamless marquee via translateX(-50%).
// Non-overflowing pills stay static; under reduced-motion the CSS wraps instead.
function initPillMarquee(scope, signal) {
  const pills = [...scope.querySelectorAll('.practice .pill')];
  if (!pills.length) return;

  pills.forEach((pill) => {
    const label = pill.textContent.trim();
    const run = document.createElement('span');
    run.className = 'pill-run';
    const a = document.createElement('span');
    a.className = 'pill-seg';
    a.textContent = label;
    const b = a.cloneNode(true);
    b.setAttribute('aria-hidden', 'true');
    run.append(a, b);
    pill.textContent = '';
    pill.appendChild(run);
    pill.__seg = a;
  });

  const evaluate = () => {
    pills.forEach((pill) => {
      const seg = pill.__seg;
      // seg is display:inline-block; its scrollWidth is the label's intrinsic
      // width. Compare against the pill's content box.
      const overflow = seg.scrollWidth > pill.clientWidth + 1;
      pill.classList.toggle('is-scroll', overflow);
      if (overflow && !reduce) {
        const unit = pill.__seg.offsetWidth;      // one copy incl. trailing gap
        const dur = Math.max(6, unit / 34);        // ~34px/s, min 6s
        pill.style.setProperty('--pill-dur', `${dur.toFixed(1)}s`);
      } else {
        pill.style.removeProperty('--pill-dur');
      }
    });
  };

  // measure after layout settles
  requestAnimationFrame(evaluate);
  let raf = null;
  window.addEventListener('resize', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = null; evaluate(); });
  }, { passive: true, signal });
}

export function mount(scope) {
  scope.__motionAbort?.abort();
  const ac = new AbortController();
  scope.__motionAbort = ac;

  initReveals(scope);
  initLazyMedia(scope);
  initCounters(scope);
  initMarquee(scope, ac.signal);
  initPillMarquee(scope, ac.signal);
  initMagnetic(scope);
  initWorkHover(scope);
}
