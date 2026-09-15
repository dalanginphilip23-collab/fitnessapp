import { useState, useEffect, useCallback } from 'react';

const isIOSDevice = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /iphone|ipad|ipod/i.test(ua) && !window.MSStream;
};

const isStandaloneDisplay = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
  );
};

/**
 * Captures the `beforeinstallprompt` event (Android / Desktop Chromium)
 * and exposes helpers for a Download / Install App button.
 *
 * iOS Safari has no prompt API — consumers should show manual
 * "Share > Add to Home Screen" instructions when `isIOS && !isInstalled`.
 */
const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneDisplay());
  const [isIOS] = useState(() => isIOSDevice());

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    const onDisplayChange = (e) => {
      if (e.matches) setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    const mq = window.matchMedia ? window.matchMedia('(display-mode: standalone)') : null;
    if (mq) {
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onDisplayChange);
      else if (typeof mq.addListener === 'function') mq.addListener(onDisplayChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      if (mq) {
        if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onDisplayChange);
        else if (typeof mq.removeListener === 'function') mq.removeListener(onDisplayChange);
      }
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return 'unavailable';
    deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return outcome; // 'accepted' | 'dismissed'
    } catch {
      return 'dismissed';
    }
  }, [deferredPrompt]);

  return {
    canInstall: Boolean(deferredPrompt) && !isInstalled,
    isInstalled,
    isIOS,
    promptInstall,
  };
};

export default usePWAInstall;
