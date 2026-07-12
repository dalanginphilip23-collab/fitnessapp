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

const Hero = ({ name = 'Athlete', goal = 'Unspecified', avatar }) => {
  const goalLabel = GOAL_LABELS[goal] || goal;

  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[14px] p-[22px] mb-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)] mb-1.5">
          {getGreeting()}
        </p>
        <h1 className="font-['Manrope'] text-[22px] sm:text-[26px] font-bold text-[var(--text-primary)] leading-tight truncate">
          {name}
        </h1>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Icon name="flag" className="text-[13px] text-[var(--text-muted)]" />
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            Goal: <span className="text-[var(--text-secondary)] font-semibold">{goalLabel}</span>
          </span>
        </div>
      </div>

      <div className="shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[var(--accent-border)]"
          />
        ) : (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--accent-bg)] border-2 border-[var(--accent-border)] flex items-center justify-center text-base font-black text-[var(--accent)]">
            {name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;