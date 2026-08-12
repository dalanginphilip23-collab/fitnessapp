import { Icon } from "../../../components";
import { WORKOUT_OPTIONS } from "../constants/workout";
import CameraToggleButton from "./cameraToggleButton";
import StartStopButton from "./startStopButton";
import VoiceToggleButton from './voiceToggleButton';

export default function SessionHeader({ workoutType, isRecording, cameraOn, voiceEnabled, onStartStop, onCameraToggle, onVoiceToggle }) {
  const current = WORKOUT_OPTIONS.find(o => o.id === workoutType);

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-b border-[var(--border-light)] min-h-[64px] md:h-[72px] flex items-center justify-between px-3 sm:px-6 gap-3 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
          isRecording
            ? 'bg-[var(--accent-bg)] border-[var(--accent-border)]'
            : 'bg-[var(--bg-hover)] border-[var(--border-light)]'
        }`}>
          <Icon
            name={current?.icon ?? 'fitness_center'}
            className={`text-lg ${isRecording ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}
          />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[var(--text-muted)] block leading-none mb-1">
            Mode
          </span>
          <span className="text-sm sm:text-base font-black text-[var(--text-primary)] truncate block leading-none">
            {current?.label ?? workoutType}
          </span>
        </div>
        {isRecording && (
          <span className="hidden sm:flex items-center gap-1.5 ml-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Live</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <VoiceToggleButton voiceEnabled={voiceEnabled} onToggle={onVoiceToggle} />
        <CameraToggleButton cameraOn={cameraOn} onToggle={onCameraToggle} />
        <StartStopButton isRecording={isRecording} cameraOn={cameraOn} onPress={onStartStop} />
      </div>
    </header>
  );
}
