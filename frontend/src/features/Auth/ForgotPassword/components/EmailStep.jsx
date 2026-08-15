import { ErrorBox, SubmitBtn } from './FormAtoms';

export default function EmailStep({ email, setEmail, error, loading, focused, setFocused, clearError, onSubmit }) {
  return (
    <>
      <h2 className="font-['Bebas_Neue',sans-serif] text-[28px] tracking-[0.04em] text-[#e5e2e1] mb-1">RESET ACCESS</h2>
      <p className="text-[12px] text-[#c4c9b0]/50 tracking-[0.02em] mb-6 leading-relaxed">
        Enter the email linked to your account. We'll send you a 6-digit verification code.
      </p>
      <form onSubmit={onSubmit}>
        {error && <ErrorBox msg={error} />}
        <div className="mb-5">
          <label className={`block text-[10px] font-semibold tracking-[0.25em] uppercase mb-[7px] transition-colors duration-200 ${focused === 'email' ? 'text-[#c7f248]' : 'text-[#c4c9b0]/50'}`}>
            Email Address
          </label>
          <input
            type="email" required
            placeholder="athlete@vitalis.io"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError(); }}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
            className="w-full bg-white/5 border border-white/10 rounded-[10px] text-[#e5e2e1] text-[14px] p-[12px_15px] outline-none transition-all duration-200 placeholder:text-white/15 focus:border-[#c7f248]/45 focus:bg-[#c7f248]/[0.04] focus:ring-[3px] focus:ring-[#c7f248]/10 box-border"
          />
        </div>
        <SubmitBtn loading={loading} label="Send Verification Code" />
      </form>
    </>
  );
}
