import React from 'react';

const Toast = ({ message, type, visible }) => {
  if (!visible) return null;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-full
        text-[11px] font-bold border backdrop-blur-md whitespace-nowrap transition-all
        ${type === 'error'
          ? 'bg-red-500/10 border-red-500/20 text-red-400'
          : type === 'warn'
          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
          : 'bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]'}`}
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}
    >
      {message}
    </div>
  );
};

export default Toast;