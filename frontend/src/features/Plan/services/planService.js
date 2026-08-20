import api from '../../../api/client';
import { fetchMe } from '../../../api/authService';

// Training blueprint API helpers. All requests ride the session cookie.

export { fetchMe };

export async function fetchPlans(userId) {
  const { ok, data } = await api(`/api/plans/${userId}`);
  if (!ok) throw new Error('Failed to fetch plans');
  return data;
}

export async function enrollInPlan(userId, planId) {
  const { ok, data } = await api('/api/plans/enroll', {
    method: 'POST',
    body: { userId, planId },
  });
  if (!ok) {
    console.warn('Enroll warning:', data?.error);
    return;
  }
  return data;
}

export async function fetchTracker(planId, userId) {
  const [content, progress] = await Promise.all([
    api(`/api/plans/content/${planId}`),
    api(`/api/plans/progress/${userId}/${planId}`),
  ]);
  return [content.data, progress.data];
}

export async function completeDay(userId, planId, dayNumber) {
  await api('/api/plans/progress/complete', {
    method: 'POST',
    body: { userId, planId, dayNumber },
  });
}