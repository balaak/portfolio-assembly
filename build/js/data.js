// ═══════════════════════════════════════════════════════════════════════════
// data.js — the single source of TRUE content (vetted job-hunt identity).
// Structure & motion are adopted from Portfolio Motion v3; content is Bala's
// real, verified résumé — NOT the v3 dummy "91 Pixels founder" identity.
// ═══════════════════════════════════════════════════════════════════════════

export const PROFILE = {
  name: 'Bala Kumaran',
  role: 'Head of Product Design',
  logo: 'Bala Kumaran',
  logoMono: '/ PD',
  status: 'Open to roles · Dubai',
  email: 'balaashokan@gmail.com',
  linkedin: 'https://www.linkedin.com/in/balakumaranux',
  location: 'Kochi → Dubai',
  availability: 'Relocating · 2-month notice',
};

export const MARQUEE = [
  'Design systems at scale',
  'Payments & product UX',
  'AI-augmented design',
  'Design leadership',
  'Conversion (CRO)',
  'Accessibility · WCAG 2.2',
  'Motion & prototyping',
];

export const PRACTICES = [
  { n: '01', t: 'Design systems at scale',
    d: 'Multi-tenant, atomic systems that skin one component set across many brands — governed, documented, and honest after I leave.',
    tag: 'National-bank scale' },
  { n: '02', t: 'Payments & product UX',
    d: 'End-to-end UX for fintech — checkout, onboarding, retry-and-fallback flows that quietly recover revenue.',
    tag: 'Fintech / payments' },
  { n: '03', t: 'AI-augmented design',
    d: 'Claude & GPT pipelines that compress concept-to-prototype and automate theming, accessibility audits, and onboarding.',
    tag: 'New for 2026' },
  { n: '04', t: 'Design leadership & CRO',
    d: 'Building and running design teams where every screen owes a hypothesis — and a number it moved.',
    tag: 'Team of 1 → 18' },
];

export const PROCESS = [
  { n: '01', name: 'Diagnose', week: 'Week 0–1',
    d: 'Analytics teardown, session recordings, and a hypothesis backlog. We agree on the number we’re moving before any pixels move.',
    tags: ['Audit', 'Hypotheses'] },
  { n: '02', name: 'Design', week: 'Week 1–3',
    d: 'Hi-fi flows in Figma and Framer, motion included. Real copy, real data — testable with real users by Friday.',
    tags: ['Figma', 'Framer', 'Motion'] },
  { n: '03', name: 'Systematize', week: 'Week 3–5',
    d: 'Tokens, components, and governance so the work survives me. Dev-ready handoff, semantic theming, states beyond the happy path.',
    tags: ['Tokens', 'Storybook', 'Governance'] },
  { n: '04', name: 'Ship & measure', week: 'Week 5–6',
    d: 'Accessibility pass, A/B in production, and the honest read afterward. The number either moved or it didn’t.',
    tags: ['A11y', 'A/B test'] },
];

export const NUMBERS = [
  { target: 14,   suffix: '+',     label: 'Years in UX' },
  { target: 3000, suffix: '+',     label: 'Components in the system' },
  { target: 9,    suffix: 'M+',    label: 'App downloads shipped' },
  { target: 30,   suffix: 'K/min', label: 'Live checkout throughput' },
];

