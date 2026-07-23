export const ErrorBox = ({ msg }) => (
  <div className="bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-semibold tracking-[0.1em] uppercase py-2.5 px-3.5 mb-5 text-center">
    {msg}
  </div>
);

export const SubmitBtn = ({ loading, label, disabled = false }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="btn-primary w-full bg-[#c7f248] text-[#161f00] font-bold text-[11px] tracking-[0.25em] uppercase p-[15px] rounded-[10px] cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
  >
    {loading ? (
      <><div className="w-[13px] h-[13px] rounded-full animate-spin border-2 border-black border-t-transparent" /> Processing...</>
    ) : (
      <>{label} <span style={{ fontSize: 15 }}>→</span></>
    )}
  </button>
);
