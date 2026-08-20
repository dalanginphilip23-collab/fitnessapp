import { useState } from 'react';
import Icon from '../../../components/ui/Icon';
import PlanCard from './PlanCard';
import { CATEGORIES } from '../constants';

export default function Explore({ plans, onOpen, onEnroll, onContinue }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const featured  = plans.slice(0, 2);
  const displayed = activeCategory ? plans.filter(p => p.tag === activeCategory) : plans;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {featured.length > 0 && (
        <div className="mb-6 sm:mb-10">
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-3 sm:mb-4" style={{ color: 'var(--text-muted)' }}>
            Featured Blueprints
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            {featured.map((plan, i) => (
              <div
                key={plan.id}
                className="relative overflow-hidden rounded-2xl cursor-pointer group border transition-all duration-500"
                style={{ borderColor: 'var(--border-light)', animation: `slideUp 0.4s ease ${i * 0.1}s both` }}
                onClick={() => onOpen(plan)}
              >
                <div className="aspect-[21/9] overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${plan.image_seed}`}
                    alt={plan.title}
                    className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, var(--bg-card) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6">
                  <div className="flex gap-2 mb-1.5 sm:mb-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase" style={{ background: 'var(--accent)', color: '#161f00' }}>
                      {plan.tag}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', backdropFilter: 'blur(4px)' }}>
                      {plan.intensity}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-black" style={{ color: 'var(--text-primary)' }}>{plan.title}</h3>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>
                </div>
                {plan.is_enrolled === 1 && (
                  <div
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase"
                    style={{ background: 'var(--accent)', color: '#161f00' }}
                  >
                    Owned
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-6 sm:mb-8" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.tag)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest flex-shrink-0 transition-all border"
            style={{
              background:  activeCategory === cat.tag ? 'var(--accent)'     : 'var(--bg-tertiary)',
              color:       activeCategory === cat.tag ? '#161f00'           : 'var(--text-muted)',
              borderColor: activeCategory === cat.tag ? 'var(--accent)'     : 'var(--border-light)',
            }}
          >
            <Icon name={cat.icon} className="text-[14px] sm:text-[16px]" fill={activeCategory === cat.tag ? 1 : 0} />
            {cat.label}
          </button>
        ))}
      </div>
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center py-16 sm:py-20 gap-3 text-center">
          <Icon name="category" className="text-[40px] sm:text-[48px]" style={{ color: 'var(--border-medium)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No blueprints in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayed.map((plan, i) => (
            <PlanCard
              key={plan.id} plan={plan} onOpen={onOpen} onEnroll={onEnroll} onContinue={onContinue}
              style={{ animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}