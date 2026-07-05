export default function CoachFeedbackOverlay({ aiFeedback, isAnalyzing }) {
  return (
    <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-20 max-w-[calc(100%-5rem)] sm:max-w-[280px]">
      <div className="bg-(--bg-overlay) backdrop-blur-xl p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-(--border-medium) border-l-(--accent) border-l-4 sm:border-l-[6px] shadow-(--shadow-xl)">
        <span className="text-[8px] sm:text-[9px] font-black text-(--accent) uppercase tracking-[0.2em] block mb-1 sm:mb-2">
          {isAnalyzing ? '⚡ Analyzing…' : 'Coach Response'}
        </span>
        <p className="text-[10px] sm:text-[12px] font-bold text-white italic leading-relaxed">
          {`"${aiFeedback}"`}
        </p>
      </div>
    </div>
  );
}