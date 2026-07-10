import React, { createContext, useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'vitalis_theme';

const supportsViewTransitions = () =>
  typeof document !== 'undefined' &&
  typeof document.startViewTransition === 'function' &&
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FADE_OUT_MS = 120;
const FADE_IN_MS = 140;
const DIM_OPACITY = '0.45';

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

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(`${theme}-theme`);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
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
    if (prefersReducedMotion()) {
      setTheme(nextTheme);
      return;
    }

    if (!supportsViewTransitions()) {

      const root = document.documentElement;
      const body = document.body;

      setIsTransitioning(true);
      root.classList.add('theme-switching-plain');
      body.style.opacity = DIM_OPACITY;

      window.setTimeout(() => {
        setTheme(nextTheme);

        requestAnimationFrame(() => {
          body.style.opacity = '1';

          window.setTimeout(() => {
            root.classList.remove('theme-switching-plain');
            body.style.opacity = '';
            setIsTransitioning(false);
          }, FADE_IN_MS);
        });
      }, FADE_OUT_MS);
      return;
    }

    // Desktop path: full circle-reveal view transition.
    setToggleOrigin(originX, originY);
    setIsTransitioning(true);
    document.documentElement.classList.add('theme-switching');

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    transition.finished
      .catch(() => {})
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

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme: setThemeValue,
    isTransitioning,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }), [theme, toggleTheme, setThemeValue, isTransitioning]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;