import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { AnalyticsMobileNav, Icon, SidebarAnalytics } from '../../../components';
import { useAuth } from '../../../hooks/useAuth';
import { WORKOUT_OPTIONS } from '../constants/workout';
import { useRepCounter, speak } from '../hooks/useRepCounter';
import { useAICoach } from "../hooks/useAiCoach";
import { usePoseEngine }        from '../hooks/usePoseEngine';
import { useWorkoutSession }    from '../hooks/useWorkoutSession';
import { API_BASE_URL }         from '../../../config/port';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  WebcamFeed, SessionHeader, BiometricBar, BiometricsCard, CameraOffPlaceholder,
  CameraToggleButton, CoachFeedbackOverlay, DesktopWorkoutSelector, MobileWorkoutPills,
  NeuralStatusCard, PoseStatusBadge, RepcounterOverlay, RightPanel, ScanLineOverlay,
  SessionLog, SessionLogRow, StartStopButton, VoiceToggleButton,
} from '../components';

// ── Minimum reps required to count a session as complete ─────────────────────
const MIN_REPS_DEFAULT = 5;

// ── Activity types that should NOT launch the camera (use manual complete) ───
const REST_ACTIVITY_TYPES = new Set(['Recovery', 'Mobility', 'Flexibility']);

// ── Early-exit confirmation dialog ───────────────────────────────────────────
// Receives plain `reps` value (not a ref) so it never reads .current in JSX.
function EarlyExitDialog({ reps, minReps, elapsedMins, requiredMins, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center"
         style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-sm mx-4 rounded-[var(--card-radius-md)] border shadow-2xl p-6"
           style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
             style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <span className="material-symbols-outlined text-red-400 text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
        </div>

        <h3 className="text-base font-black text-center mb-1"
            style={{ color: 'var(--text-primary)' }}>Workout Incomplete</h3>
        <p className="text-xs text-center mb-5 leading-relaxed"
           style={{ color: 'var(--text-muted)' }}>
          You've only done <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{reps} rep{reps !== 1 ? 's' : ''}</span> in{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{elapsedMins} min{elapsedMins !== 1 ? 's' : ''}</span>.
          {requiredMins > 0
            ? ` This day requires at least ${requiredMins} mins to be marked complete.`
            : ` You need at least ${minReps} reps to complete this day.`}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all"
            style={{ borderColor: 'var(--border-medium)', color: 'var(--text-muted)' }}
          >
            Keep Going
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171',
                     border: '1px solid rgba(239,68,68,0.3)' }}
          >
            End Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════════════════
const CameraWorkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPlan = location.state?.fromPlan ?? null;

  const requiredMins = fromPlan?.durationMins ?? 0;
  const minReps      = MIN_REPS_DEFAULT;

  const [workoutType, setWorkoutType] = useState(() => {
    if (fromPlan?.activityType) {
      const match = WORKOUT_OPTIONS.find(
        o =>
          o.label.toLowerCase() === fromPlan.activityType.toLowerCase() ||
          o.id === fromPlan.activityType.toLowerCase()
      );
      return match?.id ?? 'pushup';
    }
    return 'pushup';
  });

  const [isRecording,     setIsRecording]     = useState(false);
  const [cameraOn,        setCameraOn]        = useState(() => localStorage.getItem('vitalis_cameraOn') !== 'false');
  const [voiceEnabled,    setVoiceEnabled]    = useState(() => localStorage.getItem('vitalis_voiceEnabled') !== 'false');
  const [logs,            setLogs]            = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [biometrics,      setBiometrics]      = useState({ alignment: 0, velocity: 0, symmetry: 0 });

  // Session timer
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const sessionStartRef               = useRef(null);
  const timerRef                      = useRef(null);

  // FIX: snapshot of repCount at the moment the early-exit dialog is opened,
  // so JSX receives a plain number instead of reading repCountRef.current during render.
  const [earlyExitReps,    setEarlyExitReps]    = useState(0);
  const [showEarlyExit,    setShowEarlyExit]    = useState(false);

  const webcamRef = useRef(null);

  const { repCount, repCountRef, countRep, resetReps }           = useRepCounter({ workoutType, voiceEnabled });
  const { aiFeedback, isAnalyzing, setAiFeedback, maybeAnalyze } = useAICoach({ workoutType, voiceEnabled });
  const { startSession, endSession }                             = useWorkoutSession();

  // ── Timer: tick every second while recording ───────────────────
  useEffect(() => {
    if (isRecording) {
      // Preserve elapsed time across pause/resume cycles
      sessionStartRef.current = Date.now() - elapsedSecs * 1000;
      timerRef.current = setInterval(() => {
        setElapsedSecs(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  // elapsedSecs intentionally excluded: we only want to (re)start the interval
  // when isRecording flips, not on every tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const elapsedMins = Math.floor(elapsedSecs / 60);

  const isSessionComplete = useCallback(() => {
    if (!fromPlan) return true;
    const reps = repCountRef.current;
    if (requiredMins > 0) {
      return elapsedMins >= Math.ceil(requiredMins * 0.5) && reps >= minReps;
    }
    return reps >= minReps;
  }, [fromPlan, requiredMins, elapsedMins, minReps, repCountRef]);

  // ── The actual stop logic (called after confirmation if needed) ─
  const doStop = useCallback(() => {
    endSession('completed', repCountRef.current).catch(err =>
      console.warn('[endSession] background error:', err)
    );

    const final = repCountRef.current;
    const opt   = WORKOUT_OPTIONS.find(o => o.id === workoutType);
    const msg   = `Session complete! You did ${final} ${final === 1 ? 'rep' : 'reps'}. Great work!`;
    setAiFeedback(msg);
    if (voiceEnabled) speak(msg, 1.0, 1.05);

    setLogs(prev => [...prev, {
      exercise: opt?.label ?? workoutType,
      reps:     final,
      time:     new Date().toLocaleTimeString(),
    }]);

    const resolvedUserId = user?.id ?? user?.userId ?? null;

    if (fromPlan && resolvedUserId && isSessionComplete()) {
      fetch(`${API_BASE_URL}/api/plans/progress/complete`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId:    resolvedUserId,
          planId:    fromPlan.planId,
          dayNumber: fromPlan.dayNumber,
        }),
      })
        .then(() => {
          setTimeout(() => {
            navigate('/dashboard/plans', {
              state: { openTracker: fromPlan.planId },
            });
          }, 1800);
        })
        .catch(err => console.error('[fromPlan] day complete failed:', err));
    } else if (fromPlan) {
      setTimeout(() => {
        navigate('/dashboard/plans', {
          state: { openTracker: fromPlan.planId },
        });
      }, 1800);
    }

    if (resolvedUserId) {
      fetch(`${API_BASE_URL}/api/notifications`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: resolvedUserId,
          message: `Workout ended. You finished ${opt?.label ?? workoutType} with ${final} ${final === 1 ? 'rep' : 'reps'}.`,
          type:    'info',
        }),
      }).catch(err => console.error('Notification failed:', err));
    }

    setElapsedSecs(0);
    setIsRecording(false);
  }, [endSession, repCountRef, workoutType, voiceEnabled, user, fromPlan, isSessionComplete, navigate, setAiFeedback]);

  const handleStartStop = async () => {
    if (!isRecording) {
      // ── START ──────────────────────────────────────────────────
      startSession(workoutType).catch(err =>
        console.warn('[startSession] background error:', err)
      );
      resetReps();
      setElapsedSecs(0);

      const opt = WORKOUT_OPTIONS.find(o => o.id === workoutType);
      const msg = fromPlan
        ? `Starting Day ${fromPlan.dayNumber}: ${fromPlan.dayTitle}. ${opt?.cue ?? ''}`
        : `Starting ${opt?.label ?? workoutType}. ${opt?.cue ?? ''}`;

      setAiFeedback(msg);
      if (voiceEnabled) speak(msg, 0.95, 1.0);
      setIsRecording(true);

    } else {
      // ── STOP — check if session qualifies ──────────────────────
      if (fromPlan && !isSessionComplete()) {
        // FIX: snapshot the current rep count into state NOW (event handler,
        // not during render) so the dialog can display it as a plain number.
        setEarlyExitReps(repCountRef.current);
        setShowEarlyExit(true);
        return;
      }
      doStop();
    }
  };

  const handleEarlyExitConfirm = () => {
    setShowEarlyExit(false);
    doStop();
  };
  const handleEarlyExitCancel = () => {
    setShowEarlyExit(false);
  };

  const { poseReady, loadError } = usePoseEngine({
    isRecording,
    cameraOn,
    webcamRef,
    workoutType,
    onPoseResult: (landmarks, type, noDetectCount) => {
      if (!landmarks) {
        if (isRecording) {
          if (noDetectCount === 3) {
            const msg = 'Camera blocked — step back so your full body is visible';
            setAiFeedback(msg);
            if (voiceEnabled) speak(msg, 0.95, 1.0);
          }
          maybeAnalyze(null);
        }
        setBiometrics({ alignment: 0, velocity: 0, symmetry: 0 });
        return;
      }

      const upperBody   = ['pushup', 'bicep_curl', 'overhead', 'lateral_raise'];
      const checkPoints = upperBody.includes(type) ? [11, 12, 13, 14] : [23, 24, 25, 26];
      const isVisible   = checkPoints.every(i => landmarks[i] && landmarks[i].visibility > 0.4);

      if (!isVisible && isRecording) {
        const msg = 'Move back — position your full body in the camera view';
        setAiFeedback(msg);
        if (voiceEnabled) speak(msg, 0.95, 1.0);
        setBiometrics(prev => ({ ...prev, alignment: 30 }));
        return;
      }

      if (isRecording && isVisible) {
        countRep(landmarks, type);
        maybeAnalyze(landmarks);
      }

      const lShoulder = landmarks[11];
      const rShoulder = landmarks[12];
      const symScore  = Math.max(0, 100 - Math.abs(lShoulder.y - rShoulder.y) * 500);
      setBiometrics({
        alignment: isVisible ? Math.floor(Math.random() * 5) + 92 : Math.floor(Math.random() * 20) + 50,
        velocity:  isRecording ? Math.floor(Math.random() * 15) + 20 : 0,
        symmetry:  Math.floor(symScore),
      });
    },
  });

  const handleCameraToggle = () => {
    const next = !cameraOn;
    setCameraOn(next);
    localStorage.setItem('vitalis_cameraOn', String(next));
    if (!next && isRecording) setIsRecording(false);
    if (voiceEnabled) speak(next ? 'Camera on.' : 'Camera off.');
  };

  const handleVoiceToggle = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    localStorage.setItem('vitalis_voiceEnabled', String(next));
    speak(next ? 'Voice on.' : 'Voice off.');
  };

  const handleWorkoutChange = (opt) => {
    setWorkoutType(opt.id);
    resetReps();
    const msg = `Switched to ${opt.label}. ${opt.cue}`;
    setAiFeedback(msg);
    if (voiceEnabled) speak(msg, 0.95);
    if (isRecording) setIsRecording(false);
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-row h-screen bg-(--bg-primary) text-(--text-primary) font-['Inter'] overflow-hidden">
      {showEarlyExit && (
        <EarlyExitDialog
          reps={earlyExitReps}
          minReps={minReps}
          elapsedMins={elapsedMins}
          requiredMins={requiredMins > 0 ? Math.ceil(requiredMins * 0.5) : 0}
          onConfirm={handleEarlyExitConfirm}
          onCancel={handleEarlyExitCancel}
        />
      )}

      <div className="hidden md:block">
        <SidebarAnalytics expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      </div>

      <div
        className={`flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden transition-all duration-300
          ${sidebarExpanded ? 'md:ml-60' : 'md:ml-18'}`}
      >
        {fromPlan && (
          <div className="bg-(--accent-bg) border-b border-(--accent-border) px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-(--accent)">
                {fromPlan.planTitle}
              </span>
              <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                · Day {fromPlan.dayNumber}: {fromPlan.dayTitle}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isRecording && (
                <span className="text-[10px] font-black tabular-nums text-(--accent)">
                  {formatTime(elapsedSecs)}
                </span>
              )}
              {requiredMins > 0 && (
                <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                  Goal: {Math.ceil(requiredMins * 0.5)} min
                </span>
              )}
            </div>
          </div>
        )}

        <SessionHeader
          workoutType={workoutType}
          isRecording={isRecording}
          cameraOn={cameraOn}
          voiceEnabled={voiceEnabled}
          onStartStop={handleStartStop}
          onCameraToggle={handleCameraToggle}
          onVoiceToggle={handleVoiceToggle}
        />

        <MobileWorkoutPills workoutType={workoutType} onSelect={handleWorkoutChange} />
        <DesktopWorkoutSelector workoutType={workoutType} onSelect={handleWorkoutChange} />

        <main className="p-3 sm:p-4 md:p-8 max-w-400 mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <WebcamFeed
              webcamRef={webcamRef}
              cameraOn={cameraOn}
              isRecording={isRecording}
              poseReady={poseReady}
              loadError={loadError}
              aiFeedback={aiFeedback}
              isAnalyzing={isAnalyzing}
              repCount={repCount}
              onCameraToggle={handleCameraToggle}
            />
            <RightPanel biometrics={biometrics} logs={logs} />
          </div>
        </main>

        <AnalyticsMobileNav navigate={navigate} />
      </div>

      <style>{`
        @keyframes scan {
          0%   { top: 0%;   opacity: 0; }
          50%  {             opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CameraWorkout;