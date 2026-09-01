import { Icon } from "../../../components";

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function SessionOverviewCard({ repCount, elapsedSecs }) {
  const stats = [
    { label: "Total Reps",   value: String(repCount).padStart(2, "0"), icon: "fitness_center" },
    { label: "Workout Time", value: formatTime(elapsedSecs),           icon: "schedule" },
  ];

  return (
    <div className="bg-[var(--bg-card)] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-light)]">
      <h4 className="text-[var(--text-primary)] font-black text-[10px] mb-4 sm:mb-5 uppercase tracking-[0.2em]">
        Session Overview
      </h4>
      <div className="space-y-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)]"
          >
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              {s.label}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-[var(--accent)] tabular-nums leading-none">
                {s.value}
              </span>
              <Icon name={s.icon} className="text-[var(--accent)] text-sm opacity-70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
