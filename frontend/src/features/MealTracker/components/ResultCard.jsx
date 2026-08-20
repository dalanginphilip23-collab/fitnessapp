import SectionLabel from "./SectionLabel";
import MacroBar from "./MacroBar";
import Spinner from "./Spinner";
import { MACRO_TARGETS } from "../constants";

export default function ResultCard({ result, onLog, isLogging }) {
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