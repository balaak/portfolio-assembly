// ═══════════════════════════════════════════════════════════════════════════
// app.js — the conductor. Boots globals, wires the hash-router to the curtain
// transition, and re-mounts the bespoke ASCII hero on the home route.
// ═══════════════════════════════════════════════════════════════════════════
import { resolve, makeWipe } from './router.js';
import * as motion from './motion.js';
import { PROFILE } from './data.js';
import { createAscii, loadImage } from '../hero/ascii-hero.js';
import { makePlaceholder } from '../hero/placeholder.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const app = document.getElementById('app');
const wipe = makeWipe({
  wrap: document.getElementById('wipe'),
  panel: document.getElementById('wipe-panel'),
  label: document.getElementById('wipe-label'),
});

let lenis = null;
let preloaderDone = false;
let firstLoad = true;

// ── smooth scroll ─────────────────────────────────────────────────────────────
if (window.Lenis && !reduce) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
const scrollTop = () => { lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0); };

// ── nav ───────────────────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
const onNavScroll = () => { nav.classList.toggle('solid', window.scrollY > 40); };
window.addEventListener('scroll', onNavScroll, { passive: true });

function setNavActive(route) {
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });
}

// theme toggle
const THEME_KEY = 'bala-theme';
const root = document.documentElement;
root.setAttribute('data-theme', localStorage.getItem(THEME_KEY) || 'dark');
const syncThemeBtn = () => {
  const light = root.getAttribute('data-theme') === 'light';
  document.querySelectorAll('.theme-btn').forEach((b) => { b.textContent = light ? '☾' : '☀'; });
};
syncThemeBtn();
document.querySelectorAll('.theme-btn').forEach((b) => b.addEventListener('click', () => {
  const light = root.getAttribute('data-theme') === 'light';
  root.setAttribute('data-theme', light ? 'dark' : 'light');
  localStorage.setItem(THEME_KEY, light ? 'dark' : 'light');
  syncThemeBtn();
}));

// mobile drawer
const drawer = document.getElementById('drawer');
const trigger = document.getElementById('mobile-trigger');
const setDrawer = (open) => {
  drawer.classList.toggle('open', open);
  trigger.classList.toggle('is-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
trigger?.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
drawer?.addEventListener('click', (e) => { if (e.target.closest('a') || e.target.classList.contains('drawer-scrim')) setDrawer(false); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });

// ── ASCII hero (re-mounted per home visit) ────────────────────────────────────
function initHero() {
  const canvas = app.querySelector('.hero-ascii-bg');
  if (!canvas) return;
  loadImage('./hero/portrait.jpg').catch(() => makePlaceholder()).then((src) => {
    const hero = createAscii(canvas, src, { startMix: 0, engageOnMove: true, idleReturn: 1.2, autoReveal: false, cellPx: 9 });
    const heroEl = document.getElementById('hero');
    if ('IntersectionObserver' in window && heroEl) {
      new IntersectionObserver(([e]) => hero.setEnabled(e.isIntersecting), { threshold: 0 }).observe(heroEl);
    }
    if (preloaderDone) hero.reveal();
    else window.addEventListener('hero:enter', () => hero.reveal(), { once: true });
  });
}

const ctx = {
  initHero,
  initProcess: motion.initProcess,
  initTimeline: motion.initTimeline,
  initReadingProgress: motion.initReadingProgress,
};

// ── the route swap ────────────────────────────────────────────────────────────
function swap(page) {
  app.innerHTML = page.html;
  scrollTop();
  setNavActive(page.route);
  document.title = page.label === 'Home'
    ? `${PROFILE.name} — ${PROFILE.role}`
    : `${page.label} · ${PROFILE.name}`;
  page.onMount(ctx);
  motion.mount(app);
  onNavScroll();
}

async function go() {
  const page = resolve(location.hash);
  if (firstLoad || reduce) { swap(page); firstLoad = false; return; }
  await wipe.cover(page.label);
  swap(page);
  await wipe.reveal();
}
window.addEventListener('hashchange', go);

// ── preloader → boot ──────────────────────────────────────────────────────────
function finishPreloader() {
  preloaderDone = true;
  document.body.style.overflow = '';
  window.dispatchEvent(new Event('hero:enter'));
  onNavScroll();
}

function boot() {
  motion.bootCursor();
  motion.bootScrollProgress();
  go(); // first render (instant)

  const pre = document.getElementById('preloader');
  const countEl = document.getElementById('preloader-count');
  if (reduce || !pre) { if (pre) pre.style.display = 'none'; finishPreloader(); return; }

  document.body.style.overflow = 'hidden';
  const D = 1600, t0 = performance.now(), ease = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
  (function tick(now) {
    const p = Math.min((now - t0) / D, 1);
    countEl.textContent = Math.round(ease(p) * 100);
    if (p < 1) requestAnimationFrame(tick);
    else {
      countEl.textContent = '100';
      pre.style.opacity = '0';
      setTimeout(() => { pre.style.display = 'none'; finishPreloader(); }, 560);
    }
  })(t0);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
