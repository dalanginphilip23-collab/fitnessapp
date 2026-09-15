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
  const [swState, setSwState] = useState({ supported: null, registered: false, controlling: false });

  // Service-worker health check (registration happens on window load
  // via registerSW.js, so we check now and re-check after load settles).
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setSwState({ supported: false, registered: false, controlling: false });
      return;
    }
    let cancelled = false;
    const check = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!cancelled) {
          setSwState({
            supported: true,
            registered: !!reg,
            controlling: !!navigator.serviceWorker.controller,
          });
        }
      } catch {
        if (!cancelled) setSwState({ supported: true, registered: false, controlling: false });
      }
    };
    check();
    const t = setTimeout(check, 2500);
    const onControllerChange = () => check();
    if (navigator.serviceWorker.addEventListener) {
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    }
    return () => {
      cancelled = true;
      clearTimeout(t);
      if (navigator.serviceWorker.removeEventListener) {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      }
    };
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log('[vitalis-pwa] install prompt captured and ready');
      setDeferredPrompt(e);
    };
    const onAppInstalled = () => {
      console.log('[vitalis-pwa] app installed');
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
    // A captured prompt can go stale (e.g. already used by another
    // button instance) — never let that throw or wedge the UI.
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      return outcome; // 'accepted' | 'dismissed'
    } catch {
      return 'unavailable';
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const canInstall = Boolean(deferredPrompt) && !isInstalled;
  // ready: browser handed us the install popup | waiting: supported browser,
  // popup not seen yet (reload usually fixes) | unsupported: e.g. iPhone, in-app browsers
  const promptState = isIOS ? 'unsupported' : canInstall ? 'ready' : 'waiting';

  return {
    canInstall,
    isInstalled,
    isIOS,
    promptInstall,
    promptState,
    swState,
  };
};

export default usePWAInstall;
