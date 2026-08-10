import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import FitRoute from './fitRoute';
import { getActivityType } from '../utils/activityTypes';
import { buildElevationProfile } from '../utils/elevation';

// Strava-style share image. The route map fills the whole card; big stats,
// title, brand, and an optional elevation profile sit on a dark gradient
// overlay. Rendered offscreen (never visible to the user) or in the share
// sheet preview, then captured to PNG by utils/shareImage.js.
//
// Formats:
//   'grid'  → 1:1  (1000×1000) for feed posts
//   'story' → 9:16 (900×1600) for Instagram / Facebook stories
//
// Always uses the dark tile set so the image reads identically for everyone.

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://carto.com/">CARTO</a>';

const FALLBACK = [14.676, 121.0437];

const FORMATS = {
  grid:  { width: 1000, height: 1000 },
  story: { width: 900,  height: 1600 },
};

function formatSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

const ElevationChart = ({ profile, accent = '#8BC34A' }) => {
  if (!profile) return null;

  const { points, minAlt, maxAlt } = profile;
  const W = 320;
  const H = 72;
  const pad = 4;
  const usableW = W - pad * 2;
  const usableH = H - pad * 2;
  const maxKm = points[points.length - 1].km || 1;

  const coords = points.map((p) => [
    pad + (p.km / maxKm) * usableW,
    pad + (1 - (p.alt - minAlt) / (maxAlt - minAlt || 1)) * usableH,
  ]);

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(' ');
  const area = `${line} L${W - pad},${H} L${pad},${H} Z`;

  return (
    <div style={{ marginTop: 14 }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#elevFill)" />
        <path
          d={line}
          fill="none"
          stroke={accent}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#8a8a8a', fontWeight: 700, marginTop: 4 }}>
        <span>0 km</span>
        {profile.gain ? (
          <span style={{ color: accent, textTransform: 'uppercase', letterSpacing: 1 }}>
            ▲ {profile.gain} m gain
          </span>
        ) : (
          <span />
        )}
        <span>{maxKm.toFixed(1)} km</span>
      </div>
    </div>
  );
};

const ShareCard = React.forwardRef(function ShareCard(
  { type = 'run', title, placeName, createdAt, metrics = {}, splits = [], route = [], authorName, format = 'grid' },
  ref
) {
  const meta = getActivityType(type);
  const date = createdAt ? new Date(createdAt) : new Date();
  const dims = FORMATS[format] || FORMATS.grid;
  const isStory = format === 'story';

  const elevation = useMemo(() => buildElevationProfile(route), [route]);

  // Layout tweaks per format: story gets a more spread-out overlay, grid is compact.
  const overlay = isStory
    ? { padding: 34, contentGap: 18 }
    : { padding: 26, contentGap: 12 };

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: dims.width,
        height: dims.height,
        background: '#121212',
        color: '#f0efed',
        fontFamily: "'Poppins', sans-serif",
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Map — fills the whole card as the hero */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {route.length >= 2 ? (
          <MapContainer
            center={route[0] ?? FALLBACK}
            zoom={15}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url={TILE_URL}
              attribution={TILE_ATTRIBUTION}
              crossOrigin={true}
            />
            <FitRoute path={route} />
            <Polyline positions={route} pathOptions={{ color: '#8BC34A', weight: 6, opacity: 0.95 }} />
          </MapContainer>
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6a6a6a',
              fontSize: 14,
              background: 'linear-gradient(180deg,#1b1b1b,#121212)',
            }}
          >
            No route to display
          </div>
        )}

        {/* Dark gradient overlay so stats read clearly over the map */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isStory
              ? 'linear-gradient(to bottom, rgba(18,18,18,0.25) 0%, rgba(18,18,18,0.05) 30%, rgba(18,18,18,0.05) 45%, rgba(18,18,18,0.92) 78%, rgba(18,18,18,0.98) 100%)'
              : 'linear-gradient(to bottom, rgba(18,18,18,0.25) 0%, rgba(18,18,18,0.02) 40%, rgba(18,18,18,0.9) 78%, rgba(18,18,18,0.98) 100%)',
          }}
        />

        {/* Brand badge — top left */}
        <div
          style={{
            position: 'absolute',
            top: overlay.padding,
            left: overlay.padding,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(0,0,0,0.55)',
            padding: '10px 18px',
            borderRadius: 999,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              background: '#8BC34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#161f00',
              fontSize: 15,
              fontWeight: 900,
            }}
          >
            ⚡
          </div>
          <span style={{ color: '#8BC34A', fontWeight: 900, letterSpacing: 1.5, fontSize: 13, textTransform: 'uppercase' }}>
            Vitalis Fit
          </span>
        </div>

        {/* Content overlay */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: overlay.padding,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Title + meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(139,195,74,0.15)',
                border: '1px solid rgba(139,195,74,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 24 }}>{meta.icon}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: isStory ? 30 : 26, fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.5px', lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                {title || meta.defaultTitle}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                <span style={{ color: '#b5b3b0', fontSize: 12, fontWeight: 600 }}>
                  {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} ·{' '}
                  {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {placeName && (
                  <span style={{ color: '#b5b3b0', fontSize: 12, fontWeight: 600 }}>📍 {placeName}</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: overlay.contentGap }}>
            {[
              { label: 'Distance', value: `${(metrics.distance || 0).toFixed(2)}`, unit: 'km' },
              { label: 'Time', value: formatSeconds(metrics.time || 0), unit: '' },
              { label: 'Pace', value: metrics.pace || '–', unit: '/km' },
              { label: 'Calories', value: `${metrics.calories || 0}`, unit: 'kcal' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: 'rgba(22,22,22,0.72)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 16,
                  padding: isStory ? '16px 6px' : '12px 6px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: isStory ? 24 : 20, fontWeight: 900, fontStyle: 'italic', color: '#f0efed', lineHeight: 1.1 }}>
                  {s.value}
                  {s.unit && <span style={{ fontSize: 11, color: '#8a8a8a', fontWeight: 600, marginLeft: 2 }}>{s.unit}</span>}
                </div>
                <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 2, color: '#8a8a8a', fontWeight: 800, marginTop: 5 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Elevation profile */}
          {elevation && <ElevationChart profile={elevation} />}

          {/* Splits */}
          {splits && splits.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {splits.slice(0, 8).map((s) => (
                  <div
                    key={s.km}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10,
                      padding: '5px 9px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 8, color: '#8a8a8a', fontWeight: 800 }}>KM {s.km}</span>
                    <span style={{ fontSize: 10, color: '#8BC34A', fontWeight: 900, fontStyle: 'italic' }}>{s.pace}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ color: '#8BC34A', fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
              {authorName ? `${authorName} · ` : ''}Made with Vitalis Fit ⚡
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
