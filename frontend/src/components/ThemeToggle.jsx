import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme, isTransitioning } = useTheme();

  const handleClick = (e) => {
    toggleTheme({ x: e.clientX, y: e.clientY });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isTransitioning}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 disabled:cursor-wait hover:bg-(--bg-hover) active:scale-95 ${className}`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-light)',
        color: isDark ? '#fbbf24' : 'var(--text-primary)',
      }}
    >
      <span className="material-symbols-outlined select-none leading-none text-lg">
        {isDark ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;