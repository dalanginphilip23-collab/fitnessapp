import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../../../config/port';

const MISSING_TOKEN_MSG = 'This verification link is invalid.';

async function callVerifyApi(token) {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ token }),
  });
  const data = await response.json();
  return { ok: response.ok, message: data.message || 'Could not verify your email.' };
}

export const useVerifyEmail = (token) => {
  const [state, setState] = useState(() =>
    token
      ? { status: 'verifying', message: '' }
      : { status: 'error', message: MISSING_TOKEN_MSG },
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      const result = await callVerifyApi(token);
      if (cancelled) return;

      setState(
        result.ok
          ? { status: 'success', message: result.message || 'Your email has been verified.' }
          : { status: 'error', message: result.message },
      );
    })();

    return () => { cancelled = true; };
  }, [token]);

  const retry = useCallback(() => {
    setState({ status: 'verifying', message: '' });
    callVerifyApi(token).then((result) => {
      setState(
        result.ok
          ? { status: 'success', message: result.message || 'Your email has been verified.' }
          : { status: 'error', message: result.message },
      );
    });
  }, [token]);

  return { status: state.status, message: state.message, retry };
};
