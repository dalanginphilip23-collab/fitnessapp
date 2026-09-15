import { useState } from 'react';
import usePWAInstall from '../hooks/usePWAInstall';

const scrollToDownload = () => {
  const el = document.getElementById('download');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/**
 * Smart Download / Install button.
 * - Android + Desktop Chromium with captured prompt -> triggers native install.
 * - iOS / no prompt support -> scrolls to #download guide.
 * - Already installed -> renders Open-style state.
 */
export default function InstallButton({ variant = 'primary', className = '', label = 'Download App' }) {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (isInstalled) {
      scrollToDownload();
      return;
    }
    if (canInstall) {
      setBusy(true);
      const outcome = await promptInstall();
      setBusy(false);
      if (outcome === 'unavailable') scrollToDownload();
      return;
    }
    scrollToDownload();
  };

  const isPrimary = variant === 'primary';
  const resolvedLabel = isInstalled ? 'Open Vitalis' : busy ? 'Preparing…' : label;

  return (
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
      aria-label={isIOS && !isInstalled && !canInstall ? `${resolvedLabel} — see install guide below` : resolvedLabel}
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
        {isInstalled ? 'open_in_new' : 'download'}
      </span>
      {resolvedLabel}
    </button>
  );
}
