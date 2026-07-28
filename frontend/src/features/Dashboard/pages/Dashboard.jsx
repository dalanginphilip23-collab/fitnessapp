import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
  Sidebar, Topbar, Hero, ProgramSummaryCard,
  ClinicalAssistant, SleepHoursGraph, MobileNav, FAB,
} from '../../../components';
import FeedbackModal from '../../../components/FeedbackModal';
import { useClinicalAI }     from '../hooks/useClinicalAI';
import { useActivityLogger } from '../hooks/useActivityLogger';
import { useDashboardData }  from '../hooks/useDashboardData';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const USER_ID = user?.id || null;

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [feedbackOpen,    setFeedbackOpen]    = useState(false);

  const openFeedback  = useCallback(() => setFeedbackOpen(true),  []);
  const closeFeedback = useCallback(() => setFeedbackOpen(false), []);

  const { data, insights, biometrics, setData, setInsights, setBiometrics, mergeData, setAuthOverride } = useDashboardData(USER_ID);

  useEffect(() => {
    if (!user) return;
    setAuthOverride(user.name || null, user.avatar || null);
  }, [user?.name, user?.avatar]);

  const { isAnalyzing, generateClinicalInsight } = useClinicalAI(USER_ID, setInsights);

  const { handleLogActivity } = useActivityLogger(USER_ID, { setData, setBiometrics, biometrics, generateClinicalInsight, mergeData });

  const heroName = data.profile?.name || user?.name || 'Athlete';
  const heroGoal = data.profile?.fitness_goal || 'Unspecified';
  const heroAvatar = data.profile?.avatar_url || user?.avatar;
  const activeProgramCount = data.stats?.active_program_count ?? 0;

  if (loading)  return null;
  if (!USER_ID) return null;

  return (
    <div className="min-h-screen w-full bg-(--bg-primary) text-(--text-primary) overflow-x-hidden">
      <div className="hidden md:block">
        <Sidebar onClick={handleLogout} expanded={sidebarExpanded} setExpanded={setSidebarExpanded} onFeedback={openFeedback} />
      </div>

      <Topbar sidebarExpanded={sidebarExpanded} userId={USER_ID} />

      <main
        className={`
          w-full min-h-screen pt-[64px] sm:pt-[72px] md:pt-[80px] pb-24 md:pb-10
          px-3 sm:px-4 md:px-6 lg:px-8
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarExpanded ? 'md:ml-[240px]' : 'md:ml-[72px] ml-0'}
        `}
      >
        <div className="w-full max-w-[1400px] mx-auto">
          <Hero name={heroName} goal={heroGoal} avatar={heroAvatar} activeProgramCount={activeProgramCount} />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 lg:gap-6 items-start">
            <div className="xl:col-span-3 flex flex-col gap-5 lg:gap-6 min-w-0">
              <ProgramSummaryCard
                goalLabel={activeProgramCount > 0 ? `${activeProgramCount} active program${activeProgramCount !== 1 ? 's' : ''}` : 'No active program'}
                calories={{ value: data.stats?.calories_burned || 0, goal: 800 }}
                steps={{ value: data.stats?.steps || 0, goal: 10000 }}
                sessionLoadMins={{ value: data.stats?.workout_duration_mins || 0, goal: 120 }}
                onChangeProgram={() => navigate('/dashboard/plans')}
                onSeeMore={() => navigate('/dashboard/analytics')}
              />

              <div className="w-full min-w-0 relative">
                {isAnalyzing && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5 bg-(--accent-bg) px-2.5 py-1 rounded-full border border-(--accent-border) shadow-lg">
                    <div className="w-1.5 h-1.5 bg-(--accent) rounded-full animate-ping" />
                    <span className="text-[8px] sm:text-[9px] font-black text-(--accent) uppercase tracking-widest truncate">
                      AI Scanning Vitals
                    </span>
                  </div>
                )}
                <SleepHoursGraph biometrics={biometrics} userId={USER_ID} />
              </div>
            </div>

            <div className="xl:col-span-1 min-w-0">
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

      {feedbackOpen && <FeedbackModal onClose={closeFeedback} />}
    </div>
  );
};

export default Dashboard;