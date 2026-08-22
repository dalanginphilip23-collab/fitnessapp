import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { API_BASE_URL } from '../../../config/port';
import { useAnalyticsState } from '../hooks/useAnalyticsState';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useSleepActions } from '../hooks/useSleepActions';
import { SidebarAnalytics, AnalyticsMobileNav, Topbar, RadialProgress, Icon } from '../../../components';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);


// HELPERS — unchanged from original, no logic touched
const resolveCssVar = (name, fallback = '#000000') => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const calculateSleepScore = (hours, quality) => {
  const durationScore =
    hours >= 7 && hours <= 9 ? 100 : hours > 9 ? 80 : (hours / 7) * 100;
  return Math.round(durationScore * 0.6 + quality * 10 * 0.4);
};

const getSleepStatusReal = (hours, quality) => {
  const score = calculateSleepScore(hours, quality);
  if (score >= 85) return { label: 'Ready to train 💪', color: 'text-(--accent)',  border: 'border-(--accent-border)',  bg: 'bg-(--accent-bg)',  level: 'Optimal', score };
  if (score >= 60) return { label: 'Light workout 😐',  color: 'text-orange-400', border: 'border-orange-400/40', bg: 'bg-orange-400/10', level: 'Fair',    score };
  if (hours > 10)  return { label: 'Oversleep recovery 😪', color: 'text-blue-400', border: 'border-blue-400/40', bg: 'bg-blue-400/10', level: 'High', score };
  return                   { label: 'Rest recommended 😴', color: 'text-red-400',   border: 'border-red-400/40',  bg: 'bg-red-400/10',   level: 'Low',     score };
};


const getPointColor = (hours, quality) => {
  const score = calculateSleepScore(hours, quality);
  if (score >= 85) return resolveCssVar('--accent', '#d1fd52');
  if (score >= 60) return '#fb923c';
  return '#f87171';
};

const ZONE_CONFIG = {
  5: { color: 'bg-red-500',       label: 'Zone 5 (Anaerobic)'    },
  4: { color: 'bg-orange-400',    label: 'Zone 4 (Threshold)'    },
  3: { color: 'bg-yellow-400',    label: 'Zone 3 (Tempo)'        },
  2: { color: 'bg-(--accent)',    label: 'Zone 2 (Aerobic Base)' },
  1: { color: 'bg-blue-400',      label: 'Zone 1 (Recovery)'     },
};

const DEFAULT_ZONES = [
  { zone: 5, label: 'Zone 5 (Anaerobic)',    value: '0%', color: 'bg-red-500'    },
  { zone: 4, label: 'Zone 4 (Threshold)',    value: '0%', color: 'bg-orange-400' },
  { zone: 2, label: 'Zone 2 (Aerobic Base)', value: '0%', color: 'bg-(--accent)' },
];

// ─────────────────────────────────────────────
// UI COMPONENTS — visual redesign only. Every prop, event handler,
// and piece of state passed into these still comes straight from the
// hooks below; nothing here computes or mutates app data.
// ─────────────────────────────────────────────

