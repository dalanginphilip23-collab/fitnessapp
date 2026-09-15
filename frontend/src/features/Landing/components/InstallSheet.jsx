import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import InstallGuide from './InstallGuide';
import InstallDiagnostics from './InstallDiagnostics';

/**
 * Bottom-sheet shown when the native install popup isn't available
 * (or was dismissed). Guarantees every Download tap produces a clear,
 * actionable result instead of a silent scroll.
 */
export default function InstallSheet({ open, onClose }) {
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const goToFullGuide = () => {
    onClose();
    // Let the sheet unmount + body scroll restore before scrolling.
    setTimeout(() => {
      document.getElementById('download')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 48 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="w-full sm:max-w-[480px] max-h-[85dvh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] border p-6"
            style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Install Vitalis"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>
                  Install
                </p>
                <h3 className="bebas mt-1" style={{ fontSize: 30, lineHeight: 1, color: 'var(--text-primary)' }}>
                  GET VITALIS ON YOUR PHONE
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                autoFocus
                aria-label="Close install guide"
                className="shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)]"
                style={{ borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="mt-4">
              <InstallGuide />
            </div>

            <button
              type="button"
              onClick={goToFullGuide}
              className="mt-4 text-[12px] font-bold tracking-[0.08em] uppercase hover:underline bg-transparent border-none cursor-pointer"
              style={{ color: 'var(--accent)' }}
            >
              See the full download section ↓
            </button>

            <InstallDiagnostics />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
