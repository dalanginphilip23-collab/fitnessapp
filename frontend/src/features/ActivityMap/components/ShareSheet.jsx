import React, { useState } from 'react';
import { getActivityType } from '../utils/activityTypes';

// Share modal — Strava-style actions for a finished activity:
//  1. Share image   → capture + Web Share API / download
//  2. Copy link     → public shareable URL (requires the public toggle)
//  3. Post to feed  → publish to the in-app friends' feed

const ShareSheet = ({
  open,
  onClose,
  activity,
  shareToken,
  isPublic,
  onTogglePublic,
  onShareImage,
  isSharing,
  postToFeed,
  setPostToFeed,
  caption,
  setCaption,
  onDone,
}) => {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const meta = activity ? getActivityType(activity.type) : getActivityType('run');
  const shareUrl = shareToken
    ? `${window.location.origin}/activity/${shareToken}`
    : null;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      const { copyText } = await import('../utils/shareImage');
      await copyText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const handleDone = () => {
    setPostToFeed?.(postToFeed);
    onDone?.();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[var(--bg-tertiary)] border border-[var(--border-medium)] rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-light)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <span className="material-symbols-outlined text-[var(--accent)]">share</span>
            </span>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">Share Activity</p>
              <p className="text-[10px] text-[var(--text-muted)]">{meta.label} · {activity?.title || meta.defaultTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <span className="text-[var(--text-muted)] text-sm">✕</span>
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {/* Share image */}
          <button
            onClick={() => onShareImage?.()}
            disabled={isSharing}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-light)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-active)] transition-all disabled:opacity-50 text-left group"
          >
            <span className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[var(--accent)]">image</span>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                {isSharing ? 'Preparing image…' : 'Share image'}
              </p>
              <p className="text-[9px] text-[var(--text-muted)]">Route map + stats. Opens WhatsApp, Facebook, email…</p>
            </div>
            <span className="material-symbols-outlined text-[var(--text-muted)] group-hover:text-[var(--accent)] text-lg">arrow_forward</span>
          </button>

          {/* Copy link */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-light)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[var(--accent-warm-bg)] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[var(--accent-warm)]">link</span>
                </span>
                <div>
                  <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Share link</p>
                  <p className="text-[9px] text-[var(--text-muted)]">Anyone with the link can view</p>
                </div>
              </div>
              {!isPublic ? (
                <button
                  onClick={() => onTogglePublic?.(true)}
                  className="text-[9px] font-black uppercase tracking-widest bg-[var(--accent)] text-black rounded-full px-3 py-1.5 hover:scale-105 transition-transform"
                >
                  Enable
                </button>
              ) : (
                <button
                  onClick={handleCopyLink}
                  className={`text-[9px] font-black uppercase tracking-widest rounded-full px-3 py-1.5 transition-all ${
                    copied
                      ? 'bg-[var(--success-bg)] text-[var(--success)]'
                      : 'bg-[var(--bg-active)] text-[var(--accent)] hover:scale-105'
                  }`}
                >
                  {copied ? '✓ Copied' : 'Copy link'}
                </button>
              )}
            </div>
            {isPublic && shareUrl && (
              <p className="text-[8px] text-[var(--text-disabled)] mt-2 truncate select-all">{shareUrl}</p>
            )}
          </div>

          {/* Post to feed */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            postToFeed ? 'bg-[var(--accent-bg)] border-[var(--accent-border)]' : 'bg-[var(--bg-hover)] border-[var(--border-light)]'
          }`}>
            <button
              onClick={() => setPostToFeed?.(!postToFeed)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${postToFeed ? 'bg-[var(--accent)]' : 'bg-[var(--bg-active)]'}`}>
                  <span className={`material-symbols-outlined ${postToFeed ? 'text-black' : 'text-[var(--accent)]'}`}>group_add</span>
                </span>
                <div className="text-left">
                  <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Post to feed</p>
                  <p className="text-[9px] text-[var(--text-muted)]">Share with friends in the Vitalis community</p>
                </div>
              </div>
              <span className={`w-9 h-5 rounded-full relative transition-colors ${postToFeed ? 'bg-[var(--accent)]' : 'bg-[var(--border-heavy)]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${postToFeed ? 'left-4.5' : 'left-0.5'}`} />
              </span>
            </button>

            {postToFeed && (
              <input
                value={caption || ''}
                onChange={(e) => setCaption?.(e.target.value)}
                placeholder="Say something about this activity…"
                maxLength={280}
                className="mt-3 w-full bg-[var(--bg-primary)]/60 border border-[var(--border-medium)] rounded-xl px-3 py-2 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-disabled)] outline-none focus:border-[var(--accent-border)] transition-colors"
              />
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 pb-5 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 border border-[var(--border-medium)] text-[var(--text-secondary)] rounded-full py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDone}
            className="flex-1 bg-[var(--accent)] text-black rounded-full py-3 text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareSheet;
