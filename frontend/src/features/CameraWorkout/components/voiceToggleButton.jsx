import { Icon } from "../../../components";
export default function VoiceToggleButton({ voiceEnabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all touch-manipulation ${
        voiceEnabled
          ? 'bg-(--bg-active) border-(--border-medium) text-(--text-primary)'
          : 'bg-(--bg-hover) border-(--border-light) text-(--text-muted)'
      }`}
    >
      <Icon name={voiceEnabled ? 'volume_up' : 'volume_off'} className="text-sm" />
    </button>
  );
}