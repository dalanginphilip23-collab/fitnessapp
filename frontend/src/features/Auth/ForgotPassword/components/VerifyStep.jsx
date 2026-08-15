import { ErrorBox, SubmitBtn } from './FormAtoms';
import OtpInput from './OtpInput';

export default function VerifyStep({
  email, otp, setOtp, error, loading, resendTimer,
  clearError, onSubmit, onResend, onBack,
}) {
  return (
    <>
      <h2 className="font-['Bebas_Neue',sans-serif] text-[28px] tracking-[0.04em] text-[#e5e2e1] mb-1">CHECK YOUR EMAIL</h2>
      <p className="text-[12px] text-[#c4c9b0]/50 tracking-[0.02em] mb-1 leading-relaxed">
        A 6-digit code was sent to
      </p>
      <p className="text-[13px] font-semibold text-[#c7f248] mb-6 truncate">{email}</p>
      <form onSubmit={onSubmit}>
        {error && <ErrorBox msg={error} />}
        <div className="mb-6">
          <label className="block text-[10px] font-semibold tracking-[0.25em] uppercase mb-4 text-[#c4c9b0]/50">
            Verification Code
          </label>
          <OtpInput value={otp} onChange={(v) => { setOtp(v); clearError(); }} />
        </div>
        <div className="flex items-center justify-between mb-5">
          <span className="text-[11px] text-[#c4c9b0]/35">Didn't receive it?</span>
          <button
            type="button"
            onClick={onResend}
            disabled={resendTimer > 0 || loading}
            className={`text-[11px] font-semibold transition-colors duration-200 ${resendTimer > 0 ? 'text-white/20 cursor-not-allowed' : 'text-[#acd52b] hover:text-[#c7f248] cursor-pointer'}`}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
          </button>
        </div>
        <SubmitBtn loading={loading} label="Verify Code" disabled={otp.replace(/\D/g, '').length < 6} />
      </form>
      <button
        type="button"
        onClick={onBack}
        className="w-full mt-3 text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 text-center py-1"
      >
        ← Use a different email
      </button>
    </>
  );
}
