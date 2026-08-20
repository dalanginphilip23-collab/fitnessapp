import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar, MobileNav } from '../../../components';
import { CategoryCard, DoctorCard, VoiceCallScreen, ChatInterface } from '../components';
import { DOCTORS_DATA, THEMES } from '../constants';
import { createClinicSession } from '../services/clinicService';
import { fetchMe } from '../../../api/authService';

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
        const { ok, data } = await fetchMe();
        if (!ok) { navigate('/login'); return; }
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
      const data = await createClinicSession(currentUser.id, doctor.name);
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
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary) font-['Poppins',sans-serif] relative overflow-hidden">

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
        <div className={`${activeTheme.solid} text-white px-5 py-3 rounded-xl font-bold shadow-(--shadow-lg) flex items-center gap-3 text-sm`}>
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
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black italic tracking-tighter text-(--text-primary) uppercase mb-2 sm:mb-3 leading-none">
                  Virtual <span className="text-emerald-500">Medical</span> Clinic
                </h1>
                <p className="text-(--text-muted) text-sm sm:text-base max-w-lg px-2">
                  Select a medical specialty to view our roster of AI specialists and begin your consultation.
                </p>
              </>
            )}
            {currentView === 'doctors' && (
              <div className="w-full flex items-center justify-between gap-4">
                <button onClick={() => { setSelectedCategory(null); setCurrentView('categories'); }} className="flex items-center gap-2 text-(--text-muted) hover:text-(--text-secondary) transition-colors text-xs sm:text-sm font-bold uppercase tracking-widest shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  <span className="hidden xs:inline">Back to</span> Specialties
                </button>
                <h2 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter text-(--text-primary) text-right">
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