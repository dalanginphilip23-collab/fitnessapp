// Elevation helpers for the share card + public viewer.
//
// Route points are [lat, lng, altitude] where altitude may be null on
// devices that don't report it. All functions degrade gracefully when
// altitude data is missing (they return null so the UI hides elevation).

const R_EARTH = 6371000;

const toRad = (deg) => (deg * Math.PI) / 180;

export function haversine([lat1, lon1], [lat2, lon2]) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R_EARTH * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Cumulative distance (km) along a route of [lat, lng, alt?] points.
function cumulativeDistance(route) {
  const dist = [0];
  for (let i = 1; i < route.length; i++) {
    dist.push(dist[i - 1] + haversine(route[i - 1], route[i]) / 1000);
  }
  return dist;
}

// ─── Elevation gain ──────────────────────────────────────────────────────────
// Sums the positive altitude deltas between consecutive points that both have
// a real altitude reading. Jumps > 25 m between fixes (GPS error) are ignored.
export function computeElevationGain(route) {
  if (!Array.isArray(route) || route.length < 2) return null;

  let gain = 0;
  let prevAlt = null;

  for (const p of route) {
    const alt = p[2];
    if (typeof alt !== 'number' || !Number.isFinite(alt)) {
      prevAlt = null;
      continue;
    }
    if (prevAlt !== null) {
      const delta = alt - prevAlt;
      if (delta > 0 && delta < 25) gain += delta;
    }
    prevAlt = alt;
  }

  return gain > 0 ? Math.round(gain) : null;
}

// ─── Elevation profile ───────────────────────────────────────────────────────
// Returns a downsampled series [{ km, alt }] plus min/max for chart scaling.
// Returns null when fewer than 2 valid altitude points exist.
export function buildElevationProfile(route, maxPoints = 48) {
  if (!Array.isArray(route) || route.length < 2) return null;

  const dist = cumulativeDistance(route);
  const pts = [];
  for (let i = 0; i < route.length; i++) {
    const alt = route[i][2];
    if (typeof alt === 'number' && Number.isFinite(alt)) {
      pts.push({ km: dist[i], alt });
    }
  }
  if (pts.length < 2) return null;

  // Downsample to <= maxPoints evenly-spaced indices.
  const step = Math.max(1, Math.floor(pts.length / maxPoints));
  const sampled = [];
  for (let i = 0; i < pts.length; i += step) sampled.push(pts[i]);
  if (sampled[sampled.length - 1] !== pts[pts.length - 1]) {
    sampled.push(pts[pts.length - 1]);
  }

  let min = Infinity;
  let max = -Infinity;
  for (const p of sampled) {
    if (p.alt < min) min = p.alt;
    if (p.alt > max) max = p.alt;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (max - min < 1) { min = min - 2; max = max + 2; } // flat route → pad

  return { points: sampled, minAlt: min, maxAlt: max, gain: computeElevationGain(route) };
}
