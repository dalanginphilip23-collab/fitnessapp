import { API_BASE_URL } from '../config/api';

// Shared JSON API client. All requests ride the session cookie and speak JSON.
// Returns a normalized { ok, status, data } envelope so callers can decide how
// to react to errors on their own terms (throw, fall back, or swallow).

const api = async (path, { method = 'GET', body, headers, ...rest } = {}) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
};

export default api;