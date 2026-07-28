import { useState, useEffect } from 'react';
import Icon from './Icon';
import { API_BASE_URL } from '../config/port';

const trendIcon = (trend) => {
  if (trend === 'up')   return { icon: 'trending_up',   color: '#4ade80' };
  if (trend === 'down') return { icon: 'trending_down', color: '#ef4444' };
  return                       { icon: 'trending_flat', color: '#facc15' };
};

const isToday = (timestamp) => {
  if (!timestamp) return false;
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const categoryColor = (category) => {
  switch (category) {
    case 'Recovery Alert':    return '#ef4444';
    case 'Hydration Warning': return '#3b82f6';
    case 'Performance Tip':   return 'var(--accent)';
    case 'Rest Advisory':     return '#a855f7';
    default:                  return 'var(--accent)';
  }
};

const InsightCard = ({ item }) => {
  const accent = categoryColor(item.category);
  const { icon, color } = trendIcon(item.trend);
  return (
    <div
      className="rounded-xl p-4 border-l-[3px] bg-(--bg-hover) transition-all hover:bg-(--bg-active) flex-shrink-0"
      style={{ borderColor: accent }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>
          {item.category}
        </span>
        <Icon name={icon} className="text-[14px]" style={{ color }} />
      </div>
      <p className="text-[12px] text-(--text-secondary) leading-relaxed font-medium">
        {item.message}
      </p>
      {item.timestamp && (
        <div className="flex items-center gap-1 mt-3 opacity-40">
          <Icon name="schedule" className="text-[10px]" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">
            {item.timestamp}
          </span>
        </div>
      )}
    </div>
  );
};

const ClinicalAssistant = ({ insights = [], water = 0, isAnalyzing = false, userId = null }) => {
  const [barWidth,     setBarWidth]     = useState(0);
  const [showHistory,  setShowHistory]  = useState(false);
  const [history,      setHistory]      = useState([]);
  const [historyLoad,  setHistoryLoad]  = useState(false);
  const [historyError, setHistoryError] = useState(false);

  const goal = 5000;

  useEffect(() => {
    if (isAnalyzing && showHistory) setShowHistory(false);
  }, [isAnalyzing, showHistory]);

  useEffect(() => {
    const numericWater = Number(water) || 0;
    const calculated   = Math.min((numericWater / goal) * 100, 100);
    const timer = setTimeout(() => setBarWidth(calculated), 100);
    return () => clearTimeout(timer);
  }, [water]);

  useEffect(() => {
    if (!userId || insights.length > 0) return;
    const fetchLatestIfEmpty = async () => {
      setHistoryLoad(true);
      try {
        const res  = await fetch(`${API_BASE_URL}/api/ai/history/${userId}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setHistory(data);
      } catch (err) {
        console.error('Initial fetch error:', err);
      } finally {
        setHistoryLoad(false);
      }
    };
    fetchLatestIfEmpty();
  }, [userId, insights.length]);

  useEffect(() => {
    if (!showHistory || !userId) return;
    const fetchHistory = async () => {
      setHistoryLoad(true);
      setHistoryError(false);
      try {
        const res  = await fetch(`${API_BASE_URL}/api/ai/history/${userId}`);
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('History fetch error:', err);
        setHistoryError(true);
      } finally {
        setHistoryLoad(false);
      }
    };
    fetchHistory();
  }, [showHistory, userId]);

  const activeInsights = showHistory
    ? history
    : (insights.length > 0 ? insights : history.filter(item => isToday(item.timestamp)).slice(0, 5));

  return (
    <div className="h-full lg:h-[calc(100vh-140px)] min-h-[500px] bg-(--bg-tertiary) border border-(--border-light) rounded-[20px] p-5 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-(--accent-bg) flex items-center justify-center">
            <Icon name="auto_awesome" className="text-(--accent) text-[16px]" />
          </div>
          <div>
            <span className="font-bold text-[13px] text-(--text-primary)">Clinical Assistant</span>
            <p className="text-[9px] text-(--text-muted) font-medium uppercase tracking-wider">AI-powered insights</p>
          </div>
        </div>

        {isAnalyzing && (
          <div className="flex items-center gap-1.5 bg-(--accent-bg) px-2.5 py-1.5 rounded-full border border-(--accent-border)">
            <div className="w-1.5 h-1.5 bg-(--accent) rounded-full animate-ping" />
            <span className="text-[8px] font-black text-(--accent) uppercase tracking-widest">Scanning</span>
          </div>
        )}
      </div>

      <div className="mb-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-(--text-muted) uppercase tracking-wider font-bold">Hydration</span>
          <span className={`text-[10px] font-black ${Number(water) < 1000 ? 'text-(--error)' : 'text-(--blue)'}`}>
            {water} / {goal} ml
          </span>
        </div>
        <div className="h-2 bg-(--bg-hover) rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-in-out ${Number(water) < 1000 ? 'bg-(--error)' : 'bg-(--blue)'}`}
            style={{ width: `${barWidth}%`, minWidth: barWidth > 0 ? '4px' : '0px' }}
          />
        </div>
      </div>

      <div className="mb-3 flex-shrink-0">
        <button
          onClick={() => setShowHistory(prev => !prev)}
          disabled={!userId || isAnalyzing}
          className={`
            w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl
            text-[10px] font-black uppercase tracking-widest
            border transition-all duration-200 cursor-pointer
            ${showHistory
              ? 'bg-(--accent-bg) border-(--accent-border) text-(--accent)'
              : 'bg-(--bg-hover) border-(--border-light) text-(--text-muted) hover:text-(--text-secondary) hover:border-(--border-medium)'
            }
            disabled:opacity-30 disabled:cursor-not-allowed
          `}
        >
          <Icon name={showHistory ? 'history_toggle_off' : 'manage_history'} className="text-[13px]" />
          {showHistory ? 'Show Recent' : 'Show All History'}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted)">
          {showHistory ? 'Full AI History' : 'Recent Insights'}
        </span>
        {showHistory && !historyLoad && history.length > 0 && (
          <span className="text-[9px] font-black text-(--accent)/50">({history.length})</span>
        )}
        <div className="flex-1 h-px bg-(--border-light)" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {historyLoad && (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-(--accent)/20 border-t-(--accent) animate-spin" />
              <span className="text-[10px] text-(--text-muted) uppercase tracking-widest animate-pulse-soft">Loading...</span>
            </div>
          </div>
        )}

        {historyError && !historyLoad && (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-(--error)/20 rounded-xl">
            <p className="text-[11px] text-(--error)/50 italic text-center px-4">
              Failed to load history. Check your connection.
            </p>
          </div>
        )}

        {!historyLoad && !historyError && activeInsights.length === 0 && (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-(--border-light) rounded-xl">
            <p className="text-[11px] text-(--text-muted) italic text-center px-4">
              {showHistory
                ? 'No history found. Your AI insights will appear here after analysis.'
                : 'Waiting for biometric data to assess health condition...'}
            </p>
          </div>
        )}

        {!historyLoad && !historyError && activeInsights.map((item, idx) => (
          <InsightCard key={item.id || idx} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ClinicalAssistant;