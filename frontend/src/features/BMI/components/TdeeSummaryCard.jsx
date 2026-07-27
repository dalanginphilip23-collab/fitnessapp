import { Icon } from "../../../components";
import { ACTIVITY_LEVELS } from "../constants/bmiConstants";

export default function TdeeSummaryCard({
  bmr,
  tdee,
  tdeeWeekly,
  activityLevel,
}) {
  if (!tdee) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-(--bg-tertiary) border border-(--accent-border) rounded-4xl p-6 text-center flex flex-col justify-center">
        <span className="text-(--accent) font-black uppercase text-[10px] tracking-[0.25em] mb-3">
          Maintenance Calories
        </span>
        <div className="text-5xl font-black italic text-(--text-primary) tracking-tighter">
          {tdee.toLocaleString()}
        </div>
        <span className="text-[9px] uppercase tracking-widest text-(--text-muted) font-bold mt-1">
          calories / day
        </span>
        <div className="w-8 h-px bg-(--border-medium) mx-auto my-4" />
        <div className="text-xl font-black text-(--text-secondary)">
          {tdeeWeekly.toLocaleString()}
        </div>
        <span className="text-[9px] uppercase tracking-widest text-(--text-muted) font-bold">
          calories / week
        </span>
      </div>

      <div className="bg-(--bg-tertiary) border border-(--border-medium) rounded-4xl p-6">
        <h4 className="text-(--accent) font-black uppercase text-[10px] tracking-[0.25em] mb-4 flex items-center gap-2">
          <Icon name="bolt" className="text-sm" />
          By Activity Level
        </h4>
        <div className="space-y-1">
          <div className="flex justify-between items-center py-1.5 border-b border-(--border-light)">
            <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">
              BMR
            </span>
            <span className="text-sm font-black text-(--text-secondary)">
              {bmr?.toLocaleString()} kcal
            </span>
          </div>
          {ACTIVITY_LEVELS.map((lvl) => {
            const multiplier = {
              sedentary: 1.2,
              light: 1.375,
              moderate: 1.55,
              heavy: 1.725,
              athlete: 1.9,
            }[lvl.id];
            const calories = Math.round((bmr ?? 0) * multiplier);
            const isActive = lvl.id === activityLevel;
            return (
              <div
                key={lvl.id}
                className={`flex justify-between items-center py-1.5 border-b border-(--border-light) last:border-0 ${
                  isActive ? "text-(--accent)" : ""
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {lvl.label}
                </span>
                <span className="text-sm font-black">
                  {calories.toLocaleString()} kcal
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
