import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

import {
  Sidebar,
  Topbar,
  Hero,
  CaloriesCard,
  LoadCard,
  ActivityCard,
  ClinicalAssistant,
  SleepHoursGraph,
  MobileNav,
  FAB,
} from '../../../components';

import FeedbackModal from '../../../components/FeedbackModal';

import { useClinicalAI }     from '../hooks/useClinicalAI';
import { useActivityLogger } from '../hooks/useActivityLogger';
import { useDashboardData }  from '../hooks/useDashboardData';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const USER_ID = user?.id || null;

  // Memoized so Sidebar doesn't receive a new function reference every render
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [feedbackOpen,    setFeedbackOpen]    = useState(false);

  // Memoized open/close handlers instead of inline arrow functions in JSX
  const openFeedback  = useCallback(() => setFeedbackOpen(true),  []);
  const closeFeedback = useCallback(() => setFeedbackOpen(false), []);

  const {
    data,
    insights,
    biometrics,
    setData,
    setInsights,
    setBiometrics,
    setAuthOverride,
    mergeData,
  } = useDashboardData(USER_ID);

  useEffect(() => {
    if (!user) return;
    setAuthOverride(user.name || null, user.avatar || null);
  }, [user?.name, user?.avatar, setAuthOverride]);

  const { isAnalyzing, generateClinicalInsight } =
    useClinicalAI(USER_ID, setInsights);

  const { handleLogActivity } = useActivityLogger(USER_ID, {
    setData,
    setBiometrics,
    biometrics,
    generateClinicalInsight,
    mergeData,
  });

  // Derived display values memoized so Hero doesn't re-render on unrelated state changes
  const profileName = useMemo(
    () => data.profile?.name || user?.name || 'Athlete',
    [data.profile?.name, user?.name]
  );
  const profileGoal = useMemo(
    () => data.profile?.fitness_goal || 'Unspecified',
    [data.profile?.fitness_goal]
  );
  const avatarUrl = useMemo(
    () => data.profile?.avatar_url || user?.avatar,
    [data.profile?.avatar_url, user?.avatar]
  );

  if (loading)  return null;
  if (!USER_ID) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-['Inter',sans-serif] overflow-x-hidden">
      <div className="hidden md:block">
        <Sidebar
          onClick={handleLogout}
          expanded={sidebarExpanded}
          setExpanded={setSidebarExpanded}
          onFeedback={openFeedback}
        />
      </div>
      <Topbar sidebarExpanded={sidebarExpanded} userId={USER_ID} />

      <main
        className={`pt-[80px] pb-24 md:pb-10 px-4 md:px-6 min-h-screen transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarExpanded ? 'md:ml-[240px]' : 'md:ml-[72px] ml-0'}`}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Hero Section */}
          <Hero
            name={profileName}
            goal={profileGoal}
            avatar={avatarUrl}
          />

          {/* Main Grid - 1 col mobile / 2 col tablet / 4 col desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Left Column - full width on tablet, 3 cols on desktop */}
            <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-6">

              {/* Stats Cards Row - 1 col mobile / 3 cols sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <CaloriesCard value={data.stats?.calories_burned || 0} />
                <LoadCard minutes={data.stats?.workout_duration_mins || 0} />
                <ActivityCard steps={data.stats?.steps || 0} />
              </div>

              {/* Sleep Graph Section */}
              <div className="w-full relative">
                {isAnalyzing && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-[var(--accent-bg)] px-3 py-1 rounded-full border border-[var(--accent-border)] shadow-lg">
                    <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-ping" />
                    <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">AI Scanning Vitals</span>
                  </div>
                )}
                <SleepHoursGraph biometrics={biometrics} userId={USER_ID} />
              </div>
            </div>

            {/* Right Column - Clinical Assistant */}
            <div className="md:col-span-2 lg:col-span-1">
              <ClinicalAssistant
                insights={insights}
                water={data.stats?.water_intake_ml || 0}
                sleep={data.stats?.sleep_duration || 0}
                quality={data.stats?.sleep_quality || 0}
                isAnalyzing={isAnalyzing}
                userId={USER_ID}
              />
            </div>
          </div>
        </div>
      </main>

      <div className="md:hidden"><MobileNav /></div>
      <FAB onSave={handleLogActivity} />

      {feedbackOpen && (
        <FeedbackModal onClose={closeFeedback} />
      )}
    </div>
  );
};

export default Dashboard;