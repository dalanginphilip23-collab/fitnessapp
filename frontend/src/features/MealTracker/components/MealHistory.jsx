import { useState } from "react";
import Icon from "../../../components/ui/Icon";
import TrashIcon from "./TrashIcon";
import Spinner from "./Spinner";
import { formatMealTime } from "../utils";

// Today's Meals list. Delete flow (confirm → delete → spinner) is identical
// to the original — only each row's markup was redesigned.
export default function MealHistory({ meals, loading, onDeleteMeal, selectedDate }) {
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