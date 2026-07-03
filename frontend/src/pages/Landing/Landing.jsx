import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────
const GYM_BG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1800&q=80&auto=format&fit=crop';
const EASE_EXPO = [0.16, 1, 0.3, 1];

// ─── Static data ──────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: 'filter_center_focus', title: 'Neural Biometrics',  desc: 'Medical-grade analysis of HRV and neural fatigue through high-frequency AI scanning.', num: '01' },
  { icon: 'bolt',                title: 'Adaptive Coaching',  desc: 'Workout protocols that shift intensity based on your real-time recovery data.',           num: '02' },
  { icon: 'camera',              title: 'Vision Nutrition',   desc: 'Snap a photo. Our vision models calculate macros and micronutrients instantly.',          num: '03' },
  { icon: 'all_inclusive',       title: 'Ecosystem Sync',     desc: 'Seamlessly aggregates data from Apple Watch, Oura, and Garmin platforms.',               num: '04' },
  { icon: 'analytics',           title: 'Performance Lab',    desc: 'Institutional-grade trend reporting that predicts peak performance windows.',             num: '05' },
  { icon: 'shield_lock',         title: 'Vault Privacy',      desc: 'Your biometric data is end-to-end encrypted with zero-knowledge protocols.',             num: '06' },
];

// ─── PRICING now carries planId so the CTA deep-links to a real plan ─────────
// Set planId to null if you want to fall back to /register instead.
const PRICING = [
  {
    name: 'Foundations',
    price: 'Free',
    per: '',
    features: ['Core Biometrics', 'Daily Health Score', 'Community Access'],
    popular: false,
    // No planId → lands on explore tab (free tier browsing)
    planId: null,
    ctaLabel: 'Browse Free Plans',
    ctaDest: 'explore',          // tab to activate
  },
  {
    name: 'Professional',
    price: '$9',
    per: '/mo',
    features: ['Adaptive Coaching', 'Vision Nutrition', 'Deep Analytics', 'Priority Support'],
    popular: true,
    planId: null,                // swap to a real plan id e.g. 2
    ctaLabel: 'View Pro Plans',
    ctaDest: 'find',
  },
  {
    name: 'Elite',
    price: '$19',
    per: '/mo',
    features: ['1-on-1 AI Strategy', 'Biometric Alerts', 'Full API Access', 'Custom Protocol Lab'],
    popular: false,
    planId: null,                // swap to a real plan id e.g. 3
    ctaLabel: 'View Elite Plans',
    ctaDest: 'find',
  },
];

const ABOUT_STATS = [
  { value: '50K+', label: 'Active Athletes' },
  { value: '98%',  label: 'Satisfaction'    },
  { value: '2.1M', label: 'Data Points'     },
  { value: '24/7', label: 'AI Coverage'     },
];

const ABOUT_VALUES = [
  { title: 'Innovation First',  desc: "We push the boundaries of what's possible with AI and biometric technology.", icon: 'rocket_launch' },
  { title: 'Privacy by Design', desc: 'Your data belongs to you. We built security from the ground up.',            icon: 'shield_lock'   },
  { title: 'Scientific Rigor',  desc: 'Every feature is backed by peer-reviewed research and clinical validation.', icon: 'science'       },
  { title: 'Human-Centered',    desc: 'Technology serves people, not the other way around.',                        icon: 'favorite'      },
];



const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing',  label: 'Pricing'  },
  { href: '#about',    label: 'About'    },
];

// ─── Helper: navigate to Plans page ──────────────────────────────────────────
// isAuthenticated: pass your real auth state here.
// If the user is NOT logged in we send them to /register first,
// then after sign-up React Router will redirect them to the plans page.
// If they ARE logged in we go straight there.
const buildPlansPath = ({ planId = null, tab = 'explore' } = {}) => {
  const params = new URLSearchParams();
  if (planId) params.set('planId', String(planId));
  else        params.set('tab', tab);
  return `/dashboard/plans?${params.toString()}`;
};

// ─── Icon ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
);

