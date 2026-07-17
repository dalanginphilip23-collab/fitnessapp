import React, { useState } from 'react';

const StatsPanel = ({ metrics, splits, formatTime, isDesktop }) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  // ── Desktop sidebar ──────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="w-[300px] xl:w-[340px] 2xl:w-[380px] flex-shrink-0 bg-[var(--bg-tertiary)] flex flex-col gap-4 xl:gap-5 p-4 xl:p-5 overflow-y-auto border-l border-[var(--border-light)]">
        <h2 className="text-base xl:text-lg font-black italic tracking-tighter uppercase text-[var(--text-primary)]/90">
          Run Session
        </h2>

        <div className="grid grid-cols-2 gap-2 xl:gap-3">
          <div className="bg-[var(--bg-hover)] p-3 xl:p-4 rounded-2xl border border-[var(--border-light)]">
            <p className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-[0.2em] mb-1">Time</p>
            <h3 className="text-xl xl:text-2xl font-black italic tracking-tighter text-[var(--text-primary)]">
              {formatTime(metrics.time)}
            </h3>
          </div>
          <div className="bg-[var(--bg-hover)] p-3 xl:p-4 rounded-2xl border border-[var(--border-light)]">
            <p className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-[0.2em] mb-1">Dist (km)</p>
            <h3 className="text-xl xl:text-2xl font-black italic tracking-tighter text-[var(--text-primary)]">
              {metrics.distance.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 xl:p-4 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)]">
          <div className="flex items-center gap-2 xl:gap-3">
            <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-black font-black text-sm">P</div>
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">Pace</p>
              <p className="text-[9px] text-[var(--text-muted)] uppercase">Min/KM</p>
            </div>
          </div>
          <span className="text-lg xl:text-xl font-black italic text-[var(--accent)]">{metrics.pace}</span>
        </div>

        <div className="flex items-center justify-between p-3 xl:p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-light)]">
          <div className="flex items-center gap-2 xl:gap-3">
            <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 font-black text-sm">C</div>
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">Calories</p>
              <p className="text-[9px] text-[var(--text-muted)] uppercase">Est.</p>
            </div>
          </div>
          <span className="text-lg xl:text-xl font-black italic text-[var(--text-primary)]">{metrics.calories}</span>
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 px-1">Splits</p>
          <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[200px] xl:max-h-none scrollbar-none">
            {splits.length === 0 ? (
              <p className="text-[10px] text-[var(--text-muted)] text-center py-3">No splits yet</p>
            ) : (
              splits.map((s) => (
                <div key={s.km} className="flex justify-between px-3 py-2 xl:py-2.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-light)]">
                  <span className="text-[9px] font-bold text-[var(--text-muted)]">KM {s.km}</span>
                  <span className="text-[10px] font-black italic text-[var(--accent)]">{s.pace}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile: fixed stats bar + expandable sheet ───────────────────────────
  return (
    <>
      {/* Stats bar — always visible, fixed above the Start button */}
      {!sheetOpen && (
        <div
          className="fixed left-0 right-0 z-[900] px-3"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 9rem)' }}
        >
          <button
            onClick={() => setSheetOpen(true)}
            className="w-full bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border-medium)] rounded-2xl px-3 py-2.5 flex items-center justify-between shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <div className="flex-shrink-0">
                <p className="text-[8px] text-[var(--text-muted)] uppercase font-black tracking-widest">Time</p>
                <p className="text-sm font-black italic text-[var(--text-primary)]">{formatTime(metrics.time)}</p>
              </div>
              <div className="w-px h-6 bg-[var(--border-light)] flex-shrink-0" />
              <div className="flex-shrink-0">
                <p className="text-[8px] text-[var(--text-muted)] uppercase font-black tracking-widest">Dist</p>
                <p className="text-sm font-black italic text-[var(--text-primary)]">{metrics.distance.toFixed(2)} km</p>
              </div>
              <div className="w-px h-6 bg-[var(--border-light)] flex-shrink-0" />
              <div className="flex-shrink-0">
                <p className="text-[8px] text-[var(--text-muted)] uppercase font-black tracking-widest">Pace</p>
                <p className="text-sm font-black italic text-[var(--accent)]">{metrics.pace}</p>
              </div>
            </div>
            <span className="text-[var(--text-muted)] text-base ml-2 flex-shrink-0">↑</span>
          </button>
        </div>
      )}

      {/* Expanded sheet — fixed overlay */}
      {sheetOpen && (
        <div
          className="fixed left-0 right-0 z-[900] px-3"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 9rem)' }}
        >
          <div className="w-full bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-medium)] rounded-2xl p-4 shadow-[var(--shadow-xl)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Run Session</p>
              <button
                onClick={() => setSheetOpen(false)}
                className="text-[var(--text-muted)] text-xs hover:text-[var(--text-primary)] transition-colors"
              >
                ↓ Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-[var(--bg-hover)] rounded-2xl p-2.5 border border-[var(--border-light)]">
                <p className="text-[8px] text-[var(--text-muted)] uppercase font-black tracking-widest mb-0.5">Time</p>
                <p className="text-lg font-black italic tracking-tighter text-[var(--text-primary)]">{formatTime(metrics.time)}</p>
              </div>
              <div className="bg-[var(--bg-hover)] rounded-2xl p-2.5 border border-[var(--border-light)]">
                <p className="text-[8px] text-[var(--text-muted)] uppercase font-black tracking-widest mb-0.5">Dist (km)</p>
                <p className="text-lg font-black italic tracking-tighter text-[var(--text-primary)]">{metrics.distance.toFixed(2)}</p>
              </div>
              <div className="bg-[var(--bg-hover)] rounded-2xl p-2.5 border border-[var(--border-light)]">
                <p className="text-[8px] text-[var(--text-muted)] uppercase font-black tracking-widest mb-0.5">Pace</p>
                <p className="text-lg font-black italic tracking-tighter text-[var(--accent)]">{metrics.pace}</p>
              </div>
              <div className="bg-[var(--bg-hover)] rounded-2xl p-2.5 border border-[var(--border-light)]">
                <p className="text-[8px] text-[var(--text-muted)] uppercase font-black tracking-widest mb-0.5">Cal</p>
                <p className="text-lg font-black italic tracking-tighter text-[var(--text-primary)]">{metrics.calories}</p>
              </div>
            </div>
            {splits.length > 0 && (
              <div className="max-h-[90px] overflow-y-auto space-y-1.5 scrollbar-none">
                {splits.map((s) => (
                  <div key={s.km} className="flex justify-between px-3 py-1.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-light)]">
                    <span className="text-[9px] font-bold text-[var(--text-muted)]">KM {s.km}</span>
                    <span className="text-[10px] font-black italic text-[var(--accent)]">{s.pace}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StatsPanel;