import { useState, useEffect, useCallback } from 'react';
import { fetchMe, fetchPlans, enrollInPlan, fetchTracker, completeDay } from '../services/planService';

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
        const { ok, status, data } = await fetchMe();

        if (!ok) {
          console.warn(`/api/auth/me responded with status ${status}`);
          setAuthError(`Could not verify your session (status ${status}).`);
          setLoading(false);
          setAuthChecked(true);
          return;
        }

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
      setTrainingPlans(await fetchPlans(userId));
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
      await enrollInPlan(userId, planId);
      await fetchMarketplace();
    } catch (err) {
      console.error('Enrollment failed:', err);
    }
  };

  // ── Open the day tracker for a plan ───────────────────────────
  const startTracker = async (plan) => {
    setDetailPlan(null);
    try {
      const [content, progress] = await fetchTracker(plan.id, userId);
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
      await completeDay(userId, trackerPlan.id, dayNumber);
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