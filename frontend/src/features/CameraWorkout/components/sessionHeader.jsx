import { Icon } from "../../../components";
import { WORKOUT_OPTIONS } from "../constants/workout";
import CameraToggleButton from "./cameraToggleButton";
import StartStopButton from "./startStopButton";
import VoiceToggleButton from './voiceToggleButton';

export default function SessionHeader({ workoutType, label, isRecording, cameraOn, voiceEnabled, onStartStop, onCameraToggle, onVoiceToggle }) {
  const current = WORKOUT_OPTIONS.find(o => o.id === workoutType);

  return (
    <header className="sticky top-0 z-40 mx-3 mt-3 bg-white border border-black/5 rounded-2xl shadow-sm min-h-[56px] flex items-center justify-between px-3 py-2 gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[#F3F3F3] border border-black/5 flex items-center justify-center flex-shrink-0">
          <Icon name="exercise" className="text-[16px] text-black/60" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] uppercase font-black tracking-[0.14em] text-black/40 block leading-none">Mode</span>
          <span className="text-[13px] font-black text-black truncate block leading-none mt-0.5">
            {label ?? current?.label ?? workoutType}
          </span>
        </div>
        {isRecording && (
          <span className="hidden sm:flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Live</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <VoiceToggleButton voiceEnabled={voiceEnabled} onToggle={onVoiceToggle} />
        <CameraToggleButton cameraOn={cameraOn} onToggle={onCameraToggle} />
        <button
          onClick={onStartStop}
          disabled={!cameraOn}
          className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.12em] flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
            isRecording ? 'bg-red-500 text-white' : 'bg-[#7AC74F] text-black'
          }`}
        >
          <Icon name={isRecording ? 'stop' : 'play_arrow'} className="text-[14px]" fill={1} />
          {isRecording ? 'STOP' : 'START'}
        </button>
      </div>
    </header>
  );
}
