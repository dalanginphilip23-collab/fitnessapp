import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Topbar } from '../../../components';
import SidebarAnalytics from '../../../components/SidebarAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import 'leaflet/dist/leaflet.css';
import {
  RecenterMap, FitRoute, GpsBadge, HistoryTab, RouteReplay,
  RunAnalysisOverlay, RunControls, RunSummaryOverlay, StatsPanel, StatsTab, Toast,
} from '../components';

import { useToast }       from './../hooks/useToast';
import { useGeolocation } from "./../hooks/useGeoLocation";
import { useRunTimer }    from './../hooks/useRunTimer';
import { useRunControls } from './../hooks/useRunControl';
import { useActivityApi } from './../hooks/useActivityApi';
import { useWindowWidth } from './../hooks/useWindowWidth';

// ─── Constants ───────────────────────────────────────────────────────────────

const FALLBACK_COORDS   = [14.6760, 121.0437];
const TILE_URL          = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION  = '&copy; <a href="https://carto.com/">CARTO</a>';
const OFFLINE_QUEUE_KEY = 'vitalis_offline_queue';

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

// ─── Stable helpers (defined outside component to avoid re-creation) ──────────

const createUserIcon = () =>
  L.divIcon({
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `
      <div style="width:20px;height:20px;border-radius:50%;background:var(--accent,#D1FD52);border:3px solid #fff;box-shadow:0 0 0 4px rgba(209,253,82,0.3);position:relative;">
        <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(209,253,82,0.15);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      </div>
      <style>@keyframes ping{0%{transform:scale(1);opacity:1}75%{transform:scale(2);opacity:0}100%{transform:scale(2.5);opacity:0}}</style>
    `,
  });

