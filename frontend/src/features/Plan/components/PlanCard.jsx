export default function PlanCard({ plan, onOpen, onEnroll, onContinue, style = {} }) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden border flex flex-col shadow-[var(--shadow-md)] cursor-pointer transition-all duration-500 hover:border-[var(--accent-border)] hover:shadow-[var(--shadow-lg)]"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)', ...style }}
      onClick={() => onOpen(plan)}
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        <img
          src={`https://api.dicebear.com/7.x/shapes/svg?seed=${plan.image_seed}`}
          alt={plan.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40"
        />
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-2">
          <span
            className="px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold tracking-widest uppercase"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: 'var(--accent)' }}
          >
            {plan.tag}
          </span>
          {plan.is_enrolled === 1 && (
            <span
              className="px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold tracking-widest uppercase"
              style={{ background: 'var(--accent)', color: '#161f00' }}
            >
              Owned
            </span>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>
          {plan.title}
        </h3>
        <p className="text-xs sm:text-sm mb-4 sm:mb-5 lg:mb-6 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {plan.description}
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-7 lg:mb-8 text-center">
          {[
            { label: 'Time',   value: plan.duration },
            { label: 'Strain', value: plan.intensity, colored: true },
            { label: 'Focus',  value: plan.target_focus },
          ].map(({ label, value, colored }) => (
            <div key={label}>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold mb-0.5 sm:mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p
                className="text-xs sm:text-sm font-medium"
                style={{
                  color: colored
                    ? value === 'Extreme' ? 'var(--error)' : 'var(--accent)'
                    : 'var(--text-primary)',
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
        <div
          className="mt-auto pt-3 sm:pt-4 flex items-center justify-between border-t"
          style={{ borderColor: 'var(--border-light)' }}
          onClick={e => e.stopPropagation()}
        >
          <span className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {plan.price === 0 || plan.price === '0.00' ? 'Free' : `$${plan.price}`}
          </span>
          {plan.is_enrolled === 1 ? (
            <button
              onClick={e => { e.stopPropagation(); onContinue(plan); }}
              className="px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm active:scale-95 transition-all"
              style={{ background: 'var(--accent)', color: '#161f00' }}
            >
              Continue Plan
            </button>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onEnroll(plan.id); }}
              className="px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm active:scale-95 transition-all"
              style={{ background: 'var(--accent)', color: '#161f00' }}
            >
              Get Access
            </button>
          )}
        </div>
      </div>
    </div>
  );
}