import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config/port";
import { Sidebar, Topbar, MobileNav } from "../../../components";
import { useAuth } from "../../../hooks/useAuth";
import { useNutritionTracker } from "../hooks/useNutritionTracker";

const CALORIE_GOAL   = 2000;
const MACRO_TARGETS  = { protein: 120, carbs: 200, fat: 60 };
const MEAL_TYPES     = ["Breakfast", "Lunch", "Dinner", "Snack"];
const MONTH_NAMES    = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW_LABELS     = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const PLAN_TAG_ICONS = { Strength: "🏋️", Cardio: "🏃", "Fat Loss": "🔥", Flexibility: "🧘", Recovery: "💆", Hypertrophy: "💪" };

// Kept identical to the macro colors already used in ResultCard's MacroBar,
// so a given macro reads as the same color everywhere on this page.
const MACRO_COLORS = {
  protein: { color: "#60a5fa", tint: "#60a5fa14", border: "#60a5fa33", icon: "egg" },
  carbs:   { color: "var(--accent)", tint: "var(--accent-bg)", border: "var(--accent-border)", icon: "grain" },
  fat:     { color: "#f97316", tint: "#f9731614", border: "#f9731633", icon: "water_drop" },
};

const EMOJI_OPTIONS = [
  "🍗","🥩","🥦","🍚","🥗","🍜","🍕","🥙","🌮","🍱",
  "🥣","🍳","🥐","🍞","🧆","🥘","🍲","🫕","🥫","🍎",
  "🍌","🥑","🫙","🧀","🥚","🫐","🍇","🍓","🥝","🍽️",
];

const EMPTY_FORM = {
  name: "", emoji: "🍽️", calories: "",
  protein: "", carbs: "", fat: "",
  mealType: "Breakfast", image_url: "",
};

