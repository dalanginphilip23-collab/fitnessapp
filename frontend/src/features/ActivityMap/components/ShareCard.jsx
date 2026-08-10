import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import { MAP_ICONS } from './mapIcons';
import FitRoute from './fitRoute';
import { getActivityType } from '../utils/activityTypes';

// The branded share-image design. Rendered offscreen (never visible to the
// user), captured to PNG by utils/shareImage.js, then shared via the Web
// Share API or downloaded. Always uses the dark tile set so the image reads
// the same for every user regardless of their app theme.

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const FALLBACK = [14.676, 121.0437];

const ShareCard = React.forwardRef(function ShareCard(
  { type = 'run', title, placeName, createdAt, metrics = {}, splits = [], route = [], authorName },
  ref
) {
  const meta = getActivityType(type);
  const date = createdAt ? new Date(createdAt) : new Date();

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: 700,
        height: 960,
        background: '#121212',
        color: '#f0efed',
        fontFamily: "'Poppins', sans-serif",
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Map */}
      <div style={{ height: 420, width: '100%', position: 'relative', background: '#1e1e1e' }}>
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
            <TileLayer url={TILE_URL} />
            <FitRoute path={route} />
            <Polyline positions={route} pathOptions={{ color: '#8BC34A', weight: 5, opacity: 0.9 }} />
            <Marker position={route[0]} icon={MAP_ICONS.start} />
            <Marker position={route[route.length - 1]} icon={MAP_ICONS.finish} />
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
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            No route to display
          </div>
        )}

        {/* Brand badge over the map */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            padding: '8px 14px',
            borderRadius: 999,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: '#8BC34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#161f00',
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            ⚡
          </div>
          <span style={{ color: '#8BC34A', fontWeight: 900, letterSpacing: 1, fontSize: 11, textTransform: 'uppercase' }}>
            Vitalis Fit
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 22 }}>{meta.icon}</span>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.5px' }}>
            {title || meta.defaultTitle}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <span style={{ color: '#6a6a6a', fontSize: 12, fontWeight: 600 }}>
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} ·{' '}
            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {placeName && (
            <span style={{ color: '#6a6a6a', fontSize: 12, fontWeight: 600 }}>📍 {placeName}</span>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
          {[
            { label: 'Distance', value: `${(metrics.distance || 0).toFixed(2)}`, unit: 'km' },
            { label: 'Time', value: formatSeconds(metrics.time || 0), unit: '' },
            { label: 'Pace', value: metrics.pace || '–', unit: '/km' },
            { label: 'Calories', value: `${metrics.calories || 0}`, unit: 'kcal' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: '12px 6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, fontStyle: 'italic', color: '#f0efed', lineHeight: 1.1 }}>
                {s.value}
                {s.unit && <span style={{ fontSize: 10, color: '#6a6a6a', fontWeight: 600, marginLeft: 2 }}>{s.unit}</span>}
              </div>
              <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 2, color: '#6a6a6a', fontWeight: 800, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Splits */}
        {splits && splits.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, color: '#6a6a6a', fontWeight: 800, marginBottom: 8 }}>
              Splits
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {splits.slice(0, 8).map((s) => (
                <div
                  key={s.km}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                    padding: '6px 8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 8, color: '#6a6a6a', fontWeight: 800 }}>KM {s.km}</span>
                  <span style={{ fontSize: 9, color: '#8BC34A', fontWeight: 900, fontStyle: 'italic' }}>{s.pace}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ color: '#8BC34A', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
            {authorName ? `${authorName} · ` : ''}Made with Vitalis Fit ⚡
          </span>
        </div>
      </div>
    </div>
  );
});

function formatSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export default ShareCard;
