// ─── Constants ────────────────────────────────────────────────────────────────
export const GYM_BG_BASE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=70';
export const GYM_BG_SRCSET = [640, 1080, 1600, 1920]
  .map((w) => `${GYM_BG_BASE}&w=${w} ${w}w`)
  .join(', ');
export const GYM_BG_FALLBACK = `${GYM_BG_BASE}&w=1600`;
export const EASE_EXPO = [0.16, 1, 0.3, 1];

// ─── Static data ──────────────────────────────────────────────────────────────
export const FEATURES = [
  { icon: 'filter_center_focus', title: 'Neural Biometrics',  desc: 'Medical-grade analysis of HRV and neural fatigue through high-frequency AI scanning.', num: '01' },
  { icon: 'bolt',                title: 'Adaptive Coaching',  desc: 'Workout protocols that shift intensity based on your real-time recovery data.',           num: '02' },
  { icon: 'camera',              title: 'Vision Nutrition',   desc: 'Snap a photo. Our vision models calculate macros and micronutrients instantly.',          num: '03' },
  { icon: 'all_inclusive',       title: 'Ecosystem Sync',     desc: 'Seamlessly aggregates data from Apple Watch, Oura, and Garmin platforms.',               num: '04' },
  { icon: 'analytics',           title: 'Performance Lab',    desc: 'Institutional-grade trend reporting that predicts peak performance windows.',             num: '05' },
  { icon: 'shield_lock',         title: 'Vault Privacy',      desc: 'Your biometric data is end-to-end encrypted with zero-knowledge protocols.',             num: '06' },
];

export const PRICING = [
  {
    name: 'Foundations', price: 'Free', per: '',
    features: ['Core Biometrics', 'Daily Health Score', 'Community Access'],
    popular: false, planId: null, ctaLabel: 'Browse Free Plans', ctaDest: 'explore',
  },
  {
    name: 'Professional', price: '$9', per: '/mo',
    features: ['Adaptive Coaching', 'Vision Nutrition', 'Deep Analytics', 'Priority Support'],
    popular: true, planId: null, ctaLabel: 'View Pro Plans', ctaDest: 'find',
  },
  {
    name: 'Elite', price: '$19', per: '/mo',
    features: ['1-on-1 AI Strategy', 'Biometric Alerts', 'Full API Access', 'Custom Protocol Lab'],
    popular: false, planId: null, ctaLabel: 'View Elite Plans', ctaDest: 'find',
  },
];

export const STATS_FALLBACK = {
  users: 50000,
  onlineUsers: 0,
  activeToday: 0,
  workouts: 0,
  uniqueUsers: 0,
  dataPoints: 2100000,
};

export const formatCompact = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(num);
};

export const ABOUT_VALUES = [
  { title: 'Innovation First',  desc: "We push the boundaries of what's possible with AI and biometric technology.", icon: 'rocket_launch' },
  { title: 'Privacy by Design', desc: 'Your data belongs to you. We built security from the ground up.',            icon: 'shield_lock'   },
  { title: 'Scientific Rigor',  desc: 'Every feature is backed by peer-reviewed research and clinical validation.', icon: 'science'       },
  { title: 'Human-Centered',    desc: 'Technology serves people, not the other way around.',                        icon: 'favorite'      },
];

export const ABOUT_MISSION_VISION = [
  { icon: 'rocket_launch', title: 'Our Mission', body: 'To democratize elite-level performance optimization by making clinical-grade biometric intelligence accessible to everyone, not just professional athletes.' },
  { icon: 'visibility',    title: 'Our Vision',  body: 'A world where every person has the tools and insights to understand their body, optimize their health, and unlock their full potential.' },
];

export const SOCIAL_LINKS = [
  { icon: 'alternate_email', label: 'Twitter/X' },
  { icon: 'camera_alt',      label: 'Instagram' },
  { icon: 'work',            label: 'LinkedIn'  },
];

export const FOOTER_COLUMNS = [
  { heading: 'Product', links: ['Features', 'Pricing'] },
  { heading: 'Company', links: ['About', 'Contact'] },
];

export const HERO_AVATAR_ALPHAS = [30, 50, 70];

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing',  label: 'Pricing'  },
  { href: '#about',    label: 'About'    },
];

export const buildPlansPath = ({ planId = null, tab = 'explore' } = {}) => {
  const params = new URLSearchParams();
  if (planId) params.set('planId', String(planId));
  else        params.set('tab', tab);
  return `/dashboard/plans?${params.toString()}`;
};

const inkCache = new Map();
export const ink = (alpha) => {
  let v = inkCache.get(alpha);
  if (v === undefined) {
    v = `rgb(var(--ink-base) / ${alpha})`;
    inkCache.set(alpha, v);
  }
  return v;
};

const accentAlphaCache = new Map();
export const accentAlpha = (pct) => {
  let v = accentAlphaCache.get(pct);
  if (v === undefined) {
    v = `color-mix(in srgb, var(--accent) ${pct}%, transparent)`;
    accentAlphaCache.set(pct, v);
  }
  return v;
};

