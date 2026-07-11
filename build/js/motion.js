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
function initMarquee(scope) {
  const track = scope.querySelector('.marquee-track');
  if (!track || reduce) return;
  let last = window.scrollY, idle;
  const onScroll = () => {
    const v = Math.abs(window.scrollY - last); last = window.scrollY;
    const dur = Math.max(12, 42 - v * 0.8);
    track.style.animationDuration = dur + 's';
    clearTimeout(idle);
    idle = setTimeout(() => { track.style.animationDuration = '42s'; }, 220);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
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

// ── per-route entry point ────────────────────────────────────────────────────
export function mount(scope) {
  initReveals(scope);
  initCounters(scope);
  initMarquee(scope);
  initMagnetic(scope);
}
