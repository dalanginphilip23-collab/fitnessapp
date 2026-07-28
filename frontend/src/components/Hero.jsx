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

const getMotivationalMessage = () => {
  const messages = [
    'Ready to crush your goals?',
    'Every rep brings you closer.',
    'Stay consistent, stay strong.',
    'Your future self will thank you.',
    'Progress over perfection.',
    'Champions are made in the details.',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const Hero = ({ name = 'Athlete', goal = 'Unspecified', avatar, activeProgramCount = 0 }) => {
  const goalLabel = GOAL_LABELS[goal] || goal;

  return (
    <div className="bg-(--bg-tertiary) border border-(--border-light) rounded-[20px] p-6 mb-6 flex items-center justify-between gap-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-(--accent)/5 rounded-full blur-3xl pointer-events-none" />
      <div className="min-w-0 relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent) shadow-[0_0_8px_var(--accent)]" />
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--accent)">
            {getGreeting()}
          </p>
        </div>
        <h1 className="font-['Manrope'] text-[24px] sm:text-[28px] font-bold text-(--text-primary) leading-tight truncate">
          {name}
        </h1>
        <p className="text-[12px] text-(--text-muted) font-medium mt-1 mb-2">{getMotivationalMessage()}</p>
        <div className="flex items-center gap-1.5">
          {activeProgramCount > 0 ? (
            <>
              <div className="w-5 h-5 rounded-md bg-(--accent)/20 flex items-center justify-center">
                <Icon name="bolt" className="text-[12px] text-(--accent)" fill={1} />
              </div>
              <span className="text-[11px] text-(--text-muted) font-medium">
                <span className="text-(--text-secondary) font-semibold">
                  {activeProgramCount} active program{activeProgramCount !== 1 ? 's' : ''}
                </span>
              </span>
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded-md bg-(--bg-hover) flex items-center justify-center">
                <Icon name="flag" className="text-[12px] text-(--text-muted)" />
              </div>
              <span className="text-[11px] text-(--text-muted) font-medium">
                Goal: <span className="text-(--text-secondary) font-semibold">{goalLabel}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 relative">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-(--accent)/30 ring-2 ring-(--accent)/10"
          />
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-(--accent-bg) border-2 border-(--accent)/30 ring-2 ring-(--accent)/10 flex items-center justify-center text-lg font-black text-(--accent)">
            {name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;