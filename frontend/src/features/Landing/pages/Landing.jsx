import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScroll, useTransform } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import Icon from '../../../components/ui/Icon';
import { HorizontalSlider, Marquee, CursorGlow, StatCounter, MobileMenu, FeatureCard, PricingCard } from '../components';
import useCanHover from '../hooks/useCanHover';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import useLiveStats from '../hooks/useLiveStats';
import {
  GYM_BG_FALLBACK, GYM_BG_SRCSET, EASE_EXPO, FEATURES, PRICING, formatCompact, buildPlansPath,
  ABOUT_VALUES, ABOUT_MISSION_VISION, SOCIAL_LINKS, FOOTER_COLUMNS, HERO_AVATAR_ALPHAS, NAV_LINKS,
  ink, accentAlpha, THEME,
  HERO_TEXT_WHITE, HERO_TEXT_SOFT, HERO_TEXT_MUTED, HERO_TEXT_FAINT, HERO_BORDER, HERO_FILTER,
  HERO_GRADIENT_VERTICAL, HERO_GRADIENT_HORIZONTAL,
  HERO_GLOW_TOP_LEFT_STYLE, HERO_GLOW_BOTTOM_RIGHT_STYLE,
  ABOUT_HOVER_GLOW_STYLE, CTA_GLOW_STYLE, LANDING_STYLES,
} from '../constants';

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const Landing = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const canHover = useCanHover();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAuthenticated = false;
  const liveStats = useLiveStats();
  const userCountLabel = `${formatCompact(liveStats.users)}+`;
  const aboutStats = [
    { value: userCountLabel,                    label: 'Active Athletes'    },
    { value: formatCompact(liveStats.uniqueUsers), label: 'Members Logged In' },
    { value: formatCompact(liveStats.dataPoints), label: 'Data Points'       },
    { value: formatCompact(liveStats.activeToday), label: 'Active Today'     },
  ];

  // navInk decides light-on-dark (white, over the hero photo) vs dark-on-light
  // (once scrolled onto a flat section). The mobile menu ALSO has a light/white
  // backdrop (--bg-menu), so while it's open the nav must use dark text too —
  // otherwise the "Vitalis" wordmark and the hamburger-turned-X lines render
  // white-on-white against the open menu and become invisible, even though
  // they're technically still there.
  const navInk = useCallback(
    (alpha) => (scrolled || menuOpen ? ink(alpha) : `rgba(255,255,255,${alpha})`),
    [scrolled, menuOpen]
  );

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

  useEffect(() => {
    if (menuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prevOverflow; };
    }
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const handleHeroCTA = useCallback(() => {
    if (isAuthenticated) navigate(buildPlansPath({ tab: 'explore' }));
    else navigate('/register');
  }, [isAuthenticated, navigate]);

  const handleBottomCTA = useCallback(() => {
    if (isAuthenticated) navigate(buildPlansPath({ tab: 'find' }));
    else navigate('/register');
  }, [isAuthenticated, navigate]);

  const renderPricingCard = useCallback(
    (plan) => <PricingCard plan={plan} navigate={navigate} isAuthenticated={isAuthenticated} />,
    [navigate, isAuthenticated]
  );

  return (
    <>
      <style>{LANDING_STYLES}</style>

      <div className="vitalis-landing light-theme grain dm w-screen min-h-screen bg-(--bg) text-(--text) overflow-x-hidden">
        {canHover && !prefersReducedMotion && <CursorGlow enabled />}

        <motion.nav
          animate={{ borderBottomColor: scrolled ? THEME.border : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)', backgroundColor: scrolled ? THEME.navBg : 'transparent' }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 right-0 z-100 border-b border-transparent"
        >
          <div className="max-w-360 mx-auto px-4 sm:px-8 h-16 sm:h-20 flex justify-between items-center">
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 sm:gap-3"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.accent, boxShadow: `0 0 20px ${THEME.shadow}` }}>
                <Icon name="pulse_alert" className="text-[#0a1000] text-lg" />
              </div>
              <span className="bebas text-xl sm:text-2xl tracking-wider" style={{ color: navInk(1) }}>Vitalis</span>
            </motion.button>

            <div className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map(({ href, label }, i) => (
                <motion.a
                  key={href} href={href}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-[11px] font-bold transition-colors tracking-[0.2em] uppercase relative group"
                  style={{ color: navInk(0.65) }}
                  onMouseEnter={e => { if (canHover) e.currentTarget.style.color = THEME.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.color = navInk(0.65); }}
                >
                  {label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-(--accent) group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                onClick={() => navigate('/login')}
                className="hidden sm:block text-[11px] font-bold uppercase tracking-widest transition-colors"
                style={{ color: navInk(0.75) }}
              >Sign In</motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
                onClick={() => navigate('/register')}
                className="hidden sm:block px-5 lg:px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: THEME.accent, color: '#000', boxShadow: `0 0 30px ${THEME.shadow}` }}
              >Join the Lab</motion.button>
              <button
                type="button"
                onClick={(e) => { setMenuOpen(o => !o); e.currentTarget.blur(); }}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="lg:hidden flex flex-col gap-1.5 w-10 h-10 justify-center items-center rounded-xl transition-colors"
                style={{ backgroundColor: 'transparent' }}
              >
                <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }} className="w-5 h-0.5 block origin-center" style={{ backgroundColor: navInk(1) }} />
                <motion.span animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }} className="w-5 h-0.5 block" style={{ backgroundColor: navInk(1) }} />
                <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }} className="w-5 h-0.5 block origin-center" style={{ backgroundColor: navInk(1) }} />
              </button>
            </div>
          </div>
        </motion.nav>

        <div id="mobile-menu">
          <MobileMenu open={menuOpen} onClose={closeMenu} navigate={navigate} canHover={canHover} />
        </div>

        <section ref={heroRef} className="hero-min-h relative flex flex-col justify-end pb-14 sm:pb-24 pt-20 overflow-hidden">
          <motion.div className="absolute inset-0" style={{ y: heroY }}>
            <img
              src={GYM_BG_FALLBACK}
              srcSet={GYM_BG_SRCSET}
              sizes="100vw"
              alt=""
              aria-hidden
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-center"
              style={{ filter: HERO_FILTER }}
            />
            <div className="absolute inset-0" style={HERO_GRADIENT_VERTICAL} />
            <div className="absolute inset-0" style={HERO_GRADIENT_HORIZONTAL} />
            <div className="absolute inset-0 scanline opacity-40" />
          </motion.div>
          <div className="absolute top-20 left-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] sm:blur-[150px] pointer-events-none" style={HERO_GLOW_TOP_LEFT_STYLE} />
          <div className="absolute bottom-0 right-[5%] w-[240px] sm:w-[400px] h-[240px] sm:h-[400px] rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" style={HERO_GLOW_BOTTOM_RIGHT_STYLE} />

          <motion.div className="relative z-10 max-w-360 mx-auto w-full px-5 sm:px-8" style={{ opacity: heroOpacity }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex items-center gap-3 mb-8 sm:mb-12">
              <div className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-full border backdrop-blur-sm" style={{ borderColor: HERO_BORDER, backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
                  <span className="pulse-ring absolute inline-block w-2 h-2 rounded-full" style={{ backgroundColor: accentAlpha(50) }} />
                  <span className="relative w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accent, boxShadow: `0 0 8px ${THEME.accent}` }} />
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em]" style={{ color: HERO_TEXT_SOFT }}>Institutional Grade Biometrics</span>
              </div>
            </motion.div>

            <div className="hero-text overflow-hidden mb-6 sm:mb-10">
              {['BEYOND', 'FITNESS.'].map((word, i) => (
                <motion.div
                  key={word}
                  initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.4 + i * 0.12, ease: EASE_EXPO }}
                  className={i === 1 ? 'italic' : ''}
                  style={{ color: i === 1 ? HERO_TEXT_FAINT : HERO_TEXT_WHITE }}
                >{word}</motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.75 }} className="flex flex-col gap-8 max-w-lg">
              <p className="text-base sm:text-lg leading-relaxed font-medium" style={{ color: HERO_TEXT_SOFT }}>
                Vitalis is a high-performance OS for the human body. We bridge the gap between clinical data and daily action.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleHeroCTA}
                  className="flex-1 sm:flex-none px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] transition-all hover:-translate-y-1 active:translate-y-0 whitespace-nowrap text-center"
                  style={{ backgroundColor: THEME.accent, color: '#0a1000', boxShadow: `0 20px 50px ${THEME.shadow}` }}
                >
                  Initiate Protocol
                </button>
                <button
                  type="button"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl border transition-all group whitespace-nowrap"
                  style={{ borderColor: HERO_BORDER, color: HERO_TEXT_SOFT }}
                  onMouseEnter={e => { if (canHover) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = HERO_TEXT_WHITE; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = HERO_BORDER; e.currentTarget.style.color = HERO_TEXT_SOFT; }}
                >
                  <PlayCircle size={20} strokeWidth={2} className="shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Watch Film</span>
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {HERO_AVATAR_ALPHAS.map((pct, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2"
                      style={{ borderColor: 'rgba(0,0,0,0.5)', backgroundColor: accentAlpha(pct + 20) }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium" style={{ color: HERO_TEXT_MUTED }}>
                  Joined by <span style={{ color: HERO_TEXT_WHITE, fontWeight: 700 }}>{userCountLabel}</span> athletes worldwide
                </span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: HERO_TEXT_FAINT }}>Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${HERO_TEXT_FAINT}, transparent)` }}
            />
          </motion.div>
        </section>

        <Marquee />

        <section className="py-14 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: THEME.bg }}>
          <div className="max-w-360 mx-auto">
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 border rounded-2xl p-6 sm:p-12 relative overflow-hidden"
              style={{ borderColor: ink(0.05), backgroundColor: THEME.bgSecondary }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${accentAlpha(8)}, transparent)` }} />
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentAlpha(40)}, transparent)` }} />
              {aboutStats.map((s) => <StatCounter key={s.label} {...s} />)}
            </div>
          </div>
        </section>

        <section id="features" className="py-14 sm:py-24 lg:py-32 px-5 sm:px-8 relative overflow-hidden" style={{ backgroundColor: THEME.bg }}>
          <div className="section-num absolute -top-4 -left-4 select-none pointer-events-none">FEAT</div>
          <div className="max-w-360 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-20 gap-6 sm:gap-8">
              <div>
                <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-[11px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: THEME.accent }}>The Infrastructure</motion.p>
                <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: EASE_EXPO }}
                  className="bebas leading-none" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', letterSpacing: '0.01em', color: THEME.textStrong }}
                >Engineered for<br /><span style={{ color: ink(0.15) }}>The 1%.</span></motion.h2>
              </div>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-xs text-sm font-medium leading-relaxed border-l-2 pl-6"
                style={{ color: ink(0.3), borderColor: accentAlpha(30) }}
              >Our proprietary models are trained on over {formatCompact(liveStats.dataPoints)} athletic data points to provide accuracy where others guess.</motion.p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} index={i} canHover={canHover} />)}
            </div>
          </div>
        </section>

        <section id="about" className="cv-auto py-14 sm:py-24 lg:py-32 px-5 sm:px-8 relative overflow-hidden" style={{ backgroundColor: THEME.bgAlt }}>
          <div className="section-num absolute -top-4 right-0 select-none pointer-events-none">ABOT</div>
          <div className="max-w-360 mx-auto">
            <div className="text-center mb-14 sm:mb-24">
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[11px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: THEME.accent }}>Our Story</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_EXPO }}
                className="bebas leading-none mb-6" style={{ fontSize: 'clamp(2.5rem, 9vw, 7rem)', letterSpacing: '0.01em', color: THEME.textStrong }}
              >Redefining Human <span className="glow-text" style={{ color: THEME.accent }}>Performance</span></motion.h2>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-medium" style={{ color: ink(0.35) }}
              >Vitalis was born from a simple question: What if technology could truly understand human biology and help us perform at our peak, every single day?</motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-16 sm:mb-24">
              {ABOUT_MISSION_VISION.map((item, i) => (
                <motion.div
                  key={item.title} initial={{ opacity: 0, x: i === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_EXPO }}
                  className="group relative rounded-2xl p-7 sm:p-10 overflow-hidden border transition-colors"
                  style={{ backgroundColor: THEME.bgSecondary, borderColor: ink(0.06) }}
                  onMouseEnter={e => { if (canHover) e.currentTarget.style.borderColor = accentAlpha(20); }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ink(0.06); }}
                >
                  <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={ABOUT_HOVER_GLOW_STYLE} />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: accentAlpha(10) }}>
                    <Icon name={item.icon} className="text-2xl" />
                  </div>
                  <h3 className="bebas text-3xl sm:text-4xl mb-4 tracking-wide" style={{ color: THEME.textStrong }}>{item.title}</h3>
                  <p className="leading-relaxed text-sm sm:text-base" style={{ color: ink(0.4) }}>{item.body}</p>
                </motion.div>
              ))}
            </div>

            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[11px] font-black uppercase tracking-[0.4em] mb-4 text-center" style={{ color: THEME.accent }}>What We Believe</motion.p>
            <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bebas text-center mb-10 sm:mb-16" style={{ fontSize: 'clamp(2.25rem, 6vw, 5rem)', color: THEME.textStrong }}>Core Values</motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ABOUT_VALUES.map((v, i) => (
                <motion.div
                  key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="group rounded-2xl p-6 border transition-all duration-300"
                  style={{ backgroundColor: ink(0.03), borderColor: ink(0.05) }}
                  onMouseEnter={e => { if (canHover) { e.currentTarget.style.borderColor = accentAlpha(25); e.currentTarget.style.backgroundColor = ink(0.05); } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ink(0.05); e.currentTarget.style.backgroundColor = ink(0.03); }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: accentAlpha(10) }}>
                    <Icon name={v.icon} className="text-lg" />
                  </div>
                  <h4 className="font-black text-base mb-2 dm" style={{ color: THEME.textStrong }}>{v.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: ink(0.35) }}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="cv-auto py-14 sm:py-24 lg:py-32 px-5 sm:px-8 relative overflow-hidden" style={{ backgroundColor: THEME.bg }}>
          <div className="section-num absolute -top-4 -left-4 select-none pointer-events-none">PRCE</div>
          <div className="max-w-360 mx-auto">
            <div className="text-center mb-14 sm:mb-20">
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[11px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: THEME.accent }}>Plans</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_EXPO }}
                className="bebas mb-4" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', color: THEME.textStrong }}
              >Access the Lab.</motion.h2>
              <p className="max-w-sm mx-auto text-sm font-medium" style={{ color: ink(0.35) }}>Transparent pricing for lifelong optimization.</p>
            </div>

            <div className="md:hidden">
              <HorizontalSlider
                items={PRICING}
                itemWidth="w-[80vw] max-w-[320px]"
                canHover={canHover}
                renderItem={renderPricingCard}
              />
            </div>
            <div className="hidden md:grid grid-cols-3 gap-5 max-w-5xl mx-auto">
              {PRICING.map((plan, i) => (
                <motion.div key={plan.name} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.7, delay: i * 0.1, ease: EASE_EXPO }}>
                  <PricingCard plan={plan} navigate={navigate} isAuthenticated={isAuthenticated} />
                </motion.div>
              ))}
            </div>

            <p className="text-center text-[11px] uppercase tracking-widest mt-10 font-bold" style={{ color: ink(0.2) }}>
              No contracts, cancel anytime, 30-day money-back guarantee
            </p>
          </div>
        </section>

        <section className="cv-auto py-14 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: THEME.bg }}>
          <div className="max-w-360 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE_EXPO }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl px-6 sm:px-14 py-12 sm:py-20"
              style={{ backgroundColor: THEME.accent }}
            >
              <div className="absolute -right-8 -bottom-8 bebas text-[80px] sm:text-[200px] text-black/9 leading-none select-none pointer-events-none">EVOLVE</div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" style={CTA_GLOW_STYLE} />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 sm:gap-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-black/40 mb-3">Start Today</p>
                  <h2 className="bebas text-black leading-none mb-4" style={{ fontSize: 'clamp(2.25rem, 7vw, 5.5rem)' }}>Ready to Evolve?</h2>
                  <p className="text-black/50 text-sm font-medium max-w-xs">Join {userCountLabel} athletes already training with clinical-grade intelligence.</p>
                </div>
                <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
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

        <footer className="cv-auto border-t" style={{ borderColor: ink(0.05), backgroundColor: THEME.bgFooter }}>
          <div className="max-w-360 mx-auto px-5 sm:px-8">

            <div className="py-12 sm:py-14 flex flex-col sm:flex-row sm:items-start justify-between gap-8 sm:gap-10">

              <div className="max-w-[260px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: THEME.accent, boxShadow: `0 0 16px ${accentAlpha(25)}` }}>
                    <Icon name="pulse_alert" className="text-[#0a1000] text-base" />
                  </div>
                  <span className="bebas text-2xl tracking-wider" style={{ color: THEME.textStrong }}>Vitalis</span>
                </div>
                <p className="text-sm leading-relaxed font-medium mb-6" style={{ color: ink(0.2) }}>
                  The world's most advanced human performance platform.
                </p>
                <div className="flex items-center gap-2">
                  {SOCIAL_LINKS.map((item) => (
                    <a
                      key={item.label}
                      href="#"
                      aria-label={item.label}
                      className="w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-300 group"
                      style={{ backgroundColor: ink(0.05), borderColor: ink(0.08) }}
                      onMouseEnter={e => { if (canHover) { e.currentTarget.style.backgroundColor = THEME.accent; e.currentTarget.style.borderColor = THEME.accent; } }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ink(0.05); e.currentTarget.style.borderColor = ink(0.08); }}
                    >
                      <Icon name={item.icon} className="text-base" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex gap-10 sm:gap-16">
                {FOOTER_COLUMNS.map((col) => (
                  <div key={col.heading}>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: ink(0.25) }}>{col.heading}</h4>
                    <ul className="flex flex-col gap-2.5">
                      {col.links.map((link) => (
                        <li key={link}>
                          <a
                            href="#"
                            className="text-[12px] font-medium transition-colors"
                            style={{ color: ink(0.3) }}
                            onMouseEnter={e => { if (canHover) e.currentTarget.style.color = THEME.accent; }}
                            onMouseLeave={e => { e.currentTarget.style.color = ink(0.3); }}
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px" style={{ backgroundColor: ink(0.05) }} />

            <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <p className="text-[11px] font-medium tracking-wide" style={{ color: ink(0.2) }}>
                Copyright 2026 <span className="font-bold" style={{ color: ink(0.35) }}>Vitalis Labs Inc.</span> All rights reserved.
              </p>
              <p className="text-[11px] font-medium tracking-wide" style={{ color: ink(0.2) }}>
                Developed by <span className="font-bold" style={{ color: ink(0.35) }}>STC Students</span>
              </p>
            </div>

          </div>
        </footer>

      </div>
    </>
  );
};

export default Landing;