import { Icon } from "../../../components";
import SessionLogRow from "./SessionLogRow";

export default function SessionLog({ logs }) {
  if (logs.length === 0) return null;
  return (
    <div className="bg-[var(--bg-card)] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-light)]">
      <h4 className="text-[var(--text-primary)] font-black text-[10px] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
        <Icon name="history" className="text-[var(--accent)] text-sm" />
        Session Log
      </h4>
      <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
        {logs.slice().reverse().map((log, i) => (
          <SessionLogRow key={i} log={log} />
        ))}
      </div>
    </div>
  );
}
