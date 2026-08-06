// pages/Profile.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, MobileNav, Topbar } from '../../../components';
import { useProfile } from '../hooks/useProfile';
import { useAvatar }  from '../hooks/useAvatar';
import Toast from '../components/Toast';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { DEFAULT_AVATARS, getAvatarUrl } from '../utils/avatar';
import { calcMacros, MACRO_SPLITS, ACTIVITY_LEVELS } from '../../BMI/constants/bmiConstants';

/* ── Small presentational helpers (styling only, no logic) ───────────────── */

const SectionHeader = ({ icon, title, right }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[16px] text-[#62aa1a]">{icon}</span>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-muted)">{title}</p>
    </div>
    {right}
  </div>
);

const StatCard = ({ icon, value, unit, label }) => (
  <div className="flex-1 min-w-[92px] flex flex-col items-center gap-0.5 bg-[#62aa1a]/[0.07] border border-[#62aa1a]/10 rounded-2xl px-3 py-4">
    <span className="material-symbols-outlined text-[20px] text-[#62aa1a] mb-1">{icon}</span>
    <span className="text-xl font-black text-(--text-primary) leading-none font-['Manrope']">{value}</span>
    <span className="text-[9px] font-semibold text-(--text-muted)">{unit}</span>
    <span className="text-[9px] font-bold uppercase tracking-widest text-(--text-secondary) mt-0.5">{label}</span>
  </div>
);

const InfoRow = ({ label, locked, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3.5 border-b border-dashed border-(--border-light) last:border-0">
    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-(--text-muted) shrink-0 sm:w-44">
      {label}
      {locked && <span className="material-symbols-outlined text-[12px] text-(--text-disabled)">lock</span>}
    </span>
    <div className="flex-1 min-w-0 sm:text-right">{children}</div>
  </div>
);

const rowInputBase = 'w-full bg-transparent outline-none text-[13px] font-medium transition-all';
const rowEditable  = `${rowInputBase} text-(--text-primary) border-b border-transparent focus:border-[#c7f248]/50 pb-0.5 sm:text-right`;
const rowLocked    = `${rowInputBase} text-(--text-secondary) cursor-default select-text sm:text-right`;

const LogEntry = ({ icon, title, sub, current, onRevoke }) => (
  <div className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all ${
    current ? 'border-[#62aa1a]/15 bg-[#62aa1a]/[0.05]' : 'border-transparent hover:bg-(--bg-hover) hover:border-(--border-light)'
  }`}>
    <span className={`material-symbols-outlined text-[16px] ${current ? 'text-[#62aa1a]' : 'text-(--text-secondary)'}`}>{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold text-(--text-primary) truncate">{title}</p>
      <p className="text-[9px] font-medium text-(--text-muted) truncate">{sub}</p>
    </div>
    {current ? (
      <span className="text-[8px] font-black tracking-[0.12em] uppercase bg-[#62aa1a]/10 text-[#62aa1a] border border-[#62aa1a]/20 px-2 py-1 rounded-md shrink-0">
        Active
      </span>
    ) : (
      <button
        onClick={onRevoke}
        className="text-[9px] font-bold uppercase tracking-widest text-red-400/60 hover:text-red-400 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-all border border-transparent hover:border-red-500/20 shrink-0"
      >
        Revoke
      </button>
    )}
  </div>
);

// BMI is derived, not stored — computed live from height/weight (read-only here).
const computeBMI = (heightCm, weightKg) => {
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  if (!h || !w) return null;
  const m = h / 100;
  return +(w / (m * m)).toFixed(1);
};

const bmiCategory = (bmi) => {
  if (bmi == null) return { label: '—', color: 'var(--text-disabled)' };
  if (bmi < 18.5)  return { label: 'Underweight', color: '#60a5fa' };
  if (bmi < 25)    return { label: 'Normal',      color: '#c7f248' };
  if (bmi < 30)    return { label: 'Overweight',  color: '#f59e0b' };
  return                 { label: 'Obese',        color: '#f87171' };
};

const Profile = () => {
  const navigate = useNavigate();

  const {
    USER_ID,
    loading, isLoading, isSaving, isEditing, isDirty,
    toastVisible, toastMessage, toastVariant,
    sessions,
    dailyStats, bmiRecord,
    formData, avatarSrc,
    setToastVisible, setAvatarSrc, setPendingAvatar, setIsEditing,
    handleInputChange, handleDiscard, handleSave, handleLogout,
    handleRevoke,
    showToast,
  } = useProfile();

  const {
    uploadPreview,
    fileInputRef,
    handleSelectPreset,
    handleFileChange,
    handleRemoveAvatar,
  } = useAvatar({ setAvatarSrc, setPendingAvatar });

  const [expanded,   setExpanded]   = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [activeTab,  setActiveTab]  = React.useState('profile');
  const [changePwOpen, setChangePwOpen] = React.useState(false);
  const [showBmiDetails, setShowBmiDetails] = React.useState(false);
  const [macroSplit, setMacroSplit] = React.useState(MACRO_SPLITS[0].id);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-(--accent-border) border-t-[#254900] rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--text-muted)">Loading…</p>
        </div>
      </div>
    );
  }
  if (!USER_ID) return null;

  const initials = formData.fullName
    ? formData.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const currentSession = sessions.find(s => s.is_current);
  const otherSessions  = sessions.filter(s => !s.is_current);

  const recordId = `VTL-${String(USER_ID).padStart(3, '0')}`;

  const bmi = computeBMI(formData.height_cm, formData.weight_kg);
  const bmiInfo = bmiCategory(bmi);

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary) font-['Poppins'] flex overflow-x-hidden">
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
        variant={toastVariant}
      />

      <Sidebar expanded={expanded} setExpanded={setExpanded} onClick={handleLogout} />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-400 ease-in-out ${expanded ? 'md:ml-60' : 'md:ml-18'}`}>
        <Topbar sidebarExpanded={expanded} userId={USER_ID} />

        <main className="w-full max-w-164 mx-auto px-4 sm:px-6 lg:px-10 pt-5 sm:pt-7 pb-28 md:pb-16">

          {/* ── Header card: avatar / name / badges / email / edit + tabs ── */}
          <div className="bg-(--bg-card) border border-(--border-light) rounded-3xl overflow-hidden">
            <div className="p-5 sm:p-6">
              <button
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-(--text-muted) hover:text-(--text-primary) transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                Back
              </button>

              <div className="flex items-start gap-4 sm:gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-(--bg-primary) bg-(--bg-tertiary) flex items-center justify-center shadow-md">
                    {avatarSrc
                      ? <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                      : <span className="text-3xl font-black text-[#62aa1a] font-['Manrope']">{initials}</span>
                    }
                  </div>
                  <button
                    onClick={() => setPickerOpen(v => !v)}
                    aria-label="Edit avatar"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#62aa1a] rounded-full flex items-center justify-center border-2 border-(--bg-card) hover:scale-105 active:scale-95 transition-transform shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#1a2800]">photo_camera</span>
                  </button>
                </div>

                {/* Name / badges / email / edit button */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <h1 className="text-2xl sm:text-3xl font-['Manrope'] font-black text-(--text-primary) tracking-tight truncate">
                        {formData.fullName || 'Your Name'}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#62aa1a]/10 text-[#62aa1a] border border-[#62aa1a]/20">
                          <span className="material-symbols-outlined text-[12px]">workspace_premium</span>
                          Pro Member
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-(--bg-hover) text-(--text-muted) border border-(--border-light)">
                          <span className="material-symbols-outlined text-[12px]">badge</span>
                          ID {recordId}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => isEditing ? handleDiscard() : setIsEditing(true)}
                      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border rounded-xl px-3.5 py-2 transition-all shrink-0 ${
                        isEditing
                          ? 'border-[#62aa1a]/30 bg-[#62aa1a]/8 text-[#62aa1a]'
                          : 'border-(--border-medium) bg-(--bg-hover) text-(--text-secondary) hover:border-(--border-heavy) hover:text-(--text-primary)'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{isEditing ? 'close' : 'edit'}</span>
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  <p className="flex items-center gap-1.5 mt-3 text-[12px] text-(--text-muted) font-medium truncate">
                    <span className="material-symbols-outlined text-[14px]">mail</span>
                    {formData.email}
                  </p>
                </div>
              </div>

              {isDirty && (
                <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-dashed border-(--border-light)">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Unsaved changes
                  </span>
                  <div className="flex-1" />
                  <button onClick={handleDiscard} className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-(--text-muted) hover:text-(--text-secondary) rounded-lg hover:bg-(--bg-hover) transition-all">
                    Discard
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-[#62aa1a] text-[#161f00] px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all disabled:opacity-60 hover:brightness-105">
                    {isSaving && <span className="w-3 h-3 border-2 border-[#161f00]/30 border-t-[#161f00] rounded-full animate-spin" />}
                    {isSaving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-t border-(--border-light) px-1 sm:px-2">
              {[
                { id: 'profile',  label: 'Overview', icon: 'grid_view' },
                { id: 'security', label: 'Security',  icon: 'shield'   },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-black uppercase tracking-[0.15em] border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'text-[#62aa1a] border-[#62aa1a]'
                      : 'text-(--text-disabled) border-transparent hover:text-(--text-muted)'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar picker panel */}
          {pickerOpen && (
            <div className="mt-5 bg-(--bg-card) border border-(--border-light) rounded-2xl p-5" style={{ animation: 'fadeIn 0.15s ease' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted)">Choose avatar</p>
                <button onClick={() => setPickerOpen(false)} aria-label="Close avatar picker">
                  <span className="material-symbols-outlined text-[16px] text-(--text-muted) hover:text-(--text-primary) transition-colors">close</span>
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-5">
                {DEFAULT_AVATARS.map(av => {
                  const url = getAvatarUrl(av.seed);
                  const isActive = avatarSrc === url;
                  return (
                    <button key={av.id} onClick={() => { handleSelectPreset(av.seed); setPickerOpen(false); setIsEditing(true); }} className="flex flex-col items-center gap-1.5 group">
                      <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${isActive ? 'border-[#62aa1a] shadow-[0_0_0_3px_rgba(98,170,26,0.15)]' : 'border-(--border-medium) group-hover:border-[#62aa1a]/50'}`}>
                        <img src={url} alt={av.label} className="w-full h-full object-cover" />
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? 'text-[#62aa1a]' : 'text-(--text-muted)'}`}>{av.label}</span>
                    </button>
                  );
                })}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handleFileChange(e); setPickerOpen(false); setIsEditing(true); }} />
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 border border-dashed border-(--border-medium) hover:border-[#62aa1a]/40 rounded-xl flex items-center justify-center gap-2 hover:bg-[#62aa1a]/3 transition-all group">
                <span className="material-symbols-outlined text-[16px] text-(--text-muted) group-hover:text-[#62aa1a] transition-colors">upload</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted) group-hover:text-(--text-secondary) transition-colors">Upload custom photo</span>
              </button>
              {uploadPreview && (
                <div className="mt-3 flex items-center gap-3 bg-[#62aa1a]/5 px-3 py-2.5 rounded-xl border border-[#62aa1a]/15">
                  <img src={uploadPreview} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-[#62aa1a]/30" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#62aa1a]">Custom photo ready</span>
                </div>
              )}
              {avatarSrc && (
                <button
                  onClick={() => { handleRemoveAvatar(); setIsEditing(true); }}
                  className="w-full mt-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-(--text-muted) hover:text-red-400 transition-colors"
                >
                  Remove avatar
                </button>
              )}
            </div>
          )}

          {/* ── Overview tab ── */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-5 mt-5">

              {/* Health overview */}
              <div className="bg-(--bg-card) border border-(--border-light) rounded-2xl p-5">
                <SectionHeader icon="bolt" title="Health Overview" />
                <p className="text-[11px] text-(--text-muted) -mt-3 mb-4">Your summary for today</p>
                <div className="flex gap-2.5">
                  <StatCard icon="local_fire_department" value={Number(dailyStats.calories_burned || 0).toLocaleString()} unit="kcal" label="Calories" />
                  <StatCard icon="footprint"              value={Number(dailyStats.steps || 0).toLocaleString()}          unit="steps" label="Steps" />
                  <StatCard icon="timer"                  value={Number(dailyStats.workout_duration_mins || 0)}           unit="mins"  label="Active Minutes" />
                </div>
              </div>

              {/* Body metrics */}
              <div className="bg-(--bg-card) border border-(--border-light) rounded-2xl p-5">
                <SectionHeader
                  icon="monitor_heart"
                  title="Body Metrics"
                  right={
                    <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-(--text-muted) bg-(--bg-hover) border border-(--border-light) px-2.5 py-1.5 rounded-lg">
                      <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                      This Week
                    </span>
                  }
                />

                <div className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-(--text-disabled) block mb-0.5">Weight</span>
                    {isEditing ? (
                      <input className={rowEditable} type="number" step="0.1" value={formData.weight_kg} onChange={e => handleInputChange(e, 'weight_kg')} />
                    ) : (
                      <span className={rowLocked}>{formData.weight_kg ? `${formData.weight_kg} kg` : '—'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-(--text-disabled) block mb-0.5">Height</span>
                    {isEditing ? (
                      <input className={rowEditable} type="number" step="0.1" value={formData.height_cm} onChange={e => handleInputChange(e, 'height_cm')} />
                    ) : (
                      <span className={rowLocked}>{formData.height_cm ? `${formData.height_cm} cm` : '—'}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-(--text-disabled) block mb-0.5">BMI</span>
                    <span className="text-[13px] font-black" style={{ color: bmiInfo.color }}>
                      {bmi != null ? bmi : '—'}
                      {bmi != null && <span className="text-[8px] font-bold uppercase tracking-widest ml-1.5" style={{ color: bmiInfo.color }}>{bmiInfo.label}</span>}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowBmiDetails(s => !s)}
                  className="mt-4 pt-3 w-full flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#62aa1a] hover:brightness-110 transition-colors border-t border-(--border-light)"
                >
                  View All Metrics
                  <span className={`material-symbols-outlined text-[14px] transition-transform ${showBmiDetails ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {showBmiDetails && (
                  <div className="mt-3 pt-3 border-t border-dashed border-(--border-light) space-y-3">

                    {/* Age/Gender — always visible when expanded */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-(--text-disabled) block mb-0.5">Age</span>
                        {isEditing ? (
                          <input className={rowEditable} type="number" value={formData.age} onChange={e => handleInputChange(e, 'age')} placeholder="25" />
                        ) : (
                          <span className={rowLocked}>{formData.age || '—'}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-(--text-disabled) block mb-0.5">Gender</span>
                        {isEditing ? (
                          <select
                            className="w-full bg-transparent outline-none text-[12px] font-medium border-b border-transparent focus:border-[#c7f248]/50 pb-0.5 text-(--text-primary) appearance-none cursor-pointer sm:text-right"
                            value={formData.gender}
                            onChange={e => handleInputChange(e, 'gender')}
                          >
                            <option value="male" className="bg-(--bg-secondary)">Male</option>
                            <option value="female" className="bg-(--bg-secondary)">Female</option>
                            <option value="other" className="bg-(--bg-secondary)">Other</option>
                          </select>
                        ) : (
                          <span className={rowLocked}>{formData.gender || '—'}</span>
                        )}
                      </div>
                    </div>

                    {/* Activity Level — always visible when expanded */}
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-(--text-disabled) block mb-0.5">Activity Level</span>
                      {isEditing ? (
                        <select
                          className="w-full bg-transparent outline-none text-[13px] font-medium border-b border-transparent focus:border-[#c7f248]/50 pb-0.5 text-(--text-primary) appearance-none cursor-pointer"
                          value={formData.activity_level}
                          onChange={e => handleInputChange(e, 'activity_level')}
                        >
                          {ACTIVITY_LEVELS.map(lvl => (
                            <option key={lvl.id} value={lvl.id} className="bg-(--bg-secondary)">{lvl.label} — {lvl.desc}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={rowLocked}>{formData.activity_level ? ACTIVITY_LEVELS.find(l => l.id === formData.activity_level)?.label || formData.activity_level : '—'}</span>
                      )}
                    </div>

                    {/* TDEE Display — full layout when data exists */}
                    {bmiRecord?.tdee ? (
                      <>
                        {/* Hero Section */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a2a1a] to-[#0d1a0d] border border-[#c7f248]/20 p-4 text-center">
                          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_0%,#c7f248,transparent_70%)]" />
                          <span className="relative text-[7px] font-bold uppercase tracking-[0.25em] text-[#c7f248]/60">Total Daily Energy Expenditure</span>
                          <div className="relative mt-0.5 flex items-baseline justify-center gap-1">
                            <span className="text-[28px] font-black text-[#c7f248] tracking-tight">{bmiRecord.tdee?.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-(--text-disabled)">kcal</span>
                          </div>
                          <div className="relative mt-1.5 flex items-center justify-center gap-3 text-[9px] text-(--text-muted)">
                            <span>BMR <strong className="text-(--text-primary)">{bmiRecord.bmr?.toLocaleString()}</strong></span>
                            <span className="text-(--text-disabled)">|</span>
                            <span>Activity <strong className="text-(--text-primary)">{bmiRecord.tdee - bmiRecord.bmr}</strong></span>
                          </div>
                        </div>

                        {/* Calorie Zones */}
                        <div>
                          <span className="text-[7px] font-bold uppercase tracking-widest text-(--text-muted) block mb-2">Calorie Targets</span>
                          <div className="flex gap-2">
                            {[
                              { label: 'Cut', value: Math.round(bmiRecord.tdee - 500), color: '#f87171', desc: 'Fat loss' },
                              { label: 'Maintain', value: bmiRecord.tdee, color: '#c7f248', desc: 'Current weight' },
                              { label: 'Bulk', value: Math.round(bmiRecord.tdee + 500), color: '#60a5fa', desc: 'Muscle gain' },
                            ].map(g => (
                              <div key={g.label} className="flex-1 bg-(--bg-hover) rounded-xl p-2.5 text-center">
                                <span className="text-[6px] font-bold uppercase tracking-widest block" style={{ color: g.color }}>{g.label}</span>
                                <span className="text-[13px] font-black text-(--text-primary)">{g.value?.toLocaleString()}</span>
                                <span className="text-[6px] text-(--text-disabled) block">{g.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Macro Split Selector + Breakdown */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[7px] font-bold uppercase tracking-widest text-(--text-muted)">Macronutrients</span>
                            <div className="flex gap-0.5">
                              {MACRO_SPLITS.map(split => (
                                <button
                                  key={split.id}
                                  onClick={() => setMacroSplit(split.id)}
                                  className={`text-[6px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md transition-colors ${
                                    split.id === macroSplit
                                      ? 'bg-[#c7f248]/15 text-[#c7f248]'
                                      : 'text-(--text-disabled) hover:text-(--text-muted)'
                                  }`}
                                >
                                  {split.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          {(() => {
                            const macros = calcMacros(bmiRecord.tdee, MACRO_SPLITS.find(s => s.id === macroSplit) || MACRO_SPLITS[0]);
                            const totalCals = macros.protein.calories + macros.fat.calories + macros.carb.calories;
                            const items = [
                              { ...macros.protein, label: 'Protein', color: '#f87171', pct: Math.round(macros.protein.calories / totalCals * 100) },
                              { ...macros.fat, label: 'Fat', color: '#f59e0b', pct: Math.round(macros.fat.calories / totalCals * 100) },
                              { ...macros.carb, label: 'Carbs', color: '#60a5fa', pct: Math.round(macros.carb.calories / totalCals * 100) },
                            ];
                            return (
                              <>
                                <div className="h-2 rounded-full bg-(--bg-hover) overflow-hidden flex mb-3">
                                  {items.map(m => (
                                    <div key={m.label} style={{ width: m.pct + '%', backgroundColor: m.color, opacity: 0.7 }} />
                                  ))}
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {items.map(m => (
                                    <div key={m.label} className="bg-(--bg-hover) rounded-xl p-2.5 text-center">
                                      <span className="text-[7px] font-bold uppercase tracking-widest block" style={{ color: m.color }}>{m.label}</span>
                                      <span className="text-[13px] font-black text-(--text-primary)">{m.grams}g</span>
                                      <span className="text-[7px] text-(--text-disabled) block">{m.calories} kcal · {m.pct}%</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[7px] text-(--text-disabled)">
                            {bmiRecord.activity_level
                              ? ACTIVITY_LEVELS.find(l => l.id === bmiRecord.activity_level)?.label || bmiRecord.activity_level
                              : 'Activity not set'}
                          </span>
                          <span className="text-[7px] text-(--text-disabled) font-mono">
                            {bmiRecord.recorded_at || ''}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="bg-(--bg-hover) rounded-xl p-3 text-center">
                        {bmi != null ? (
                          <>
                            <p className="text-[9px] text-(--text-muted) mb-1.5">
                              {!formData.age
                                ? 'Enter your age and activity level to unlock full calorie data.'
                                : 'Set your activity level and save to calculate your calorie needs.'}
                            </p>
                            <button onClick={() => setIsEditing(true)} className="text-[8px] font-bold uppercase tracking-widest text-[#62aa1a]/70 hover:text-[#62aa1a] transition-colors">
                              Edit Profile →
                            </button>
                          </>
                        ) : (
                          <p className="text-[9px] text-(--text-muted)">
                            Update your height and weight to see BMI calculations.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Patient information */}
              <div className="bg-(--bg-card) border border-(--border-light) rounded-2xl p-5">
                <SectionHeader
                  icon="badge"
                  title="Patient Information"
                  right={
                    <button
                      onClick={() => isEditing ? handleDiscard() : setIsEditing(true)}
                      className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest border rounded-lg px-3 py-1.5 transition-all ${
                        isEditing
                          ? 'border-[#62aa1a]/30 bg-[#62aa1a]/8 text-[#62aa1a]'
                          : 'border-(--border-medium) bg-(--bg-hover) text-(--text-secondary) hover:border-(--border-heavy) hover:text-(--text-primary)'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">{isEditing ? 'check' : 'edit'}</span>
                      {isEditing ? 'Done' : 'Edit Information'}
                    </button>
                  }
                />

                <div>
                  <InfoRow label="Full Name">
                    <input
                      className={isEditing ? rowEditable : rowLocked}
                      type="text"
                      value={formData.fullName}
                      onChange={e => handleInputChange(e, 'fullName')}
                      readOnly={!isEditing}
                      placeholder="Your full name"
                    />
                  </InfoRow>

                  <InfoRow label="Clinical Email" locked>
                    <input className={rowLocked} type="email" value={formData.email} readOnly />
                  </InfoRow>

                  <InfoRow label="Emergency Contact">
                    {isEditing ? (
                      <input
                        className={rowEditable}
                        type="text"
                        value={formData.contact}
                        onChange={e => handleInputChange(e, 'contact')}
                        placeholder="Name · phone number"
                      />
                    ) : formData.contact ? (
                      <span className={rowLocked}>{formData.contact}</span>
                    ) : (
                      <span className="text-[13px] text-(--text-muted)">
                        None ·{' '}
                        <button onClick={() => setIsEditing(true)} className="text-[#62aa1a] font-bold hover:underline">
                          Add Contact
                        </button>
                      </span>
                    )}
                  </InfoRow>

                  <InfoRow label="Goal / Notes">
                    {isEditing ? (
                      <textarea
                        className={`${rowEditable} resize-none min-h-[36px] leading-snug`}
                        rows={1}
                        value={formData.bio}
                        onChange={e => handleInputChange(e, 'bio')}
                        placeholder="Add a note or fitness goal…"
                      />
                    ) : (
                      <span className="text-[13px] italic text-(--text-secondary)">
                        {formData.bio ? `"${formData.bio}"` : '—'}
                      </span>
                    )}
                  </InfoRow>
                </div>
              </div>

              {/* Account */}
              <div className="bg-(--bg-card) border border-(--border-light) rounded-2xl p-5">
                <SectionHeader icon="settings" title="Account" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-red-400 text-[12px] font-bold hover:bg-red-500/10 border border-(--border-light) hover:border-red-500/20 transition-all"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                  </span>
                  <span className="material-symbols-outlined text-[15px] opacity-40">chevron_right</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Security tab ── */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-5 mt-5">
              <div className="bg-(--bg-card) border border-(--border-light) rounded-2xl p-5 sm:p-6">
                <SectionHeader icon="devices" title="This Device" />
                {currentSession ? (
                  <LogEntry
                    icon="smartphone"
                    title={`${currentSession.browser} on ${currentSession.os}`}
                    sub={`Active now · ${[currentSession.city, currentSession.country].filter(Boolean).join(', ') || 'Unknown location'}`}
                    current
                  />
                ) : (
                  <p className="text-[11px] text-(--text-disabled) text-center py-6">No session data</p>
                )}
              </div>

              <div className="bg-(--bg-card) border border-(--border-light) rounded-2xl p-5 sm:p-6">
                <SectionHeader
                  icon="history"
                  title="Access Log"
                  right={otherSessions.length > 0 && (
                    <button onClick={() => otherSessions.forEach(s => handleRevoke(s.id))} className="text-[9px] font-bold uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors">
                      Revoke all
                    </button>
                  )}
                />
                {otherSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                    <span className="material-symbols-outlined text-[32px] text-(--text-disabled)">devices</span>
                    <p className="text-[11px] text-(--text-disabled)">No other entries logged</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {otherSessions.map(s => (
                      <LogEntry
                        key={s.id}
                        icon="laptop_mac"
                        title={`${s.browser} on ${s.os}`}
                        sub={[s.city, s.country].filter(Boolean).join(', ') || 'Unknown location'}
                        onRevoke={() => handleRevoke(s.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-(--bg-card) border border-(--border-light) rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-(--bg-hover) flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px] text-(--text-secondary)">lock</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black font-['Manrope'] text-(--text-primary)">Password</p>
                    <p className="text-[11px] text-(--text-muted) mt-1">Keep your account secure with a strong, unique password</p>
                  </div>
                  <button
                    onClick={() => setChangePwOpen(true)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-(--border-medium) bg-(--bg-hover) text-(--text-secondary) hover:text-(--text-primary) hover:border-(--border-heavy) px-4 py-2.5 rounded-xl transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">key</span>
                    Change
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="md:hidden"><MobileNav /></div>

      {changePwOpen && (
        <ChangePasswordModal
          onClose={() => setChangePwOpen(false)}
          onSuccess={() => showToast('Password updated')}
        />
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

export default Profile;