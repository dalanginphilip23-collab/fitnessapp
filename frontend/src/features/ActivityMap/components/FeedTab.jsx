import React from 'react';
import { getActivityType } from '../utils/activityTypes';

// Tiny static SVG route thumbnail — a normalized polyline of the activity
// route. Much lighter than mounting a Leaflet map per feed card.
const RoutePreview = ({ route, color = 'var(--accent)' }) => {
  if (!route || route.length < 2) {
    return (
      <div className="h-20 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] flex items-center justify-center">
        <span className="material-symbols-outlined text-[var(--text-disabled)]">route</span>
      </div>
    );
  }

  const lats = route.map((p) => p[0]);
  const lngs = route.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const W = 300;
  const H = 90;
  const pad = 10;
  const rangeLat = Math.max(maxLat - minLat, 1e-6);
  const rangeLng = Math.max(maxLng - minLng, 1e-6);

  const points = route
    .map(([lat, lng]) => {
      const x = pad + ((lng - minLng) / rangeLng) * (W - pad * 2);
      const y = pad + ((maxLat - lat) / rangeLat) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)]" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
      <circle cx={points.split(' ')[0].split(',')[0]} cy={points.split(' ')[0].split(',')[1]} r="4" fill="#22c55e" />
      <circle cx={points.split(' ').at(-1).split(',')[0]} cy={points.split(' ').at(-1).split(',')[1]} r="4" fill="#ef4444" />
    </svg>
  );
};

const FeedTab = ({ feed, feedLoading, feedError, formatTime, onRefresh, onDeletePost, currentUserId, onViewActivity, isOverlay = false }) => {
  const containerClass = isOverlay
    ? 'space-y-3 max-h-[calc(100vh-160px)] overflow-y-auto pr-1'
    : 'space-y-4';

  return (
    <div className="p-3 md:p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--accent)]">group</span>
          <h2 className="text-base md:text-lg font-black tracking-tighter uppercase text-[var(--text-primary)]">
            Feed
          </h2>
        </div>
        <button
          onClick={onRefresh}
          className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] hover:opacity-70 px-3 py-1.5 rounded-lg bg-[var(--bg-hover)]"
        >
          ↺ Refresh
        </button>
      </div>

      {feedLoading && (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-[var(--border-light)] border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      )}

      {feedError && (
        <div className="text-center py-10 bg-red-500/10 border border-red-500/20 rounded-xl p-5">
          <p className="text-red-400 text-xs font-medium">⚠ {feedError}</p>
        </div>
      )}

      {!feedLoading && !feedError && feed.length === 0 && (
        <div className="text-center py-12 bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl">
          <div className="text-3xl mb-2">👟</div>
          <p className="text-[var(--text-secondary)] text-xs font-medium">No activities in your feed yet</p>
          <p className="text-[var(--text-muted)] text-[10px] mt-1">Save a run with "Post to feed" to get started</p>
        </div>
      )}

      {!feedLoading && !feedError && feed.length > 0 && (
        <div className={containerClass}>
          {feed.map((post) => {
            const meta = getActivityType(post.type);
            return (
              <div
                key={post.post_id}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl overflow-hidden hover:border-[var(--accent-border)] transition-all duration-300"
              >
                <RoutePreview route={post.route} color={meta.color} />

                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {post.author_avatar ? (
                        <img
                          src={post.author_avatar}
                          alt={post.author_name}
                          className="w-8 h-8 rounded-full object-cover border border-[var(--border-light)]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                          <span className="text-[10px] font-black text-[var(--accent)] uppercase">
                            {(post.author_name || '?').slice(0, 1)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-[var(--text-primary)] truncate">
                          {post.author_name}
                          {post.author_id === currentUserId && (
                            <span className="ml-1 text-[8px] text-[var(--accent)] uppercase">(you)</span>
                          )}
                        </p>
                        <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">
                          {new Date(post.posted_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent-bg)] px-2 py-1 rounded-full">
                        {meta.label}
                      </span>
                      {post.author_id === currentUserId && (
                        <button
                          onClick={() => onDeletePost?.(post.post_id)}
                          className="text-[10px] text-red-400 hover:text-red-300 px-1.5 py-1 rounded-lg hover:bg-red-500/10"
                          title="Remove from feed"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {post.caption && (
                    <p className="text-[11px] text-[var(--text-secondary)] mb-2.5 leading-relaxed">{post.caption}</p>
                  )}

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Dist', value: `${parseFloat(post.distance || 0).toFixed(1)}km` },
                      { label: 'Time', value: formatTime(post.duration) },
                      { label: 'Pace', value: post.pace || '–' },
                      { label: 'Cal', value: post.calories || 0 },
                    ].map((s) => (
                      <div key={s.label} className="text-center bg-[var(--bg-hover)] rounded-xl py-2">
                        <p className="text-[11px] font-black italic text-[var(--text-primary)]">{s.value}</p>
                        <p className="text-[7px] text-[var(--text-muted)] uppercase font-black tracking-widest mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onViewActivity?.(post.activity_id)}
                    className="mt-3 w-full text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent)] border border-[var(--accent-border)] bg-[var(--accent-bg)] rounded-xl py-2 hover:opacity-80 transition-opacity"
                  >
                    View on map
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeedTab;