function TimeframeToggle({ timeframe, setTimeframe }) {
  return (
    <div className="flex bg-(--bg-primary)/60 p-1 rounded-xl border border-(--border-light) overflow-x-auto no-scrollbar shadow-xl self-start sm:self-auto shrink-0">
      {['Weekly', 'Monthly', 'Quarterly'].map((t) => (
        <button
          key={t}
          onClick={() => setTimeframe(t)}
          className={`px-3 sm:px-5 md:px-6 py-2 md:py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-[0.15em] rounded-lg transition-all whitespace-nowrap touch-manipulation ${
            timeframe === t
              ? 'bg-(--accent) text-[#161f00] shadow-lg'
              : 'text-(--text-muted) hover:text-(--text-primary)'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function PageHeader({ timeframe, setTimeframe }) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-(--border-light) bg-(--bg-tertiary) mesh-gradient-hero card-glow px-5 sm:px-8 md:px-10 py-6 sm:py-8 mb-6 md:mb-10 lg:mb-12">
      <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="hidden xs:flex w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-(--accent-bg) border border-(--accent-border) items-center justify-center shrink-0 shadow-[0_0_20px_var(--accent-bg)]">
            <Icon name="monitor_heart" className="text-(--accent) text-2xl" fill={1} />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="flex items-center gap-2 text-(--accent) font-black tracking-[0.25em] text-[10px] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-(--accent) shadow-[0_0_8px_var(--accent)] animate-pulse" />
              Endurance Tracking
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter font-['Manrope'] text-(--text-primary) leading-none">
              Aerobic Engine
            </h2>
          </div>
        </div>
        <TimeframeToggle timeframe={timeframe} setTimeframe={setTimeframe} />
      </div>
    </section>
  );
}

function ScatterLegend() {
  const items = [
    { dot: 'bg-(--accent)',                       label: 'Optimal' },
    { dot: 'bg-orange-400',                       label: 'Fair'    },
    { dot: 'bg-red-400',                          label: 'Low'     },
    { dot: 'border-2 border-(--accent) bg-white', label: 'Current' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 rounded-xl bg-(--bg-hover) border border-(--border-light) text-[9px] font-black uppercase tracking-widest shrink-0">
      {items.map(({ dot, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
          <span className="text-(--text-muted)">{label}</span>
        </span>
      ))}
    </div>
  );
}

function SleepScatterChart({ scatterData, sleepHours, sleepQuality }) {
  const accentColor  = resolveCssVar('--accent',        '#d1fd52');
  const textMuted    = resolveCssVar('--text-muted',    '#9ca3af');
  const borderLight  = resolveCssVar('--border-light',  'rgba(255,255,255,0.08)');
  const bgCard       = resolveCssVar('--bg-card',       '#1f1f1f');
  const textPrimary  = resolveCssVar('--text-primary',  '#ffffff');
  const borderMedium = resolveCssVar('--border-medium', 'rgba(255,255,255,0.16)');

  const chartDataset = {
    datasets: [
      {
        label:                'Sleep Sessions',
        data:                 scatterData.map((d) => ({ x: parseFloat(d.sleep_duration), y: parseInt(d.sleep_quality) })),
        pointBackgroundColor: scatterData.map((d) => getPointColor(parseFloat(d.sleep_duration), parseInt(d.sleep_quality))),
        pointRadius:          6,
        pointHoverRadius:     8,
      },
      {
        label:                'Current',
        data:                 [{ x: sleepHours, y: sleepQuality }],
        pointBackgroundColor: '#ffffff',
        pointBorderColor:     accentColor,
        pointBorderWidth:     2,
        pointRadius:          7,
        pointHoverRadius:     9,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x}h · Quality ${ctx.parsed.y}/10` },
        backgroundColor: bgCard,
        titleColor:      accentColor,
        bodyColor:       textPrimary,
        borderColor:     borderMedium,
        borderWidth:     1,
        padding:         10,
        cornerRadius:    10,
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Sleep Duration (hours)', color: textMuted, font: { size: 10, weight: 'bold', family: 'Poppins' } },
        min: 0, max: 13,
        ticks: { color: textMuted, stepSize: 2, callback: (v) => `${v}h`, font: { size: 9 } },
        grid:  { color: borderLight },
      },
      y: {
        title: { display: true, text: 'Quality (1–10)', color: textMuted, font: { size: 10, weight: 'bold', family: 'Poppins' } },
        min: 0, max: 11,
        ticks: { color: textMuted, stepSize: 2, font: { size: 9 } },
        grid:  { color: borderLight },
      },
    },
  };

  return (
    <div className="relative col-span-1 lg:col-span-8 bg-(--bg-tertiary) rounded-[24px] border border-(--border-light) shadow-sm overflow-hidden card-glow">
      <div className="h-[2px] bg-gradient-to-r from-transparent via-(--accent) to-transparent opacity-70" />
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5 sm:mb-7">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
              <Icon name="insights" className="text-(--accent) text-[14px]" fill={1} />
              <h3 className="text-(--text-muted) text-[10px] font-bold uppercase tracking-[0.2em]">
                Sleep Duration vs Quality
              </h3>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black font-['Manrope'] text-(--text-primary) leading-none flex flex-wrap items-center gap-2 sm:gap-3">
              {sleepHours}h
              <span className="text-(--accent) text-xs sm:text-sm font-bold bg-(--accent-bg) border border-(--accent-border) rounded-full px-2.5 py-1">
                Q{sleepQuality}/10
              </span>
            </p>
          </div>
          <ScatterLegend />
        </div>
        <div className="h-47.5 xs:h-55 sm:h-62.5 md:h-70 lg:h-75">
          <Scatter data={chartDataset} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

function SleepSlider({ label, valueLabel, labelColor, trackColor, min, max, step, value, onChange, accent }) {
  const pct = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex justify-between text-[9px] text-(--text-muted) font-black uppercase tracking-widest">
        <span>{label}</span>
        <span className={labelColor}>{valueLabel}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={onChange}
        style={{
          touchAction: 'pan-y',
          background: `linear-gradient(to right, ${trackColor} ${pct}%, var(--bg-hover) ${pct}%)`,
        }}
        className={`w-full h-1.5 rounded-full appearance-none cursor-pointer transition-[background] ${accent}`}
      />
    </div>
  );
}

function SleepSyncCard({ sleepHours, setSleepHours, sleepQuality, setSleepQuality, waterIntake, setWaterIntake, sleepStatus, saveStatus, onSave }) {
  const saveBadge = {
    saving: { text: 'Saving…', cls: 'text-(--text-muted)' },
    saved:  { text: '✓ Saved', cls: 'text-(--accent)'     },
    error:  { text: '✕ Error', cls: 'text-red-400'        },
  };

  return (
    <div className="col-span-1 lg:col-span-4">
      <div className="relative bg-(--bg-tertiary) rounded-[24px] border border-(--border-light) shadow-sm h-full overflow-hidden card-glow">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-(--accent) to-transparent opacity-70" />
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 bg-(--bg-hover) rounded-xl shrink-0">
                <Icon name="bedtime" className="text-(--accent) text-xl sm:text-2xl" fill={1} />
              </div>
              <div className="min-w-0">
                <h4 className="text-lg sm:text-xl font-black font-['Manrope'] text-(--text-primary) leading-tight truncate">
                  Rest <span className={sleepStatus.color}>{sleepHours}h</span>
                </h4>
                <span className={`inline-block mt-1.5 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md border ${sleepStatus.color} ${sleepStatus.border} ${sleepStatus.bg}`}>
                  {sleepStatus.level}
                </span>
              </div>
            </div>
            <RadialProgress
              value={sleepStatus.score}
              goal={100}
              size={54}
              strokeWidth={5}
              color="var(--accent)"
              label="Score"
            />
          </div>

          <p className="text-(--text-muted) text-[11px] leading-relaxed mb-5 sm:mb-8 font-medium">{sleepStatus.label}</p>

          <div className="space-y-5 sm:space-y-7">
            <SleepSlider
              label="Duration" valueLabel={`${sleepHours} Hours`}
              labelColor="text-(--accent)" trackColor="var(--accent)"
              min={0} max={12} step={0.5} value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              accent="accent-(--accent)"
            />
            <SleepSlider
              label="Quality" valueLabel={`${sleepQuality}/10`}
              labelColor="text-orange-400" trackColor="#fb923c"
              min={1} max={10} step={1} value={sleepQuality}
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              accent="accent-orange-400"
            />
            <SleepSlider
              label="Hydration" valueLabel={`${waterIntake} ml`}
              labelColor="text-blue-400" trackColor="#60a5fa"
              min={0} max={5000} step={250} value={waterIntake}
              onChange={(e) => setWaterIntake(parseInt(e.target.value))}
              accent="accent-blue-400"
            />

            <button
              onClick={onSave}
              disabled={saveStatus === 'saving'}
              className="w-full py-3 sm:py-3.5 bg-(--accent) hover:brightness-105 active:scale-[0.98] disabled:opacity-50 text-[#161f00] text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all shadow-[0_5px_15px_rgba(209,253,82,0.2)] flex items-center justify-center gap-2 touch-manipulation"
            >
              {saveStatus === 'saving' && (
                <span className="w-3 h-3 border-2 border-[#161f00]/30 border-t-[#161f00] rounded-full animate-spin" />
              )}
              {saveStatus === 'saving' ? 'Syncing...' : 'Sync Sleep Data'}
            </button>

            {saveStatus !== 'idle' && saveStatus !== 'saving' && (
              <p className={`text-center text-[9px] font-black uppercase ${saveBadge[saveStatus].cls}`}>
                {saveBadge[saveStatus].text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ZoneBar({ zone }) {
  return (
    <div className="space-y-2 sm:space-y-3 group">
      <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-tighter gap-2">
        <span className="flex items-center gap-2 text-(--text-secondary) truncate">
          <span className={`w-2 h-2 rounded-full shrink-0 ${zone.color}`} />
          {zone.label}
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {zone.minutes !== undefined && (
            <span className="text-(--text-muted) text-[9px] hidden sm:inline">{zone.minutes}min</span>
          )}
          <span className="text-(--text-primary)">{zone.value}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-(--bg-hover) rounded-full overflow-hidden">
        <div
          className={`h-full ${zone.color} rounded-full transition-all duration-1000 group-hover:brightness-110`}
          style={{ width: zone.value }}
        />
      </div>
    </div>
  );
}

function DistributionZones({ zones, zonesLoading }) {
  return (
    <div className="col-span-1 lg:col-span-12 bg-(--bg-tertiary) rounded-[24px] border border-(--border-light) shadow-sm p-4 sm:p-6 md:p-8 card-glow">
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <div className="flex items-center gap-2">
          <Icon name="stacked_line_chart" className="text-(--accent) text-[14px]" fill={1} />
          <h3 className="font-bold text-[10px] uppercase tracking-[0.25em] text-(--text-muted)">Distribution Zones</h3>
        </div>
        {zonesLoading && (
          <span className="text-[9px] font-black uppercase tracking-widest text-(--text-muted) animate-pulse">Loading…</span>
        )}
      </div>
      {zones.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 sm:py-10">
          <Icon name="monitor_heart" className="text-(--text-disabled) text-3xl" />
          <p className="text-(--text-muted) text-[11px] font-bold uppercase tracking-widest text-center">
            No zone data for this period
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {zones.map((zone, i) => <ZoneBar key={i} zone={zone} />)}
        </div>
      )}
    </div>
  );
}

// INNER PAGE — hooks called unconditionally, all identical to the original.
function AnalyticsInner({ USER_ID }) {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = React.useState(false);

  const {
    timeframe, setTimeframe,
    sleepHours, setSleepHours,
    sleepQuality, setSleepQuality,
    waterIntake, setWaterIntake,
    scatterData, setScatterData,
    zones, setZones,
    zonesLoading, setZonesLoading,
    saveStatus, setSaveStatus,
    saveTimer,
  } = useAnalyticsState();


  const { loadSleepAndScatter } = useAnalyticsData({
    USER_ID, timeframe,
    setZones, setZonesLoading,
    setScatterData, setSleepHours,
    setSleepQuality, setWaterIntake,
  });

  const sleepStatus = getSleepStatusReal(sleepHours, sleepQuality);

  const { handleSaveSleep } = useSleepActions({
    USER_ID, sleepHours, sleepQuality,
    waterIntake, sleepStatus, setSaveStatus,
    loadSleepAndScatter,
    saveTimer,
  });

  return (
    <div className="flex flex-col md:flex-row min-h-dvh bg-(--bg-primary) text-(--text-primary) font-['Poppins'] selection:bg-(--accent) selection:text-[#161f00]">
      <SidebarAnalytics onExpandChange={setSidebarExpanded} />
      <AnalyticsMobileNav navigate={navigate} />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <Topbar sidebarExpanded={sidebarExpanded} userId={USER_ID} />

        <main className="pt-14 md:pt-16 p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-350 mx-auto">
          <PageHeader timeframe={timeframe} setTimeframe={setTimeframe} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            <SleepScatterChart scatterData={scatterData} sleepHours={sleepHours} sleepQuality={sleepQuality} />
            <SleepSyncCard
              sleepHours={sleepHours}       setSleepHours={setSleepHours}
              sleepQuality={sleepQuality}   setSleepQuality={setSleepQuality}
              waterIntake={waterIntake}     setWaterIntake={setWaterIntake}
              sleepStatus={sleepStatus}     saveStatus={saveStatus}
              onSave={handleSaveSleep}
            />
            <DistributionZones zones={zones} zonesLoading={zonesLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}


// MAIN PAGE — guards only, no hooks. Unchanged.
const Analytics = () => {
  const { user, loading } = useAuth();
  const USER_ID = user?.id;

  if (loading) {
    return (
      <div className="flex min-h-dvh bg-(--bg-primary) items-center justify-center">
        <span className="text-(--accent) text-[11px] font-black uppercase tracking-widest animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  if (!USER_ID) return <Navigate to="/login" replace />;

  return <AnalyticsInner USER_ID={USER_ID} />;
};

export default Analytics;
