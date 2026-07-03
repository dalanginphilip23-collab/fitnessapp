import { useState } from "react";
import { Icon } from "../../../components";
import { WORKOUT_OPTIONS } from "../constants/workout";

export default function MobileWorkoutPills({ workoutType, onSelect }) {
  const [open, setOpen] = useState(false);
  const current = WORKOUT_OPTIONS.find(o => o.id === workoutType);

  const handleSelect = (opt) => {
    onSelect(opt);
    setOpen(false);
  };

  return (
    <>
      {/* ── Trigger bar ── */}
      <div className="sm:hidden bg-[var(--bg-secondary)] border-b border-[var(--border-light)] px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={current?.icon ?? 'fitness_center'} className="text-[var(--accent)] text-base" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">
            {current?.label ?? 'Select Exercise'}
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)] text-[9px] font-black uppercase tracking-widest touch-manipulation"
        >
          <Icon name="swap_vert" className="text-xs" />
          Change
        </button>
      </div>

      {/* ── Modal backdrop ── */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-sm flex items-end"
          onClick={() => setOpen(false)}
        >
          {/* ── Bottom sheet ── */}
          <div
            className="w-full bg-[var(--bg-secondary)] border-t border-[var(--border-medium)] rounded-t-3xl p-5 pb-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-[var(--border-heavy)] mx-auto mb-5" />

            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
              Select Exercise
            </p>

            <div className="grid grid-cols-3 gap-3">
              {WORKOUT_OPTIONS.map((opt) => {
                const active = workoutType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all touch-manipulation ${
                      active
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--text-inverse)]'
                        : 'bg-[var(--bg-hover)] border-[var(--border-light)] text-[var(--text-secondary)] active:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Icon
                      name={opt.icon}
                      className={`text-2xl ${active ? 'text-[var(--text-inverse)]' : 'text-[var(--accent)]'}`}
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest leading-tight text-center">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}