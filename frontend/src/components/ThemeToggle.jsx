// components/ThemeToggle.jsx
import React, { useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme, isTransitioning } = useTheme();
  const btnRef = useRef(null);

  const handleClick = () => {
    // Circle-reveal in themes.css expands from --toggle-x/--toggle-y, so we
    // hand it the toggle button's own center — feels like the theme is
    // "pouring out" from the switch itself instead of the whole page
    // just snapping to new colors.
    const rect = btnRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : undefined;
    toggleTheme(origin);
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      disabled={isTransitioning}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center border transition-colors disabled:cursor-wait ${className}`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-strong)',
      }}
    >
      <span className="material-symbols-outlined select-none leading-none text-lg">
        {isDark ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;