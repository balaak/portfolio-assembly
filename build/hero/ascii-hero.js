/*
  ascii.js — real-time image→ASCII renderer (WebGL2)
  ---------------------------------------------------
  A faithful, reusable re-implementation of the vshslv.com hero effect:
  a source image is redrawn as a grid of monospace glyphs whose density
  follows luminance, and whose fill colour is the source pixel itself
  (so it reads as a *photograph made of type*, not green terminal text).

  A cursor "gravity lens" warps WHICH source cell each glyph samples
  (never the glyph's position — so the grid stays perfectly inked),
  producing the magnetic pull around the pointer.

  Zero dependencies. One entry point:

      const r = createAscii(canvas, source, opts);
      r.setSource(imgOrCanvasOrVideo);   // swap the picture live
      r.setMix(0..1);                    // 0 = clean photo, 1 = full ASCII
      r.reveal();                        // re-run the develop-from-black
      r.destroy();

  `source` may be an HTMLImageElement / HTMLCanvasElement / HTMLVideoElement
  (already loaded), or you can pass null and call setSource() later.
*/

// Density ramp, darkest→lightest. Index 0 is treated as an empty (black) cell,
// exactly like the original. Lifted verbatim from vshslv so the tonal feel matches.
const DEFAULT_RAMP =
  "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

const DEFAULTS = {
  ramp: DEFAULT_RAMP,
  cellPx: 9,            // glyph cell height in CSS px (pre-DPR). Smaller = finer.
  font: 'ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Code", monospace',
  black: 0.16,         // luminance mapped to the darkest bucket
  white: 0.92,         // luminance mapped to the lightest bucket
  gamma: 1.25,         // >1 pushes detail into the shadows
  glyphBoost: 1.5,     // brightens the colour poured into each glyph
  lensRadius: 300,     // cursor gravity-lens reach, CSS px
  lensStrength: 1.8,   // cursor gravity-lens intensity
  lensDecay: 0.5,      // seconds for the lens to relax after the pointer stops
  dprCap: 2,           // clamp devicePixelRatio (retina is expensive)
  fps: 30,             // render cap; a still image barely needs any
  revealDur: 1.1,      // develop-from-black duration, seconds
  autoReveal: true,    // play the reveal automatically on first frame
  startMix: 1,         // initial state: 1 = ASCII, 0 = clean photo
  engageOnMove: false, // hero mode: sit on the photo, crossfade to ASCII while the pointer moves
  idleReturn: 1.2,     // seconds of stillness before easing back to the photo
};

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// Fragment shader is templated so the tuning constants compile in as literals.
const frag = (o) => `#version 300 es
precision highp float;
uniform sampler2D uSrc;      // source picture
uniform sampler2D uAtlas;    // glyph atlas: RAMP.length cells wide
uniform vec2  uResolution;   // device px
uniform vec2  uCell;         // cellW, cellH in device px
uniform vec2  uOffset;       // object-fit: cover crop origin (source UV)
uniform vec2  uScale;        // object-fit: cover crop size (source UV)
uniform vec2  uCursor;       // pointer in device px, top-left origin (-1 = none)
uniform float uRampLen;
uniform float uRadius;       // lens reach, device px
uniform float uLens;         // lens strength
uniform float uLensMul;      // 0..1 lens envelope (fades out when idle)
uniform float uMix;          // 0 = clean photo, 1 = ASCII
uniform float uHaveFrame;    // 0 until a source texture exists
uniform float uReveal;       // 0..1 first-load develop
out vec4 o;

const float BLACK_POINT = ${(+o.black).toFixed(4)};
const float WHITE_POINT = ${(+o.white).toFixed(4)};
const float GAMMA       = ${(+o.gamma).toFixed(4)};
const float GLYPH_BOOST = ${(+o.glyphBoost).toFixed(4)};
const vec3  LUMA = vec3(0.299, 0.587, 0.114);

// Gravity lens — warps which source cell is sampled, never the glyph slot,
// so the character grid stays fully inked while the image bends toward the cursor.
vec2 lens(vec2 center) {
  if (uCursor.x < 0.0 || uLensMul <= 0.0) return center;
  vec2 v = center - uCursor;
  float d = length(v);
  if (d >= uRadius) return center;
  float f = 1.0 - d / uRadius;
  return uCursor + v * (1.0 + f * f * uLens * uLensMul);
}

vec3 sampleSrc(vec2 screenUV) {
  return texture(uSrc, uOffset + clamp(screenUV, 0.0, 1.0) * uScale).rgb;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y); // top-left origin
  if (uHaveFrame < 0.5) { o = vec4(0.0, 0.0, 0.0, 1.0); return; }

  // clean, un-warped per-pixel photo — the base layer AND the glyph fill colour
  vec3 srcPix = sampleSrc(frag / uResolution);

  // glyph CHOICE — luminance of the lens-warped cell, box-averaged with a 2x2 tap
  vec2 cell   = floor(frag / uCell);
  vec2 center = (cell + 0.5) * uCell;
  vec2 wc     = lens(center);
  vec2 q      = uCell * 0.25;
  float lum = 0.25 * (
    dot(sampleSrc((wc + vec2(-q.x,-q.y)) / uResolution), LUMA) +
    dot(sampleSrc((wc + vec2( q.x,-q.y)) / uResolution), LUMA) +
    dot(sampleSrc((wc + vec2(-q.x, q.y)) / uResolution), LUMA) +
    dot(sampleSrc((wc + vec2( q.x, q.y)) / uResolution), LUMA)
  );

  float b = (lum - BLACK_POINT) / (WHITE_POINT - BLACK_POINT);
  float cover = 0.0;
  if (b > 0.0) {
    float idx = floor(pow(clamp(b, 0.0, 1.0), GAMMA) * (uRampLen - 1.0) + 0.5);
    vec2 inCell = fract(frag / uCell);
    cover = texture(uAtlas, vec2((idx + inCell.x) / uRampLen, inCell.y)).a;
  }

  vec3 ascii = srcPix * GLYPH_BOOST * cover;   // photo colour inside glyphs, black gaps
  vec3 col   = mix(srcPix, ascii, uMix);        // crossfade photo <-> ascii
  o = vec4(col * uReveal, 1.0);                 // reveal lifts up from black
}`;

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeInCubic = (t) => t * t * t;

