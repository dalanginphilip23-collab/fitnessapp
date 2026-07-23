import { Icon } from '../../../components';

/**
 * AI recommendation popup shown after a BMI calculation.
 * Extracted verbatim (same markup/behavior) from BMI.jsx.
 */
export default function AIRecommendationModal({
  bmi,
  category,
  badgeColor,
  isAnalyzing,
  aiSuggestion,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isAnalyzing) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-(--bg-tertiary) border border-(--accent-border) rounded-4xl p-8 relative shadow-2xl"
        style={{ animation: 'bmiModalIn 0.25s ease' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-8 right-8 h-0.5 bg-linear-to-r from-(--accent) via-(--accent-border) to-transparent rounded-full opacity-60" />

        {isAnalyzing ? (
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-(--accent) rounded-full animate-ping" />
            <span className="text-[9px] font-black text-(--accent) uppercase tracking-[0.2em]">
              Clinical Analysis...
            </span>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-(--bg-hover) hover:bg-(--bg-active) flex items-center justify-center transition-colors"
          >
            <Icon name="close" className="text-(--text-muted) text-base" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-(--accent) rounded-lg">
            <Icon name="neurology" className="text-xl" style={{ color: 'var(--text-inverse)' }} />
          </div>
          <h3 className="font-black uppercase text-sm tracking-[0.15em] text-(--accent)">
            Vitalis AI Recommendation
          </h3>
        </div>

        {bmi && (
          <div className="flex items-center gap-3 mb-5 bg-(--bg-hover) rounded-2xl p-4">
            <span className="text-3xl font-black italic" style={{ color: badgeColor }}>
              {bmi}
            </span>
            <span
              className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
              style={{ background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}30` }}
            >
              {category}
            </span>
          </div>
        )}

        <div className="text-base font-medium leading-relaxed italic min-h-15">
          {isAnalyzing ? (
            <span className="text-(--text-disabled) animate-pulse">
              Processing your biometrics...
            </span>
          ) : aiSuggestion ? (
            <span className="text-(--text-secondary)">{`"${aiSuggestion}"`}</span>
          ) : (
            <span className="text-(--text-disabled)">
              No insight available yet.
            </span>
          )}
        </div>

        {!isAnalyzing && (
          <button
            onClick={onClose}
            className="w-full mt-7 py-3.5 bg-(--accent) text-(--text-inverse) font-black uppercase text-[11px] tracking-widest rounded-2xl hover:brightness-110 active:scale-95 transition-all"
          >
            Got it
          </button>
        )}
      </div>

      <style>{`
        @keyframes bmiModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
