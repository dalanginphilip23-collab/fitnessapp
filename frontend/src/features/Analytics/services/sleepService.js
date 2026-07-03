import { API_BASE_URL } from "../../../config/port";

const ZONE_COLOR_MAP = {
  5: { color: 'bg-red-500',    label: 'Zone 5 (Anaerobic)'    },
  4: { color: 'bg-orange-400', label: 'Zone 4 (Threshold)'    },
  3: { color: 'bg-yellow-400', label: 'Zone 3 (Tempo)'        },
  2: { color: 'bg-[#D1FD52]',  label: 'Zone 2 (Aerobic Base)' },
  1: { color: 'bg-blue-400',   label: 'Zone 1 (Recovery)'     },
};

// -------------------------
// DEFAULT DATA
// -------------------------
export const DEFAULT_ZONES = [
  { zone: 5, label: 'Zone 5 (Anaerobic)',    value: '0%', color: 'bg-red-500'    },
  { zone: 4, label: 'Zone 4 (Threshold)',    value: '0%', color: 'bg-orange-400' },
  { zone: 2, label: 'Zone 2 (Aerobic Base)', value: '0%', color: 'bg-[#D1FD52]' },
];

// -------------------------
// ZONES
// -------------------------
export async function fetchZonesFromAPI(userId, timeframe) {
  const res = await fetch(
    `${API_BASE_URL}/api/analytics/zones/${userId}?timeframe=${timeframe.toLowerCase()}`
  );

  if (!res.ok) throw new Error(`Zones fetch failed: ${res.status}`);

  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) return DEFAULT_ZONES;

  return data.map(row => ({
    zone:    row.zone,
    label:   row.label,
    minutes: row.minutes,
    value:   row.value,
    color:   ZONE_COLOR_MAP[row.zone]?.color ?? 'bg-neutral-500',
  }));
}

// -------------------------
// SCATTER DATA
// -------------------------
export async function fetchScatterData(userId, timeframe) {
  const res = await fetch(
    `${API_BASE_URL}/api/sleep/${userId}/scatter?timeframe=${timeframe.toLowerCase()}`
  );

  if (!res.ok) throw new Error(`Scatter fetch failed: ${res.status}`);

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// -------------------------
// TODAY SLEEP
// -------------------------
export async function fetchTodaySleep(userId) {
  const res = await fetch(`${API_BASE_URL}/api/sleep/${userId}/today`);

  if (!res.ok) throw new Error(`Today sleep fetch failed: ${res.status}`);

  return res.json();
}

// -------------------------
// SAVE SLEEP
// -------------------------
export async function saveSleepData(userId, payload) {
  const res = await fetch(`${API_BASE_URL}/api/sleep/${userId}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Save failed');
  return res.json();
}