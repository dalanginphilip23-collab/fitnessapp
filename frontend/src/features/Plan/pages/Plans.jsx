import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { MobileNav, Sidebar, Topbar, Icon } from '../../../components';
import usePlans from '../hooks/usePlan';
import {
  PlanDetailOverlay,
  DayTracker,
  MyPlans,
  FindPlan,
  Explore,
  TabBar,
  QuickAccessSheet,
} from '../components';

const Plans = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'explore'
  );
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  const {
    loading, authError, trainingPlans, enrolledCount,
    detailPlan, trackerPlan, trackerContent, trackerProgress,
    setDetailPlan, handleEnroll, startTracker, handleCompleteDay, closeTracker,
  } = usePlans();

  // One-shot cleanup of a ?tab= deep link; runs again only when the URL
  // actually changes (setSearchParams is stable), so this cannot loop.
  useEffect(() => {
    if (searchParams.get('tab')) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const openTrackerId = location.state?.openTracker;
    if (!openTrackerId || loading || trainingPlans.length === 0) return;
    const plan = trainingPlans.find(p => String(p.id) === String(openTrackerId));
    if (plan) {
      // Intentional one-shot sync from navigation state — the tab switch must
      // stay ordered with startTracker's side effects.
      setActiveTab('my-plans');
      startTracker(plan);
      window.history.replaceState({}, '');
    }
    // startTracker is intentionally omitted: it has unstable identity and the
    // trigger (location.state) persists, so re-running would restart tracking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.openTracker, trainingPlans, loading]);

  const requestedPlanId = searchParams.get('planId');
  const autoOpenedRef   = useRef(false);
  useEffect(() => {
    if (!requestedPlanId || autoOpenedRef.current || loading) return;
    const match = trainingPlans.find(p => String(p.id) === String(requestedPlanId));
    if (match) {
      setDetailPlan(match);
      autoOpenedRef.current = true;
      setSearchParams({}, { replace: true });
    }
  }, [requestedPlanId, trainingPlans, loading, setDetailPlan, setSearchParams]);

  const handleEnrollAndSwitch = async (planId) => {
    await handleEnroll(planId);
    setActiveTab('my-plans');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>
      <div className="hidden md:block">
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      </div>
      <Topbar sidebarExpanded={sidebarExpanded} />
      <main
        className="pt-20 sm:pt-24 pb-24 md:pb-12 px-3 sm:px-6 md:px-8 lg:px-10 min-h-screen transition-all duration-[400ms]"
      >
        <div className="max-w-7xl mx-auto">
          <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-1.5">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase" style={{ color: 'var(--accent)' }}>
                Training Store
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Performance{' '}
                <span style={{ color: 'var(--text-muted)' }}>Blueprints</span>
              </h1>
            </div>
            {enrolledCount > 0 && (
              <div
                className="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 border self-start sm:self-auto"
                style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
              >
                <Icon name="trophy" className="text-[16px] sm:text-[18px]" style={{ color: 'var(--accent)' }} fill={1} />
                <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {enrolledCount} plan{enrolledCount !== 1 ? 's' : ''} active
                </span>
              </div>
            )}
          </header>

          <TabBar active={activeTab} onChange={setActiveTab} enrolledCount={enrolledCount} />

          {loading ? (
            <div className="py-16 sm:py-20 text-center animate-pulse text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Synchronizing Blueprints...
            </div>
          ) : authError ? (
            <div className="flex flex-col items-center py-16 sm:py-20 gap-3 text-center">
              <Icon name="error" className="text-[36px] sm:text-[40px]" style={{ color: 'var(--error)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Couldn't load your blueprints</p>
              <p className="text-xs max-w-sm" style={{ color: 'var(--text-muted)' }}>{authError}</p>
            </div>
          ) : (
            <>
              {activeTab === 'my-plans' && <MyPlans plans={trainingPlans} onOpen={setDetailPlan} onContinue={startTracker} />}
              {activeTab === 'find'     && <FindPlan plans={trainingPlans} onOpen={setDetailPlan} onEnroll={handleEnrollAndSwitch} onContinue={startTracker} />}
              {activeTab === 'explore'  && <Explore  plans={trainingPlans} onOpen={setDetailPlan} onEnroll={handleEnrollAndSwitch} onContinue={startTracker} />}
            </>
          )}
        </div>
      </main>

      {detailPlan && (
        <PlanDetailOverlay
          plan={detailPlan}
          onClose={() => setDetailPlan(null)}
          onStart={() => {
            if (detailPlan.is_enrolled === 1) {
              startTracker(detailPlan);
            } else {
              handleEnrollAndSwitch(detailPlan.id);
              setDetailPlan(null);
            }
          }}
        />
      )}

      {trackerPlan && (
        <DayTracker
          plan={trackerPlan}
          content={trackerContent}
          progress={trackerProgress}
          onClose={closeTracker}
          onCompleteDay={handleCompleteDay}
        />
      )}

      <QuickAccessSheet open={quickMenuOpen} onClose={() => setQuickMenuOpen(false)} />

      <div className="md:hidden"><MobileNav onFABClick={() => setQuickMenuOpen(v => !v)} /></div>

    </div>
  );
};

export default Plans;