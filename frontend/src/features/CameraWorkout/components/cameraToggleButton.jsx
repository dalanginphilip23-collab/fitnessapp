import { Icon } from "../../../components";
export default function CameraToggleButton({ cameraOn, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={cameraOn ? 'Turn camera off' : 'Turn camera on'}
      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all active:scale-95 touch-manipulation ${
        cameraOn
          ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] border-[var(--border-medium)] hover:bg-[var(--surface-hover)]'
          : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-light)]'
      }`}
    >
      <Icon name={cameraOn ? 'videocam' : 'videocam_off'} className="text-base" />
    </button>
  );
}
