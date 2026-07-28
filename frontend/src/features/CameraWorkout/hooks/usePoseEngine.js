import { useEffect, useRef, useState } from 'react';


const POSE_VERSION = '0.5.1675469404';

function loadMediaPipe() {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.Pose) { resolve(); return; }

    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js',
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${POSE_VERSION}/pose.js`,
    ];

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === scripts.length) {
        // Wait a tick for window.Pose to be defined
        setTimeout(() => {
          if (window.Pose) resolve();
          else reject(new Error('window.Pose not found after script load'));
        }, 300);
      }
    };

    scripts.forEach((src) => {
      // Don't double-inject
      if (document.querySelector(`script[src="${src}"]`)) { onLoad(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.crossOrigin = 'anonymous';
      s.onload = onLoad;
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  });
}

function drawSkeleton(ctx, canvas, video, landmarks) {
  if (video.videoWidth && canvas.width !== video.videoWidth) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  if (!canvas.width || !canvas.height) return;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (landmarks && window.drawConnectors && window.drawLandmarks) {
    const connections = window.POSE_CONNECTIONS || window.Pose?.POSE_CONNECTIONS;
    if (connections) {
      window.drawConnectors(ctx, landmarks, connections, {
        color: '#D1FD52',
        lineWidth: 3,
      });
    }
    window.drawLandmarks(ctx, landmarks, {
      color: '#5BC8FF',
      fillColor: '#5BC8FF',
      lineWidth: 1,
      radius: 3,
    });
  }
  ctx.restore();
}

export function usePoseEngine({
  cameraOn,
  webcamRef,
  canvasRef,
  onPoseResult,
  workoutType,
}) {
  const [poseReady, setPoseReady]     = useState(false);
  const [loadError, setLoadError]     = useState(false);
  const poseRef         = useRef(null);
  const onPoseResultRef = useRef(onPoseResult);
  const workoutTypeRef  = useRef(workoutType);
  const noDetectRef     = useRef(0); // frames with no pose
  const sendingRef      = useRef(false); // guards against overlapping send() calls

  useEffect(() => { onPoseResultRef.current = onPoseResult; }, [onPoseResult]);
  useEffect(() => { workoutTypeRef.current  = workoutType;  }, [workoutType]);

  // ── Init MediaPipe once ─────────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        await loadMediaPipe();
        if (!active) return;

        const pose = new window.Pose({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${POSE_VERSION}/${file}`,
        });

        pose.setOptions({
          modelComplexity:        1,
          smoothLandmarks:        true,
          enableSegmentation:     false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence:  0.5,
        });

        pose.onResults((results) => {
          if (!active) return;

          // Draw the skeleton every frame the model runs, independent of
          // recording state, so the user gets instant visual confirmation
          // that tracking is working before they even hit Start.
          const video  = webcamRef.current?.video;
          const canvas = canvasRef?.current;
          if (video && canvas) {
            const ctx = canvas.getContext('2d');
            drawSkeleton(ctx, canvas, video, results.poseLandmarks);
          }

          if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
            // No body detected — increment counter, caller handles it
            noDetectRef.current += 1;
            onPoseResultRef.current(null, workoutTypeRef.current, noDetectRef.current);
            return;
          }

          noDetectRef.current = 0;
          onPoseResultRef.current(results.poseLandmarks, workoutTypeRef.current, 0);
        });

        // Warm up the model
        await pose.initialize();

        poseRef.current = pose;
        if (active) setPoseReady(true);
      } catch (err) {
        console.error('[usePoseEngine] init failed:', err);
        if (active) setLoadError(true);
      }
    };

    init();

    return () => {
      active = false;
      poseRef.current?.close?.();
      poseRef.current = null;
      setPoseReady(false);
    };
  }, []);

  useEffect(() => {
    if (!cameraOn) return;

    const sendFrame = async () => {
      if (sendingRef.current) return; // previous frame still processing — skip this tick
      const video = webcamRef.current?.video;
      if (!poseRef.current || !video) return;
      if (video.readyState < 2 || video.paused) return;

      sendingRef.current = true;
      try {
        await poseRef.current.send({ image: video });
      } catch {
        /* ignore single-frame errors */
      } finally {
        sendingRef.current = false;
      }
    };

    const id = setInterval(sendFrame, 150); // ~7 FPS target, backlog-safe
    return () => clearInterval(id);
  }, [cameraOn, webcamRef, canvasRef]);

  return { poseReady, loadError };
}