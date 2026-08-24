import { useCallback, useState } from 'react';

const KEY = 'vitalis_onboarding_seen';

function getForced() {
  try {
    const p = new URLSearchParams(window.location.search);
    if (p.get('onboarding') === '1') return false;
    if (p.get('onboarding') === '0') return true;
  } catch {
    // ignore
  }
  return null;
}

export default function useOnboardingSeen() {
  const [seen, setSeen] = useState(() => {
    const forced = typeof window !== 'undefined' ? getForced() : null;
    if (forced !== null) return forced;
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      // ignore
    }
    setSeen(true);
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    setSeen(false);
  }, []);

  return { seen, markSeen, reset };
}
