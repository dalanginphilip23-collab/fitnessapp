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
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-(--text-muted)">{title}</p>
    </div>
    {right}
  </div>
);

const StatCard = ({ icon, value, unit, label }) => (
  <div className="flex-1 min-w-0 flex flex-col items-center gap-1.5 bg-(--bg-hover) rounded-xl px-2 py-4">
    <span className="material-symbols-outlined text-[18px] text-[#62aa1a]">{icon}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-black text-(--text-primary) leading-none font-['Manrope']">{value}</span>
      <span className="text-[10px] font-semibold text-(--text-muted) leading-none">{unit}</span>
    </div>
    <span className="text-[9px] font-bold uppercase tracking-wider text-(--text-secondary) leading-none">{label}</span>
  </div>
);

const InfoRow = ({ label, locked, children }) => (
  <div className="flex items-center justify-between gap-3 py-3.5 border-b border-(--border-light) last:border-0">
    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-(--text-muted) shrink-0 sm:w-36">
      {label}
      {locked && <span className="material-symbols-outlined text-[12px] text-(--text-disabled)">lock</span>}
    </span>
    <div className="flex-1 min-w-0 sm:text-right">{children}</div>
  </div>
);

const rowInputBase = 'w-full bg-transparent outline-none text-[13px] font-medium transition-all';
const rowEditable  = `${rowInputBase} text-(--text-primary) border-b border-transparent focus:border-[#c7f248]/50 pb-0.5 sm:text-right`;
const rowLocked    = `${rowInputBase} text-(--text-secondary) cursor-default select-text sm:text-right`;

const selectBase = 'w-full bg-transparent outline-none text-[13px] font-medium border-b border-transparent focus:border-[#c7f248]/50 pb-0.5 text-(--text-primary) appearance-none cursor-pointer';

