import { useState, useEffect, useRef } from "react";

const FALLBACK_COORDS = [14.676, 121.0437];

// Accuracy bands (meters). The first GPS fix is often coarse (Wi-Fi/cell
// triangulation, 50–300 m). Instead of accepting it blindly we keep the last
// *good* fix and only promote new ones when they're accurate enough:
//   ≤ GOOD   → the "real" position (dot, start point, track, recenter)
//   ≤ FAIR   → moves the dot/recenter but is NOT written to the track
//   > POOR   → ignored entirely (GPS noise / tunnel / indoors)
const ACCURACY_GOOD = 40;
const ACCURACY_FAIR = 100;
const ACCURACY_POOR = 250;

// GeolocationPositionError codes
const PERMISSION_DENIED = 1;

export const useGeolocation = (isRecording) => {
  const [userLocation, setUserLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null); // meters, best known fix
  const [startCoords, setStartCoords] = useState(FALLBACK_COORDS);
  const [locationStatus, setLocationStatus] = useState(
    () => (navigator.geolocation ? "pending" : "denied")
  );
  const [mapCenter, setMapCenter] = useState(FALLBACK_COORDS);
  const [path, setPath] = useState([FALLBACK_COORDS]);

  const watchIdRef = useRef(null);
  const isRecordingRef = useRef(isRecording);
  const startedRef = useRef(false); // first acceptable fix → startCoords

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Continuously watch position so the dot keeps refining to the true spot.
  // The path is only appended to while recording. Unsupported browsers were
  // already marked "denied" by the lazy initializer above.
  useEffect(() => {
    if (!navigator.geolocation) return undefined;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const acc = pos.coords.accuracy ?? 100;
        const c = [pos.coords.latitude, pos.coords.longitude, pos.coords.altitude];

        // Ignore hopeless fixes entirely — keep the previous good position.
        if (acc > ACCURACY_POOR) return;

        setAccuracy(acc);
        setLocationStatus("granted");

        // The first reasonably-accurate fix defines the start of the run.
        if (!startedRef.current) {
          startedRef.current = true;
          setStartCoords(c);
          if (acc <= ACCURACY_GOOD) setPath([c]);
        }

        // Always move the dot + map center on a good-enough fix.
        setUserLocation(c);
        setMapCenter(c);

        // Only good fixes get written into the recorded track.
        if (isRecordingRef.current && acc <= ACCURACY_GOOD) {
          setPath((prev) => [...prev, c]);
        }
      },
      (err) => {
        console.warn("GPS watch error:", err);
        // Only a hard permission denial turns the GPS off. Timeouts /
        // position-unavailable errors are transient — keep retrying with
        // the last good fix instead of falling back to mock movement.
        if (err && err.code === PERMISSION_DENIED) {
          setLocationStatus("denied");
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    userLocation,
    setUserLocation,
    accuracy,
    startCoords,
    locationStatus,
    mapCenter,
    path,
    setPath,
  };
};
