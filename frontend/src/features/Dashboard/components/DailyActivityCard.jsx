import { useMemo } from 'react';
import Icon from '../../../components/ui/Icon';

export default function DailyActivityCard({ steps = { value: 0, goal: 10000 }, weeklyMap = null, onExpand }) {
  const pct = useMemo(() => Math.min(100, Math.round((Number(steps.value) || 0) / (steps.goal || 10000) * 100)), [steps.value, steps.goal]);
  const size = 52;
  const sw = 5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (pct / 100) * circ;

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const todayIdx = useMemo(() => {
    const js = new Date().getDay();
    return js === 0 ? 6 : js - 1;
  }, []);

  const weekKeys = useMemo(() => {
    const now = new Date();
    const js = now.getDay();
    const monOffset = js === 0 ? -6 : 1 - js;
    const mon = new Date(now);
    mon.setDate(now.getDate() + monOffset);
    mon.setHours(0,0,0,0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return d.toISOString().slice(0,10);
    });
  }, []);

  // Fallback pattern when no weeklyMap (keeps visual similar to old)
  const pattern = [0.62, 0.42, 0.55, 0.58, 0.92, 0.68, 0.74];

  return (
    <div className="bg-[var(--bg-tertiary)] rounded-[20px] p-4 flex flex-col gap-3 border border-[var(--border-light)] shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <span className="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center"><Icon name="footprint" className="text-[14px] text-[var(--accent)]" /></span>
            <span className="text-[12px] font-bold">Step</span>
          </div>
          <div className="text-[var(--text-primary)] font-black text-[22px] leading-none mt-2">{Number(steps.value || 0).toLocaleString()}</div>
          <div className="text-[var(--text-muted)] text-[11px] font-bold">Steps</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-light)" strokeWidth={sw} />
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--accent)" strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[var(--text-primary)] text-[11px] font-black">{pct}%</span>
          </div>
          {onExpand && (
            <button type="button" onClick={onExpand} className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors bg-transparent border-none cursor-pointer">
              <Icon name="chevron_right" className="text-[16px]" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-[64px] pt-2">
        {days.map((day, i) => {
          const isToday = i === todayIdx;
          const key = weekKeys[i];
          const hasWeekly = weeklyMap && typeof weeklyMap[key] !== 'undefined';
          const weekSteps = hasWeekly ? Number(weeklyMap[key]) || 0 : null;
          // Today uses live pct; other days use weeklyMap or fallback pattern
          const p = hasWeekly
            ? (isToday ? pct / 100 : Math.min(1, weekSteps / (steps.goal || 10000)))
            : (isToday ? pct / 100 : pattern[i]);
          // Ensure visible bar even at 0
          const h = isToday && pct === 0 ? 12 : Math.round(Math.max(0.08, Math.min(1, p)) * 52) + 8;
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`w-full max-w-[28px] rounded-full transition-all ${isToday ? 'bg-[var(--accent)]' : 'bg-[var(--border-light)]'}`} style={{ height: h }} title={hasWeekly ? `${weekSteps} steps` : undefined} />
              <span className={`text-[10px] leading-none ${isToday ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)] font-medium'}`}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