const formatTime = (seconds) => {
  const s  = parseInt(seconds) || 0;
  const h  = Math.floor(s / 3600);
  const m  = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const ActivityMap = () => {
  const { user } = useAuth();
  const USER_ID  = user?.id ?? null;

  const [activeTab,       setActiveTab]       = useState('run');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [runAnalysis,     setRunAnalysis]     = useState(null);
  const [isOnline,        setIsOnline]        = useState(navigator.onLine);
  const [pendingCount,    setPendingCount]    = useState(() => getOfflineQueue().length);
  const [isRecordingState, setIsRecordingState] = useState(false);

  // Snapshot of finished-run data — populated from refs once run completes,
  // so JSX never reads .current during render (fixes eslint react-hooks/refs).
  const [finishedRun, setFinishedRun] = useState(null);

  const { isLargeScreen }    = useWindowWidth();
  const { toast, showToast } = useToast();

  const { userLocation, startCoords, locationStatus, mapCenter, path, setPath } =
    useGeolocation(isRecordingState);

  const { metrics, splits, resetMetrics } =
    useRunTimer(isRecordingState, locationStatus, setPath, path);

  const {
    isRecording:      rc_isRecording,
    hasPaused:        rc_hasPaused,
    runFinished:      rc_runFinished,
    finishedPathRef:    rc_finishedPathRef,
    finishedMetricsRef: rc_finishedMetricsRef,
    finishedSplitsRef:  rc_finishedSplitsRef,
    handleStartRun:   rc_handleStartRun,
    handlePauseResume: rc_handlePauseResume,
    handleFinish:     rc_handleFinish,
    handleDiscard:    rc_handleDiscard,
  } = useRunControls({ userLocation, startCoords, metrics, path, splits, resetMetrics, setPath });

  // Sync recording state into geolocation / timer hooks
  useEffect(() => { setIsRecordingState(rc_isRecording); }, [rc_isRecording]);

  // When the run finishes, snapshot the ref values into state so JSX can read
  // them safely without accessing .current during render.
  useEffect(() => {
    if (rc_runFinished) {
      setFinishedRun({
        path:    rc_finishedPathRef.current,
        metrics: rc_finishedMetricsRef.current,
        splits:  rc_finishedSplitsRef.current,
      });
    } else {
      setFinishedRun(null);
    }
  }, [rc_runFinished, rc_finishedPathRef, rc_finishedMetricsRef, rc_finishedSplitsRef]);


  const {
    isSaving, history, historyLoading, historyError,
    stats, statsLoading, statsError,
    fetchHistory, handleSaveActivity, handleDelete,
  } = useActivityApi({
    userId: USER_ID,
    activeTab,
    showToast,
    setRunAnalysis,
    onSaveSuccess: () => { rc_handleDiscard(FALLBACK_COORDS); setActiveTab('run'); },
  });

  // ─── Offline queue flush ────────────────────────────────────────────────────

  const flushOfflineQueue = useCallback(async () => {
    const queue = getOfflineQueue();
    if (!queue.length || !USER_ID) return;

    const remaining = [];

    for (const item of queue) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/activity/save`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(item.payload),
          },
        );
        // Only treat a successful HTTP response as flushed
        if (!res.ok) remaining.push(item);
      } catch {
        // Network error — keep this item and all subsequent ones
        remaining.push(item);
      }
    }

    if (remaining.length === 0) {
      clearOfflineQueue();
      setPendingCount(0);
      const synced = queue.length;
      showToast(`✓ ${synced} offline run${synced > 1 ? 's' : ''} synced!`);
    } else {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
      setPendingCount(remaining.length);
    }
  }, [USER_ID, showToast]);

  // ─── Online / offline listeners ────────────────────────────────────────────

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

  // ─── Save handler ───────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!finishedRun) return;
    const { metrics: m, path: route } = finishedRun;
    const payload = {
      userId:   USER_ID,
      duration: m.time,
      distance: parseFloat((m.distance ?? 0).toFixed(2)),
      pace:     m.pace,
      calories: m.calories,
      route,
    };

    if (!isOnline) {
      pushToOfflineQueue(payload);
      setPendingCount(getOfflineQueue().length);
      showToast('📶 Offline — run saved locally, will sync when reconnected', 'warn');
      rc_handleDiscard(FALLBACK_COORDS);
      return;
    }

    await handleSaveActivity({
      finishedMetricsRef: rc_finishedMetricsRef,
      finishedPathRef:    rc_finishedPathRef,
      finishedSplitsRef:  rc_finishedSplitsRef,
    });
  }, [
    finishedRun, USER_ID, isOnline, showToast,
    rc_finishedMetricsRef, rc_finishedPathRef, rc_finishedSplitsRef,
    rc_handleDiscard, handleSaveActivity,
  ]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-row bg-(--bg-primary) text-(--text-primary) overflow-hidden"
      style={{ height: '100dvh', fontFamily: "'Inter', sans-serif" }}
    >
      <SidebarAnalytics onExpandChange={setSidebarExpanded} />

      {/* Right column: topbar + content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden pt-14 sm:pt-15">

        <Topbar sidebarExpanded={sidebarExpanded} userId={USER_ID} />

        {/* Offline banner */}
        {!isOnline && (
          <div className="z-50 flex items-center justify-center gap-2 bg-(--warning-bg) border-b border-(--warning) px-4 py-2 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-(--warning)" />
            <span className="text-[9px] font-black uppercase tracking-widest text-(--warning)">
              Offline — runs will sync when reconnected
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

        {/* Tab bar (hidden while viewing run summary) */}
        {!rc_runFinished && (
          <div className="flex border-b border-(--border-light) bg-(--bg-secondary) z-50 shrink-0">
            {['run', 'history', 'stats'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] border-b-2 transition-all
                  ${activeTab === tab
                    ? 'text-(--accent) border-(--accent)'
                    : 'text-(--text-disabled) border-transparent hover:text-(--text-muted)'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-hidden relative min-h-0">

          {/* ── Replay / summary mode ── */}
          {rc_runFinished && finishedRun && (
            <div className="relative h-full w-full">
              <MapContainer
                center={finishedRun.path[0] ?? FALLBACK_COORDS}
                zoom={15}
                zoomControl={false}
                className="h-full w-full z-0"
              >
                <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
                <FitRoute path={finishedRun.path} />
                <RouteReplay fullPath={finishedRun.path} />
              </MapContainer>

              <RunSummaryOverlay
                metrics={finishedRun.metrics}
                splits={finishedRun.splits}
                formatTime={formatTime}
                onSave={handleSave}
                onDiscard={() => rc_handleDiscard(FALLBACK_COORDS)}
                isSaving={isSaving}
                isOnline={isOnline}
              />
            </div>
          )}

          {/* ── Run tab ── */}
          {!rc_runFinished && activeTab === 'run' && (
            <div className="flex h-full">
              <div className="flex-1 relative min-w-0 overflow-hidden">
                <MapContainer
                  center={mapCenter}
                  zoom={16}
                  zoomControl={false}
                  className="absolute inset-0 z-0"
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
                  {path.length > 1 && (
                    <Polyline
                      positions={path}
                      pathOptions={{ color: 'var(--accent)', weight: 5, opacity: 0.85 }}
                    />
                  )}
                  {userLocation && <Marker position={userLocation} icon={createUserIcon()} />}
                  <RecenterMap
                    coords={path}
                    isRecording={rc_isRecording}
                    userLocation={userLocation}
                  />
                </MapContainer>

                <GpsBadge locationStatus={locationStatus} />

                {locationStatus === 'denied' && (
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-1000 bg-(--error-bg) border border-(--error) px-3 py-2 rounded-xl max-w-45">
                    <p className="text-[9px] text-(--error) font-semibold leading-relaxed">
                      Location denied. Enable in browser settings for real GPS.
                    </p>
                  </div>
                )}

                <RunControls
                  isRecording={rc_isRecording}
                  hasPaused={rc_hasPaused}
                  metricsTime={metrics.time}
                  onStart={rc_handleStartRun}
                  onPauseResume={rc_handlePauseResume}
                  onFinish={rc_handleFinish}
                />

                {!isLargeScreen && (
                  <StatsPanel
                    metrics={metrics}
                    splits={splits}
                    formatTime={formatTime}
                    isDesktop={false}
                  />
                )}
              </div>

              {isLargeScreen && (
                <StatsPanel
                  metrics={metrics}
                  splits={splits}
                  formatTime={formatTime}
                  isDesktop={true}
                />
              )}
            </div>
          )}

          {/* ── History tab ── */}
          {!rc_runFinished && activeTab === 'history' && (
            <HistoryTab
              history={history}
              historyLoading={historyLoading}
              historyError={historyError}
              formatTime={formatTime}
              onRefresh={fetchHistory}
              onDelete={handleDelete}
            />
          )}

          {/* ── Stats tab ── */}
          {!rc_runFinished && activeTab === 'stats' && (
            <StatsTab
              stats={stats}
              statsLoading={statsLoading}
              statsError={statsError}
              formatTime={formatTime}
            />
          )}
        </main>
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
      <RunAnalysisOverlay analysis={runAnalysis} onClose={() => setRunAnalysis(null)} />
    </div>
  );
};

export default ActivityMap;