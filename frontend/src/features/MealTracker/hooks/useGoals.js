import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config/port";

// Atwater general factor system (kcal per gram)
export const ATWATER = { protein: 4, carbs: 4, fat: 9, alcohol: 7 };

// Goal-based macro ratio presets (protein g / carbs g / fat g per 1 kcal)
// These are derived from evidence-based ranges:
//   Protein: 1.6–2.2 g/kg → we use ~30% of calories
//   Fat:     0.8–1.0 g/kg → we use ~25% of calories
//   Carbs:   remainder     → ~45% of calories
const GOAL_MACRO_RATIOS = {
  cutting:   { proteinRatio: 0.35, carbRatio: 0.40, fatRatio: 0.25 },
  maintaining: { proteinRatio: 0.30, carbRatio: 0.45, fatRatio: 0.25 },
  bulking:   { proteinRatio: 0.25, carbRatio: 0.50, fatRatio: 0.25 },
};

// Fallback defaults when no BMI data exists
const FALLBACK = {
  calorieGoal: 2000,
  macroTargets: { protein: 120, carbs: 200, fat: 60 },
  bmr: null,
  tdee: null,
  goalType: "maintaining",
};

function computeMacroTargets(tdee, goalType) {
  const ratios = GOAL_MACRO_RATIOS[goalType] || GOAL_MACRO_RATIOS.maintaining;
  return {
    protein: Math.round((tdee * ratios.proteinRatio) / ATWATER.protein),
    carbs:   Math.round((tdee * ratios.carbRatio) / ATWATER.carbs),
    fat:     Math.round((tdee * ratios.fatRatio) / ATWATER.fat),
  };
}

function goalTypeFromFitnessGoal(fitnessGoal) {
  if (!fitnessGoal) return "maintaining";
  const g = String(fitnessGoal).toLowerCase();
  if (g.includes("cut") || g.includes("loss") || g.includes("lean")) return "cutting";
  if (g.includes("bulk") || g.includes("mass") || g.includes("strength")) return "bulking";
  return "maintaining";
}

export function useGoals(userId) {
  const [goals, setGoals] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setGoals(FALLBACK);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        // Fetch latest BMI record (has bmr, tdee, age, activity_level, weight, height)
        const res = await fetch(`${API_BASE_URL}/api/bmi/${userId}?limit=1`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`BMI fetch failed: ${res.status}`);
        const data = await res.json();
        const record = data.records?.[0];

        if (!record || !record.tdee) {
          if (!cancelled) { setGoals(FALLBACK); setLoading(false); }
          return;
        }

        const tdee = Math.round(record.tdee);
        const bmr = Math.round(record.bmr || 0);

        // Determine goal type from user's fitness_goal or activity level
        let goalType = "maintaining";
        if (record.activity_level) {
          const al = String(record.activity_level).toLowerCase();
          if (al === "sedentary" || al === "light") goalType = "cutting";
          else if (al === "heavy" || al === "athlete") goalType = "bulking";
          else goalType = "maintaining";
        }

        const calorieGoal = tdee;
        const macroTargets = computeMacroTargets(tdee, goalType);

        if (!cancelled) {
          setGoals({ calorieGoal, macroTargets, bmr, tdee, goalType });
          setLoading(false);
        }
      } catch (err) {
        console.error("[useGoals] Failed to fetch BMI data:", err);
        if (!cancelled) { setGoals(FALLBACK); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  return goals;
}
