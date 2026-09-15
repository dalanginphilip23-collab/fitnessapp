import { motion } from 'framer-motion';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

/* ─── HOW TO ADD YOUR REAL DEMO VIDEO ─────────────────────────────
 * Option A — YouTube (recommended, no repo bloat):
 *   1. Upload as Unlisted/Public on YouTube.
 *   2. Copy the video ID from the URL
 *      (youtube.com/watch?v=VIDEO_ID  →  VIDEO_ID).
 *   3. Set youtubeId below. Done — responsive embed appears.
 *
 * Option B — MP4 file in the project:
 *   1. Put the file at  frontend/public/demo/vitalis-demo.mp4
 *      (optional poster: frontend/public/demo/vitalis-demo-poster.jpg).
 *   2. Set mp4Src (and poster) below. Done — native player appears.
 *
 * Leave both empty to keep the "coming soon" placeholder.
 */
const DEMO = {
  youtubeId: '',
  mp4Src: '',
  poster: '',
};

const frameClass =
  'relative w-full aspect-video rounded-[24px] overflow-hidden border shadow-xl';
const frameStyle = {
  borderColor: 'var(--border-light)',
  background: 'var(--bg-secondary)',
};

export default function DemoVideo() {
  const reduce = usePrefersReducedMotion();

  if (DEMO.youtubeId) {
    return (
      <div className={frameClass} style={frameStyle}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${DEMO.youtubeId}?rel=0`}
          title="Vitalis demo video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (DEMO.mp4Src) {
    return (
      <div className={frameClass} style={frameStyle}>
        <video
          className="absolute inset-0 w-full h-full"
          src={DEMO.mp4Src}
          poster={DEMO.poster || undefined}
          controls
          playsInline
          preload="metadata"
        />
      </div>
    );
  }

  return (
    <div className={frameClass} style={frameStyle}>
      {/* Faint backdrop mark */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 40%, var(--accent) 0%, transparent 65%)',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <motion.span
          animate={reduce ? {} : { scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: 'var(--accent)', boxShadow: '0 10px 30px rgba(139,195,74,0.28)' }}
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[36px] text-[#0a1000]">play_arrow</span>
        </motion.span>
        <div>
          <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Demo walkthrough — coming soon
          </p>
          <p className="mt-1 text-[12px] leading-relaxed max-w-[380px]" style={{ color: 'var(--text-muted)' }}>
            A 2-minute tour: sign up → track a workout → scan a meal → get coached.
            Drop in a YouTube ID or MP4 in <code>DemoVideo.jsx</code> to publish it here.
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-[0.12em] uppercase"
          style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}
        >
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          ~2 min
        </span>
      </div>
    </div>
  );
}
