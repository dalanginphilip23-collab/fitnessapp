import { useState, useEffect, useRef } from 'react';
import { sendClinicMessage } from '../services/clinicService';

export default function VoiceCallScreen({ doctor, theme, sessionId, onShowAlert, onEndCall }) {
  const [callStatus, setCallStatus]       = useState('connecting');
  const [transcript, setTranscript]       = useState('');
  const [callDuration, setCallDuration]   = useState(0);
  const [messages, setMessages]           = useState([]);
  const [isMuted, setIsMuted]             = useState(false);
  const [isSpeakerOn, setIsSpeakerOn]     = useState(true);

  const recognitionRef  = useRef(null);
  const synthRef        = useRef(window.speechSynthesis);
  const durationRef     = useRef(null);
  const messagesEndRef  = useRef(null);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => {
      setCallStatus('active');
      speakText(`Hello, I am ${doctor.name}. How can I help you today?`);
    }, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (callStatus === 'active' || callStatus === 'listening' || callStatus === 'thinking' || callStatus === 'speaking') {
      durationRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(durationRef.current);
  }, [callStatus]);

  const speakText = (text) => {
    if (!isSpeakerOn) return;
    synthRef.current.cancel();
    setCallStatus('speaking');
    const utterance        = new SpeechSynthesisUtterance(text);
    utterance.rate         = 0.92;
    utterance.pitch        = 1;
    utterance.volume       = 1;

    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v =>
      doctor.gender === 'Female'
        ? v.name.toLowerCase().includes('female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen')
        : v.name.toLowerCase().includes('male')   || v.name.includes('Daniel')   || v.name.includes('Alex')    || v.name.includes('David')
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => setCallStatus('active');
    synthRef.current.speak(utterance);

    setMessages(prev => [...prev, { from: 'doctor', text }]);
  };

  const startListening = () => {
    if (isMuted) { onShowAlert("You are muted."); return; }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onShowAlert("Speech recognition not supported in this browser.");
      return;
    }

    synthRef.current.cancel();
    setCallStatus('listening');
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition       = new SpeechRecognition();
    recognitionRef.current  = recognition;

    recognition.lang          = 'en-US';
    recognition.interimResults = true;
    recognition.continuous    = false;

    recognition.onresult = (e) => {
      const interim = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(interim);
    };

    recognition.onend = async () => {
      if (!transcript && callStatus === 'listening') {
        setCallStatus('active');
        return;
      }
      await sendVoiceMessage(transcript);
    };

    recognition.onerror = (e) => {
      console.error('Speech error:', e.error);
      setCallStatus('active');
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const sendVoiceMessage = async (text) => {
    if (!text?.trim()) { setCallStatus('active'); return; }

    setMessages(prev => [...prev, { from: 'patient', text }]);
    setTranscript('');
    setCallStatus('thinking');

    try {
      const data = await sendClinicMessage({
        sessionId,
        message: text,
        doctorName: doctor.name,
        doctorSpecialty: doctor.prof,
      });
      speakText(data.reply);
    } catch (err) {
      console.error(err);
      onShowAlert("Connection lost. Please try again.");
      setCallStatus('active');
    }
  };

  const handleEndCall = () => {
    synthRef.current.cancel();
    recognitionRef.current?.stop();
    clearInterval(durationRef.current);
    onEndCall();
  };

  const statusLabel = {
    connecting: 'Connecting...',
    active:     'Tap mic to speak',
    listening:  'Listening...',
    thinking:   'Doctor is thinking...',
    speaking:   `${doctor.name.split(' ')[1]} is speaking...`,
  }[callStatus];

  const micDisabled = callStatus === 'thinking' || callStatus === 'speaking' || callStatus === 'connecting';

  return (
    <div className="fixed inset-0 z-50 bg-(--bg-primary) flex flex-col items-center justify-between py-10 px-4 animate-fade-in">

      <div className="flex flex-col items-center gap-2 mt-4">
        <span className={`text-[10px] font-bold tracking-[0.3em] uppercase ${theme.text}`}>
          Virtual Medical Clinic
        </span>
        <span className="text-(--text-muted) text-xs">{formatDuration(callDuration)}</span>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          {(callStatus === 'speaking' || callStatus === 'thinking') && (
            <>
              <div className={`absolute w-52 h-52 rounded-full border ${theme.pulseBorder} animate-ping`} style={{ animationDuration: '1.8s' }} />
              <div className={`absolute w-44 h-44 rounded-full border ${theme.pulseBorder} animate-ping`} style={{ animationDuration: '1.2s' }} />
            </>
          )}
          {callStatus === 'listening' && (
            <>
              <div className="absolute w-52 h-52 rounded-full border border-(--border-medium) animate-ping" style={{ animationDuration: '0.9s' }} />
              <div className="absolute w-44 h-44 rounded-full border border-(--border-heavy) animate-ping" style={{ animationDuration: '0.6s' }} />
            </>
          )}

          <div className={`w-36 h-36 rounded-full overflow-hidden border-4 border-(--bg-primary) transition-all duration-500 shadow-(--shadow-lg) ${
            callStatus === 'speaking'  ? `ring-4 ${theme.ring}` :
            callStatus === 'listening' ? 'ring-4 ring-(--border-heavy)' :
            callStatus === 'thinking'  ? `ring-4 ${theme.ring}` :
            'ring-2 ring-(--border-light)'
          }`}>
            <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover" />
          </div>

          {callStatus === 'speaking' && (
            <div className="absolute -bottom-8 flex items-end gap-1 h-6">
              {[3,5,8,5,3,6,4,7,4,3].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 ${theme.solid} rounded-full`}
                  style={{
                    height: `${h * 3}px`,
                    animation: `soundBar 0.6s ease-in-out infinite`,
                    animationDelay: `${i * 0.07}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <h2 className="text-2xl font-bold text-(--text-primary)">{doctor.name}</h2>
          <p className={`text-xs uppercase tracking-widest font-semibold mt-1 ${theme.text}`}>{doctor.prof}</p>
          <p className="text-(--text-muted) text-xs mt-2">{statusLabel}</p>
        </div>

        {(callStatus === 'listening' && transcript) && (
          <div className="bg-(--bg-hover) border border-(--border-medium) rounded-2xl px-5 py-3 max-w-xs text-center text-sm text-(--text-secondary) animate-fade-in">
            "{transcript}"
          </div>
        )}

        {messages.length > 0 && (
          <div className="w-full max-w-sm max-h-36 overflow-y-auto flex flex-col gap-2 px-1 [&::-webkit-scrollbar]:hidden">
            {messages.map((m, i) => (
              <div key={i} className={`text-[11px] px-3 py-1.5 rounded-xl max-w-[85%] leading-relaxed ${
                m.from === 'patient'
                  ? `self-end ${theme.chipBg} ${theme.chipText} text-right`
                  : 'self-start bg-(--bg-hover) text-(--text-secondary)'
              }`}>
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        <div className="flex gap-6">
          <button
            onClick={() => setIsMuted(m => !m)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-(--bg-hover) border border-(--border-medium) text-(--text-secondary) hover:bg-(--bg-active)'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMuted
                ? <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
                : <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
              }
            </svg>
          </button>

          <button
            onClick={() => setIsSpeakerOn(s => !s)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !isSpeakerOn ? 'bg-(--bg-hover) border border-(--border-light) text-(--text-muted)' : 'bg-(--bg-hover) border border-(--border-medium) text-(--text-secondary) hover:bg-(--bg-active)'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {!isSpeakerOn
                ? <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>
                : <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></>
              }
            </svg>
          </button>
        </div>

        <button
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          disabled={micDisabled}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-(--shadow-lg) ${
            callStatus === 'listening'
              ? `${theme.solid} scale-110`
              : micDisabled
              ? 'bg-(--bg-active) opacity-50 cursor-not-allowed'
              : `${theme.solid} ${theme.solidHover} hover:scale-105`
          }`}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke={micDisabled ? 'var(--text-muted)' : '#fff'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <p className="text-(--text-muted) text-[10px] tracking-widest uppercase">
          {callStatus === 'listening' ? 'Release to send' : 'Hold to speak'}
        </p>

        <button
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.35)] transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes soundBar {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>
    </div>
  );
}