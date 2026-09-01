export default function SessionLogRow({ log }) {
  return (
    <div className="flex items-center justify-between text-[10px] px-2 py-2.5 rounded-lg border-b border-[var(--border-light)] last:border-0">
      <span className="font-bold text-[var(--text-secondary)] uppercase tracking-widest truncate mr-2">
        {log.exercise}
      </span>
      <span className="text-[var(--accent)] font-black flex-shrink-0">{log.reps} reps</span>
      <span className="text-[var(--text-muted)] flex-shrink-0 ml-2">{log.time}</span>
    </div>
  );
}
