// pages/Profile.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar, MobileNav, Topbar } from '../../../components';
import { useProfile } from '../hooks/useProfile';
import { useAvatar }  from '../hooks/useAvatar';
import Toast from '../components/Toast';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { DEFAULT_AVATARS, getAvatarUrl } from '../utils/avatar';

const RecordRow = ({ label, locked, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3.5 border-b border-dashed border-(--border-light) last:border-0">
    <div className="flex items-center gap-2 sm:w-45 shrink-0">
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted)">{label}</span>
      {locked && (
        <span className="material-symbols-outlined text-[11px] text-(--text-disabled)">lock</span>
      )}
    </div>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

const rowInputBase = 'w-full bg-transparent outline-none text-[13px] font-medium transition-all';
const rowEditable  = `${rowInputBase} text-(--text-primary) border-b border-transparent focus:border-[#c7f248]/50 pb-0.5`;
const rowLocked    = `${rowInputBase} font-['JetBrains_Mono',monospace] text-(--text-secondary) cursor-default select-text`;

const StatPill = ({ icon, value, label }) => (
  <div className="flex flex-col items-center gap-1 bg-(--bg-hover) rounded-2xl px-4 py-3 border border-(--border-light) flex-1 min-w-20">
    <span className="material-symbols-outlined text-[18px] text-[#62aa1a]">{icon}</span>
    <span className="text-base font-black text-(--text-primary) leading-none">{value}</span>
    <span className="text-[9px] font-bold uppercase tracking-widest text-(--text-muted)">{label}</span>
  </div>
);

const LogEntry = ({ icon, title, sub, current, onRevoke }) => (
  <div className={`flex items-center gap-3 px-3.5 py-3 border-l-2 transition-all ${
    current ? 'border-[#62aa1a] bg-[#7dd625e1]/4' : 'border-(--border-light) hover:border-(--border-heavy) hover:bg-(--bg-hover)'
  }`}>
    <span className={`material-symbols-outlined text-[16px] ${current ? 'text-[#62aa1a]' : 'text-(--text-secondary)'}`}>{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold text-(--text-primary) truncate">{title}</p>
      <p className="text-[9px] font-['JetBrains_Mono',monospace] text-(--text-muted) truncate">{sub}</p>
    </div>
    {current ? (
      <span className="text-[8px] font-black tracking-[0.12em] uppercase bg-[#254900]/10 text-[#62aa1a] border border-[#7dd625e1]/20 px-2 py-1 rounded-md shrink-0">
        Active
      </span>
    ) : (
      <button
        onClick={onRevoke}
        className="text-[9px] font-bold uppercase tracking-widest text-red-400/50 hover:text-red-400 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-all border border-transparent hover:border-red-500/20 shrink-0"
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
  const navigate = useNavigate(); // NEW: only used for the back button

  const {
    USER_ID,
    loading, isLoading, isSaving, isEditing, isDirty,
    toastVisible, toastMessage, toastVariant,
    sessions,
    dailyStats,
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

  const recordId = `VTS-${String(USER_ID).padStart(4, '0')}`;

  const bmi = computeBMI(formData.height_cm, formData.weight_kg);
  const bmiInfo = bmiCategory(bmi);

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary) font-['Inter'] flex overflow-x-hidden">
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
        variant={toastVariant}
      />

      <Sidebar expanded={expanded} setExpanded={setExpanded} onClick={handleLogout} />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-400 ease-in-out ${expanded ? 'md:ml-60' : 'md:ml-18'}`}>
        <Topbar sidebarExpanded={expanded} userId={USER_ID} />

        <div
          className="relative w-full overflow-hidden mt-14 sm:mt-15"
          style={{
            height: '160px',
            background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 60%, var(--bg-primary) 100%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, var(--border-medium) 0, var(--border-medium) 1px, transparent 1px, transparent 28px)',
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }}
          />

          {/* NEW: Back button, top-left over the banner */}
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="absolute top-4 left-4 sm:top-5 sm:left-6 w-9 h-9 rounded-xl flex items-center justify-center
              bg-(--bg-primary)/60 hover:bg-(--bg-primary)/90 border border-(--border-light) backdrop-blur-sm
              transition-all active:scale-95 z-20"
          >
            <span className="material-symbols-outlined text-[20px] text-(--text-primary)">arrow_back</span>
          </button>
        </div>

        <main className="w-full max-w-160 mx-auto px-4 sm:px-6 lg:px-10 pb-28 md:pb-16 -mt-14 relative z-10">

          {/* ── Centered header: avatar / name / badge / email (like reference) ── */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-(--bg-primary) bg-(--bg-tertiary) flex items-center justify-center shadow-xl">
                {avatarSrc
                  ? <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                  : <span className="text-3xl font-black text-[#7dd625e1] font-['Manrope']">{initials}</span>
                }
              </div>
              <button
                onClick={() => setPickerOpen(v => !v)}
                aria-label="Edit avatar"
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#7dd625e1] rounded-full flex items-center justify-center border-2 border-(--bg-primary) hover:scale-105 active:scale-95 transition-transform shadow-lg"
              >
                <span className="material-symbols-outlined text-[14px] text-[#1a2800]">photo_camera</span>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-['Manrope'] font-black text-(--text-primary) tracking-tight">
                {formData.fullName || 'Your Name'}
              </h1>
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#7dd625e1]/10 text-[#7dd625e1] border border-[#7dd625e1]/20">
                Pro Member
              </span>
            </div>
            <p className="mt-1 text-[11px] text-(--text-muted) font-medium">{formData.email}</p>
            <p className="text-[10px] text-(--text-disabled) font-['JetBrains_Mono',monospace] font-bold tracking-widest mt-0.5">
              Record No. {recordId}
            </p>

            {isDirty && (
              <div className="flex items-center gap-2 sm:gap-3 mt-5">
                <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved
                </span>
                <button
                  onClick={handleDiscard}
                  className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-(--text-muted) hover:text-(--text-secondary) rounded-lg hover:bg-(--bg-hover) transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#62aa1a] text-[#161f00] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all disabled:opacity-60 hover:brightness-105"
                >
                  {isSaving && <span className="w-3 h-3 border-2 border-[#161f00]/30 border-t-[#161f00] rounded-full animate-spin" />}
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}
          </div>

          {pickerOpen && (
            <div className="mb-6 bg-(--bg-secondary) border border-(--border-medium) rounded-2xl p-5" style={{ animation: 'fadeIn 0.15s ease' }}>
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

          {/* Tabs — same state/logic, now full-width centered pills instead of a left-aligned bar */}
          <div className="flex justify-center border-b border-(--border-light) mb-6 gap-8">
            {[
              { id: 'profile',  label: 'Record',      icon: 'description' },
              { id: 'security', label: 'Access Log',  icon: 'shield'      },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-[10px] font-black uppercase tracking-[0.18em] border-b-2 transition-all -mb-px ${
                  activeTab === tab.id
                    ? 'text-[#62aa1a] border-[#62aa1a]'
                    : 'text-(--text-disabled) border-transparent hover:text-(--text-muted)'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Everything below is now a single vertical stack of list-style groups ── */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-5">

              <div className="bg-(--bg-secondary) border border-(--border-light) rounded-2xl p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted) mb-4">Today's activity</p>
                <div className="flex gap-2">
                  <StatPill icon="local_fire_department" value={Number(dailyStats.calories_burned || 0).toLocaleString()} label="kcal" />
                  <StatPill icon="footprint"              value={Number(dailyStats.steps || 0).toLocaleString()}          label="Steps" />
                  <StatPill icon="timer"                  value={Number(dailyStats.workout_duration_mins || 0)}           label="Min" />
                </div>
              </div>

              <div className="bg-(--bg-secondary) border border-(--border-light) rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted)">Vitals</p>
                  <span className="material-symbols-outlined text-[12px] text-(--text-disabled)">lock</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-(--text-disabled) block mb-1">Height (cm)</span>
                    <span className={rowLocked}>{formData.height_cm || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-(--text-disabled) block mb-1">Weight (kg)</span>
                    <span className={rowLocked}>{formData.weight_kg || '—'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-dashed border-(--border-light)">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-(--text-disabled)">BMI</span>
                  <span className="text-[11px] font-black" style={{ color: bmiInfo.color }}>
                    {bmi != null ? bmi : '—'} {bmi != null && <span className="text-[9px] font-bold uppercase tracking-widest ml-1">{bmiInfo.label}</span>}
                  </span>
                </div>
                <Link
                  to="/bmi"
                  className="mt-3 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#62aa1a]/70 hover:text-[#62aa1a] transition-colors"
                >
                  <span className="material-symbols-outlined text-[12px]">monitoring</span>
                  Update on BMI page
                </Link>
              </div>

              <div className="bg-(--bg-secondary) border border-(--border-light) rounded-2xl p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted) mb-3">Chart notes · Goal</p>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#7dd625e1]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-[#7dd625e1]">flag</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-(--text-primary) leading-snug">
                      {formData.bio || 'No goal set yet'}
                    </p>
                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="text-[9px] font-bold uppercase tracking-widest text-[#62aa1a]/70 hover:text-[#62aa1a] transition-colors mt-1">
                        Edit goal →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-(--bg-secondary) border border-(--border-light) rounded-2xl p-6 relative overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-10 h-10 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, transparent 50%, var(--border-light) 50%)' }}
                />

                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted)">Patient information</p>
                  <button
                    onClick={() => setIsEditing(v => !v)}
                    className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border rounded-lg px-3 py-1.5 transition-all ${
                      isEditing
                        ? 'border-[#62aa1a]/30 bg-[#62aa1a]/8 text-[#62aa1a] hover:border-[#62aa1a]/50 hover:text-[#62aa1a]'
                        : 'border-(--border-medium) bg-(--bg-hover) text-(--text-secondary) hover:border-(--border-heavy) hover:text-(--text-primary)'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">{isEditing ? 'check' : 'edit'}</span>
                    {isEditing ? 'Done' : 'Edit'}
                  </button>
                </div>

                <div className="mt-3">
                  <RecordRow label="Full name">
                    <input
                      className={isEditing ? rowEditable : rowLocked}
                      type="text"
                      value={formData.fullName}
                      onChange={e => handleInputChange(e, 'fullName')}
                      readOnly={!isEditing}
                      placeholder="Your full name"
                    />
                  </RecordRow>

                  <RecordRow label="Clinical email" locked>
                    <input className={rowLocked} type="email" value={formData.email} readOnly />
                  </RecordRow>

                  <RecordRow label="Emergency contact">
                    <input
                      className={isEditing ? rowEditable : rowLocked}
                      type="text"
                      value={formData.contact}
                      onChange={e => handleInputChange(e, 'contact')}
                      readOnly={!isEditing}
                      placeholder="Name · phone number"
                    />
                  </RecordRow>

                  <RecordRow label="Record status">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#62aa1a]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#62aa1a] animate-pulse" />
                      Active file
                    </span>
                  </RecordRow>
                </div>
              </div>

              <div className="bg-(--bg-secondary) border border-red-500/10 rounded-2xl p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted) mb-3">Account</p>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-red-400 text-[11px] font-bold hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Sign out
                  </span>
                  <span className="material-symbols-outlined text-[14px] opacity-40">chevron_right</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="flex flex-col gap-5">
              <div className="bg-(--bg-secondary) border border-(--border-light) rounded-2xl p-6">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted) mb-4">This device</p>
                {currentSession ? (
                  <LogEntry
                    icon="smartphone"
                    title={`${currentSession.browser} on ${currentSession.os}`}
                    sub={`ACTIVE NOW · ${[currentSession.city, currentSession.country].filter(Boolean).join(', ') || 'UNKNOWN LOCATION'}`}
                    current
                  />
                ) : (
                  <p className="text-[11px] text-(--text-disabled) text-center py-6">No session data</p>
                )}
              </div>

              <div className="bg-(--bg-secondary) border border-(--border-light) rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted)">Access log</p>
                  {otherSessions.length > 0 && (
                    <button onClick={() => otherSessions.forEach(s => handleRevoke(s.id))} className="text-[9px] font-bold uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors">
                      Revoke all
                    </button>
                  )}
                </div>
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
                        sub={[s.city, s.country].filter(Boolean).join(', ').toUpperCase() || 'UNKNOWN LOCATION'}
                        onRevoke={() => handleRevoke(s.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-(--bg-secondary) border border-(--border-light) rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-(--bg-hover) flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-(--text-secondary)">lock</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-(--text-primary)">Password</p>
                    <p className="text-[11px] text-(--text-muted) mt-0.5">Keep your account secure with a strong, unique password</p>
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