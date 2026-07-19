import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../../config/port';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const socket = io(SOCKET_URL, { withCredentials: true });
const getTodayKey = () => new Date().toLocaleDateString('en-CA');

export const useDashboardData = (USER_ID) => {
  const [data, setData]             = useState({ stats: {}, profile: {} });
  const [insights, setInsights]     = useState([]);
  const [biometrics, setBiometrics] = useState([]);
  const authOverrideRef = useRef({ name: null, avatar: null });
  const insightsDayRef = useRef(getTodayKey());

  const setAuthOverride = (name, avatar) => {
    authOverrideRef.current = { name, avatar };
    setData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...(name   && { name }),
        ...(avatar && { avatar_url: avatar }),
      },
    }));
  };

  const mergeData = (apiResult) => ({
    ...apiResult,
    profile: {
      ...apiResult.profile,
      ...(authOverrideRef.current.name   && { name:       authOverrideRef.current.name }),
      ...(authOverrideRef.current.avatar && { avatar_url: authOverrideRef.current.avatar }),
    },
  });

  const applyInsights = (incoming, { mode = 'replace' } = {}) => {
    const today = getTodayKey();

    if (insightsDayRef.current !== today) {
      insightsDayRef.current = today;
      setInsights(Array.isArray(incoming) ? incoming : []);
      return;
    }

    if (mode === 'replace') {
      setInsights(Array.isArray(incoming) ? incoming : []);
    } else {
      // 'prepend' — used by the socket handler
      setInsights(prev => [incoming, ...prev].slice(0, 5));
    }
  };

  useEffect(() => {
    if (!USER_ID) return;

    const fetchDashboardData = async () => {
      try {
        const response  = await fetch(`${API_BASE_URL}/api/dashboard/${USER_ID}`, { credentials: 'include' });
        const result    = await response.json();

        const sleepRes  = await fetch(`${API_BASE_URL}/api/sleep/${USER_ID}/today`, { credentials: 'include' });
        const sleepData = await sleepRes.json();

        setData(mergeData({
          ...result,
          stats: {
            ...result.stats,
            water_intake_ml: sleepData?.water_intake_ml || 0,
            sleep_duration:  sleepData?.sleep_duration  || 0,
            sleep_quality:   sleepData?.sleep_quality   || 0,
          },
        }));

        const bioRes  = await fetch(`${API_BASE_URL}/api/sleep/${USER_ID}?range=D&metric=duration`, { credentials: 'include' });
        const bioData = await bioRes.json();
        if (Array.isArray(bioData) && bioData.length > 0) {
          setBiometrics(bioData);
        }
        insightsDayRef.current = getTodayKey();
        if (result.insights) {
          setInsights(result.insights);
        } else {
          setInsights([]);
        }

      } catch (error) {
        console.error('Fetch Error:', error);
      }
    };

    fetchDashboardData();
    socket.emit('join-room', USER_ID);

    const handleNewBiometric = (newPoint) => {
      const normalised = {
        label: newPoint.recorded_at
          ? new Date(newPoint.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : newPoint.label ?? '--:--',
        value: newPoint.value ?? newPoint.sleep_duration ?? 0,
      };
      setBiometrics(prev => [...prev.slice(-19), normalised]);
    };

    const handleNewInsight = (insight) => {
      applyInsights(insight, { mode: 'prepend' });
    };

    socket.on('new-biometric-data',   handleNewBiometric);
    socket.on('new-clinical-insight', handleNewInsight);

    const dayCheckInterval = setInterval(() => {
      const today = getTodayKey();
      if (insightsDayRef.current !== today) {
        insightsDayRef.current = today;
        setInsights([]);
      }
    }, 60 * 1000);

    return () => {
      socket.off('new-biometric-data',   handleNewBiometric);
      socket.off('new-clinical-insight', handleNewInsight);
      clearInterval(dayCheckInterval);
    };
  }, [USER_ID]);

  return {
    data,
    insights,
    biometrics,
    setData,
    setInsights: (val) => applyInsights(val, { mode: 'replace' }),
    setBiometrics,
    setAuthOverride,
    mergeData,
  };
};