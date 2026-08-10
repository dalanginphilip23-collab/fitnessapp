import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE_URL } from '../../../config/port';
import { MAP_ICONS } from '../components';
import FitRoute from '../components/fitRoute';
import { getActivityType } from '../utils/activityTypes';

// Public, read-only activity viewer — no auth required. Opened via the
// shareable link `/activity/:token`. Shows the route on a map + the stats
// card, then a soft CTA to join Vitalis.

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const formatTime = (seconds) => {
  const s  = parseInt(seconds) || 0;
  const h  = Math.floor(s / 3600);
  const m  = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
};

const SharedActivity = () => {
  const { token } = useParams();
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/activity/share/${token}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Activity not found');
        if (mounted) setActivity(data);
      } catch (err) {
        if (mounted) setError(err.message || 'Could not load this activity');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-[#8BC34A] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">🗺️</div>
          <h1 className="text-[var(--text-primary)] font-black italic tracking-tighter text-xl mb-2">Activity unavailable</h1>
          <p className="text-[var(--text-muted)] text-xs mb-6">{error || 'This activity may have been deleted or made private.'}</p>
          <Link
            to="/"
            className="inline-block bg-[#8BC34A] text-black rounded-full px-8 py-3 font-black uppercase italic tracking-tighter text-xs hover:scale-105 transition-transform"
          >
            Vitalis Fit
          </Link>
        </div>
      </div>
    );
  }

  const route = activity.route || [];
  const meta = getActivityType(activity.type);
  const date = new Date(activity.created_at || Date.now());

  const Stat = ({ label, value, unit }) => (
    <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-2xl p-3 text-center">
      <p className="text-xl font-black italic tracking-tighter text-[var(--text-primary)] leading-none">
        {value}
        {unit && <span className="text-[9px] text-[var(--text-muted)] font-semibold ml-0.5">{unit}</span>}
      </p>
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] mt-1">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Map */}
      <div className="relative h-[45vh] md:h-[55vh] min-h-[300px] w-full">
        {route.length >= 2 ? (
          <MapContainer
            center={route[0]}
            zoom={15}
            zoomControl={false}
            attributionControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url={TILE_URL} />
            <FitRoute path={route} />
            <Polyline positions={route} pathOptions={{ color: '#8BC34A', weight: 5, opacity: 0.9 }} />
            <Marker position={route[0]} icon={MAP_ICONS.start} />
            <Marker position={route[route.length - 1]} icon={MAP_ICONS.finish} />
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
            No route to display
          </div>
        )}

        {/* Brand */}
        <div className="absolute top-4 left-4 z-[1000] bg-black/60 backdrop-blur-md border border-[var(--border-medium)] rounded-full px-4 py-2 flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#8BC34A] flex items-center justify-center text-[#161f00] text-[11px] font-black">⚡</div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8BC34A]">Vitalis Fit</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 bg-[#121212] px-4 sm:px-6 pt-5 pb-10 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{meta.icon}</span>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#8BC34A]">{meta.label} Activity</span>
        </div>

        <h1 className="text-2xl font-black italic tracking-tighter text-[#f0efed]">
          {activity.title || meta.defaultTitle}
        </h1>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="material-symbols-outlined text-[#6a6a6a] text-sm">calendar_today</span>
          <p className="text-xs text-[#b0aeac] font-semibold">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} ·{' '}
            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {activity.place_name && (
            <>
              <span className="w-1 h-1 rounded-full bg-[#3a3a3a]" />
              <span className="material-symbols-outlined text-[#6a6a6a] text-sm">location_on</span>
              <p className="text-xs text-[#b0aeac] font-semibold">{activity.place_name}</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          <Stat label="Distance" value={parseFloat(activity.distance || 0).toFixed(2)} unit="km" />
          <Stat label="Time" value={formatTime(activity.duration)} />
          <Stat label="Pace" value={activity.pace || '–'} unit="/km" />
          <Stat label="Calories" value={activity.calories || 0} unit="kcal" />
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mt-6 p-3 rounded-2xl bg-[#1e1e1e] border border-[rgba(255,255,255,0.07)]">
          {activity.author_avatar ? (
            <img src={activity.author_avatar} alt={activity.author_name} className="w-9 h-9 rounded-full object-cover border border-[rgba(255,255,255,0.1)]" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[rgba(139,195,74,0.1)] border border-[rgba(139,195,74,0.2)] flex items-center justify-center">
              <span className="text-xs font-black text-[#8BC34A] uppercase">{(activity.author_name || '?').slice(0, 1)}</span>
            </div>
          )}
          <div>
            <p className="text-xs font-black text-[#f0efed]">{activity.author_name || 'A Vitalis member'}</p>
            <p className="text-[9px] text-[#6a6a6a] uppercase tracking-wider">shared this activity</p>
          </div>
        </div>

        <Link
          to="/register"
          className="mt-6 w-full block text-center bg-[#8BC34A] text-black rounded-full py-3.5 font-black uppercase italic tracking-tighter text-xs hover:scale-[1.02] active:scale-95 transition-all"
        >
          Track your own runs — join Vitalis
        </Link>
      </div>
    </div>
  );
};

export default SharedActivity;
