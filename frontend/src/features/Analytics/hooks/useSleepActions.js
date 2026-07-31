import { useEffect } from 'react';
import { saveSleepData } from '../services/sleepService';
import { API_BASE_URL } from '../../../config/port';
import { saveLocalFallbackInsight } from '../../../utils/localInsight';


// Builds an honest, data-driven message from the values the user just saved.
// Used only when the backend analysis endpoint is unavailable — it reflects
// the real numbers so the Clinical Assistant never appears broken, and a
// genuine AI insight replaces it once the backend can generate one.
const buildFallbackMessage = (firstName, sleepHours, sleepQuality, waterIntake, activityStats) => {
  const status  = sleepHours >= 7 ? 'adequate' : sleepHours >= 5 ? 'below optimal' : 'critically low';
  const glasses = Math.round(waterIntake / 250);
  const parts = [
    `${firstName}, your latest sync is in: ${sleepHours}h of sleep (${status}), quality ${sleepQuality}/10, and ${waterIntake}ml of water (~${glasses} glasses).`,
  ];
  if (activityStats.steps) {
    parts.push(`You logged ${activityStats.steps} steps and burned ${activityStats.calories_burned} kcal today.`);
  }
  parts.push('The AI analysis engine is temporarily unavailable — your data is still being tracked and a personalized breakdown will appear here shortly.');
  return parts.join(' ');
};


// Regenerates today's clinical insight so the "Clinical Assistant" widget
// on the dashboard reflects the freshly saved sleep/hydration data instead
// of staying stale. Pulls the latest activity stats first so the AI prompt
// isn't built from zeroed-out calories/steps. If the backend endpoint is
// unavailable (older deployed build), it falls back to a local same-day
// insight the dashboard can render immediately.
const refreshClinicalInsight = async (USER_ID, sleepHours, sleepQuality, waterIntake) => {
  try {
    let activityStats = { calories_burned: 0, steps: 0, workout_duration_mins: 0 };
    let firstName     = 'Athlete';
    try {
      const res  = await fetch(`${API_BASE_URL}/api/dashboard/${USER_ID}`, { credentials: 'include' });
      const data = await res.json();
      activityStats = {
        calories_burned:       data?.stats?.calories_burned       || 0,
        steps:                 data?.stats?.steps                 || 0,
        workout_duration_mins: data?.stats?.workout_duration_mins || 0,
      };
      if (data?.profile?.name) firstName = data.profile.name.split(' ')[0];
    } catch (err) {
      console.error('Latest stats fetch failed:', err);
    }

    let analysisFailed = false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/clinical-analysis`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: USER_ID,
          stats: {
            ...activityStats,
            sleep_duration:  sleepHours,
            sleep_quality:   sleepQuality,
            water_intake_ml: waterIntake,
          },
        }),
      });
      if (!res.ok) analysisFailed = true;
    } catch (err) {
      console.error('Clinical analysis request error:', err);
      analysisFailed = true;
    }

    if (analysisFailed) {
      saveLocalFallbackInsight(USER_ID, {
        id:        `local-${Date.now()}`,
        message:   buildFallbackMessage(firstName, sleepHours, sleepQuality, waterIntake, activityStats),
        category:  'Rest Advisory',
        trend:     'stable',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  } catch (err) {
    console.error('Clinical insight refresh error:', err);
  }
};

export const useSleepActions = ({
  USER_ID,
  sleepHours,
  sleepQuality,
  waterIntake,
  sleepStatus,
  setSaveStatus,
  loadSleepAndScatter,
  saveTimer
}) => {

  const handleSaveSleep = async () => {
    setSaveStatus('saving');
    try {
      await saveSleepData(USER_ID, {
        sleep_duration:  sleepHours,
        sleep_quality:   sleepQuality,
        recovery_score:  sleepStatus.score,
        water_intake_ml: waterIntake,
      });

      setSaveStatus('saved');
      loadSleepAndScatter();

      refreshClinicalInsight(USER_ID, sleepHours, sleepQuality, waterIntake);

      saveTimer.current = setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Sleep save error:', err);
      setSaveStatus('error');

      saveTimer.current = setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    return () => clearTimeout(saveTimer.current);
  }, []);

  return { handleSaveSleep };
};