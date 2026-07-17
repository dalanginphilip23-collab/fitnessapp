import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar, MobileNav, Icon } from '../../../components';
import { API_BASE_URL } from '../../../config/port';
import { useAuth } from '../../../hooks/useAuth';

const BMI = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const { user } = useAuth();
  const USER_ID = user?.id;

  const [weight,       setWeight]       = useState('');
  const [height,       setHeight]       = useState('');
  const [age,          setAge]          = useState('');
  const [gender,       setGender]       = useState('other');
  const [bmi,          setBmi]          = useState(null);
  const [category,     setCategory]     = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isAnalyzing,  setIsAnalyzing]  = useState(false);
  const [error,        setError]        = useState('');
  const [showAIModal,  setShowAIModal]  = useState(false);

  useEffect(() => {
    if (!USER_ID) navigate('/login');
  }, [USER_ID, navigate]);

  const calculateBMI = async () => {
    if (!weight || !height) {
      setError('Please enter both weight and height.');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    setAiSuggestion('');
    setShowAIModal(true);

    const heightM  = parseFloat(height) / 100;
    const bmiValue = parseFloat((parseFloat(weight) / (heightM * heightM)).toFixed(1));
    let cat = '';
    if (bmiValue < 18.5)    cat = 'Underweight';
    else if (bmiValue < 25) cat = 'Healthy Weight';
    else if (bmiValue < 30) cat = 'Overweight';
    else                    cat = 'Obese';
    setBmi(bmiValue);
    setCategory(cat);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bmi/${USER_ID}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight_kg: parseFloat(weight),
          height_cm: parseFloat(height),
          age:       age    || null,
          gender:    gender || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save BMI');
      if (data.aiSuggestion) setAiSuggestion(data.aiSuggestion);
    } catch (err) {
      console.error('[BMI] Error:', err.message);
      setAiSuggestion(
        'Focus on high-density nutrition and maintaining a consistent activity log to optimize your body composition.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const categoryColor = {
    'Underweight':    'var(--success)',
    'Healthy Weight': 'var(--accent)',
    'Overweight':     'var(--warning)',
    'Obese':          'var(--error)',
  };
  const badgeColor = categoryColor[category] || 'var(--accent)';

  const inputCls =
    'w-full bg-(--input-bg) border border-(--border-medium) rounded-2xl p-4 text-sm outline-none ' +
    'focus:border-(--accent) transition-all text-(--text-primary) placeholder:text-(--text-secondary)';

  const optionStyle = { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' };

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

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-(--text-primary)">
              Vitals <span className="text-(--accent)">Intelligence</span>
            </h1>
            <p className="text-(--accent) text-xs font-bold uppercase tracking-widest mt-2 opacity-60">
              Clinical Body Composition Analysis
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── Input Form ── */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-(--bg-tertiary) border border-(--border-medium) rounded-4xl p-6">
                <h2 className="text-(--accent) font-black uppercase text-[10px] tracking-[0.25em] mb-6">
                  Metrics Input
                </h2>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-(--text-primary) font-bold mb-2 block">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="0"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-(--text-primary) font-bold mb-2 block">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="0"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-(--text-primary) font-bold mb-2 block">
                      Age (Optional)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Enter age"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-(--text-primary) font-bold mb-2 block">
                      Gender (For Accuracy)
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-(--input-bg) border border-(--border-medium) rounded-2xl p-4 text-sm outline-none focus:border-(--accent) text-(--text-primary) appearance-none cursor-pointer transition-all"
                    >
                      <option value="male"   style={optionStyle}>Male</option>
                      <option value="female" style={optionStyle}>Female</option>
                      <option value="other"  style={optionStyle}>Other / Prefer not to say</option>
                    </select>
                  </div>

                  {error && (
                    <p className="text-(--error) text-xs font-semibold">{error}</p>
                  )}

                  <button
                    onClick={calculateBMI}
                    disabled={isAnalyzing}
                    className="w-full py-4 bg-(--accent) text-(--text-inverse) font-black uppercase text-[11px] tracking-widest rounded-2xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Process Biometrics'}
                  </button>
                </div>
              </div>

              {/* BMI Scale */}
              <div className="bg-(--bg-tertiary) border border-(--border-medium) rounded-4xl p-5">
                <h3 className="text-(--accent) font-black uppercase text-[10px] tracking-[0.25em] mb-4">
                  BMI Scale
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Underweight', range: '< 18.5',      color: 'var(--success)' },
                    { label: 'Healthy',     range: '18.5 – 24.9', color: 'var(--accent)'  },
                    { label: 'Overweight',  range: '25 – 29.9',   color: 'var(--warning)' },
                    { label: 'Obese',       range: '≥ 30',        color: 'var(--error)'   },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-xs text-(--text-muted)">{item.label}</span>
                      </div>
                      <span className="text-xs text-(--text-disabled) font-mono">{item.range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Results ── */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* BMI Big Card */}
              <div className="bg-(--bg-tertiary) border border-(--border-medium) rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: bmi
                      ? `radial-gradient(ellipse at 30% 50%, ${badgeColor}10 0%, transparent 70%)`
                      : 'none',
                  }}
                />

                <div className="relative z-10">
                  <p className="text-(--accent) font-black uppercase text-[11px] tracking-[0.4em] mb-2">
                    Calculated BMI
                  </p>
                  <h3
                    className={`leading-none transition-all duration-500 ${
                      bmi
                        ? 'text-8xl md:text-9xl font-black italic tracking-tighter'
                        : 'text-2xl md:text-3xl font-bold uppercase tracking-widest'
                    }`}
                    style={{ color: bmi ? badgeColor : 'var(--text-disabled)' }}
                  >
                    {bmi || 'No Data'}
                  </h3>
                  <div className="flex items-center gap-2 mt-4">
                    <span
                      className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500"
                      style={{
                        background: bmi ? `${badgeColor}18` : 'var(--bg-hover)',
                        color:      bmi ? badgeColor         : 'var(--text-disabled)',
                        border:     `1px solid ${bmi ? badgeColor + '30' : 'transparent'}`,
                      }}
                    >
                      {category || 'Awaiting Metrics'}
                    </span>
                  </div>

                  {bmi && !showAIModal && (
                    <button
                      onClick={() => setShowAIModal(true)}
                      className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-(--accent) hover:opacity-80 transition-opacity"
                    >
                      <Icon name="neurology" className="text-sm" />
                      View AI Recommendation
                    </button>
                  )}
                </div>

                <div className="mt-8 md:mt-0 relative">
                  <div className="w-40 h-40 border-12 border-(--border-light) rounded-full flex items-center justify-center relative">
                    <div
                      className="w-32 h-32 border-12 rounded-full transition-all duration-500"
                      style={{
                        borderColor: bmi ? `${badgeColor}30` : 'var(--border-light)',
                        animation:   isAnalyzing ? 'pulse 1.5s infinite' : 'none',
                      }}
                    />
                    <Icon name="monitoring" className="absolute text-4xl" style={{ color: bmi ? `${badgeColor}80` : 'var(--text-disabled)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="md:hidden"><MobileNav /></div>

      {/* ── AI Recommendation Popup ── */}
      {showAIModal && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isAnalyzing) setShowAIModal(false);
          }}
        >
          <div
            className="w-full max-w-md bg-(--bg-tertiary) border border-(--accent-border) rounded-4xl p-8 relative shadow-2xl"
            style={{ animation: 'bmiModalIn 0.25s ease' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-8 right-8 h-0.5 bg-linear-to-r from-(--accent) via-(--accent-border) to-transparent rounded-full opacity-60" />

            {isAnalyzing ? (
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-(--accent) rounded-full animate-ping" />
                <span className="text-[9px] font-black text-(--accent) uppercase tracking-[0.2em]">
                  Clinical Analysis...
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowAIModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-(--bg-hover) hover:bg-(--bg-active) flex items-center justify-center transition-colors"
              >
                <Icon name="close" className="text-(--text-muted) text-base" />
              </button>
            )}

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-(--accent) rounded-2xl">
                <Icon name="neurology" className="text-xl" style={{ color: 'var(--text-inverse)' }} />
              </div>
              <h3 className="font-black uppercase text-sm tracking-[0.15em] text-(--accent)">
                Vitalis AI Recommendation
              </h3>
            </div>

            {bmi && (
              <div className="flex items-center gap-3 mb-5 bg-(--bg-hover) rounded-2xl p-4">
                <span className="text-3xl font-black italic" style={{ color: badgeColor }}>
                  {bmi}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                  style={{ background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}30` }}
                >
                  {category}
                </span>
              </div>
            )}

            <div className="text-base font-medium leading-relaxed italic min-h-15">
              {isAnalyzing ? (
                <span className="text-(--text-disabled) animate-pulse">
                  Processing your biometrics...
                </span>
              ) : aiSuggestion ? (
                <span className="text-(--text-secondary)">{`"${aiSuggestion}"`}</span>
              ) : (
                <span className="text-(--text-disabled)">
                  No insight available yet.
                </span>
              )}
            </div>

            {!isAnalyzing && (
              <button
                onClick={() => setShowAIModal(false)}
                className="w-full mt-7 py-3.5 bg-(--accent) text-(--text-inverse) font-black uppercase text-[11px] tracking-widest rounded-2xl hover:brightness-110 active:scale-95 transition-all"
              >
                Got it
              </button>
            )}
          </div>

          <style>{`
            @keyframes bmiModalIn {
              from { opacity: 0; transform: scale(0.95) translateY(12px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default BMI;