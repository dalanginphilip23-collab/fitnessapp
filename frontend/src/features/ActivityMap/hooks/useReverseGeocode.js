import { useState, useEffect, useCallback, useRef } from 'react';

// Reverse-geocodes a [lat, lng] point to a human-readable place name.
// Uses BigDataCloud's free reverse-geocode client (no API key, CORS enabled).
// Falls back gracefully when offline / the request fails.

const REVERSE_GEOCODE_URL =
  'https://api.bigdatacloud.net/data/reverse-geocode-client';

function coordsKey(coords) {
  if (!coords) return null;
  return `${coords[0].toFixed(4)},${coords[1].toFixed(4)}`;
}

// Small in-memory cache so re-renders don't hammer the API for the same point.
const cache = new Map();

async function fetchPlaceName([lat, lng]) {
  const url = `${REVERSE_GEOCODE_URL}?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  // Priority: locality > city > principalSubdivision > country
  return (
    data.locality ||
    data.city ||
    data.principalSubdivision ||
    data.countryName ||
    null
  );
}

export const useReverseGeocode = (coords) => {
  const [placeName, setPlaceName] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const lastKeyRef = useRef(null);

  const resolve = useCallback(async (c) => {
    const key = coordsKey(c);
    if (!key) return;

    if (cache.has(key)) {
      setPlaceName(cache.get(key));
      setStatus('done');
      lastKeyRef.current = key;
      return;
    }

    lastKeyRef.current = key;
    setStatus('loading');
    try {
      const name = await fetchPlaceName(c);
      const finalName = name || 'Unknown location';
      cache.set(key, finalName);
      setPlaceName(finalName);
      setStatus('done');
    } catch {
      setPlaceName(null);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const key = coordsKey(coords);
    if (!key || key === lastKeyRef.current) return;
    resolve(coords);
  }, [coords, resolve]);

  return { placeName, status, resolve };
};

export default useReverseGeocode;
