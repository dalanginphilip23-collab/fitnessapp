import SectionLabel from "./SectionLabel";
import MacroBar from "./MacroBar";
import Spinner from "./Spinner";
import { MACRO_TARGETS, ATWATER } from "../constants";

export default function ResultCard({ result, onLog, isLogging, macroTargets }) {
  if (!result) return null;

  const targets = macroTargets || MACRO_TARGETS;

  const calories = Math.round(result.calories || 0);
  const protein  = Math.round(result.protein  || 0);
  const carbs    = Math.round(result.carbs    || 0);
  const fat      = Math.round(result.fat      || 0);

  // Atwater macro-to-calorie validation
  const macroCalories = protein * ATWATER.protein + carbs * ATWATER.carbs + fat * ATWATER.fat;
  const diff = Math.abs(macroCalories - calories);
  const isMacroValid = diff <= 2 || (calories > 0 && diff / calories <= 0.05);

  return (
    <div className="bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border border-(--border-light) transition-shadow duration-300 hover:shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <SectionLabel text="Analysis Result" />
        <span className="text-[10px] bg-(--accent-bg) text-(--accent) px-2 py-0.5 rounded-full font-semibold shadow-[0_0_8px_var(--accent-bg)]">
          AI Estimated{result.estimated_grams ? ` · ${result.estimated_grams}g` : ''}
        </span>
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
          <p className="text-xl sm:text-2xl font-black text-(--accent)">{calories}</p>
          <p className="text-[10px] text-(--text-muted) uppercase tracking-wide">kcal</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-5 sm:mb-6">
        <MacroBar label="Protein" value={protein} unit="g" color="#60a5fa" pct={targets.protein > 0 ? (protein / targets.protein) * 100 : 0} />
        <MacroBar label="Carbs" value={carbs} unit="g" color="var(--accent)" pct={targets.carbs > 0 ? (carbs / targets.carbs) * 100 : 0} />
        <MacroBar label="Fat" value={fat} unit="g" color="#f97316" pct={targets.fat > 0 ? (fat / targets.fat) * 100 : 0} />
        {result.estimated_grams && (
          <p className="text-[10px] text-(--text-muted)">
            ~{result.estimated_grams}g estimated · {isMacroValid ? `✓ macro math` : `macro math ≈${macroCalories} kcal`}
          </p>
        )}
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
