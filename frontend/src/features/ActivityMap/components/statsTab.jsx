import React from 'react';

const StatsTab = ({ stats, statsLoading, statsError, formatTime, isOverlay = false }) => {
  if (isOverlay) {
    // Compact version for overlay panel
    return (
      <div className="p-3">
        {statsLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--border-light)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        )}

        {statsError && (
          <div className="text-center py-8">
            <p className="text-red-400 text-[10px]">⚠ {statsError}</p>
          </div>
        )}

        {!statsLoading && !statsError && stats && (
          <div className="space-y-3">
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Total Runs</p>
                  <p className="text-xl font-black text-[var(--accent)]">{stats.totalRuns ?? 0}</p>
                </div>
                <span className="text-2xl">🏃</span>
              </div>
            </div>

            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Total Distance</p>
                  <p className="text-xl font-black text-[var(--accent)]">
                    {parseFloat(stats.totalDistance || 0).toFixed(1)}
                    <span className="text-[10px] text-[var(--text-muted)] ml-0.5">km</span>
                  </p>
                </div>
                <span className="text-2xl">📏</span>
              </div>
            </div>

            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Total Time</p>
                  <p className="text-sm font-black text-[var(--accent)]">
                    {formatTime(parseInt(stats.totalDuration) || 0)}
                  </p>
                </div>
                <span className="text-2xl">⏱️</span>
              </div>
            </div>

            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Calories Burned</p>
                  <p className="text-xl font-black text-[var(--accent)]">
                    {parseInt(stats.totalCalories) || 0}
                    <span className="text-[10px] text-[var(--text-muted)] ml-0.5">kcal</span>
                  </p>
                </div>
                <span className="text-2xl">🔥</span>
              </div>
            </div>

            {/* Average per run */}
            {stats.totalRuns > 0 && (
              <>
                <div className="border-t border-[var(--border-light)] my-3 pt-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Average per Run</p>
                </div>
                
                <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Avg Distance</p>
                      <p className="text-lg font-black text-[var(--accent)]">
                        {(stats.totalDistance / stats.totalRuns).toFixed(1)}
                        <span className="text-[10px] text-[var(--text-muted)] ml-0.5">km</span>
                      </p>
                    </div>
                    <span className="text-xl">📏</span>
                  </div>
                </div>

                <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Avg Time</p>
                      <p className="text-sm font-black text-[var(--accent)]">
                        {formatTime(Math.floor(stats.totalDuration / stats.totalRuns))}
                      </p>
                    </div>
                    <span className="text-xl">⏱️</span>
                  </div>
                </div>

                <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Avg Calories</p>
                      <p className="text-lg font-black text-[var(--accent)]">
                        {Math.floor(stats.totalCalories / stats.totalRuns)}
                        <span className="text-[10px] text-[var(--text-muted)] ml-0.5">kcal</span>
                      </p>
                    </div>
                    <span className="text-xl">🔥</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!statsLoading && !statsError && !stats && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-[var(--text-muted)] text-[10px]">No statistics yet</p>
            <p className="text-[var(--text-disabled)] text-[8px] mt-1">Complete a run to see stats!</p>
          </div>
        )}
      </div>
    );
  }

  // Original full version for full page
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-black tracking-tighter uppercase text-[var(--text-primary)] mb-4 md:mb-6">
        Summary Statistics
      </h2>

      {statsLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--border-light)] border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      )}

      {statsError && (
        <div className="text-center py-12 bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <p className="text-red-400 text-sm font-medium">⚠ {statsError}</p>
          <p className="text-[var(--text-muted)] text-xs mt-2">Unable to load statistics</p>
        </div>
      )}

      {!statsLoading && !statsError && stats && (
        <div className="space-y-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow-sm)] p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🏃</span>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Total Runs</h3>
              </div>
              <p className="text-3xl md:text-4xl font-black text-[var(--accent)]">
                {stats.totalRuns ?? 0}
              </p>
            </div>

            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow-sm)] p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📏</span>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Total Distance</h3>
              </div>
              <p className="text-3xl md:text-4xl font-black text-[var(--accent)]">
                {parseFloat(stats.totalDistance || 0).toFixed(1)}
                <span className="text-base text-[var(--text-muted)] ml-1">km</span>
              </p>
            </div>

            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow-sm)] p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⏱️</span>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Total Time</h3>
              </div>
              <p className="text-2xl md:text-3xl font-black text-[var(--accent)]">
                {formatTime(parseInt(stats.totalDuration) || 0)}
              </p>
            </div>

            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow-sm)] p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔥</span>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Calories Burned</h3>
              </div>
              <p className="text-3xl md:text-4xl font-black text-[var(--accent)]">
                {parseInt(stats.totalCalories) || 0}
                <span className="text-base text-[var(--text-muted)] ml-1">kcal</span>
              </p>
            </div>
          </div>

          {/* Averages Section */}
          {stats.totalRuns > 0 && (
            <>
              <div className="border-t border-[var(--border-light)] pt-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                  Average Per Run
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-4">
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Avg Distance</p>
                    <p className="text-2xl font-black text-[var(--accent)]">
                      {(stats.totalDistance / stats.totalRuns).toFixed(1)}
                      <span className="text-xs text-[var(--text-muted)] ml-1">km</span>
                    </p>
                  </div>
                  <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-4">
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Avg Time</p>
                    <p className="text-xl font-black text-[var(--accent)]">
                      {formatTime(Math.floor(stats.totalDuration / stats.totalRuns))}
                    </p>
                  </div>
                  <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-4">
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Avg Calories</p>
                    <p className="text-2xl font-black text-[var(--accent)]">
                      {Math.floor(stats.totalCalories / stats.totalRuns)}
                      <span className="text-xs text-[var(--text-muted)] ml-1">kcal</span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Best Run Section */}
          {stats.bestRun && (
            <div className="border-t border-[var(--border-light)] pt-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                Best Performance
              </h3>
              <div className="bg-gradient-to-r from-[var(--accent-bg)] to-transparent border border-[var(--accent-border)] rounded-2xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-[9px] text-[var(--accent)] uppercase tracking-wider">Longest Distance</p>
                    <p className="text-2xl font-black text-[var(--text-primary)]">
                      {stats.bestRun.distance.toFixed(1)}
                      <span className="text-xs text-[var(--text-muted)] ml-1">km</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--accent)] uppercase tracking-wider">Date</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {new Date(stats.bestRun.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!statsLoading && !statsError && !stats && (
        <div className="text-center py-16 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-light)]">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-[var(--text-secondary)] font-medium">No statistics yet</p>
          <p className="text-[var(--text-muted)] text-xs mt-1">Complete your first run to see stats!</p>
        </div>
      )}
    </div>
  );
};

export default StatsTab;