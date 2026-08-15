// NOTE: this feature historically used its own fallback base URL
// (localhost:8000) distinct from the app-wide config/port.js default
// (localhost:3000). Preserved as-is to avoid changing runtime behavior.
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function post(url, body) {
  const res = await fetch(`${API}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

export const sendOtp = (email) => post('/api/forgot-password/send-otp', { email });

export const verifyOtp = (email, otp) => post('/api/forgot-password/verify-otp', { email, otp });

export const resetPassword = (email, resetToken, newPassword) =>
  post('/api/forgot-password/reset-password', { email, resetToken, newPassword });
