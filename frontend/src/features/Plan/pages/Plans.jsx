import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { MobileNav, Sidebar, Topbar, ProgressListItem } from '../../../components';
import usePlans from '../hooks/usePlan';

// ICON COMPONENT
const Icon = ({ name, className = '', fill = 0, weight = 300, style = {} }) => (
  <span
    className={`material-symbols-outlined leading-none select-none ${className}`}
    style={{
      fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      ...style,
    }}
  >
    {name}
  </span>
);

// EXERCISE FORMATTING HELPERS
const formatSeconds = (totalSeconds) => {
  if (!totalSeconds) return '';
  if (totalSeconds >= 60) {
    const mins = Math.round(totalSeconds / 60);
    return `${mins} min`;
  }
  return `${totalSeconds}s`;
};

const formatExerciseDetail = (ex) => {
  const parts = [];
  if (ex.sets && ex.reps) {
    parts.push(`${ex.sets} sets × ${ex.reps} reps`);
  } else if (ex.sets && ex.durationSeconds) {
    parts.push(`${ex.sets} rounds × ${formatSeconds(ex.durationSeconds)}`);
  } else if (ex.durationSeconds) {
    parts.push(formatSeconds(ex.durationSeconds));
  } else if (ex.sets) {
    parts.push(`${ex.sets} sets`);
  }
  if (ex.restSeconds) {
    parts.push(`${formatSeconds(ex.restSeconds)} rest`);
  }
  if (ex.notes) {
    parts.push(ex.notes);
  }
  return parts.join(' · ');
};

const REST_ACTIVITY_TYPES = new Set(['Recovery', 'Mobility', 'Flexibility']);

