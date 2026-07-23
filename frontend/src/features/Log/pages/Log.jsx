import React, { useState, useEffect, useMemo } from "react";
import SidebarAnalytics from "../../../components/SidebarAnalytics";
import Icon from "../../../components/Icon";
import { API_BASE_URL } from "../../../config/port";
import { AnalyticsMobileNav } from "../../../components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const todayKey = () => toDateKey(new Date());

const formatDuration = (start, end) => {
  if (!end) return 'Incomplete';
  const totalSecs = Math.round((new Date(end) - new Date(start)) / 1000);
  if (totalSecs < 60) return `${totalSecs}s`;
  const mins = Math.round(totalSecs / 60);
  return `${mins} min${mins !== 1 ? 's' : ''}`;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ activeDays, selectedKey, onSelect }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-7 h-7 rounded-full bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] flex items-center justify-center transition-colors"
        >
          <Icon name="chevron_left" className="text-[var(--text-muted)] text-base" />
        </button>
        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-full bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] flex items-center justify-center transition-colors"
        >
          <Icon name="chevron_right" className="text-[var(--text-muted)] text-base" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const key      = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday  = key === todayKey();
          const hasLogs  = activeDays.has(key);
          const selected = key === selectedKey;

          return (
            <button
              key={key}
              onClick={() => onSelect(selected ? null : key)}
              className={`relative mx-auto w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all
                ${selected
                  ? 'bg-[var(--accent)] text-black shadow-[0_0_12px_rgba(209,253,82,0.4)]'
                  : isToday
                    ? 'border border-[var(--accent-border)] text-[var(--accent)]'
                    : hasLogs
                      ? 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                      : 'text-[var(--text-disabled)] cursor-default'
                }`}
              disabled={!hasLogs && !selected}
            >
              {day}
              {hasLogs && !selected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border-light)]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Has logs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-[var(--accent-border)]" />
          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Today</span>
        </div>
      </div>
    </div>
  );
}

