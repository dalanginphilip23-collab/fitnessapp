import { Icon } from "../../../components";
export default function VoiceToggleButton({ voiceEnabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all active:scale-95 touch-manipulation ${
        voiceEnabled
          ? 'bg-[var(--bg-hover)] border-[var(--border-medium)] text-[var(--text-primary)]'
          : 'bg-[var(--bg-tertiary)] border-[var(--border-light)] text-[var(--text-muted)]'
      }`}
    >
      <Icon name={voiceEnabled ? 'volume_up' : 'volume_off'} className="text-base" />
    </button>
  );
}
