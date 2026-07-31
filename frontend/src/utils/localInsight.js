const KEY_PREFIX = 'vitalis_local_insight_';

const todayKey = () => new Date().toLocaleDateString('en-CA');

// Client-side fallback when the backend /api/ai/clinical-analysis endpoint is
// unavailable (e.g. the deployed server is an older build). Persists a
// same-day insight built from the user's actual saved numbers so the
// "Clinical Assistant" widget on the Dashboard still reflects fresh data.
// Once the backend generates a real AI insight, this fallback is ignored.
export const saveLocalFallbackInsight = (userId, insight) => {
  if (!userId || !insight) return;
  try {
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify({ date: todayKey(), insight }));
  } catch (err) {
    console.error('Local insight save failed:', err);
  }
};

export const readLocalFallbackInsight = (userId) => {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(KEY_PREFIX + userId);
    if (!raw) return null;
    const { date, insight } = JSON.parse(raw);
    if (date !== todayKey() || !insight) return null;
    return insight;
  } catch {
    return null;
  }
};
