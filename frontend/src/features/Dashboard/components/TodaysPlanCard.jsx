import Icon from '../../../components/ui/Icon';

export default function TodaysPlanCard({ activePlan, activeProgramCount, onView }) {
  const hasPlan = activeProgramCount > 0 && activePlan;

  const title = hasPlan
    ? (activePlan.title || activePlan.name || 'No Plan Selected')
    : 'No Plan Selected';

  const meta = hasPlan
    ? (() => {
        const duration = activePlan.duration_days || activePlan.duration;
        const focus = activePlan.target_focus || activePlan.level;
        const parts = [];
        if (duration) parts.push(`${duration} days`);
        if (focus) parts.push(focus.charAt(0).toUpperCase() + focus.slice(1));
        return parts.length > 0 ? parts.join(' • ') : '';
      })()
    : '';

  const progress = hasPlan
    ? (() => {
        const completed = activePlan.completed_days ?? 0;
        const total = activePlan.duration_days ?? activePlan.duration ?? 0;
        const pct = activePlan.progress_pct ?? 0;
        if (total > 0) return `${completed}/${total} Days`;
        if (pct > 0) return `${pct}% Complete`;
        return '';
      })()
    : '';

  const image = hasPlan && activePlan.image_seed
    ? `https://images.unsplash.com/photo-${activePlan.image_seed}?w=200&h=200&fit=crop&crop=center`
    : 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop&crop=center';

  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[18px] p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-black text-[var(--text-primary)]">Todays Plan</span>
        {hasPlan && (
          <button type="button" onClick={onView} className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer">Detail</button>
        )}
      </div>
      <button type="button" onClick={onView} className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[16px] p-3 text-left w-full cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
        <img
          src={image}
          alt="Workout"
          className="w-14 h-14 rounded-xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-[var(--text-primary)] leading-tight truncate">{title}</div>
          {meta && <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{meta}</div>}
          {progress && <div className="text-[11px] font-bold text-[var(--text-secondary)] mt-1">{progress}</div>}
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center shrink-0">
          <Icon name="play_arrow" className="text-[16px]" fill={1} />
        </div>
      </button>
    </div>
  );
}
