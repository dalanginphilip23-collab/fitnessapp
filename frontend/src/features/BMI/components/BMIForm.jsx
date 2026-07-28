import { BMI_SCALE_LEGEND, ACTIVITY_LEVELS } from "../constants/bmiConstants";
import { Icon } from '../../../components';

const inputCls =
  "w-full bg-(--input-bg) border border-(--border-medium) rounded-xl px-4 py-3 text-sm outline-none " +
  "focus:border-(--accent) focus:bg-(--bg-active) transition-all text-(--text-primary) placeholder:text-(--text-secondary)";

const optionStyle = {
  backgroundColor: "var(--bg-secondary)",
  color: "var(--text-primary)",
};

export default function BMIForm({
  weight, setWeight, height, setHeight, age, setAge,
  gender, setGender, activityLevel, setActivityLevel,
  error, isAnalyzing, onCalculate,
}) {
  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="bg-(--bg-tertiary) border border-(--border-light) rounded-[20px] p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-lg bg-(--accent-bg) flex items-center justify-center">
            <Icon name="calculate" className="text-(--accent) text-[16px]" />
          </div>
          <h2 className="text-(--accent) font-black uppercase text-[10px] tracking-[0.25em]">
            Metrics Input
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-(--text-muted) font-bold mb-1.5 block">Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-(--text-muted) font-bold mb-1.5 block">Height (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="0" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-widest text-(--text-muted) font-bold mb-1.5 block">
              Age <span className="text-(--text-disabled) normal-case font-medium">(needed for calorie estimate)</span>
            </label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter age" className={inputCls} />
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-widest text-(--text-muted) font-bold mb-1.5 block">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}
              className="w-full bg-(--input-bg) border border-(--border-medium) rounded-xl px-4 py-3 text-sm outline-none focus:border-(--accent) text-(--text-primary) appearance-none cursor-pointer transition-all">
              <option value="male" style={optionStyle}>Male</option>
              <option value="female" style={optionStyle}>Female</option>
              <option value="other" style={optionStyle}>Other / Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-widest text-(--text-muted) font-bold mb-1.5 block">
              Activity Level <span className="text-(--text-disabled) normal-case font-medium">(needed for calorie estimate)</span>
            </label>
            <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full bg-(--input-bg) border border-(--border-medium) rounded-xl px-4 py-3 text-sm outline-none focus:border-(--accent) text-(--text-primary) appearance-none cursor-pointer transition-all">
              {ACTIVITY_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id} style={optionStyle}>{lvl.label} — {lvl.desc}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-(--error) text-xs font-semibold">{error}</p>}

          <button
            onClick={onCalculate}
            disabled={isAnalyzing}
            className="w-full py-3.5 bg-(--accent) text-[#0a0a0a] font-black uppercase text-[11px] tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-(--accent)/20 border-none cursor-pointer"
          >
            {isAnalyzing ? "Analyzing..." : "Process Biometrics"}
          </button>
        </div>
      </div>

      <div className="bg-(--bg-tertiary) border border-(--border-light) rounded-[20px] p-5">
        <h3 className="text-(--accent) font-black uppercase text-[10px] tracking-[0.25em] mb-4">BMI Scale</h3>
        <div className="space-y-2">
          {BMI_SCALE_LEGEND.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-xs text-(--text-muted)">{item.label}</span>
              </div>
              <span className="text-xs text-(--text-disabled) font-mono">{item.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}