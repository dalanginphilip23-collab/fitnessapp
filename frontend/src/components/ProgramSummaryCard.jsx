import Icon from './Icon';

const ProgramSummaryCard = ({ activeProgramCount = 0, onChangeProgram }) => {
  const hasProgram = activeProgramCount > 0;
  const title = hasProgram
    ? `${activeProgramCount} Active Program${activeProgramCount !== 1 ? 's' : ''}`
    : 'No Active Program';
  const subtitle = hasProgram ? 'Keep up the momentum.' : 'Find your perfect workout plan.';

  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 w-11 h-11 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
          <Icon name="calendar_month" className="text-[20px] text-[var(--accent)]" fill={1} />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-[var(--text-primary)] truncate">{title}</p>
          <p className="text-[11px] text-[var(--text-muted)]">{subtitle}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChangeProgram}
        className="btn-primary shrink-0 flex items-center gap-1.5 bg-[var(--accent)] text-[var(--text-inverse)] text-[11px] font-black uppercase tracking-[0.1em] py-2.5 px-4 rounded-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer border-none"
      >
        <Icon name="add" className="text-[15px]" />
        Change Program
      </button>
    </div>
  );
};

export default ProgramSummaryCard;
