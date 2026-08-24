import { useState, useMemo } from 'react';
import Icon from '../../../components/ui/Icon';
import { EQUIPMENT_OPTIONS, MUSCLE_OPTIONS, TYPE_OPTIONS } from '../constants/exerciseCatalog';
import { searchExercises, getAssetUrl } from '@bryllim/workout-guide';

const MUSCLE_MAP = {
  Chest: ['Chest'],
  Back: ['Back', 'Upper Back', 'Lats', 'Lower Back'],
  Shoulders: ['Shoulders', 'Rear Delts'],
  Arms: ['Biceps', 'Triceps', 'Forearms'],
  Legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Legs', 'Posterior Chain'],
  Core: ['Core', 'Hips'],
};

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-black tracking-[0.08em] uppercase text-[var(--text-muted)] mb-1.5">{label}</p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 rounded-[14px] bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[13px] font-medium text-[var(--text-primary)] px-3 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-[var(--accent-border)]"
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <Icon name="unfold_more" className="absolute right-3 top-1/2 -translate-y-1/2 text-[16px] text-[var(--text-muted)] pointer-events-none" />
      </div>
    </div>
  );
}

export default function ExerciseCatalog({ onSelectExercise }) {
  const [query, setQuery] = useState('');
  const [equipment, setEquipment] = useState('All equipment');
  const [muscle, setMuscle] = useState('All muscles');
  const [type, setType] = useState('All types');

  const filtered = useMemo(() => {
    const base = searchExercises(query || undefined, {
      equipment: equipment !== 'All equipment' ? equipment : undefined,
    });
    return base.filter((ex) => {
      if (muscle !== 'All muscles') {
        const allowed = MUSCLE_MAP[muscle] || [muscle];
        if (!allowed.includes(ex.primaryMuscle)) return false;
      }
      if (type !== 'All types') {
        if (type === 'Compound' && ex.isStretch) return false;
        if (type === 'Isolation' && !ex.isStretch && ex.exerciseType !== 'duration') return false;
      }
      return true;
    });
  }, [query, equipment, muscle, type]);

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="flex-[1.4] min-w-0">
          <p className="text-[11px] font-black tracking-[0.08em] uppercase text-[var(--text-muted)] mb-1.5">Search</p>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, equipment, or muscle"
              className="w-full h-11 rounded-[14px] bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] px-4 pr-4 focus:outline-none focus:border-[var(--accent-border)]"
            />
          </div>
        </div>
        <div className="flex flex-[2] gap-2 min-w-0">
          <FilterSelect label="Equipment" value={equipment} options={EQUIPMENT_OPTIONS} onChange={setEquipment} />
          <FilterSelect label="Muscle" value={muscle} options={MUSCLE_OPTIONS} onChange={setMuscle} />
          <FilterSelect label="Type" value={type} options={TYPE_OPTIONS} onChange={setType} />
        </div>
      </div>

      <p className="text-[11px] text-[var(--text-muted)] mb-4">Showing all {filtered.length} exercises</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex) => {
          const img = getAssetUrl(ex.slug, 1);
          return (
            <button
              key={ex.slug}
              type="button"
              onClick={() => onSelectExercise?.({ id: ex.slug, label: ex.name, slug: ex.slug, name: ex.name })}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[16px] p-2 flex flex-col gap-3 text-left cursor-pointer hover:border-[var(--accent-border)] hover:shadow-[0_4px_20px_rgba(139,195,74,0.12)] hover:-translate-y-0.5 transition-all group"
            >
              <div className="bg-[#0A0A0A] rounded-[12px] aspect-[4/3] flex items-center justify-center overflow-hidden relative p-2">
                {img ? (
                  <img
                    src={img}
                    alt={ex.name}
                    loading="lazy"
                    className="w-full h-full object-contain invert brightness-110 contrast-110 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Icon name="fitness_center" className="text-white text-[56px] opacity-90" />
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[var(--accent)]/5 transition-opacity" />
              </div>
              <div className="px-1 pb-1">
                <div className="text-[13px] font-black leading-tight text-[var(--text-primary)] truncate">{ex.name}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{ex.primaryMuscle} · {ex.equipment}</div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 text-center py-12 border border-dashed border-[var(--border-light)] rounded-[16px]">
          <p className="text-[13px] text-[var(--text-muted)]">No exercises match your filters.</p>
        </div>
      )}
      <p className="text-[10px] text-[var(--text-disabled)] text-center mt-6">
        Artwork by Everkinetic, expanded by Bryl Lim — CC BY-SA 4.0
      </p>
    </div>
  );
}
