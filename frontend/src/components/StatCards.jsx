import Icon from './Icon';

export const StatCard = ({ label, value, unit, icon, children }) => (
  <div className="bg-(--bg-tertiary) border border-(--border-light) rounded-[20px] p-5 flex flex-col h-full group hover:border-(--accent)/20 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-(--text-muted) mb-1">{label}</p>
        <h3 className="text-[22px] font-bold text-(--text-primary) tracking-tight">
          {value}
          {unit && <span className="text-[12px] font-normal text-(--text-muted) ml-1">{unit}</span>}
        </h3>
      </div>
      <div className="w-9 h-9 rounded-xl bg-(--accent)/10 flex items-center justify-center group-hover:bg-(--accent)/20 transition-colors">
        <Icon name={icon} className="text-(--accent) text-[18px]" />
      </div>
    </div>
    {children}
  </div>
);

export const CaloriesCard = ({ value = 0 }) => (
  <StatCard
    label="Daily Burn"
    value={Number(value || 0).toLocaleString()}
    unit="kcal"
    icon="local_fire_department"
  >
    <div className="flex items-end gap-1 h-12">
      {[40, 60, 45, 80, 70, 100].map((h, i) => (
        <div key={i} className="flex-1 rounded-sm bg-(--orange)" style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.2 }} />
      ))}
    </div>
  </StatCard>
);

export const LoadCard = ({ minutes = 0 }) => {
  const safeMinutes = Number(minutes) || 0;
  const goal        = 120;
  const hours       = Math.floor(safeMinutes / 60);
  const remainingMins = safeMinutes % 60;
  const percentage  = Math.min((safeMinutes / goal) * 100, 100);

  return (
    <StatCard label="Session Load" value={`${hours}h ${remainingMins}m`} icon="timer">
      <div className="flex justify-between text-[10px] font-bold mb-1.5">
        <span className="text-(--text-muted) uppercase">Goal: 2h</span>
        <span className="text-(--accent)">{Math.round(percentage)}%</span>
      </div>
      <div className="bg-(--bg-hover) h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-(--accent) h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </StatCard>
  );
};

export const ActivityCard = ({ steps = 0 }) => (
  <StatCard label="Activity Count" value={Number(steps || 0).toLocaleString()} icon="footprint">
    <div className="flex items-baseline gap-2">
      <span className="text-(--accent) text-[13px] font-bold">+12%</span>
      <span className="text-(--text-muted) text-[10px] uppercase">vs yesterday</span>
    </div>
  </StatCard>
);