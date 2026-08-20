import Icon from "../../../components/ui/Icon";
import { MACRO_COLORS, MACRO_TARGETS } from "../constants";

// One of the three Protein/Carbs/Fat cards in the overview.
export default function MacroStatCard({ macroKey, label, value, unit = "g" }) {
  const { color, tint, border, icon } = MACRO_COLORS[macroKey];
  const goal = MACRO_TARGETS[macroKey];
  const pct  = goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0;

  return (
    <div className="rounded-2xl p-3 sm:p-4 border" style={{ background: tint, borderColor: border }}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <span style={{ color }}><Icon name={icon} className="text-sm" fill={1} /></span>
        <span className="text-[11px] sm:text-xs font-bold" style={{ color }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-xl sm:text-2xl font-black text-(--text-primary)">{Math.round(value)}</span>
        <span className="text-[11px] text-(--text-muted)">{unit}</span>
      </div>
      <p className="text-[10px] text-(--text-muted) mb-2.5">{pct}% of {goal}{unit}</p>
      <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}