import Icon from '../../../components/ui/Icon';

export default function PlanDetailOverlay({ plan, onClose, onStart }) {
  if (!plan) return null;
  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 md:p-6 overflow-y-auto"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl sm:my-auto max-h-[92vh] flex flex-col"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* drag pill for mobile sheet */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-medium)' }} />
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="aspect-[16/7] relative overflow-hidden flex-shrink-0">
            <img
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${plan.image_seed}`}
              alt={plan.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, var(--bg-secondary) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}
            />
            <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 flex gap-2">
              <span
                className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase"
                style={{ background: 'var(--accent)', color: '#161f00' }}
              >
                {plan.tag}
              </span>
              <span
                className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase"
                style={{ background: 'var(--bg-hover)', backdropFilter: 'blur(4px)', color: 'var(--text-secondary)' }}
              >
                {plan.intensity}
              </span>
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(0,0,0,0.45)', color: 'var(--text-muted)' }}
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{plan.title}</h2>
            <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {[
                { label: 'Duration',  value: plan.duration,      icon: 'schedule' },
                { label: 'Intensity', value: plan.intensity,     icon: 'bolt' },
                { label: 'Focus',     value: plan.target_focus,  icon: 'track_changes' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="rounded-xl p-2.5 sm:p-3 text-center border"
                  style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}
                >
                  <Icon name={stat.icon} className="text-[14px] sm:text-[16px] mb-0.5 sm:mb-1" style={{ color: 'var(--accent)' }} fill={1} />
                  <p className="text-[9px] sm:text-[10px] uppercase font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  <p className="text-[10px] sm:text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div
              className="rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border"
              style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
            >
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5 sm:mb-2" style={{ color: 'var(--accent)' }}>
                What this plan does
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                This structured {plan.duration} program targets{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{plan.target_focus}</strong> with daily progressive
                sessions. Each day builds on the last — follow the protocol, complete every task, and unlock the next day.
              </p>
            </div>
            <div className="flex items-center justify-between mb-4 sm:mb-5 px-1">
              <span className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                {plan.price === 0 || plan.price === '0.00' ? 'Free' : `$${plan.price}`}
              </span>
              {plan.price > 0 && plan.is_enrolled !== 1 && (
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  One-time purchase
                </span>
              )}
            </div>
            <button
              onClick={onStart}
              className="w-full py-3 sm:py-3.5 rounded-xl font-black text-sm tracking-wide uppercase active:scale-[0.98] transition-all duration-200"
              style={{ background: 'var(--accent)', color: '#161f00' }}
            >
              {plan.is_enrolled === 1 ? 'Open Plan Tracker' : 'Start Plan → Day 1'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}