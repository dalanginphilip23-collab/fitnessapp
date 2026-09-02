import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { API_BASE_URL } from '../../../config/api';

const TABS = ['D', 'W', 'M'];

const DATA_SOURCES = [
  {
    key:     'sleep',
    label:   'Sleep',
    icon:    'bedtime',
    color:   'var(--accent)',
    metrics: [
      { key: 'duration', label: 'Duration',  unit: 'h',  max: 12,  yTicks: [12, 6, 0]   },
      { key: 'quality',  label: 'Quality',   unit: '',   max: 10,  yTicks: [10, 5, 0]   },
      { key: 'recovery', label: 'Recovery',  unit: '',   max: 100, yTicks: [100, 50, 0] },
    ],
  },
  {
    key:     'analysis',
    label:   'Sleep Analysis',
    icon:    'insights',
    color:   '#a78bfa',
    metrics: [
      { key: 'sleep_hours',    label: 'Total Hours', unit: 'h',  max: 12,  yTicks: [12, 6, 0]   },
      { key: 'recovery_score', label: 'Recovery',    unit: '%',  max: 100, yTicks: [100, 50, 0] },
      { key: 'efficiency',     label: 'Efficiency',  unit: '%',  max: 100, yTicks: [100, 50, 0] },
    ],
  },
];

const getStatus = (sourceKey, metricKey, avg) => {
  if (metricKey === 'duration' || metricKey === 'sleep_hours') {
    if (avg >= 7) return { label: 'Well Rested', color: 'var(--accent)' };
    if (avg >= 5) return { label: 'Light Sleep', color: '#f2c448' };
    return               { label: 'Rest Needed', color: '#f26048' };
  }
  if (avg >= 80) return { label: 'Excellent',  color: 'var(--accent)' };
  if (avg >= 60) return { label: 'Moderate',   color: '#f2c448' };
  return               { label: 'Needs Work',  color: '#f26048' };
};

const EmptyState = ({ color }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none select-none">
    <span
      className="material-symbols-outlined text-[32px] opacity-20"
      style={{ color, fontVariationSettings: "'FILL' 1" }}
    >
      bedtime
    </span>
    <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase">No data for this range</p>
  </div>
);

// "Xh Ym" for duration-style metrics, plain rounded number + unit otherwise.
const formatHeadline = (value, metaObj) => {
  const safe = Number(value) || 0;
  if (metaObj.unit === 'h') {
    const h = Math.floor(safe);
    const m = Math.round((safe - h) * 60);
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }
  return `${Math.round(safe).toLocaleString()}${metaObj.unit}`;
};

