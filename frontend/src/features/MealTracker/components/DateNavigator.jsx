import { useState, useRef, useEffect } from "react";
import Icon from "../../../components/ui/Icon";
import { MONTH_NAMES, DOW_LABELS } from "../constants";

export default function DateNavigator({ currentDate, onDateChange }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth,  setCalendarMonth]  = useState(() => {
    const d = new Date(currentDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const calendarRef  = useRef(null);
  const prevDateRef  = useRef(currentDate);

  useEffect(() => {
    if (currentDate === prevDateRef.current) return;
    prevDateRef.current = currentDate;
    const d = new Date(currentDate);
    queueMicrotask(() => {
      setCalendarMonth({ year: d.getFullYear(), month: d.getMonth() });
    });
  }, [currentDate]);

  useEffect(() => {
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target))
        setIsCalendarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const today   = new Date().toISOString().split("T")[0];
  const isToday = currentDate === today;

  const parseDate = (s) => {
    const [y, m, d] = s.split("-");
    return new Date(+y, +m - 1, +d);
  };

  const shiftDay = (delta) => {
    const d = parseDate(currentDate);
    d.setDate(d.getDate() + delta);
    const next = d.toISOString().split("T")[0];
    if (next <= today) onDateChange(next);
  };

  const goToToday = () => { onDateChange(today); setIsCalendarOpen(false); };

  const shiftMonth = (delta) => {
    setCalendarMonth(({ year, month }) => {
      let m = month + delta;
      let y = year;
      if (m < 0)  { m = 11; y--; }
      if (m > 11) { m = 0;  y++; }
      return { year: y, month: m };
    });
  };

  const buildCalendarDays = () => {
    const { year, month } = calendarMonth;
    const firstDow    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells  = Math.ceil((firstDow + daysInMonth) / 7) * 7;
    return Array.from({ length: totalCells }, (_, i) => {
      const dayNum  = i - firstDow + 1;
      const date    = new Date(year, month, dayNum);
      const dateStr = date.toISOString().split("T")[0];
      return {
        dateStr,
        dayNum:         date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isSelected:     dateStr === currentDate,
        isDayToday:     dateStr === today,
        isFuture:       dateStr > today,
      };
    });
  };

  // Screenshot-style label: "Today" (or weekday) on top, full date below.
  const topLabel = isToday
    ? "Today"
    : parseDate(currentDate).toLocaleDateString("en-US", { weekday: "short" });

  const subLabel = parseDate(currentDate).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  parseDate(currentDate).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });

  const now = new Date();
  const atCurrentMonth =
    calendarMonth.year  === now.getFullYear() &&
    calendarMonth.month === now.getMonth();

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-(--bg-card) rounded-2xl p-1 border border-(--border-light) shadow-sm">
      <button onClick={() => shiftDay(-1)} className="p-1.5 sm:p-2 rounded-xl hover:bg-(--bg-hover) transition-colors" aria-label="Previous day">
        <Icon name="chevron_left" className="text-(--text-muted) text-sm" />
      </button>

      <div className="relative" ref={calendarRef}>
        <button
          onClick={() => setIsCalendarOpen((v) => !v)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl hover:bg-(--bg-hover) transition-colors"
        >
          <Icon name="calendar_today" className="text-(--text-muted) text-sm" />
          <span className="text-left leading-tight">
            <span className="block text-[12px] sm:text-[13px] font-bold text-(--text-primary)">{topLabel}</span>
            <span className="block text-[9px] sm:text-[10px] text-(--text-muted)">{subLabel}</span>
          </span>
        </button>

        {isCalendarOpen && (
          <div className="absolute top-full mt-2 right-0 z-50 bg-(--bg-secondary) border border-(--border-medium) rounded-2xl shadow-(--shadow-lg) p-4 w-70 sm:w-75">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => shiftMonth(-1)} className="p-1.5 rounded-xl hover:bg-(--bg-hover) transition-colors" aria-label="Previous month">
                <Icon name="chevron_left" className="text-(--text-muted) text-sm" />
              </button>
              <span className="text-(--text-primary) text-sm font-semibold">
                {MONTH_NAMES[calendarMonth.month]} {calendarMonth.year}
              </span>
              <button
                onClick={() => shiftMonth(1)}
                disabled={atCurrentMonth}
                className="p-1.5 rounded-xl hover:bg-(--bg-hover) transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next month"
              >
                <Icon name="chevron_right" className="text-(--text-muted) text-sm" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {DOW_LABELS.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-(--text-muted) py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {buildCalendarDays().map(({ dateStr, dayNum, isCurrentMonth, isSelected, isDayToday, isFuture }) => (
                <button
                  key={dateStr}
                  disabled={isFuture}
                  onClick={() => { onDateChange(dateStr); setIsCalendarOpen(false); }}
                  className={[
                    "aspect-square rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center justify-center",
                    "disabled:opacity-25 disabled:cursor-not-allowed",
                    !isCurrentMonth ? "opacity-30" : "",
                    isSelected
                      ? "bg-(--accent) text-[#131313] font-bold"
                      : isDayToday
                        ? "border border-(--accent) text-(--accent)"
                        : "hover:bg-(--bg-hover) text-(--text-primary)",
                  ].join(" ")}
                >
                  {dayNum}
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-(--border-light) flex justify-between gap-2">
              <button
                onClick={() => setCalendarMonth({ year: now.getFullYear(), month: now.getMonth() })}
                className="flex-1 py-2 rounded-xl text-xs font-medium bg-(--bg-hover) hover:bg-(--bg-active) text-(--text-secondary) transition-colors"
              >
                Current Month
              </button>
              <button onClick={goToToday} className="flex-1 py-2 rounded-xl text-xs font-bold bg-(--accent-bg) text-(--accent) transition-colors">
                Today
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => shiftDay(1)}
        disabled={isToday}
        className={`p-1.5 sm:p-2 rounded-xl transition-colors ${isToday ? "opacity-30 cursor-not-allowed" : "hover:bg-(--bg-hover)"}`}
        aria-label="Next day"
      >
        <Icon name="chevron_right" className="text-(--text-muted) text-sm" />
      </button>
    </div>
  );
}