// ─── Horizontal Slider (shared by Team + Pricing on mobile) ──────────────────
const HorizontalSlider = ({ items, renderItem, itemWidth = 'w-[80vw] sm:w-[340px]' }) => {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const total = items.length;

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(total - 1, i + 1));

  useEffect(() => {
    if (!trackRef.current) return;
    const el = trackRef.current.children[index];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }, [index]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const w = el.children[0]?.offsetWidth + 16;
          if (w) setIndex(Math.round(el.scrollLeft / w));
        }}
      >
        {items.map((item, i) => (
          <div key={i} className={`${itemWidth} flex-shrink-0 snap-start`}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-5">
        <div className="flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`transition-all duration-300 rounded-full ${i === index ? 'w-5 h-1.5 bg-[#D1FD52]' : 'w-1.5 h-1.5 bg-white/20'}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={prev}
            disabled={index === 0}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:border-[#D1FD52]/40 hover:text-[#D1FD52] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <Icon name="chevron_left" className="text-lg" />
          </button>
          <button
            onClick={next}
            disabled={index === total - 1}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:border-[#D1FD52]/40 hover:text-[#D1FD52] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <Icon name="chevron_right" className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Marquee ──────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = ['Neural Biometrics', 'Adaptive Coaching', 'Vision Nutrition', 'Performance Lab', 'Ecosystem Sync', 'Vault Privacy'];
const Marquee = () => (
  <div className="relative overflow-hidden py-5 border-y border-white/5 bg-[#0a0a0a]">
    <div className="flex animate-marquee whitespace-nowrap gap-0">
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        <span key={i} className="inline-flex items-center gap-6 px-8">
          <span className="text-[11px] font-black uppercase tracking-[0.35em] text-white/25">{item}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D1FD52] flex-shrink-0 shadow-[0_0_6px_rgba(209,253,82,0.6)]" />
        </span>
      ))}
    </div>
    <style>{`
      @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
      .animate-marquee { animation: marquee 30s linear infinite; }
      .scrollbar-hide::-webkit-scrollbar { display: none; }
    `}</style>
  </div>
);

// ─── Cursor glow ──────────────────────────────────────────────────────────────
const CursorGlow = () => {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  useEffect(() => {
    const move = (e) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mx, my]);
  return (
    <motion.div className="pointer-events-none fixed z-[9999] top-0 left-0 hidden lg:block" style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}>
      <div className="w-64 h-64 rounded-full bg-[#D1FD52]/5 blur-[60px]" />
    </motion.div>
  );
};

// ─── Stat counter ─────────────────────────────────────────────────────────────
const StatCounter = ({ value, label }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="text-center relative">
      <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 bg-[#D1FD52]/20" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE_EXPO }}
        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-none mb-2"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >{value}</motion.div>
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{label}</div>
    </div>
  );
};

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
const MobileMenu = ({ open, onClose, navigate }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
        animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
        exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
        transition={{ duration: 0.4, ease: EASE_EXPO }}
        className="lg:hidden fixed inset-0 z-[99] bg-[#060606] flex flex-col pt-24"
      >
        <div className="flex flex-col px-8 pt-8 gap-1">
          {NAV_LINKS.map(({ href, label }, i) => (
            <motion.a key={href} href={href} onClick={onClose}
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: EASE_EXPO }}
              className="text-5xl font-black uppercase tracking-tighter text-white/20 hover:text-[#D1FD52] transition-colors py-3 border-b border-white/5"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >{label}</motion.a>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
          className="px-8 mt-auto pb-16 flex flex-col gap-3"
        >
          <button onClick={() => { navigate('/login'); onClose(); }} className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-white/50 border border-white/10 hover:border-white/30 transition-all">Sign In</button>
          <button onClick={() => { navigate('/register'); onClose(); }} className="w-full py-4 rounded-xl bg-[#D1FD52] text-black text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all">Join the Lab</button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, num, index }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE_EXPO }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative group bg-[#0f0f0f] border border-white/[0.06] rounded-2xl p-7 sm:p-8 overflow-hidden cursor-default transition-all duration-500 hover:border-[#D1FD52]/30"
    >
      <motion.div animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }} transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-gradient-to-br from-[#D1FD52]/8 via-[#D1FD52]/3 to-transparent pointer-events-none" />
      <div className="absolute top-4 right-5 text-[60px] font-black text-white/[0.05] leading-none select-none pointer-events-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{num}</div>
      <div className="relative z-10">
        <motion.div animate={{ backgroundColor: hovered ? '#D1FD52' : 'rgba(255,255,255,0.05)', color: hovered ? '#000' : 'rgba(255,255,255,0.5)' }}
          transition={{ duration: 0.3 }} className="w-11 h-11 rounded-xl flex items-center justify-center mb-7">
          <Icon name={icon} className="text-xl" />
        </motion.div>
        <h3 className="font-black text-white mb-3 uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: '0.02em' }}>{title}</h3>
        <p className="text-white/35 leading-relaxed text-sm font-medium">{desc}</p>
      </div>
    </motion.div>
  );
};

