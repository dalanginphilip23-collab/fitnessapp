import { Icon } from "../../../components";
export default function CameraOffPlaceholder({ cameraOn, onTurnOn }) {
  if (cameraOn) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[var(--bg-card)]">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-light)] flex items-center justify-center">
        <Icon name="videocam_off" className="text-3xl text-[var(--text-muted)]" />
      </div>
      <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-bold">Camera Off</p>
      <button
        onClick={onTurnOn}
        className="mt-2 px-6 py-2.5 rounded-full bg-[var(--accent)] text-[var(--text-inverse)] text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
      >
        Turn On
      </button>
    </div>
  );
}
