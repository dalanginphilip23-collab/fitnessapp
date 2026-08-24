import { Icon } from "../../../components";
export default function CameraToggleButton({ cameraOn, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={cameraOn ? 'Turn camera off' : 'Turn camera on'}
      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-95 touch-manipulation ${
        cameraOn
          ? 'bg-[#EFEFEF] border-black/10 text-black'
          : 'bg-[#F3F3F3] border-black/5 text-black/40'
      }`}
    >
      <Icon name={cameraOn ? 'videocam' : 'videocam_off'} className="text-[16px]" />
    </button>
  );
}
