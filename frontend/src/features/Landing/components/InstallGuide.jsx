import usePWAInstall from '../hooks/usePWAInstall';

const STEP_NUM_STYLE = {
  width: 22,
  height: 22,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 11,
  fontWeight: 800,
  flexShrink: 0,
  background: 'color-mix(in srgb, var(--accent) 16%, transparent)',
  color: 'var(--accent)',
};

function Step({ n, children }) {
  return (
    <li className="flex gap-2.5 items-start">
      <span style={STEP_NUM_STYLE}>{n}</span>
      <span>{children}</span>
    </li>
  );
}

/**
 * Device-aware install instructions shown in the #download section.
 * Covers every case: native prompt ready, manual browser-menu fallback
 * (works even when the automatic popup never appears), iPhone steps,
 * and the already-installed state.
 */
export default function InstallGuide() {
  const { canInstall, isInstalled, isIOS } = usePWAInstall();

  if (isInstalled) {
    return (
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--accent)' }}>Vitalis is installed on this device.</strong>
        <br />
        Open it from your home screen or app drawer — your account syncs everywhere.
      </p>
    );
  }

  if (isIOS) {
    return (
      <ol className="space-y-2.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        <Step n="1">
          Tap the <strong>Share</strong> icon in Safari&apos;s bottom toolbar.
        </Step>
        <Step n="2">
          Scroll down and tap <strong>Add to Home Screen</strong>.
        </Step>
        <Step n="3">
          Tap <strong>Add</strong> in the top-right corner — Vitalis appears on your home screen.
        </Step>
        <p className="text-[12px] pt-1" style={{ color: 'var(--text-muted)' }}>
          Note: Apple doesn&apos;t allow one-tap installs, so iPhone always uses these manual steps. No App Store needed.
        </p>
      </ol>
    );
  }

  if (canInstall) {
    return (
      <ol className="space-y-2.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        <Step n="1">
          Tap <strong>Download App</strong> above, then confirm <strong>Install</strong> in the popup.
        </Step>
        <Step n="2">
          No popup appearing? Open the browser menu (<strong>⋮</strong>) and tap{' '}
          <strong>Install app</strong> / <strong>Add to Home screen</strong>.
        </Step>
        <Step n="3">
          Open Vitalis from your home screen and sign in.
        </Step>
      </ol>
    );
  }

  return (
    <ol className="space-y-2.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
      <Step n="1">
        <span>
          <strong>Android (Chrome):</strong> tap <strong>⋮ menu → Add to Home screen → Install</strong>.
        </span>
      </Step>
      <Step n="2">
        <span>
          <strong>Desktop (Chrome / Edge):</strong> click the <strong>install icon</strong> at the right side of the
          address bar, then <strong>Install</strong>.
        </span>
      </Step>
      <Step n="3">
        <span>
          <strong>iPhone (Safari):</strong> tap <strong>Share → Add to Home Screen → Add</strong>.
        </span>
      </Step>
      <p className="text-[12px] pt-1" style={{ color: 'var(--text-muted)' }}>
        Tip: the automatic popup only appears in Chrome/Edge after the page fully loads. If you just opened the
        site, wait a few seconds and reload once.
      </p>
    </ol>
  );
}
