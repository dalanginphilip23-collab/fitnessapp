import { Icon } from '../../../components';

export default function BMIResultCard({ bmi, category, badgeColor, isAnalyzing, showAIModal, onShowAIModal }) {
  return (
    <div className="bg-(--bg-tertiary) border border-(--border-light) rounded-[20px] p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
      <div className="absolute inset-0 pointer-events-none" style={{ background: bmi ? `radial-gradient(ellipse at 30% 50%, ${badgeColor}15 0%, transparent 70%)` : 'none' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-(--accent-bg) flex items-center justify-center">
            <Icon name="monitor_heart" className="text-(--accent) text-[14px]" />
          </div>
          <p className="text-(--accent) font-black uppercase text-[10px] tracking-[0.3em]">Calculated BMI</p>
        </div>
        <h3 className={`leading-none transition-all duration-500 ${bmi ? 'text-7xl md:text-8xl font-black italic tracking-tighter' : 'text-2xl md:text-3xl font-bold uppercase tracking-widest'}`}
          style={{ color: bmi ? badgeColor : 'var(--text-disabled)' }}
        >
          {bmi || 'No Data'}
        </h3>
        <div className="flex items-center gap-2 mt-3">
          <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500"
            style={{ background: bmi ? `${badgeColor}18` : 'var(--bg-hover)', color: bmi ? badgeColor : 'var(--text-disabled)', border: `1px solid ${bmi ? badgeColor + '30' : 'transparent'}` }}
          >
            {category || 'Awaiting Metrics'}
          </span>
        </div>

        {bmi && !showAIModal && (
          <button
            onClick={onShowAIModal}
            className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-(--accent) hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
          >
            <Icon name="neurology" className="text-sm" />
            View AI Recommendation
          </button>
        )}
      </div>

      <div className="mt-8 md:mt-0 relative">
        <div className="w-36 h-36 border-[10px] border-(--border-light) rounded-full flex items-center justify-center relative">
          <div className="w-28 h-28 border-[10px] rounded-full transition-all duration-500"
            style={{ borderColor: bmi ? `${badgeColor}30` : 'var(--border-light)', animation: isAnalyzing ? 'pulse 1.5s infinite' : 'none' }}
          />
          <Icon name="monitoring" className="absolute text-3xl" style={{ color: bmi ? `${badgeColor}80` : 'var(--text-disabled)' }} />
        </div>
      </div>
    </div>
  );
}