import { useState, useCallback } from 'react';
import usePWAInstall from '../hooks/usePWAInstall';
import InstallSheet from './InstallSheet';

/**
 * Smart Download / Install button.
 * - Android + Desktop Chromium with captured prompt -> native install popup.
 * - Anything else (or dismissed popup) -> opens the install sheet with
 *   exact device-specific steps, so every tap visibly does something.
 */
export default function InstallButton({ variant = 'primary', className = '', label = 'Download App' }) {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  const [busy, setBusy] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const openSheet = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const handleClick = async () => {
    if (canInstall && !isInstalled) {
      setBusy(true);
      try {
        const outcome = await promptInstall();
        // Accepted -> the browser takes over (install UI). Anything else
        // (dismissed / stale / unavailable) -> show the manual-steps sheet.
        if (outcome === 'accepted') return;
      } finally {
        setBusy(false);
      }
    }
    setSheetOpen(true);
  };

  const isPrimary = variant === 'primary';
  const resolvedLabel = isInstalled ? 'Install Vitalis' : busy ? 'Preparing…' : label;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={`inline-flex items-center justify-center gap-2 h-[52px] px-7 rounded-full font-black text-[12px] tracking-[0.14em] uppercase transition-all active:scale-[0.98] disabled:opacity-70 ${
          isPrimary ? 'hover:scale-[1.01] shadow-lg' : 'border hover:bg-[var(--bg-hover)]'
        } ${className}`}
        style={
          isPrimary
            ? { background: 'var(--accent)', color: '#0a1000', boxShadow: '0 10px 30px rgba(139,195,74,0.28)', fontFamily: 'Poppins, sans-serif' }
            : { background: 'transparent', color: 'var(--text-primary)', borderColor: 'var(--border-medium)', fontFamily: 'Poppins, sans-serif' }
        }
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          download
        </span>
        {resolvedLabel}
      </button>
      <InstallSheet open={sheetOpen} onClose={closeSheet} />
    </>
  );
}
