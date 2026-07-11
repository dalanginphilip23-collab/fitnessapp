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

  const formattedDate = parseDate(currentDate).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  parseDate(currentDate).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });

  const now = new Date();
  const atCurrentMonth =
    calendarMonth.year  === now.getFullYear() &&
    calendarMonth.month === now.getMonth();

  return (
    <div className="flex items-center gap-2 bg-(--bg-tertiary) rounded-2xl p-1.5 sm:p-2 border border-(--border-light)">
      <button onClick={() => shiftDay(-1)} className="p-1.5 sm:p-2 rounded-xl hover:bg-(--bg-hover) transition-colors" aria-label="Previous day">
        <Icon name="chevron_left" className="text-(--text-muted) text-sm sm:text-base" />
      </button>

      <div className="relative" ref={calendarRef}>
        <button
          onClick={() => setIsCalendarOpen((v) => !v)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-(--bg-hover) hover:bg-(--bg-active) transition-colors"
        >
          <Icon name="calendar_today" className="text-(--accent) text-sm sm:text-base" />
          <span className="text-(--text-primary) text-xs sm:text-sm font-medium whitespace-nowrap">{formattedDate}</span>
          <Icon name="expand_more" className="text-(--text-muted) text-sm" />
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
        <Icon name="chevron_right" className="text-(--text-muted) text-sm sm:text-base" />
      </button>

      {!isToday && (
        <button onClick={goToToday} className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-(--accent-bg) text-(--accent) text-[10px] sm:text-xs font-bold transition-colors whitespace-nowrap">
          Today
        </button>
      )}
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

  if (!meal) return null;

  if (loading) {
    return (
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
  }

  if (error) {
    return (
      <div className="bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border border-(--border-light) relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-(--bg-hover) transition-colors">
          <Icon name="close" className="text-(--text-muted) text-sm" />
        </button>
        <SectionLabel text="AI Coach — Burn It Off" />
        <p className="text-(--text-muted) text-xs">⚠️ {error}</p>
      </div>
    );
  }

  if (!suggestion) return null;

  return (
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

/**
 * Fullscreen, native-camera-style capture experience.
 * Rendered as a fixed overlay above the entire app (z-[100]) so it
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
    <div className="fixed inset-0 z-[999999] bg-black flex flex-col">
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

  const handleCameraCapture = (photo) => {
    setPreview(photo);
    setIsCameraOpen(false);
  };

  const busy = isAnalyzing || compressing;

  return (
    <div className="bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border border-(--border-light)">
      <SectionLabel text="Meal Photo" />

      <div className="flex gap-1.5 mb-3 bg-(--bg-hover) rounded-xl p-1">
        {[{ id: "upload", icon: "📁", label: "Upload" }, { id: "camera", icon: "📷", label: "Camera" }].map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => switchTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all touch-manipulation ${
              tab === id ? "bg-(--accent) text-[#131313]" : "text-(--text-muted) hover:text-(--text-secondary)"
            }`}
          >
            <span>{icon}</span>{label}
          </button>
        ))}
      </div>

      {tab === "upload" && (
        <div
          className={`relative rounded-xl border-2 border-dashed transition-colors duration-200 cursor-pointer ${
            dragOver ? "border-(--accent)/60 bg-(--accent-bg)" : "border-(--border-medium) hover:border-(--border-heavy)"
          } ${preview ? "border-solid border-(--border-medium)" : ""}`}
          style={{ minHeight: 180 }}
          onClick={() => !preview && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        >
          {preview ? (
            <>
              <img src={preview} alt="Meal preview" className="w-full rounded-xl object-cover" style={{ maxHeight: 240 }} />
              <button
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs font-bold transition-colors touch-manipulation"
              >✕</button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-4 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-(--bg-hover) flex items-center justify-center mb-3 text-2xl">📁</div>
              <p className="text-(--text-primary) text-xs sm:text-sm font-medium mb-1">Drop a photo here</p>
              <p className="text-(--text-muted) text-xs">or tap to browse</p>
            </div>
          )}
        </div>
      )}

      {tab === "camera" && (
        <div
          className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center cursor-pointer"
          style={{ minHeight: 180 }}
          onClick={() => !preview && setIsCameraOpen(true)}
        >
          {preview ? (
            <>
              <img src={preview} alt="Captured meal" className="w-full rounded-xl object-cover" style={{ maxHeight: 240 }} />
              <button
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold transition-colors touch-manipulation"
              >✕</button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-4 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-3 text-2xl">📷</div>
              <p className="text-white text-xs sm:text-sm font-medium mb-1">Tap to open camera</p>
              <p className="text-white/50 text-xs">Fullscreen capture</p>
            </div>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

      <button
        onClick={handleAnalyzeClick}
        disabled={busy || !preview}
        className={`mt-3 sm:mt-4 w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 touch-manipulation ${
          busy || !preview
            ? "bg-(--bg-hover) text-(--text-muted) cursor-not-allowed"
            : "bg-(--accent) active:scale-[0.98] text-[#131313]"
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

function ManualLogForm({ onLog }) {
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [open,      setOpen]      = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [errors,    setErrors]    = useState({});

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
    setOpen(false);
  };

  return (
    <div className="bg-(--bg-tertiary) rounded-2xl border border-(--border-light) overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 hover:bg-(--bg-hover) transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">✏️</span>
          <p className="text-[10px] sm:text-xs font-semibold text-(--accent) uppercase tracking-widest">Log Manually</p>
        </div>
        <span className={`text-(--text-muted) text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-(--border-light) pt-3 sm:pt-4 space-y-3 sm:space-y-4">

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

          <button onClick={handleSubmit} className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-(--accent) text-[#131313] transition-colors touch-manipulation">
            + Add to Log
          </button>
        </div>
      )}
    </div>
  );
}

function ResultCard({ result, onLog, isLogging }) {
  if (!result) return null;

  const macros = [
    { label: "Protein", value: result.protein, unit: "g", color: "#60a5fa",      pct: (result.protein / MACRO_TARGETS.protein) * 100 },
    { label: "Carbs",   value: result.carbs,   unit: "g", color: "var(--accent)", pct: (result.carbs   / MACRO_TARGETS.carbs)   * 100 },
    { label: "Fat",     value: result.fat,     unit: "g", color: "#f97316",       pct: (result.fat     / MACRO_TARGETS.fat)     * 100 },
  ];

  return (
    <div className="bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border border-(--border-light)">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <SectionLabel text="Analysis Result" />
        <span className="text-[10px] bg-(--accent-bg) text-(--accent) px-2 py-0.5 rounded-full font-semibold">AI Estimated</span>
      </div>

      <div className="flex items-start gap-3 mb-4 sm:mb-5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-(--bg-hover) flex items-center justify-center text-xl sm:text-2xl shrink-0">🍽️</div>
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

      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
        {macros.map((m) => <MacroBar key={m.label} {...m} />)}
      </div>

      <button
        onClick={() => onLog(result)}
        disabled={isLogging}
        className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-(--bg-hover) hover:bg-(--accent-bg) hover:text-(--accent) text-(--text-primary) border border-(--border-light) transition-all touch-manipulation disabled:opacity-50"
      >
        {isLogging ? <span className="flex items-center justify-center gap-2"><Spinner /> Saving...</span> : "+ Log This Meal"}
      </button>
    </div>
  );
}

function DailySummary({ userId, refreshSeed, selectedDate }) {
  const ZERO = { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 };
  const [summary, setSummary] = useState(ZERO);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE_URL}/api/food-logs/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not fetch logs");

        const filtered = (data.records || []).filter(
          (meal) => meal.logged_at && meal.logged_at.startsWith(selectedDate)
        );

        const totals = filtered.reduce((acc, meal) => ({
          total_calories: acc.total_calories + (Number(meal.calories) || 0),
          total_protein:  acc.total_protein  + (Number(meal.protein)  || 0),
          total_carbs:    acc.total_carbs    + (Number(meal.carbs)    || 0),
          total_fat:      acc.total_fat      + (Number(meal.fat)      || 0),
        }), { ...ZERO });

        if (!cancelled) setSummary(totals);
      } catch (err) {
        console.error("DailySummary fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId, refreshSeed, selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const consumed  = Math.round(summary.total_calories);
  const over      = consumed > CALORIE_GOAL;
  const remaining = Math.max(CALORIE_GOAL - consumed, 0);
  const pct       = Math.min((consumed / CALORIE_GOAL) * 100, 100);
  const isToday   = selectedDate === new Date().toISOString().split("T")[0];

  const macroRows = [
    { label: "Protein", value: `${Math.round(summary.total_protein)}g`, target: `${MACRO_TARGETS.protein}g`, pct: (summary.total_protein / MACRO_TARGETS.protein) * 100, color: "#60a5fa" },
    { label: "Carbs",   value: `${Math.round(summary.total_carbs)}g`,   target: `${MACRO_TARGETS.carbs}g`,   pct: (summary.total_carbs   / MACRO_TARGETS.carbs)   * 100, color: "var(--accent)" },
    { label: "Fat",     value: `${Math.round(summary.total_fat)}g`,     target: `${MACRO_TARGETS.fat}g`,     pct: (summary.total_fat     / MACRO_TARGETS.fat)     * 100, color: "#f97316" },
  ];

  return (
    <div className="bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border border-(--border-light)">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <SectionLabel text={isToday ? "Today's Summary" : `Summary · ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`} />
        {loading && <Spinner />}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
        {[
          { label: "Goal",                 val: CALORIE_GOAL,                            cls: "text-(--text-primary)" },
          { label: "Consumed",             val: consumed,                                cls: over ? "text-red-400" : "text-(--accent)" },
          { label: over ? "Over" : "Left", val: over ? consumed - CALORIE_GOAL : remaining, cls: over ? "text-red-400" : "text-(--text-primary)" },
        ].map(({ label, val, cls }) => (
          <div key={label} className="bg-(--bg-hover) rounded-xl p-2 sm:p-3 text-center">
            <p className={`text-base sm:text-lg font-black ${cls}`}>{val}</p>
            <p className="text-[9px] sm:text-[10px] text-(--text-muted) mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 sm:mb-5">
        <div className="flex justify-between text-[10px] text-(--text-muted) mb-1.5">
          <span>Calorie progress</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-(--bg-hover) overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: over ? "#ef4444" : "var(--accent)" }} />
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {macroRows.map((r) => (
          <div key={r.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-(--text-muted)">{r.label}</span>
              <span className="text-xs text-(--text-muted)">{r.value} / {r.target}</span>
            </div>
            <div className="h-1.5 rounded-full bg-(--bg-hover) overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(r.pct, 100)}%`, background: r.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div className="bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border border-(--border-light)">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <SectionLabel text={dateLabel} />
        {loading && <Spinner />}
      </div>

      {filteredMeals.length === 0 ? (
        <p className="text-(--text-muted) text-xs sm:text-sm text-center py-6 sm:py-8">
          No meals logged {isToday ? "yet" : "on this day"}
        </p>
      ) : (
        <div className="space-y-2">
          {filteredMeals.map((meal) => (
            <div key={meal.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-(--bg-hover) transition-colors group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-(--bg-hover) flex items-center justify-center text-base sm:text-lg shrink-0">
                {meal.emoji || "🍽️"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-(--text-primary) truncate">{meal.food_name}</p>
                <p className="text-[10px] text-(--text-muted)">{meal.logged_at}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs sm:text-sm font-bold text-(--accent)">{meal.calories} kcal</p>
                {(meal.protein || meal.carbs || meal.fat) && (
                  <p className="text-[9px] sm:text-[10px] text-(--text-muted) hidden sm:block">
                    P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                  </p>
                )}
              </div>
              {/*
                Delete icon is now always visible on mobile (opacity-100 by default)
                and only hidden-until-hover on desktop (sm:opacity-0 sm:group-hover:opacity-100),
                since touch devices have no hover state and the icon was previously
                untappable on mobile.
              */}
              <button
                onClick={() => handleDelete(meal.id)}
                disabled={deletingId === meal.id}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 disabled:opacity-50"
                title="Delete meal"
              >
                {deletingId === meal.id ? <Spinner /> : <Icon name="delete" className="text-sm" />}
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

  const consumed = history
    .filter((m) => m.logged_at?.startsWith(selectedDate))
    .reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="hidden md:block">
        <Sidebar onClick={() => { localStorage.clear(); navigate("/login"); }} expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      </div>

      <Topbar sidebarExpanded={sidebarExpanded} userId={USER_ID} />

      <main className={`pt-16 sm:pt-[72px] md:pt-20 pb-24 md:pb-8 px-3 sm:px-4 md:px-6 lg:px-8 transition-all duration-[400ms] ${sidebarExpanded ? "md:ml-[240px]" : "md:ml-[72px]"}`}>
        <div className="max-w-5xl mx-auto">

          <div className="flex justify-end mb-4 pt-2">
            <DateNavigator currentDate={selectedDate} onDateChange={setSelectedDate} />
          </div>

          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-(--text-primary)">Nutrition Tracker</h1>
            <p className="text-(--text-muted) text-xs sm:text-sm mt-0.5">
              {consumed} / {CALORIE_GOAL} kcal ·{" "}
              {selectedDate === new Date().toISOString().split("T")[0]
                ? "today"
                : new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

            <div className="flex flex-col gap-3 sm:gap-4">
              <UploadSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
              {result && <ResultCard result={result} onLog={handleLog} isLogging={isLogging} />}
              <ManualLogForm onLog={handleLog} />
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <DailySummary userId={USER_ID} refreshSeed={summarySeed} selectedDate={selectedDate} />
              {showAISuggestion && currentMeal && (
                <AISuggestion
                  meal={currentMeal}
                  userId={USER_ID}
                  onClose={() => { setShowAISuggestion(false); setCurrentMeal(null); }}
                />
              )}
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 md:col-span-2 lg:col-span-1">
              <MealHistory meals={history} loading={historyLoading} onDeleteMeal={handleDeleteMeal} selectedDate={selectedDate} />
            </div>

          </div>
        </div>
      </main>

      <div className="md:hidden"><MobileNav /></div>
      {toast && <Toast message={toast} />}
    </div>
  );
};

export default NutritionTracker;