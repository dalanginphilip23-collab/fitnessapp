import { Icon } from '../../../components';

/**
 * Big BMI result display card with the animated ring.
 * Extracted verbatim (same markup/behavior) from BMI.jsx.
 */
export default function BMIResultCard({ bmi, category, badgeColor, isAnalyzing, showAIModal, onShowAIModal }) {
  return (
    <div className="lg:col-span-8 flex flex-col gap-6">
      <div className="bg-(--bg-tertiary) border border-(--border-medium) rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: bmi
              ? `radial-gradient(ellipse at 30% 50%, ${badgeColor}10 0%, transparent 70%)`
              : 'none',
          }}
        />

        <div className="relative z-10">
          <p className="text-(--accent) font-black uppercase text-[11px] tracking-[0.4em] mb-2">
            Calculated BMI
          </p>
          <h3
            className={`leading-none transition-all duration-500 ${
              bmi
                ? 'text-8xl md:text-9xl font-black italic tracking-tighter'
                : 'text-2xl md:text-3xl font-bold uppercase tracking-widest'
            }`}
            style={{ color: bmi ? badgeColor : 'var(--text-disabled)' }}
          >
            {bmi || 'No Data'}
          </h3>
          <div className="flex items-center gap-2 mt-4">
            <span
              className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500"
              style={{
                background: bmi ? `${badgeColor}18` : 'var(--bg-hover)',
                color: bmi ? badgeColor : 'var(--text-disabled)',
                border: `1px solid ${bmi ? badgeColor + '30' : 'transparent'}`,
              }}
            >
              {category || 'Awaiting Metrics'}
            </span>
          </div>

          {bmi && !showAIModal && (
            <button
              onClick={onShowAIModal}
              className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-(--accent) hover:opacity-80 transition-opacity"
            >
              <Icon name="neurology" className="text-sm" />
              View AI Recommendation
            </button>
          )}
        </div>

        <div className="mt-8 md:mt-0 relative">
          <div className="w-40 h-40 border-12 border-(--border-light) rounded-full flex items-center justify-center relative">
            <div
              className="w-32 h-32 border-12 rounded-full transition-all duration-500"
              style={{
                borderColor: bmi ? `${badgeColor}30` : 'var(--border-light)',
                animation: isAnalyzing ? 'pulse 1.5s infinite' : 'none',
              }}
            />
            <Icon name="monitoring" className="absolute text-4xl" style={{ color: bmi ? `${badgeColor}80` : 'var(--text-disabled)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
