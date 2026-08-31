import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config/port";

// Atwater general factor system (kcal per gram)
export const ATWATER = { protein: 4, carbs: 4, fat: 9, alcohol: 7 };

// Goal-based macro ratio presets (protein/carbs/fat as fraction of total kcal)
// Derived from evidence-based ranges for each goal type.
const GOAL_MACRO_RATIOS = {
  cutting:     { proteinRatio: 0.35, carbRatio: 0.40, fatRatio: 0.25 },
  maintaining: { proteinRatio: 0.30, carbRatio: 0.45, fatRatio: 0.25 },
  bulking:     { proteinRatio: 0.25, carbRatio: 0.50, fatRatio: 0.25 },
};

// Calorie adjustment from maintenance TDEE per goal type
const GOAL_CALORIE_ADJUSTMENT = {
  cutting: -500,
  maintaining: 0,
  bulking: +500,
};

// Fallback defaults when no BMI data exists
const FALLBACK = {
  calorieGoal: 2000,
  macroTargets: { protein: 120, carbs: 200, fat: 60 },
  bmr: null,
  tdee: null,
  goalType: "maintaining",
};

function computeMacroTargets(calorieGoal, goalType) {
  const ratios = GOAL_MACRO_RATIOS[goalType] || GOAL_MACRO_RATIOS.maintaining;
  return {
    protein: Math.round((calorieGoal * ratios.proteinRatio) / ATWATER.protein),
    carbs:   Math.round((calorieGoal * ratios.carbRatio) / ATWATER.carbs),
    fat:     Math.round((calorieGoal * ratios.fatRatio) / ATWATER.fat),
  };
}

function resolveGoalType(fitnessGoal) {
  if (!fitnessGoal) return "maintaining";
  const g = String(fitnessGoal).toLowerCase();
  if (g.includes("cut") || g.includes("loss") || g.includes("lean") || g.includes("shred")) return "cutting";
  if (g.includes("bulk") || g.includes("mass") || g.includes("strength") || g.includes("muscle")) return "bulking";
  return "maintaining";
}

export function useGoals(userId, fitnessGoal) {
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
        const bmr  = Math.round(record.bmr || 0);

        // Use the user's actual fitness goal from their profile
        const goalType = resolveGoalType(fitnessGoal);

        // Calorie goal = TDEE + goal-specific adjustment
        const adjustment = GOAL_CALORIE_ADJUSTMENT[goalType] ?? 0;
        const calorieGoal = tdee + adjustment;

        // Macro targets derived from the calorie goal
        const macroTargets = computeMacroTargets(calorieGoal, goalType);

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
  }, [userId, fitnessGoal]);

  return goals;
}
