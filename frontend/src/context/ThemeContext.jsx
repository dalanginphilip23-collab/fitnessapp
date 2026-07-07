// context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'vitalis_theme';

const canUseViewTransition = () =>
  typeof document !== 'undefined' &&
  typeof document.startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
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

  const applyTheme = useCallback((updateFn) => {
    if (canUseViewTransition()) {
      setIsTransitioning(true);
      const transition = document.startViewTransition(() => {
        updateFn();
      });
      transition.finished.finally(() => setIsTransitioning(false));
    } else {
      updateFn();
    }
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark')));
  }, [applyTheme]);

  const setThemeValue = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      applyTheme(() => setTheme(newTheme));
    }
  }, [applyTheme]);

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