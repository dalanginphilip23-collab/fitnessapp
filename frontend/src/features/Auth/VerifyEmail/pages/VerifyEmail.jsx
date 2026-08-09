import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useVerifyEmail } from '../hooks/useVerifyEmail';

const ACCENT        = '#8BC34A';
const ACCENT_BORDER = 'rgba(139, 195, 74, 0.22)';
const ACCENT_TINT   = 'rgba(139, 195, 74, 0.06)';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { status, message, retry } = useVerifyEmail(token);

  return (
    <div
      data-theme="dark"
      className="relative min-h-screen min-h-[100dvh] w-full bg-[#0e0e0e] font-['DM_Sans'] text-[#e5e2e1] overflow-x-hidden"
    >
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
        @keyframes vitalis-modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes vitalis-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .v-modal-card {
          animation: vitalis-modal-in 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .v-content {
          opacity: 0;
          animation: vitalis-fade-in 0.5s ease 0.15s forwards;
        }
      `}</style>

      <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1800&q=80&auto=format&fit=crop')] bg-cover bg-[center_30%] brightness-[0.28] saturate-[0.7]" />
      <div className="vitalis-vignette fixed inset-0 z-[1]" />
      <div className="vitalis-grid fixed inset-0 z-[2]" />

      <div className="relative z-10 flex items-center justify-center min-h-screen min-h-[100dvh] px-4 py-8">
        <div
          className="v-modal-card relative w-full max-w-[420px] bg-[#121210]/80 backdrop-blur-[32px] saturate-[140%] rounded-[20px] sm:rounded-[24px] p-7 sm:p-10 text-center overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]"
          style={{ border: `1px solid ${ACCENT_BORDER}` }}
        >
          <div className="vitalis-scan-bar" />

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: ACCENT }}>
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-[#161f00] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                <path d="M3 12h3l3-8 4 16 3-10 2 2h3" />
              </svg>
            </div>
            <span className="font-['Bebas_Neue'] text-[22px] tracking-[0.12em] text-[#e5e2e1]">VITALIS</span>
          </div>

          <div className="v-content">
            {status === 'verifying' && (
              <>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${ACCENT}1a`, border: `1px solid ${ACCENT_BORDER}` }}>
                  <div className="vitalis-spinner w-6 h-6" style={{ borderColor: `${ACCENT}cc`, borderTopColor: 'transparent' }} />
                </div>
                <h2 className="font-['Bebas_Neue'] text-[26px] sm:text-3xl tracking-wider text-[#e5e2e1] mb-2 uppercase">Verifying...</h2>
                <p className="text-[12px] text-[#c4c9b0]/60 leading-relaxed">
                  Confirming your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${ACCENT}1a`, border: `1px solid ${ACCENT_BORDER}` }}>
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" style={{ color: ACCENT }} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-['Bebas_Neue'] text-[26px] sm:text-3xl tracking-wider text-[#e5e2e1] mb-2 uppercase">Email Verified!</h2>
                <p className="text-[12px] text-[#c4c9b0]/60 mb-7 sm:mb-8 leading-relaxed">{message}</p>
                <Link
                  to="/login"
                  className="block w-full text-[#161f00] font-bold text-[11px] tracking-[0.2em] uppercase p-3.5 sm:p-4 rounded-xl transition-all active:scale-95 hover:bg-[#9CCC65]"
                  style={{ backgroundColor: ACCENT }}
                >
                  Go to Login
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-red-500/10 border border-red-500/20">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" style={{ color: '#f87171' }} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  </svg>
                </div>
                <h2 className="font-['Bebas_Neue'] text-[26px] sm:text-3xl tracking-wider text-[#e5e2e1] mb-2 uppercase">Link Issue</h2>
                <p className="text-[12px] text-[#c4c9b0]/60 mb-7 sm:mb-8 leading-relaxed">{message}</p>
                {token && (
                  <button
                    onClick={retry}
                    className="w-full bg-white/5 border border-white/10 rounded-xl text-[11px] font-semibold tracking-widest uppercase p-3.5 sm:p-4 hover:bg-white/10 transition-colors text-[#e5e2e1] mb-3"
                  >
                    Try Again
                  </button>
                )}
                <Link
                  to="/login"
                  className="block w-full text-[#161f00] font-bold text-[11px] tracking-[0.2em] uppercase p-3.5 sm:p-4 rounded-xl transition-all active:scale-95 hover:bg-[#9CCC65]"
                  style={{ backgroundColor: ACCENT }}
                >
                  Go to Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
