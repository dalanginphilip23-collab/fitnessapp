export const BMI_CATEGORY = {
  UNDERWEIGHT: "Underweight",
  HEALTHY: "Healthy Weight",
  OVERWEIGHT: "Overweight",
  OBESE: "Obese",
};
export const CATEGORY_COLOR = {
  [BMI_CATEGORY.UNDERWEIGHT]: "var(--success)",
  [BMI_CATEGORY.HEALTHY]: "var(--accent)",
  [BMI_CATEGORY.OVERWEIGHT]: "var(--warning)",
  [BMI_CATEGORY.OBESE]: "var(--error)",
};
export const BMI_SCALE_LEGEND = [
  { label: "Underweight", range: "< 18.5", color: "var(--success)" },
  { label: "Healthy", range: "18.5 – 24.9", color: "var(--accent)" },
  { label: "Overweight", range: "25 – 29.9", color: "var(--warning)" },
  { label: "Obese", range: "≥ 30", color: "var(--error)" },
];
export function classifyBMI(bmiValue) {
  if (bmiValue < 18.5) return BMI_CATEGORY.UNDERWEIGHT;
  if (bmiValue < 25) return BMI_CATEGORY.HEALTHY;
  if (bmiValue < 30) return BMI_CATEGORY.OVERWEIGHT;
  return BMI_CATEGORY.OBESE;
}
export const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { id: "light", label: "Light Exercise", desc: "1-3 days/week" },
  { id: "moderate", label: "Moderate Exercise", desc: "3-5 days/week" },
  { id: "heavy", label: "Heavy Exercise", desc: "6-7 days/week" },
  { id: "athlete", label: "Athlete", desc: "Hard daily training" },
];
export const MACRO_SPLITS = [
  {
    id: "moderate",
    label: "Moderate Carb",
    ratio: "30/35/35",
    protein: 0.3,
    fat: 0.35,
    carb: 0.35,
  },
  {
    id: "lower",
    label: "Lower Carb",
    ratio: "40/40/20",
    protein: 0.4,
    fat: 0.4,
    carb: 0.2,
  },
  {
    id: "higher",
    label: "Higher Carb",
    ratio: "30/20/50",
    protein: 0.3,
    fat: 0.2,
    carb: 0.5,
  },
];

export function calcMacros(calories, split) {
  const proteinCals = calories * split.protein;
  const fatCals = calories * split.fat;
  const carbCals = calories * split.carb;
  return {
    protein: {
      grams: Math.round(proteinCals / 4),
      calories: Math.round(proteinCals),
    },
    fat: { grams: Math.round(fatCals / 9), calories: Math.round(fatCals) },
    carb: { grams: Math.round(carbCals / 4), calories: Math.round(carbCals) },
  };
}
