import Icon from '../../../components/ui/Icon';
import PlanCard from './PlanCard';

export default function MyPlans({ plans, onOpen, onContinue }) {
  const enrolled = plans.filter(p => p.is_enrolled === 1);
  if (enrolled.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 sm:py-28 gap-4 text-center" style={{ animation: 'fadeIn 0.3s ease' }}>
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-2 border"
          style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
        >
          <Icon name="fitness_center" className="text-[28px] sm:text-[36px]" style={{ color: 'var(--accent)' }} fill={1} />
        </div>
        <h3 className="text-lg sm:text-xl font-black" style={{ color: 'var(--text-primary)' }}>No plans yet</h3>
        <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          You haven't enrolled in any training blueprint. Head to{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Explore</span> to find your first plan.
        </p>
      </div>
    );
  }
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {(() => {
        const active      = enrolled[0];
        const progressPct = active.progress_pct ?? 0;
        return (
          <div
            className="mb-6 sm:mb-10 rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 group"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--accent-border)' }}
            onClick={() => onOpen(active)}
          >
            <div className="relative h-28 sm:h-36 overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/shapes/svg?seed=${active.image_seed}`}
                alt={active.title}
                className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, var(--bg-card) 30%, transparent 100%)' }}
              />
              <div className="absolute inset-0 flex items-center px-4 sm:px-8 gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                    Currently Active
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black mt-0.5 mb-2 truncate" style={{ color: 'var(--text-primary)' }}>
                    {active.title}
                  </h2>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 h-1 sm:h-1.5 rounded-full" style={{ background: 'var(--border-medium)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progressPct}%`, background: 'var(--accent)' }}
                      />
                    </div>
                    <span className="text-xs font-black tabular-nums flex-shrink-0" style={{ color: 'var(--accent)' }}>
                      {progressPct}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onContinue(active); }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase active:scale-95 transition-all flex-shrink-0"
                  style={{ background: 'var(--accent)', color: '#161f00' }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {enrolled.length > 1 && (
        <>
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-3 sm:mb-4" style={{ color: 'var(--text-muted)' }}>
            All Enrolled Plans
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {enrolled.slice(1).map((plan, i) => (
              <PlanCard
                key={plan.id} plan={plan} onOpen={onOpen} onEnroll={() => {}} onContinue={onContinue}
                style={{ animation: `slideUp 0.3s ease ${i * 0.06}s both` }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}