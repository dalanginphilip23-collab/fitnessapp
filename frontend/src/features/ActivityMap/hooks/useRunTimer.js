import { useState, useEffect, useRef } from 'react';

// ─── Haversine distance (meters) between two [lat, lng] points ───────────────
const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const useRunTimer = (isRecording, locationStatus, setPath, path) => {
  const [metrics, setMetrics] = useState({
    time: 0,
    distance: 0,
    pace: "0'00\"",
    calories: 0,
  });
  const [splits, setSplits] = useState([]);

  const timerRef      = useRef(null);
  const splitsRef     = useRef([]);
  const lastSplitRef  = useRef(0);
  const prevPathRef   = useRef(path);

  // Keep prevPathRef in sync with latest path
  useEffect(() => {
    prevPathRef.current = path;
  }, [path]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setMetrics((prev) => {
          const t = prev.time + 1;

          // ── Real GPS distance ──────────────────────────────────────────────
          let d = prev.distance;
          const currentPath = prevPathRef.current;
          if (
            locationStatus === 'granted' &&
            currentPath.length >= 2
          ) {
            const last  = currentPath[currentPath.length - 1];
            const prev2 = currentPath[currentPath.length - 2];
            const deltaM = haversineDistance(prev2, last);
            // Ignore GPS jitter (< 1m or > 50m per second are noise)
            if (deltaM > 1 && deltaM < 50) {
              d = prev.distance + deltaM / 1000; // convert to km
            }
          } else if (locationStatus !== 'granted') {
            // Mock movement when GPS unavailable
            d = prev.distance + 0.002;
          }

          // ── Pace (min/km) ──────────────────────────────────────────────────
          const ps   = d > 0 ? t / d : 0;
          const pm   = Math.floor(ps / 60);
          const pc   = Math.floor(ps % 60);
          const pace = `${pm}'${pc.toString().padStart(2, '0')}"`;

          // ── Calories (MET ~8 for running, avg 70 kg) ──────────────────────
          const cal = Math.floor(d * 60);

          // ── Splits ────────────────────────────────────────────────────────
          const km = Math.floor(d);
          if (km > lastSplitRef.current) {
            lastSplitRef.current = km;
            const ns = { km: splitsRef.current.length + 1, pace };
            splitsRef.current = [...splitsRef.current, ns];
            setSplits([...splitsRef.current]);
          }

          return { time: t, distance: d, pace, calories: cal };
        });

        // Mock path movement when GPS is not available
        if (locationStatus !== 'granted') {
          setPath((prev) => {
            const last = prev[prev.length - 1];
            return [
              ...prev,
              [
                last[0] + (Math.random() - 0.48) * 0.0003,
                last[1] + 0.00018,
              ],
            ];
          });
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording, locationStatus, setPath]);

  const resetMetrics = () => {
    setMetrics({ time: 0, distance: 0, pace: "0'00\"", calories: 0 });
    setSplits([]);
    splitsRef.current    = [];
    lastSplitRef.current = 0;
  };

  return {
    metrics,
    splits,
    splitsRef,
    resetMetrics,
  };
};