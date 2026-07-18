import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar, MobileNav, Icon } from '../../../components';
import { API_BASE_URL } from '../../../config/port';

// ─────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────
const DOCTORS_DATA = {
  beginner: [
    { id: 1,  name: "Dr. Sarah Mitchell", prof: "General Practitioner", personality: "Empathetic",  avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200", age: 42, gender: "Female", experience: "15 Years", bio: "Dedicated to holistic patient care and preventative medicine." },
    { id: 2,  name: "Dr. James Wilson",   prof: "Family Physician",     personality: "Patient",     avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200", age: 55, gender: "Male",   experience: "25 Years", bio: "Specializes in comprehensive healthcare for individuals and families." },
    { id: 3,  name: "Dr. Elena Rodriguez",prof: "Pediatrician",         personality: "Kind",        avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200", age: 38, gender: "Female", experience: "10 Years", bio: "Passionate about child development and adolescent health." },
    { id: 4,  name: "Dr. David Chen",     prof: "Nutritionist",         personality: "Practical",   avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200", age: 45, gender: "Male",   experience: "18 Years", bio: "Expert in dietary planning and metabolic health optimization." },
    { id: 5,  name: "Dr. Lisa Park",      prof: "Wellness Consultant",  personality: "Gentle",      avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200", age: 34, gender: "Female", experience: "8 Years",  bio: "Focuses on stress management and lifestyle-based healing." },
  ],
  intermediate: [
    { id: 6,  name: "Dr. Marcus Thorne",  prof: "Cardiologist",         personality: "Analytical",  avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200", age: 50, gender: "Male",   experience: "20 Years", bio: "Renowned for diagnosing complex cardiovascular conditions." },
    { id: 7,  name: "Dr. Angela Voss",    prof: "Dermatologist",        personality: "Thorough",    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=200&h=200", age: 41, gender: "Female", experience: "14 Years", bio: "Advanced expertise in clinical dermatology and skin pathology." },
    { id: 8,  name: "Dr. Robert Hales",   prof: "Orthopedic",           personality: "Direct",      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200", age: 48, gender: "Male",   experience: "19 Years", bio: "Specializes in joint reconstruction and sports injuries." },
    { id: 9,  name: "Dr. Simon Lee",      prof: "Endocrinologist",      personality: "Meticulous",  avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200", age: 53, gender: "Male",   experience: "22 Years", bio: "Leading researcher in hormonal imbalances and diabetes care." },
    { id: 10, name: "Dr. Fiona Gray",     prof: "Physical Therapist",   personality: "Encouraging", avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200", age: 36, gender: "Female", experience: "11 Years", bio: "Dedicated to post-operative recovery and mobility enhancement." },
  ],
  advanced: [
    { id: 11, name: "Dr. Victor Von",     prof: "Neurosurgeon",         personality: "Intense",     avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200", age: 58, gender: "Male",   experience: "30 Years", bio: "Pioneer in minimally invasive brain and spinal cord surgeries." },
    { id: 12, name: "Dr. Claire Redfield",prof: "Virologist",           personality: "Alert",       avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200", age: 39, gender: "Female", experience: "12 Years", bio: "At the forefront of infectious disease control and immunology." },
    { id: 13, name: "Dr. Gregory House",  prof: "Diagnostic Expert",    personality: "Academic",    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200", age: 52, gender: "Male",   experience: "24 Years", bio: "Specializes in solving rare and undiagnosed medical mysteries." },
    { id: 14, name: "Dr. Linda Hamilton", prof: "Trauma Surgeon",       personality: "Steady",      avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=200&h=200", age: 46, gender: "Female", experience: "17 Years", bio: "Veteran of critical care and emergency surgical procedures." },
    { id: 15, name: "Dr. Arthur Dayne",   prof: "Sports Medicine",      personality: "Direct",      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200", age: 44, gender: "Male",   experience: "16 Years", bio: "Consultant for professional athletes in peak performance recovery." },
  ],
};

// ─────────────────────────────────────────────
//  CategoryCard
// ─────────────────────────────────────────────
const CategoryCard = ({ title, subtitle, description, onClick, imageUrl }) => (
  <button
    onClick={onClick}
    className={`w-full p-6 sm:p-8 rounded-3xl border border-(--border-medium) bg-(--bg-hover) hover:bg-(--accent-bg) hover:border-(--accent-border) hover:scale-[1.03] hover:shadow-(--shadow-lg) transition-all duration-300 flex flex-col items-center justify-center gap-3 group`}
  >
    <div className="w-16 h-16 sm:w-24 sm:h-24 mb-2 sm:mb-4 group-hover:scale-110 transition-transform">
      <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-full border-4 border-(--border-medium) group-hover:border-(--accent-border) transition-colors shadow-lg" />
    </div>
    <h3 className="text-xl sm:text-2xl font-black text-(--text-primary) uppercase italic tracking-tighter">{title}</h3>
    <p className="text-[10px] sm:text-xs text-(--text-muted) text-center uppercase tracking-widest">{subtitle}</p>
    <p className="text-xs sm:text-sm text-(--text-secondary) text-center mt-1 sm:mt-2 px-2 sm:px-4 leading-relaxed">{description}</p>
  </button>
);

// ─────────────────────────────────────────────
//  DoctorCard
// ─────────────────────────────────────────────
const DoctorCard = ({ doctor, onSelect }) => (
  <div
    onClick={() => onSelect(doctor)}
    className="p-4 sm:p-6 rounded-3xl border border-(--border-medium) bg-(--bg-hover) hover:bg-(--accent-bg) hover:border-(--accent-border) hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer transition-all duration-300 flex flex-col items-center text-center group"
  >
    <div className="relative mb-3 sm:mb-4">
      <img src={doctor.avatar} alt={doctor.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-(--border-medium) group-hover:border-(--accent) transition-colors" />
      <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-(--accent) rounded-full border-4 border-(--bg-secondary)" />
    </div>
    <h4 className="text-base sm:text-lg font-bold text-(--text-primary) mb-1">{doctor.name}</h4>
    <p className="text-[10px] sm:text-xs text-(--accent) uppercase tracking-widest font-semibold mb-2">{doctor.prof}</p>
    <span className="px-3 py-1 bg-(--bg-hover) rounded-full text-[10px] text-(--text-muted) italic mb-3 sm:mb-4">{doctor.personality} Manner</span>
    <div className="w-full border-t border-(--border-light) pt-3 sm:pt-4 mt-2 flex flex-col gap-1.5 sm:gap-2 text-left">
      <div className="flex justify-between text-[10px] sm:text-[11px] text-(--text-secondary) uppercase tracking-wide">
        <span><strong className="text-(--text-primary)">Age:</strong> {doctor.age}</span>
        <span><strong className="text-(--text-primary)">Gender:</strong> {doctor.gender}</span>
      </div>
      <div className="text-[10px] sm:text-[11px] text-(--text-secondary) uppercase tracking-wide">
        <strong className="text-(--text-primary)">Experience:</strong> {doctor.experience}
      </div>
      <p className="text-[11px] sm:text-xs text-(--text-muted) italic mt-1 sm:mt-2 leading-relaxed border-l-2 border-(--accent-border) pl-2">
        "{doctor.bio}"
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────
//  VoiceCallScreen
// ─────────────────────────────────────────────
const VoiceCallScreen = ({ doctor, sessionId, onShowAlert, onEndCall }) => {
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
      const res  = await fetch(`${API_BASE_URL}/api/clinic/message`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          message:         text,
          doctorName:      doctor.name,
          doctorSpecialty: doctor.prof,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
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

  return (
    <div className="fixed inset-0 z-50 bg-(--bg-primary) flex flex-col items-center justify-between py-10 px-4 animate-fade-in">

      <div className="flex flex-col items-center gap-2 mt-4">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-(--accent)/70">
          Virtual Medical Clinic
        </span>
        <span className="text-(--text-muted) text-xs">{formatDuration(callDuration)}</span>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          {(callStatus === 'speaking' || callStatus === 'thinking') && (
            <>
              <div className="absolute w-52 h-52 rounded-full border border-(--accent-border) animate-ping" style={{ animationDuration: '1.8s' }} />
              <div className="absolute w-44 h-44 rounded-full border border-(--accent-border) animate-ping" style={{ animationDuration: '1.2s' }} />
            </>
          )}
          {callStatus === 'listening' && (
            <>
              <div className="absolute w-52 h-52 rounded-full border border-(--border-medium) animate-ping" style={{ animationDuration: '0.9s' }} />
              <div className="absolute w-44 h-44 rounded-full border border-(--border-heavy) animate-ping" style={{ animationDuration: '0.6s' }} />
            </>
          )}

          <div className={`w-36 h-36 rounded-full overflow-hidden border-4 transition-all duration-500 ${
            callStatus === 'speaking' ? 'border-(--accent) shadow-[0_0_40px_rgba(209,253,82,0.3)]' :
            callStatus === 'listening' ? 'border-(--text-secondary)/60 shadow-[0_0_40px_rgba(255,255,255,0.15)]' :
            callStatus === 'thinking' ? 'border-(--accent-border)' :
            'border-(--border-medium)'
          }`}>
            <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover" />
          </div>

          {callStatus === 'speaking' && (
            <div className="absolute -bottom-8 flex items-end gap-1 h-6">
              {[3,5,8,5,3,6,4,7,4,3].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-(--accent) rounded-full"
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
          <p className="text-(--accent) text-xs uppercase tracking-widest font-semibold mt-1">{doctor.prof}</p>
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
                  ? 'self-end bg-(--accent-bg) text-(--accent) text-right'
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
              isMuted ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-(--bg-hover) border border-(--border-medium) text-(--text-secondary) hover:bg-(--bg-active)'
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
          disabled={callStatus === 'thinking' || callStatus === 'speaking' || callStatus === 'connecting'}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            callStatus === 'listening'
              ? 'bg-white scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]'
              : callStatus === 'thinking' || callStatus === 'speaking' || callStatus === 'connecting'
              ? 'bg-(--bg-hover) opacity-40 cursor-not-allowed'
              : 'bg-(--accent) hover:bg-(--accent-dark) hover:scale-105 shadow-[0_0_20px_rgba(209,253,82,0.25)]'
          }`}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke={callStatus === 'listening' ? '#000' : callStatus === 'thinking' || callStatus === 'connecting' ? 'var(--text-primary)' : '#000'}
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
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all"
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
};

// ─────────────────────────────────────────────
//  ChatInterface
// ─────────────────────────────────────────────
const ChatInterface = ({ doctor, sessionId, onShowAlert, onBack, onStartVoiceCall }) => {
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [isSending,   setIsSending]   = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const endRef = useRef(null);

  const handleReset = async () => {
    if (!window.confirm('Reset this consultation? All messages will be cleared.')) return;
    setIsResetting(true);
    try {
      await fetch(`${API_BASE_URL}/api/clinic/messages/${sessionId}`, { method: 'DELETE', credentials: 'include' });
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
        const res  = await fetch(`${API_BASE_URL}/api/clinic/messages/${sessionId}`, { credentials: 'include' });
        const data = await res.json();
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
      const res  = await fetch(`${API_BASE_URL}/api/clinic/message`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId, message: userText, doctorName: doctor.name, doctorSpecialty: doctor.prof }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
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
    <div className="flex flex-col h-[calc(100dvh-190px)] sm:h-[calc(100dvh-180px)] md:h-162.5 bg-(--bg-hover) border border-(--border-medium) rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-fade-in">

      <div className="p-3 sm:p-4 border-b border-(--border-light) flex items-center gap-2 sm:gap-4 bg-white/2 shrink-0">
        <button onClick={onBack} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-(--bg-hover) flex items-center justify-center text-(--text-muted) hover:text-(--text-secondary) transition-colors shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <img src={doctor.avatar} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-(--accent-border) shrink-0" alt="" />
        <div className="flex-1 min-w-0">
          <span className="text-sm sm:text-base font-bold text-(--text-primary) block truncate">{doctor.name}</span>
          <span className="text-[10px] text-(--accent) uppercase font-bold tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-(--accent) rounded-full animate-pulse shrink-0" />
            Consultation Active
          </span>
        </div>

        <button
          onClick={onStartVoiceCall}
          title="Switch to voice call"
          className="w-9 h-9 rounded-full bg-(--accent-bg) border border-(--accent-border) hover:bg-(--accent-bg) flex items-center justify-center text-(--accent) transition-colors shrink-0"
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
              ? 'bg-(--accent) text-[#131313] self-end rounded-br-none font-medium'
              : 'bg-(--bg-hover) text-(--text-primary) rounded-bl-none border border-(--border-light)'
          }`}>
            {m.text}
          </div>
        ))}
        {isSending && (
          <div className="max-w-[80%] p-3 sm:p-4 rounded-2xl bg-(--bg-hover) text-(--text-primary) rounded-bl-none border border-(--border-light) flex gap-1 items-center">
            <span className="w-2 h-2 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 sm:p-4 bg-white/2 border-t border-(--border-light) flex gap-2 sm:gap-3 shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && !isSending && handleSend()}
          placeholder="Describe your symptoms..."
          disabled={isSending}
          className="flex-1 min-w-0 bg-(--bg-hover) border border-(--border-light) rounded-2xl px-4 py-3 text-sm text-(--text-primary) outline-none focus:border-(--accent-border) focus:bg-(--bg-active) transition-all disabled:opacity-50 placeholder:text-(--text-muted)"
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          className="w-11 h-11 sm:w-12 sm:h-12 bg-(--accent) rounded-2xl flex items-center justify-center text-[#131313] hover:bg-(--accent-dark) active:scale-90 transition-all shadow-[0_0_15px_rgba(209,253,82,0.3)] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Icon name="send" />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────
const VirtualClinic = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [currentUser,     setCurrentUser]     = useState(null);

  const [currentView,      setCurrentView]      = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDoctor,   setSelectedDoctor]   = useState(null);
  const [sessionId,        setSessionId]        = useState(null);
  const [showVoiceCall,    setShowVoiceCall]    = useState(false);

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert,    setShowAlert]    = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
        if (!res.ok) { navigate('/login'); return; }
        const data = await res.json();
        if (!data.user) { navigate('/login'); return; }
        setCurrentUser(data.user);
      } catch {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const triggerPopup = (msg) => {
    setAlertMessage(msg);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleCategorySelect = (key) => {
    setSelectedCategory(key);
    setCurrentView('doctors');
  };

  const handleDoctorSelect = async (doctor) => {
    if (!currentUser) return;
    try {
      const res  = await fetch(`${API_BASE_URL}/api/clinic/session`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: currentUser.id, doctorName: doctor.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Session creation failed');
      setSessionId(data.sessionId);
      setSelectedDoctor(doctor);
      setCurrentView('chat');
      triggerPopup(`Connected to ${doctor.name}`);
    } catch {
      triggerPopup('Failed to start consultation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary) font-['Inter',sans-serif] relative overflow-hidden">

      {/* Voice Call Overlay */}
      {showVoiceCall && selectedDoctor && sessionId && (
        <VoiceCallScreen
          doctor={selectedDoctor}
          sessionId={sessionId}
          onShowAlert={triggerPopup}
          onEndCall={() => setShowVoiceCall(false)}
        />
      )}

      {/* Popup */}
      <div className={`fixed top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:top-24 sm:right-6 z-100 w-[calc(100%-2rem)] sm:w-auto transition-all duration-500 transform ${showAlert ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="bg-(--accent) text-black px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-3 border border-black/10 text-sm">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse shrink-0" />
          {alertMessage}
        </div>
      </div>

      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      <Topbar sidebarExpanded={sidebarExpanded} userId={currentUser?.id} />

      <main className={`pt-22.5 sm:pt-25 pb-20 sm:pb-24 px-3 sm:px-6 md:px-8 transition-all duration-400 ${sidebarExpanded ? 'md:ml-60' : 'md:ml-18'}`}>
        <div className="max-w-250 mx-auto">

          {/* Header */}
          <div className="mb-6 sm:mb-10 text-center flex flex-col items-center">
            {currentView === 'categories' && (
              <>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black italic tracking-tighter text-(--text-primary) uppercase mb-2 sm:mb-3 leading-none">
                  Virtual <span className="text-(--accent)">Medical</span> Clinic
                </h1>
                <p className="text-(--text-muted) text-sm sm:text-base max-w-lg px-2">
                  Select a medical specialty to view our roster of AI specialists and begin your consultation.
                </p>
              </>
            )}
            {currentView === 'doctors' && (
              <div className="w-full flex items-center justify-between gap-4">
                <button onClick={() => { setSelectedCategory(null); setCurrentView('categories'); }} className="flex items-center gap-2 text-(--text-muted) hover:text-(--accent) transition-colors text-xs sm:text-sm font-bold uppercase tracking-widest shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  <span className="hidden xs:inline">Back to</span> Specialties
                </button>
                <h2 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter text-(--text-primary) text-right">
                  Select a <span className="text-(--accent)">Specialist</span>
                </h2>
              </div>
            )}
          </div>

          {/* VIEW 1: Categories */}
          {currentView === 'categories' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 animate-fade-in-up">
              <CategoryCard title="Primary Care"   subtitle="General Practice & Wellness" description="Comprehensive first-contact care focusing on everyday health, wellness checkups, and preventative medicine." color="blue-400"   imageUrl="https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=400&h=400" onClick={() => handleCategorySelect('beginner')} />
              <CategoryCard title="Specialists"    subtitle="Cardio, Derma & Ortho"       description="Expert care for specific body systems, offering advanced diagnosis and targeted treatment plans."              color="purple-400" imageUrl="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=400&h=400" onClick={() => handleCategorySelect('intermediate')} />
              <CategoryCard title="Surgery & Tech" subtitle="Advanced Diagnostics"        description="High-level surgical consultations and cutting-edge medical technology for complex medical cases."               color="red-400"    imageUrl="https://images.unsplash.com/photo-1551076805-e18690c5e525?auto=format&fit=crop&q=80&w=400&h=400" onClick={() => handleCategorySelect('advanced')} />
            </div>
          )}

          {/* VIEW 2: Doctors */}
          {currentView === 'doctors' && selectedCategory && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-fade-in">
              {DOCTORS_DATA[selectedCategory].map(doctor => (
                <DoctorCard key={doctor.id} doctor={doctor} onSelect={handleDoctorSelect} />
              ))}
            </div>
          )}

          {/* VIEW 3: Chat */}
          {currentView === 'chat' && selectedDoctor && (
            <div className="w-full max-w-3xl mx-auto">
              <ChatInterface
                doctor={selectedDoctor}
                sessionId={sessionId}
                onShowAlert={triggerPopup}
                onBack={() => { setSelectedDoctor(null); setSessionId(null); setCurrentView('doctors'); }}
                onStartVoiceCall={() => setShowVoiceCall(true)}
              />
            </div>
          )}

        </div>
      </main>

      <div className="md:hidden"><MobileNav /></div>

      <style>{`
        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp  { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in     { animation: fadeIn 0.4s ease-out forwards; }
        .animate-fade-in-up  { animation: fadeInUp 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default VirtualClinic;