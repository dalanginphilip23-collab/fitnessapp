import { useEffect } from 'react';
import { saveSleepData } from '../services/sleepService';
import { API_BASE_URL } from '../../../config/port';


// Regenerates today's clinical insight so the "Clinical Assistant" widget
// on the dashboard reflects the freshly saved sleep/hydration data instead
// of staying stale. Pulls the latest activity stats first so the AI prompt
// isn't built from zeroed-out calories/steps.
const refreshClinicalInsight = async (USER_ID, sleepHours, sleepQuality, waterIntake) => {
  try {
    let activityStats = { calories_burned: 0, steps: 0, workout_duration_mins: 0 };
    try {
      const res  = await fetch(`${API_BASE_URL}/api/dashboard/${USER_ID}`, { credentials: 'include' });
      const data = await res.json();
      activityStats = {
        calories_burned:       data?.stats?.calories_burned       || 0,
        steps:                 data?.stats?.steps                 || 0,
        workout_duration_mins: data?.stats?.workout_duration_mins || 0,
      };
    } catch (err) {
      console.error('Latest stats fetch failed:', err);
    }

    const hasActivity =
      activityStats.steps > 0 ||
      activityStats.calories_burned > 0 ||
      activityStats.workout_duration_mins > 0;
    const hasSleep = sleepHours > 0 || sleepQuality > 0 || waterIntake > 0;

    // The Clinical Assistant only unlocks once the user has BOTH logged a
    // workout AND synced sleep data. Generating earlier would produce a
    // misleading insight (e.g. "0 steps = rest day").
    if (!hasActivity || !hasSleep) return;

    await fetch(`${API_BASE_URL}/api/ai/clinical-analysis`, {
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
  saveTimer: saveTimerRef,
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

      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Sleep save error:', err);
      setSaveStatus('error');

      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    return () => clearTimeout(saveTimerRef.current);
  }, [saveTimerRef]);

  return { handleSaveSleep };
};