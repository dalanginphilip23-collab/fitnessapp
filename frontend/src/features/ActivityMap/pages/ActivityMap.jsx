import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Circle } from 'react-leaflet';
import { Topbar } from '../../../components';
import SidebarAnalytics from '../../../components/layout/SidebarAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { API_BASE_URL } from '../../../config/port';
import 'leaflet/dist/leaflet.css';
import {
  RecenterMap, FitRoute, GpsBadge, HistoryTab, RouteReplay,
  RunAnalysisOverlay, RunControls, StatsPanel, StatsTab, FeedTab, Toast,
  SavedPinsLayer, ActivityCard, ActivityPanel, ActivityBottomSheet,
  ShareSheet, MAP_ICONS,
} from '../components';

import { useToast }       from './../hooks/useToast';
import { useGeolocation } from "./../hooks/useGeoLocation";
import { useRunTimer }    from './../hooks/useRunTimer';
import { useRunControls } from './../hooks/useRunControl';
import { useActivityApi } from './../hooks/useActivityApi';
import { useWindowWidth } from './../hooks/useWindowWidth';
import { useReverseGeocode } from './../hooks/useReverseGeocode';

// ─── Constants ───────────────────────────────────────────────────────────────

const FALLBACK_COORDS = [14.6760, 121.0437];

const TILE_URL_DARK   = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_URL_LIGHT  = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://carto.com/">CARTO</a>';

const OFFLINE_QUEUE_KEY = 'vitalis_offline_queue';

const MOBILE_TABS = ['run', 'history', 'stats', 'feed'];
const PANEL_TABS  = ['history', 'stats', 'feed'];

// ─── Offline queue helpers ────────────────────────────────────────────────────

const getOfflineQueue = () => {
  try { return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]'); }
  catch { return []; }
};

