import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar, MobileNav, Icon } from '../../../components';
import { API_BASE_URL } from '../../../config/port';

// ─────────────────────────────────────────────
//  MOCK DATA (unchanged)
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
//  CATEGORY THEMES  (green / purple / blue — matches the mock)
// ─────────────────────────────────────────────
const THEMES = {
  beginner: {
    text: 'text-emerald-600', textStrong: 'text-emerald-700',
    bgSoft: 'bg-emerald-50', bgSoftHover: 'group-hover:bg-emerald-100',
    border: 'border-emerald-100', borderHover: 'hover:border-emerald-200',
    solid: 'bg-emerald-600', solidHover: 'hover:bg-emerald-700',
    ring: 'ring-emerald-200', dot: 'bg-emerald-500',
    chipBg: 'bg-emerald-50', chipText: 'text-emerald-700', chipBorder: 'border-emerald-100',
    glow: 'shadow-[0_0_0_1px_rgba(16,185,129,0.08)]',
    pulseBorder: 'border-emerald-300',
  },
  intermediate: {
    text: 'text-violet-600', textStrong: 'text-violet-700',
    bgSoft: 'bg-violet-50', bgSoftHover: 'group-hover:bg-violet-100',
    border: 'border-violet-100', borderHover: 'hover:border-violet-200',
    solid: 'bg-violet-600', solidHover: 'hover:bg-violet-700',
    ring: 'ring-violet-200', dot: 'bg-violet-500',
    chipBg: 'bg-violet-50', chipText: 'text-violet-700', chipBorder: 'border-violet-100',
    glow: 'shadow-[0_0_0_1px_rgba(139,92,246,0.08)]',
    pulseBorder: 'border-violet-300',
  },
  advanced: {
    text: 'text-sky-600', textStrong: 'text-sky-700',
    bgSoft: 'bg-sky-50', bgSoftHover: 'group-hover:bg-sky-100',
    border: 'border-sky-100', borderHover: 'hover:border-sky-200',
    solid: 'bg-sky-600', solidHover: 'hover:bg-sky-700',
    ring: 'ring-sky-200', dot: 'bg-sky-500',
    chipBg: 'bg-sky-50', chipText: 'text-sky-700', chipBorder: 'border-sky-100',
    glow: 'shadow-[0_0_0_1px_rgba(14,165,233,0.08)]',
    pulseBorder: 'border-sky-300',
  },
};

// ─────────────────────────────────────────────
//  Small line icons (no external deps)
// ─────────────────────────────────────────────
const IconStethoscope = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v4a6 6 0 0 0 6 6a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);

const IconHeartPulse = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.4.5-4.5 2c-1.1-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    <path d="M3.2 11.5h4.9l1.2-2.2l2.1 4.6l1.6-3.6l1.1 1.2h4.4" />
  </svg>
);

const IconScalpel = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 3.5L21 7l-9.5 9.5a2.6 2.6 0 0 1-3.7 0a2.6 2.6 0 0 1 0-3.7L17.5 3.5Z" />
    <path d="M6 15l-3.5 3.5" />
    <path d="M4.5 16.5L7 19" />
  </svg>
);

// ─────────────────────────────────────────────
//  Category copy + theme lookup
// ─────────────────────────────────────────────
const CATEGORY_META = {
  beginner: {
    title: "Primary Care",
    subtitle: "General Practice & Wellness",
    description: "Comprehensive first-contact care focusing on everyday health, wellness checkups, and preventative medicine.",
    Icon: IconStethoscope,
    theme: THEMES.beginner,
  },
  intermediate: {
    title: "Specialists",
    subtitle: "Cardio, Derma & Ortho",
    description: "Expert care for specific body systems, offering advanced diagnosis and targeted treatment plans.",
    Icon: IconHeartPulse,
    theme: THEMES.intermediate,
  },
  advanced: {
    title: "Surgery & Tech",
    subtitle: "Advanced Diagnostics",
    description: "High-level surgical consultations and cutting-edge medical technology for complex medical cases.",
    Icon: IconScalpel,
    theme: THEMES.advanced,
  },
};