// PLAN CARD COMPONENT
const PlanCard = ({ plan, onOpen, onEnroll, onContinue, style = {} }) => (
  <div
    className="group relative rounded-[var(--card-radius-md)] overflow-hidden border flex flex-col shadow-[var(--shadow-md)] cursor-pointer transition-all duration-500 hover:border-[var(--accent-border)] hover:shadow-[var(--shadow-lg)]"
    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)', ...style }}
    onClick={() => onOpen(plan)}
  >
    <div className="aspect-[16/10] overflow-hidden relative">
      <img
        src={`https://api.dicebear.com/7.x/shapes/svg?seed=${plan.image_seed}`}
        alt={plan.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40"
      />
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-2">
        <span
          className="px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold tracking-widest uppercase"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: 'var(--accent)' }}
        >
          {plan.tag}
        </span>
        {plan.is_enrolled === 1 && (
          <span
            className="px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold tracking-widest uppercase"
            style={{ background: 'var(--accent)', color: '#161f00' }}
          >
            Owned
          </span>
        )}
      </div>
    </div>
    <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col">
      <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>
        {plan.title}
      </h3>
      <p className="text-xs sm:text-sm mb-4 sm:mb-5 lg:mb-6 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
        {plan.description}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-7 lg:mb-8 text-center">
        {[
          { label: 'Time',   value: plan.duration },
          { label: 'Strain', value: plan.intensity, colored: true },
          { label: 'Focus',  value: plan.target_focus },
        ].map(({ label, value, colored }) => (
          <div key={label}>
            <p className="text-[9px] sm:text-[10px] uppercase font-bold mb-0.5 sm:mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p
              className="text-xs sm:text-sm font-medium"
              style={{
                color: colored
                  ? value === 'Extreme' ? 'var(--error)' : 'var(--accent)'
                  : 'var(--text-primary)',
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
      <div
        className="mt-auto pt-3 sm:pt-4 flex items-center justify-between border-t"
        style={{ borderColor: 'var(--border-light)' }}
        onClick={e => e.stopPropagation()}
      >
        <span className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {plan.price === 0 || plan.price === '0.00' ? 'Free' : `$${plan.price}`}
        </span>
        {plan.is_enrolled === 1 ? (
          <button
            onClick={e => { e.stopPropagation(); onContinue(plan); }}
            className="px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm active:scale-95 transition-all"
            style={{ background: 'var(--accent)', color: '#161f00' }}
          >
            Continue Plan
          </button>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onEnroll(plan.id); }}
            className="px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm active:scale-95 transition-all"
            style={{ background: 'var(--accent)', color: '#161f00' }}
          >
            Get Access
          </button>
        )}
      </div>
    </div>
  </div>
);

// PLAN DETAIL OVERLAY COMPONENT
const PlanDetailOverlay = ({ plan, onClose, onStart }) => {
  if (!plan) return null;
  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 md:p-6 overflow-y-auto"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-[var(--card-radius-md)] overflow-hidden shadow-2xl sm:my-auto max-h-[92vh] flex flex-col"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* drag pill for mobile sheet */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-medium)' }} />
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="aspect-[16/7] relative overflow-hidden flex-shrink-0">
            <img
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${plan.image_seed}`}
              alt={plan.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, var(--bg-secondary) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}
            />
            <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 flex gap-2">
              <span
                className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase"
                style={{ background: 'var(--accent)', color: '#161f00' }}
              >
                {plan.tag}
              </span>
              <span
                className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase"
                style={{ background: 'var(--bg-hover)', backdropFilter: 'blur(4px)', color: 'var(--text-secondary)' }}
              >
                {plan.intensity}
              </span>
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(0,0,0,0.45)', color: 'var(--text-muted)' }}
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{plan.title}</h2>
            <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {[
                { label: 'Duration',  value: plan.duration,      icon: 'schedule' },
                { label: 'Intensity', value: plan.intensity,     icon: 'bolt' },
                { label: 'Focus',     value: plan.target_focus,  icon: 'track_changes' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="rounded-xl p-2.5 sm:p-3 text-center border"
                  style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}
                >
                  <Icon name={stat.icon} className="text-[14px] sm:text-[16px] mb-0.5 sm:mb-1" style={{ color: 'var(--accent)' }} fill={1} />
                  <p className="text-[9px] sm:text-[10px] uppercase font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  <p className="text-[10px] sm:text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div
              className="rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border"
              style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
            >
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5 sm:mb-2" style={{ color: 'var(--accent)' }}>
                What this plan does
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                This structured {plan.duration} program targets{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{plan.target_focus}</strong> with daily progressive
                sessions. Each day builds on the last — follow the protocol, complete every task, and unlock the next day.
              </p>
            </div>
            <div className="flex items-center justify-between mb-4 sm:mb-5 px-1">
              <span className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                {plan.price === 0 || plan.price === '0.00' ? 'Free' : `$${plan.price}`}
              </span>
              {plan.price > 0 && plan.is_enrolled !== 1 && (
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  One-time purchase
                </span>
              )}
            </div>
            <button
              onClick={onStart}
              className="w-full py-3 sm:py-3.5 rounded-xl font-black text-sm tracking-wide uppercase active:scale-[0.98] transition-all duration-200"
              style={{ background: 'var(--accent)', color: '#161f00' }}
            >
              {plan.is_enrolled === 1 ? 'Open Plan Tracker' : 'Start Plan → Day 1'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// DAY TRACKER COMPONENT
const DayTracker = ({ plan, content, progress, onClose, onCompleteDay }) => {
  const navigate = useNavigate();
  const completedDays = progress.filter(p => p.is_completed).map(p => p.day_number);
  const totalDays     = content.length;
  const currentDay    = content.find(d => !completedDays.includes(d.day_number)) || content[0];
  const [activeDay,  setActiveDay]  = useState(currentDay?.day_number || 1);
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeDayData = content.find(d => d.day_number === activeDay);
  const isDayComplete = completedDays.includes(activeDay);
  const progressPct   = totalDays > 0 ? Math.round((completedDays.length / totalDays) * 100) : 0;
  const isRestDay = REST_ACTIVITY_TYPES.has(activeDayData?.activity_type);

  // EMPTY STATE
  if (totalDays === 0) {
    return (
      <div
        className="fixed inset-0 z-[110] flex flex-col"
        style={{ background: 'var(--bg-primary)', animation: 'fadeIn 0.25s ease' }}
      >
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span className="hidden xs:inline">Back to Plans</span>
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {plan.title}
            </p>
          </div>
          <div className="w-8 sm:w-[88px]" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[var(--card-radius-md)] flex items-center justify-center border"
            style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
          >
            <Icon name="hourglass_empty" className="text-[24px] sm:text-[28px]" style={{ color: 'var(--accent)' }} fill={1} />
          </div>
          <p className="text-base sm:text-lg font-black" style={{ color: 'var(--text-primary)' }}>Schedule coming soon</p>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            "{plan.title}" doesn't have its daily content set up yet. Check back shortly.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2.5 rounded-lg font-bold text-sm"
            style={{ background: 'var(--accent)', color: '#161f00' }}
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  const handleComplete = async () => {
    if (isDayComplete || completing) return;
    setCompleting(true);
    await onCompleteDay(activeDay);
    setCompleting(false);
    const nextDay = content.find(d => d.day_number > activeDay && !completedDays.includes(d.day_number));
    if (nextDay) setTimeout(() => setActiveDay(nextDay.day_number), 400);
  };

  const handleStartWorkout = () => {
    if (!activeDayData) return;
    navigate('/dashboard/workouts', {
      state: {
        fromPlan: {
          planId:       plan.id,
          planTitle:    plan.title,
          dayNumber:    activeDayData.day_number,
          dayTitle:     activeDayData.title,
          activityType: activeDayData.activity_type,
          description:  activeDayData.description,
          durationMins: activeDayData.duration_mins,
        },
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col"
      style={{ background: 'var(--bg-primary)', animation: 'fadeIn 0.25s ease' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Icon name="arrow_back" className="text-[16px] sm:text-[18px]" />
          <span className="hidden xs:inline">Back to Plans</span>
        </button>
        <div className="text-center flex-1 px-2">
          <p className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest truncate max-w-[140px] sm:max-w-none mx-auto" style={{ color: 'var(--text-muted)' }}>
            {plan.title}
          </p>
          <p className="text-[10px] sm:text-xs font-bold" style={{ color: 'var(--accent)' }}>
            {completedDays.length}/{totalDays} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right hidden xs:block">
            <p className="text-base sm:text-lg font-black" style={{ color: 'var(--accent)' }}>{progressPct}%</p>
            <p className="text-[9px] sm:text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Progress</p>
          </div>
          {/* Mobile sidebar toggle */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border"
            style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle day list"
          >
            <Icon name="calendar_view_week" className="text-[18px]" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 sm:h-1 w-full flex-shrink-0" style={{ background: 'var(--border-light)' }}>
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${progressPct}%`, background: 'var(--accent)' }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile day list overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-20"
            style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-64 overflow-y-auto"
              style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-light)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Days</p>
                <button onClick={() => setSidebarOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>
              {content.map(day => {
                const done     = completedDays.includes(day.day_number);
                const isActive = day.day_number === activeDay;
                return (
                  <button
                    key={day.day_number}
                    onClick={() => { setActiveDay(day.day_number); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-l-2"
                    style={{
                      background:      isActive ? 'var(--bg-active)' : 'transparent',
                      borderLeftColor: isActive ? 'var(--accent)'    : 'transparent',
                      color:           isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    <div
                      className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-black"
                      style={{
                        background: done ? 'var(--accent)' : isActive ? 'var(--accent-bg)' : 'var(--bg-hover)',
                        color:      done ? '#161f00'       : isActive ? 'var(--accent)'    : 'var(--text-muted)',
                      }}
                    >
                      {done ? <Icon name="check" className="text-[14px]" weight={700} /> : day.day_number}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {day.title}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{day.duration_mins} mins</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Desktop day list sidebar */}
        <div
          className="hidden md:flex w-20 lg:w-56 border-r overflow-y-auto flex-shrink-0 flex-col"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}
        >
          {content.map(day => {
            const done     = completedDays.includes(day.day_number);
            const isActive = day.day_number === activeDay;
            return (
              <button
                key={day.day_number}
                onClick={() => setActiveDay(day.day_number)}
                className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 lg:py-3.5 text-left transition-all border-l-2"
                style={{
                  background:      isActive ? 'var(--bg-active)' : 'transparent',
                  borderLeftColor: isActive ? 'var(--accent)'    : 'transparent',
                  color:           isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                <div
                  className="w-7 h-7 lg:w-8 lg:h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-black"
                  style={{
                    background: done ? 'var(--accent)' : isActive ? 'var(--accent-bg)' : 'var(--bg-hover)',
                    color:      done ? '#161f00'       : isActive ? 'var(--accent)'    : 'var(--text-muted)',
                  }}
                >
                  {done ? <Icon name="check" className="text-[12px] lg:text-[14px]" weight={700} /> : day.day_number}
                </div>
                <div className="hidden lg:block overflow-hidden">
                  <p className="text-xs font-bold truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {day.title}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{day.duration_mins} mins</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {activeDayData && (
            <div className="max-w-2xl mx-auto" key={activeDay} style={{ animation: 'slideUp 0.2s ease' }}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border"
                  style={{ color: 'var(--accent)', background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
                >
                  Day {activeDayData.day_number}
                </span>
                <span
                  className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                  style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}
                >
                  {activeDayData.activity_type}
                </span>
                {isDayComplete && (
                  <span
                    className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border"
                    style={{ color: 'var(--success)', background: 'var(--success-bg)', borderColor: 'var(--success)' }}
                  >
                    ✓ Completed
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
                {activeDayData.title}
              </h1>
              <p className="text-sm leading-relaxed mb-6 sm:mb-8" style={{ color: 'var(--text-muted)' }}>
                {activeDayData.description}
              </p>

              <div
                className="rounded-[var(--card-radius-md)] p-4 sm:p-6 mb-6 sm:mb-8 border"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border flex-shrink-0"
                    style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
                  >
                    <Icon name="fitness_center" className="text-[18px] sm:text-[20px]" style={{ color: 'var(--accent)' }} fill={1} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      Today's Session
                    </p>
                    <p className="text-xs sm:text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {activeDayData.activity_type}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                      {activeDayData.duration_mins}
                    </p>
                    <p className="text-[9px] sm:text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>minutes</p>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {activeDayData.exercises && activeDayData.exercises.length > 0 ? (
                    activeDayData.exercises.map((ex, idx) => (
                      <div
                        key={`${activeDayData.day_number}-${idx}`}
                        className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border"
                        style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}
                      >
                        <span className="text-[9px] sm:text-[10px] font-black w-5 sm:w-6 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <Icon name="fitness_center" className="text-[14px] sm:text-[16px] flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill={1} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{ex.name}</p>
                          <p className="text-[10px] sm:text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{formatExerciseDetail(ex)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border"
                      style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}
                    >
                      <Icon name="info" className="text-[16px] flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Exercise breakdown for this day hasn't been added yet — follow the description above for now.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                {!isDayComplete && (
                  <button
                    onClick={() => {
                      const next = content.find(d => d.day_number > activeDay);
                      if (next) setActiveDay(next.day_number);
                    }}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                    style={{ borderColor: 'var(--border-medium)', color: 'var(--text-muted)' }}
                  >
                    <Icon name="skip_next" className="text-[16px] sm:text-[18px]" />
                    <span className="hidden xs:inline">Skip for Now</span>
                    <span className="xs:hidden">Skip</span>
                  </button>
                )}

                {isDayComplete ? (
                  <button
                    disabled
                    className="flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-1.5 sm:gap-2"
                    style={{
                      background: 'var(--success-bg)',
                      color:      'var(--success)',
                      border:     '1px solid var(--success)',
                      cursor:     'default',
                    }}
                  >
                    <Icon name="verified" className="text-[16px] sm:text-[18px]" fill={1} /> Day Complete
                  </button>
                ) : isRestDay ? (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                    style={{ background: 'var(--accent)', color: '#161f00', opacity: completing ? 0.7 : 1 }}
                  >
                    {completing ? (
                      <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <><Icon name="check_circle" className="text-[16px] sm:text-[18px]" fill={1} /> Mark Complete</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleStartWorkout}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-[0.98]"
                    style={{ background: 'var(--accent)', color: '#161f00' }}
                  >
                    <Icon name="play_circle" className="text-[16px] sm:text-[18px]" fill={1} /> Start Workout
                  </button>
                )}
              </div>

              {!isDayComplete && (
                <p className="text-center text-[10px] sm:text-[11px] mt-3 sm:mt-4" style={{ color: 'var(--text-muted)' }}>
                  {isRestDay
                    ? `Complete this day to unlock Day ${activeDayData.day_number + 1}`
                    : `Finish your workout session to automatically unlock Day ${activeDayData.day_number + 1}`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// MY PLANS TAB
const MyPlans = ({ plans, onOpen, onContinue }) => {
  const enrolled = plans.filter(p => p.is_enrolled === 1);
  if (enrolled.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 sm:py-28 gap-4 text-center" style={{ animation: 'fadeIn 0.3s ease' }}>
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-[var(--card-radius-md)] flex items-center justify-center mb-2 border"
          style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
        >
          <Icon name="fitness_center" className="text-[28px] sm:text-[36px]" style={{ color: 'var(--accent)' }} fill={1} />
        </div>
        <h3 className="text-lg sm:text-xl font-black" style={{ color: 'var(--text-primary)' }}>No plans yet</h3>
        <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          You haven't enrolled in any training blueprint. Head to{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Explore</span> to find your first plan.
        </p>
      </div>
    );
  }
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {(() => {
        const active      = enrolled[0];
        const progressPct = active.progress_pct ?? 0;
        return (
          <div
            className="mb-6 sm:mb-10 rounded-[var(--card-radius-md)] overflow-hidden border cursor-pointer transition-all duration-300 group"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--accent-border)' }}
            onClick={() => onOpen(active)}
          >
            <div className="relative h-28 sm:h-36 overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/shapes/svg?seed=${active.image_seed}`}
                alt={active.title}
                className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, var(--bg-card) 30%, transparent 100%)' }}
              />
              <div className="absolute inset-0 flex items-center px-4 sm:px-8 gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                    Currently Active
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black mt-0.5 mb-2 truncate" style={{ color: 'var(--text-primary)' }}>
                    {active.title}
                  </h2>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 h-1 sm:h-1.5 rounded-full" style={{ background: 'var(--border-medium)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progressPct}%`, background: 'var(--accent)' }}
                      />
                    </div>
                    <span className="text-xs font-black tabular-nums flex-shrink-0" style={{ color: 'var(--accent)' }}>
                      {progressPct}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onContinue(active); }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase active:scale-95 transition-all flex-shrink-0"
                  style={{ background: 'var(--accent)', color: '#161f00' }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {enrolled.length > 1 && (
        <>
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-3 sm:mb-4" style={{ color: 'var(--text-muted)' }}>
            All Enrolled Plans
          </p>
          <div className="flex flex-col gap-3 sm:gap-4">
            {enrolled.slice(1).map((plan) => (
              <ProgressListItem
                key={plan.id}
                thumbnail={`https://api.dicebear.com/7.x/shapes/svg?seed=${plan.image_seed}`}
                title={plan.title}
                meta={[
                  { icon: 'schedule', label: plan.duration },
                  { icon: 'bolt', label: plan.intensity || plan.tag || 'Program' },
                ]}
                progressPct={plan.progress_pct ?? 0}
                completed={(plan.progress_pct ?? 0) >= 100}
                onClick={() => onOpen(plan)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// FIND PLANS TAB WITH FILTERS
const INTENSITY_OPTIONS = ['All', 'Beginner', 'Moderate', 'Advanced', 'Extreme'];
const FOCUS_OPTIONS     = ['All', 'Strength', 'Cardio', 'Flexibility', 'Recovery', 'Fat Loss', 'Hypertrophy'];
const DURATION_OPTIONS  = ['All', '1 Week', '2 Weeks', '4 Weeks', '8 Weeks', '12 Weeks'];

const FilterPill = ({ options, active, onSelect }) => (
  <div className="flex flex-wrap gap-1.5 sm:gap-2">
    {options.map(opt => (
      <button
        key={opt}
        onClick={() => onSelect(opt)}
        className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all border"
        style={{
          background:  active === opt ? 'var(--accent)'  : 'var(--bg-hover)',
          color:       active === opt ? '#161f00'        : 'var(--text-muted)',
          borderColor: active === opt ? 'var(--accent)'  : 'var(--border-light)',
        }}
      >
        {opt}
      </button>
    ))}
  </div>
);

const FindPlan = ({ plans, onOpen, onEnroll, onContinue }) => {
  const [query,     setQuery]     = useState('');
  const [intensity, setIntensity] = useState('All');
  const [focus,     setFocus]     = useState('All');
  const [duration,  setDuration]  = useState('All');

  const filtered = useMemo(() => plans.filter(p => {
    const q = query.toLowerCase();
    return (
      (!q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tag?.toLowerCase().includes(q)) &&
      (intensity === 'All' || p.intensity === intensity) &&
      (focus     === 'All' || p.target_focus?.toLowerCase().includes(focus.toLowerCase())) &&
      (duration  === 'All' || p.duration === duration)
    );
  }), [plans, query, intensity, focus, duration]);

  const clearAll = () => { setQuery(''); setIntensity('All'); setFocus('All'); setDuration('All'); };
  const hasFilters = query || intensity !== 'All' || focus !== 'All' || duration !== 'All';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="relative mb-4 sm:mb-6">
        <Icon name="search" className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[18px] sm:text-[20px]" style={{ color: 'var(--text-muted)' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search blueprints..."
          className="w-full rounded-xl pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm outline-none border transition-all"
          style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        )}
      </div>
      <div className="rounded-xl p-3 sm:p-5 mb-6 sm:mb-8 space-y-3 sm:space-y-4 border" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}>
        {[
          { label: 'Intensity', opts: INTENSITY_OPTIONS, active: intensity, set: setIntensity },
          { label: 'Focus Area', opts: FOCUS_OPTIONS,    active: focus,     set: setFocus     },
          { label: 'Duration',  opts: DURATION_OPTIONS,  active: duration,  set: setDuration  },
        ].map(({ label, opts, active, set }) => (
          <div key={label}>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <FilterPill options={opts} active={active} onSelect={set} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{filtered.length}</span>{' '}
          blueprint{filtered.length !== 1 ? 's' : ''} found
        </p>
        {hasFilters && (
          <button onClick={clearAll} className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:underline" style={{ color: 'var(--accent)' }}>
            Clear All
          </button>
        )}
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 sm:py-20 gap-3 text-center">
          <Icon name="search_off" className="text-[40px] sm:text-[48px]" style={{ color: 'var(--border-medium)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No blueprints match your filters.</p>
          <button onClick={clearAll} className="text-sm font-bold hover:underline" style={{ color: 'var(--accent)' }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((plan, i) => (
            <PlanCard
              key={plan.id} plan={plan} onOpen={onOpen} onEnroll={onEnroll} onContinue={onContinue}
              style={{ animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// EXPLORE TAB COMPONENT
const CATEGORIES = [
  { label: 'All',         icon: 'grid_view',             tag: null },
  { label: 'Strength',    icon: 'fitness_center',        tag: 'Strength' },
  { label: 'Fat Loss',    icon: 'local_fire_department', tag: 'Fat Loss' },
  { label: 'Recovery',    icon: 'spa',                   tag: 'Recovery' },
  { label: 'Cardio',      icon: 'directions_run',        tag: 'Cardio' },
  { label: 'Flexibility', icon: 'self_improvement',      tag: 'Flexibility' },
];

const Explore = ({ plans, onOpen, onEnroll, onContinue }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const featured  = plans.slice(0, 2);
  const displayed = activeCategory ? plans.filter(p => p.tag === activeCategory) : plans;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {featured.length > 0 && (
        <div className="mb-6 sm:mb-10">
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-3 sm:mb-4" style={{ color: 'var(--text-muted)' }}>
            Featured Blueprints
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            {featured.map((plan, i) => (
              <div
                key={plan.id}
                className="relative overflow-hidden rounded-[var(--card-radius-md)] cursor-pointer group border transition-all duration-500"
                style={{ borderColor: 'var(--border-light)', animation: `slideUp 0.4s ease ${i * 0.1}s both` }}
                onClick={() => onOpen(plan)}
              >
                <div className="aspect-[21/9] overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${plan.image_seed}`}
                    alt={plan.title}
                    className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, var(--bg-card) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6">
                  <div className="flex gap-2 mb-1.5 sm:mb-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase" style={{ background: 'var(--accent)', color: '#161f00' }}>
                      {plan.tag}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', backdropFilter: 'blur(4px)' }}>
                      {plan.intensity}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-black" style={{ color: 'var(--text-primary)' }}>{plan.title}</h3>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>
                </div>
                {plan.is_enrolled === 1 && (
                  <div
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase"
                    style={{ background: 'var(--accent)', color: '#161f00' }}
                  >
                    Owned
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-6 sm:mb-8" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.tag)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest flex-shrink-0 transition-all border"
            style={{
              background:  activeCategory === cat.tag ? 'var(--accent)'     : 'var(--bg-tertiary)',
              color:       activeCategory === cat.tag ? '#161f00'           : 'var(--text-muted)',
              borderColor: activeCategory === cat.tag ? 'var(--accent)'     : 'var(--border-light)',
            }}
          >
            <Icon name={cat.icon} className="text-[14px] sm:text-[16px]" fill={activeCategory === cat.tag ? 1 : 0} />
            {cat.label}
          </button>
        ))}
      </div>
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center py-16 sm:py-20 gap-3 text-center">
          <Icon name="category" className="text-[40px] sm:text-[48px]" style={{ color: 'var(--border-medium)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No blueprints in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayed.map((plan, i) => (
            <PlanCard
              key={plan.id} plan={plan} onOpen={onOpen} onEnroll={onEnroll} onContinue={onContinue}
              style={{ animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// TAB BAR COMPONENT
const TABS = [
  { id: 'my-plans', label: 'My Plans',  icon: 'bookmarks' },
  { id: 'find',     label: 'Find Plan', icon: 'search'    },
  { id: 'explore',  label: 'Explore',   icon: 'explore'   },
];

const TabBar = ({ active, onChange, enrolledCount }) => (
  <div
    className="flex gap-1 rounded-xl p-1 w-full overflow-x-auto mb-6 sm:mb-10 border"
    style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)', scrollbarWidth: 'none' }}
  >
    {TABS.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className="relative flex flex-1 min-w-0 whitespace-nowrap items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all"
        style={{
          background: active === tab.id ? 'var(--accent)' : 'transparent',
          color:      active === tab.id ? '#161f00'       : 'var(--text-muted)',
        }}
      >
        <Icon name={tab.icon} className="text-[14px] sm:text-[16px] flex-shrink-0" fill={active === tab.id ? 1 : 0} />
        <span className="truncate">{tab.label}</span>
        {tab.id === 'my-plans' && enrolledCount > 0 && (
          <span
            className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: active === tab.id ? 'rgba(0,0,0,0.20)' : 'var(--accent-bg)',
              color:      active === tab.id ? '#161f00'           : 'var(--accent)',
            }}
          >
            {enrolledCount}
          </span>
        )}
      </button>
    ))}
  </div>
);

// MAIN PLANS PAGE COMPONENT
const Plans = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'explore'
  );

  const {
    loading, authError, trainingPlans, enrolledCount,
    detailPlan, trackerPlan, trackerContent, trackerProgress,
    setDetailPlan, handleEnroll, startTracker, handleCompleteDay, closeTracker,
  } = usePlans();

  useEffect(() => {
    if (searchParams.get('tab')) {
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    const openTrackerId = location.state?.openTracker;
    if (!openTrackerId || loading || trainingPlans.length === 0) return;
    const plan = trainingPlans.find(p => String(p.id) === String(openTrackerId));
    if (plan) {
      setActiveTab('my-plans');
      startTracker(plan);
      window.history.replaceState({}, '');
    }
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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
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

      <div className="md:hidden"><MobileNav /></div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        input::placeholder { color: var(--text-muted); opacity: 1; }
        @media (min-width: 480px) { .xs\\:inline { display: inline; } .xs\\:hidden { display: none; } }
      `}</style>
    </div>
  );
};

export default Plans;