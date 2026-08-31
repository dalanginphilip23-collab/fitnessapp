import { useState, useEffect } from "react";
import Icon from "../../../components/ui/Icon";
import CalorieRing from "./CalorieRing";
import MacroStatCard from "./MacroStatCard";
import Spinner from "./Spinner";
import { fetchDailyStats } from "../services/nutritionService";
import { CALORIE_GOAL } from "../constants";

const ZERO_SUMMARY = { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 };

export default function DailySummary({ userId, refreshSeed, selectedDate, meals }) {
  const [summary, setSummary] = useState(ZERO_SUMMARY);
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
        const statsData = await fetchDailyStats(userId, selectedDate).catch(() => null);

        const totals = (meals || []).reduce((acc, meal) => ({
          total_calories: acc.total_calories + (Number(meal.calories) || 0),
          total_protein:  acc.total_protein  + (Number(meal.protein)  || 0),
          total_carbs:    acc.total_carbs    + (Number(meal.carbs)    || 0),
          total_fat:      acc.total_fat      + (Number(meal.fat)      || 0),
        }), { ...ZERO_SUMMARY });

        const burnedStats = statsData ?? { calories_burned: 0, steps: 0, workout_duration_mins: 0 };

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
  }, [userId, refreshSeed, selectedDate, meals]); // eslint-disable-line react-hooks/exhaustive-deps

  const consumed  = summary.total_calories;
  const remaining = Math.max(Math.round(CALORIE_GOAL - consumed + burned), 0);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Big calorie ring card — centered like reference */}
      <div className="bg-(--bg-card) rounded-2xl p-6 sm:p-8 border border-(--border-light) shadow-sm flex flex-col items-center gap-6">
        {loading && (
          <div className="self-end -mb-2"><Spinner /></div>
        )}
        <CalorieRing consumed={consumed} goal={CALORIE_GOAL} />
        <div className="w-full grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[11px] text-(--text-muted) mb-1">Remaining</p>
            <p className="text-xl sm:text-2xl font-black text-(--accent)">{remaining.toLocaleString()}</p>
            <p className="text-[10px] text-(--text-muted)">kcal</p>
          </div>
          <div>
            <p className="text-[11px] text-(--text-muted) mb-1">Burned</p>
            <p className="text-xl sm:text-2xl font-black text-(--text-primary)">+{burned.toLocaleString()}</p>
            <p className="text-[10px] text-(--text-muted)">kcal</p>
          </div>
          <div>
            <p className="text-[11px] text-(--text-muted) mb-1">Daily Goal</p>
            <p className="text-[13px] sm:text-sm font-bold text-(--text-primary) mt-2">{CALORIE_GOAL.toLocaleString()} kcal</p>
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