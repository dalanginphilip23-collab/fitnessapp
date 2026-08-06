// Daily readiness is derived from last night's sleep — duration weighted
// against an 8h target, quality weighted against its 0-10 scale (same scale
// SleepHoursGraph already uses). Split 50/50 so neither factor dominates.
const DURATION_TARGET_HOURS = 8;
const QUALITY_MAX = 10;

const READINESS_BANDS = [
  { min: 85, label: 'Peak Condition',    message: 'Fully recovered — go all out today.' },
  { min: 70, label: 'Great Recovery',    message: "You're ready to perform." },
  { min: 50, label: 'Moderate Recovery', message: 'A solid effort is on the table today.' },
  { min: 25, label: 'Low Recovery',      message: 'Ease up — your body is asking for recovery.' },
  { min: 0,  label: 'Rest Needed',       message: 'Prioritize sleep before your next hard session.' },
];

const clamp01 = (n) => Math.min(Math.max(n, 0), 1);

/**
 * @param {{ sleepDurationHours?: number, sleepQuality?: number }} input
 * @returns {{ pct: number, label: string, message: string, hasData: boolean }}
 */
export const computeReadiness = ({ sleepDurationHours = 0, sleepQuality = 0 } = {}) => {
  const hasData = sleepDurationHours > 0 || sleepQuality > 0;

  if (!hasData) {
    return {
      pct: 0,
      label: 'No Data Yet',
      message: 'Log your sleep to see your daily readiness.',
      hasData: false,
    };
  }

  const durationScore = clamp01(sleepDurationHours / DURATION_TARGET_HOURS);
  const qualityScore  = clamp01(sleepQuality / QUALITY_MAX);
  const pct = Math.round((durationScore * 0.5 + qualityScore * 0.5) * 100);

  const band = READINESS_BANDS.find((b) => pct >= b.min) ?? READINESS_BANDS[READINESS_BANDS.length - 1];

  return { pct, label: band.label, message: band.message, hasData: true };
};
