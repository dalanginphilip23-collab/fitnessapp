import { Icon } from "../../../components";
export default function NeuralStatusCard() {
  return (
    <div className="p-5 sm:p-8 rounded-2xl sm:rounded-[3rem] bg-[var(--accent-bg)] border border-[var(--accent-border)]">
      <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
        <Icon name="psychology" className="text-sm" />
        Neural Status
      </span>
      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
        The system is monitoring 33 skeletal keypoints at 7 FPS to ensure maximum orthopedic safety.
        Voice cues announce your position, coach tips, and every 5th rep milestone.
      </p>
    </div>
  );
}