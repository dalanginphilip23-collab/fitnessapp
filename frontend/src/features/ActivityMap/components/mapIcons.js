import L from 'leaflet';

// ─── Leaflet divIcons for the ActivityMap redesign ───────────────────────────
// All pins are built once at module load — their appearance never changes, so
// rebuilding the inner HTML on every render would be wasteful.

const PIN_CSS = `
  <style>
    .vmap-pin {
      position: relative;
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50% 50% 50% 4px;
      border: 2.5px solid #fff;
      box-shadow: 0 3px 10px rgba(0,0,0,0.45);
      transform: rotate(-45deg);
      color: #fff;
    }
    .vmap-pin > span {
      transform: rotate(45deg);
      font-size: 14px; line-height: 1; font-weight: 600;
    }
    .vmap-pin--start { background: #22c55e; }
    .vmap-pin--finish { background: #ef4444; }
    .vmap-pin--saved { background: #FFB74D; }
    .vmap-location {
      position: relative; width: 20px; height: 20px; border-radius: 50%;
      background: var(--accent, #8BC34A);
      border: 3px solid #fff;
      box-shadow: 0 0 0 4px rgba(139,195,74,0.3);
    }
    .vmap-location::before {
      content: ''; position: absolute; inset: -8px; border-radius: 50%;
      background: rgba(139,195,74,0.18);
      animation: vmapPing 1.6s cubic-bezier(0,0,0.2,1) infinite;
    }
    @keyframes vmapPing {
      0% { transform: scale(1); opacity: 1; }
      75%, 100% { transform: scale(2.1); opacity: 0; }
    }
  </style>
`;

const startPin = () =>
  L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 26],
    html: `${PIN_CSS}<div class="vmap-pin vmap-pin--start"><span>★</span></div>`,
  });

const finishPin = () =>
  L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 26],
    html: `${PIN_CSS}<div class="vmap-pin vmap-pin--finish"><span>🏁</span></div>`,
  });

const locationPin = () =>
  L.divIcon({
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `${PIN_CSS}<div class="vmap-location"></div>`,
  });

// Custom saved pin — colored per the saved-pins palette.
const savedPin = (color = '#FFB74D') =>
  L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 26],
    html: `${PIN_CSS}<div class="vmap-pin vmap-pin--saved" style="background:${color}"><span>📍</span></div>`,
  });

export const MAP_ICONS = {
  start: startPin(),
  finish: finishPin(),
  location: locationPin(),
};

export const getSavedPinIcon = (color) => savedPin(color);
