import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp, resetPassword } from '../services/forgotPasswordService';
import { getPasswordStrength } from '../utils/passwordStrength';

/**
 * Owns all ForgotPassword flow state and handlers.
 * Extracted verbatim (same behavior) from the original ForgotPassword.jsx page.
 */
export function useForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [focused, setFocused] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const clearError = () => setError('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); clearError();
    try {
      await sendOtp(email);
      setStep(1);
      setResendTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.replace(/\D/g, '').length < 6) return setError('Enter the full 6-digit code.');
    setLoading(true); clearError();
    try {
      const data = await verifyOtp(email, otp);
      setResetToken(data.resetToken);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true); clearError();
    try {
      await sendOtp(email);
      setOtp('');
      setResendTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPw) return setError('Passwords do not match.');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true); clearError();
    try {
      await resetPassword(email, resetToken, newPassword);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = getPasswordStrength(newPassword);

  return {
    step, setStep,
    email, setEmail,
    otp, setOtp,
    newPassword, setNewPassword,
    confirmPw, setConfirmPw,
    showPw, setShowPw,
    loading,
    error,
    resendTimer,
    focused, setFocused,
    done,
    pwStrength,
    clearError,
    handleSendOtp,
    handleVerifyOtp,
    handleResend,
    handleReset,
  };
}
