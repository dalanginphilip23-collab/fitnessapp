import { Icon } from "../../../components";
export default function VoiceToggleButton({ voiceEnabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-95 touch-manipulation ${
        voiceEnabled
          ? 'bg-[#EFEFEF] border-black/10 text-black'
          : 'bg-[#F3F3F3] border-black/5 text-black/40'
      }`}
    >
      <Icon name={voiceEnabled ? 'volume_up' : 'volume_off'} className="text-[16px]" />
    </button>
  );
}
