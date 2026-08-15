import { ErrorBox, SubmitBtn } from './FormAtoms';

export default function ResetStep({
  newPassword, setNewPassword,
  confirmPw, setConfirmPw,
  showPw, setShowPw,
  error, loading, focused, setFocused,
  pwStrength,
  clearError, onSubmit,
}) {
  return (
    <>
      <h2 className="font-['Bebas_Neue',sans-serif] text-[28px] tracking-[0.04em] text-[#e5e2e1] mb-1">NEW PASSWORD</h2>
      <p className="text-[12px] text-[#c4c9b0]/50 tracking-[0.02em] mb-6 leading-relaxed">
        Choose a strong password for your Vitalis account.
      </p>
      <form onSubmit={onSubmit}>
        {error && <ErrorBox msg={error} />}

        <div className="mb-4">
          <label className={`block text-[10px] font-semibold tracking-[0.25em] uppercase mb-[7px] transition-colors duration-200 ${focused === 'newpw' ? 'text-[#c7f248]' : 'text-[#c4c9b0]/50'}`}>
            New Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required minLength={8}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); clearError(); }}
              onFocus={() => setFocused('newpw')}
              onBlur={() => setFocused('')}
              className="w-full bg-white/5 border border-white/10 rounded-[10px] text-[#e5e2e1] text-[14px] p-[12px_44px_12px_15px] outline-none transition-all duration-200 placeholder:text-white/15 focus:border-[#c7f248]/45 focus:bg-[#c7f248]/[0.04] focus:ring-[3px] focus:ring-[#c7f248]/10 box-border"
            />
            <button type="button" onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
            >
              {showPw
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              }
            </button>
          </div>
          {pwStrength && (
            <div className="mt-2">
              <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: pwStrength.pct, background: pwStrength.color }} />
              </div>
              <p className="text-[10px] mt-1 font-semibold" style={{ color: pwStrength.color }}>{pwStrength.label}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className={`block text-[10px] font-semibold tracking-[0.25em] uppercase mb-[7px] transition-colors duration-200 ${focused === 'confirmpw' ? 'text-[#c7f248]' : 'text-[#c4c9b0]/50'}`}>
            Confirm Password
          </label>
          <input
            type="password" required
            placeholder="••••••••••••"
            value={confirmPw}
            onChange={(e) => { setConfirmPw(e.target.value); clearError(); }}
            onFocus={() => setFocused('confirmpw')}
            onBlur={() => setFocused('')}
            className={`w-full bg-white/5 border rounded-[10px] text-[#e5e2e1] text-[14px] p-[12px_15px] outline-none transition-all duration-200 placeholder:text-white/15 focus:ring-[3px] box-border
              ${confirmPw && newPassword !== confirmPw
                ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10'
                : 'border-white/10 focus:border-[#c7f248]/45 focus:bg-[#c7f248]/[0.04] focus:ring-[#c7f248]/10'
              }`}
          />
          {confirmPw && newPassword !== confirmPw && (
            <p className="text-[10px] text-red-400/70 mt-1.5 font-semibold">Passwords do not match</p>
          )}
        </div>

        <SubmitBtn loading={loading} label="Update Password" disabled={newPassword !== confirmPw || !newPassword} />
      </form>
    </>
  );
}
