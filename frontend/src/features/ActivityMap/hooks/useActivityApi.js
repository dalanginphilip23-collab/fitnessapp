import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/port';

const formatTime = (seconds) => {
  const s = parseInt(seconds) || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
};

export const useActivityApi = ({ userId, activeTab, showToast, setRunAnalysis, onSaveSuccess }) => {
  const [isSaving, setIsSaving]             = useState(false);
  const [history, setHistory]               = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError]     = useState(null);
  const [stats, setStats]                   = useState(null);
  const [statsLoading, setStatsLoading]     = useState(false);
  const [statsError, setStatsError]         = useState(null);

  // Feed (friends' + own shared activities)
  const [feed, setFeed]                     = useState([]);
  const [feedLoading, setFeedLoading]       = useState(false);
  const [feedError, setFeedError]           = useState(null);

  // Saved pins
  const [pins, setPins]                     = useState([]);
  const [pinsLoading, setPinsLoading]       = useState(false);

  // Last saved activity (carries the share token for share links)
  const [lastSaved, setLastSaved]           = useState(null);

  const fetchHistory = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHistory(await res.json().then(d => Array.isArray(d) ? d : []));
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      if (!silent) setHistoryLoading(false);
    }
  }, [userId]);

  const fetchStats = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity/stats/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
    } catch (err) {
      setStatsError(err.message);
    } finally {
      if (!silent) setStatsLoading(false);
    }
  }, [userId]);

  const fetchFeed = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setFeedLoading(true);
    setFeedError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity/feed/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFeed(await res.json().then(d => Array.isArray(d) ? d : []));
    } catch (err) {
      setFeedError(err.message);
    } finally {
      if (!silent) setFeedLoading(false);
    }
  }, [userId]);

  const deleteFeedPost = useCallback(async (postId) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity/feed/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFeed(prev => prev.filter(p => p.post_id !== postId));
      showToast('Post removed from feed');
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error');
    }
  }, [userId, showToast]);

  // ─── Saved pins ────────────────────────────────────────────────────────────
  const fetchPins = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setPinsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity/pins/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPins(await res.json().then(d => Array.isArray(d) ? d : []));
    } catch (err) {
      showToast(`⚠ Could not load pins — ${err.message}`, 'error');
    } finally {
      if (!silent) setPinsLoading(false);
    }
  }, [userId, showToast]);

  const addPin = useCallback(async ({ name, latitude, longitude }) => {
    if (!userId) { showToast('⚠ Not logged in', 'error'); return null; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity/pins/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, latitude, longitude }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      setPins(prev => [data.pin, ...prev]);
      showToast('📍 Pin saved');
      return data.pin;
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error');
      return null;
    }
  }, [userId, showToast]);

  const deletePin = useCallback(async (pin) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity/pins/${pin.id}/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      setPins(prev => prev.filter(p => p.id !== pin.id));
      showToast('Pin removed');
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error');
    }
  }, [userId, showToast]);

  // ─── Save ──────────────────────────────────────────────────────────────────
  const handleSaveActivity = async (opts = {}) => {
    const {
      finishedMetricsRef, finishedPathRef, finishedSplitsRef,
      type = 'run', title = null, placeName = null,
      isPublic = false, postToFeed = false, caption = null,
      onSaved,
    } = opts;

    if (!userId) { showToast('⚠ Not logged in', 'error'); return; }
    setIsSaving(true);
    try {
      const m = finishedMetricsRef.current;
      const res = await fetch(`${API_BASE_URL}/api/activity/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          type,
          title,
          placeName,
          isPublic,
          postToFeed,
          caption,
          duration: m.time,
          distance: parseFloat((m.distance || 0).toFixed(2)),
          pace: m.pace,
          calories: m.calories,
          route: finishedPathRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);

      setLastSaved({
        id: data.activityId,
        shareToken: data.shareToken,
        type,
        title: title || defaultTitle(type),
        placeName,
        route: finishedPathRef.current,
      });

      onSaved?.({
        id: data.activityId,
        shareToken: data.shareToken,
        type,
        title: title || defaultTitle(type),
        placeName,
        createdAt: new Date().toISOString(),
        metrics: { ...m },
        route: finishedPathRef.current,
        isPublic,
      });

      // AI run analysis after save
      const aiRes = await fetch(`${API_BASE_URL}/api/ai/run-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          run: {
            distance: parseFloat((m.distance || 0).toFixed(2)),
            duration: formatTime(m.time),
            pace:     m.pace,
            calories: m.calories,
            splits:   finishedSplitsRef.current,
          },
        }),
      });
      const aiData = await aiRes.json();
      if (aiData && !aiData.error) {
        setRunAnalysis(aiData);
      }

      showToast('✓ Activity saved!');
      fetchHistory(true);
      fetchStats(true);
      fetchFeed(true);

      // ✅ Reset the map/run view after successful save
      onSaveSuccess?.();

    } catch (err) {
      showToast(`⚠ Save failed — ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      showToast('Activity deleted');
      fetchHistory();
      fetchStats(true);
      fetchFeed(true);
    } catch (err) {
      showToast(`⚠ Delete failed — ${err.message}`, 'error');
    }
  };

  // Auto-fetch when tab changes
  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'stats')   fetchStats();
    if (activeTab === 'feed')    fetchFeed();
  }, [activeTab, fetchHistory, fetchStats, fetchFeed]);

  return {
    isSaving,
    history,
    historyLoading,
    historyError,
    stats,
    statsLoading,
    statsError,
    fetchHistory,
    fetchStats,
    handleSaveActivity,
    handleDelete,
    feed,
    feedLoading,
    feedError,
    fetchFeed,
    deleteFeedPost,
    pins,
    pinsLoading,
    fetchPins,
    addPin,
    deletePin,
    lastSaved,
    setLastSaved,
  };
};

function defaultTitle(type) {
  const hour = new Date().getHours();
  const labels = { run: 'Run', walk: 'Walk', jog: 'Jog', hike: 'Hike' };
  const label = labels[type] || 'Run';
  if (hour < 12) return `Morning ${label}`;
  if (hour < 18) return `Afternoon ${label}`;
  return `Evening ${label}`;
}
