// components/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleClick = (e) => {
    const { clientX, clientY } = e;
    document.documentElement.style.setProperty('--toggle-x', `${clientX}px`);
    document.documentElement.style.setProperty('--toggle-y', `${clientY}px`);
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
      style={{ color: 'var(--text)' }}
    >
      <span className="material-symbols-outlined text-xl">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;