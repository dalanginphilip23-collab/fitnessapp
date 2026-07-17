import { useRef, useState, useEffect, useCallback } from "react";
import { Icon } from "../../../components";
import ScanLineOverlay from "./scanLineOverlay";
import CameraOffPlaceholder from "./cameraOffPlaceholder";
import Webcam from "react-webcam";
import CoachFeedbackOverlay from "./coachFeedbackOverlay";
import RepCounterOverlay from "./repCounterOverlay";
import PoseStatusBadge from "./poseStatusBadge";

const mobileConstraints  = { facingMode: 'user', width: 480,  height: 640 };
const desktopConstraints = { facingMode: 'user', width: 1280, height: 720 };
// Fullscreen on mobile now stays portrait instead of landscape.
const mobileFullscreenConstraints = { facingMode: 'user', width: 720, height: 1280 };

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function WebcamFeed({
  webcamRef,
  cameraOn,
  isRecording,
  poseReady,
  loadError,
  aiFeedback,
  isAnalyzing,
  repCount,
  onCameraToggle,
}) {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const videoConstraints = isFullscreen
    ? mobileFullscreenConstraints
    : isMobile
      ? mobileConstraints
      : desktopConstraints;

  // Locks the screen to portrait so fullscreen no longer rotates to landscape.
  const lockPortrait = useCallback(async () => {
    try {
      if (screen?.orientation?.lock) {
        await screen.orientation.lock('portrait');
      }
    } catch {
      // Orientation lock isn't supported everywhere (e.g. iOS Safari) — ignore.
    }
  }, []);

  const unlockOrientation = useCallback(() => {
    try {
      if (screen?.orientation?.unlock) {
        screen.orientation.unlock();
      }
    } catch {
      // Nothing to unlock or unsupported — ignore.
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen)            await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      setIsFullscreen(true);
      await lockPortrait();
    } catch (err) {
      console.warn('Fullscreen failed:', err);
    }
  }, [lockPortrait]);

  const exitFullscreen = useCallback(() => {
    try {
      if (document.exitFullscreen)            document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } catch {
      // Already out of fullscreen or unsupported — ignore.
    }
    setIsFullscreen(false);
    unlockOrientation();
  }, [unlockOrientation]);

  const toggleFullscreen = useCallback(() => {
    isFullscreen ? exitFullscreen() : enterFullscreen();
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const onFSChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (!fsEl) {
        setIsFullscreen(false);
        unlockOrientation();
      }
    };
    document.addEventListener('fullscreenchange', onFSChange);
    document.addEventListener('webkitfullscreenchange', onFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFSChange);
      document.removeEventListener('webkitfullscreenchange', onFSChange);
    };
  }, [unlockOrientation]);

  return (
    <div
      ref={containerRef}
      className={[
        'col-span-1 lg:col-span-8 relative bg-(--bg-card) overflow-hidden',
        'border border-(--border-light) shadow-(--shadow-lg)',
        isFullscreen
          ? 'rounded-none w-screen h-screen'
          : 'rounded-2xl sm:rounded-4xl md:rounded-[3rem] aspect-3/4 sm:aspect-4/5 md:aspect-video w-full',
      ].join(' ')}
    >
      <ScanLineOverlay isRecording={isRecording} cameraOn={cameraOn} />
      <CameraOffPlaceholder cameraOn={cameraOn} onTurnOn={onCameraToggle} />

      {cameraOn && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]"
        />
      )}

      {loadError && (
        <div className="absolute bottom-3 left-3 z-30 bg-(--error-bg) border border-(--error)/30 px-3 py-1.5 rounded-2xl">
          <p className="text-[9px] text-(--error) font-bold uppercase tracking-widest">
            Pose AI failed to load — check your connection
          </p>
        </div>
      )}

      <CoachFeedbackOverlay aiFeedback={aiFeedback} isAnalyzing={isAnalyzing} />
      <RepCounterOverlay repCount={repCount} />
      <PoseStatusBadge poseReady={poseReady} loadError={loadError} />

      {/* Fullscreen toggle — mobile only */}
      {isMobile && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-40 flex items-center justify-center w-9 h-9 rounded-2xl bg-(--bg-overlay) border border-(--border-medium) backdrop-blur-sm active:scale-95 transition-transform touch-manipulation"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <Icon
            name={isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            className="text-(--text-primary) text-xl leading-none"
          />
        </button>
      )}
    </div>
  );
}