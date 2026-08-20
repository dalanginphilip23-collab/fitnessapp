import { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/ui/Icon';
import { sendClinicMessage, getClinicMessages, deleteClinicMessages } from '../services/clinicService';

export default function ChatInterface({ doctor, theme, sessionId, onShowAlert, onBack, onStartVoiceCall }) {
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [isSending,   setIsSending]   = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const endRef = useRef(null);

  const handleReset = async () => {
    if (!window.confirm('Reset this consultation? All messages will be cleared.')) return;
    setIsResetting(true);
    try {
      await deleteClinicMessages(sessionId);
      setMessages([{ sender: 'ai', text: `Consultation reset. I am ${doctor.name}, your ${doctor.prof}. How can I help you today?` }]);
    } catch {
      onShowAlert('Failed to reset chat. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      try {
        const data = await getClinicMessages(sessionId);
        if (data.length > 0) {
          setMessages(data.map(r => ({ sender: r.sender, text: r.message })));
        } else {
          setMessages([{ sender: 'ai', text: `Good day. I am ${doctor.name}, your ${doctor.prof}. How are you feeling today? I'm here to provide ${doctor.personality} medical guidance.` }]);
        }
      } catch {
        setMessages([{ sender: 'ai', text: `Good day. I am ${doctor.name}, your ${doctor.prof}. How are you feeling today?` }]);
      }
    };
    load();
  }, [sessionId, doctor]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) { onShowAlert('Please type your concern first.'); return; }
    if (!sessionId)    { onShowAlert('Session not ready. Please try again.'); return; }

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsSending(true);

    try {
      const data = await sendClinicMessage({
        sessionId,
        message: userText,
        doctorName: doctor.name,
        doctorSpecialty: doctor.prof,
      });
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch {
      onShowAlert('Failed to send message. Please try again.');
      setMessages(prev => prev.slice(0, -1));
      setInput(userText);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-190px)] sm:h-[calc(100dvh-180px)] md:h-162.5 bg-(--bg-hover) border border-(--border-medium) rounded-2xl sm:rounded-3xl overflow-hidden shadow-(--shadow-lg) animate-fade-in">

      <div className="p-3 sm:p-4 border-b border-(--border-light) flex items-center gap-2 sm:gap-4 bg-(--bg-primary) shrink-0">
        <button onClick={onBack} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-(--bg-hover) flex items-center justify-center text-(--text-muted) hover:text-(--text-secondary) transition-colors shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <img src={doctor.avatar} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-(--bg-primary) ring-2 ${theme.ring} shrink-0`} alt="" />
        <div className="flex-1 min-w-0">
          <span className="text-sm sm:text-base font-bold text-(--text-primary) block truncate">{doctor.name}</span>
          <span className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 ${theme.text}`}>
            <span className={`w-1.5 h-1.5 ${theme.dot} rounded-full animate-pulse shrink-0`} />
            Consultation Active
          </span>
        </div>

        <button
          onClick={onStartVoiceCall}
          title="Switch to voice call"
          className={`w-9 h-9 rounded-full ${theme.chipBg} border ${theme.chipBorder} flex items-center justify-center ${theme.text} transition-colors shrink-0`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6 6l1.8-1.8a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </button>

        <button onClick={handleReset} disabled={isResetting} title="Reset consultation" className="w-9 h-9 rounded-full hover:bg-red-500/10 flex items-center justify-center text-(--text-muted) hover:text-red-400 transition-colors disabled:opacity-50 shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col gap-3 sm:gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
            m.sender === 'user'
              ? `${theme.solid} text-white self-end rounded-br-none font-medium`
              : 'bg-(--bg-active) text-(--text-primary) rounded-bl-none border border-(--border-light)'
          }`}>
            {m.text}
          </div>
        ))}
        {isSending && (
          <div className="max-w-[80%] p-3 sm:p-4 rounded-2xl bg-(--bg-active) text-(--text-primary) rounded-bl-none border border-(--border-light) flex gap-1 items-center">
            <span className="w-2 h-2 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 sm:p-4 bg-(--bg-primary) border-t border-(--border-light) flex gap-2 sm:gap-3 shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && !isSending && handleSend()}
          placeholder="Describe your symptoms..."
          disabled={isSending}
          className="flex-1 min-w-0 bg-(--bg-active) border border-(--border-light) rounded-2xl px-4 py-3 text-sm text-(--text-primary) outline-none focus:border-(--border-heavy) focus:bg-(--bg-hover) transition-all disabled:opacity-50 placeholder:text-(--text-muted)"
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          className={`w-11 h-11 sm:w-12 sm:h-12 ${theme.solid} ${theme.solidHover} rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
        >
          <Icon name="send" />
        </button>
      </div>
    </div>
  );
}