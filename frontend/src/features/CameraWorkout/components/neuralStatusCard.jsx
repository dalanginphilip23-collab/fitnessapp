import { Icon } from "../../../components";

export default function NeuralStatusCard() {
  return (
    <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[var(--accent-bg)] border border-[var(--accent-border)]">
      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent-border)] flex items-center justify-center">
        <Icon
          name="psychology"
          className="text-[var(--accent)] text-base sm:text-lg"
        />
      </div>

      <div className="min-w-0">
        <span className="text-[9px] sm:text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em] block mb-1.5 sm:mb-2">
          Neural Status
        </span>
        <p className="text-[11px] sm:text-[12px] text-[var(--text-secondary)] leading-relaxed">
          Monitoring 33 skeletal keypoints at 7 FPS for orthopedic safety. Voice
          cues announce position, coach tips, and every 5th rep milestone.
        </p>
      </div>
    </div>
  );
}
