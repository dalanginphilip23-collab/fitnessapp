import BiometricBar from "./BioMetricBar";
import { Icon } from "../../../components";

export default function BiometricsCard({ biometrics }) {
  const metrics = [
    { label: 'Body Alignment', val: biometrics.alignment, color: '#D1FD52' },
    { label: 'Rep Speed',      val: biometrics.velocity,  color: '#5BC8FF' },
    { label: 'Symmetry Index', val: biometrics.symmetry,  color: '#FF7A5C' },
  ];
  return (
    <div className="bg-[var(--bg-card)] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-light)]">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h4 className="text-[var(--text-primary)] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
          <Icon name="monitor_heart" className="text-[var(--accent)] text-sm" />
          Live Biometrics
        </h4>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-[8px] font-black text-[var(--accent)] uppercase tracking-widest">Live</span>
        </span>
      </div>
      <div className="space-y-5">
        {metrics.map((m) => (
          <BiometricBar key={m.label} label={m.label} val={m.val} color={m.color} />
        ))}
      </div>
    </div>
  );
}
