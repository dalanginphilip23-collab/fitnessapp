// hooks/useLogin.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '../../../../config/port';
import { useAuth } from '../../../../hooks/useAuth';

export const useLogin = () => {
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate  = useNavigate();
  const { setUser } = useAuth();

  // ─────────────────────────────────────────────
  // Helper: normalize any login response into the
  // same shape that /api/auth/me returns so
  // AuthContext always has a consistent user object.
  //
  // /me returns:      { id, name, email, avatar, goal }
  // /login returns:   { id, name, email, avatar, goal }
  // /google-login:    { id, name, email, avatar, goal }
  //
  // All three now match — just extract the fields.
  // ─────────────────────────────────────────────
  const normalizeUser = (data) => ({
    id:     data.id     || data.user?.id,
    name:   data.name   || data.user?.name,
    email:  data.email  || data.user?.email,
    avatar: data.avatar || data.user?.avatar,
    goal:   data.goal   || data.user?.goal,
  });

  const handleSubmit = async (e, { email, password }) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      const user = normalizeUser(data);
      if (!user.id) throw new Error('Login response did not include a user ID.');

      // FIX: store normalized user so shape always matches what /me returns
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (codeResponse) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ code: codeResponse.code }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server response was not JSON. Check backend console.');
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google synchronization failed.');

      const user = normalizeUser(data);
      if (!user.id) throw new Error('Google login response did not include a user ID.');

      // FIX: store normalized user — same shape as /me
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Login Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError:   () => setError('Google Authentication Interrupted.'),
    flow:      'auth-code',
  });

  return { error, loading, handleSubmit, loginWithGoogle };
};