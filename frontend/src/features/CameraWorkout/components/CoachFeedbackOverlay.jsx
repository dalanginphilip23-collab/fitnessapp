export default function CoachFeedbackOverlay({ aiFeedback, isAnalyzing }) {
  return (
    <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 max-w-[calc(100%-5rem)] sm:max-w-[280px]">
      <div className="bg-black/60 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/10 border-l-[var(--accent)] border-l-4 shadow-xl">
        <span className="text-[8px] sm:text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.2em] flex items-center gap-1.5 mb-1.5">
          {isAnalyzing && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          )}
          {isAnalyzing ? "Analyzing…" : "Coach Response"}
        </span>
        <p className="text-[10px] sm:text-[12px] font-bold text-white italic leading-relaxed">
          {`"${aiFeedback}"`}
        </p>
      </div>
    </div>
  );
}