export const SleepHoursGraph = React.memo(({ userId = null, onExpand }) => {
  const [activeTab,    setActiveTab]    = useState('D');
  const [activeSource, setActiveSource] = useState('sleep');
  const [activeMetric, setActiveMetric] = useState('duration');
  const [graphData,    setGraphData]    = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [animating,    setAnimating]    = useState(false);

  const cacheRef = useRef(new Map());

  const sourceDef = DATA_SOURCES.find(s => s.key === activeSource);
  const metaObj   = sourceDef.metrics.find(m => m.key === activeMetric) ?? sourceDef.metrics[0];
  const accentColor = sourceDef.color;
  const gradId      = `grad_${activeSource}`;

  const cacheKey = `${activeSource}:${activeTab}:${activeMetric}`;

  const handleSourceSwitch = (key) => {
    if (key === activeSource) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveSource(key);
      setActiveMetric(DATA_SOURCES.find(s => s.key === key).metrics[0].key);
      setAnimating(false);
    }, 180);
  };

  const fetchData = useCallback(async () => {
    if (!userId) {
      setGraphData([]);
      return;
    }

    if (cacheRef.current.has(cacheKey)) {
      setGraphData(cacheRef.current.get(cacheKey));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint =
        activeSource === 'analysis'
          ? `${API_BASE_URL}/api/sleep/${userId}/analysis?range=${activeTab}&metric=${activeMetric}`
          : `${API_BASE_URL}/api/sleep/${userId}?range=${activeTab}&metric=${activeMetric}`;

      const res = await fetch(endpoint, { credentials: 'include' });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const json = await res.json();
      const data = Array.isArray(json) ? json : [];
      cacheRef.current.set(cacheKey, data);
      setGraphData(data);
    } catch (err) {
      console.error('[SleepHoursGraph] Fetch error:', err.message);
      setError(err.message);
      setGraphData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, activeSource, activeTab, activeMetric, cacheKey]);

  const handleRetry = () => {
    cacheRef.current.delete(cacheKey);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const points = graphData;

  const pathData = useMemo(() => {
    if (points.length === 0) return '';
    const W = 1000, H = 200;
    const step = points.length > 1 ? W / (points.length - 1) : W / 2;
    return points.reduce((path, pt, i) => {
      const x = points.length === 1 ? W / 2 : i * step;
      const y = H - (Math.min(Number(pt.value), metaObj.max) / metaObj.max) * H;
      return path + `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `;
    }, '');
  }, [points, metaObj.max]);

  const avg = useMemo(() => {
    if (points.length === 0) return 0;
    return points.reduce((s, p) => s + Number(p.value), 0) / points.length;
  }, [points]);

  const avgDisplay = useMemo(() =>
    metaObj.unit === 'h' ? avg.toFixed(1) : Math.round(avg).toLocaleString()
  , [avg, metaObj.unit]);

  const status = useMemo(() => getStatus(activeSource, activeMetric, avg), [activeSource, activeMetric, avg]);
  const rangeLabel = activeTab === 'D' ? '24 Hours' : activeTab === 'W' ? '7 Days' : '30 Days';

  const headlineValue = useMemo(() =>
    activeTab === 'D' ? points[points.length - 1]?.value ?? 0 : avg
  , [activeTab, points, avg]);

  const headlineLabel = activeTab === 'D' ? 'Last Night' : activeTab === 'W' ? 'Weekly Avg' : 'Monthly Avg';
  const headlineDisplay = formatHeadline(headlineValue, metaObj);

  const xLabelIndices = useMemo(() => {
    if (points.length === 0) return [];
    if (points.length <= 5)  return points.map((_, i) => i);
    return [
      0,
      Math.round(points.length * 0.25),
      Math.round(points.length * 0.5),
      Math.round(points.length * 0.75),
      points.length - 1,
    ];
  }, [points]);

  return (
    <div className="bg-[var(--bg-tertiary)] border min-h-[410px] border-[var(--border-light)] rounded-[20px] p-6 pb-4 transition-all duration-300 card-glow">

      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]" style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>
              bedtime
            </span>
          </div>
          <div>
            <h4 className="font-['Manrope'] text-[15px] font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
              {sourceDef.label}
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] leading-tight">
              {metaObj.label}{metaObj.unit ? ` (${metaObj.unit})` : ''} · Last {rangeLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {loading && (
            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading…</span>
          )}
          {error && !loading && (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-[#f26048] uppercase tracking-widest">Error</span>
              <button
                onClick={handleRetry}
                className="text-[9px] font-bold text-[var(--accent)] hover:underline bg-transparent border-none cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
          {/* Source switcher (Sleep vs AI Sleep Analysis) — compact icon toggle */}
          <div className="hidden sm:flex bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-lg p-0.5 gap-0.5">
            {DATA_SOURCES.map(src => {
              const active = src.key === activeSource;
              return (
                <button
                  key={src.key}
                  onClick={() => handleSourceSwitch(src.key)}
                  title={src.label}
                  className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 cursor-pointer border-none ${
                    active ? 'text-black shadow-md' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                  style={active ? { background: src.color } : {}}
                >
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {src.icon}
                  </span>
                </button>
              );
            })}
          </div>
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          )}
        </div>
      </div>

      {/* Headline summary box */}
      <div className="flex items-center justify-between gap-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-2xl p-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${accentColor}18` }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>
              {sourceDef.icon}
            </span>
          </div>
          <div className="min-w-0">
            <p className="stat-digital text-[20px] font-extrabold text-[var(--text-primary)] leading-none truncate">
              {headlineDisplay}
            </p>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
              {headlineLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {points.length > 0 && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap hidden xs:inline-block"
              style={{ color: status.color, background: `${status.color}18` }}
            >
              {status.label}
            </span>
          )}
          <div className="flex bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-lg p-0.5">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md border-none cursor-pointer transition-all ${
                  activeTab === t
                    ? 'text-black shadow-lg'
                    : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
                style={
                  activeTab === t
                    ? { background: accentColor, boxShadow: `0 2px 8px ${accentColor}30` }
                    : {}
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {sourceDef.metrics.map(m => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
              activeMetric === m.key
                ? 'text-black border-transparent'
                : 'border-[var(--border-light)] text-[var(--text-muted)] bg-transparent hover:text-[var(--text-secondary)]'
            }`}
            style={
              activeMetric === m.key
                ? { background: accentColor, borderColor: accentColor, boxShadow: `0 2px 10px ${accentColor}40` }
                : {}
            }
          >
            {m.label}
          </button>
        ))}

        {points.length > 0 && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-hover)] border border-[var(--border-light)]">
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Avg</span>
            <span className="text-[11px] font-extrabold" style={{ color: accentColor }}>
              {avgDisplay}{metaObj.unit}
            </span>
          </div>
        )}
      </div>

      <div
        className={`relative h-36 transition-all duration-300 ${
          loading || animating ? 'opacity-30 scale-[0.99]' : 'opacity-100 scale-100'
        }`}
      >
        {points.length === 0 && !loading ? (
          <EmptyState color={accentColor} />
        ) : (
          <>
            <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor={accentColor} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                </linearGradient>
              </defs>

              {pathData && (
                <path
                  d={`${pathData} V200 H0 Z`}
                  fill={`url(#${gradId})`}
                  className="transition-all duration-700"
                />
              )}

              <path
                d={pathData}
                fill="none"
                stroke={accentColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-700"
              />
              {points.length <= 10 &&
                points.map((pt, i) => {
                  const W = 1000;
                  const step = points.length > 1 ? W / (points.length - 1) : W / 2;
                  const x = points.length === 1 ? W / 2 : i * step;
                  const y = 200 - (Math.min(Number(pt.value), metaObj.max) / metaObj.max) * 200;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="5"
                      fill={accentColor}
                      fillOpacity="0.9"
                      stroke="var(--bg-tertiary)"
                      strokeWidth="2"
                    />
                  );
                })}
            </svg>

            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2].map(i => <div key={i} className="border-t border-[var(--border-light)]" />)}
            </div>

            <div className="absolute right-0 inset-y-0 flex flex-col justify-between pointer-events-none pr-1">
              {metaObj.yTicks.map(v => (
                <span key={v} className="text-[8px] font-bold text-[var(--text-disabled)]">
                  {v.toLocaleString()}{metaObj.unit}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {points.length > 0 && (
        <div className="flex justify-between mt-2">
          {xLabelIndices.map(i => (
            <span key={i} className="text-[9px] font-bold text-[var(--text-disabled)] uppercase tracking-[0.15em]">
              {points[i]?.label || '--'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

export default SleepHoursGraph;