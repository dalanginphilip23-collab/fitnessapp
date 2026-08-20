const formatSeconds = (totalSeconds) => {
  if (!totalSeconds) return '';
  if (totalSeconds >= 60) {
    const mins = Math.round(totalSeconds / 60);
    return `${mins} min`;
  }
  return `${totalSeconds}s`;
};

export function formatExerciseDetail(ex) {
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
}