// ─── Pricing Card ─────────────────────────────────────────────────────────────
// ✅ CONNECTED: CTA now navigates to /dashboard/plans with the right
//    tab or planId instead of always going to /register.
const PricingCard = ({ plan, navigate, isAuthenticated = false }) => {
  const { popular, planId, ctaLabel, ctaDest } = plan;

  const handleCTA = () => {
    if (isAuthenticated) {
      // User is logged in → go straight to the plans page
      navigate(buildPlansPath({ planId, tab: ctaDest }));
    } else {
      // Not logged in → register first, then redirect to plans
      const redirect = buildPlansPath({ planId, tab: ctaDest });
      navigate(`/register?redirect=${encodeURIComponent(redirect)}`);
    }
  };

  return (
    <div className={`relative flex flex-col rounded-2xl overflow-hidden h-full ${popular ? 'ring-1 ring-[#D1FD52] shadow-[0_0_60px_-10px_rgba(209,253,82,0.25)]' : 'border border-white/8'}`}>
      {popular && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1FD52] to-transparent" />}
      <div className={`p-7 sm:p-8 flex flex-col flex-grow ${popular ? 'bg-[#141a00]' : 'bg-[#0f0f0f]'}`}>
        {popular && <span className="self-start mb-5 px-3 py-1 rounded-full bg-[#D1FD52] text-black text-[9px] font-black uppercase tracking-widest">Most Popular</span>}
        <div className="mb-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">{plan.name}</p>
          <div className="flex items-end gap-1">
            <span className="font-black text-white leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem,8vw,4rem)' }}>{plan.price}</span>
            {plan.per && <span className="text-sm text-white/30 font-bold mb-2">{plan.per}</span>}
          </div>
        </div>
        <div className="h-px bg-white/5 my-6" />
        <ul className="space-y-3.5 mb-8 flex-grow">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm font-medium">
              <div className="w-4 h-4 rounded-full bg-[#D1FD52]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="check" className="text-[#D1FD52] text-[11px]" />
              </div>
              <span className="text-white/55">{f}</span>
            </li>
          ))}
        </ul>
        {/* ✅ CTA goes to plans page, not /register */}
        <button
          onClick={handleCTA}
          className={`w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
            popular
              ? 'bg-[#D1FD52] text-black hover:shadow-[0_8px_30px_rgba(209,253,82,0.3)]'
              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
          }`}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
};