export const THEME = {
  accent: 'var(--accent)',
  bg: 'var(--bg)',
  bgAlt: 'var(--bg-alt)',
  bgFooter: 'var(--bg-footer)',
  bgSecondary: 'var(--bg-secondary)',
  bgMarquee: 'var(--bg-marquee, var(--bg-alt))',
  text: 'var(--text)',
  textStrong: 'var(--text-strong)',
  textSoft: 'var(--text-soft)',
  border: 'var(--border-color)',
  navBg: 'var(--nav-bg)',
  shadow: 'var(--shadow-color)',
};

// Hero sits on a photo, so its overlay/text are intentionally NOT tied to
// the light/dark theme variables (--bg, --ink-base) — those are meant for
// flat surfaces, not a photographic background. Keeping these fixed avoids
// the hero washing out / text losing contrast when the theme changes.
export const HERO_TEXT_WHITE = '#ffffff';
export const HERO_TEXT_SOFT = 'rgba(255,255,255,0.75)';
export const HERO_TEXT_MUTED = 'rgba(255,255,255,0.55)';
export const HERO_TEXT_FAINT = 'rgba(255,255,255,0.3)';
export const HERO_BORDER = 'rgba(255,255,255,0.18)';
export const HERO_FILTER = 'brightness(0.4) saturate(0.7)';

export const HERO_GRADIENT_VERTICAL = {
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.85) 100%)',
};
export const HERO_GRADIENT_HORIZONTAL = {
  background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 65%)',
};

export const HERO_GLOW_TOP_LEFT_STYLE = {
  backgroundColor: accentAlpha(9),
  transform: 'translateZ(0)',
};
export const HERO_GLOW_BOTTOM_RIGHT_STYLE = {
  backgroundColor: accentAlpha(15),
  transform: 'translateZ(0)',
};
export const ABOUT_HOVER_GLOW_STYLE = {
  backgroundColor: accentAlpha(4),
  transform: 'translateZ(0)',
};
export const CTA_GLOW_STYLE = {
  transform: 'translateZ(0)',
};

export const LANDING_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,700;1,9..40,900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }

  .vitalis-landing.light-theme {
    --bg: #ffffff;
    --bg-alt: #ffffff;
    --bg-secondary: #f7f7f7;
    --bg-footer: #fafafa;
    --bg-marquee: #f5f5f5;
    --bg-menu: #ffffff;
    --text: #1a1a1a;
    --text-strong: #0a0a0a;
    --text-soft: rgba(10,10,10,0.55);
    --ink-base: 10 10 10;
    --border-color: rgba(0,0,0,0.08);
    --nav-bg: rgba(255,255,255,0.95);
    --section-num-color: rgba(0,0,0,0.03);
    --selection-bg: #5E9E4A;
    --selection-text: #ffffff;
  }

  body { background: var(--bg); color: var(--text); overflow-x: hidden; }
  ::selection { background: var(--selection-bg); color: var(--selection-text); }
  .bebas { font-family: 'Bebas Neue', sans-serif; }
  .dm    { font-family: 'DM Sans', sans-serif; }
  .hero-text { font-family: 'Bebas Neue', sans-serif; font-size: clamp(56px, 18vw, 200px); line-height: 0.88; letter-spacing: -0.01em; }
  .section-num { font-family: 'Bebas Neue', sans-serif; font-size: clamp(80px, 12vw, 140px); color: var(--section-num-color); line-height: 1; }
  section[id] { scroll-margin-top: 5rem; }
  .hero-min-h { min-height: 100vh; min-height: 100dvh; }

  .grain::before {
    content: ''; position: fixed; inset: -50%; width: 200%; height: 200%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: var(--grain-opacity, 0.015);
    pointer-events: none; z-index: 9998; animation: grain 0.5s steps(2) infinite;
  }
  @keyframes grain { 0%,100%{transform:translate(0,0)}10%{transform:translate(-2%,-3%)}20%{transform:translate(3%,2%)}30%{transform:translate(-1%,4%)}40%{transform:translate(4%,-1%)}50%{transform:translate(-3%,3%)}60%{transform:translate(2%,-4%)}70%{transform:translate(-4%,1%)}80%{transform:translate(1%,-2%)}90%{transform:translate(-2%,4%)} }
  .glow-text { text-shadow: 0 0 80px color-mix(in srgb, var(--accent) 30%, transparent); }
  .scanline { background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px); pointer-events: none; }
  @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.2); opacity: 0; } }
  .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
  .animate-marquee { animation: marquee 30s linear infinite; }
  a:focus-visible, button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 4px;
  }
  .cv-auto { content-visibility: auto; contain-intrinsic-size: 1px 1200px; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .animate-marquee { animation: none !important; }
    .grain::before { animation: none !important; }
    .pulse-ring { animation: none !important; }
  }
`;

export const MARQUEE_ITEMS = ['Neural Biometrics', 'Adaptive Coaching', 'Vision Nutrition', 'Performance Lab', 'Ecosystem Sync', 'Vault Privacy'];
export const MARQUEE_LOOP = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];