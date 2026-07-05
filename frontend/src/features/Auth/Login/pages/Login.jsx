import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';

const Login = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [focused,  setFocused]  = useState('');

  const { error, loading, handleSubmit, loginWithGoogle } = useLogin();

  return (
    <div
      data-theme="dark"
      className="relative min-h-screen min-h-[100dvh] w-full bg-[var(--bg-primary)] font-['DM_Sans'] text-[var(--text-primary)] overflow-x-hidden"
    >

      <style>{`
        .vitalis-vignette {
          background: radial-gradient(ellipse at center, transparent 30%, var(--bg-primary) 100%);
        }
        .vitalis-grid {
          background-image:
            linear-gradient(var(--accent-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--accent-border) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        @media (min-width: 640px) {
          .vitalis-grid { background-size: 48px 48px; }
        }
        .vitalis-scan-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
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
          <span className="v-hero-eyebrow text-[11px] font-semibold tracking-[0.35em] uppercase text-[var(--accent)] opacity-80">
            Vitalis Performance OS
          </span>
          <h1 className="v-hero-h1 font-['Bebas_Neue'] text-[clamp(56px,6vw,88px)] leading-[0.95] tracking-wider">
            TRAIN<br />
            HARDER.<br />
            <span className="text-[var(--accent)]">RECOVER</span><br />
            SMARTER.
          </h1>
          <p className="v-hero-sub text-[13px] text-[var(--text-primary)]/45 max-w-[320px] leading-relaxed font-light mt-1">
            AI-powered biometric tracking that adapts to your body in real time. Every rep, every rest, optimized.
          </p>

          <div className="v-hero-stats flex gap-8 mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-col">
              <span className="font-['Bebas_Neue'] text-3xl text-[var(--accent)] leading-none">12K+</span>
              <span className="text-[10px] tracking-widest uppercase text-white/30">Athletes</span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Bebas_Neue'] text-3xl text-[var(--accent)] leading-none">98%</span>
              <span className="text-[10px] tracking-widest uppercase text-white/30">Recovery</span>
            </div>
          </div>
        </div>

        {/* Right Glass Panel */}
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:p-8 min-h-screen min-h-[100dvh] lg:min-h-0">
          <div className="v-card relative w-full max-w-[400px] bg-[#121210]/65 backdrop-blur-[32px] saturate-[140%] border border-[var(--accent-border)] rounded-[20px] p-6 sm:p-8 md:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] my-auto">

            <div className="vitalis-scan-bar" />

            {/* Logo */}
            <div className="v-card-logo flex items-center gap-3 mb-7 sm:mb-9">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--accent)] rounded-lg flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] fill-none stroke-[#161f00] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                  <path d="M3 12h3l3-8 4 16 3-10 2 2h3" />
                </svg>
              </div>
              <span className="font-['Bebas_Neue'] text-[20px] sm:text-[22px] tracking-[0.12em]">VITALIS</span>
            </div>

            <h2 className="v-card-title font-['Bebas_Neue'] text-[26px] sm:text-[32px] tracking-wider leading-none mb-1.5">ACCESS PORTAL</h2>
            <p className="v-card-sub text-xs text-[#c4c9b0]/55 tracking-wide mb-6 sm:mb-8">Enter credentials to synchronize biometrics.</p>

            <form onSubmit={(e) => handleSubmit(e, { email, password })} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-semibold tracking-widest uppercase p-2.5 text-center">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="v-card-field1 relative">
                <label className={`block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors ${focused === 'email' ? 'text-[var(--accent)]' : 'text-white/50'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-sm p-3 sm:p-3.5 outline-none transition-all focus:border-[var(--accent)]/50 focus:bg-[var(--accent)]/5 focus:ring-4 focus:ring-[var(--accent)]/10 placeholder:text-white/10"
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
                <label className={`block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors ${focused === 'password' ? 'text-[var(--accent)]' : 'text-white/50'}`}>
                  Password
                </label>
                <input
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-sm p-3 sm:p-3.5 outline-none transition-all focus:border-[var(--accent)]/50 focus:bg-[var(--accent)]/5 focus:ring-4 focus:ring-[var(--accent)]/10 placeholder:text-white/10"
                  placeholder="••••••••••••"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                />
              </div>

              <div className="v-card-forgot flex justify-end -mt-2 sm:-mt-3">
                <a href="/reset-password" className="text-[10px] font-semibold tracking-widest uppercase text-[var(--accent)]/70 hover:text-[var(--accent)] transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="v-card-btn group relative w-full bg-[var(--accent)] text-[#161f00] font-bold text-[11px] tracking-[0.25em] uppercase p-3.5 sm:p-4 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2"
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
                className="v-card-google w-full bg-white/5 border border-white/10 rounded-xl text-[11px] font-semibold tracking-widest uppercase p-3 sm:p-3.5 flex items-center justify-center gap-2.5 hover:bg-white/10 transition-colors"
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
              <a href="/register" className="text-[var(--accent)]/80 font-semibold ml-1 hover:text-[var(--accent)] transition-colors">Register</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;