import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/ui/Icon";
import Modal from "../../../components/ui/Modal";
import SectionLabel from "./SectionLabel";
import Spinner from "./Spinner";
import { suggestPlan } from "../services/nutritionService";
import { PLAN_TAG_ICONS } from "../constants";

export default function AISuggestion({ meal, onClose, userId }) {
  const navigate = useNavigate();

  const [suggestion, setSuggestion] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [decision,   setDecision]   = useState(null);

  useEffect(() => {
    if (!meal || !userId) return;

    const reset = () => {
      setSuggestion(null);
      setError(null);
      setDecision(null);
      setLoading(true);
    };

    const id = setTimeout(reset, 0);

    suggestPlan(userId, meal)
      .then((data) => setSuggestion(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    return () => clearTimeout(id);
  }, [meal, userId]);

  const handleAcceptPlan = () => {
    if (!suggestion?.recommended_plan) return;
    setDecision("accepted");
    navigate(`/dashboard/plans?planId=${suggestion.recommended_plan.id}`);
  };

  if (!meal) return null;

  let inner;

  if (loading) {
    inner = (
      <div className="bg-linear-to-br from-(--bg-tertiary) to-(--bg-card) rounded-2xl p-4 sm:p-5 border border-(--accent-border)">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-(--accent-bg) flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <SectionLabel text="AI Coach — Burn It Off" />
          </div>
          <div className="w-1.5 h-1.5 bg-(--accent) rounded-full animate-pulse" />
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <Spinner />
            <p className="text-(--text-muted) text-xs">Finding the best workout for this meal…</p>
          </div>
        </div>
      </div>
    );
  } else if (error) {
    inner = (
      <div className="bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border border-(--border-light) relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-(--bg-hover) transition-colors">
          <Icon name="close" className="text-(--text-muted) text-sm" />
        </button>
        <SectionLabel text="AI Coach — Burn It Off" />
        <p className="text-(--text-muted) text-xs">⚠️ {error}</p>
      </div>
    );
  } else if (!suggestion) {
    inner = null;
  } else {
    inner = (
      <div className="bg-linear-to-br from-(--bg-tertiary) to-(--bg-card) rounded-2xl p-4 sm:p-5 border border-(--accent-border) relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-(--bg-hover) transition-colors">
          <Icon name="close" className="text-(--text-muted) text-sm" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-(--accent-bg) flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <SectionLabel text="AI Coach — Burn It Off" />
        </div>

        <div className="bg-(--accent-bg) rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-(--text-muted) text-[9px] uppercase tracking-wider">Meal Logged</p>
              <p className="text-(--text-primary) font-bold text-sm">{suggestion.food_name}</p>
            </div>
            <div className="text-right">
              <p className="text-(--text-muted) text-[9px] uppercase tracking-wider">Calories</p>
              <p className="text-(--accent) font-black text-xl">{suggestion.calories}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-3 mb-4 border-l-2 border-(--accent)">
          <p className="text-(--text-secondary) text-xs leading-relaxed">💡 {suggestion.message}</p>
        </div>

        {suggestion.recommended_plan ? (
          <div className="rounded-xl border border-(--accent-border) bg-(--accent-bg) p-3 mb-3">
            <p className="text-(--text-muted) text-[9px] uppercase tracking-wider mb-2">
              {suggestion.recommended_source === "marketplace"
                ? "🆕 Suggested plan — not enrolled yet"
                : "⭐ Best plan to burn this meal"}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-(--bg-hover) flex items-center justify-center text-lg shrink-0">
                {PLAN_TAG_ICONS[suggestion.recommended_plan.tag] ?? "⚡"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-(--text-primary) font-bold text-sm truncate">{suggestion.recommended_plan.title}</p>
                <p className="text-(--text-muted) text-[9px]">
                  {suggestion.recommended_plan.intensity} · {suggestion.recommended_plan.target_focus}
                </p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-(--accent) text-[#131313] shrink-0">
                {suggestion.recommended_plan.tag}
              </span>
            </div>

            {suggestion.estimated_minutes != null && (
              <p className="text-(--accent) text-[10px] font-bold mt-2">
                ⏱️ ~{suggestion.estimated_minutes} min of this workout would help burn off this meal
              </p>
            )}

            <p className="text-(--text-muted) text-[9px] mt-2 leading-relaxed">{suggestion.reasoning}</p>

            {decision === "accepted" ? (
              <p className="text-[10px] font-semibold text-(--accent) mt-3">
                ✓ Opening {suggestion.recommended_plan.title}…
              </p>
            ) : decision === "declined" ? (
              <div className="flex items-center justify-between gap-2 mt-3">
                <p className="text-(--text-muted) text-[10px]">No problem — keep it up!</p>
                <button onClick={() => setDecision(null)} className="text-[10px] font-semibold text-(--accent) hover:underline shrink-0">
                  Show again
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAcceptPlan}
                  className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-(--accent) text-[#131313] transition-colors touch-manipulation"
                >
                  Yes, show me this plan
                </button>
                <button
                  onClick={() => setDecision("declined")}
                  className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-(--bg-hover) text-(--text-muted) transition-colors touch-manipulation"
                >
                  No thanks
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-(--accent-bg) border border-(--accent-border) rounded-xl p-3 mb-3">
            <p className="text-(--accent) text-[10px] font-semibold mb-2">
              💡 Enroll in a training plan to get personalized workout suggestions!
            </p>
            <p className="text-(--text-muted) text-[9px] leading-relaxed">{suggestion.reasoning}</p>
          </div>
        )}

        <button
          onClick={() => navigate(suggestion.has_enrolled_plans ? "/dashboard/plans?tab=my-plans" : "/dashboard/plans")}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold border border-(--accent-border) text-(--accent) bg-(--accent-bg) hover:bg-(--accent) hover:text-[#131313] transition-all mb-3"
        >
          <Icon name="fitness_center" className="text-sm" fill={1} />
          {suggestion.has_enrolled_plans ? "View My Plans" : "Browse Plans"}
          <Icon name="arrow_forward" className="text-sm" />
        </button>

        <div className="bg-(--bg-hover) rounded-lg p-2 text-center">
          <p className="text-(--text-muted) text-[8px]">
            💪 Balance your intake with activity. Consistency is key!
          </p>
        </div>
      </div>
    );
  }

  if (!inner) return null;

  // Centered modal overlay, scroll-locked while open. Backdrop only closes
  // when there is something to dismiss (loading states are guarded).
  return (
    <Modal
      open={Boolean(meal)}
      onClose={onClose}
      closeOnBackdrop={Boolean(error || suggestion)}
    >
      {inner}
    </Modal>
  );
}