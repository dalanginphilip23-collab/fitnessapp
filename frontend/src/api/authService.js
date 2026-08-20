import api from './client';

// Shared auth API helpers. Everything here rides the session cookie.

// GET /api/auth/me — returns the HTTP status + parsed body so callers can
// decide how to react (redirect vs. show an inline error) on their own terms.
export const fetchMe = () => api('/api/auth/me');

export const handleLogout = async () => {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('vitalis_user');
    window.location.href = '/login';
  }
};