const LogEntry = ({ icon, title, sub, current, onRevoke }) => (
  <div className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all ${
    current ? 'border-[#62aa1a]/20 bg-[#62aa1a]/[0.06]' : 'border-transparent hover:bg-(--bg-hover) hover:border-(--border-light)'
  }`}>
    <span className={`material-symbols-outlined text-[16px] ${current ? 'text-[#62aa1a]' : 'text-(--text-secondary)'}`}>{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-semibold text-(--text-primary) truncate">{title}</p>
      <p className="text-[10px] font-medium text-(--text-muted) truncate">{sub}</p>
    </div>
    {current ? (
      <span className="text-[8px] font-black tracking-[0.1em] uppercase bg-[#62aa1a]/10 text-[#62aa1a] border border-[#62aa1a]/20 px-2 py-1 rounded-md shrink-0">
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

// Grouped-settings menu row: icon, title/subtitle, and either a chevron (navigate /
// action) or an expand caret (accordion). Purely presentational — the caller decides
// what tapping it does.
const MenuRow = ({ icon, iconColor = '#62aa1a', title, subtitle, onClick, expanded, expandable, danger }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-(--bg-hover) transition-colors border-b border-(--border-light) last:border-0"
  >
    <div className="w-10 h-10 rounded-full bg-(--bg-hover) flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-[18px]" style={{ color: iconColor }}>{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-[13px] font-semibold truncate ${danger ? 'text-red-400' : 'text-(--text-primary)'}`}>{title}</p>
      {subtitle && <p className="text-[10.5px] font-medium text-(--text-muted) truncate mt-0.5">{subtitle}</p>}
    </div>
    <span className={`material-symbols-outlined text-[18px] text-(--text-disabled) shrink-0 transition-transform ${expandable && expanded ? 'rotate-180' : ''}`}>
      {expandable ? 'expand_more' : 'chevron_right'}
    </span>
  </button>
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
  const [openSection, setOpenSection] = React.useState(null); // 'account' | 'metrics' | 'security' | null
  const [changePwOpen, setChangePwOpen] = React.useState(false);
  const [showBmiDetails, setShowBmiDetails] = React.useState(false);
  const [macroSplit, setMacroSplit] = React.useState(MACRO_SPLITS[0].id);

  const toggleSection = (id) => setOpenSection(s => (s === id ? null : id));

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

        <main className="w-full max-w-[640px] mx-auto px-3 sm:px-4 md:px-6 pt-6 sm:pt-8 mt-14 sm:mt-15 pb-28 md:pb-16">

          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-(--text-muted) hover:text-(--text-primary) transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back
          </button>

          <h1 className="text-lg font-black font-['Manrope'] text-(--text-primary) mb-3">Profile</h1>

          {/* ── Identity banner ── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1f3a0d] to-[#0d1a05] border border-[#62aa1a]/25 px-5 py-5">
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_100%_0%,#c7f248,transparent_60%)]" />
            <div className="relative flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#c7f248]/40 bg-(--bg-tertiary) flex items-center justify-center shadow-sm">
                  {avatarSrc
                    ? <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                    : <span className="text-xl font-black text-[#c7f248] font-['Manrope']">{initials}</span>
                  }
                </div>
                <button
                  onClick={() => setPickerOpen(v => !v)}
                  aria-label="Edit avatar"
                  className="absolute bottom-0 right-0 w-6 h-6 bg-[#c7f248] rounded-full flex items-center justify-center border-2 border-[#0d1a05] hover:scale-105 active:scale-95 transition-transform shadow-md"
                >
                  <span className="material-symbols-outlined text-[11px] text-[#1a2800]">photo_camera</span>
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-['Manrope'] font-black text-white tracking-tight truncate">
                  {formData.fullName || 'Your Name'}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-[#c7f248]/70 font-medium truncate mt-0.5">
                  {formData.email}
                </p>
                <span className="inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70 mt-1.5">
                  <span className="material-symbols-outlined text-[10px]">badge</span>
                  ID {recordId}
                </span>
              </div>

              <button
                onClick={() => isEditing ? handleDiscard() : setIsEditing(true)}
                aria-label={isEditing ? 'Cancel editing' : 'Edit profile'}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isEditing ? 'bg-[#c7f248] text-[#1a2800]' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{isEditing ? 'close' : 'edit'}</span>
              </button>
            </div>

            {isDirty && (
              <div className="relative flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-300 uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-amber-300 animate-pulse" />
                  Unsaved changes
                </span>
                <div className="flex-1" />
                <button onClick={handleDiscard} className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-all">
                  Discard
                </button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 bg-[#c7f248] text-[#1a2800] px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all disabled:opacity-60 hover:brightness-105">
                  {isSaving && <span className="w-2.5 h-2.5 border-2 border-[#1a2800]/30 border-t-[#1a2800] rounded-full animate-spin" />}
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}
          </div>

          {/* Avatar picker panel */}
          {pickerOpen && (
            <div className="mt-3 bg-(--bg-card) border border-(--border-light) rounded-2xl p-5" style={{ animation: 'fadeIn 0.15s ease' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-(--text-muted)">Choose avatar</p>
                <button onClick={() => setPickerOpen(false)} aria-label="Close avatar picker">
                  <span className="material-symbols-outlined text-[16px] text-(--text-muted) hover:text-(--text-primary) transition-colors">close</span>
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-4">
                {DEFAULT_AVATARS.map(av => {
                  const url = getAvatarUrl(av.seed);
                  const isActive = avatarSrc === url;
                  return (
                    <button key={av.id} onClick={() => { handleSelectPreset(av.seed); setPickerOpen(false); setIsEditing(true); }} className="flex flex-col items-center gap-1.5 group">
                      <div className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all ${isActive ? 'border-[#62aa1a] shadow-[0_0_0_3px_rgba(98,170,26,0.15)]' : 'border-(--border-medium) group-hover:border-[#62aa1a]/50'}`}>
                        <img src={url} alt={av.label} className="w-full h-full object-cover" />
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${isActive ? 'text-[#62aa1a]' : 'text-(--text-muted)'}`}>{av.label}</span>
                    </button>
                  );
                })}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handleFileChange(e); setPickerOpen(false); setIsEditing(true); }} />
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 border border-dashed border-(--border-medium) hover:border-[#62aa1a]/40 rounded-xl flex items-center justify-center gap-2 hover:bg-[#62aa1a]/3 transition-all group">
                <span className="material-symbols-outlined text-[15px] text-(--text-muted) group-hover:text-[#62aa1a] transition-colors">upload</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) group-hover:text-(--text-secondary) transition-colors">Upload custom photo</span>
              </button>
              {uploadPreview && (
                <div className="mt-3 flex items-center gap-2.5 bg-[#62aa1a]/5 px-3 py-2.5 rounded-xl border border-[#62aa1a]/15">
                  <img src={uploadPreview} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-[#62aa1a]/30" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#62aa1a]">Custom photo ready</span>
                </div>
              )}
              {avatarSrc && (
                <button
                  onClick={() => { handleRemoveAvatar(); setIsEditing(true); }}
                  className="w-full mt-3 py-2 text-[10px] font-bold uppercase tracking-wider text-(--text-muted) hover:text-red-400 transition-colors"
                >
                  Remove avatar
                </button>
              )}
            </div>
          )}

          {/* Quick health stats — at-a-glance, not a settings destination */}
          <div className="mt-3 bg-(--bg-card) border border-(--border-light) rounded-2xl p-4">
            <div className="flex gap-2.5">
              <StatCard icon="local_fire_department" value={Number(dailyStats.calories_burned || 0).toLocaleString()} unit="kcal" label="Calories" />
              <StatCard icon="footprint"              value={Number(dailyStats.steps || 0).toLocaleString()}          unit="steps" label="Steps" />
              <StatCard icon="timer"                  value={Number(dailyStats.workout_duration_mins || 0)}           unit="mins"  label="Active Min" />
            </div>
          </div>

          {/* ── Settings menu group ── */}
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-(--text-muted) mt-5 mb-2 px-1">Profile</p>
          <div className="bg-(--bg-card) border border-(--border-light) rounded-2xl overflow-hidden">

            {/* My Account — expands to Patient Information fields */}
            <MenuRow
              icon="person"
              title="My Account"
              subtitle="Personal info & contact details"
              expandable
              expanded={openSection === 'account'}
              onClick={() => toggleSection('account')}
            />
            {openSection === 'account' && (
              <div className="px-4 pb-4 pt-1 border-b border-(--border-light)">
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
                      className={`${rowEditable} resize-none min-h-[32px] leading-snug`}
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
            )}

            {/* Body Metrics — expands to weight/height/BMI/TDEE */}
            <MenuRow
              icon="monitor_heart"
              title="Body Metrics"
              subtitle="Weight, height, BMI & calorie needs"
              expandable
              expanded={openSection === 'metrics'}
              onClick={() => toggleSection('metrics')}
            />
            {openSection === 'metrics' && (
              <div className="px-4 pb-4 pt-1 border-b border-(--border-light)">
                <div className="grid grid-cols-3 gap-2 items-end pt-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-(--text-disabled) block mb-1">Weight</span>
                    {isEditing ? (
                      <input className={rowEditable.replace('sm:text-right', '')} type="number" step="0.1" value={formData.weight_kg} onChange={e => handleInputChange(e, 'weight_kg')} />
                    ) : (
                      <span className={rowLocked.replace('sm:text-right', '')}>{formData.weight_kg ? `${formData.weight_kg} kg` : '—'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-(--text-disabled) block mb-1">Height</span>
                    {isEditing ? (
                      <input className={rowEditable.replace('sm:text-right', '')} type="number" step="0.1" value={formData.height_cm} onChange={e => handleInputChange(e, 'height_cm')} />
                    ) : (
                      <span className={rowLocked.replace('sm:text-right', '')}>{formData.height_cm ? `${formData.height_cm} cm` : '—'}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-(--text-disabled) block mb-1">BMI</span>
                    <span className="text-[16px] font-black block leading-tight" style={{ color: bmiInfo.color }}>
                      {bmi != null ? bmi : '—'}
                    </span>
                    {bmi != null && <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: bmiInfo.color }}>{bmiInfo.label}</span>}
                  </div>
                </div>

                <button
                  onClick={() => setShowBmiDetails(s => !s)}
                  className="mt-4 pt-3.5 w-full flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#62aa1a] hover:brightness-110 transition-colors border-t border-(--border-light)"
                >
                  View All Metrics
                  <span className={`material-symbols-outlined text-[13px] transition-transform ${showBmiDetails ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {showBmiDetails && (
                  <div className="mt-4 pt-4 border-t border-(--border-light) space-y-4">

                    {/* Age/Gender — always visible when expanded */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-(--text-disabled) block mb-1">Age</span>
                        {isEditing ? (
                          <input className={rowEditable.replace('sm:text-right', '')} type="number" value={formData.age} onChange={e => handleInputChange(e, 'age')} placeholder="25" />
                        ) : (
                          <span className={rowLocked.replace('sm:text-right', '')}>{formData.age || '—'}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-(--text-disabled) block mb-1">Gender</span>
                        {isEditing ? (
                          <select
                            className={selectBase}
                            value={formData.gender}
                            onChange={e => handleInputChange(e, 'gender')}
                          >
                            <option value="male" className="bg-(--bg-secondary)">Male</option>
                            <option value="female" className="bg-(--bg-secondary)">Female</option>
                            <option value="other" className="bg-(--bg-secondary)">Other</option>
                          </select>
                        ) : (
                          <span className={rowLocked.replace('sm:text-right', '')}>{formData.gender || '—'}</span>
                        )}
                      </div>
                    </div>

                    {/* Activity Level — always visible when expanded */}
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-(--text-disabled) block mb-1">Activity Level</span>
                      {isEditing ? (
                        <select
                          className={selectBase}
                          value={formData.activity_level}
                          onChange={e => handleInputChange(e, 'activity_level')}
                        >
                          {ACTIVITY_LEVELS.map(lvl => (
                            <option key={lvl.id} value={lvl.id} className="bg-(--bg-secondary)">{lvl.label} — {lvl.desc}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={rowLocked.replace('sm:text-right', '')}>{formData.activity_level ? ACTIVITY_LEVELS.find(l => l.id === formData.activity_level)?.label || formData.activity_level : '—'}</span>
                      )}
                    </div>

                    {/* TDEE Display — full layout when data exists */}
                    {bmiRecord?.tdee ? (
                      <>
                        {/* Hero Section */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a2a1a] to-[#0d1a0d] border border-[#c7f248]/20 px-4 py-5 text-center">
                          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_0%,#c7f248,transparent_70%)]" />
                          <span className="relative text-[8px] font-bold uppercase tracking-[0.2em] text-[#c7f248]/60">Total Daily Energy Expenditure</span>
                          <div className="relative mt-1 flex items-baseline justify-center gap-1.5">
                            <span className="text-[28px] font-black text-[#c7f248] tracking-tight">{bmiRecord.tdee?.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-(--text-disabled)">kcal</span>
                          </div>
                          <div className="relative mt-1.5 flex items-center justify-center gap-3 text-[10px] text-(--text-muted)">
                            <span>BMR <strong className="text-(--text-primary)">{bmiRecord.bmr?.toLocaleString()}</strong></span>
                            <span className="text-(--text-disabled)">|</span>
                            <span>Activity <strong className="text-(--text-primary)">{bmiRecord.tdee - bmiRecord.bmr}</strong></span>
                          </div>
                        </div>

                        {/* Calorie Zones */}
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-(--text-muted) block mb-2">Calorie Targets</span>
                          <div className="flex gap-2">
                            {[
                              { label: 'Cut', value: Math.round(bmiRecord.tdee - 500), color: '#f87171', desc: 'Fat loss' },
                              { label: 'Maintain', value: bmiRecord.tdee, color: '#c7f248', desc: 'Current weight' },
                              { label: 'Bulk', value: Math.round(bmiRecord.tdee + 500), color: '#60a5fa', desc: 'Muscle gain' },
                            ].map(g => (
                              <div key={g.label} className="flex-1 bg-(--bg-hover) rounded-xl py-2.5 px-2 text-center">
                                <span className="text-[8px] font-bold uppercase tracking-wider block" style={{ color: g.color }}>{g.label}</span>
                                <span className="text-[14px] font-black text-(--text-primary)">{g.value?.toLocaleString()}</span>
                                <span className="text-[8px] text-(--text-disabled) block">{g.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Macro Split Selector + Breakdown */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-(--text-muted)">Macronutrients</span>
                            <div className="flex gap-0.5">
                              {MACRO_SPLITS.map(split => (
                                <button
                                  key={split.id}
                                  onClick={() => setMacroSplit(split.id)}
                                  className={`text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-colors ${
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
                                <div className="h-1.5 rounded-full bg-(--bg-hover) overflow-hidden flex mb-3">
                                  {items.map(m => (
                                    <div key={m.label} style={{ width: m.pct + '%', backgroundColor: m.color, opacity: 0.7 }} />
                                  ))}
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {items.map(m => (
                                    <div key={m.label} className="bg-(--bg-hover) rounded-xl py-2.5 px-2 text-center">
                                      <span className="text-[8px] font-bold uppercase tracking-wider block" style={{ color: m.color }}>{m.label}</span>
                                      <span className="text-[14px] font-black text-(--text-primary)">{m.grams}g</span>
                                      <span className="text-[8px] text-(--text-disabled) block">{m.calories} kcal · {m.pct}%</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[9px] text-(--text-disabled)">
                            {bmiRecord.activity_level
                              ? ACTIVITY_LEVELS.find(l => l.id === bmiRecord.activity_level)?.label || bmiRecord.activity_level
                              : 'Activity not set'}
                          </span>
                          <span className="text-[9px] text-(--text-disabled) font-mono">
                            {bmiRecord.recorded_at || ''}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="bg-(--bg-hover) rounded-xl p-4 text-center">
                        {bmi != null ? (
                          <>
                            <p className="text-[10px] text-(--text-muted) mb-2">
                              {!formData.age
                                ? 'Enter your age and activity level to unlock full calorie data.'
                                : 'Set your activity level and save to calculate your calorie needs.'}
                            </p>
                            <button onClick={() => setIsEditing(true)} className="text-[9px] font-bold uppercase tracking-wider text-[#62aa1a]/70 hover:text-[#62aa1a] transition-colors">
                              Edit Profile →
                            </button>
                          </>
                        ) : (
                          <p className="text-[10px] text-(--text-muted)">
                            Update your height and weight to see BMI calculations.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Devices & Sessions — expands to This Device + Access Log */}
            <MenuRow
              icon="devices"
              title="Devices & Sessions"
              subtitle="Manage where you're signed in"
              expandable
              expanded={openSection === 'security'}
              onClick={() => toggleSection('security')}
            />
            {openSection === 'security' && (
              <div className="px-4 pb-4 pt-3 border-b border-(--border-light) space-y-4">
                <div>
                  <SectionHeader icon="devices" title="This Device" />
                  {currentSession ? (
                    <LogEntry
                      icon="smartphone"
                      title={`${currentSession.browser} on ${currentSession.os}`}
                      sub={`Active now · ${[currentSession.city, currentSession.country].filter(Boolean).join(', ') || 'Unknown location'}`}
                      current
                    />
                  ) : (
                    <p className="text-[11px] text-(--text-disabled) text-center py-5">No session data</p>
                  )}
                </div>

                <div>
                  <SectionHeader
                    icon="history"
                    title="Access Log"
                    right={otherSessions.length > 0 && (
                      <button onClick={() => otherSessions.forEach(s => handleRevoke(s.id))} className="text-[9px] font-bold uppercase tracking-wider text-red-400/60 hover:text-red-400 transition-colors">
                        Revoke all
                      </button>
                    )}
                  />
                  {otherSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                      <span className="material-symbols-outlined text-[30px] text-(--text-disabled)">devices</span>
                      <p className="text-[11px] text-(--text-disabled)">No other entries logged</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
              </div>
            )}

            {/* Change Password — opens the existing modal (separate flow) */}
            <MenuRow
              icon="key"
              title="Change Password"
              subtitle="Keep your account secure with a strong password"
              onClick={() => setChangePwOpen(true)}
            />

            {/* Log Out — immediate action */}
            <MenuRow
              icon="logout"
              iconColor="#f87171"
              title="Log Out"
              subtitle="Sign out of this device"
              danger
              onClick={handleLogout}
            />
          </div>
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