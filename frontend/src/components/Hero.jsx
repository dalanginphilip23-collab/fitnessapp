import { useState, useEffect } from 'react';
import Icon from './Icon';

const GOAL_LABELS = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  endurance: 'Endurance',
  general_fitness: 'General Fitness',
  Unspecified: 'Set a goal',
};

const MOTIVATIONS = [
  "Let's crush today's workout",
  'Every rep brings you closer',
  'Stronger than yesterday',
  'Push beyond your limits',
  'Your body can do this',
  'Champions keep moving',
  'Sweat is just fat crying',
  'One more set, let\'s go',
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Hero = ({ name = 'Athlete', goal = 'Unspecified', avatar, activeProgramCount = 0 }) => {
  const goalLabel = GOAL_LABELS[goal] || goal;
  const [motto, setMotto] = useState(MOTIVATIONS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMotto(prev => {
        const idx = MOTIVATIONS.indexOf(prev);
        return MOTIVATIONS[(idx + 1) % MOTIVATIONS.length];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-(--bg-tertiary) border border-(--border-light) rounded-[20px] p-[22px] mb-6 flex items-center justify-between gap-4 shadow-sm card-glow mesh-gradient-warm">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-(--accent)">
            {getGreeting()}
          </span>
          <span className="text-[8px] font-bold text-(--text-muted) animate-fade-in-up inline-block" key={motto}>
            — {motto}
          </span>
        </div>
        <h1 className="font-['Manrope'] text-[22px] sm:text-[26px] font-bold text-(--text-primary) leading-tight truncate">
          {name}
        </h1>
        <div className="flex items-center gap-1.5 mt-1.5">
          {activeProgramCount > 0 ? (
            <>
              <Icon name="bolt" className="text-[13px] text-(--accent)" fill={1} />
              <span className="text-[11px] text-(--text-muted) font-medium">
                <span className="text-(--text-secondary) font-semibold">
                  {activeProgramCount} active program{activeProgramCount !== 1 ? 's' : ''}
                </span>
              </span>
            </>
          ) : (
            <>
              <Icon name="flag" className="text-[13px] text-(--text-muted)" />
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
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-(--accent-border) ring-3 ring-(--accent)/15"
          />
        ) : (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-(--accent-bg) border-2 border-(--accent-border) ring-3 ring-(--accent)/15 flex items-center justify-center text-base font-black text-(--accent)">
            {name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        )}
        {activeProgramCount > 0 && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-(--accent) rounded-full border-[2px] border-(--bg-tertiary) animate-energy-pulse" />
        )}
      </div>
    </div>
  );
};

export default Hero;