// PROJECTS — real work. `body` paragraphs are faithful expansions of the
// verified summaries (no invented metrics). Replace/extend with full case
// studies when ready.
export const PROJECTS = [
  {
    slug: 'multi-brand-design-system',
    name: 'Multi-brand design system',
    initial: 'S', color: 'var(--accent)',
    kind: 'Design system · Fintech', year: '2020 — now',
    role: 'Founder & DS Lead', duration: '2020 — now', outcome: '3,000+ components',
    summary: 'Founded a multi-tenant system that skins one component set across 20–25 bank brands and five platforms. Brand swaps went from 2–3 days to under 10 minutes. ~9 of 10 products migrated.',
    tags: ['Design system', 'Tokens', 'Governance', 'Multi-tenant'],
    metrics: [
      { v: '3,000+', l: 'Components' },
      { v: '<10 min', l: 'Brand swap · was 2–3 days' },
      { v: '~9/10', l: 'Products migrated' },
    ],
    body: [
      'A single component set had to wear 20–25 different bank brands across five platforms — without forking, and without the design team becoming a bottleneck. The answer was semantic tokens: one atomic system, skinned per tenant.',
      'Governance was the real product. Documentation, contribution rules, and a theming layer meant the system stayed honest after I stepped back. Brand swaps that used to take 2–3 days now take under ten minutes, and roughly nine of ten products migrated onto it.',
    ],
  },
  {
    slug: 'payment-gateway-sdk',
    name: 'Payment Gateway SDK',
    initial: 'P', color: 'var(--cobalt)',
    kind: 'Payments · SDK', year: '2021 — 23',
    role: 'Lead, Payments UX', duration: '2021 — 23', outcome: '1 week → 48h',
    summary: 'Conceived and led a retry-and-fallback checkout that recovers otherwise-failed payments. Cut merchant integration from a week to 48 hours; now the live checkout in a national rail-ticketing super-app at 30,000+ transactions a minute.',
    tags: ['Checkout', 'Flutter', 'Conversion'],
    metrics: [
      { v: '48h', l: 'Integration · was 1 week' },
      { v: '30K/min', l: 'Live checkout throughput' },
      { v: 'National', l: 'Rail super-app' },
    ],
    body: [
      'Failed payments are lost revenue that never shows up in a funnel. I conceived and led a retry-and-fallback checkout that quietly recovers transactions that would otherwise die at the gateway.',
      'Beyond conversion, the SDK made adoption cheap: merchant integration dropped from a week to 48 hours. It now runs as the live checkout inside a national rail-ticketing super-app, handling 30,000+ transactions a minute.',
    ],
  },
  {
    slug: 'ai-color-token-pipeline',
    name: 'AI color-token pipeline',
    initial: 'A', color: 'var(--violet)',
    kind: 'AI · Design ops', year: '2025',
    role: 'AI design ops', duration: '2025', outcome: '1.5 days → 10 min',
    summary: 'A Claude pipeline: one logo in, sixteen WCAG-checked, auto-named palettes out — shipped as dev-ready variables. Per-bank theming dropped from ~1.5 days to under ten minutes.',
    tags: ['Claude', 'WCAG', 'Automation'],
    metrics: [
      { v: '16', l: 'WCAG palettes per logo' },
      { v: '<10 min', l: 'Per-bank theming · was ~1.5 days' },
      { v: 'Dev-ready', l: 'Variables shipped' },
    ],
    body: [
      'Theming a new bank brand meant a designer hand-building palettes and checking contrast — about a day and a half of careful, repetitive work per tenant.',
      'The pipeline takes one logo and returns sixteen WCAG-checked, auto-named palettes as dev-ready variables. Per-bank theming collapsed from ~1.5 days to under ten minutes, and the output plugs straight into the design system’s token layer.',
    ],
  },
  {
    slug: 'pharmacy-conversion-rebuild',
    name: 'Pharmacy conversion rebuild',
    initial: 'H', color: 'var(--sage)',
    kind: 'Health · CRO', year: '2018 — 20',
    role: 'Senior UX Designer', duration: '2018 — 20', outcome: '+23% checkout',
    summary: 'One-click PDP checkout and a chronic-care upsell for a 75M-user health platform. +23% checkout conversion, −15% cart abandonment, +12% average order value.',
    tags: ['CRO', 'E-commerce', 'Research'],
    metrics: [
      { v: '+23%', l: 'Checkout conversion' },
      { v: '−15%', l: 'Cart abandonment' },
      { v: '+12%', l: 'Average order value' },
    ],
    body: [
      'On a 75M-user health platform, the distance between "add to cart" and "order placed" was where revenue leaked. I led a pharmacy squad to compress it: one-click checkout from the product page, plus a chronic-care upsell that fit the user’s real buying rhythm.',
      'The numbers moved together — +23% checkout conversion, −15% cart abandonment, +12% average order value — which is the honest test of a CRO rebuild: not one metric up while another quietly falls.',
    ],
  },
  {
    slug: 'marketplace-app',
    name: 'Marketplace app, 0 → 9M',
    initial: 'M', color: 'var(--tomato)',
    kind: 'Marketplace · Mobile', year: '2015 — 16',
    role: 'Lead UX Designer', duration: '2015 — 16', outcome: '9M+ downloads',
    summary: 'Led iOS and Android UX from inception to 9M+ downloads; collapsed a two-step checkout to one for returning users on a national shopping marketplace.',
    tags: ['Mobile', 'iOS / Android', 'Checkout'],
    metrics: [
      { v: '9M+', l: 'Downloads' },
      { v: '2 → 1', l: 'Checkout steps' },
      { v: 'iOS/Android', l: 'From inception' },
    ],
    body: [
      'A national shopping marketplace, designed for both platforms from inception. The work grew to 9M+ downloads — scale that punishes any friction you leave in the critical path.',
      'The sharpest win was collapsing a two-step checkout to one for returning users: fewer taps, less drop-off, a smoother return for the people most likely to buy again.',
    ],
  },
  {
    slug: 'iot-security-product',
    name: 'IoT security product',
    initial: 'R', color: 'var(--orange)',
    kind: 'IoT · Product', year: '2011 — 15',
    role: 'UX Designer', duration: '2011 — 15', outcome: '$100K+ raised',
    summary: 'Designed a smart-home security product and its companion app — raised $100K+ on Kickstarter, and the app won NASSCOM AppFame and a Google "best apps" nod.',
    tags: ['IoT', 'Hardware', '0→1'],
    metrics: [
      { v: '$100K+', l: 'Kickstarter raised' },
      { v: 'NASSCOM', l: 'AppFame winner' },
      { v: 'Google', l: '"Best apps" nod' },
    ],
    body: [
      'A smart-home security product and its companion app, designed 0→1 — hardware and software as one experience, which is the only way IoT ever feels trustworthy.',
      'It raised $100K+ on Kickstarter, and the app went on to win NASSCOM AppFame and a Google "best apps" mention — early proof that craft and outcomes aren’t opposing forces.',
    ],
  },
];

