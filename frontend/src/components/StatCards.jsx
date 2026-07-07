import Icon from './Icon';

// ─── Shell ────────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, unit, icon, children }) => (
  <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[14px] p-[22px] flex flex-col h-full">
    <div className="flex justify-between items-start mb-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-1">{label}</p>
        <h3 className="font-['Manrope'] text-[22px] font-bold text-[var(--text-primary)]">
          {value}
          {unit && <span className="text-[12px] font-normal text-[var(--text-muted)] ml-1">{unit}</span>}
        </h3>
      </div>
      <Icon name={icon} className="text-[var(--accent)]/35 text-[22px]" />
    </div>
    {children}
  </div>
);

// ─── Calories ─────────────────────────────────────────────────────────────────
export const CaloriesCard = ({ value = 0 }) => (
  <StatCard
    label="Daily Burn"
    value={Number(value || 0).toLocaleString()}
    unit="kcal"
    icon="local_fire_department"
  >
    <div className="flex items-end gap-1 h-12">
      {[40, 60, 45, 80, 70, 100].map((h, i) => (
        <div key={i} className="flex-1 rounded-sm bg-[var(--accent)]" style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.3 }} />
      ))}
    </div>
  </StatCard>
);

// ─── Session Load ─────────────────────────────────────────────────────────────
export const LoadCard = ({ minutes = 0 }) => {
  const safeMinutes = Number(minutes) || 0;
  const goal        = 120;
  const hours       = Math.floor(safeMinutes / 60);
  const remainingMins = safeMinutes % 60;
  const percentage  = Math.min((safeMinutes / goal) * 100, 100);

  return (
    <StatCard label="Session Load" value={`${hours}h ${remainingMins}m`} icon="timer">
      <div className="flex justify-between text-[10px] font-bold mb-1.5">
        <span className="text-[var(--text-muted)] uppercase">Goal: 2h 00m</span>
        <span className="text-[var(--accent)]">{Math.round(percentage)}%</span>
      </div>
      <div className="bg-[var(--bg-hover)] h-1 rounded-full overflow-hidden w-full">
        <div
          className="bg-[var(--accent)] h-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </StatCard>
  );
};

// ─── Activity Count ───────────────────────────────────────────────────────────
export const ActivityCard = ({ steps = 0 }) => (
  <StatCard label="Activity Count" value={Number(steps || 0).toLocaleString()} icon="footprint">
    <div className="flex items-baseline gap-2">
      <span className="text-[var(--accent)] text-[13px] font-bold">+12%</span>
      <span className="text-[var(--text-muted)] text-[10px] uppercase">vs yesterday</span>
    </div>
  </StatCard>
);