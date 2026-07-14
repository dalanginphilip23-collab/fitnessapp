
import { useState, useMemo } from 'react';
import { Icon } from '../../../components';
import BodyZoneIcon from './bodyZoneIcon';
import { WORKOUT_OPTIONS } from '../constants/workout';

export default function ExercisePickerList({ open, workoutType, onSelect, onClose }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WORKOUT_OPTIONS;
    return WORKOUT_OPTIONS.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.muscle.toLowerCase().includes(q) ||
        o.equipment.toLowerCase().includes(q)
    );
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border-light)' }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--bg-hover)' }}
          aria-label="Close exercise picker"
        >
          <Icon name="close" className="text-[18px]" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div
          className="flex-1 flex items-center gap-2 rounded-xl px-3.5 py-2.5"
          style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-medium)' }}
        >
          <Icon name="search" className="text-[16px]" style={{ color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Icon name="search_off" className="text-[36px]" style={{ color: 'var(--border-medium)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No exercises found.</p>
          </div>
        ) : (
          filtered.map((opt) => {
            const active = opt.id === workoutType;
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt)}
                className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b text-left transition-colors"
                style={{
                  borderColor: 'var(--border-light)',
                  backgroundColor: active ? 'var(--accent-bg)' : 'transparent',
                }}
              >
                <div className="min-w-0">
                  <p
                    className="text-base font-bold truncate"
                    style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {opt.muscle} · {opt.equipment}
                  </p>
                </div>
                <BodyZoneIcon zone={opt.zone} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}