// ARTICLES — real topics/positions from the live site. `body` paragraphs are
// honest ledes in Bala's voice; replace with the full essays when ready.
export const ARTICLES = [
  {
    slug: 'design-system-leverage',
    title: 'A design system is not a library — it’s leverage.',
    category: 'Design systems', color: 'var(--accent)',
    date: 'Case study', readTime: '12 min',
    deck: 'How one component set learns to wear 25 bank brands, and why semantic tokens are the whole trick.',
    body: [
      'Most teams treat a design system as a component library — a shelf you pull from. That framing caps its value at "time saved." The systems that actually change how a company ships treat it as leverage: one set of decisions, multiplied across every brand and platform that inherits them.',
      'The whole trick is semantic tokens. When a component asks for "surface" and "accent" instead of a hex value, skinning 25 bank brands stops being 25 design projects and becomes one. This is the story of building that layer at national-bank scale — and the governance that kept it honest after I left.',
    ],
  },
  {
    slug: 'design-md-ai-context',
    title: 'DESIGN.md — giving AI your design context before it generates.',
    category: 'AI × Design', color: 'var(--violet)',
    date: 'Experiment', readTime: '9 min',
    deck: 'A portable spec that agents read first, so the output comes out on-brand every session. Proven by building the same site twice.',
    body: [
      'AI generates confidently and generically. The fix isn’t a longer prompt — it’s a portable design context the agent reads before it writes a single line: tokens, motion rules, section architecture, voice.',
      'I proved it by building the same portfolio twice from one DESIGN.md. The output came out on-brand both times, because the brand lived in the spec, not in my memory of the last session. Here’s the format, and what it taught me about designing for agents.',
    ],
  },
  {
    slug: 'theming-with-ai',
    title: 'From 1.5 days to 10 minutes: theming with AI.',
    category: 'Design ops', color: 'var(--tomato)',
    date: 'Field note', readTime: '6 min',
    deck: 'A Claude pipeline that turns a single logo into sixteen accessible, dev-ready palettes — and what it taught me about governance.',
    body: [
      'Per-bank theming was a day and a half of careful, repetitive contrast-checking. It was exactly the kind of work that’s too important to rush and too mechanical to enjoy — which is to say, the perfect thing to automate.',
      'The pipeline takes one logo and returns sixteen WCAG-checked, auto-named palettes as dev-ready variables. But the real lesson was about governance: automation only works when the system it feeds is already principled. Speed amplifies whatever structure you already have.',
    ],
  },
];

export const EXPERIENCE = [
  { years: '2011 — 2015', org: 'Mindhelix', role: 'UX Designer',
    note: 'Designed Rico, an IoT smart-home product that raised $100K+ on Kickstarter. Sentinel app won NASSCOM AppFame.' },
  { years: '2015 — 2016', org: 'ASKME', role: 'Lead UX Designer',
    note: 'Led a national marketplace app across iOS and Android — inception to 9M+ downloads.' },
  { years: '2016 — 2018', org: 'MobME', role: 'Product Head & UX Designer',
    note: 'Retail-banking apps and Compaz, a bank behavioural-analytics tool that earned $45K from two banks.' },
  { years: '2018 — 2020', org: 'TATA 1mg', role: 'Senior UX Designer',
    note: 'Led a pharmacy squad on a 75M-user health platform. +23% checkout conversion, +12% AOV.' },
  { years: '2020 — present', org: 'Hatio · BillDesk', role: 'Head of Product Design', current: true,
    note: 'Built the design function from one hire to a peak of 18. Founded the multi-tenant design system and led the Payment Gateway SDK behind several of India’s largest banks.' },
];

export const VALUES = [
  { n: '01', t: 'Every screen owes a number.',
    b: 'A design carries a hypothesis. If you can’t name the metric it’s meant to move, the work isn’t finished.' },
  { n: '02', t: 'Systems before screens.',
    b: 'A good system makes the next ten screens cheap — and honest after you leave. Governance is the product, not the by-product.' },
  { n: '03', t: 'Recover the revenue nobody sees.',
    b: 'The best fintech UX is invisible: retry-and-fallback flows, one fewer step at checkout, the failed payment that quietly succeeds.' },
  { n: '04', t: 'Let AI do the repetitive, careful work.',
    b: 'Sixteen accessible palettes in ten minutes, not a day and a half. Automation amplifies whatever structure you already have.' },
];

export const STACK = [
  { label: 'Design', items: ['Figma', 'Framer', 'Storybook'] },
  { label: 'AI & motion', items: ['Claude', 'After Effects', 'Rive'] },
  { label: 'Ways of working', items: ['Tokens', 'A/B testing', 'WCAG 2.2'] },
];

export const NAV = [
  { route: 'work', label: 'Work' },
  { route: 'blog', label: 'Writing' },
  { route: 'about', label: 'About' },
  { route: 'contact', label: 'Contact' },
];

export const findProject = (slug) => PROJECTS.find((p) => p.slug === slug);
export const findArticle = (slug) => ARTICLES.find((a) => a.slug === slug);
