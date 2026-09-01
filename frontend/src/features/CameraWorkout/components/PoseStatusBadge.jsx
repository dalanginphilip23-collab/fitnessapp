export default function PoseStatusBadge({ poseReady, loadError }) {
  const label = loadError ? 'Load Failed' : poseReady ? 'Pose AI' : 'Loading…';
  const style = loadError
    ? 'bg-red-500/10 border-red-500/30 text-red-400'
    : poseReady
      ? 'bg-[var(--accent)]/10 border-[var(--accent-border)] text-[var(--accent)]'
      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
  const dotStyle = loadError ? 'bg-red-400' : poseReady ? 'bg-[var(--accent)] animate-pulse' : 'bg-yellow-400';
  return (
    <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20">
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest backdrop-blur-md ${style}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
        {label}
      </div>
    </div>
  );
}