// MAIN 
const Landing = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Replace with your real auth check
  const isAuthenticated = false;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Hero CTA
  const handleHeroCTA = () => {
    if (isAuthenticated) {
      navigate(buildPlansPath({ tab: 'explore' }));
    } else {
      navigate('/register');
    }
  };

  //  bottom CTA
  const handleBottomCTA = () => {
    if (isAuthenticated) {
      navigate(buildPlansPath({ tab: 'find' }));
    } else {
      navigate('/register');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,700;1,9..40,900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        :root { --accent: #D1FD52; --bg: #080808; }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); overflow-x: hidden; }
        ::selection { background: var(--accent); color: #000; }
        .bebas { font-family: 'Bebas Neue', sans-serif; }
        .dm    { font-family: 'DM Sans', sans-serif; }
        .hero-text { font-family: 'Bebas Neue', sans-serif; font-size: clamp(80px, 18vw, 200px); line-height: 0.88; letter-spacing: -0.01em; }
        .section-num { font-family: 'Bebas Neue', sans-serif; font-size: clamp(80px, 12vw, 140px); color: rgba(255,255,255,0.03); line-height: 1; }
        .grain::before {
          content: ''; position: fixed; inset: -50%; width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.03; pointer-events: none; z-index: 9998; animation: grain 0.5s steps(2) infinite;
        }
        @keyframes grain { 0%,100%{transform:translate(0,0)}10%{transform:translate(-2%,-3%)}20%{transform:translate(3%,2%)}30%{transform:translate(-1%,4%)}40%{transform:translate(4%,-1%)}50%{transform:translate(-3%,3%)}60%{transform:translate(2%,-4%)}70%{transform:translate(-4%,1%)}80%{transform:translate(1%,-2%)}90%{transform:translate(-2%,4%)} }
        .glow-text { text-shadow: 0 0 80px rgba(209,253,82,0.3); }
        .scanline { background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px); pointer-events: none; }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.2); opacity: 0; } }
        .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="grain dm w-screen min-h-screen bg-[#080808] text-[#e5e2e1] overflow-x-hidden">
        <CursorGlow />

        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <motion.nav
          animate={{ borderBottomColor: scrolled ? 'rgba(255,255,255,0.08)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)', backgroundColor: scrolled ? 'rgba(8,8,8,0.95)' : 'transparent' }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 right-0 z-[100] border-b border-transparent"
        >
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 h-20 flex justify-between items-center">
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-[#D1FD52] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(209,253,82,0.4)]">
                <Icon name="pulse_alert" className="text-[#0a1000] text-lg" />
              </div>
              <span className="bebas text-2xl tracking-wider text-white">Vitalis</span>
            </motion.button>

            <div className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map(({ href, label }, i) => (
                <motion.a key={href} href={href} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-[11px] font-bold text-white/40 hover:text-[#D1FD52] transition-colors tracking-[0.2em] uppercase relative group"
                >
                  {label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#D1FD52] group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                onClick={() => navigate('/login')} className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-white/35 hover:text-white transition-colors"
              >Sign In</motion.button>
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
                onClick={() => navigate('/register')} className="hidden sm:block px-6 py-2.5 rounded-full bg-[#D1FD52] text-black text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(209,253,82,0.35)] transition-all hover:scale-105 active:scale-95"
              >Join the Lab</motion.button>
              <button onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu"
                className="lg:hidden flex flex-col gap-1.5 w-10 h-10 justify-center items-center rounded-xl hover:bg-white/5 transition-colors"
              >
                <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }} className="w-5 h-0.5 bg-white block origin-center" />
                <motion.span animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }} className="w-5 h-0.5 bg-white block" />
                <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }} className="w-5 h-0.5 bg-white block origin-center" />
              </button>
            </div>
          </div>
        </motion.nav>

        <MobileMenu open={menuOpen} onClose={closeMenu} navigate={navigate} />

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section ref={heroRef} className="relative min-h-screen flex flex-col justify-end pb-16 sm:pb-24 pt-20 overflow-hidden">
          <motion.div className="absolute inset-0" style={{ y: heroY }}>
            <img src={GYM_BG} alt="" aria-hidden className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.2) saturate(0.7)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/50 via-[#080808]/20 to-[#080808]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/70 to-transparent" />
            <div className="absolute inset-0 scanline opacity-40" />
          </motion.div>
          <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-[#D1FD52]/6 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-0 right-[5%] w-[400px] h-[400px] bg-[#D1FD52]/4 rounded-full blur-[120px] pointer-events-none" />

          <motion.div className="relative z-10 max-w-[1440px] mx-auto w-full px-5 sm:px-8" style={{ opacity: heroOpacity }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex items-center gap-3 mb-8 sm:mb-12">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                <span className="relative flex items-center justify-center w-2 h-2">
                  <span className="pulse-ring absolute inline-block w-2 h-2 rounded-full bg-[#D1FD52]/50" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-[#D1FD52] shadow-[0_0_8px_#D1FD52]" />
                </span>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.25em]">Institutional Grade Biometrics</span>
              </div>
            </motion.div>

            <div className="hero-text overflow-hidden mb-6 sm:mb-10">
              {['BEYOND', 'FITNESS.'].map((word, i) => (
                <motion.div key={word} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.4 + i * 0.12, ease: EASE_EXPO }}
                  className={i === 1 ? 'text-white/15 italic' : 'text-white'}>{word}</motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.75 }} className="flex flex-col gap-8 max-w-lg">
              <p className="text-white/35 text-base sm:text-lg leading-relaxed font-medium">
                Vitalis is a high-performance OS for the human body. We bridge the gap between clinical data and daily action.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* ✅ CONNECTED: hero primary CTA → plans explore tab */}
                <button
                  onClick={handleHeroCTA}
                  className="flex-1 sm:flex-none px-8 py-4 rounded-xl bg-[#D1FD52] text-[#0a1000] font-black uppercase tracking-[0.2em] text-[11px] hover:shadow-[0_20px_50px_rgba(209,253,82,0.3)] transition-all hover:-translate-y-1 active:translate-y-0 whitespace-nowrap text-center"
                >
                  Initiate Protocol
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-white/10 hover:border-white/25 text-white/40 hover:text-white transition-all group whitespace-nowrap">
                  <Icon name="play_circle" className="text-2xl group-hover:text-[#D1FD52] transition-colors flex-shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Watch Film</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['bg-[#D1FD52]/30','bg-[#D1FD52]/50','bg-[#D1FD52]/70'].map((c,i) => (
                    <div key={i} className={`w-6 h-6 rounded-full border border-[#080808] ${c}`} />
                  ))}
                </div>
                <span className="text-[11px] text-white/25 font-medium">Joined by <span className="text-white/50 font-bold">50K+</span> athletes worldwide</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Scroll</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
        </section>

        {/* ── Marquee ────────────────────────────────────────────────────── */}
        <Marquee />

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-5 sm:px-8 bg-[#080808]">
          <div className="max-w-[1440px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 border border-white/5 rounded-2xl p-8 sm:p-12 bg-[#0d0d0d] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D1FD52]/3 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1FD52]/40 to-transparent" />
              {ABOUT_STATS.map((s) => <StatCounter key={s.label} {...s} />)}
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────────── */}
        <section id="features" className="py-16 sm:py-24 lg:py-32 px-5 sm:px-8 bg-[#080808] relative overflow-hidden">
          <div className="section-num absolute -top-4 -left-4 select-none pointer-events-none">FEAT</div>
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 sm:mb-20 gap-8">
              <div>
                <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-[11px] font-black text-[#D1FD52] uppercase tracking-[0.4em] mb-4">The Infrastructure</motion.p>
                <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: EASE_EXPO }}
                  className="bebas leading-none text-white" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', letterSpacing: '0.01em' }}
                >Engineered for<br /><span className="text-white/15">The 1%.</span></motion.h2>
              </div>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                className="text-white/30 max-w-xs text-sm font-medium leading-relaxed border-l-2 border-[#D1FD52]/30 pl-6"
              >Our proprietary models are trained on over 2 million athletic data points to provide accuracy where others guess.</motion.p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
            </div>
          </div>
        </section>

        {/* ── About ──────────────────────────────────────────────────────── */}
        <section id="about" className="py-16 sm:py-24 lg:py-32 px-5 sm:px-8 bg-[#0a0a0a] relative overflow-hidden">
          <div className="section-num absolute -top-4 right-0 select-none pointer-events-none">ABOT</div>
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-16 sm:mb-24">
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[11px] font-black text-[#D1FD52] uppercase tracking-[0.4em] mb-4">Our Story</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_EXPO }}
                className="bebas leading-none text-white mb-6" style={{ fontSize: 'clamp(3rem, 9vw, 7rem)', letterSpacing: '0.01em' }}
              >Redefining Human <span className="text-[#D1FD52] glow-text">Performance</span></motion.h2>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="text-white/35 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-medium"
              >Vitalis was born from a simple question: What if technology could truly understand human biology and help us perform at our peak, every single day?</motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-16 sm:mb-24">
              {[
                { icon: 'rocket_launch', title: 'Our Mission', body: 'To democratize elite-level performance optimization by making clinical-grade biometric intelligence accessible to everyone, not just professional athletes.' },
                { icon: 'visibility',    title: 'Our Vision',  body: 'A world where every person has the tools and insights to understand their body, optimize their health, and unlock their full potential.' },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: i === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_EXPO }}
                  className="group relative bg-[#0f0f0f] border border-white/6 rounded-2xl p-8 sm:p-10 overflow-hidden hover:border-[#D1FD52]/20 transition-colors"
                >
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#D1FD52]/4 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-[#D1FD52]/10 flex items-center justify-center mb-6">
                    <Icon name={item.icon} className="text-2xl text-[#D1FD52]" />
                  </div>
                  <h3 className="bebas text-3xl sm:text-4xl text-white mb-4 tracking-wide">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed text-sm sm:text-base">{item.body}</p>
                </motion.div>
              ))}
            </div>

            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[11px] font-black text-[#D1FD52] uppercase tracking-[0.4em] mb-4 text-center">What We Believe</motion.p>
            <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bebas text-center text-white mb-10 sm:mb-16" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>Core Values</motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ABOUT_VALUES.map((v, i) => (
                <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="group bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-[#D1FD52]/25 transition-all duration-300 hover:bg-white/[0.05]"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#D1FD52]/10 flex items-center justify-center mb-4 group-hover:bg-[#D1FD52]/20 transition-colors">
                    <Icon name={v.icon} className="text-lg text-[#D1FD52]" />
                  </div>
                  <h4 className="font-black text-white text-base mb-2 dm">{v.title}</h4>
                  <p className="text-white/35 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ────────────────────────────────────────────────────── */}
        <section id="pricing" className="py-16 sm:py-24 lg:py-32 px-5 sm:px-8 bg-[#080808] relative overflow-hidden">
          <div className="section-num absolute -top-4 -left-4 select-none pointer-events-none">PRCE</div>
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-14 sm:mb-20">
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[11px] font-black text-[#D1FD52] uppercase tracking-[0.4em] mb-4">Plans</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_EXPO }}
                className="bebas text-white mb-4" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
              >Access the Lab.</motion.h2>
              <p className="text-white/35 max-w-sm mx-auto text-sm font-medium">Transparent pricing for lifelong optimization.</p>
            </div>

            {/* Mobile: horizontal slider | Desktop: 3-col grid */}
            <div className="md:hidden">
              <HorizontalSlider
                items={PRICING}
                itemWidth="w-[80vw] max-w-[320px]"
                renderItem={(plan) => (
                  <PricingCard plan={plan} navigate={navigate} isAuthenticated={isAuthenticated} />
                )}
              />
            </div>
            <div className="hidden md:grid grid-cols-3 gap-5 max-w-5xl mx-auto">
              {PRICING.map((plan, i) => (
                <motion.div key={plan.name} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.7, delay: i * 0.1, ease: EASE_EXPO }}>
                  {/* ✅ CONNECTED: passes isAuthenticated so card knows where to route */}
                  <PricingCard plan={plan} navigate={navigate} isAuthenticated={isAuthenticated} />
                </motion.div>
              ))}
            </div>

            <p className="text-center text-white/20 text-[11px] uppercase tracking-widest mt-10 font-bold">
              No contracts · Cancel anytime · 30-day money-back guarantee
            </p>
          </div>
        </section>


        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-5 sm:px-8 bg-[#080808]">
          <div className="max-w-[1440px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE_EXPO }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#D1FD52] px-8 sm:px-14 py-14 sm:py-20"
            >
              <div className="absolute -right-8 -bottom-8 bebas text-[120px] sm:text-[200px] text-black/[0.09] leading-none select-none pointer-events-none">EVOLVE</div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-black/40 mb-3">Start Today</p>
                  <h2 className="bebas text-black leading-none mb-4" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}>Ready to Evolve?</h2>
                  <p className="text-black/50 text-sm font-medium max-w-xs">Join 50,000+ athletes already training with clinical-grade intelligence.</p>
                </div>
                <div className="flex flex-col gap-3 flex-shrink-0 w-full sm:w-auto">
                  {/* ✅ CONNECTED: bottom CTA → plans find tab */}
                  <button
                    onClick={handleBottomCTA}
                    className="w-full sm:w-auto px-10 py-4 rounded-xl bg-black text-white font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.03] transition-transform shadow-xl whitespace-nowrap"
                  >
                    Secure Membership
                  </button>
                  <p className="text-[10px] text-black/35 font-bold text-center uppercase tracking-wider">Free plan available</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 bg-[#060606]">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8">

            {/* Main footer body */}
            <div className="py-12 sm:py-16 flex flex-col sm:flex-row gap-10 sm:gap-16">

              {/* Brand column */}
              <div className="flex-shrink-0 max-w-[220px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#D1FD52] rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(209,253,82,0.25)]">
                    <Icon name="pulse_alert" className="text-[#0a1000] text-base" />
                  </div>
                  <span className="bebas text-2xl tracking-wider text-white">Vitalis</span>
                </div>
                <p className="text-white/20 text-sm leading-relaxed font-medium mb-6">
                  The world's most advanced human performance platform.
                </p>
                <div className="flex items-center gap-2">
                  {[{ icon: 'alternate_email', label: 'Twitter/X' }, { icon: 'camera_alt', label: 'Instagram' }, { icon: 'work', label: 'LinkedIn' }].map(({ icon, label }) => (
                    <a key={label} href="#" aria-label={label}
                      className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center hover:bg-[#D1FD52] hover:border-[#D1FD52] transition-all duration-300 group"
                    >
                      <Icon name={icon} className="text-base text-white/40 group-hover:text-black" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Nav columns */}
              <div className="grid grid-cols-3 gap-6 sm:gap-10 flex-grow">
                {[
                  { heading: 'Product', links: ['Features', 'Pricing', 'Research', 'API Docs'] },
                  { heading: 'Company', links: ['About', 'Careers', 'Press', 'Contact'] },
                  { heading: 'Legal',   links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
                ].map(({ heading, links }) => (
                  <div key={heading}>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25 mb-4">{heading}</h4>
                    <ul className="flex flex-col gap-2.5">
                      {links.map(link => (
                        <li key={link}>
                          <a href="#" className="text-[12px] font-medium text-white/30 hover:text-[#D1FD52] transition-colors">{link}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Bottom bar */}
            <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">

              {/* Left: copyright */}
              <p className="text-white/20 text-[11px] font-medium tracking-wide order-2 sm:order-1">
                © 2026 <span className="text-white/35 font-bold">Vitalis Labs Inc.</span> All rights reserved.
              </p>

              {/* Center: developed by badge */}
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/8 bg-white/[0.03] order-1 sm:order-2">
                <Icon name="code" className="text-[14px] text-[#D1FD52]/60" />
                <span className="text-[10px] font-bold text-white/25 tracking-[0.15em] uppercase">
                  Developed by{' '}
                  <span className="text-[#D1FD52]/70 font-black tracking-[0.2em]">STC Students</span>
                </span>
              </div>

              {/* Right: system status */}
              <div className="flex items-center gap-2 order-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D1FD52] shadow-[0_0_6px_#D1FD52] animate-pulse" />
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">All systems operational</span>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </>
  );
};

export default Landing;