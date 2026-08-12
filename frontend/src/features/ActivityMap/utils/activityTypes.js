// Activity type metadata for the ActivityMap redesign.
// Single source of truth for Run / Walk / Jog / Hike so the map, the
// activity card, the share image and the feed all render the same way.

export const ACTIVITY_TYPES = {
  run: {
    key: 'run',
    label: 'Run',
    icon: 'directions_run',
    met: 8,        // MET value used for calorie estimation
    color: '#8BC34A',
    defaultTitle: 'Morning Run',
  },
  walk: {
    key: 'walk',
    label: 'Walk',
    icon: 'directions_walk',
    met: 3.5,
    color: '#4DD0E1',
    defaultTitle: 'Evening Walk',
  },
  jog: {
    key: 'jog',
    label: 'Jog',
    icon: 'hiking',
    met: 6,
    color: '#FFB74D',
    defaultTitle: 'Afternoon Jog',
  },
  hike: {
    key: 'hike',
    label: 'Hike',
    icon: 'terrain',
    met: 5,
    color: '#CE93D8',
    defaultTitle: 'Weekend Hike',
  },
  workout: {
    key: 'workout',
    label: 'Workout',
    icon: 'fitness_center',
    met: 6,
    color: '#F062A0',
    defaultTitle: 'Manual Workout',
  },
};

export const ACTIVITY_TYPE_KEYS = Object.keys(ACTIVITY_TYPES);

export function getActivityType(key) {
  return ACTIVITY_TYPES[key] || ACTIVITY_TYPES.run;
}

// Estimate calories burned from distance (km), duration (s) and a MET value.
// Calories = MET * weight(kg) * hours  (default 70kg user).
export function estimateCalories(distanceKm, durationSec, met = 8) {
  if (!durationSec || durationSec <= 0) return Math.floor(distanceKm * 60);
  const hours = durationSec / 3600;
  return Math.floor(met * 70 * hours);
}

export function defaultTitleForType(key, date = new Date()) {
  const meta = getActivityType(key);
  const hour = date.getHours();
  if (hour < 12) return `Morning ${meta.label}`;
  if (hour < 18) return `Afternoon ${meta.label}`;
  return `Evening ${meta.label}`;
}
