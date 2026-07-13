// components/SuccessModal.jsx
import React from 'react';

/**
 * SuccessModal
 *
 * Keep this for genuinely critical confirmations only —
 * account deletion, irreversible data actions, etc.
 *
 * For lightweight feedback (save, revoke session), use <Toast> instead.
 *
 * Theme-aware version: backgrounds/text now use CSS variables from
 * themes.css so the modal flips correctly between dark-theme / light-theme.
 * Accent color (#c7f248) intentionally left hardcoded in both themes.
 *
 * Props:
 *   title       — modal heading (default: "Saved")
 *   description — body text
 *   onClose     — () => void
 */
const SuccessModal = ({
  title = 'Saved',
  description = 'Your profile has been updated.',
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm bg-[var(--bg-card)] border border-[#c7f248]/25
        rounded-2xl p-8 text-center shadow-2xl
        animate-[fadeScale_0.25s_ease_forwards]">

        {/* Icon */}
        <div className="w-14 h-14 bg-[#c7f248]/10 rounded-full flex items-center
          justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-[28px] text-[#62aa1a]">
            check_circle
          </span>
        </div>

        {/* Copy */}
        <h3
          id="success-title"
          className="text-lg font-['Manrope'] font-black text-[var(--text-primary)] uppercase tracking-tighter mb-2"
        >
          {title}
        </h3>
        <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
          {description}
        </p>

        {/* CTA */}
        <button
          onClick={onClose}
          className="mt-7 w-full py-3 bg-[#62aa1a] text-[#1a2800] text-[10px] font-black
            uppercase tracking-widest rounded-xl hover:brightness-105 active:scale-[0.98]
            transition-all"
        >
          Got it
        </button>
      </div>

      <style>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;