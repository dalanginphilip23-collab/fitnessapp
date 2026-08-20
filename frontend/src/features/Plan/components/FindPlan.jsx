import { useState, useMemo } from 'react';
import Icon from '../../../components/ui/Icon';
import PlanCard from './PlanCard';
import { INTENSITY_OPTIONS, FOCUS_OPTIONS, DURATION_OPTIONS } from '../constants';

const FilterPill = ({ options, active, onSelect }) => (
  <div className="flex flex-wrap gap-1.5 sm:gap-2">
    {options.map(opt => (
      <button
        key={opt}
        onClick={() => onSelect(opt)}
        className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all border"
        style={{
          background:  active === opt ? 'var(--accent)'  : 'var(--bg-hover)',
          color:       active === opt ? '#161f00'        : 'var(--text-muted)',
          borderColor: active === opt ? 'var(--accent)'  : 'var(--border-light)',
        }}
      >
        {opt}
      </button>
    ))}
  </div>
);

export default function FindPlan({ plans, onOpen, onEnroll, onContinue }) {
  const [query,     setQuery]     = useState('');
  const [intensity, setIntensity] = useState('All');
  const [focus,     setFocus]     = useState('All');
  const [duration,  setDuration]  = useState('All');

  const filtered = useMemo(() => plans.filter(p => {
    const q = query.toLowerCase();
    return (
      (!q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tag?.toLowerCase().includes(q)) &&
      (intensity === 'All' || p.intensity === intensity) &&
      (focus     === 'All' || p.target_focus?.toLowerCase().includes(focus.toLowerCase())) &&
      (duration  === 'All' || p.duration === duration)
    );
  }), [plans, query, intensity, focus, duration]);

  const clearAll = () => { setQuery(''); setIntensity('All'); setFocus('All'); setDuration('All'); };
  const hasFilters = query || intensity !== 'All' || focus !== 'All' || duration !== 'All';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="relative mb-4 sm:mb-6">
        <Icon name="search" className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[18px] sm:text-[20px]" style={{ color: 'var(--text-muted)' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search blueprints..."
          className="w-full rounded-xl pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm outline-none border transition-all"
          style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        )}
      </div>
      <div className="rounded-xl p-3 sm:p-5 mb-6 sm:mb-8 space-y-3 sm:space-y-4 border" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}>
        {[
          { label: 'Intensity', opts: INTENSITY_OPTIONS, active: intensity, set: setIntensity },
          { label: 'Focus Area', opts: FOCUS_OPTIONS,    active: focus,     set: setFocus     },
          { label: 'Duration',  opts: DURATION_OPTIONS,  active: duration,  set: setDuration  },
        ].map(({ label, opts, active, set }) => (
          <div key={label}>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <FilterPill options={opts} active={active} onSelect={set} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{filtered.length}</span>{' '}
          blueprint{filtered.length !== 1 ? 's' : ''} found
        </p>
        {hasFilters && (
          <button onClick={clearAll} className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:underline" style={{ color: 'var(--accent)' }}>
            Clear All
          </button>
        )}
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 sm:py-20 gap-3 text-center">
          <Icon name="search_off" className="text-[40px] sm:text-[48px]" style={{ color: 'var(--border-medium)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No blueprints match your filters.</p>
          <button onClick={clearAll} className="text-sm font-bold hover:underline" style={{ color: 'var(--accent)' }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((plan, i) => (
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