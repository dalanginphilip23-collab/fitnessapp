import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';

const ACCENT        = '#8FBF63';
const ACCENT_HOVER  = '#9DCB72';
const ACCENT_BORDER = 'rgba(143, 191, 99, 0.22)';
const ACCENT_TINT   = 'rgba(143, 191, 99, 0.05)';

const GOALS = [
  'Peak Metabolic Efficiency',
  'Muscle Hypertrophy',
  'Fat Loss Protocol',
  'Endurance & VO2 Max',
  'Athletic Performance',
  'Recovery Optimization',
];

// Simple inline eye / eye-off icons — matches the ones added to Login.jsx.
// If your project already uses lucide-react elsewhere, swap these for
// <Eye /> and <EyeOff /> from 'lucide-react' instead.
const EyeIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5C5 19.5 1.5 12 1.5 12a20.86 20.86 0 0 1 4.22-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4.5c7 0 10.5 7.5 10.5 7.5a20.83 20.83 0 0 1-2.42 3.6M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <path d="M1.5 1.5l21 21" />
  </svg>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name:     '',
    email:    '',
    password: '',
    goal:     'Peak Metabolic Efficiency',
  });
  const [focused, setFocused] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error, showSuccessModal, handleRegister, handleModalConfirm } = useRegister();

  const filledFields = [formData.name, formData.email, formData.password].filter(Boolean).length;
  const progressPct  = Math.round((filledFields / 3) * 100);

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <div
      className="relative min-h-screen min-h-[100dvh] w-full bg-(--bg-primary) font-['DM_Sans'] text-(--text-primary) overflow-x-hidden"
    >

      <style>{`
        .vitalis-vignette {
          background: radial-gradient(ellipse at center, transparent 30%, var(--bg-primary) 100%);
        }
        .vitalis-grid {
          background-image:
            linear-gradient(${ACCENT_TINT} 1px, transparent 1px),
            linear-gradient(90deg, ${ACCENT_TINT} 1px, transparent 1px);
          background-size: 32px 32px;
        }
        @media (min-width: 640px) {
          .vitalis-grid { background-size: 48px 48px; }
        }
        .vitalis-scan-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${ACCENT}, transparent);
          border-radius: 999px;
          animation: vitalis-scan 3s ease-in-out infinite;
          opacity: 0.6;
        }
        @keyframes vitalis-scan {
          0%   { transform: translateX(-100%); opacity: 0; }
          20%  { opacity: 0.6; }
          80%  { opacity: 0.6; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .vitalis-spinner {
          width: 14px; height: 14px;
          border: 2px solid #161f00;
          border-top-color: transparent;
          border-radius: 50%;
          animation: vitalis-spin 0.7s linear infinite;
        }
        @keyframes vitalis-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes vitalis-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes vitalis-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes vitalis-fade-left {
          from { opacity: 0; transform: translateX(-22px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes vitalis-scale-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes vitalis-modal-in {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .v-hero-eyebrow {
          opacity: 0;
          animation: vitalis-fade-left 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
        }
        .v-hero-h1 {
          opacity: 0;
          animation: vitalis-fade-left 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s forwards;
        }
        .v-hero-sub {
          opacity: 0;
          animation: vitalis-fade-left 0.6s cubic-bezier(0.22,1,0.36,1) 0.45s forwards;
        }
        .v-hero-goals {
          opacity: 0;
          animation: vitalis-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.6s forwards;
        }
        .v-card {
          opacity: 0;
          animation: vitalis-scale-in 0.75s cubic-bezier(0.22,1,0.36,1) 0.15s forwards;
        }
        .v-card-logo     { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.42s forwards; }
        .v-card-progress { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.52s forwards; }
        .v-card-title    { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.62s forwards; }
        .v-card-sub      { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.70s forwards; }
        .v-card-field1   { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.78s forwards; }
        .v-card-field2   { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.86s forwards; }
        .v-card-field3   { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.94s forwards; }
        .v-card-field4   { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.02s forwards; }
        .v-card-btn      { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.12s forwards; }
        .v-card-footer   { opacity: 0; animation: vitalis-fade-in 0.4s ease            1.22s forwards; }
        .v-modal-card {
          animation: vitalis-modal-in 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .goal-select-custom {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238FBF63' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 38px !important;
        }
      `}</style>

      {/* Layered Backgrounds */}
      <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1800&q=80&auto=format&fit=crop')] bg-cover bg-[center_30%] brightness-[0.28] saturate-[0.7]" />
      <div className="vitalis-vignette fixed inset-0 z-[1]" />
      <div className="vitalis-grid fixed inset-0 z-[2]" />

      {/* ── SUCCESS MODAL ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div
            className="v-modal-card relative w-full max-w-[400px] bg-(--bg-card)/95 backdrop-blur-[32px] saturate-[140%] rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 text-center overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]"
            style={{ border: `1px solid ${ACCENT_BORDER}` }}
          >
            <div className="vitalis-scan-bar" />
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6"
              style={{ backgroundColor: `${ACCENT}1a`, border: `1px solid ${ACCENT_BORDER}` }}
            >
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" style={{ color: ACCENT }} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-['Bebas_Neue'] text-[26px] sm:text-3xl tracking-wider text-(--text-primary) mb-2 uppercase">Identity Encrypted</h2>
            <p className="text-[11px] sm:text-[12px] text-(--text-secondary) tracking-wider mb-6 sm:mb-8 leading-relaxed uppercase">
              Your clinical athlete profile has been successfully initialized into the Vitalis Core.
            </p>
            <button
              onClick={handleModalConfirm}
              className="w-full text-[#161f00] font-bold text-[11px] tracking-[0.2em] uppercase p-3.5 sm:p-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ backgroundColor: ACCENT }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = ACCENT_HOVER}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = ACCENT}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
              </svg>
              Go Back to Login
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full min-h-screen min-h-[100dvh] grid grid-cols-1 lg:grid-cols-[1fr_480px]">

        {/* Left Hero Panel — desktop only */}
        <div className="hidden lg:flex flex-col justify-center p-14 gap-4">
          <span className="v-hero-eyebrow text-[11px] font-semibold tracking-[0.35em] uppercase opacity-80" style={{ color: ACCENT }}>
            Vitalis Performance OS
          </span>
          <h1 className="v-hero-h1 font-['Bebas_Neue'] text-[clamp(52px,5.5vw,82px)] leading-[0.95] tracking-wider">
            BUILD<br />
            YOUR<br />
            <span style={{ color: ACCENT }}>ATHLETE</span><br />
            PROFILE.
          </h1>
          <p className="v-hero-sub text-[13px] text-(--text-secondary) max-w-[320px] leading-relaxed font-light mt-1">
            Choose your goal, sync your biometrics, and let the AI engine build a program around your biology.
          </p>

          <div className="v-hero-goals flex flex-wrap gap-2 mt-5 pt-6 border-t border-(--border-light)">
            {GOALS.map(g => (
              <span
                key={g}
                className="text-[10px] font-semibold tracking-[0.12em] uppercase py-[5px] px-3 rounded-full"
                style={{ border: `1px solid ${ACCENT_BORDER}`, color: `${ACCENT}80`, backgroundColor: ACCENT_TINT }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Right Glass Panel */}
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:p-8 min-h-screen min-h-[100dvh] lg:min-h-0">
          <div
            className="v-card relative w-full max-w-[400px] bg-(--bg-card)/80 backdrop-blur-[32px] saturate-[140%] rounded-[20px] p-6 sm:p-8 md:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] my-auto"
            style={{ border: `1px solid ${ACCENT_BORDER}` }}
          >

            <div className="vitalis-scan-bar" />

            {/* Logo */}
            <div className="v-card-logo flex items-center gap-3 mb-6">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: ACCENT }}>
                <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] fill-none stroke-[#161f00] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                  <path d="M3 12h3l3-8 4 16 3-10 2 2h3" />
                </svg>
              </div>
              <span className="font-['Bebas_Neue'] text-[20px] sm:text-[22px] tracking-[0.12em] text-(--text-primary)">VITALIS</span>
            </div>

            {/* Progress */}
            <div className="v-card-progress flex justify-between items-center mb-2">
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-(--text-muted)">Profile Setup</span>
              <span className="font-['Bebas_Neue'] text-[16px] leading-none" style={{ color: ACCENT }}>{progressPct}%</span>
            </div>
            <div className="v-card-progress h-[2px] bg-(--border-light) rounded-full mb-6 sm:mb-8 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ width: `${progressPct}%`, backgroundColor: ACCENT, boxShadow: `0 0 8px ${ACCENT}66` }}
              />
            </div>

            <h2 className="v-card-title font-['Bebas_Neue'] text-[26px] sm:text-[32px] tracking-wider leading-none mb-1.5 text-(--text-primary)">CREATE IDENTITY</h2>
            <p className="v-card-sub text-xs text-(--text-secondary) tracking-wide mb-6 sm:mb-8">Initialize your clinical athlete profile.</p>

            <form onSubmit={(e) => handleRegister(e, formData)} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-semibold tracking-widest uppercase p-2.5 text-center">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="v-card-field1 relative">
                <label
                  className="block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors"
                  style={{ color: focused === 'name' ? ACCENT : 'var(--text-secondary)' }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full bg-(--input-bg) border border-(--input-border) rounded-xl text-sm p-3 sm:p-3.5 outline-none transition-all placeholder:text-(--input-placeholder) text-(--text-primary)"
                  style={{
                    borderColor: focused === 'name' ? `${ACCENT}80` : undefined,
                    backgroundColor: focused === 'name' ? `${ACCENT}0d` : undefined,
                  }}
                  placeholder="Your name"
                  required
                  value={formData.name}
                  onChange={update('name')}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                />
              </div>

              {/* Email */}
              <div className="v-card-field2 relative">
                <label
                  className="block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors"
                  style={{ color: focused === 'email' ? ACCENT : 'var(--text-secondary)' }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full bg-(--input-bg) border border-(--input-border) rounded-xl text-sm p-3 sm:p-3.5 outline-none transition-all placeholder:text-(--input-placeholder) text-(--text-primary)"
                  style={{
                    borderColor: focused === 'email' ? `${ACCENT}80` : undefined,
                    backgroundColor: focused === 'email' ? `${ACCENT}0d` : undefined,
                  }}
                  placeholder="athlete@vitalis.io"
                  required
                  value={formData.email}
                  onChange={update('email')}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                />
              </div>

              {/* Password */}
              <div className="v-card-field3 relative">
                <label
                  className="block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors"
                  style={{ color: focused === 'password' ? ACCENT : 'var(--text-secondary)' }}
                >
                  Password
                </label>
                {/* Wrapping div is relative so the eye toggle button can be
                    absolutely positioned inside the input on the right side. */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-(--input-bg) border border-(--input-border) rounded-xl text-sm p-3 sm:p-3.5 pr-11 outline-none transition-all placeholder:text-(--input-placeholder) text-(--text-primary)"
                    style={{
                      borderColor: focused === 'password' ? `${ACCENT}80` : undefined,
                      backgroundColor: focused === 'password' ? `${ACCENT}0d` : undefined,
                    }}
                    placeholder="••••••••••••"
                    required
                    value={formData.password}
                    onChange={update('password')}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    tabIndex={-1}
                    className="absolute right-0 top-0 h-full w-11 flex items-center justify-center text-(--text-muted) hover:text-(--text-secondary) transition-colors"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-[18px] h-[18px]" />
                    ) : (
                      <EyeIcon className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Goal */}
              <div className="v-card-field4 relative">
                <label
                  className="block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors"
                  style={{ color: focused === 'goal' ? ACCENT : 'var(--text-secondary)' }}
                >
                  Primary Goal
                </label>
                <select
                  className="goal-select-custom w-full bg-(--input-bg) border border-(--input-border) rounded-xl text-sm p-3 sm:p-3.5 outline-none cursor-pointer appearance-none transition-all text-(--text-primary)"
                  style={{
                    borderColor: focused === 'goal' ? `${ACCENT}80` : undefined,
                    backgroundColor: focused === 'goal' ? `${ACCENT}0d` : undefined,
                  }}
                  value={formData.goal}
                  onChange={update('goal')}
                  onFocus={() => setFocused('goal')}
                  onBlur={() => setFocused('')}
                >
                  {GOALS.map(g => (
                    <option className="bg-(--bg-card) text-(--text-primary)" key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="v-card-btn group relative w-full text-[#161f00] font-bold text-[11px] tracking-[0.25em] uppercase p-3.5 sm:p-4 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2"
                style={{ backgroundColor: ACCENT }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = ACCENT_HOVER; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = ACCENT; }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                {loading ? (
                  <><div className="vitalis-spinner" /> Initializing...</>
                ) : (
                  <>Initiate Optimization <span className="text-lg">→</span></>
                )}
              </button>
            </form>

            <div className="v-card-footer mt-6 sm:mt-7 text-center text-xs text-(--text-muted)">
              Already have an account?
              <Link
                to="/login"
                className="font-semibold ml-1 transition-colors"
                style={{ color: `${ACCENT}cc` }}
                onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                onMouseLeave={e => e.currentTarget.style.color = `${ACCENT}cc`}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;