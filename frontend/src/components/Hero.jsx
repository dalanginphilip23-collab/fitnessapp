import Icon from './Icon';
import RadialProgress from './RadialProgress';

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

/**
 * Hero — the page's signature moment.
 *
 * Same props/contract as before (name, goal, avatar, activeProgramCount)
 * plus two NEW optional props (calories, caloriesGoal) that Dashboard.jsx
 * already has in `data.stats` — wiring them through is presentation only,
 * no new fetches or state. If they're omitted the ring just shows 0/800,
 * so nothing breaks for any other caller of <Hero />.
 */
const Hero = ({
  name = 'Athlete',
  goal = 'Unspecified',
  avatar,
  activeProgramCount = 0,
  calories = 0,
  caloriesGoal = 800,
}) => {
  const goalLabel = GOAL_LABELS[goal] || goal;
  const pct = Math.min(Math.round((calories / (caloriesGoal || 1)) * 100), 100);

  return (
    <div className="fx-card-hero relative overflow-hidden p-6 sm:p-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      {/* Left: greeting + identity */}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-2">
          {getGreeting()}
        </p>
        <div className="flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[var(--accent-border)] shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--accent-bg)] border-2 border-[var(--accent-border)] flex items-center justify-center text-xl font-black text-[var(--accent)] shrink-0">
              {name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-['Manrope'] text-[26px] sm:text-[34px] font-extrabold text-[var(--text-primary)] leading-[1.05] truncate">
              {name}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              {activeProgramCount > 0 ? (
                <>
                  <Icon name="bolt" className="text-[14px] text-[var(--accent)]" fill={1} />
                  <span className="text-[12px] text-[var(--text-secondary)] font-semibold">
                    {activeProgramCount} active program{activeProgramCount !== 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <>
                  <Icon name="flag" className="text-[14px] text-[var(--text-muted)]" />
                  <span className="text-[12px] text-[var(--text-muted)] font-medium">
                    Goal: <span className="text-[var(--text-secondary)] font-semibold">{goalLabel}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: signature ring — today's calorie progress at a glance */}
      <div className="shrink-0 flex items-center gap-4 self-stretch sm:self-auto">
        <div className="hidden sm:block w-px h-14 bg-[var(--border-light)]" />
        <div className="flex flex-col items-center gap-1">
          <RadialProgress
            value={calories}
            goal={caloriesGoal}
            size={104}
            strokeWidth={9}
            color="var(--metric-calories)"
            displayValue={`${pct}%`}
          />
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Today's Burn
          </span>
        </div>
      </div>
    </div>
  );
};

export default Hero;
