import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../config/port';
import Icon from './Icon';

function FeedbackModal({ onClose }) {
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [message,   setMessage]   = useState('');
  const [focused,   setFocused]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send feedback.');
      setSubmitted(true);
      setTimeout(onClose, 2600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-9990 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[420px] bg-(--bg-card) border border-(--border-medium) rounded-[20px] overflow-hidden shadow-(--shadow-xl) animate-fade-in-up"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-(--accent-bg) border border-(--accent-border) flex items-center justify-center animate-breathe">
              <svg width="48" height="48" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="166" strokeDashoffset="166" className="animate-[fb-circle-draw_0.5s_cubic-bezier(0.65,0,0.45,1)_0.1s_forwards]" />
                <polyline points="14,27 22,35 38,18" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="48" strokeDashoffset="48" className="animate-[fb-check-draw_0.35s_cubic-bezier(0.65,0,0.45,1)_0.55s_forwards]" />
              </svg>
            </div>
            <div className="font-['DM Sans'] text-lg font-black text-(--text-primary) tracking-tight">
              Feedback Received
            </div>
            <p className="text-[12px] text-(--text-muted) leading-relaxed max-w-[260px]">
              Thanks for helping us improve Vitalis. We'll review your message shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--border-light) bg-(--surface)">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-(--accent-bg) border border-(--accent-border) flex items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-(--text-primary)">Send Feedback</div>
                  <div className="text-[10px] text-(--text-muted)">Help us make Vitalis better</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-(--bg-hover) border border-(--border-light) cursor-pointer flex items-center justify-center text-(--text-muted) hover:bg-(--bg-active) hover:text-(--text-secondary) transition-all"
              >
                <Icon name="close" className="text-[14px]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
              {error && (
                <div className="bg-(--error-bg) border border-(--error) rounded-xl px-3.5 py-2.5 text-[11px] font-semibold text-(--error)">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${focused === 'name' ? 'text-(--accent)' : 'text-(--text-muted)'}`}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  className="w-full bg-(--input-bg) border border-(--input-border) rounded-xl px-3.5 py-2.5 text-[13px] text-(--text-primary) outline-none transition-all focus:border-(--accent) focus:bg-(--bg-active) focus:shadow-[0_0_0_3px_var(--accent-bg)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${focused === 'email' ? 'text-(--accent)' : 'text-(--text-muted)'}`}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="athlete@vitalis.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  className="w-full bg-(--input-bg) border border-(--input-border) rounded-xl px-3.5 py-2.5 text-[13px] text-(--text-primary) outline-none transition-all focus:border-(--accent) focus:bg-(--bg-active) focus:shadow-[0_0_0_3px_var(--accent-bg)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${focused === 'message' ? 'text-(--accent)' : 'text-(--text-muted)'}`}>
                  Message
                </label>
                <textarea
                  placeholder="Tell us what you think, what's broken, or what you'd love to see..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused('')}
                  rows={4}
                  className="w-full bg-(--input-bg) border border-(--input-border) rounded-xl px-3.5 py-2.5 text-[13px] text-(--text-primary) outline-none transition-all focus:border-(--accent) focus:bg-(--bg-active) focus:shadow-[0_0_0_3px_var(--accent-bg)] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 bg-(--accent) text-[#0a0a0a] text-[11px] font-black uppercase tracking-[0.18em] py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-(--accent)/20 hover:brightness-110 active:scale-[0.98] transition-all border-none cursor-pointer"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" /> Sending...</>
                ) : (
                  <>
                    Send Feedback
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-(--text-muted) m-0">
                Your feedback is private and goes directly to our team.
              </p>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes fb-circle-draw { from{stroke-dashoffset:166} to{stroke-dashoffset:0} }
        @keyframes fb-check-draw  { from{stroke-dashoffset:48}  to{stroke-dashoffset:0} }
      `}</style>
    </div>,
    document.body
  );
}

export default FeedbackModal;