import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

const ACCENT        = '#8FBF63';
const ACCENT_HOVER  = '#9DCB72';
const ACCENT_BORDER = 'rgba(143, 191, 99, 0.22)';
const ACCENT_TINT   = 'rgba(143, 191, 99, 0.05)';

// Simple inline eye / eye-off icons so no extra icon package is required.
// If your project already uses lucide-react elsewhere, you can swap these
// for <Eye /> and <EyeOff /> from 'lucide-react' instead.
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

const Login = () => {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [focused,     setFocused]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { error, loading, handleSubmit, loginWithGoogle } = useLogin();

  return (
    <div
      data-theme="dark"
      className="relative min-h-screen min-h-[100dvh] w-full bg-[#0e0e0e] font-['DM_Sans'] text-[#e5e2e1] overflow-x-hidden"
    >

      {/* Back to landing button */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="fixed top-5 left-5 sm:top-8 sm:left-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-[11px] font-semibold tracking-widest uppercase text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
      >
        <span className="text-base leading-none">←</span>
        Back
      </button>

      <style>{`
        .vitalis-vignette {
          background: radial-gradient(ellipse at center, transparent 30%, #0e0e0e 100%);
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
        .v-hero-stats {
          opacity: 0;
          animation: vitalis-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.6s forwards;
        }
        .v-card {
          opacity: 0;
          animation: vitalis-scale-in 0.75s cubic-bezier(0.22,1,0.36,1) 0.15s forwards;
        }
        .v-card-logo    { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.5s  forwards; }
        .v-card-title   { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.62s forwards; }
        .v-card-sub     { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.70s forwards; }
        .v-card-field1  { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.80s forwards; }
        .v-card-field2  { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.90s forwards; }
        .v-card-forgot  { opacity: 0; animation: vitalis-fade-in 0.4s ease            0.98s forwards; }
        .v-card-btn     { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.05s forwards; }
        .v-card-divider { opacity: 0; animation: vitalis-fade-in 0.4s ease            1.15s forwards; }
        .v-card-google  { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.22s forwards; }
        .v-card-footer  { opacity: 0; animation: vitalis-fade-in 0.4s ease            1.35s forwards; }
      `}</style>

      {/* Layered Backgrounds */}
      <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1800&q=80&auto=format&fit=crop')] bg-cover bg-[center_30%] brightness-[0.28] saturate-[0.7]" />
      <div className="vitalis-vignette fixed inset-0 z-[1]" />
      <div className="vitalis-grid fixed inset-0 z-[2]" />

      <div className="relative z-10 w-full min-h-screen min-h-[100dvh] grid grid-cols-1 lg:grid-cols-[1fr_480px]">

        {/* Left Hero Panel — desktop only */}
        <div className="hidden lg:flex flex-col justify-center p-14 gap-4">
          <span className="v-hero-eyebrow text-[11px] font-semibold tracking-[0.35em] uppercase opacity-80" style={{ color: ACCENT }}>
            Vitalis Performance OS
          </span>
          <h1 className="v-hero-h1 font-['Bebas_Neue'] text-[clamp(56px,6vw,88px)] leading-[0.95] tracking-wider">
            TRAIN<br />
            HARDER.<br />
            <span style={{ color: ACCENT }}>RECOVER</span><br />
            SMARTER.
          </h1>
          <p className="v-hero-sub text-[13px] text-[#e5e2e1]/45 max-w-[320px] leading-relaxed font-light mt-1">
            AI-powered biometric tracking that adapts to your body in real time. Every rep, every rest, optimized.
          </p>

          <div className="v-hero-stats flex gap-8 mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-col">
              <span className="font-['Bebas_Neue'] text-3xl leading-none" style={{ color: ACCENT }}>12K+</span>
              <span className="text-[10px] tracking-widest uppercase text-white/30">Athletes</span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Bebas_Neue'] text-3xl leading-none" style={{ color: ACCENT }}>98%</span>
              <span className="text-[10px] tracking-widest uppercase text-white/30">Recovery</span>
            </div>
          </div>
        </div>

        {/* Right Glass Panel */}
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:p-8 min-h-screen min-h-[100dvh] lg:min-h-0">
          <div
            className="v-card relative w-full max-w-[400px] bg-[#121210]/65 backdrop-blur-[32px] saturate-[140%] rounded-[20px] p-6 sm:p-8 md:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] my-auto"
            style={{ border: `1px solid ${ACCENT_BORDER}` }}
          >

            <div className="vitalis-scan-bar" />

            {/* Logo */}
            <div className="v-card-logo flex items-center gap-3 mb-7 sm:mb-9">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: ACCENT }}>
                <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] fill-none stroke-[#161f00] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                  <path d="M3 12h3l3-8 4 16 3-10 2 2h3" />
                </svg>
              </div>
              <span className="font-['Bebas_Neue'] text-[20px] sm:text-[22px] tracking-[0.12em] text-[#e5e2e1]">VITALIS</span>
            </div>

            <h2 className="v-card-title font-['Bebas_Neue'] text-[26px] sm:text-[32px] tracking-wider leading-none mb-1.5 text-[#e5e2e1]">ACCESS PORTAL</h2>
            <p className="v-card-sub text-xs text-[#c4c9b0]/55 tracking-wide mb-6 sm:mb-8">Enter credentials to synchronize biometrics.</p>

            <form onSubmit={(e) => handleSubmit(e, { email, password })} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-semibold tracking-widest uppercase p-2.5 text-center">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="v-card-field1 relative">
                <label
                  className="block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors"
                  style={{ color: focused === 'email' ? ACCENT : 'rgba(255,255,255,0.5)' }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl text-sm p-3 sm:p-3.5 outline-none transition-all placeholder:text-white/10 text-[#e5e2e1]"
                  style={{
                    borderColor: focused === 'email' ? `${ACCENT}80` : undefined,
                    backgroundColor: focused === 'email' ? `${ACCENT}0d` : undefined,
                  }}
                  placeholder="athlete@vitalis.io"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                />
              </div>

              {/* Password */}
              <div className="v-card-field2 relative">
                <label
                  className="block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors"
                  style={{ color: focused === 'password' ? ACCENT : 'rgba(255,255,255,0.5)' }}
                >
                  Password
                </label>
                {/* Wrapping div is relative so the eye toggle button can be
                    absolutely positioned inside the input on the right side. */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl text-sm p-3 sm:p-3.5 pr-11 outline-none transition-all placeholder:text-white/10 text-[#e5e2e1]"
                    style={{
                      borderColor: focused === 'password' ? `${ACCENT}80` : undefined,
                      backgroundColor: focused === 'password' ? `${ACCENT}0d` : undefined,
                    }}
                    placeholder="••••••••••••"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    tabIndex={-1}
                    className="absolute right-0 top-0 h-full w-11 flex items-center justify-center text-white/35 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-[18px] h-[18px]" />
                    ) : (
                      <EyeIcon className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="v-card-forgot flex justify-end -mt-2 sm:-mt-3">
                <a
                  href="/reset-password"
                  className="text-[10px] font-semibold tracking-widest uppercase transition-colors"
                  style={{ color: `${ACCENT}b3` }}
                  onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                  onMouseLeave={e => e.currentTarget.style.color = `${ACCENT}b3`}
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="v-card-btn group relative w-full text-[#161f00] font-bold text-[11px] tracking-[0.25em] uppercase p-3.5 sm:p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2"
                style={{ backgroundColor: ACCENT }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = ACCENT_HOVER; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = ACCENT; }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                {loading ? (
                  <><div className="vitalis-spinner" /> Processing...</>
                ) : (
                  <>Initialize Session <span className="text-lg">→</span></>
                )}
              </button>

              <div className="v-card-divider flex items-center gap-3 py-1">
                <div className="flex-1 h-[1px] bg-white/5" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-white/20">or</span>
                <div className="flex-1 h-[1px] bg-white/5" />
              </div>

              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="v-card-google w-full bg-white/5 border border-white/10 rounded-2xl text-[11px] font-semibold tracking-widest uppercase p-3 sm:p-3.5 flex items-center justify-center gap-2.5 hover:bg-white/10 transition-colors text-[#e5e2e1]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="whitespace-nowrap">Continue with Google</span>
              </button>
            </form>

            <div className="v-card-footer mt-6 sm:mt-7 text-center text-xs text-[#c4c9b0]/45">
              Don't have an account?
              <a
                href="/register"
                className="font-semibold ml-1 transition-colors"
                style={{ color: `${ACCENT}cc` }}
                onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                onMouseLeave={e => e.currentTarget.style.color = `${ACCENT}cc`}
              >
                Register
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;