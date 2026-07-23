import { Link } from 'react-router-dom';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { StepBar, EmailStep, VerifyStep, ResetStep, DoneCard } from '../components';

const ForgotPassword = () => {
  const fp = useForgotPassword();

  return (
    <div data-theme="dark" className="min-h-screen flex items-center justify-center font-['DM_Sans',sans-serif] text-[#e5e2e1] overflow-hidden relative bg-[#0e0e0e]">
      <div className="bg-image fixed inset-0 z-0" />
      <div className="bg-vignette fixed inset-0 z-10" />
      <div className="bg-grid fixed inset-0 z-20" />

      <div className="relative z-30 w-full flex items-center justify-center p-[40px_20px]">
        {fp.done ? (
          <DoneCard />
        ) : (
          <div className="glass-card w-full max-w-[420px] border border-[#c7f248]/12 rounded-[20px] p-[40px_38px] relative overflow-hidden">
            <div className="scan-bar absolute left-0 right-0 top-0 h-[1px] rounded-t-[20px]" />

            <div className="flex items-center gap-2.5 mb-7">
              <div className="w-[34px] h-[34px] bg-[#c7f248] rounded-lg flex items-center justify-center">
                <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h3l3-8 4 16 3-10 2 2h3" stroke="#161f00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-['Bebas_Neue',sans-serif] text-[21px] tracking-[0.12em] text-[#e5e2e1]">VITALIS</span>
            </div>

            <StepBar current={fp.step} />

            {fp.step === 0 && (
              <EmailStep
                email={fp.email} setEmail={fp.setEmail}
                error={fp.error} loading={fp.loading}
                focused={fp.focused} setFocused={fp.setFocused}
                clearError={fp.clearError}
                onSubmit={fp.handleSendOtp}
              />
            )}

            {fp.step === 1 && (
              <VerifyStep
                email={fp.email}
                otp={fp.otp} setOtp={fp.setOtp}
                error={fp.error} loading={fp.loading}
                resendTimer={fp.resendTimer}
                clearError={fp.clearError}
                onSubmit={fp.handleVerifyOtp}
                onResend={fp.handleResend}
                onBack={() => { fp.setStep(0); fp.setOtp(''); fp.clearError(); }}
              />
            )}

            {fp.step === 2 && (
              <ResetStep
                newPassword={fp.newPassword} setNewPassword={fp.setNewPassword}
                confirmPw={fp.confirmPw} setConfirmPw={fp.setConfirmPw}
                showPw={fp.showPw} setShowPw={fp.setShowPw}
                error={fp.error} loading={fp.loading}
                focused={fp.focused} setFocused={fp.setFocused}
                pwStrength={fp.pwStrength}
                clearError={fp.clearError}
                onSubmit={fp.handleReset}
              />
            )}

            <div className="mt-6 text-center text-[12px] text-[#c4c9b0]/45">
              Remember it?{' '}
              <Link to="/login" className="text-[#acd52b] font-semibold ml-1 no-underline transition-colors duration-200 hover:text-[#c7f248]">
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
