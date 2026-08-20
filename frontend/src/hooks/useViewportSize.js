import { useState, useEffect } from "react";

/**
 * Tracks real pixel viewport size via JS instead of CSS vh/dvh units.
 * Needed because standalone/installed PWAs (especially iOS home-screen
 * apps) frequently report an inaccurate viewport through CSS units,
 * causing "fullscreen" overlays to fall short of the real screen size.
 */
export function useViewportSize() {
  const [size, setSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    // Standalone iOS PWAs sometimes report a stale size immediately on mount;
    // a short delayed re-check catches that.
    const t = setTimeout(update, 150);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      clearTimeout(t);
    };
  }, []);

  return size;
}