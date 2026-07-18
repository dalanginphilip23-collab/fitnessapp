import Icon from './Icon';

/**
 * Compact list row: thumbnail, title, a small meta row (icon + label pills),
 * a thin progress bar, and a status caption ("Completed" or "N% Completed").
 * Pure layout component — colors come entirely from the app's existing
 * CSS variables, nothing hardcoded.
 */
const ProgressListItem = ({
  thumbnail,
  thumbnailIcon = 'fitness_center',
  title,
  meta = [],        // e.g. [{ icon: 'schedule', label: '32min' }, { icon: 'bolt', label: 'HIIT' }]
  progressPct = 0,
  completed = false,
  onClick,
}) => {
  const pct = Math.min(Math.max(progressPct, 0), 100);

  return (
    <div
      onClick={onClick}
      className={`fx-card flex items-center gap-3 sm:gap-4 p-3 sm:p-4 ${onClick ? 'cursor-pointer hover:border-[var(--border-medium)] transition-colors' : ''}`}
    >
      <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-[var(--card-radius-sm)] overflow-hidden bg-[var(--bg-hover)] flex items-center justify-center">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <Icon name={thumbnailIcon} className="text-[22px] text-[var(--text-muted)]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] sm:text-[14px] font-bold text-[var(--text-primary)] truncate mb-1">
          {title}
        </h4>

        {meta.length > 0 && (
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            {meta.map((m, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] font-semibold text-[var(--text-muted)]">
                <Icon name={m.icon} className="text-[12px]" />
                {m.label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: completed ? 'var(--accent)' : 'var(--metric-load)' }}
            />
          </div>
        </div>

        <div className="mt-1.5">
          {completed ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent)]">
              <Icon name="check_circle" className="text-[12px]" fill={1} />
              Completed
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-[var(--text-muted)]">
              {pct}% Completed
            </span>
          )}
        </div>
      </div>

      {onClick && <Icon name="chevron_right" className="text-[16px] text-[var(--text-muted)] shrink-0" />}
    </div>
  );
};

export default ProgressListItem;
