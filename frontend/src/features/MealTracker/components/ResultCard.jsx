import { useEffect, useState } from "react";
import SectionLabel from "./SectionLabel";
import MacroBar from "./MacroBar";
import Spinner from "./Spinner";
import { MACRO_TARGETS } from "../constants";

export default function ResultCard({ result, onLog, isLogging }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(result);
  useEffect(()=>{ setDraft(result); setEditing(false); }, [result]);
  if (!result) return null;
  const view = editing ? draft : result;
  const setField = (k, v) => setDraft(d => ({ ...d, [k]: Math.max(0, parseInt(v)||0) }));

  return (
    <div className="bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border border-(--border-light) transition-shadow duration-300 hover:shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <SectionLabel text="Analysis Result" />
        <button onClick={()=>setEditing(e=>!e)} className="text-[10px] bg-(--accent-bg) text-(--accent) px-2 py-0.5 rounded-full font-semibold shadow-[0_0_8px_var(--accent-bg)] hover:opacity-80">
          {editing ? 'Editing…' : `AI Estimated${view.estimated_grams ? ` · ${view.estimated_grams}g` : ''}`} · tap to correct
        </button>
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
          {editing ? (
            <input type="number" value={draft.calories} onChange={e=>setField('calories', e.target.value)} className="w-20 text-right text-xl font-black text-(--accent) bg-(--bg-hover) border border-(--border-light) rounded-lg px-1" />
          ) : (
            <p className="text-xl sm:text-2xl font-black text-(--accent)">{view.calories}</p>
          )}
          <p className="text-[10px] text-(--text-muted) uppercase tracking-wide">kcal</p>
        </div>
      </div>

      {/* Macro bars (horizontal) — editable when correcting */}
      <div className="flex flex-col gap-3 mb-5 sm:mb-6">
        {editing ? (
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">Protein (g)<input type="number" value={draft.protein} onChange={e=>setField('protein', e.target.value)} className="w-full mt-1 px-2 py-1 rounded-lg bg-(--bg-hover) border border-(--border-light) text-(--text-primary)" /></label>
            <label className="text-xs">Carbs (g)<input type="number" value={draft.carbs} onChange={e=>setField('carbs', e.target.value)} className="w-full mt-1 px-2 py-1 rounded-lg bg-(--bg-hover) border border-(--border-light) text-(--text-primary)" /></label>
            <label className="text-xs">Fat (g)<input type="number" value={draft.fat} onChange={e=>setField('fat', e.target.value)} className="w-full mt-1 px-2 py-1 rounded-lg bg-(--bg-hover) border border-(--border-light) text-(--text-primary)" /></label>
            <label className="text-xs">Grams<input type="number" value={draft.estimated_grams||''} onChange={e=>setField('estimated_grams', e.target.value)} className="w-full mt-1 px-2 py-1 rounded-lg bg-(--bg-hover) border border-(--border-light) text-(--text-primary)" /></label>
          </div>
        ) : (
          <>
            <MacroBar label="Protein" value={Math.round(view.protein)} unit="g" color="#60a5fa" pct={(view.protein / MACRO_TARGETS.protein) * 100} />
            <MacroBar label="Carbs" value={Math.round(view.carbs)} unit="g" color="var(--accent)" pct={(view.carbs / MACRO_TARGETS.carbs) * 100} />
            <MacroBar label="Fat" value={Math.round(view.fat)} unit="g" color="#f97316" pct={(view.fat / MACRO_TARGETS.fat) * 100} />
          </>
        )}
        {!editing && view.estimated_grams && (()=>{ const m=view.protein*4+view.carbs*4+view.fat*9; const d=Math.abs(m-view.calories); const ok=d<=2 || d/view.calories<=0.05; return <p className="text-[10px] text-(--text-muted)">~{view.estimated_grams}g estimated · {ok ? `✓ macro math` : `macro math ≈${m} kcal · tap to correct`}</p>;})()}
      </div>

      <button
        onClick={() => onLog(editing ? draft : result)}
        disabled={isLogging}
        className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-(--bg-hover) hover:bg-(--accent-bg) hover:text-(--accent) text-(--text-primary) border border-(--border-light) transition-all duration-200 touch-manipulation disabled:opacity-50 active:scale-[0.98] hover:shadow-sm"
      >
        {isLogging ? <span className="flex items-center justify-center gap-2"><Spinner /> Saving...</span> : editing ? "✓ Log corrected meal" : "+ Log This Meal"}
      </button>
      {editing && <button onClick={()=>{setDraft(result); setEditing(false);}} className="w-full mt-2 text-xs text-(--text-muted) underline">Cancel edit</button>}
    </div>
  );
}