import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../config/port';

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
    <>
      <style>{`
        @keyframes fb-backdrop-in { from{opacity:0} to{opacity:1} }
        @keyframes fb-card-in { from{opacity:0;transform:scale(0.93) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fb-circle-draw { from{stroke-dashoffset:166} to{stroke-dashoffset:0} }
        @keyframes fb-check-draw  { from{stroke-dashoffset:48}  to{stroke-dashoffset:0} }
        @keyframes fb-success-text { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fb-glow { 0%,100%{box-shadow:0 0 0 0 rgba(209,253,82,0)} 50%{box-shadow:0 0 28px 6px rgba(209,253,82,0.18)} }
        @keyframes fb-spin { to{transform:rotate(360deg)} }
        .fb-backdrop { animation: fb-backdrop-in 0.22s ease forwards; }
        .fb-card     { animation: fb-card-in 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
        .fb-spinner  { width:14px;height:14px;border:2px solid rgba(19,19,19,0.3);border-top-color:transparent;border-radius:50%;animation:fb-spin 0.7s linear infinite;display:inline-block; }
        .fb-circle   { stroke-dasharray:166;stroke-dashoffset:166;animation:fb-circle-draw 0.5s cubic-bezier(0.65,0,0.45,1) 0.1s forwards; }
        .fb-check    { stroke-dasharray:48;stroke-dashoffset:48;animation:fb-check-draw 0.35s cubic-bezier(0.65,0,0.45,1) 0.55s forwards; }
        .fb-success-label { opacity:0;animation:fb-success-text 0.4s ease 0.75s forwards; }
        .fb-success-sub   { opacity:0;animation:fb-success-text 0.4s ease 0.9s  forwards; }
        .fb-success-glow  { animation:fb-glow 1.8s ease 0.6s infinite; }
        .fb-input:focus,.fb-textarea:focus {
          border-color: var(--accent) !important;
          background: var(--bg-active) !important;
          box-shadow: 0 0 0 3px var(--accent-bg);
          outline: none;
        }
        .fb-textarea { resize: none; }
      `}</style>

      {/* Backdrop */}
      <div
        className="fb-backdrop"
        style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 16px',
        }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Card */}
        <div
          className="fb-card"
          style={{
            width: '100%', maxWidth: '420px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: '20px', overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* accent line */}
          <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

          {/* ── Success ── */}
          {submitted ? (
            <div style={{ padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <div
                className="fb-success-glow"
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--accent-bg)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="48" height="48" viewBox="0 0 52 52">
                  <circle className="fb-circle" cx="26" cy="26" r="25" fill="none" stroke="var(--accent)" strokeWidth="2" />
                  <polyline className="fb-check" points="14,27 22,35 38,18" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="fb-success-label" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Feedback Received
              </div>
              <div className="fb-success-sub" style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, maxWidth: 260 }}>
                Thanks for helping us improve Vitalis. We'll review your message shortly.
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 22px 14px',
                borderBottom: '1px solid var(--border-light)',
                background: 'var(--surface)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'var(--accent-bg)',
                    border: '1px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em' }}>
                      Send Feedback
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", marginTop: 1 }}>
                      Help us make Vitalis better
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-active)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {error && (
                  <div style={{
                    background: 'var(--error-bg)', border: '1px solid var(--error)',
                    borderRadius: 10, padding: '9px 14px',
                    fontSize: 11, fontWeight: 600, color: 'var(--error)',
                    fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em',
                  }}>
                    {error}
                  </div>
                )}

                {/* Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: focused === 'name' ? 'var(--accent)' : 'var(--text-muted)',
                    fontFamily: "'DM Sans', sans-serif", transition: 'color 0.15s',
                  }}>Name</label>
                  <input
                    className="fb-input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused('')}
                    style={{
                      background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                      borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)',
                      fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                      width: '100%', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: focused === 'email' ? 'var(--accent)' : 'var(--text-muted)',
                    fontFamily: "'DM Sans', sans-serif", transition: 'color 0.15s',
                  }}>Email</label>
                  <input
                    className="fb-input"
                    type="email"
                    placeholder="athlete@vitalis.io"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    style={{
                      background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                      borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)',
                      fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                      width: '100%', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Message */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: focused === 'message' ? 'var(--accent)' : 'var(--text-muted)',
                    fontFamily: "'DM Sans', sans-serif", transition: 'color 0.15s',
                  }}>Message</label>
                  <textarea
                    className="fb-textarea"
                    placeholder="Tell us what you think, what's broken, or what you'd love to see..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onFocus={() => setFocused('message')}
                    onBlur={() => setFocused('')}
                    rows={4}
                    style={{
                      background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                      borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)',
                      fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                      width: '100%', boxSizing: 'border-box', resize: 'none',
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 2, width: '100%',
                    background: loading ? 'var(--accent-border)' : 'var(--accent)',
                    color: '#131313', fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
                    padding: '13px 20px', borderRadius: 12, border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: loading ? 'none' : '0 4px 20px var(--shadow-glow)',
                    transition: 'all 0.15s',
                  }}
                >
                  {loading ? (
                    <><span className="fb-spinner" /> Sending…</>
                  ) : (
                    <>
                      Send Feedback
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </>
                  )}
                </button>

                <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                  Your feedback is private and goes directly to our team.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

export default FeedbackModal;