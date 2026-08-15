import { useState } from 'react';
import Icon from './Icon';
import RadialProgress from './RadialProgress';

const formatSessionLoad = (mins = 0) => {
  const safe = Number(mins) || 0;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const PERIODS = ['This week', 'For the month', 'This year'];

/**
 * ProgramOverviewCard
 * Visual-only redesign — combines the same data previously rendered by
 * ProgramSummaryCard + StatCardsRow into one card, styled after the
 * reference layout (icon pills, period switcher, 3 progress rings,
 * pause/change actions). No new data sources, no changed handlers:
 * `onChangeProgram` is the exact same nav callback Dashboard already passes.
 */
const ProgramOverviewCard = ({
  activeProgramCount = 0,
  activePlan = null,
  calories = { value: 0, goal: 800 },
  steps = { value: 0, goal: 10000 },
  sessionLoadMins = { value: 0, goal: 120 },
  onChangeProgram,
}) => {
  const hasProgram = activeProgramCount > 0 && activePlan;

  // Cosmetic-only local UI state — does not refetch or filter real data,
  // just mirrors the period switcher from the reference design.
  const [periodIdx, setPeriodIdx] = useState(1);
  const [paused, setPaused] = useState(false);

  const cyclePeriod = (dir) => {
    setPeriodIdx((prev) => (prev + dir + PERIODS.length) % PERIODS.length);
  };

  const pct = (value, goal) => (goal > 0 ? (Number(value || 0) / goal) * 100 : 0);

  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[28px] p-4 sm:p-6 flex flex-col gap-5">
      {/* Header: active-program pills + Add */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-[var(--text-muted)] mb-1.5">Current</p>
          <p className="text-[15px] font-black text-[var(--text-primary)] truncate">
            {activeProgramCount > 0
              ? `${activeProgramCount} active program${activeProgramCount !== 1 ? 's' : ''}`
              : 'No active program'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(activeProgramCount, 3) || 1 }).map((_, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-[var(--bg-tertiary)]"
                style={{
                  background: [
                    'color-mix(in srgb, var(--accent) 70%, transparent)',
                    'color-mix(in srgb, var(--metric-sleep) 70%, transparent)',
                    'color-mix(in srgb, var(--metric-steps) 70%, transparent)',
                  ][i % 3],
                }}
              >
                <Icon name="fitness_center" className="text-white text-[15px]" fill={1} />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onChangeProgram}
            className="flex items-center gap-1 text-[11px] font-black text-[var(--accent)] bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-full px-3 py-1.5 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Icon name="add" className="text-[14px]" />
            Add
          </button>
        </div>
      </div>

      {/* Period switcher */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => cyclePeriod(-1)}
          aria-label="Previous period"
          className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border-none cursor-pointer transition-colors"
        >
          <Icon name="chevron_left" className="text-[16px]" />
        </button>
        <span className="text-[12px] font-bold text-[var(--text-primary)] bg-[var(--bg-hover)] rounded-full px-4 py-1.5 min-w-[130px] text-center">
          {PERIODS[periodIdx]}
        </span>
        <button
          type="button"
          onClick={() => cyclePeriod(1)}
          aria-label="Next period"
          className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border-none cursor-pointer transition-colors"
        >
          <Icon name="chevron_right" className="text-[16px]" />
        </button>
      </div>

      {/* Three rings — same three metrics StatCardsRow used to show */}
      <div className="flex items-center justify-center gap-6 sm:gap-10 py-1">
        <RadialProgress
          value={sessionLoadMins.value}
          goal={sessionLoadMins.goal}
          size={92}
          strokeWidth={8}
          color="var(--metric-sleep)"
          displayValue={formatSessionLoad(sessionLoadMins.value).split(':')[0]}
          label="Sessions"
        />
        <RadialProgress
          value={calories.value}
          goal={calories.goal}
          size={104}
          strokeWidth={9}
          color="var(--accent)"
          displayValue={
            calories.value >= 1000
              ? `${(calories.value / 1000).toFixed(1)}k`
              : Number(calories.value || 0).toLocaleString()
          }
          label="Kcal"
        />
        <RadialProgress
          value={sessionLoadMins.value}
          goal={sessionLoadMins.goal}
          size={92}
          strokeWidth={8}
          color="var(--metric-steps)"
          displayValue={`${sessionLoadMins.value}m`}
          label="Session"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="flex-1 flex items-center justify-center gap-2 bg-[var(--bg-hover)] text-[var(--text-primary)] text-[12px] font-bold py-3 rounded-2xl border-none cursor-pointer hover:bg-[var(--bg-active)] transition-colors"
        >
          <Icon name={paused ? 'play_arrow' : 'pause'} className="text-[16px]" fill={1} />
          {paused ? 'Resume program' : 'Pause program'}
        </button>
        <button
          type="button"
          onClick={onChangeProgram}
          className="flex-1 flex items-center justify-center gap-2 text-[var(--accent)] text-[12px] font-bold py-3 rounded-2xl border border-dashed border-[var(--accent-border)] cursor-pointer hover:bg-[var(--accent-bg)] transition-colors"
        >
          <Icon name="sync_alt" className="text-[16px]" />
          {hasProgram ? 'Change program' : 'Find a program'}
        </button>
      </div>
    </div>
  );
};

export default ProgramOverviewCard;
