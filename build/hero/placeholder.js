/*
  placeholder.js — a procedural, copyright-free stand-in "photo"
  -------------------------------------------------------------
  Draws a dramatic rim-lit sphere in volumetric smoke to an offscreen
  canvas and returns it. High contrast + midtone-heavy + a strong light
  direction — exactly the tonal recipe the ASCII ramp wants.

  Swap this out for one of Bala's real photos (drag-drop in the demo, or
  pass an <img> to createAscii). It only exists so the effect has something
  worthy to chew on before real assets arrive.
*/

export function makePlaceholder(w = 1600, h = 1000) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');

  // deterministic PRNG so the smoke looks the same every load
  let seed = 20260706;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // --- background: blue-tinted near-black, top→bottom ---
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#080c15');
  bg.addColorStop(1, '#04060b');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);

  const cx = w * 0.54, cy = h * 0.5, R = h * 0.34;

  // --- warm back-glow, upper-right (the implied light source) ---
  const glow = g.createRadialGradient(cx + R * 0.7, cy - R * 0.7, 0, cx + R * 0.7, cy - R * 0.7, R * 3);
  glow.addColorStop(0, 'rgba(255,150,74,0.55)');
  glow.addColorStop(0.4, 'rgba(196,92,40,0.22)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'screen';
  g.fillStyle = glow;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';

  // --- volumetric smoke: layered blurred blobs, warmer nearer the glow ---
  const drawSmoke = (count, band, blur, alpha, warm) => {
    g.save();
    g.globalCompositeOperation = 'screen';
    g.filter = `blur(${blur}px)`;
    for (let i = 0; i < count; i++) {
      const x = w * (0.1 + rnd() * 0.85);
      const y = cy + (rnd() - 0.5) * band;
      const rr = R * (0.25 + rnd() * 0.9);
      const warmth = warm * Math.max(0, 1 - Math.hypot(x - (cx + R), y - (cy - R)) / (R * 3));
      const rg = g.createRadialGradient(x, y, 0, x, y, rr);
      const base = 120 + rnd() * 60;
      const rC = Math.min(255, base + warmth * 120);
      const gC = Math.min(255, base + warmth * 40);
      const bC = Math.min(255, base + 30 - warmth * 30);
      rg.addColorStop(0, `rgba(${rC | 0},${gC | 0},${bC | 0},${alpha})`);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg;
      g.beginPath();
      g.arc(x, y, rr, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  };
  drawSmoke(26, h * 0.9, 34, 0.10, 1.0);   // soft haze bed
  drawSmoke(18, h * 0.7, 18, 0.13, 1.2);   // mid wisps
  drawSmoke(14, h * 0.5, 8,  0.10, 1.4);   // fine tendrils near the light

  // --- the sphere: key light from upper-right, deep terminator, cool fill ---
  g.save();
  g.beginPath();
  g.arc(cx, cy, R, 0, Math.PI * 2);
  g.clip();

  // body: offset radial from highlight → midtone → shadow
  const body = g.createRadialGradient(cx + R * 0.42, cy - R * 0.42, R * 0.05, cx, cy, R * 1.15);
  body.addColorStop(0.00, '#ffe6c2');
  body.addColorStop(0.16, '#ffb877');
  body.addColorStop(0.38, '#e07d33');
  body.addColorStop(0.62, '#7a3a1f');
  body.addColorStop(0.82, '#241a1c');
  body.addColorStop(1.00, '#0a0c12');
  g.fillStyle = body;
  g.fillRect(cx - R, cy - R, R * 2, R * 2);

  // cool bounce on the shadow side so it never crushes to pure black (keeps ASCII detail)
  const fill = g.createRadialGradient(cx - R * 0.5, cy + R * 0.55, 0, cx - R * 0.5, cy + R * 0.55, R * 1.3);
  fill.addColorStop(0, 'rgba(70,104,150,0.5)');
  fill.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'screen';
  g.fillStyle = fill;
  g.fillRect(cx - R, cy - R, R * 2, R * 2);
  g.globalCompositeOperation = 'source-over';
  g.restore();

  // --- cool rim light hugging the shadow edge (lower-left) ---
  g.save();
  g.globalCompositeOperation = 'screen';
  g.filter = 'blur(2px)';
  g.lineWidth = R * 0.05;
  const rim = g.createLinearGradient(cx - R, cy + R, cx + R * 0.2, cy - R * 0.2);
  rim.addColorStop(0, 'rgba(150,186,232,0.9)');
  rim.addColorStop(0.5, 'rgba(120,150,210,0.25)');
  rim.addColorStop(1, 'rgba(0,0,0,0)');
  g.strokeStyle = rim;
  g.beginPath();
  g.arc(cx, cy, R - g.lineWidth * 0.4, Math.PI * 0.35, Math.PI * 1.25);
  g.stroke();
  g.restore();

  // --- contact shadow / grounding under the sphere ---
  g.save();
  g.globalCompositeOperation = 'multiply';
  const grd = g.createRadialGradient(cx, cy + R * 1.05, 0, cx, cy + R * 1.05, R * 1.1);
  grd.addColorStop(0, 'rgba(0,0,0,0.6)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, cy, w, h - cy);
  g.restore();

  // --- vignette ---
  const vig = g.createRadialGradient(cx, cy, R * 0.8, cx, cy, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.72)');
  g.fillStyle = vig;
  g.fillRect(0, 0, w, h);

  // --- fine film grain (gives the ASCII extra tooth) ---
  // Rendered on a temp canvas then composited: putImageData ignores blend
  // modes/alpha, so we can't write it straight onto the scene.
  const gt = document.createElement('canvas');
  gt.width = w; gt.height = h;
  const gg = gt.getContext('2d');
  const grain = gg.createImageData(w, h);
  const d = grain.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = 110 + ((rnd() * 40) | 0);   // centred near neutral grey
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  gg.putImageData(grain, 0, 0);
  g.save();
  g.globalCompositeOperation = 'overlay';
  g.globalAlpha = 0.55;
  g.drawImage(gt, 0, 0);
  g.restore();

  return c;
}
