import { useState, useEffect } from "react";

const DISMISS_KEY = "ios-install-banner-dismissed";
function useShouldShowIOSInstallBanner() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;

    const isIOS = /iphone|ipad|ipod/i.test(ua) && !window.MSStream;
    const isOtherIOSBrowser = /crios|fxios|edgios/i.test(ua);
    const isSafari = isIOS && !isOtherIOSBrowser;
    const isStandalone =
      window.navigator.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    const alreadyDismissed = localStorage.getItem(DISMISS_KEY) === "true";

    setShouldShow(isSafari && !isStandalone && !alreadyDismissed);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setShouldShow(false);
  };

  return { shouldShow, dismiss };
}

function ShareIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

export default function IOSInstallBanner() {
  const { shouldShow, dismiss } = useShouldShowIOSInstallBanner();

  if (!shouldShow) return null;

  return (
    <div
      role="dialog"
      aria-label="Install this app"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 z-40 bg-(--bg-tertiary) border border-(--border-light) rounded-2xl shadow-lg p-4 flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-(--accent-bg) flex items-center justify-center shrink-0">
        <ShareIcon className="w-4.5 h-4.5 text-(--accent)" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-(--text-primary) text-sm font-semibold leading-snug">
          Install this app
        </p>
        <p className="text-(--text-muted) text-xs mt-1 leading-relaxed">
          Tap <ShareIcon className="inline w-3.5 h-3.5 -mt-0.5 text-(--text-secondary)" /> below, then{" "}
          <span className="text-(--text-secondary) font-medium">"Add to Home Screen"</span>.
        </p>
      </div>

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-(--text-muted) hover:text-(--text-primary) text-lg leading-none p-1 -m-1 rounded-lg hover:bg-(--bg-hover) transition-colors"
      >
        ✕
      </button>
    </div>
  );
}