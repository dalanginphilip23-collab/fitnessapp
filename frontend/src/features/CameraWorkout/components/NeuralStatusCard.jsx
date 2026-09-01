import { Icon } from "../../../components";

export default function NeuralStatusCard({ poseReady, loadError }) {
  const statusLabel = loadError ? "Error" : poseReady ? "Optimal" : "Loading";
  const statusColor = loadError
    ? "text-red-400"
    : poseReady
      ? "text-[var(--accent)]"
      : "text-yellow-400";

  return (
    <div className="bg-[var(--bg-card)] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-light)]">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h4 className="text-[var(--text-primary)] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
          <Icon name="psychology" className="text-[var(--accent)] text-sm" />
          Neural Status
        </h4>
        <span className="px-2.5 py-1 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[8px] font-black text-[var(--accent)] uppercase tracking-widest">
          Monitoring
        </span>
      </div>

      <p className="text-[11px] sm:text-[12px] text-[var(--text-secondary)] leading-relaxed mb-4">
        Monitoring 33 skeletal keypoints at 7 FPS for orthopedic safety. Voice
        cues announce position, coach tips, and every 5th rep milestone.
      </p>

      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)]">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Status
        </span>
        <span className={`text-[11px] sm:text-[12px] font-black uppercase tracking-widest flex items-center gap-1.5 ${statusColor}`}>
          <Icon name="check_circle" className="text-sm" />
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
