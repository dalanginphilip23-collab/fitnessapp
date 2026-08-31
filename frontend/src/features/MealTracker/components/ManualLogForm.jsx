import { useState, useEffect } from "react";
import Icon from "../../../components/ui/Icon";
import Modal from "../../../components/ui/Modal";
import InputField from "./InputField";
import { EMPTY_FORM, MEAL_TYPES, EMOJI_OPTIONS } from "../constants";

export default function ManualLogForm({ onLog, shouldOpen = 0, onClose }) {
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [open,      setOpen]      = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [errors,    setErrors]    = useState({});

  useEffect(() => {
    if (shouldOpen > 0) setOpen(true);
  }, [shouldOpen]);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Meal name is required";
    if (!form.calories || isNaN(form.calories) || Number(form.calories) <= 0) e.calories = "Enter a valid calorie amount";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onLog({
      food_name: form.name.trim(),
      emoji:     form.emoji,
      calories:  Number(form.calories),
      protein:   Number(form.protein) || 0,
      carbs:     Number(form.carbs)   || 0,
      fat:       Number(form.fat)     || 0,
      mealType:  form.mealType,
      image_url: form.image_url || "",
    });
    setForm(EMPTY_FORM);
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      zIndex={100}
      className="animate-fade-in"
    >
      <div className="bg-(--bg-card) border border-(--border-medium) w-full max-w-md rounded-[28px] p-6 md:p-8 relative">
        <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-(--bg-card) z-10 pb-2">
          <div>
            <h2 className="text-xl font-bold text-(--text-primary)">Log Meal</h2>
            <p className="text-[10px] md:text-[11px] text-(--text-muted) uppercase tracking-wider mt-1">Manual Entry</p>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-(--bg-hover) hover:bg-(--bg-active) text-(--text-muted) hover:text-(--text-primary) transition-all duration-200 hover:scale-110"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="space-y-4 md:space-y-6">

          <div>
            <label className="block text-[11px] text-(--text-muted) mb-1.5">Meal Name *</label>
            <div className="flex gap-2">
              <div className="relative shrink-0">
                <button
                  onClick={() => setEmojiOpen((v) => !v)}
                  className="w-10 h-10 rounded-xl bg-(--bg-hover) hover:bg-(--bg-active) flex items-center justify-center text-lg border border-(--border-light) touch-manipulation"
                >
                  {form.emoji}
                </button>
                {emojiOpen && (
                  <div className="absolute top-12 left-0 z-20 bg-(--bg-tertiary) border border-(--border-medium) rounded-xl p-2 grid grid-cols-5 gap-1 shadow-xl w-max max-w-50">
                    {EMOJI_OPTIONS.map((em) => (
                      <button key={em} onClick={() => { setField("emoji", em); setEmojiOpen(false); }} className="w-8 h-8 rounded-lg hover:bg-(--bg-hover) flex items-center justify-center text-base touch-manipulation">
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="e.g. Chicken Adobo"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className={`w-full h-10 bg-(--bg-hover) rounded-xl px-3 text-sm text-(--text-primary) border outline-none focus:border-(--accent)/50 transition-colors ${errors.name ? "border-red-500/60" : "border-(--border-light)"}`}
                />
                {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-(--text-muted) mb-1.5">Meal Type</label>
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {MEAL_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setField("mealType", type)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all touch-manipulation ${
                    form.mealType === type
                      ? "bg-(--accent-bg) text-(--accent) border-(--accent-border)"
                      : "bg-(--bg-hover) text-(--text-muted) border-(--border-light) hover:border-(--border-medium)"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <InputField
            label="Calories (kcal) *"
            type="number"
            placeholder="e.g. 450"
            value={form.calories}
            onChange={(e) => setField("calories", e.target.value)}
            error={errors.calories}
          />

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[{ key: "protein", label: "Protein (g)" }, { key: "carbs", label: "Carbs (g)" }, { key: "fat", label: "Fat (g)" }].map(({ key, label }) => (
              <InputField key={key} label={label} type="number" placeholder="0" value={form[key]} onChange={(e) => setField(key, e.target.value)} />
            ))}
          </div>

          <button onClick={handleSubmit} className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-(--accent) text-[#131313] transition-all duration-200 touch-manipulation active:scale-[0.98] hover:shadow-lg hover:shadow-(--accent)/20">
            + Add to Log
          </button>
        </div>
      </div>
    </Modal>
  );
}