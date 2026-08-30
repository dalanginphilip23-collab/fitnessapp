import React from 'react';
import { ACTIVITY_TYPE_KEYS, getActivityType } from '../../utils/activityTypes';

// Shared activity card used across the desktop panel and the mobile bottom
// sheet. Editable while a finished run waits to be saved; static once viewed
// from history or a shared link.
//
// props:
//   editable       — allow type/title editing (pre-save summary)
//   type / setType — activity type key
//   title / setTitle
//   placeName      — reverse-geocoded location label
//   createdAt      — Date or date-string
//   metrics        — { time, distance, pace, calories }
//   splits         — [{ km, pace }]
//   formatTime     — seconds -> "mm:ss"
//   headerRight    — optional node rendered next to the header label

const StatTile = ({ label, value, unit, accent = false }) => (
  <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-2xl p-3 sm:p-4">
    <p className="text-[8px] sm:text-[9px] text-[var(--text-muted)] uppercase font-black tracking-[0.2em] mb-1">{label}</p>
    <p className={`text-xl sm:text-2xl font-black italic tracking-tighter leading-none ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
      {value}
      {unit && <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] font-semibold ml-0.5">{unit}</span>}
    </p>
  </div>
);

const ActivityCard = ({
  editable = false,
  type = 'run',
  setType,
  title,
  setTitle,
  placeName,
  createdAt,
  metrics = {},
  splits = [],
  formatTime,
  headerRight,
}) => {
  const typeMeta = getActivityType(type);
  const date = createdAt ? new Date(createdAt) : new Date();

  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const timeLabel = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header: type + editable title + place */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--accent)] text-lg">{typeMeta.icon}</span>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-[var(--accent)]">
              {typeMeta.label} Activity
            </p>
          </div>
          {headerRight}
        </div>

        {editable ? (
          <input
            value={title || ''}
            onChange={(e) => setTitle?.(e.target.value)}
            placeholder="Title your activity…"
            className="w-full bg-transparent text-lg sm:text-xl font-black italic tracking-tighter text-[var(--text-primary)] placeholder-[var(--text-disabled)] outline-none border-b border-transparent focus:border-[var(--accent-border)] transition-colors"
          />
        ) : (
          <h2 className="text-lg sm:text-xl font-black italic tracking-tighter text-[var(--text-primary)]">
            {title || typeMeta.defaultTitle}
          </h2>
        )}

        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="material-symbols-outlined text-[var(--text-muted)] text-xs">calendar_today</span>
          <p className="text-[10px] text-[var(--text-muted)] font-semibold">
            {dateLabel} · {timeLabel}
          </p>
          {placeName && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-[var(--text-disabled)]" />
              <span className="material-symbols-outlined text-[var(--text-muted)] text-xs">location_on</span>
              <p className="text-[10px] text-[var(--text-muted)] font-semibold">{placeName}</p>
            </>
          )}
        </div>
      </div>

      {/* Type selector (editable only) */}
      {editable && (
        <div className="grid grid-cols-4 gap-1.5">
          {ACTIVITY_TYPE_KEYS.map((key) => {
            const meta = getActivityType(key);
            const active = key === type;
            return (
              <button
                key={key}
                onClick={() => setType?.(key)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl border transition-all ${
                  active
                    ? 'bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]'
                    : 'bg-[var(--bg-hover)] border-[var(--border-light)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <span className="material-symbols-outlined text-base">{meta.icon}</span>
                <span className="text-[8px] font-black uppercase tracking-widest">{meta.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {type === 'workout' ? (
          <StatTile label="Distance" value="–" unit="manual" />
        ) : (
          <StatTile label="Distance" value={(metrics.distance || 0).toFixed(2)} unit="km" />
        )}
        <StatTile label="Time" value={formatTime ? formatTime(metrics.time || 0) : metrics.time} />
        <StatTile label="Pace" value={metrics.pace || '–'} unit="/km" accent />
        <StatTile label="Calories" value={metrics.calories || 0} unit="kcal" />
      </div>

      {/* Splits */}
      {splits && splits.length > 0 && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">Splits</p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar pr-1">
            {splits.map((s) => (
              <div key={s.km} className="flex justify-between px-3 py-2 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)]">
                <span className="text-[9px] font-bold text-[var(--text-muted)]">KM {s.km}</span>
                <span className="text-[10px] font-black italic text-[var(--accent)]">{s.pace}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
