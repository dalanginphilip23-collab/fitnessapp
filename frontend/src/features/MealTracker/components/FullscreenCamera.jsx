import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Icon from "../../../components/ui/Icon";
import Spinner from "./Spinner";
import { useViewportSize } from "../../../hooks/useViewportSize";
import { useLockBodyScroll } from "../../../hooks/useLockBodyScroll";

/**
 * Fullscreen, native-camera-style capture experience.
 * Rendered as a fixed overlay above the entire app (z-[999999]) so it
 * escapes the small upload card and takes over the whole viewport,
 * mirroring the iOS/Android camera UX (live feed, shutter, flip,
 * retake / use-photo confirmation).
 */
export default function FullscreenCamera({ onCapture, onClose }) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState("environment");
  const [ready,       setReady]     = useState(false);
  const [error,       setError]     = useState(null);
  const [flash,       setFlash]     = useState(false);
  const [captured,    setCaptured]  = useState(null);

  // Shared hook: avoids duplicating viewport-tracking logic. See
  // useViewportSize's docstring above for why this exists.
  const { height: viewportHeight } = useViewportSize();

  // The camera is a fullscreen takeover, so the page behind it must not scroll.
  useLockBodyScroll();

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async (mode) => {
    setError(null);
    setReady(false);
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch {
      setError("Camera access denied or not available.");
    }
  }, [stopStream]);

  useEffect(() => {
    if (!captured) startStream(facingMode);
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode, captured]);

  const handleShutter = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    // Scale capture to 600px max before toDataURL to cut ~70% bytes before second compress
    const MAX_W = 600;
    const scale = video.videoWidth > MAX_W ? MAX_W / video.videoWidth : 1;
    canvas.width  = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    setCaptured(canvas.toDataURL("image/jpeg", 0.75));
    stopStream();
  };

  const handleRetake   = () => setCaptured(null);
  const handleUsePhoto = () => onCapture(captured);
  const handleClose    = () => { stopStream(); onClose(); };
  const flipCamera     = () => setFacingMode((m) => (m === "environment" ? "user" : "environment"));

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] bg-black flex flex-col"
      style={{ height: `${viewportHeight}px`, width: "100vw" }}
    >
      {flash && (
        <div className="absolute inset-0 bg-white z-20 pointer-events-none transition-opacity duration-150" />
      )}

      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 sm:px-6"
        style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
      >
        <button
          onClick={handleClose}
          aria-label="Close camera"
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white touch-manipulation"
        >
          <Icon name="close" className="text-xl" />
        </button>

        {!captured && (
          <button
            onClick={flipCamera}
            aria-label="Switch camera"
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white touch-manipulation"
          >
            <Icon name="cameraswitch" className="text-xl" />
          </button>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {captured ? (
          <img src={captured} alt="Captured meal" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: error ? "none" : "block" }}
            />
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="text-4xl">🚫</span>
                <p className="text-red-400 text-sm font-medium">{error}</p>
                <button
                  onClick={() => startStream(facingMode)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold touch-manipulation"
                >
                  Try again
                </button>
              </div>
            )}
            {!ready && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Spinner />
                <p className="text-white/70 text-xs">Starting camera…</p>
              </div>
            )}
          </>
        )}
      </div>

      <div
        className="relative z-10 flex items-center justify-center px-6 py-6 sm:py-8"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
      >
        {captured ? (
          <div className="flex items-center gap-4 w-full max-w-sm">
            <button
              onClick={handleRetake}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-white/10 text-white touch-manipulation"
            >
              Retake
            </button>
            <button
              onClick={handleUsePhoto}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-(--accent) text-[#131313] touch-manipulation"
            >
              Use Photo
            </button>
          </div>
        ) : (
          ready && !error && (
            <button
              onClick={handleShutter}
              aria-label="Take photo"
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white border-4 border-white/30 shadow-lg active:scale-90 transition-transform touch-manipulation flex items-center justify-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/80" />
            </button>
          )
        )}
      </div>
    </div>,
    document.body
  );
}