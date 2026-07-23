import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar, MobileNav } from '../../../components';
import { useAuth } from '../../../hooks/useAuth';
import { useBMI } from '../hooks/useBMI';
import { CATEGORY_COLOR } from '../constants/bmiConstants';
import { BMIForm, BMIResultCard, AIRecommendationModal } from '../components';

const BMI = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const { user } = useAuth();
  const USER_ID = user?.id;

  useEffect(() => {
    if (!USER_ID) navigate('/login');
  }, [USER_ID, navigate]);

  const {
    weight, setWeight,
    height, setHeight,
    age, setAge,
    gender, setGender,
    bmi,
    category,
    aiSuggestion,
    isAnalyzing,
    error,
    showAIModal, setShowAIModal,
    calculateBMI,
  } = useBMI(USER_ID);

  const badgeColor = CATEGORY_COLOR[category] || 'var(--accent)';

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary) font-[Inter,sans-serif]">
      <div className="hidden md:block">
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      </div>
      <Topbar sidebarExpanded={sidebarExpanded} userId={USER_ID} />

      <main
        className={`pt-20 pb-24 px-4 md:px-6 transition-all duration-400
          ${sidebarExpanded ? 'md:ml-60' : 'md:ml-18'}`}
      >
        <div className="max-w-275 mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-(--text-primary)">
              Vitals <span className="text-(--accent)">Intelligence</span>
            </h1>
            <p className="text-(--accent) text-xs font-bold uppercase tracking-widest mt-2 opacity-60">
              Clinical Body Composition Analysis
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <BMIForm
              weight={weight} setWeight={setWeight}
              height={height} setHeight={setHeight}
              age={age} setAge={setAge}
              gender={gender} setGender={setGender}
              error={error}
              isAnalyzing={isAnalyzing}
              onCalculate={calculateBMI}
            />
            <BMIResultCard
              bmi={bmi}
              category={category}
              badgeColor={badgeColor}
              isAnalyzing={isAnalyzing}
              showAIModal={showAIModal}
              onShowAIModal={() => setShowAIModal(true)}
            />
          </div>
        </div>
      </main>

      <div className="md:hidden"><MobileNav /></div>

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
