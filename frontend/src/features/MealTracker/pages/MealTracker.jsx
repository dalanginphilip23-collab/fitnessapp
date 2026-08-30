import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, Topbar, MobileNav, Toast } from "../../../components";
import { useAuth } from "../../../hooks/useAuth";
import { useNutritionTracker } from "../hooks/useNutritionTracker";
import {
  DateNavigator,
  DailySummary,
  UploadSection,
  ResultCard,
  MealHistory,
  ManualLogForm,
} from "../components";
import { getGreeting } from "../utils";

const NutritionTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const USER_ID  = user?.id;

  const [sidebarExpanded,  setSidebarExpanded]  = useState(false);
  const [manualLogTrigger, setManualLogTrigger] = useState(0);

  const {
    result, isAnalyzing, isLogging, history, historyLoading,
    toast, summarySeed,
    selectedDate, setSelectedDate,
    handleAnalyze, handleLog, handleDeleteMeal,
  } = useNutritionTracker(USER_ID);

  useEffect(() => {
    if (!USER_ID) navigate("/login");
  }, [USER_ID, navigate]);

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="hidden md:block">
        <Sidebar onClick={() => { localStorage.removeItem('vitalis_user'); localStorage.removeItem('vitalis_session'); navigate("/login"); }} expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      </div>

      <Topbar sidebarExpanded={sidebarExpanded} userId={USER_ID} />

      <main className={`pt-14 sm:pt-16 md:pt-16 pb-24 md:pb-8 px-3 sm:px-4 md:px-6 lg:px-8 transition-all duration-[400ms] ${sidebarExpanded ? "md:ml-[240px]" : "md:ml-[72px]"}`}>
        <div className="max-w-2xl mx-auto">

          {/* ── Greeting + title + date nav ── */}
          <div className="mt-5 sm:mt-6 mb-4 sm:mb-5">
            <p className="text-xs sm:text-sm text-(--text-muted)">
              {getGreeting()}, <span className="font-semibold text-(--text-primary)">{user?.name || user?.first_name || "there"}!</span> 👋
            </p>
            <div className="flex items-center justify-between gap-3 mt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-(--text-primary) leading-tight">Nutrition Tracker</h1>
              <DateNavigator currentDate={selectedDate} onDateChange={setSelectedDate} />
            </div>
            <p className="text-xs sm:text-sm text-(--text-muted) mt-1">Track your meals. Fuel your goals.</p>
          </div>

          {/* ── Content stack ── */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <DailySummary userId={USER_ID} refreshSeed={summarySeed} selectedDate={selectedDate} />

            <UploadSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            {result && <ResultCard result={result} onLog={handleLog} isLogging={isLogging} />}

            <MealHistory meals={history} loading={historyLoading} onDeleteMeal={handleDeleteMeal} selectedDate={selectedDate} />
          </div>
        </div>
      </main>

      <div className="md:hidden"><MobileNav onFABClick={() => setManualLogTrigger(t => t + 1)} /></div>
      <ManualLogForm onLog={handleLog} shouldOpen={manualLogTrigger} />
      {toast && <Toast message={toast} />}
    </div>
  );
};

export default NutritionTracker;