// ─────────────────────────────────────────────
//  CategoryCard
// ─────────────────────────────────────────────
const CategoryCard = ({ categoryKey, onClick }) => {
  const { title, subtitle, description, Icon, theme } = CATEGORY_META[categoryKey];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 sm:p-7 rounded-3xl bg-white border ${theme.border} ${theme.borderHover} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-5 group`}
    >
      <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl ${theme.bgSoft} ${theme.bgSoftHover} flex items-center justify-center transition-colors`}>
        <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${theme.text}`} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-gray-900">{title}</h3>
        <p className={`text-xs sm:text-sm font-semibold ${theme.text} mb-1`}>{subtitle}</p>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>

      <div className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full ${theme.bgSoft} ${theme.bgSoftHover} flex items-center justify-center transition-colors`}>
        <svg className={`w-4 h-4 ${theme.text} group-hover:translate-x-0.5 transition-transform`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────
//  DoctorCard
// ─────────────────────────────────────────────
const DoctorCard = ({ doctor, theme, onSelect }) => (
  <div
    onClick={() => onSelect(doctor)}
    className={`p-4 sm:p-6 rounded-3xl bg-white border ${theme.border} hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col items-center text-center group`}
  >
    <div className="relative mb-3 sm:mb-4">
      <img src={doctor.avatar} alt={doctor.name} className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white ring-2 ${theme.ring} group-hover:ring-4 transition-all`} />
      <div className={`absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 ${theme.dot} rounded-full border-4 border-white`} />
    </div>

    <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{doctor.name}</h4>
    <p className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${theme.text} mb-2`}>{doctor.prof}</p>

    <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${theme.chipBg} ${theme.chipText} border ${theme.chipBorder}`}>
        AI Specialist
      </span>
      <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] text-gray-500 italic">
        {doctor.personality}
      </span>
    </div>

    <div className="w-full border-t border-gray-100 pt-3 sm:pt-4 mt-1 flex flex-col gap-1.5 sm:gap-2 text-left">
      <div className="flex justify-between text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-wide">
        <span><strong className="text-gray-800">Age:</strong> {doctor.age}</span>
        <span><strong className="text-gray-800">Gender:</strong> {doctor.gender}</span>
      </div>
      <div className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-wide">
        <strong className="text-gray-800">Experience:</strong> {doctor.experience}
      </div>
      <p className={`text-[11px] sm:text-xs text-gray-500 italic mt-1 sm:mt-2 leading-relaxed border-l-2 ${theme.chipBorder} pl-2`}>
        "{doctor.bio}"
      </p>
    </div>

    <span className={`mt-4 inline-flex items-center gap-1 text-xs font-bold ${theme.text}`}>
      Start Consultation
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </span>
  </div>
);

// ─────────────────────────────────────────────
//  VoiceCallScreen
// ─────────────────────────────────────────────
const VoiceCallScreen = ({ doctor, theme, sessionId, onShowAlert, onEndCall }) => {
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
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-between py-10 px-4 animate-fade-in">

      <div className="flex flex-col items-center gap-2 mt-4">
        <span className={`text-[10px] font-bold tracking-[0.3em] uppercase ${theme.text}`}>
          Virtual Medical Clinic
        </span>
        <span className="text-gray-400 text-xs">{formatDuration(callDuration)}</span>
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
              <div className="absolute w-52 h-52 rounded-full border border-gray-300 animate-ping" style={{ animationDuration: '0.9s' }} />
              <div className="absolute w-44 h-44 rounded-full border border-gray-400 animate-ping" style={{ animationDuration: '0.6s' }} />
            </>
          )}

          <div className={`w-36 h-36 rounded-full overflow-hidden border-4 transition-all duration-500 shadow-lg ${
            callStatus === 'speaking' ? `border-white ring-4 ${theme.ring}` :
            callStatus === 'listening' ? 'border-white ring-4 ring-gray-300' :
            callStatus === 'thinking' ? `border-white ring-4 ${theme.ring}` :
            'border-white ring-2 ring-gray-100'
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
          <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
          <p className={`text-xs uppercase tracking-widest font-semibold mt-1 ${theme.text}`}>{doctor.prof}</p>
          <p className="text-gray-400 text-xs mt-2">{statusLabel}</p>
        </div>

        {(callStatus === 'listening' && transcript) && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 max-w-xs text-center text-sm text-gray-600 animate-fade-in">
            "{transcript}"
          </div>
        )}

        {messages.length > 0 && (
          <div className="w-full max-w-sm max-h-36 overflow-y-auto flex flex-col gap-2 px-1 [&::-webkit-scrollbar]:hidden">
            {messages.map((m, i) => (
              <div key={i} className={`text-[11px] px-3 py-1.5 rounded-xl max-w-[85%] leading-relaxed ${
                m.from === 'patient'
                  ? `self-end ${theme.chipBg} ${theme.chipText} text-right`
                  : 'self-start bg-gray-50 text-gray-600'
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
              isMuted ? 'bg-red-50 border border-red-200 text-red-500' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
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
              !isSpeakerOn ? 'bg-white border border-gray-100 text-gray-300' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
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
              ? 'bg-gray-900 scale-110 shadow-xl'
              : callStatus === 'thinking' || callStatus === 'speaking' || callStatus === 'connecting'
              ? 'bg-gray-100 opacity-60 cursor-not-allowed'
              : `${theme.solid} ${theme.solidHover} hover:scale-105`
          }`}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="#fff"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <p className="text-gray-400 text-[10px] tracking-widest uppercase">
          {callStatus === 'listening' ? 'Release to send' : 'Hold to speak'}
        </p>

        <button
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center shadow-lg transition-all"
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
const ChatInterface = ({ doctor, theme, sessionId, onShowAlert, onBack, onStartVoiceCall }) => {
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
    <div className="flex flex-col h-[calc(100dvh-190px)] sm:h-[calc(100dvh-180px)] md:h-162.5 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl animate-fade-in">

      <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center gap-2 sm:gap-4 bg-white shrink-0">
        <button onClick={onBack} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <img src={doctor.avatar} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white ring-2 ${theme.ring} shrink-0`} alt="" />
        <div className="flex-1 min-w-0">
          <span className="text-sm sm:text-base font-bold text-gray-900 block truncate">{doctor.name}</span>
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

        <button onClick={handleReset} disabled={isResetting} title="Reset consultation" className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col gap-3 sm:gap-4 bg-gray-50/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
            m.sender === 'user'
              ? `${theme.solid} text-white self-end rounded-br-none font-medium`
              : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
          }`}>
            {m.text}
          </div>
        ))}
        {isSending && (
          <div className="max-w-[80%] p-3 sm:p-4 rounded-2xl bg-white text-gray-800 rounded-bl-none border border-gray-100 flex gap-1 items-center">
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 sm:p-4 bg-white border-t border-gray-100 flex gap-2 sm:gap-3 shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && !isSending && handleSend()}
          placeholder="Describe your symptoms..."
          disabled={isSending}
          className={`flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none focus:bg-white focus:border-gray-300 transition-all disabled:opacity-50 placeholder:text-gray-400`}
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

  const activeTheme = selectedCategory ? THEMES[selectedCategory] : THEMES.beginner;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-['Poppins',sans-serif] relative overflow-hidden">

      {/* Voice Call Overlay */}
      {showVoiceCall && selectedDoctor && sessionId && (
        <VoiceCallScreen
          doctor={selectedDoctor}
          theme={activeTheme}
          sessionId={sessionId}
          onShowAlert={triggerPopup}
          onEndCall={() => setShowVoiceCall(false)}
        />
      )}

      {/* Popup */}
      <div className={`fixed top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:top-24 sm:right-6 z-100 w-[calc(100%-2rem)] sm:w-auto transition-all duration-500 transform ${showAlert ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className={`${activeTheme.solid} text-white px-5 py-3 rounded-xl font-bold shadow-xl flex items-center gap-3 text-sm`}>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse shrink-0" />
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
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black italic tracking-tighter text-gray-900 uppercase mb-2 sm:mb-3 leading-none">
                  Virtual <span className="text-emerald-600">Medical</span> Clinic
                </h1>
                <p className="text-gray-500 text-sm sm:text-base max-w-lg px-2">
                  Select a medical specialty to view our roster of AI specialists and begin your consultation.
                </p>
              </>
            )}
            {currentView === 'doctors' && (
              <div className="w-full flex items-center justify-between gap-4">
                <button onClick={() => { setSelectedCategory(null); setCurrentView('categories'); }} className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors text-xs sm:text-sm font-bold uppercase tracking-widest shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  <span className="hidden xs:inline">Back to</span> Specialties
                </button>
                <h2 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter text-gray-900 text-right">
                  Select a <span className={activeTheme.text}>Specialist</span>
                </h2>
              </div>
            )}
          </div>

          {/* VIEW 1: Categories */}
          {currentView === 'categories' && (
            <div className="flex flex-col gap-4 sm:gap-6 animate-fade-in-up max-w-2xl mx-auto w-full">
              <CategoryCard categoryKey="beginner"     onClick={() => handleCategorySelect('beginner')} />
              <CategoryCard categoryKey="intermediate" onClick={() => handleCategorySelect('intermediate')} />
              <CategoryCard categoryKey="advanced"     onClick={() => handleCategorySelect('advanced')} />
            </div>
          )}

          {/* VIEW 2: Doctors */}
          {currentView === 'doctors' && selectedCategory && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-fade-in">
              {DOCTORS_DATA[selectedCategory].map(doctor => (
                <DoctorCard key={doctor.id} doctor={doctor} theme={activeTheme} onSelect={handleDoctorSelect} />
              ))}
            </div>
          )}

          {/* VIEW 3: Chat */}
          {currentView === 'chat' && selectedDoctor && (
            <div className="w-full max-w-3xl mx-auto">
              <ChatInterface
                doctor={selectedDoctor}
                theme={activeTheme}
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