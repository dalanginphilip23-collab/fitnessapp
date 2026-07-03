const Hero = ({ name, goal, avatar }) => {
  const FALLBACK_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23222'/%3E%3Ccircle cx='32' cy='24' r='10' fill='%23555'/%3E%3Cellipse cx='32' cy='52' rx='18' ry='12' fill='%23555'/%3E%3C/svg%3E`;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-6 bg-[var(--bg-tertiary)] rounded-[14px] border border-[var(--border-light)]">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={avatar || FALLBACK_SVG}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_SVG;
            }}
            className="w-16 h-16 rounded-full border-2 border-[var(--accent)] object-cover"
            alt="Profile"
          />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Welcome back, {name || 'Athlete'}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Goal: {goal || 'Unspecified'}</p>
        </div>
      </div>
      
      {/* Optional: Add a biometrics badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)]">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">
          BIOMETRICS
        </span>
      </div>
    </div>
  );
};

export default Hero;