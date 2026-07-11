// ═══════════════════════════════════════════════════════════════════════════
// router.js — hash resolver + the curtain-wipe transition primitive.
// Faithful to Portfolio Motion v3: a full-screen panel grows from the BOTTOM
// edge to cover the screen (with a destination caption), the route swaps behind
// it, then it retracts to the TOP edge to reveal — one continuous upward wipe.
// ═══════════════════════════════════════════════════════════════════════════
import {
  renderHome, renderWork, renderCase, renderBlog, renderArticle,
  renderAbout, renderContact, renderNotFound,
} from './pages.js';

// power4.inOut ≈ this cubic-bezier
const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';

const ROUTES = [
  { re: /^\/?$/,            fn: () => renderHome() },
  { re: /^\/work\/(.+)$/,   fn: (m) => renderCase(m[1]) },
  { re: /^\/work\/?$/,      fn: () => renderWork() },
  { re: /^\/blog\/(.+)$/,   fn: (m) => renderArticle(m[1]) },
  { re: /^\/blog\/?$/,      fn: () => renderBlog() },
  { re: /^\/about\/?$/,     fn: () => renderAbout() },
  { re: /^\/contact\/?$/,   fn: () => renderContact() },
];

export function resolve(hash) {
  const path = (hash || '').replace(/^#/, '') || '/';
  for (const r of ROUTES) {
    const m = path.match(r.re);
    if (m) return r.fn(m);
  }
  return renderNotFound();
}

// makeWipe returns cover()/reveal() promises driving the panel + caption.
// Each phase resolves on animation-finish OR a hard fallback timer, so a
// stalled/throttled animation can never trap the page behind the panel.
export function makeWipe({ wrap, panel, label }) {
  let a = null;

  const settle = (anim, fallbackMs, after) => new Promise((res) => {
    let done = false;
    const fin = () => { if (done) return; done = true; try { after(); } finally { res(); } };
    anim.finished.then(fin).catch(fin);
    setTimeout(fin, fallbackMs);
  });

  const cover = (text) => {
    if (a) a.cancel();
    wrap.style.visibility = 'visible';
    label.textContent = text || '';
    panel.style.transformOrigin = '50% 100%';
    a = panel.animate(
      [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
      { duration: 550, easing: EASE, fill: 'forwards' },
    );
    label.animate(
      [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 300, delay: 300, easing: 'ease-out', fill: 'forwards' },
    );
    return settle(a, 750, () => { panel.style.transform = 'scaleY(1)'; if (a) a.cancel(); a = null; });
  };

  const reveal = () => {
    if (a) a.cancel();
    panel.style.transformOrigin = '50% 0%';
    label.animate(
      [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-10px)' }],
      { duration: 250, delay: 60, easing: 'ease-in', fill: 'forwards' },
    );
    a = panel.animate(
      [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
      { duration: 600, delay: 100, easing: EASE, fill: 'forwards' },
    );
    return settle(a, 900, () => {
      panel.style.transform = 'scaleY(0)';
      wrap.style.visibility = 'hidden';
      if (a) a.cancel(); a = null;
    });
  };

  return { cover, reveal };
}