// ─── Session Card (mobile) ────────────────────────────────────────────────────
function SessionCard({ session }) {
  return (
    <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[var(--text-muted)]">
          #VTL-{session.id.toString().padStart(4, '0')}
        </span>
        <span className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            session.status === 'completed'
              ? 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]'
              : 'bg-red-400'
          }`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            session.status === 'completed' ? 'text-[var(--accent)]' : 'text-red-400'
          }`}>
            {session.status ?? 'unknown'}
          </span>
        </span>
      </div>

      <div>
        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-0.5">Exercise</span>
        <span className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)]">
          {session.workout_type ?? '–'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-light)]">
        <div>
          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-0.5">Reps</span>
          <span className="text-lg font-black italic text-[var(--accent)] tracking-tighter leading-none">
            {session.rep_count ?? 0}
          </span>
        </div>
        <div>
          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-0.5">Time</span>
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div>
          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-0.5">Duration</span>
          <span className="text-xs font-black text-[var(--text-primary)] uppercase">
            {formatDuration(session.start_time, session.end_time)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const Log = () => {
  const [history,     setHistory]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [selectedDay, setSelectedDay] = useState(todayKey());
  const navigate = useNavigate();
  const { user }  = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/workout-logs`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setHistory(Array.isArray(data.logs) ? data.logs : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user?.id]);

  const activeDays = useMemo(() => {
    const s = new Set();
    history.forEach(h => s.add(toDateKey(h.start_time)));
    return s;
  }, [history]);

  const filtered = useMemo(() => {
    if (!selectedDay) return history;
    return history.filter(h => toDateKey(h.start_time) === selectedDay);
  }, [history, selectedDay]);

  const dayStats = useMemo(() => ({
    sessions:  filtered.length,
    totalReps: filtered.reduce((sum, s) => sum + (s.rep_count ?? 0), 0),
    completed: filtered.filter(s => s.status === 'completed').length,
  }), [filtered]);

  const selectedLabel = selectedDay
    ? selectedDay === todayKey()
      ? 'Today'
      : new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })
    : 'All Time';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-['Inter'] flex flex-col md:flex-row">
      <SidebarAnalytics />

      <div className="flex-1 flex flex-col md:ml-20 transition-all duration-500 overflow-hidden">

        <header className="p-4 sm:p-5 md:p-8 border-b border-[var(--border-light)] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text-primary)] leading-none">
              Session <span className="text-[var(--accent)]">History</span>
            </h1>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mt-2 md:mt-3">
              Neural Tracking & Performance Archives
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest block">
              {selectedLabel}
            </span>
            <span className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
              {filtered.length.toString().padStart(2, '0')} sessions
            </span>
          </div>
        </header>

        <main className="p-4 md:p-8 flex flex-col lg:flex-row gap-4 md:gap-6 pb-24 md:pb-8">

          <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 flex flex-col gap-4">

            <MiniCalendar
              activeDays={activeDays}
              selectedKey={selectedDay}
              onSelect={setSelectedDay}
            />

            {selectedDay && (
              <>
                <div className="flex gap-2 lg:hidden">
                  {[
                    { label: 'Sessions',  val: dayStats.sessions  },
                    { label: 'Reps',      val: dayStats.totalReps },
                    { label: 'Done',      val: dayStats.completed  },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-xl p-3 text-center">
                      <span className="text-[var(--accent)] text-xl font-black italic block leading-none">{val}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1 block">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="hidden lg:block bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-3xl p-6 space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                    Day Summary
                  </p>
                  {[
                    { label: 'Sessions',  val: dayStats.sessions  },
                    { label: 'Total Reps', val: dayStats.totalReps },
                    { label: 'Completed', val: dayStats.completed  },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
                      <span className="text-base font-black italic text-[var(--accent)] tracking-tighter">{val}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedDay && (
              <button
                onClick={() => setSelectedDay(null)}
                className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-center"
              >
                ↺ Show all time
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">

            <div className="flex flex-col gap-3 lg:hidden">
              {loading ? (
                <div className="p-16 text-center animate-pulse text-[var(--accent)] font-black uppercase tracking-widest text-sm">
                  Accessing Archives…
                </div>
              ) : error ? (
                <div className="p-16 text-center text-red-400 font-bold uppercase tracking-widest text-sm">
                  ⚠ {error}
                  <span className="block text-[var(--text-muted)] text-xs mt-2">Is your backend running?</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="text-3xl mb-3">🏋️</div>
                  <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-sm">
                    No sessions on {selectedLabel}
                  </p>
                  <p className="text-[var(--text-disabled)] text-xs mt-1">Pick another day or complete a workout</p>
                </div>
              ) : (
                filtered.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
              )}
            </div>

            <div className="hidden lg:block bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-3xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[var(--border-light)] bg-[var(--bg-tertiary)]">
                      {['Ref ID', 'Exercise', 'Reps', 'Status', 'Time', 'Duration'].map(h => (
                        <th key={h} className="px-7 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="p-20 text-center animate-pulse text-[var(--accent)] font-black uppercase tracking-widest">
                          Accessing Archives…
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="6" className="p-20 text-center text-red-400 font-bold uppercase tracking-widest">
                          ⚠ {error}
                          <span className="block text-[var(--text-muted)] text-xs mt-2">Is your backend running?</span>
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-16 text-center">
                          <div className="text-3xl mb-3">🏋️</div>
                          <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-sm">
                            No sessions on {selectedLabel}
                          </p>
                          <p className="text-[var(--text-disabled)] text-xs mt-1">Pick another day or complete a workout</p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((session) => (
                        <tr key={session.id} className="hover:bg-[var(--bg-hover)] transition-all group">
                          <td className="px-7 py-6 font-mono text-xs text-[var(--text-muted)]">
                            #VTL-{session.id.toString().padStart(4, '0')}
                          </td>
                          <td className="px-7 py-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                              {session.workout_type ?? '–'}
                            </span>
                          </td>
                          <td className="px-7 py-6">
                            <span className="text-lg font-black italic text-[var(--accent)] tracking-tighter">
                              {session.rep_count ?? 0}
                            </span>
                            <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase ml-1">reps</span>
                          </td>
                          <td className="px-7 py-6">
                            <span className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                session.status === 'completed'
                                  ? 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]'
                                  : 'bg-red-400'
                              }`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                session.status === 'completed' ? 'text-[var(--accent)]' : 'text-red-400'
                              }`}>
                                {session.status ?? 'unknown'}
                              </span>
                            </span>
                          </td>
                          <td className="px-7 py-6 text-sm font-medium text-[var(--text-secondary)]">
                            {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-7 py-6 font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase text-sm">
                            {formatDuration(session.start_time, session.end_time)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>

      <AnalyticsMobileNav navigate={navigate} />
    </div>
  );
};

export default Log;