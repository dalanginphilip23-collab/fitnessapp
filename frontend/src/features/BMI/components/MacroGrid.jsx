import { useMemo, useState } from "react";
import { Icon } from "../../../components";
import { MACRO_SPLITS, calcMacros } from "../constants/bmiConstants";

const GOAL_TABS = [
  { id: "maintenance", label: "Maintenance" },
  { id: "cutting", label: "Cutting" },
  { id: "bulking", label: "Bulking" },
];
export default function MacroGrid({ goals }) {
  const [activeGoal, setActiveGoal] = useState("maintenance");
  const [activeSplit, setActiveSplit] = useState(MACRO_SPLITS[0]);

  if (!goals) return null;

  const goalCalories = goals[activeGoal];
  const macros = useMemo(
    () => calcMacros(goalCalories, activeSplit),
    [goalCalories, activeSplit],
  );

  return (
    <div className="bg-(--bg-tertiary) border border-(--border-medium) rounded-4xl p-6">
      <h4 className="text-(--accent) font-black uppercase text-[10px] tracking-[0.25em] mb-5 flex items-center gap-2">
        <Icon name="restaurant" className="text-sm" />
        Macronutrients
      </h4>

      <div className="flex gap-2 mb-4">
        {GOAL_TABS.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGoal(g.id)}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
              activeGoal === g.id
                ? "bg-(--accent) border-(--accent) text-(--text-inverse)"
                : "bg-(--bg-hover) border-(--border-light) text-(--text-secondary)"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-(--text-muted) mb-4">
        Based on{" "}
        <span className="font-black text-(--accent)">
          {goalCalories.toLocaleString()}
        </span>{" "}
        calories/day.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {MACRO_SPLITS.map((split) => (
          <button
            key={split.id}
            onClick={() => setActiveSplit(split)}
            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
              activeSplit.id === split.id
                ? "bg-(--accent-bg,transparent) border-(--accent-border) text-(--accent)"
                : "bg-(--bg-hover) border-(--border-light) text-(--text-muted)"
            }`}
          >
            {split.label} ({split.ratio})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "protein", label: "Protein", color: "var(--accent)" },
          { key: "fat", label: "Fats", color: "var(--warning)" },
          { key: "carb", label: "Carbs", color: "var(--error)" },
        ].map((m) => (
          <div
            key={m.key}
            className="bg-(--bg-hover) rounded-2xl p-4 text-center"
          >
            <div className="text-xl font-black text-(--text-primary)">
              {macros[m.key].grams}g
            </div>
            <span
              className="text-[8px] font-black uppercase tracking-widest"
              style={{ color: m.color }}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
