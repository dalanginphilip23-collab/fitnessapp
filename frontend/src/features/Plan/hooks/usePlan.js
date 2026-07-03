import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../../config/port';

const usePlans = () => {
  const [userId, setUserId]               = useState(null);
  const [authChecked, setAuthChecked]     = useState(false);
  const [authError, setAuthError]         = useState(null);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [loading, setLoading]             = useState(true);

  const [detailPlan,      setDetailPlan]      = useState(null);
  const [trackerPlan,     setTrackerPlan]     = useState(null);
  const [trackerContent,  setTrackerContent]  = useState([]);
  const [trackerProgress, setTrackerProgress] = useState([]);

  // ── Auth: get current user via cookie session ──────────────────
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
        });

        if (!res.ok) {
          console.warn(`/api/auth/me responded with status ${res.status}`);
          setAuthError(`Could not verify your session (status ${res.status}).`);
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        const data = await res.json();

        // The id might come back under a few different shapes depending
        // on how the auth route is implemented - try the common ones
        // instead of assuming `data.id`.
        const resolvedId =
          data?.id ?? data?.userId ?? data?.user?.id ?? data?.user?.userId ?? null;

        if (!resolvedId) {
          console.warn('Could not find a user id in /api/auth/me response:', data);
          setAuthError('Logged-in user id was missing from the server response.');
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        setUserId(resolvedId);
        setAuthChecked(true);
      } catch (err) {
        console.error('Auth error:', err);
        setAuthError('Could not reach the authentication endpoint.');
        setLoading(false);
        setAuthChecked(true);
      }
    };
    getUser();
  }, []);

  // ── Fetch all plans with enrollment status ─────────────────────
  const fetchMarketplace = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/plans/${userId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch plans');
      const data = await res.json();
      setTrainingPlans(data);
      setAuthError(null);
    } catch (err) {
      console.error('Marketplace Sync Error:', err);
      setAuthError('Could not load plans from the server.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMarketplace();
  }, [fetchMarketplace]);

  // ── Enroll in a plan ───────────────────────────────────────────
  const handleEnroll = async (planId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/plans/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, planId }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.warn('Enroll warning:', err.error);
        return;
      }
      await fetchMarketplace();
    } catch (err) {
      console.error('Enrollment failed:', err);
    }
  };

  // ── Open the day tracker for a plan ───────────────────────────
  const startTracker = async (plan) => {
    setDetailPlan(null);
    try {
      const [contentRes, progressRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/plans/content/${plan.id}`, {
          credentials: 'include',
        }),
        fetch(`${API_BASE_URL}/api/plans/progress/${userId}/${plan.id}`, {
          credentials: 'include',
        }),
      ]);
      const content  = await contentRes.json();
      const progress = await progressRes.json();
      setTrackerContent(content);
      setTrackerProgress(progress);
      setTrackerPlan(plan);
    } catch (err) {
      console.error('Tracker load error:', err);
    }
  };

  // ── Mark a day complete (optimistic update) ────────────────────
  const handleCompleteDay = async (dayNumber) => {
    // Optimistic update
    setTrackerProgress(prev => {
      const exists = prev.find(p => p.day_number === dayNumber);
      if (exists) {
        return prev.map(p =>
          p.day_number === dayNumber ? { ...p, is_completed: 1 } : p
        );
      }
      return [...prev, { day_number: dayNumber, is_completed: 1 }];
    });

    try {
      await fetch(`${API_BASE_URL}/api/plans/progress/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, planId: trackerPlan.id, dayNumber }),
      });
    } catch (err) {
      console.error('Complete day error:', err);
      // Rollback optimistic update on failure
      setTrackerProgress(prev =>
        prev.map(p =>
          p.day_number === dayNumber ? { ...p, is_completed: 0 } : p
        )
      );
    }
  };

  // ── Close tracker and refresh plans ───────────────────────────
  const closeTracker = () => {
    setTrackerPlan(null);
    setTrackerContent([]);
    setTrackerProgress([]);
    fetchMarketplace();
  };

  // ── Derived state ──────────────────────────────────────────────
  const enrolledCount = trainingPlans.filter(p => p.is_enrolled === 1).length;

  return {
    loading,
    authChecked,
    authError,
    trainingPlans,
    enrolledCount,
    detailPlan,
    trackerPlan,
    trackerContent,
    trackerProgress,
    setDetailPlan,
    handleEnroll,
    startTracker,
    handleCompleteDay,
    closeTracker,
  };
};

export default usePlans;