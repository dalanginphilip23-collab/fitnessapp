import api from '../../../api/client';
import { fetchMe } from '../../../api/authService';

// Virtual Clinic API helpers. All requests ride the session cookie.

export { fetchMe };

export async function createClinicSession(userId, doctorName) {
  const { ok, data } = await api('/api/clinic/session', {
    method: 'POST',
    body: { userId, doctorName },
  });
  if (!ok) throw new Error(data?.error || 'Session creation failed');
  return data;
}

export async function sendClinicMessage({ sessionId, message, doctorName, doctorSpecialty }) {
  const { ok, data } = await api('/api/clinic/message', {
    method: 'POST',
    body: { sessionId, message, doctorName, doctorSpecialty },
  });
  if (!ok) throw new Error(data?.error || 'Failed');
  return data;
}

export async function getClinicMessages(sessionId) {
  const { ok, data } = await api(`/api/clinic/messages/${sessionId}`);
  if (!ok) throw new Error(data?.error || 'Failed to load messages');
  return data;
}

export async function deleteClinicMessages(sessionId) {
  const { ok } = await api(`/api/clinic/messages/${sessionId}`, { method: 'DELETE' });
  if (!ok) throw new Error('Failed to reset chat');
}