export function createAscii(canvas, source, userOpts = {}) {
  const opts = { ...DEFAULTS, ...userOpts };
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    premultipliedAlpha: false,
    alpha: false,
  });
  if (!gl) {
    console.warn('[ascii] WebGL2 unavailable — falling back to plain image.');
    return fallback(canvas, source);
  }

  // ---- program ----
  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('[ascii] shader error:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, frag(opts));
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('[ascii] link error:', gl.getProgramInfoLog(prog));
    return fallback(canvas, source);
  }
  gl.useProgram(prog);
  gl.bindVertexArray(gl.createVertexArray()); // empty VAO for the attribute-less draw

  const U = (n) => gl.getUniformLocation(prog, n);
  const u = {
    resolution: U('uResolution'), cell: U('uCell'),
    offset: U('uOffset'), scale: U('uScale'),
    cursor: U('uCursor'), radius: U('uRadius'),
    lens: U('uLens'), lensMul: U('uLensMul'),
    mix: U('uMix'), haveFrame: U('uHaveFrame'), reveal: U('uReveal'),
  };
  gl.uniform1i(U('uSrc'), 0);
  gl.uniform1i(U('uAtlas'), 1);
  gl.uniform1f(U('uRampLen'), opts.ramp.length);
  gl.uniform1f(u.lens, opts.lensStrength);

  // ---- glyph atlas ----
  const atlasTex = gl.createTexture();
  let dpr = 1, cellW = 1, cellH = 1;
  function buildAtlas() {
    dpr = Math.min(window.devicePixelRatio || 1, opts.dprCap);
    cellH = Math.max(1, Math.round(opts.cellPx * dpr));
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    g.font = `${opts.cellPx * dpr}px ${opts.font}`;
    cellW = Math.max(1, Math.round(g.measureText('M').width));
    c.width = cellW * opts.ramp.length;
    c.height = cellH;
    g.font = `${opts.cellPx * dpr}px ${opts.font}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#fff';
    // skip index 0 -> darkest bucket renders as an empty (black) cell
    for (let i = 1; i < opts.ramp.length; i++) {
      g.fillText(opts.ramp[i], i * cellW + cellW / 2, cellH / 2);
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform2f(u.cell, cellW, cellH);
  }

  // ---- source texture ----
  const srcTex = gl.createTexture();
  let srcW = 0, srcH = 0, haveFrame = false, isVideo = false;
  function setSource(el) {
    if (!el) return;
    isVideo = typeof HTMLVideoElement !== 'undefined' && el instanceof HTMLVideoElement;
    const w = el.videoWidth || el.naturalWidth || el.width;
    const h = el.videoHeight || el.naturalHeight || el.height;
    if (!w || !h) return;
    current = el; srcW = w; srcH = h;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, srcTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el);
    } catch (e) {
      console.error('[ascii] texture upload failed (CORS?):', e);
      return;
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    haveFrame = true;
    updateCover();
    kick();
  }
  let current = null;

  // object-fit: cover — fold the crop into source UV so any aspect fills the canvas
  function updateCover() {
    if (!srcW || !srcH) return;
    const scale = Math.max(canvas.width / srcW, canvas.height / srcH);
    const cw = canvas.width / scale, ch = canvas.height / scale;
    gl.uniform2f(u.offset, (srcW - cw) / 2 / srcW, (srcH - ch) / 2 / srcH);
    gl.uniform2f(u.scale, cw / srcW, ch / srcH);
  }

  // ---- sizing ----
  function resize() {
    buildAtlas();
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.resolution, canvas.width, canvas.height);
    gl.uniform1f(u.radius, opts.lensRadius * dpr);
    updateCover();
    if (isVideo && current) setSource(current); // re-upload dims may have changed
    kick();
  }

  // ---- cursor gravity lens + engage-on-move ----
  let curX = -1, curY = -1, lensMul = 0, lensTarget = 0, idleTimer = 0;
  function onMove(e) {
    if (!enabled) return;
    const r = canvas.getBoundingClientRect();
    curX = (e.clientX - r.left) * dpr;
    curY = (e.clientY - r.top) * dpr;
    lensTarget = 1;
    lensMul = 1;
    if (opts.engageOnMove) {                 // reveal ASCII while the pointer moves…
      mixTarget = 1;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { mixTarget = 0; kick(); }, opts.idleReturn * 1000); // …ease back when still
    }
    kick();
  }
  function onLeave() { lensTarget = 0; kick(); }

  // ---- reveal (develop up from black; holds black until armed) ----
  let revealStart = -1, revealDone = false, revealArmed = !!opts.autoReveal;
  function reveal() { revealArmed = true; revealStart = -1; revealDone = false; kick(); }

  // ---- mix (clean photo <-> ascii) ----
  let mixVal = opts.startMix, mixTarget = mixVal;
  function setMix(v, instant = false) {
    mixTarget = clamp01(v);
    if (instant) mixVal = mixTarget;
    kick();
  }

  // ---- render loop (idle-stops; a still image needs no steady redraw) ----
  let running = false, raf = 0, lastFrame = 0, enabled = true;
  const minDelta = 1000 / opts.fps;
  function kick() {
    if (enabled && !running) { running = true; lastFrame = 0; raf = requestAnimationFrame(loop); }
  }
  function loop(t) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (t - lastFrame < minDelta) return;
    const dt = lastFrame ? (t - lastFrame) / 1000 : minDelta / 1000;
    lastFrame = t;

    // reveal envelope — hold black until armed, then develop up to 1
    let rev = 1;
    if (!haveFrame || !revealArmed) {
      rev = 0;
    } else if (!revealDone) {
      if (revealStart < 0) revealStart = t;
      const p = clamp01((t - revealStart) / (opts.revealDur * 1000));
      rev = easeInCubic(p);
      if (p >= 1) revealDone = true;
    }

    // lens envelope — exponential relax toward 0 once the pointer goes idle
    if (lensTarget === 0 && lensMul > 0) {
      lensMul *= Math.exp((-dt / Math.max(1e-4, opts.lensDecay)) * 3);
      if (lensMul < 0.002) lensMul = 0;
    }

    // mix easing
    if (Math.abs(mixVal - mixTarget) > 0.001) mixVal += (mixTarget - mixVal) * Math.min(1, dt * 8);
    else mixVal = mixTarget;

    gl.uniform1f(u.haveFrame, haveFrame ? 1 : 0);
    gl.uniform1f(u.reveal, rev);
    gl.uniform2f(u.cursor, curX, curY);
    gl.uniform1f(u.lensMul, lensMul);
    gl.uniform1f(u.mix, mixVal);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // halt once nothing is animating; setSource()/onMove()/setMix()/reveal() re-kick
    const animating =
      (haveFrame && revealArmed && !revealDone) || lensMul > 0 || mixVal !== mixTarget;
    if (!animating) { running = false; cancelAnimationFrame(raf); }
  }

  // ---- events + boot ----
  // Hero mode: always ASCII (mix stays at startMix). Desktop gets the cursor
  // gravity-lens; reduced-motion sits fully static; touch gets the one-shot
  // develop-from-black but no continuous warp.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  window.addEventListener('resize', resize);
  if (reduced) {
    revealArmed = true; revealDone = true;   // static ASCII — no develop, no warp
  } else if (!coarse) {
    window.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
  }

  resize();
  if (source) {
    if (typeof source === 'string') loadImage(source).then(setSource).catch(() => {});
    else setSource(source);
  }

  return {
    setSource,
    setMix,
    reveal,
    resize,
    getMix: () => mixTarget,
    setCell(px) { opts.cellPx = Math.max(3, px); resize(); },  // live glyph density
    getCell: () => opts.cellPx,
    setEnabled(on) {                 // pause/resume rendering (e.g. hero scrolled off-screen)
      enabled = !!on;
      if (enabled) kick();
      else { running = false; cancelAnimationFrame(raf); }
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    },
  };
}

// Load a URL into an Image (crossOrigin set so same-origin/CORS textures upload cleanly)
export function loadImage(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

// Graceful path if WebGL2 is missing: just paint the source into the canvas.
function fallback(canvas, source) {
  const ctx = canvas.getContext('2d');
  const draw = (el) => {
    if (!el || !ctx) return;
    const w = el.naturalWidth || el.width, h = el.naturalHeight || el.height;
    const s = Math.max(canvas.width / w, canvas.height / h);
    ctx.drawImage(el, (canvas.width - w * s) / 2, (canvas.height - h * s) / 2, w * s, h * s);
  };
  if (typeof source === 'string') loadImage(source).then(draw);
  else if (source) draw(source);
  return { setSource: draw, setMix() {}, reveal() {}, resize() {}, getMix: () => 0, destroy() {} };
}