const pushToOfflineQueue = (payload) => {
  const queue = getOfflineQueue();
  queue.push({ payload, queuedAt: Date.now() });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

const clearOfflineQueue = () => localStorage.removeItem(OFFLINE_QUEUE_KEY);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (seconds) => {
  const s  = parseInt(seconds) || 0;
  const h  = Math.floor(s / 3600);
  const m  = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
};

// Normalize a DB row (history / feed) into the shape the card + share sheet use.
const activityToView = (row) => ({
  id: row.id ?? row.activity_id,
  type: row.type || 'run',
  title: row.title || null,
  placeName: row.place_name || null,
  createdAt: row.created_at || row.activity_created_at || row.posted_at || null,
  metrics: {
    time: row.duration || 0,
    distance: parseFloat(row.distance || 0),
    pace: row.pace || '–',
    calories: row.calories || 0,
  },
  route: Array.isArray(row.route) ? row.route : [],
  isPublic: !!row.is_public,
  shareToken: row.share_token || null,
});

// ─── Component ────────────────────────────────────────────────────────────────

const ActivityMap = () => {
  const { user } = useAuth();
  const USER_ID  = user?.id ?? null;

  const [activeTab,       setActiveTab]       = useState('run');   // mobile top strip
  const [panelTab,        setPanelTab]        = useState('history'); // desktop browse tab
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [runAnalysis,     setRunAnalysis]     = useState(null);
  const [isOnline,        setIsOnline]        = useState(navigator.onLine);
  const [pendingCount,    setPendingCount]    = useState(() => getOfflineQueue().length);
  const [isRecordingState, setIsRecordingState] = useState(false);
  const [finishedRun,     setFinishedRun]     = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Summary-card edit state
  const [editType,  setEditType]  = useState('run');
  const [editTitle, setEditTitle] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);

  // Sharing
  const [shareOpen,   setShareOpen]   = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [isSharing,   setIsSharing]   = useState(false);
  const [postToFeed,  setPostToFeed]  = useState(false);
  const [caption,     setCaption]     = useState('');
  const shareCardRef = useRef(null);

  // Saved pins
  const [addPinMode,  setAddPinMode]  = useState(false);

  const { isLargeScreen }    = useWindowWidth();
  const { toast, showToast } = useToast();
  const { isDark }           = useTheme();
  const tileUrl = isDark ? TILE_URL_DARK : TILE_URL_LIGHT;

  const { userLocation, startCoords, accuracy, locationStatus, mapCenter, path, setPath } =
    useGeolocation(isRecordingState);

  const { metrics, splits, resetMetrics } =
    useRunTimer(isRecordingState, locationStatus, setPath, path);

  const {
    isRecording, hasPaused, runFinished,
    finishedPathRef, finishedMetricsRef, finishedSplitsRef,
    handleStartRun, handlePauseResume, handleFinish, handleDiscard,
  } = useRunControls({ userLocation, startCoords, metrics, path, splits, resetMetrics, setPath });

  useEffect(() => { setIsRecordingState(isRecording); }, [isRecording]);

  // Snapshot finished-run refs into state so JSX reads values safely
  useEffect(() => {
    if (runFinished) {
      setFinishedRun({
        path:    finishedPathRef.current,
        metrics: finishedMetricsRef.current,
        splits:  finishedSplitsRef.current,
      });
    } else {
      setFinishedRun(null);
    }
  }, [runFinished, finishedPathRef, finishedMetricsRef, finishedSplitsRef]);

  const {
    isSaving, history, historyLoading, historyError,
    stats, statsLoading, statsError,
    feed, feedLoading, feedError,
    pins, fetchPins, addPin, deletePin,
    fetchHistory, fetchFeed, deleteFeedPost,
    handleSaveActivity, handleDelete,
  } = useActivityApi({
    userId: USER_ID,
    activeTab: isLargeScreen ? panelTab : activeTab,
    showToast,
    setRunAnalysis,
    onSaveSuccess: () => {
      handleDiscard(FALLBACK_COORDS);
      setFinishedRun(null);
      setSelectedActivity(null);
      setActiveTab('run');
      setEditTitle('');
      setEditIsPublic(false);
    },
  });

  // Load saved pins once
  useEffect(() => {
    if (USER_ID) fetchPins();
  }, [USER_ID, fetchPins]);

  // ─── View mode ────────────────────────────────────────────────────────────
  const viewMode = selectedActivity
    ? 'detail'
    : finishedRun && runFinished
      ? 'summary'
      : isRecording || hasPaused
        ? 'recording'
        : 'idle';

  // Reverse-geocode the starting point of a finished run for the card + save
  const finishStartCoords = (viewMode === 'summary' && finishedRun?.path?.[0]) || null;
  const { placeName: finishPlace } = useReverseGeocode(finishStartCoords);

  // ─── Offline queue flush ──────────────────────────────────────────────────

  const flushOfflineQueue = useCallback(async () => {
    const queue = getOfflineQueue();
    if (!queue.length || !USER_ID) return;

    const remaining = [];

    for (const item of queue) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/activity/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(item.payload),
        });
        if (!res.ok) remaining.push(item);
      } catch {
        remaining.push(item);
      }
    }

    if (remaining.length === 0) {
      clearOfflineQueue();
      setPendingCount(0);
      const synced = queue.length;
      showToast(`✓ ${synced} offline run${synced > 1 ? 's' : ''} synced!`);
      fetchFeed(true);
      fetchHistory(true);
    } else {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
      setPendingCount(remaining.length);
    }
  }, [USER_ID, showToast, fetchFeed, fetchHistory]);

  useEffect(() => {
    const goOnline  = async () => { setIsOnline(true); await flushOfflineQueue(); };
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [flushOfflineQueue]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleStart = useCallback(() => {
    setSelectedActivity(null);
    setAddPinMode(false);
    handleStartRun();
  }, [handleStartRun]);

  const handleOpenDetail = useCallback((row) => {
    setSelectedActivity(activityToView(row));
    setActiveTab('run');
  }, []);

  const handleMapPinClick = useCallback(async (coords) => {
    setAddPinMode(false);
    const name = window.prompt('Name this pin (e.g. Favorite trail):', 'Saved spot');
    if (name === null) return;
    await addPin({ name: name.trim() || 'Saved spot', latitude: coords[0], longitude: coords[1] });
  }, [addPin]);

  const buildSavePayload = useCallback(() => {
    if (!finishedRun) return null;
    return {
      userId: USER_ID,
      type: editType,
      title: editTitle.trim() || null,
      placeName: finishPlace || null,
      isPublic: editIsPublic,
      postToFeed,
      caption: caption.trim() || null,
      duration: finishedRun.metrics.time,
      distance: parseFloat((finishedRun.metrics.distance ?? 0).toFixed(2)),
      pace: finishedRun.metrics.pace,
      calories: finishedRun.metrics.calories,
      route: finishedRun.path,
    };
  }, [finishedRun, USER_ID, editType, editTitle, finishPlace, editIsPublic, postToFeed, caption]);

  const handleSave = useCallback(async ({ shareAfter = false } = {}) => {
    if (!finishedRun) return;

    if (!isOnline) {
      const payload = buildSavePayload();
      if (!payload) return;
      pushToOfflineQueue(payload);
      setPendingCount(getOfflineQueue().length);
      showToast('📶 Offline — saved locally, will sync when reconnected', 'warn');
      handleDiscard(FALLBACK_COORDS);
      setFinishedRun(null);
      return;
    }

    await handleSaveActivity({
      finishedMetricsRef,
      finishedPathRef,
      finishedSplitsRef,
      type: editType,
      title: editTitle.trim() || null,
      placeName: finishPlace || null,
      isPublic: editIsPublic,
      postToFeed,
      caption: caption.trim() || null,
      onSaved: (saved) => {
        if (shareAfter) {
          setShareTarget(saved);
          setShareOpen(true);
        }
      },
    });
  }, [
    finishedRun, isOnline, buildSavePayload, showToast, handleDiscard,
    handleSaveActivity, finishedMetricsRef, finishedPathRef, finishedSplitsRef,
    editType, editTitle, finishPlace, editIsPublic, postToFeed, caption,
  ]);

  const handleDiscardRun = useCallback(() => {
    handleDiscard(FALLBACK_COORDS);
    setFinishedRun(null);
  }, [handleDiscard]);

  const openShare = useCallback((target) => {
    setShareTarget(target);
    setShareOpen(true);
  }, []);

  const handleShareImage = useCallback(async (format = 'grid') => {
    if (!shareTarget) return;
    setIsSharing(true);
    try {
      const { captureShareImage, shareOrDownload } = await import('../utils/shareImage');
      // Give the card a moment to render its map tiles
      await new Promise((r) => setTimeout(r, 500));
      const node = shareCardRef.current;
      if (!node) throw new Error('Share card not ready');
      const { blob } = await captureShareImage(node);
      const filename = `vitalis-${format}-${shareTarget.type || 'activity'}.png`;
      await shareOrDownload({
        blob,
        filename,
        title: shareTarget.title || 'Vitalis activity',
        fallbackName: filename,
      });
    } catch (err) {
      showToast(`⚠ Could not generate image — ${err.message}`, 'error');
    } finally {
      setIsSharing(false);
    }
  }, [shareTarget, showToast]);

  const handleTogglePublic = useCallback(async (val) => {
    if (!shareTarget?.id) return;
    setShareTarget(prev => ({ ...prev, isPublic: val }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity/${shareTarget.id}/public`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: USER_ID, isPublic: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setShareTarget(prev => ({ ...prev, shareToken: prev.shareToken || data.shareToken }));
      showToast(val ? '🔗 Link sharing enabled' : 'Link sharing disabled');
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error');
    }
  }, [shareTarget, USER_ID, showToast]);

  const handlePostToFeed = useCallback(async () => {
    if (!shareTarget?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity/feed/${shareTarget.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: USER_ID, caption: caption.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      showToast('✓ Posted to feed');
      setPostToFeed(false);
      setCaption('');
      fetchFeed(true);
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error');
    }
  }, [shareTarget, USER_ID, caption, showToast, fetchFeed]);

  const handleShareDone = useCallback(() => {
    if (shareTarget?.id && postToFeed) handlePostToFeed();
    else fetchFeed(true);
    setShareOpen(false);
  }, [shareTarget, postToFeed, handlePostToFeed, fetchFeed]);

  const handleDeleteDetail = useCallback(async () => {
    if (!selectedActivity?.id) return;
    await handleDelete(selectedActivity.id);
    setSelectedActivity(null);
  }, [selectedActivity, handleDelete]);

  // ─── Session content (desktop panel top / mobile sheet) ──────────────────

  const summaryActions = (() => {
    if (viewMode === 'detail' && selectedActivity) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedActivity(null)}
            className="flex-1 border border-[var(--border-medium)] text-[var(--text-secondary)] rounded-full py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => handleDeleteDetail()}
            className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => openShare(selectedActivity)}
            className="flex-1 bg-[var(--accent)] text-black rounded-full py-2.5 text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">share</span>
            Share
          </button>
        </div>
      );
    }
    if (viewMode === 'summary') {
      return (
        <div className="flex gap-2">
          <button
            onClick={handleDiscardRun}
            disabled={isSaving}
            className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-40"
          >
            Discard
          </button>
          <button
            onClick={() => handleSave({ shareAfter: true })}
            disabled={isSaving}
            className="flex-1 bg-[var(--accent)] text-black rounded-full py-2.5 text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {isSaving && <span className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
            {isSaving ? 'Saving…' : 'Save & Share'}
          </button>
        </div>
      );
    }
    return null;
  })();

  const sessionContent = (() => {
    if (viewMode === 'detail' && selectedActivity) {
      return (
        <>
          <ActivityCard
            editable={false}
            type={selectedActivity.type}
            title={selectedActivity.title}
            placeName={selectedActivity.placeName}
            createdAt={selectedActivity.createdAt}
            metrics={selectedActivity.metrics}
            splits={[]}
            formatTime={formatTime}
          />
          <div className="mt-4">{summaryActions}</div>
        </>
      );
    }
    if (viewMode === 'summary' && finishedRun) {
      return (
        <>
          <ActivityCard
            editable
            type={editType}
            setType={setEditType}
            title={editTitle}
            setTitle={setEditTitle}
            placeName={finishPlace}
            createdAt={new Date()}
            metrics={finishedRun.metrics}
            splits={finishedRun.splits}
            formatTime={formatTime}
          />
          <div className="mt-4 flex flex-col gap-2">
            <label className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] cursor-pointer">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Post to feed</span>
              <input
                type="checkbox"
                checked={postToFeed}
                onChange={(e) => setPostToFeed(e.target.checked)}
                className="accent-[var(--accent)] w-4 h-4"
              />
            </label>
            {summaryActions}
          </div>
        </>
      );
    }
    if (viewMode === 'recording') {
      return (
        <StatsPanel metrics={metrics} splits={splits} formatTime={formatTime} isDesktop />
      );
    }
    // idle CTA
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-[var(--accent)] text-2xl">directions_run</span>
        </div>
        <p className="text-sm font-black italic tracking-tighter text-[var(--text-primary)]">Ready to move?</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed">
          Start tracking to record your route, pace and calories.
          Tap a spot on the map to save a location pin.
        </p>
        <button
          onClick={handleStart}
          className="mt-4 bg-[var(--accent)] text-black px-8 py-3 rounded-full font-black uppercase italic tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(139,195,74,0.25)] text-xs"
        >
          Start Activity
        </button>
      </div>
    );
  })();

  // ─── Map render ───────────────────────────────────────────────────────────

  const renderMap = () => {
    // Detail view of a saved activity
    if (viewMode === 'detail' && selectedActivity) {
      const route = selectedActivity.route;
      return (
        <div className="relative h-full w-full">
          <MapContainer
            center={route[0] ?? FALLBACK_COORDS}
            zoom={15}
            zoomControl={false}
            className="absolute inset-0 z-0"
          >
            <TileLayer url={tileUrl} attribution={TILE_ATTRIBUTION} />
            <FitRoute path={route} />
            {route.length >= 2 && (
              <>
                <Polyline positions={route} pathOptions={{ color: 'var(--accent)', weight: 5, opacity: 0.85 }} />
                <Marker position={route[0]} icon={MAP_ICONS.start} />
                <Marker position={route[route.length - 1]} icon={MAP_ICONS.finish} />
              </>
            )}
          </MapContainer>

          <GpsBadge locationStatus={locationStatus} accuracy={accuracy} />

          {!isLargeScreen && (
            <ActivityBottomSheet open label="Activity">
              {sessionContent}
            </ActivityBottomSheet>
          )}
        </div>
      );
    }

    // Just-finished run (replay + editable summary)
    if (viewMode === 'summary' && finishedRun) {
      return (
        <div className="relative h-full w-full">
          <MapContainer
            center={finishedRun.path[0] ?? FALLBACK_COORDS}
            zoom={15}
            zoomControl={false}
            className="absolute inset-0 z-0"
          >
            <TileLayer url={tileUrl} attribution={TILE_ATTRIBUTION} />
            <FitRoute path={finishedRun.path} />
            <RouteReplay fullPath={finishedRun.path} />
          </MapContainer>

          <GpsBadge locationStatus={locationStatus} accuracy={accuracy} />

          {!isLargeScreen && (
            <ActivityBottomSheet open label="Activity">
              {sessionContent}
            </ActivityBottomSheet>
          )}
        </div>
      );
    }

    // Idle / recording
    return (
      <div className="relative h-full w-full">
        <MapContainer
          center={mapCenter}
          zoom={16}
          zoomControl={false}
          className="absolute inset-0 z-0"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url={tileUrl} attribution={TILE_ATTRIBUTION} />
          {path.length > 1 && (
            <Polyline
              positions={path}
              pathOptions={{ color: 'var(--accent)', weight: 5, opacity: 0.85 }}
            />
          )}
          {userLocation && (
            <>
              {/* Accuracy confidence circle — shows the GPS uncertainty radius */}
              {accuracy != null && accuracy > 0 && (
                <Circle
                  center={userLocation}
                  radius={Math.max(accuracy, 15)}
                  pathOptions={{
                    color: 'var(--accent)',
                    weight: 1.5,
                    opacity: 0.4,
                    fillColor: 'var(--accent)',
                    fillOpacity: 0.12,
                    dashArray: '4 6',
                  }}
                />
              )}
              <Marker position={userLocation} icon={MAP_ICONS.location} />
            </>
          )}
          <SavedPinsLayer
            pins={pins}
            addMode={addPinMode}
            onMapClick={handleMapPinClick}
            onDeletePin={deletePin}
          />
          <RecenterMap
            coords={path}
            isRecording={isRecording}
            userLocation={userLocation}
          />
        </MapContainer>

        <GpsBadge locationStatus={locationStatus} accuracy={accuracy} />

        {locationStatus === 'denied' && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-[1000] bg-(--error-bg) border border-(--error) px-3 py-2 rounded-xl max-w-45">
            <p className="text-[9px] text-(--error) font-semibold leading-relaxed">
              Location denied. Enable in browser settings for real GPS.
            </p>
          </div>
        )}

        {/* Add pin toggle */}
        <div className="absolute bottom-24 md:bottom-6 left-3 sm:left-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={() => setAddPinMode(m => !m)}
            title={addPinMode ? 'Cancel — click the map to drop a pin' : 'Drop a saved location pin'}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
              addPinMode
                ? 'bg-[var(--accent)] text-black border-[var(--accent)] shadow-[0_0_20px_rgba(139,195,74,0.4)]'
                : 'bg-black/60 backdrop-blur-md text-[var(--text-primary)] border-[var(--border-medium)]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{addPinMode ? 'close' : 'add_location'}</span>
          </button>
        </div>

        {addPinMode && (
          <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-[1000] bg-black/70 backdrop-blur-md border border-[var(--accent-border)] px-4 py-2 rounded-xl">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">
              Tap the map to drop a pin
            </p>
          </div>
        )}

        <RunControls
          isRecording={isRecording}
          hasPaused={hasPaused}
          metricsTime={metrics.time}
          onStart={handleStart}
          onPauseResume={handlePauseResume}
          onFinish={handleFinish}
        />

        {!isLargeScreen && viewMode === 'recording' && (
          <StatsPanel
            metrics={metrics}
            splits={splits}
            formatTime={formatTime}
            isDesktop={false}
          />
        )}
      </div>
    );
  };

  const renderMobileList = () => {
    if (activeTab === 'history') {
      return (
        <HistoryTab
          history={history}
          historyLoading={historyLoading}
          historyError={historyError}
          formatTime={formatTime}
          onRefresh={fetchHistory}
          onDelete={handleDelete}
          onView={handleOpenDetail}
          onShare={openShare}
        />
      );
    }
    if (activeTab === 'stats') {
      return (
        <StatsTab
          stats={stats}
          statsLoading={statsLoading}
          statsError={statsError}
          formatTime={formatTime}
        />
      );
    }
    if (activeTab === 'feed') {
      return (
        <FeedTab
          feed={feed}
          feedLoading={feedLoading}
          feedError={feedError}
          formatTime={formatTime}
          onRefresh={fetchFeed}
          onDeletePost={deleteFeedPost}
          currentUserId={USER_ID}
          onViewActivity={(id) => {
            const post = feed.find(f => f.activity_id === id);
            if (post) handleOpenDetail(post);
          }}
        />
      );
    }
    return renderMap();
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-row bg-(--bg-primary) text-(--text-primary) overflow-hidden"
      style={{ height: '100dvh', fontFamily: "'Poppins', sans-serif" }}
    >
      <SidebarAnalytics onExpandChange={setSidebarExpanded} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden pt-14 sm:pt-15">
        <Topbar sidebarExpanded={sidebarExpanded} userId={USER_ID} />

        {/* Offline banner */}
        {!isOnline && (
          <div className="z-50 flex items-center justify-center gap-2 bg-(--warning-bg) border-b border-(--warning) px-4 py-2 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-(--warning)" />
            <span className="text-[9px] font-black uppercase tracking-widest text-(--warning)">
              Offline — activities will sync when reconnected
              {pendingCount > 0 && ` · ${pendingCount} pending`}
            </span>
          </div>
        )}

        {/* Syncing banner */}
        {isOnline && pendingCount > 0 && (
          <div className="z-50 flex items-center justify-center gap-2 bg-(--accent-bg) border-b border-(--accent-border) px-4 py-2 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-(--accent) animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-(--accent)">
              Syncing {pendingCount} offline run{pendingCount > 1 ? 's' : ''}…
            </span>
          </div>
        )}

        {/* Mobile tab strip (hidden on desktop — those tabs live in the panel) */}
        {!isLargeScreen && (
          <div className="flex border-b border-(--border-light) bg-(--bg-secondary) z-50 shrink-0">
            {MOBILE_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] border-b-2 transition-all flex items-center justify-center gap-1 ${
                  activeTab === tab
                    ? 'text-(--accent) border-(--accent)'
                    : 'text-(--text-disabled) border-transparent hover:text-(--text-muted)'
                }`}
              >
                {tab === 'run' && <span className="material-symbols-outlined text-sm">map</span>}
                {tab === 'history' && <span className="material-symbols-outlined text-sm">history</span>}
                {tab === 'stats' && <span className="material-symbols-outlined text-sm">monitoring</span>}
                {tab === 'feed' && <span className="material-symbols-outlined text-sm">group</span>}
                {tab}
              </button>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-hidden relative min-h-0 flex flex-col md:flex-row">
          {/* Map / list area */}
          <div className="flex-1 relative min-w-0 overflow-hidden">
            {isLargeScreen ? renderMap() : renderMobileList()}
          </div>

          {/* Desktop panel */}
          {isLargeScreen && (
            <ActivityPanel
              session={sessionContent}
              activeTab={panelTab}
              setActiveTab={setPanelTab}
              history={history}
              historyLoading={historyLoading}
              historyError={historyError}
              onRefreshHistory={fetchHistory}
              onDeleteActivity={handleDelete}
              onViewActivity={handleOpenDetail}
              onShareActivity={openShare}
              stats={stats}
              statsLoading={statsLoading}
              statsError={statsError}
              feed={feed}
              feedLoading={feedLoading}
              feedError={feedError}
              onRefreshFeed={fetchFeed}
              onDeleteFeedPost={deleteFeedPost}
              currentUserId={USER_ID}
              formatTime={formatTime}
            />
          )}
        </main>
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
      <RunAnalysisOverlay analysis={runAnalysis} onClose={() => setRunAnalysis(null)} />

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        activity={shareTarget}
        shareToken={shareTarget?.shareToken || null}
        isPublic={!!shareTarget?.isPublic}
        onTogglePublic={handleTogglePublic}
        onShareImage={handleShareImage}
        isSharing={isSharing}
        postToFeed={postToFeed}
        setPostToFeed={setPostToFeed}
        caption={caption}
        setCaption={setCaption}
        onDone={handleShareDone}
        cardRef={shareCardRef}
        authorName={user?.name}
        splits={shareTarget?.splits || []}
      />
    </div>
  );
};

export default ActivityMap;
