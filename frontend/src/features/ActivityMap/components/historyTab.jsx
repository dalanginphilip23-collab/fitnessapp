import React from 'react';

const HistoryTab = ({ history, historyLoading, historyError, formatTime, onRefresh, onDelete, isOverlay = false }) => {
  if (isOverlay) {
    // Compact version for overlay panel
    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onRefresh}
            className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] hover:opacity-70 px-2 py-1 rounded-lg bg-[var(--bg-hover)]"
          >
            ↺ Refresh
          </button>
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

        {!historyLoading && !historyError && history.length === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🏃</div>
            <p className="text-[var(--text-muted)] text-[10px]">No activities yet</p>
            <p className="text-[var(--text-disabled)] text-[8px] mt-1">Complete a run to see it here!</p>
          </div>
        )}

        {!historyLoading && !historyError && history.length > 0 && (
          <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
            {history.map((activity) => {
              const d = new Date(activity.created_at || Date.now());
              return (
                <div
                  key={activity.id}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-xl p-3 hover:border-[var(--accent-border)] transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-[9px] font-semibold text-[var(--text-muted)]">
                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex gap-3 mt-2">
                        <div>
                          <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Distance</p>
                          <p className="text-sm font-black text-[var(--text-primary)]">
                            {parseFloat(activity.distance || 0).toFixed(1)}
                            <span className="text-[9px] text-[var(--text-muted)] ml-0.5">km</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Time</p>
                          <p className="text-sm font-black text-[var(--text-primary)]">
                            {formatTime(activity.duration)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Pace</p>
                          <p className="text-sm font-black text-[var(--text-primary)]">
                            {activity.pace || '–'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Calories</p>
                          <p className="text-sm font-black text-[var(--text-primary)]">
                            {activity.calories || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(activity.id)}
                      className="text-[10px] font-medium text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Original full version for full page
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-3">
        <h2 className="text-lg md:text-xl font-black tracking-tighter uppercase text-[var(--text-primary)]">
          Activity History
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--accent)] hover:opacity-70 transition-opacity px-3 py-1.5 rounded-lg bg-[var(--bg-hover)]"
          >
            ↺ Refresh
          </button>
        </div>
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

      {!historyLoading && !historyError && history.length === 0 && (
        <div className="text-center py-16 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-light)]">
          <div className="text-4xl mb-3">🏃</div>
          <p className="text-[var(--text-secondary)] font-medium">No activities yet</p>
          <p className="text-[var(--text-muted)] text-xs mt-1">Go to Run tab and start your first activity!</p>
        </div>
      )}

      {!historyLoading && !historyError && history.length > 0 && (
        <div className="space-y-3">
          {history.map((activity) => {
            const d = new Date(activity.created_at || Date.now());
            return (
              <div
                key={activity.id}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-xl p-4 hover:border-[var(--accent-border)] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--text-muted)]">
                      {d.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-[9px] text-[var(--text-disabled)] mt-0.5">
                      {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--accent)] bg-[var(--accent-bg)] px-2.5 py-1 rounded-full">
                      Run
                    </span>
                    <button
                      onClick={() => onDelete(activity.id)}
                      className="text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Distance</p>
                    <p className="text-lg font-black text-[var(--text-primary)]">
                      {parseFloat(activity.distance || 0).toFixed(2)}
                      <span className="text-xs text-[var(--text-muted)] ml-0.5">km</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Time</p>
                    <p className="text-lg font-black text-[var(--text-primary)]">
                      {formatTime(activity.duration)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Pace</p>
                    <p className="text-lg font-black text-[var(--text-primary)]">
                      {activity.pace || '–'}
                      <span className="text-xs text-[var(--text-muted)] ml-0.5">/km</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Calories</p>
                    <p className="text-lg font-black text-[var(--text-primary)]">
                      {activity.calories || 0}
                      <span className="text-xs text-[var(--text-muted)] ml-0.5">kcal</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;