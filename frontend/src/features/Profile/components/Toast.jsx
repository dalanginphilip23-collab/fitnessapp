// components/Toast.jsx
import React, { useEffect } from 'react';

/**
 * Toast
 *
 * Replaces the heavy SuccessModal for non-critical confirmations like
 * "profile saved" or "session revoked". The full-screen modal overlay
 * was disproportionate for those feedback moments.
 *
 * Use SuccessModal (see below) only for genuinely critical confirms
 * (e.g. account deletion, destructive irreversible actions).
 *
 * Theme note: 'success' and 'error' variants intentionally keep solid,
 * non-theme-dependent backgrounds (accent green / red) with contrasting
 * text, so they look identical and stay legible in both themes.
 * The 'info' variant previously used bg-white/10 + text-white, which is
 * invisible on a light background — now uses CSS variables instead.
 *
 * Props:
 *   message     — string to display
 *   visible     — boolean
 *   onDismiss   — () => void   (called after auto-dismiss)
 *   duration    — ms before auto-dismiss (default: 2800)
 *   variant     — 'success' | 'error' | 'info'  (default: 'success')
 */
const VARIANTS = {
  success: {
    bg: 'bg-[#c7f248]',
    text: 'text-[#1a2800]',
    icon: 'check_circle',
  },
  error: {
    bg: 'bg-red-500',
    text: 'text-white',
    icon: 'error',
  },
  info: {
    bg: 'bg-[var(--bg-card)] backdrop-blur border border-[var(--border-medium)]',
    text: 'text-[var(--text-primary)]',
    icon: 'info',
  },
};

const Toast = ({
  message,
  visible,
  onDismiss,
  duration = 2800,
  variant = 'success',
}) => {
  const v = VARIANTS[variant] ?? VARIANTS.success;

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-[110] flex items-center gap-2.5
        px-5 py-3 rounded-full shadow-xl pointer-events-none
        transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${v.bg} ${v.text}
        ${visible
          ? 'opacity-100 translate-x-[-50%] translate-y-0'
          : 'opacity-0 translate-x-[-50%] translate-y-6'
        }`}
    >
      <span className="material-symbols-outlined text-[17px]">{v.icon}</span>
      <span className="text-[11px] font-black uppercase tracking-[0.08em] whitespace-nowrap">
        {message}
      </span>
    </div>
  );
};

export default Toast;