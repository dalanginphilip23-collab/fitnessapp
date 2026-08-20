import { useEffect } from 'react';

// Locks body scroll while `locked` is true (modal/drawer open) and restores
// the exact previous overflow value on cleanup so nested locks compose safely.
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [locked]);
}
