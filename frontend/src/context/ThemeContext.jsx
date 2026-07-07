import React, { createContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'vitalis_theme';
const THEME_VARS = {
  dark: {
    '--accent': '#8FBF63',
    '--accent-glow': 'rgba(143,191,99,0.3)',
    '--bg': '#080808',
    '--bg-alt': '#0a0a0a',
    '--bg-secondary': '#0f0f0f',
    '--bg-footer': '#060606',
    '--bg-menu': '#060606',
    '--text': '#e5e2e1',
    '--text-strong': '#ffffff',
    '--text-soft': 'rgba(255,255,255,0.35)',
    '--border-color': 'rgba(255,255,255,0.08)',
    '--nav-bg': 'rgba(8,8,8,0.95)',
    '--selection-bg': '#8FBF63',
    '--selection-text': '#000000',
    '--shadow-color': 'rgba(143,191,99,0.3)',
    '--grain-opacity': '0.03',
    '--section-num-color': 'rgba(255,255,255,0.03)',
    '--ink-base': '255 255 255',
    '--bg-marquee': '#0a0a0a',
  },
  light: {
    '--accent': '#5E9E4A',
    '--accent-glow': 'rgba(94,158,74,0.2)',
    '--bg': '#f5f5f5',
    '--bg-alt': '#ffffff',
    '--bg-secondary': '#ffffff',
    '--bg-footer': '#ffffff',
    '--bg-menu': '#ffffff',
    '--text': '#141414',
    '--text-strong': '#141414',
    '--text-soft': 'rgba(20,20,20,0.55)',
    '--border-color': 'rgba(0,0,0,0.1)',
    '--nav-bg': 'rgba(255,255,255,0.95)',
    '--selection-bg': '#5E9E4A',
    '--selection-text': '#ffffff',
    '--shadow-color': 'rgba(94,158,74,0.2)',
    '--grain-opacity': '0.015',
    '--section-num-color': 'rgba(0,0,0,0.03)',
    '--ink-base': '20 20 20',
    '--bg-marquee': '#f0f0f0',
  },
};

const applyThemeVars = (theme) => {
  const root = document.documentElement;
  const vars = THEME_VARS[theme] ?? THEME_VARS.dark;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

// View Transitions require taking a full-page snapshot and animating a
// clip-path over it. That's cheap on a desktop GPU but noticeably heavy on
// mobile GPUs when the page has large blurred elements, a full-bleed photo,
// and dozens of framer-motion nodes (exactly this page). So we only use the
// fancy circle-reveal on devices that can actually afford it — fine pointer
// (mouse) + a reasonably large viewport. Touch/mobile always takes the plain
// CSS-variable crossfade path instead, which is far cheaper.
const supportsViewTransitions = () =>
  typeof document !== 'undefined' &&
  typeof document.startViewTransition === 'function' &&
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// How long the plain (mobile) crossfade transition takes. Must match the
// transition-duration set on the universal selector in themes.css so the
// "theme-switching-plain" class is removed right as the crossfade finishes.
const PLAIN_TRANSITION_MS = 220;

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(`${theme}-theme`);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyThemeVars(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setToggleOrigin = (originX, originY) => {
    const root = document.documentElement;
    const x = originX ?? window.innerWidth / 2;
    const y = originY ?? window.innerHeight / 2;
    root.style.setProperty('--toggle-x', `${x}px`);
    root.style.setProperty('--toggle-y', `${y}px`);
  };

  const runThemeChange = useCallback((nextTheme, originX, originY) => {
    const applyChange = () => setTheme(nextTheme);

    // Reduced motion: just flip instantly, no animation work at all.
    if (prefersReducedMotion()) {
      applyChange();
      return;
    }

    // Mobile / coarse-pointer / small-viewport path: skip the expensive
    // full-page view-transition snapshot entirely. Instead we add a class
    // that (a) lets themes.css run a short, cheap CSS-variable crossfade on
    // a *scoped* set of properties, and (b) pauses decorative animations
    // (marquee, pulse ring, grain) for that same short window so they're not
    // competing with the repaint on the main thread. This is what removes
    // the stutter you see on phones.
    if (!supportsViewTransitions()) {
      setIsTransitioning(true);
      document.documentElement.classList.add('theme-switching-plain');
      applyChange();

      window.setTimeout(() => {
        setIsTransitioning(false);
        document.documentElement.classList.remove('theme-switching-plain');
      }, PLAIN_TRANSITION_MS);
      return;
    }

    // Desktop path: full circle-reveal view transition.
    setToggleOrigin(originX, originY);
    setIsTransitioning(true);
    document.documentElement.classList.add('theme-switching');

    const transition = document.startViewTransition(applyChange);
    transition.finished
      .catch(() => {}) // a transition can be interrupted by a second rapid toggle — not an error
      .finally(() => {
        setIsTransitioning(false);
        document.documentElement.classList.remove('theme-switching');
      });
  }, []);

  const toggleTheme = useCallback((origin) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    runThemeChange(next, origin?.x, origin?.y);
  }, [theme, runThemeChange]);

  const setThemeValue = useCallback((newTheme, origin) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      runThemeChange(newTheme, origin?.x, origin?.y);
    }
  }, [runThemeChange]);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setTheme: setThemeValue,
      isTransitioning,
      isDark: theme === 'dark',
      isLight: theme === 'light',
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;