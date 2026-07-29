import Icon from './Icon';

// ─── Shell ────────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, unit, icon, children, iconColor }) => (
  <div className="fx-card p-[22px] flex flex-col h-full">
    <div className="flex justify-between items-start mb-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-1">{label}</p>
        <h3 className="stat-digital text-[22px] font-bold text-[var(--text-primary)]">
          {value}
          {unit && <span className="text-[12px] font-normal text-[var(--text-muted)] ml-1">{unit}</span>}
        </h3>
      </div>
      <Icon name={icon} className={`text-[22px]`} style={{ color: iconColor || 'var(--accent)' }} />
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
    iconColor="var(--metric-calories)"
  >
    <div className="flex items-end gap-1 h-12">
      {[40, 60, 45, 80, 70, 100].map((h, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 5 ? 'var(--accent)' : 'var(--border-light)' }} />
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
    <StatCard label="Session Load" value={`${hours}h ${remainingMins}m`} icon="timer" iconColor="var(--metric-load)">
      <div className="flex justify-between text-[10px] font-bold mb-1.5">
        <span className="text-[var(--text-muted)] uppercase">Goal: 2h 00m</span>
        <span className="text-[var(--accent)]">{Math.round(percentage)}%</span>
      </div>
      <div className="bg-[var(--bg-hover)] h-1.5 rounded-full overflow-hidden w-full">
        <div
          className="bg-gradient-to-r from-[var(--accent-warm)] to-[var(--accent)] h-full rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </StatCard>
  );
};

// ─── Activity Count ───────────────────────────────────────────────────────────
export const ActivityCard = ({ steps = 0 }) => (
  <StatCard label="Activity Count" value={Number(steps || 0).toLocaleString()} icon="footprint" iconColor="var(--metric-steps)">
    <div className="flex items-baseline gap-2">
      <span className="text-(--accent) text-[13px] font-bold">+12%</span>
      <span className="text-[var(--text-muted)] text-[10px] uppercase">vs yesterday</span>
    </div>
  </StatCard>
);