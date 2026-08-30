export function SkeletonCard({ className = '', style }) {
  return (
    <div className={`bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[20px] p-6 shimmer ${className}`} style={style}>
      <div className="h-6 w-1/4 rounded bg-[var(--bg-hover)] mb-4" />
      <div className="h-8 w-1/2 rounded bg-[var(--bg-hover)] mb-2" />
      <div className="h-4 w-3/4 rounded bg-[var(--bg-hover)]" />
    </div>
  );
}

export function SkeletonHero({ className = '' }) {
  return (
    <div className={`bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[20px] p-6 shimmer ${className}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-[var(--bg-hover)]" />
        <div className="flex-1">
          <div className="h-6 w-1/3 rounded bg-[var(--bg-hover)] mb-2" />
          <div className="h-4 w-1/4 rounded bg-[var(--bg-hover)]" />
        </div>
        <div className="w-20 h-10 rounded-lg bg-[var(--bg-hover)]" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-[var(--bg-hover)] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonRing({ className = '' }) {
  return (
    <div className={`bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[20px] p-4 shimmer ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[var(--bg-hover)]" />
        <div className="h-4 w-20 rounded bg-[var(--bg-hover)]" />
      </div>
      <div className="w-52 h-52 mx-auto rounded-full bg-[var(--bg-hover)]" />
      <div className="flex justify-between mt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-8 h-16 bg-[var(--bg-hover)] rounded" />
            <div className="h-3 w-16 bg-[var(--bg-hover)] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonMetric({ className = '' }) {
  return (
    <div className={`bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[20px] p-4 shimmer ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-[var(--bg-hover)]" />
        <div className="h-4 w-24 rounded bg-[var(--bg-hover)]" />
      </div>
      <div className="h-10 w-1/2 rounded bg-[var(--bg-hover)] mb-1" />
      <div className="h-4 w-1/3 rounded bg-[var(--bg-hover)]" />
    </div>
  );
}

export function SkeletonSleepGraph({ className = '' }) {
  return (
    <div className={`bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[20px] p-6 min-h-[410px] shimmer ${className}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-[var(--bg-hover)]" />
        <div>
          <div className="h-5 w-32 rounded bg-[var(--bg-hover)] mb-1" />
          <div className="h-3 w-48 rounded bg-[var(--bg-hover)]" />
        </div>
      </div>
      <div className="h-24 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-2xl mb-4" />
      <div className="flex gap-2 mb-5 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-xl bg-[var(--bg-hover)]" />
        ))}
      </div>
      <div className="h-36 bg-[var(--bg-hover)] rounded" />
      <div className="flex justify-between mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-3 w-20 bg-[var(--bg-hover)] rounded" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonClinicalAssistant({ className = '' }) {
  return (
    <div className={`h-full min-h-[400px] bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[20px] p-[22px] flex flex-col shimmer ${className}`}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)]" />
        <div className="h-5 w-40 rounded bg-[var(--bg-hover)]" />
      </div>
      <div className="mb-5">
        <div className="h-3 w-24 rounded bg-[var(--bg-hover)] mb-2" />
        <div className="h-1.5 w-full bg-[var(--bg-hover)] rounded-full" />
      </div>
      <div className="mb-4">
        <div className="h-10 w-full bg-[var(--bg-hover)] rounded-lg" />
      </div>
      <div className="mb-3">
        <div className="h-3 w-32 rounded bg-[var(--bg-hover)]" />
      </div>
      <div className="flex-1 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-[var(--bg-hover)] rounded-xl border-l-[3px] border-[var(--border-light)]" />
        ))}
      </div>
    </div>
  );
}