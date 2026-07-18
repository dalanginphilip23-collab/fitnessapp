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

function PlusSquareIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

export default function IOSInstallBanner() {
  const { shouldShow, dismiss } = useShouldShowIOSInstallBanner();

  if (!shouldShow) return null;

  return (
    <>
      {/* Backdrop - dims the page so attention goes to the banner + pointer */}
      <div
        className="fixed inset-0 bg-black/30 z-30"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Animated pointer aimed at Safari's real Share icon (bottom-center toolbar on iPhone) */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none">
        <span className="text-(--text-primary) text-xs font-medium mb-1 bg-(--bg-tertiary) px-2 py-1 rounded-full shadow">
          Tap here in Safari
        </span>
        <div className="animate-bounce">
          <svg width="20" height="20" viewBox="0 0 24 24" className="text-(--accent)">
            <path d="M12 4v14m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>

      {/* Main instructional card */}
      <div
        role="dialog"
        aria-label="Install this app"
        className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-96 z-40 bg-(--bg-tertiary) border border-(--border-light) rounded-[var(--card-radius-md)] shadow-lg p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-(--accent-bg) flex items-center justify-center shrink-0">
            <ShareIcon className="w-4.5 h-4.5 text-(--accent)" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-(--text-primary) text-sm font-semibold leading-snug">
              Install this app on your iPhone
            </p>
            <p className="text-(--text-muted) text-xs mt-1 leading-relaxed">
              This icon is just a reference — tap the real{" "}
              <strong className="text-(--text-secondary)">Share icon</strong> in Safari's own toolbar below.
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

        {/* Step-by-step, numbered so it reads as instructions not a control */}
        <ol className="mt-3 space-y-2 border-t border-(--border-light) pt-3">
          <li className="flex items-center gap-2 text-xs text-(--text-secondary)">
            <span className="w-5 h-5 rounded-full bg-(--accent-bg) text-(--accent) flex items-center justify-center font-semibold shrink-0">1</span>
            <ShareIcon className="w-3.5 h-3.5 text-(--text-muted) shrink-0" />
            Tap the Share icon in Safari's toolbar
          </li>
          <li className="flex items-center gap-2 text-xs text-(--text-secondary)">
            <span className="w-5 h-5 rounded-full bg-(--accent-bg) text-(--accent) flex items-center justify-center font-semibold shrink-0">2</span>
            <PlusSquareIcon className="w-3.5 h-3.5 text-(--text-muted) shrink-0" />
            Scroll down and tap "Add to Home Screen"
          </li>
          <li className="flex items-center gap-2 text-xs text-(--text-secondary)">
            <span className="w-5 h-5 rounded-full bg-(--accent-bg) text-(--accent) flex items-center justify-center font-semibold shrink-0">3</span>
            Tap "Add" in the top right corner
          </li>
        </ol>
      </div>
    </>
  );
}