import Icon from './Icon';

const GOAL_LABELS = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  endurance: 'Endurance',
  general_fitness: 'General Fitness',
  Unspecified: 'Set a goal',
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Hero = ({ name = 'Athlete', goal = 'Unspecified', avatar, activeProgramCount = 0 }) => {
  const goalLabel = GOAL_LABELS[goal] || goal;

  return (
    <div className="fx-card-hero shadow-[var(--shadow-sm)] p-[24px] sm:p-[28px] mb-5 sm:mb-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)] mb-1.5">
          {getGreeting()}
        </p>
        <h1 className="font-['Manrope'] text-[24px] sm:text-[28px] font-bold text-[var(--text-primary)] leading-tight truncate">
          {name}
        </h1>
        <div className="flex items-center gap-1.5 mt-1.5">
          {activeProgramCount > 0 ? (
            <>
              <Icon name="bolt" className="text-[13px] text-[var(--accent)]" fill={1} />
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                <span className="text-[var(--text-secondary)] font-semibold">
                  {activeProgramCount} active program{activeProgramCount !== 1 ? 's' : ''}
                </span>
              </span>
            </>
          ) : (
            <>
              <Icon name="flag" className="text-[13px] text-[var(--text-muted)]" />
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                Goal: <span className="text-[var(--text-secondary)] font-semibold">{goalLabel}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-[52px] h-[52px] sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[var(--accent-border)]"
          />
        ) : (
          <div className="w-[52px] h-[52px] sm:w-16 sm:h-16 rounded-full bg-[var(--accent-bg)] border-2 border-[var(--accent-border)] flex items-center justify-center text-base font-black text-[var(--accent)]">
            {name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;