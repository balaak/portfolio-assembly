// Port of react-bits GradualBlur layer math -> static CSS.
const CURVES = {
  linear: p => p,
  bezier: p => p * p * (3 - 2 * p),
  'ease-in': p => p * p,
  'ease-out': p => 1 - Math.pow(1 - p, 2),
  'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
};
const DIRS = { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' };

export function layers({ position = 'top', strength = 2, divCount = 6, curve = 'bezier', exponential = false, opacity = 1 }) {
  const out = [];
  const increment = 100 / divCount;
  const curveFunc = CURVES[curve] || CURVES.linear;
  for (let i = 1; i <= divCount; i++) {
    const progress = curveFunc(i / divCount);
    const blur = exponential
      ? Math.pow(2, progress * 4) * 0.0625 * strength
      : 0.0625 * (progress * divCount + 1) * strength;
    const r = n => Math.round(n * 10) / 10;
    const p1 = r(increment * i - increment);
    const p2 = r(increment * i);
    const p3 = r(increment * i + increment);
    const p4 = r(increment * i + increment * 2);
    let g = `transparent ${p1}%, black ${p2}%`;
    if (p3 <= 100) g += `, black ${p3}%`;
    if (p4 <= 100) g += `, transparent ${p4}%`;
    out.push({ i, mask: `linear-gradient(${DIRS[position]}, ${g})`, blur: blur.toFixed(3), opacity });
  }
  return out;
}

const cfg = { position: 'bottom', strength: 2, divCount: 4, curve: 'bezier' };
for (const l of layers(cfg)) {
  console.log(`.gblur > :nth-child(${l.i}){--m:${l.mask};--b:${l.blur}rem}`);
}
