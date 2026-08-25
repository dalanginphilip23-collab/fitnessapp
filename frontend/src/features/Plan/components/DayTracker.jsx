import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { REST_ACTIVITY_TYPES } from '../constants';
import { formatExerciseDetail } from '../utils';
import { getExerciseSlug, isTrackedExercise, getExerciseMeta } from '../../../constants/exerciseRegistry';

export default function DayTracker({ plan, content, progress, onClose, onCompleteDay }) {
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
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border"
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

  const handleStartWorkout = (preferredSlug) => {
    if (!activeDayData) return;
    let slug = preferredSlug || null;
    if (!slug) {
      for (const ex of activeDayData.exercises || []) {
        const s = ex.slug || getExerciseSlug(ex.name);
        if (s && isTrackedExercise(s)) { slug = s; break; }
      }
    }
    const fromPlan = {
      planId: plan.id,
      planTitle: plan.title,
      dayNumber: activeDayData.day_number,
      dayTitle: activeDayData.title,
      activityType: activeDayData.activity_type,
      description: activeDayData.description,
      durationMins: activeDayData.duration_mins,
      exerciseSlug: slug,
      exercises: activeDayData.exercises,
    };
    if (slug) {
      navigate(`/dashboard/workouts?exercise=${slug}`, { state: { fromPlan } });
    } else {
      navigate('/dashboard/workouts', { state: { fromPlan } });
    }
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
                className="rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border"
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
                    activeDayData.exercises.map((ex, idx) => {
                      const slug = ex.slug || getExerciseSlug(ex.name);
                      const tracked = slug && isTrackedExercise(slug);
                      const meta = slug ? getExerciseMeta(slug) : null;
                      return (
                      <button
                        key={`${activeDayData.day_number}-${idx}`}
                        type="button"
                        onClick={() => tracked && handleStartWorkout(slug)}
                        disabled={!tracked}
                        className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border text-left transition-all ${tracked ? 'cursor-pointer hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)]' : 'cursor-default opacity-80'}`}
                        style={{ background: 'var(--bg-hover)', borderColor: tracked ? 'var(--border-light)' : 'var(--border-light)' }}
                        title={tracked ? `Start ${meta?.label || ex.name} with camera` : 'Mobility / not camera-trackable — Mark Complete'}
                      >
                        <span className="text-[9px] sm:text-[10px] font-black w-5 sm:w-6 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <Icon name={meta?.icon || 'fitness_center'} className="text-[14px] sm:text-[16px] flex-shrink-0" style={{ color: tracked ? 'var(--accent)' : 'var(--text-muted)' }} fill={1} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            {ex.name}
                            {tracked && <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background:'var(--accent)', color:'#161f00' }}>CAM</span>}
                          </p>
                          <p className="text-[10px] sm:text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{formatExerciseDetail(ex)}</p>
                        </div>
                        {tracked && <Icon name="play_arrow" className="text-[18px] flex-shrink-0" style={{ color:'var(--accent)' }} />}
                      </button>
                      );
                    })
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
                    onClick={() => handleStartWorkout()}
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
}