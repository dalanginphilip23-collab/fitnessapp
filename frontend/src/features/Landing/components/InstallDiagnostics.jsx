import usePWAInstall from '../hooks/usePWAInstall';

function Row({ label, ok, text }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-[12px]">
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="font-bold text-right" style={{ color: ok ? 'var(--accent)' : 'var(--text-primary)' }}>
        {text}
      </span>
    </div>
  );
}

/**
 * Collapsible on-device install check. If Download doesn't work on a
 * phone, expand this and read the three rows — they pinpoint whether the
 * browser blocked the popup, the service worker isn't active yet, or the
 * app is already installed.
 */
export default function InstallDiagnostics() {
  const { promptState, swState, isInstalled } = usePWAInstall();

  const promptRow =
    promptState === 'ready'
      ? { ok: true, text: 'Ready — tap Download' }
      : promptState === 'unsupported'
        ? { ok: false, text: 'Not supported — use manual steps' }
        : { ok: false, text: 'Not seen yet — reload the page' };

  const swRow =
    swState.supported === null
      ? { ok: false, text: 'Checking…' }
      : !swState.supported
        ? { ok: false, text: 'Not supported in this browser' }
        : swState.registered && swState.controlling
          ? { ok: true, text: 'Active' }
          : swState.registered
            ? { ok: false, text: 'Registered — reload once' }
            : { ok: false, text: 'Missing — reload the page' };

  return (
    <details
      className="mt-4 rounded-2xl border px-4 py-2"
      style={{ borderColor: 'var(--border-light)', background: 'var(--bg-primary)' }}
    >
      <summary
        className="cursor-pointer py-2 text-[12px] font-bold tracking-[0.08em] uppercase"
        style={{ color: 'var(--text-secondary)' }}
      >
        Install status — tap to check this phone
      </summary>
      <div className="pb-2 divide-y" style={{ borderColor: 'var(--border-light)' }}>
        <Row label="Install popup" ok={promptRow.ok} text={promptRow.text} />
        <Row label="Offline support" ok={swRow.ok} text={swRow.text} />
        <Row label="Already installed" ok={false} text={isInstalled ? 'Yes' : 'No'} />
      </div>
    </details>
  );
}
