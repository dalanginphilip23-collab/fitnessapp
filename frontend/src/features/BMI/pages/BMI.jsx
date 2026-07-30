import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, Topbar, MobileNav } from "../../../components";
import { useAuth } from "../../../hooks/useAuth";
import { useBMI } from "../hooks/useBMI";
import { CATEGORY_COLOR } from "../constants/bmiConstants";
import {
  BMIForm,
  BMIResultCard,
  AIRecommendationModal,
  TdeeSummaryCard,
  MacroGrid,
} from "../components";

const BMI = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const { user } = useAuth();
  const USER_ID = user?.id;

  useEffect(() => {
    if (!USER_ID) navigate("/login");
  }, [USER_ID, navigate]);

  const {
    weight,
    setWeight,
    height,
    setHeight,
    age,
    setAge,
    gender,
    setGender,
    activityLevel,
    setActivityLevel,
    bmi,
    category,
    aiSuggestion,
    isAnalyzing,
    error,
    showAIModal,
    setShowAIModal,
    tdeeData,
    calculateBMI,
  } = useBMI(USER_ID);

  const badgeColor = CATEGORY_COLOR[category] || "var(--accent)";

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary) font-[Poppins,sans-serif]">
      <div className="hidden md:block">
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      </div>
      <Topbar sidebarExpanded={sidebarExpanded} userId={USER_ID} />

      <main
        className={`pt-20 pb-24 px-4 md:px-6 transition-all duration-400
          ${sidebarExpanded ? "md:ml-60" : "md:ml-18"}`}
      >
        <div className="max-w-275 mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-(--text-primary)">
              Vitals <span className="text-(--accent)">Intelligence</span>
            </h1>
            <p className="text-(--accent) text-xs font-bold uppercase tracking-widest mt-2 opacity-60">
              Clinical Body Composition & Calorie Analysis
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <BMIForm
              weight={weight}
              setWeight={setWeight}
              height={height}
              setHeight={setHeight}
              age={age}
              setAge={setAge}
              gender={gender}
              setGender={setGender}
              activityLevel={activityLevel}
              setActivityLevel={setActivityLevel}
              error={error}
              isAnalyzing={isAnalyzing}
              onCalculate={calculateBMI}
            />

            <div className="lg:col-span-8 flex flex-col gap-6">
              <BMIResultCard
                bmi={bmi}
                category={category}
                badgeColor={badgeColor}
                isAnalyzing={isAnalyzing}
                showAIModal={showAIModal}
                onShowAIModal={() => setShowAIModal(true)}
              />

              {/* NEW — only appears once the backend returns TDEE data */}
              {tdeeData && (
                <>
                  <TdeeSummaryCard
                    bmr={tdeeData.bmr}
                    tdee={tdeeData.tdee}
                    tdeeWeekly={tdeeData.tdeeWeekly}
                    activityLevel={activityLevel}
                  />
                  <MacroGrid goals={tdeeData.goals} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="md:hidden">
        <MobileNav />
      </div>

      {showAIModal && (
        <AIRecommendationModal
          bmi={bmi}
          category={category}
          badgeColor={badgeColor}
          isAnalyzing={isAnalyzing}
          aiSuggestion={aiSuggestion}
          onClose={() => setShowAIModal(false)}
        />
      )}
    </div>
  );
};

export default BMI;
