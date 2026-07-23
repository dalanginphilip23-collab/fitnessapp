/**
 * Scores a password and returns a display descriptor, or null if empty.
 * Same scoring rules as the original inline IIFE in ForgotPassword.jsx.
 */
export function getPasswordStrength(password) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Weak', color: '#ef4444', pct: '33%' };
  if (score <= 3) return { label: 'Medium', color: '#f59e0b', pct: '66%' };
  return { label: 'Strong', color: '#c7f248', pct: '100%' };
}
