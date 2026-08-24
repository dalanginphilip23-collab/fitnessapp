const WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getWeekDays() {
  const today = new Date();
  // Show Tue-Mon around Fri like image: center today, 3 before 3 after
  const out = [];
  for (let off = -3; off <= 3; off++) {
    const d = new Date(today);
    d.setDate(today.getDate() + off);
    out.push({
      dow: WEEK[d.getDay()],
      date: d.getDate(),
      active: off === 0,
    });
  }
  return out;
}

export default function DateStrip() {
  const days = getWeekDays();
  return (
    <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
      {days.map((d) => (
        <div
          key={`${d.dow}-${d.date}`}
          className={`flex flex-col items-center justify-center min-w-[42px] h-[56px] rounded-[14px] shrink-0 transition-all ${
            d.active
              ? 'bg-[var(--accent)] text-[#0A1000] shadow-lg shadow-[var(--accent)]/20'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-light)]'
          }`}
        >
          <span className={`text-[10px] font-bold leading-none ${d.active ? 'text-[#0A1000]/70' : 'text-[var(--text-muted)]'}`}>{d.dow}</span>
          <span className={`text-[13px] font-black leading-none mt-1 ${d.active ? 'text-[#0A1000]' : 'text-[var(--text-primary)]'}`}>{d.date}</span>
        </div>
      ))}
    </div>
  );
}
