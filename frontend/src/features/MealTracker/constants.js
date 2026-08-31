// Fallback defaults — overridden by useGoals hook when BMI data is available
export const CALORIE_GOAL = 2000;
export const MACRO_TARGETS = { protein: 120, carbs: 200, fat: 60 };

// Atwater general factors (kcal per gram)
export const ATWATER = { protein: 4, carbs: 4, fat: 9, alcohol: 7 };
export const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
export const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const DOW_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
export const PLAN_TAG_ICONS = { Strength: "🏋️", Cardio: "🏃", "Fat Loss": "🔥", Flexibility: "🧘", Recovery: "💆", Hypertrophy: "💪" };

// Kept identical to the macro colors already used in ResultCard's MacroBar,
// so a given macro reads as the same color everywhere on this page.
export const MACRO_COLORS = {
  protein: { color: "#60a5fa", tint: "#60a5fa14", border: "#60a5fa33", icon: "egg" },
  carbs:   { color: "var(--accent)", tint: "var(--accent-bg)", border: "var(--accent-border)", icon: "grain" },
  fat:     { color: "#f97316", tint: "#f9731614", border: "#f9731633", icon: "water_drop" },
};

export const EMOJI_OPTIONS = [
  "🍗","🥩","🥦","🍚","🥗","🍜","🍕","🥙","🌮","🍱",
  "🥣","🍳","🥐","🍞","🧆","🥘","🍲","🫕","🥫","🍎",
  "🍌","🥑","🫙","🧀","🥚","🫐","🍇","🍓","🥝","🍽️",
];

export const EMPTY_FORM = {
  name: "", emoji: "🍽️", calories: "",
  protein: "", carbs: "", fat: "",
  mealType: "Breakfast", image_url: "",
};