import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';
import { STATS_FALLBACK } from '../constants';

const useLiveStats = () => {
  const [stats, setStats] = useState(STATS_FALLBACK);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/stats`);
        if (!res.ok) throw new Error('stats unavailable');
        const data = await res.json();
        if (active && data?.success) {
          setStats({
            users:       Number(data.users)       || STATS_FALLBACK.users,
            onlineUsers: Number(data.onlineUsers) || 0,
            activeToday: Number(data.activeToday) || 0,
            workouts:    Number(data.workouts)    || 0,
            uniqueUsers: Number(data.uniqueUsers) || 0,
            dataPoints:  Number(data.dataPoints)  || STATS_FALLBACK.dataPoints,
          });
        }
      } catch {
        // Keep the graceful fallback if the API is unreachable.
      }
    };
    load();
    return () => { active = false; };
  }, []);

  return stats;
};

export default useLiveStats;