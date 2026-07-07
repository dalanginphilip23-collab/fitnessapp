// context/ThemeContext.jsx
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
  // Batch via a single style attribute write where possible; setProperty per
  // key is still cheap since these are custom properties, not layout-forcing
  // properties, and no stylesheet text is being touched.
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Apply theme class + CSS variables to document.
  // This is the ONLY place that should touch document styles on theme change.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(`${theme}-theme`);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyThemeVars(theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      // Only update if user hasn't manually set a preference
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsTransitioning(true);
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    setTimeout(() => setIsTransitioning(false), 500);
  }, []);

  const setThemeValue = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setIsTransitioning(true);
      setTheme(newTheme);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, []);

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