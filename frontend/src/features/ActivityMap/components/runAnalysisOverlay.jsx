import React from 'react';

const RunAnalysisOverlay = ({ analysis, onClose }) => {
  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-tertiary)] border border-[var(--border-medium)] rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--accent-bg)] to-transparent px-5 py-4 border-b border-[var(--border-light)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{analysis.emoji_verdict || '🏃'}</span>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[var(--accent)]">AI Run Analysis</p>
              <p className="text-[10px] text-[var(--text-muted)]">Powered by Vitalis AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <span className="text-[var(--text-muted)] text-sm">✕</span>
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-[var(--border-light)]">
          <div className="text-center">
            <p className="text-[11px] sm:text-[13px] font-black text-[var(--text-primary)]">{analysis.stats?.distance || '0'}</p>
            <p className="text-[8px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Distance</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] sm:text-[13px] font-black text-[var(--text-primary)]">{analysis.stats?.duration || '0:00'}</p>
            <p className="text-[8px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Time</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] sm:text-[13px] font-black text-[var(--text-primary)]">{analysis.stats?.pace || '0:00'}</p>
            <p className="text-[8px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Pace</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] sm:text-[13px] font-black text-[var(--text-primary)]">{analysis.stats?.calories || '0'}</p>
            <p className="text-[8px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Calories</p>
          </div>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]/60 mb-1.5">Run Summary</p>
            <p className="text-[12px] sm:text-[13px] text-[var(--text-secondary)] leading-relaxed">{analysis.summary || 'Great run! Keep up the good work.'}</p>
          </div>
          <div className="bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-2xl px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] mb-1.5">🔮 30-Day Prediction</p>
            <p className="text-[12px] sm:text-[13px] text-[var(--text-secondary)] leading-relaxed">{analysis.prediction || 'Consistency will lead to significant improvements.'}</p>
          </div>
          <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-2xl px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1.5">💡 Next Run Tip</p>
            <p className="text-[12px] sm:text-[13px] text-[var(--text-secondary)] leading-relaxed">{analysis.tip || 'Focus on maintaining a steady pace throughout.'}</p>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full bg-[var(--accent)] text-black rounded-full py-3 text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
          >
            Let's Go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default RunAnalysisOverlay;