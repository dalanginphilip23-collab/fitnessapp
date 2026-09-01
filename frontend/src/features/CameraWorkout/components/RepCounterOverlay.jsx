export default function RepCounterOverlay({ repCount }) {
  return (
    <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20">
      <div className="text-right bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 border border-white/10">
        <span className="text-[8px] sm:text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.25em] block mb-0.5">
          Total Reps
        </span>
        <span className="text-4xl sm:text-6xl md:text-7xl font-black text-[var(--accent)] tracking-tighter leading-none drop-shadow-[0_0_20px_rgba(209,253,82,0.35)]">
          {repCount.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
