import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { Polyline, Marker } from "react-leaflet";
import L from "leaflet";

// ─── Icons ─────────────────────────────────────────────────────────────────
const createUserIcon = () =>
  L.divIcon({
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `
      <div style="width:20px;height:20px;border-radius:50%;background:#D1FD52;border:3px solid #fff;box-shadow:0 0 0 4px rgba(209,253,82,0.3);position:relative;">
        <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(209,253,82,0.15);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      </div>
      <style>@keyframes ping{0%{transform:scale(1);opacity:1}75%{transform:scale(2);opacity:0}100%{transform:scale(2.5);opacity:0}}</style>
    `,
  });

const createStartIcon = () =>
  L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div style="width:24px;height:24px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 2px 8px rgba(34,197,94,0.5);display:flex;align-items:center;justify-content:center;">
        <span style="color:#fff;font-size:10px;font-weight:900;">S</span>
      </div>
    `,
  });

const createFinishIcon = () =>
  L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div style="width:24px;height:24px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 2px 8px rgba(239,68,68,0.5);display:flex;align-items:center;justify-content:center;">
        <span style="color:#fff;font-size:10px;font-weight:900;">F</span>
      </div>
    `,
  });

// ─── Component ──────────────────────────────────────────────────────────────
const RouteReplay = ({ fullPath }) => {
  const [drawnPath, setDrawnPath] = useState([fullPath[0]]);
  const [isDone, setIsDone] = useState(false);
  const frameRef = useRef(null);
  const indexRef = useRef(1);
  const PPF = Math.max(1, Math.ceil(fullPath.length / 120));

  useEffect(() => {
    indexRef.current = 1;
    setDrawnPath([fullPath[0]]);
    setIsDone(false);

    const tick = () => {
      if (indexRef.current >= fullPath.length) {
        setIsDone(true);
        return;
      }
      indexRef.current = Math.min(indexRef.current + PPF, fullPath.length);
      setDrawnPath(fullPath.slice(0, indexRef.current));
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [fullPath, PPF]);

  return (
    <>
      <Polyline
        positions={fullPath}
        pathOptions={{ color: "#D1FD52", weight: 4, opacity: 0.12 }}
      />
      <Polyline
        positions={drawnPath}
        pathOptions={{ color: "#D1FD52", weight: 5, opacity: 0.9 }}
      />
      <Marker position={fullPath[0]} icon={createStartIcon()} />
      {!isDone && drawnPath.length > 0 && (
        <Marker
          position={drawnPath[drawnPath.length - 1]}
          icon={createUserIcon()}
        />
      )}
      {isDone && (
        <Marker
          position={fullPath[fullPath.length - 1]}
          icon={createFinishIcon()}
        />
      )}
    </>
  );
};

export default RouteReplay;