// ─── Small presentational helpers ──────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Formats an ISO-ish logged_at timestamp into "12:15 PM". Falls back to the
// raw string if it isn't parseable, so we never hide/lose real data.
function formatMealTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Plain inline SVG — used where we can't risk the material-symbols
// icon font failing to load (it collapses to a near-invisible sliver
// instead of the trash icon when that happens).
function TrashIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function Icon({ name, className = "", fill = 0, weight = 300 }) {
  return (
    <span
      className={`material-symbols-outlined leading-none select-none ${className}`}
      style={{ fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24` }}
    >
      {name}
    </span>
  );
}

function MacroBar({ label, value, unit, color, pct }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-(--text-muted)">{label}</span>
        <span className="text-xs font-semibold text-(--text-primary)">{value}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-(--bg-hover) overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

function Toast({ message }) {
  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 bg-(--accent) text-[#131313] text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg z-50 whitespace-nowrap">
      {message}
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <p className="text-[10px] sm:text-xs font-semibold text-(--accent) uppercase tracking-widest mb-3 sm:mb-4">
      {text}
    </p>
  );
}

function Spinner() {
  return (
    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white/80 animate-spin inline-block" />
  );
}

function InputField({ label, type = "text", placeholder, value, onChange, error, className = "" }) {
  const base = `w-full h-10 bg-(--bg-hover) rounded-xl px-3 text-sm text-(--text-primary) border outline-none focus:border-(--accent)/50 transition-colors ${
    error ? "border-red-500/60" : "border-(--border-light)"
  } ${className}`;
  return (
    <div>
      {label && <label className="block text-[11px] text-(--text-muted) mb-1.5">{label}</label>}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} className={base} />
      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}

// Circular calorie-progress ring. Pure presentation — takes the already-
// computed consumed/goal numbers and draws them, nothing more.
function CalorieRing({ consumed, goal, size = 168, strokeWidth = 14 }) {
  const radius        = (size - strokeWidth) / 2;
  const circumference  = 2 * Math.PI * radius;
  const pct            = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const offset          = circumference * (1 - pct);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-hover)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="var(--accent)" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center px-4">
        <div className="w-8 h-8 rounded-full bg-(--accent-bg) flex items-center justify-center mb-1">
          <Icon name="local_fire_department" className="text-(--accent) text-base" fill={1} />
        </div>
        <span className="text-2xl sm:text-3xl font-black text-(--text-primary) leading-none">{Math.round(consumed).toLocaleString()}</span>
        <span className="text-[10px] text-(--text-muted) leading-tight">kcal consumed</span>
        <span className="text-[11px] font-bold text-(--accent) mt-0.5">{Math.round(pct * 100)}% of goal</span>
      </div>
    </div>
  );
}

// One of the three Protein/Carbs/Fat cards in the overview.
function MacroStatCard({ macroKey, label, value, unit = "g" }) {
  const { color, tint, border, icon } = MACRO_COLORS[macroKey];
  const goal = MACRO_TARGETS[macroKey];
  const pct  = goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0;

  return (
    <div className="rounded-2xl p-3 sm:p-4 border" style={{ background: tint, borderColor: border }}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <span style={{ color }}><Icon name={icon} className="text-sm" fill={1} /></span>
        <span className="text-[11px] sm:text-xs font-bold" style={{ color }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-xl sm:text-2xl font-black text-(--text-primary)">{Math.round(value)}</span>
        <span className="text-[11px] text-(--text-muted)">{unit}</span>
      </div>
      <p className="text-[10px] text-(--text-muted) mb-2.5">{pct}% of {goal}{unit}</p>
      <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function DateNavigator({ currentDate, onDateChange }) {
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

function AISuggestion({ meal, onClose, userId }) {
  const navigate = useNavigate();

  const [suggestion, setSuggestion] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [decision,   setDecision]   = useState(null);

  useEffect(() => {
    if (!meal || !userId) return;

    const reset = () => {
      setSuggestion(null);
      setError(null);
      setDecision(null);
      setLoading(true);
    };

    const id = setTimeout(reset, 0);

    fetch(`${API_BASE_URL}/api/food-logs/${userId}/suggest-plan`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({
        food_name: meal.food_name,
        calories:  meal.calories || 0,
        protein:   meal.protein  || 0,
        carbs:     meal.carbs    || 0,
        fat:       meal.fat      || 0,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not get a suggestion");
        setSuggestion(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    return () => clearTimeout(id);
  }, [meal, userId]);

  const handleAcceptPlan = () => {
    if (!suggestion?.recommended_plan) return;
    setDecision("accepted");
    navigate(`/dashboard/plans?planId=${suggestion.recommended_plan.id}`);
  };

  // Lock background scroll while this is open as a modal.
  useEffect(() => {
    if (!meal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [meal]);

  if (!meal) return null;

  let inner;

  if (loading) {
    inner = (
      <div className="bg-linear-to-br from-(--bg-tertiary) to-(--bg-card) rounded-2xl p-4 sm:p-5 border border-(--accent-border)">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-(--accent-bg) flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <SectionLabel text="AI Coach — Burn It Off" />
          </div>
          <div className="w-1.5 h-1.5 bg-(--accent) rounded-full animate-pulse" />
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <Spinner />
            <p className="text-(--text-muted) text-xs">Finding the best workout for this meal…</p>
          </div>
        </div>
      </div>
    );
  } else if (error) {
    inner = (
      <div className="bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border border-(--border-light) relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-(--bg-hover) transition-colors">
          <Icon name="close" className="text-(--text-muted) text-sm" />
        </button>
        <SectionLabel text="AI Coach — Burn It Off" />
        <p className="text-(--text-muted) text-xs">⚠️ {error}</p>
      </div>
    );
  } else if (!suggestion) {
    inner = null;
  } else {
    inner = (
      <div className="bg-linear-to-br from-(--bg-tertiary) to-(--bg-card) rounded-2xl p-4 sm:p-5 border border-(--accent-border) relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-(--bg-hover) transition-colors">
          <Icon name="close" className="text-(--text-muted) text-sm" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-(--accent-bg) flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <SectionLabel text="AI Coach — Burn It Off" />
        </div>

        <div className="bg-(--accent-bg) rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-(--text-muted) text-[9px] uppercase tracking-wider">Meal Logged</p>
              <p className="text-(--text-primary) font-bold text-sm">{suggestion.food_name}</p>
            </div>
            <div className="text-right">
              <p className="text-(--text-muted) text-[9px] uppercase tracking-wider">Calories</p>
              <p className="text-(--accent) font-black text-xl">{suggestion.calories}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-3 mb-4 border-l-2 border-(--accent)">
          <p className="text-(--text-secondary) text-xs leading-relaxed">💡 {suggestion.message}</p>
        </div>

        {suggestion.recommended_plan ? (
          <div className="rounded-xl border border-(--accent-border) bg-(--accent-bg) p-3 mb-3">
            <p className="text-(--text-muted) text-[9px] uppercase tracking-wider mb-2">
              {suggestion.recommended_source === "marketplace"
                ? "🆕 Suggested plan — not enrolled yet"
                : "⭐ Best plan to burn this meal"}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-(--bg-hover) flex items-center justify-center text-lg shrink-0">
                {PLAN_TAG_ICONS[suggestion.recommended_plan.tag] ?? "⚡"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-(--text-primary) font-bold text-sm truncate">{suggestion.recommended_plan.title}</p>
                <p className="text-(--text-muted) text-[9px]">
                  {suggestion.recommended_plan.intensity} · {suggestion.recommended_plan.target_focus}
                </p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-(--accent) text-[#131313] shrink-0">
                {suggestion.recommended_plan.tag}
              </span>
            </div>

            {suggestion.estimated_minutes != null && (
              <p className="text-(--accent) text-[10px] font-bold mt-2">
                ⏱️ ~{suggestion.estimated_minutes} min of this workout would help burn off this meal
              </p>
            )}

            <p className="text-(--text-muted) text-[9px] mt-2 leading-relaxed">{suggestion.reasoning}</p>

            {decision === "accepted" ? (
              <p className="text-[10px] font-semibold text-(--accent) mt-3">
                ✓ Opening {suggestion.recommended_plan.title}…
              </p>
            ) : decision === "declined" ? (
              <div className="flex items-center justify-between gap-2 mt-3">
                <p className="text-(--text-muted) text-[10px]">No problem — keep it up!</p>
                <button onClick={() => setDecision(null)} className="text-[10px] font-semibold text-(--accent) hover:underline shrink-0">
                  Show again
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAcceptPlan}
                  className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-(--accent) text-[#131313] transition-colors touch-manipulation"
                >
                  Yes, show me this plan
                </button>
                <button
                  onClick={() => setDecision("declined")}
                  className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-(--bg-hover) text-(--text-muted) transition-colors touch-manipulation"
                >
                  No thanks
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-(--accent-bg) border border-(--accent-border) rounded-xl p-3 mb-3">
            <p className="text-(--accent) text-[10px] font-semibold mb-2">
              💡 Enroll in a training plan to get personalized workout suggestions!
            </p>
            <p className="text-(--text-muted) text-[9px] leading-relaxed">{suggestion.reasoning}</p>
          </div>
        )}

        <button
          onClick={() => navigate(suggestion.has_enrolled_plans ? "/dashboard/plans?tab=my-plans" : "/dashboard/plans")}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold border border-(--accent-border) text-(--accent) bg-(--accent-bg) hover:bg-(--accent) hover:text-[#131313] transition-all mb-3"
        >
          <Icon name="fitness_center" className="text-sm" fill={1} />
          {suggestion.has_enrolled_plans ? "View My Plans" : "Browse Plans"}
          <Icon name="arrow_forward" className="text-sm" />
        </button>

        <div className="bg-(--bg-hover) rounded-lg p-2 text-center">
          <p className="text-(--text-muted) text-[8px]">
            💪 Balance your intake with activity. Consistency is key!
          </p>
        </div>
      </div>
    );
  }

  if (!inner) return null;

  // Rendered as a centered modal overlay instead of inline in the page.
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget && (error || suggestion)) onClose(); }}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[28px] shadow-2xl"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {inner}
      </div>
    </div>,
    document.body
  );
}

/**
 * Tracks real pixel viewport size via JS instead of CSS vh/dvh units.
 * Needed because standalone/installed PWAs (especially iOS home-screen
 * apps) frequently report an inaccurate viewport through CSS units,
 * causing "fullscreen" overlays to fall short of the real screen size.
 */
function useViewportSize() {
  const [size, setSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    // Standalone iOS PWAs sometimes report a stale size immediately on mount;
    // a short delayed re-check catches that.
    const t = setTimeout(update, 150);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      clearTimeout(t);
    };
  }, []);

  return size;
}

/**
 * Fullscreen, native-camera-style capture experience.
 * Rendered as a fixed overlay above the entire app (z-[999999]) so it
 * escapes the small upload card and takes over the whole viewport,
 * mirroring the iOS/Android camera UX (live feed, shutter, flip,
 * retake / use-photo confirmation).
 */
function FullscreenCamera({ onCapture, onClose }) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState("environment");
  const [ready,       setReady]     = useState(false);
  const [error,       setError]     = useState(null);
  const [flash,       setFlash]     = useState(false);
  const [captured,    setCaptured]  = useState(null);

  // Shared hook: avoids duplicating viewport-tracking logic. See
  // useViewportSize's docstring above for why this exists.
  const { height: viewportHeight } = useViewportSize();

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async (mode) => {
    setError(null);
    setReady(false);
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch {
      setError("Camera access denied or not available.");
    }
  }, [stopStream]);

  useEffect(() => {
    if (!captured) startStream(facingMode);
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode, captured]);

  // Lock background scroll while the fullscreen camera is open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  const handleShutter = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    setCaptured(canvas.toDataURL("image/jpeg", 0.92));
    stopStream();
  };

  const handleRetake   = () => setCaptured(null);
  const handleUsePhoto = () => onCapture(captured);
  const handleClose    = () => { stopStream(); onClose(); };
  const flipCamera     = () => setFacingMode((m) => (m === "environment" ? "user" : "environment"));

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] bg-black flex flex-col"
      style={{ height: `${viewportHeight}px`, width: "100vw" }}
    >
      {flash && (
        <div className="absolute inset-0 bg-white z-20 pointer-events-none transition-opacity duration-150" />
      )}

      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 sm:px-6"
        style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
      >
        <button
          onClick={handleClose}
          aria-label="Close camera"
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white touch-manipulation"
        >
          <Icon name="close" className="text-xl" />
        </button>

        {!captured && (
          <button
            onClick={flipCamera}
            aria-label="Switch camera"
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white touch-manipulation"
          >
            <Icon name="cameraswitch" className="text-xl" />
          </button>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {captured ? (
          <img src={captured} alt="Captured meal" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: error ? "none" : "block" }}
            />
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="text-4xl">🚫</span>
                <p className="text-red-400 text-sm font-medium">{error}</p>
                <button
                  onClick={() => startStream(facingMode)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold touch-manipulation"
                >
                  Try again
                </button>
              </div>
            )}
            {!ready && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Spinner />
                <p className="text-white/70 text-xs">Starting camera…</p>
              </div>
            )}
          </>
        )}
      </div>

      <div
        className="relative z-10 flex items-center justify-center px-6 py-6 sm:py-8"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
      >
        {captured ? (
          <div className="flex items-center gap-4 w-full max-w-sm">
            <button
              onClick={handleRetake}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-white/10 text-white touch-manipulation"
            >
              Retake
            </button>
            <button
              onClick={handleUsePhoto}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-(--accent) text-[#131313] touch-manipulation"
            >
              Use Photo
            </button>
          </div>
        ) : (
          ready && !error && (
            <button
              onClick={handleShutter}
              aria-label="Take photo"
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white border-4 border-white/30 shadow-lg active:scale-90 transition-transform touch-manipulation flex items-center justify-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/80" />
            </button>
          )
        )}
      </div>
    </div>,
    document.body
  );
}

// "Add a meal" card — visually redesigned to match the target mock
// (two direct-action buttons instead of a tab switcher), but every piece
// of underlying state/behavior (tab, preview, drag/drop, camera, analyze)
// is unchanged from the original component.
function UploadSection({ onAnalyze, isAnalyzing }) {
  const fileInputRef = useRef(null);

  const [preview,      setPreview]      = useState(null);
  const [dragOver,     setDragOver]     = useState(false);
  const [compressing,  setCompressing]  = useState(false);
  const [tab,          setTab]          = useState("upload");
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (tab === "camera") setIsCameraOpen(true);
  };

  const handleAnalyzeClick = async () => {
    if (!preview || isAnalyzing || compressing) return;
    setCompressing(true);
    try { await onAnalyze(preview); }
    finally { setCompressing(false); }
  };

  const switchTab = (next) => {
    if (next === tab) return;
    setPreview(null);
    setTab(next);
    if (next === "camera") setIsCameraOpen(true);
  };

  // "Choose from Gallery" button: switch to the upload tab and open the
  // native file picker immediately, so it behaves like a direct action
  // button rather than a passive tab.
  const handleGalleryClick = () => {
    switchTab("upload");
    requestAnimationFrame(() => fileInputRef.current?.click());
  };

  const handleCameraCapture = (photo) => {
    setPreview(photo);
    setIsCameraOpen(false);
  };

  const busy = isAnalyzing || compressing;

  return (
    <div
      className={`bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border transition-colors duration-200 ${
        dragOver ? "border-(--accent) shadow-[0_0_20px_var(--accent-bg)]" : "border-(--border-light)"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); switchTab("upload"); handleFile(e.dataTransfer.files[0]); }}
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

      {preview ? (
        <>
          <SectionLabel text="Meal Photo" />
          <div className="relative rounded-xl overflow-hidden border border-(--border-light)">
            <img src={preview} alt="Meal preview" className="w-full object-cover" style={{ maxHeight: 240 }} />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs font-bold transition-all duration-200 touch-manipulation hover:scale-110"
            >✕</button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-(--accent-bg) flex items-center justify-center shrink-0">
            <Icon name="photo_camera" className="text-(--accent) text-2xl" fill={1} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-(--text-primary)">Add a meal</h3>
            <p className="text-xs text-(--text-muted) mt-0.5 leading-snug">
              Upload a photo of your meal and let AI analyze the nutrition.
            </p>
          </div>
        </div>
      )}

      <div className={`flex gap-2 sm:gap-3 ${preview ? "mt-3" : "mt-4"}`}>
        <button
          onClick={() => switchTab("camera")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-(--accent) text-[#131313] transition-all duration-200 touch-manipulation active:scale-[0.98] hover:shadow-lg hover:shadow-(--accent)/20"
        >
          <Icon name="photo_camera" className="text-base" fill={1} />
          Take Photo
        </button>
        <button
          onClick={handleGalleryClick}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold border border-(--accent-border) text-(--accent) bg-(--accent-bg) hover:bg-(--accent) hover:text-[#131313] transition-all duration-200 touch-manipulation active:scale-[0.98]"
        >
          <Icon name="image" className="text-base" fill={1} />
          Choose from Gallery
        </button>
      </div>

      <button
        onClick={handleAnalyzeClick}
        disabled={busy || !preview}
        className={`mt-3 w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 touch-manipulation ${
          busy || !preview
            ? "bg-(--bg-hover) text-(--text-muted) cursor-not-allowed"
            : "bg-(--bg-hover) hover:bg-(--accent-bg) hover:text-(--accent) text-(--text-primary) active:scale-[0.98]"
        }`}
      >
        {compressing ? (
          <span className="flex items-center justify-center gap-2"><Spinner /> Compressing…</span>
        ) : isAnalyzing ? (
          <span className="flex items-center justify-center gap-2"><Spinner /> Analyzing with AI…</span>
        ) : "Analyze Meal"}
      </button>

      {isCameraOpen && (
        <FullscreenCamera
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
}

function ManualLogForm({ onLog, shouldOpen = 0, onClose }) {
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [open,      setOpen]      = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [errors,    setErrors]    = useState({});
  const prevTrigger = useRef(shouldOpen);

  useEffect(() => {
    if (shouldOpen !== prevTrigger.current) {
      prevTrigger.current = shouldOpen;
      setOpen(true);
    }
  }, [shouldOpen]);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Meal name is required";
    if (!form.calories || isNaN(form.calories) || Number(form.calories) <= 0) e.calories = "Enter a valid calorie amount";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onLog({
      food_name: form.name.trim(),
      emoji:     form.emoji,
      calories:  Number(form.calories),
      protein:   Number(form.protein) || 0,
      carbs:     Number(form.carbs)   || 0,
      fat:       Number(form.fat)     || 0,
      mealType:  form.mealType,
      image_url: form.image_url || "",
    });
    setForm(EMPTY_FORM);
    close();
  };

  // Lock background scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [open]);

  return (
    <>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div
            className="bg-(--bg-card) border border-(--border-medium) w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[28px] p-6 md:p-8 shadow-2xl relative"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-(--bg-card) z-10 pb-2">
              <div>
                <h2 className="text-xl font-bold text-(--text-primary)">Log Meal</h2>
                <p className="text-[10px] md:text-[11px] text-(--text-muted) uppercase tracking-wider mt-1">Manual Entry</p>
              </div>
              <button
                onClick={close}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-(--bg-hover) hover:bg-(--bg-active) text-(--text-muted) hover:text-(--text-primary) transition-all duration-200 hover:scale-110"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            <div className="space-y-4 md:space-y-6">

              <div>
                <label className="block text-[11px] text-(--text-muted) mb-1.5">Meal Name *</label>
                <div className="flex gap-2">
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setEmojiOpen((v) => !v)}
                      className="w-10 h-10 rounded-xl bg-(--bg-hover) hover:bg-(--bg-active) flex items-center justify-center text-lg border border-(--border-light) touch-manipulation"
                    >
                      {form.emoji}
                    </button>
                    {emojiOpen && (
                      <div className="absolute top-12 left-0 z-20 bg-(--bg-tertiary) border border-(--border-medium) rounded-xl p-2 grid grid-cols-5 gap-1 shadow-xl w-max max-w-50">
                        {EMOJI_OPTIONS.map((em) => (
                          <button key={em} onClick={() => { setField("emoji", em); setEmojiOpen(false); }} className="w-8 h-8 rounded-lg hover:bg-(--bg-hover) flex items-center justify-center text-base touch-manipulation">
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="e.g. Chicken Adobo"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      className={`w-full h-10 bg-(--bg-hover) rounded-xl px-3 text-sm text-(--text-primary) border outline-none focus:border-(--accent)/50 transition-colors ${errors.name ? "border-red-500/60" : "border-(--border-light)"}`}
                    />
                    {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-(--text-muted) mb-1.5">Meal Type</label>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {MEAL_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setField("mealType", type)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all touch-manipulation ${
                        form.mealType === type
                          ? "bg-(--accent-bg) text-(--accent) border-(--accent-border)"
                          : "bg-(--bg-hover) text-(--text-muted) border-(--border-light) hover:border-(--border-medium)"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <InputField
                label="Calories (kcal) *"
                type="number"
                placeholder="e.g. 450"
                value={form.calories}
                onChange={(e) => setField("calories", e.target.value)}
                error={errors.calories}
              />

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[{ key: "protein", label: "Protein (g)" }, { key: "carbs", label: "Carbs (g)" }, { key: "fat", label: "Fat (g)" }].map(({ key, label }) => (
                  <InputField key={key} label={label} type="number" placeholder="0" value={form[key]} onChange={(e) => setField(key, e.target.value)} />
                ))}
              </div>

              <button onClick={handleSubmit} className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-(--accent) text-[#131313] transition-all duration-200 touch-manipulation active:scale-[0.98] hover:shadow-lg hover:shadow-(--accent)/20">
                + Add to Log
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function ResultCard({ result, onLog, isLogging }) {
  if (!result) return null;

  return (
    <div className="bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border border-(--border-light) transition-shadow duration-300 hover:shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <SectionLabel text="Analysis Result" />
        <span className="text-[10px] bg-(--accent-bg) text-(--accent) px-2 py-0.5 rounded-full font-semibold shadow-[0_0_8px_var(--accent-bg)]">AI Estimated</span>
      </div>

      <div className="flex items-start gap-3 mb-5 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-(--bg-hover) flex items-center justify-center text-xl sm:text-2xl shrink-0 border border-(--border-light)">🍽️</div>
        <div className="flex-1 min-w-0">
          <p className="text-(--text-primary) font-semibold text-sm sm:text-base leading-tight truncate">{result.food_name}</p>
          {result.suggestion && (
            <p className="text-(--text-muted) text-[10px] mt-1 italic line-clamp-2">"{result.suggestion}"</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl sm:text-2xl font-black text-(--accent)">{result.calories}</p>
          <p className="text-[10px] text-(--text-muted) uppercase tracking-wide">kcal</p>
        </div>
      </div>

      {/* Macro bars (horizontal) */}
      <div className="flex flex-col gap-3 mb-5 sm:mb-6">
        <MacroBar
          label="Protein"
          value={Math.round(result.protein)}
          unit="g"
          color="#60a5fa"
          pct={(result.protein / MACRO_TARGETS.protein) * 100}
        />
        <MacroBar
          label="Carbs"
          value={Math.round(result.carbs)}
          unit="g"
          color="var(--accent)"
          pct={(result.carbs / MACRO_TARGETS.carbs) * 100}
        />
        <MacroBar
          label="Fat"
          value={Math.round(result.fat)}
          unit="g"
          color="#f97316"
          pct={(result.fat / MACRO_TARGETS.fat) * 100}
        />
      </div>

      <button
        onClick={() => onLog(result)}
        disabled={isLogging}
        className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-(--bg-hover) hover:bg-(--accent-bg) hover:text-(--accent) text-(--text-primary) border border-(--border-light) transition-all duration-200 touch-manipulation disabled:opacity-50 active:scale-[0.98] hover:shadow-sm"
      >
        {isLogging ? <span className="flex items-center justify-center gap-2"><Spinner /> Saving...</span> : "+ Log This Meal"}
      </button>
    </div>
  );
}

// Calorie ring + macro cards. The data-fetching effect below is untouched
// from the original component — only the returned markup was redesigned.
function DailySummary({ userId, refreshSeed, selectedDate }) {
  const ZERO = { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 };
  const [summary, setSummary] = useState(ZERO);
  const [burned, setBurned]   = useState(0);
  const [steps, setSteps]     = useState(0);
  const [durationMins, setDurationMins] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [foodRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/food-logs/${userId}`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/stats/daily/${userId}?date=${selectedDate}`, { credentials: 'include' }).catch(() => null),
        ]);
        const data = await foodRes.json();
        if (!foodRes.ok) throw new Error(data.error || "Could not fetch logs");

        const filtered = (data.records || []).filter(
          (meal) => meal.logged_at && meal.logged_at.startsWith(selectedDate)
        );

        const totals = filtered.reduce((acc, meal) => ({
          total_calories: acc.total_calories + (Number(meal.calories) || 0),
          total_protein:  acc.total_protein  + (Number(meal.protein)  || 0),
          total_carbs:    acc.total_carbs    + (Number(meal.carbs)    || 0),
          total_fat:      acc.total_fat      + (Number(meal.fat)      || 0),
        }), { ...ZERO });

        let burnedStats = { calories_burned: 0, steps: 0, workout_duration_mins: 0 };
        if (statsRes && statsRes.ok) burnedStats = await statsRes.json();

        if (!cancelled) {
          setSummary(totals);
          setBurned(Number(burnedStats.calories_burned) || 0);
          setSteps(Number(burnedStats.steps) || 0);
          setDurationMins(Number(burnedStats.workout_duration_mins) || 0);
        }
      } catch (err) {
        console.error("DailySummary fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId, refreshSeed, selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const consumed  = summary.total_calories;
  const remaining = Math.max(Math.round(CALORIE_GOAL - consumed + burned), 0);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Big calorie ring card */}
      <div className="bg-(--bg-card) rounded-2xl p-4 sm:p-6 border border-(--border-light) shadow-sm">
        {loading && (
          <div className="flex justify-end mb-1"><Spinner /></div>
        )}
        <div className="flex items-center justify-center sm:justify-between gap-6 flex-wrap">
          <CalorieRing consumed={consumed} goal={CALORIE_GOAL} />

          <div className="hidden sm:block w-px self-stretch bg-(--border-light)" />

          <div className="flex sm:flex-col gap-6 sm:gap-4 items-center sm:items-start justify-center">
            <div>
              <p className="text-xs text-(--text-muted) mb-1">Remaining</p>
              <p className="text-2xl sm:text-3xl font-black text-(--accent)">{remaining.toLocaleString()}</p>
              <p className="text-[11px] text-(--text-muted)">kcal</p>
            </div>
            <div>
              <p className="text-xs text-(--text-muted) mb-1">Burned</p>
              <p className="text-2xl sm:text-3xl font-black text-(--text-primary)">+{burned.toLocaleString()}</p>
              <p className="text-[11px] text-(--text-muted)">kcal</p>
            </div>
            <div>
              <p className="text-xs text-(--text-muted) mb-1">Daily Goal</p>
              <p className="text-sm sm:text-base font-bold text-(--text-primary)">{CALORIE_GOAL.toLocaleString()} kcal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity burned today (from manual dashboard log) */}
      <div className="bg-(--bg-card) rounded-2xl p-4 sm:p-5 border border-(--border-light) shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] sm:text-xs font-semibold text-(--text-muted) uppercase tracking-widest">Activity today</p>
          <Icon name="directions_run" className="text-(--accent) text-base" fill={1} />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          <div>
            <p className="text-lg sm:text-xl font-black text-(--text-primary)">{burned.toLocaleString()}</p>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-(--text-muted) mt-0.5">kcal burned</p>
          </div>
          <div>
            <p className="text-lg sm:text-xl font-black text-(--text-primary)">{steps.toLocaleString()}</p>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-(--text-muted) mt-0.5">steps</p>
          </div>
          <div>
            <p className="text-lg sm:text-xl font-black text-(--text-primary)">{durationMins}</p>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-(--text-muted) mt-0.5">minutes</p>
          </div>
        </div>
      </div>

      {/* Macro cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MacroStatCard macroKey="protein" label="Protein" value={summary.total_protein} />
        <MacroStatCard macroKey="carbs"   label="Carbs"   value={summary.total_carbs} />
        <MacroStatCard macroKey="fat"     label="Fat"     value={summary.total_fat} />
      </div>
    </div>
  );
}

// Today's Meals list. Delete flow (confirm → delete → spinner) is identical
// to the original — only each row's markup was redesigned.
function MealHistory({ meals, loading, onDeleteMeal, selectedDate }) {
  const [deletingId, setDeletingId] = useState(null);

  const filteredMeals = meals.filter((meal) => meal.logged_at?.startsWith(selectedDate));

  const handleDelete = async (mealId) => {
    if (!window.confirm("Delete this meal? This action cannot be undone.")) return;
    setDeletingId(mealId);
    try { await onDeleteMeal(mealId); }
    catch (err) { console.error("Delete error:", err); }
    finally { setDeletingId(null); }
  };

  const isToday   = selectedDate === new Date().toISOString().split("T")[0];
  const dateLabel = isToday
    ? "Today's Meals"
    : `Meals · ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base sm:text-lg font-bold text-(--text-primary)">{dateLabel}</h2>
        {loading && <Spinner />}
      </div>

      {filteredMeals.length === 0 ? (
        <div className="bg-(--bg-tertiary) rounded-2xl border border-(--border-light) flex flex-col items-center justify-center py-10 sm:py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-(--bg-hover) flex items-center justify-center text-2xl mb-3">🍽️</div>
          <p className="text-(--text-muted) text-xs sm:text-sm font-medium">No meals logged {isToday ? "yet" : "on this day"}</p>
          <p className="text-(--text-muted) text-[10px] sm:text-xs mt-1 opacity-60">Tap the + button to add a meal</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:gap-2.5">
          {filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-(--bg-card) border border-(--border-light) hover:border-(--border-medium) transition-all duration-200 group shadow-sm"
            >
              {meal.image_url ? (
                <img
                  src={meal.image_url}
                  alt={meal.food_name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shrink-0 border border-(--border-light)"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-(--bg-hover) border border-(--border-light) flex items-center justify-center text-2xl shrink-0">
                  {meal.emoji || "🍽️"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-(--accent) uppercase tracking-wide">{formatMealTime(meal.logged_at)}</p>
                <p className="text-sm sm:text-base font-bold text-(--text-primary) truncate">{meal.food_name}</p>
                <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#60a5fa]">
                    <Icon name="egg" className="text-[12px]" fill={1} />{meal.protein || 0}g
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-(--accent)">
                    <Icon name="grain" className="text-[12px]" fill={1} />{meal.carbs || 0}g
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#f97316]">
                    <Icon name="water_drop" className="text-[12px]" fill={1} />{meal.fat || 0}g
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-base sm:text-lg font-black text-(--text-primary)">{meal.calories}</p>
                <p className="text-[9px] text-(--text-muted) uppercase tracking-wide">kcal</p>
              </div>

              {/*
                Delete button: fixed w-8/h-8 + shrink-0 so it can never be
                squeezed by the flex row, and a plain inline SVG (TrashIcon)
                instead of the material-symbols font — the font icon was
                rendering as a near-invisible sliver when it failed to load.
                Always visible on mobile (opacity-100 by default) and
                hidden-until-hover on desktop, since touch devices have no
                hover state.
              */}
              <button
                onClick={() => handleDelete(meal.id)}
                disabled={deletingId === meal.id}
                title="Delete meal"
                className="shrink-0 w-8 h-8 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-50"
              >
                {deletingId === meal.id ? <Spinner /> : <TrashIcon className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const NutritionTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const USER_ID  = user?.id;

  const [sidebarExpanded,  setSidebarExpanded]  = useState(false);
  const [selectedDate,     setSelectedDate]     = useState(new Date().toISOString().split("T")[0]);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [currentMeal,      setCurrentMeal]      = useState(null);
  const [manualLogTrigger, setManualLogTrigger] = useState(0);

  const {
    result, isAnalyzing, isLogging, history, historyLoading,
    toast, summarySeed, lastLoggedMeal,
    handleAnalyze, handleLog, handleDeleteMeal,
  } = useNutritionTracker(USER_ID);

  useEffect(() => {
    if (!USER_ID) navigate("/login");
  }, [USER_ID, navigate]);

  useEffect(() => {
    if (!lastLoggedMeal) return;
    const t = setTimeout(() => {
      setCurrentMeal(lastLoggedMeal);
      setShowAISuggestion(true);
    }, 0);
    return () => clearTimeout(t);
  }, [lastLoggedMeal]);

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="hidden md:block">
        <Sidebar onClick={() => { localStorage.clear(); navigate("/login"); }} expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      </div>

      <Topbar sidebarExpanded={sidebarExpanded} userId={USER_ID} />

      <main className={`pt-14 sm:pt-16 md:pt-16 pb-24 md:pb-8 px-3 sm:px-4 md:px-6 lg:px-8 transition-all duration-[400ms] ${sidebarExpanded ? "md:ml-[240px]" : "md:ml-[72px]"}`}>
        <div className="max-w-2xl mx-auto">

          {/* ── Greeting + title + date nav ── */}
          <div className="mt-5 sm:mt-6 mb-4 sm:mb-5">
            <p className="text-xs sm:text-sm text-(--text-muted)">
              {getGreeting()}, <span className="font-semibold text-(--text-primary)">{user?.name || user?.first_name || "there"}!</span> 👋
            </p>
            <div className="flex items-center justify-between gap-3 mt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-(--text-primary) leading-tight">Nutrition Tracker</h1>
              <DateNavigator currentDate={selectedDate} onDateChange={setSelectedDate} />
            </div>
            <p className="text-xs sm:text-sm text-(--text-muted) mt-1">Track your meals. Fuel your goals.</p>
          </div>

          {/* ── Content stack ── */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <DailySummary userId={USER_ID} refreshSeed={summarySeed} selectedDate={selectedDate} />

            <UploadSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            {result && <ResultCard result={result} onLog={handleLog} isLogging={isLogging} />}

            <MealHistory meals={history} loading={historyLoading} onDeleteMeal={handleDeleteMeal} selectedDate={selectedDate} />
          </div>
        </div>
      </main>

      {showAISuggestion && currentMeal && (
        <AISuggestion
          meal={currentMeal}
          userId={USER_ID}
          onClose={() => { setShowAISuggestion(false); setCurrentMeal(null); }}
        />
      )}

      <div className="md:hidden"><MobileNav onFABClick={() => setManualLogTrigger(t => t + 1)} /></div>
      <ManualLogForm onLog={handleLog} shouldOpen={manualLogTrigger} />
      {toast && <Toast message={toast} />}
    </div>
  );
};

export default NutritionTracker;