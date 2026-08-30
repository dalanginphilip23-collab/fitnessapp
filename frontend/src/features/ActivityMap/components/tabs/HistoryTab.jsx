import React from 'react';

// Activity history list. Used in two contexts:
//  - full page (mobile History tab / desktop browse tab)
//  - compact overlay (panel variants)
// onView(activity) opens the route on the map; onShare(activity) opens the
// share sheet. onDelete removes the activity.

// Pure date parse — renders null for missing/invalid timestamps instead of
// fabricating one from Date.now() during render.
const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const Empty = () => (
  <div className="text-center py-10 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-light)]">
    <div className="text-3xl mb-2">🏃</div>
    <p className="text-[var(--text-secondary)] text-xs font-medium">No activities yet</p>
    <p className="text-[var(--text-muted)] text-[10px] mt-1">Go to the map and start your first activity!</p>
  </div>
);

const ActivityRow = ({ activity, formatTime, onView, onShare, onDelete, compact = false }) => {
  const d = parseDate(activity.created_at);
  const typeLabel = (activity.type || 'run').toUpperCase();
  const isManual  = activity.type === 'workout';

  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-4 hover:border-[var(--accent-border)] transition-all duration-300">
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <div>
          {d && (
            <p className="text-[11px] font-semibold text-[var(--text-muted)]">
              {compact
                ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          {!compact && d && (
            <p className="text-[9px] text-[var(--text-disabled)] mt-0.5">
              {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          {activity.place_name && (
            <p className="text-[9px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">location_on</span>
              {activity.place_name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--accent)] bg-[var(--accent-bg)] px-2.5 py-1 rounded-full">
            {typeLabel}
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(activity.id)}
              className="text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
              title="Delete activity"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <div>
          <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Distance</p>
          <p className="text-sm sm:text-lg font-black text-[var(--text-primary)]">
            {isManual ? '–' : parseFloat(activity.distance || 0).toFixed(2)}
            <span className="text-[9px] text-[var(--text-muted)] ml-0.5">{isManual ? '' : 'km'}</span>
          </p>
        </div>
        <div>
          <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Time</p>
          <p className="text-sm sm:text-lg font-black text-[var(--text-primary)]">{formatTime(activity.duration)}</p>
        </div>
        <div>
          <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Pace</p>
          <p className="text-sm sm:text-lg font-black text-[var(--text-primary)]">
            {activity.pace || '–'}
            <span className="text-[9px] text-[var(--text-muted)] ml-0.5">/km</span>
          </p>
        </div>
        <div>
          <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Calories</p>
          <p className="text-sm sm:text-lg font-black text-[var(--text-primary)]">
            {activity.calories || 0}
            <span className="text-[9px] text-[var(--text-muted)] ml-0.5">kcal</span>
          </p>
        </div>
      </div>

      {(onView || onShare) && (
        <div className="flex gap-2 mt-3">
          {onView && (
            <button
              onClick={() => onView(activity)}
              className="flex-1 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--accent)] border border-[var(--accent-border)] bg-[var(--accent-bg)] rounded-xl py-2 hover:opacity-80 transition-opacity"
            >
              View on map
            </button>
          )}
          {onShare && (
            <button
              onClick={() => onShare(activity)}
              className="flex-1 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-secondary)] border border-[var(--border-medium)] rounded-xl py-2 hover:bg-[var(--bg-hover)] transition-colors"
            >
              Share
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const HistoryTab = ({
  history, historyLoading, historyError, formatTime,
  onRefresh, onDelete, onView, onShare, isOverlay = false,
}) => {
  if (isOverlay) {
    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Activity History</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] hover:opacity-70 px-2 py-1 rounded-lg bg-[var(--bg-hover)]"
            >
              ↺ Refresh
            </button>
          )}
        </div>

        {historyLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--border-light)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        )}

        {historyError && (
          <div className="text-center py-8">
            <p className="text-red-400 text-[10px]">⚠ {historyError}</p>
          </div>
        )}

        {!historyLoading && !historyError && history.length === 0 && <Empty />}

        {!historyLoading && !historyError && history.length > 0 && (
          <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
            {history.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                formatTime={formatTime}
                onView={onView}
                onShare={onShare}
                onDelete={onDelete}
                compact
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-3">
        <h2 className="text-lg md:text-xl font-black tracking-tighter uppercase text-[var(--text-primary)]">
          Activity History
        </h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--accent)] hover:opacity-70 transition-opacity px-3 py-1.5 rounded-lg bg-[var(--bg-hover)]"
          >
            ↺ Refresh
          </button>
        )}
      </div>

      {historyLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--border-light)] border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      )}

      {historyError && (
        <div className="text-center py-12 bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <p className="text-red-400 text-sm font-medium">⚠ {historyError}</p>
          <p className="text-[var(--text-muted)] text-xs mt-2">Check your connection and try again</p>
        </div>
      )}

      {!historyLoading && !historyError && history.length === 0 && <Empty />}

      {!historyLoading && !historyError && history.length > 0 && (
        <div className="space-y-3">
          {history.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              formatTime={formatTime}
              onView={onView}
              onShare={onShare}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
