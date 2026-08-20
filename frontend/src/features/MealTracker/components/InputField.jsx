export default function InputField({ label, type = "text", placeholder, value, onChange, error, className = "" }) {
  const base = `w-full h-10 bg-(--bg-hover) rounded-xl px-3 text-sm text-(--text-primary) border outline-none focus:border-(--accent)/50 transition-colors ${
    error ? "border-red-500/60" : "border-(--border-light)"
  } ${className}`;
  return (
    <div>
      {label && <label className="block text-[11px] text-(--text-muted) mb-1.5">{label}</label>}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} className={base} />
      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}