// Unified exercise registry — single source of truth for Plans ↔ Camera Workout
// Maps DB free-text names (70 variants) to camera-trackable slugs (22).
// Untracked/mobility items return null.
// NOTE: Does NOT import WORKOUT_OPTIONS to avoid circular dep with CameraWorkout.
// Keep WORKOUT_OPTIONS_SLUG list in sync with frontend/src/features/CameraWorkout/constants/workout.js

const WORKOUT_OPTIONS_META = [
  { id: 'pushup',        label: 'Push-Ups',        icon: 'fitness_center' },
  { id: 'squat',         label: 'Squats',          icon: 'accessibility_new' },
  { id: 'plank',         label: 'Plank',           icon: 'horizontal_rule' },
  { id: 'lunge',         label: 'Lunges',          icon: 'directions_walk' },
  { id: 'overhead',      label: 'OH Press',        icon: 'upload' },
  { id: 'dip',           label: 'Dips',            icon: 'unfold_more' },
  { id: 'burpee',        label: 'Burpees',         icon: 'bolt' },
  { id: 'jumpingjack',   label: 'Jumping Jacks',   icon: 'sports_gymnastics' },
  { id: 'mountainclimb', label: 'Mountain Climbers', icon: 'terrain' },
  { id: 'highknee',      label: 'High Knees',      icon: 'directions_run' },
  { id: 'glute_bridge',  label: 'Glute Bridge',    icon: 'airline_seat_flat' },
  { id: 'crunch',        label: 'Crunches',        icon: 'airline_seat_recline_normal' },
  { id: 'situp',         label: 'Sit-Ups',         icon: 'self_improvement' },
  { id: 'bicep_curl',    label: 'Bicep Curls',     icon: 'sports_mma' },
  { id: 'tricep_ext',    label: 'Tricep Ext.',     icon: 'back_hand' },
  { id: 'lateral_raise', label: 'Lateral Raise',   icon: 'open_with' },
  { id: 'deadlift',      label: 'Deadlift',        icon: 'arrow_downward' },
  { id: 'hip_thrust',    label: 'Hip Thrust',      icon: 'chair' },
  { id: 'sideplank',     label: 'Side Plank',      icon: 'rotate_90_degrees_cw' },
  { id: 'boxjump',       label: 'Box Jumps',       icon: 'upload_file' },
  { id: 'pullup',        label: 'Pull-Ups',        icon: 'keyboard_arrow_up' },
  { id: 'calfraise',     label: 'Calf Raises',     icon: 'footprint' },
];

export const TRACKED_SLUGS = new Set(WORKOUT_OPTIONS_META.map(o => o.id));

// Normalized alias → slug (null = not trackable by camera)
const ALIAS_MAP_RAW = {
  // Squat family
  'barbell back squat': 'squat',
  'back squat': 'squat',
  'bodyweight squats': 'squat',
  'goblet squats': 'squat',
  'jump squats': 'squat',
  'front squat': 'squat',
  'bulgarian split squat': 'squat',
  'squats': 'squat',
  'squat': 'squat',
  'leg press': 'squat',

  // Push family
  'flat barbell bench press': 'pushup',
  'barbell bench press': 'pushup',
  'push ups': 'pushup',
  'push ups': 'pushup',
  'push up': 'pushup',
  'push-ups': 'pushup',
  'push up to renegade row': 'pushup',
  'incline dumbbell press': 'pushup',
  'incline db press chest supported row superset': 'pushup',
  'cable fly lat pulldown superset': 'pushup',
  'pushup': 'pushup',
  'weighted pushup': 'pushup',
  'bench press': 'pushup',

  // Pull / row family
  'bent over barbell row': 'pullup',
  'barbell bent over row': 'pullup',
  'single arm dumbbell row': 'pullup',
  'assisted pull up or inverted row': 'pullup',
  'weighted pull ups': 'pullup',
  'pull ups': 'pullup',
  'pull-up': 'pullup',
  'seated cable row': 'pullup',
  'resistance band rows': 'pullup',
  'cable fly lat pulldown': 'pullup',

  // Plank family
  'plank hold': 'plank',
  'weighted plank': 'plank',
  'plank shoulder taps': 'plank',
  'plank': 'plank',
  'side plank': 'sideplank',
  'sideplank': 'sideplank',

  // Overhead / shoulder
  'standing overhead press': 'overhead',
  'standing barbell overhead press': 'overhead',
  'conventional deadlift': 'deadlift',
  'romanian deadlift': 'deadlift',
  'deadlift': 'deadlift',
  'overhead': 'overhead',
  'oh press': 'overhead',
  'db shoulder press face pull superset': 'overhead',

  // Dips / triceps
  'weighted dips': 'dip',
  'dips': 'dip',
  'dip': 'dip',
  'triceps rope pushdown': 'tricep_ext',
  'tricep ext': 'tricep_ext',
  'lateral raise': 'lateral_raise',
  'cable lateral raise': 'lateral_raise',

  // Bicep
  'barbell bicep curl': 'bicep_curl',
  'bicep curl': 'bicep_curl',
  'bicep curls': 'bicep_curl',

  // Lunge / hinge
  'walking lunges': 'lunge',
  'lunges': 'lunge',
  'lunge': 'lunge',
  'deep lunge hip opener': 'lunge',
  'hip thrust': 'hip_thrust',
  'kettlebell swings': 'hip_thrust',
  'glute bridges': 'glute_bridge',
  'glute bridge': 'glute_bridge',
  'box jumps': 'boxjump',
  'boxjumps': 'boxjump',

  // Cardio / dynamic
  'burpees': 'burpee',
  'burpee': 'burpee',
  'jumping jacks': 'jumpingjack',
  'mountain climbers': 'mountainclimb',
  'high knees': 'highknee',
  'crunches': 'crunch',
  'sit ups': 'situp',
  'hanging knee raise': 'crunch',
  'hanging leg raise': 'crunch',
  'dead bug': 'crunch',
  'crunch': 'crunch',
  'situp': 'situp',
  'sprint intervals': 'highknee',
  'hill sprints or resisted intervals': 'highknee',
  'calf raises': 'calfraise',
  'standing calf raise': 'calfraise',
  'calfraise': 'calfraise',

  // Explicitly untracked (mobility/recovery/gym machines)
  'world s greatest stretch': null,
  'band pvc shoulder pass throughs': null,
  'ankle rocks': null,
  'pallof press': null,
  'brisk walk': null,
  'full rest day': null,
  'foam rolling full body': null,
  'hip 90 90 stretch': null,
  'thoracic spine rotations': null,
  'light cycling or walking': null,
  'lying leg curl': null,
  'easy paced walk': null,
  'jog bike row moderate pace': null,
  'easy run bike row': null,
  'tempo intervals': null,
  'bike or row cross train': null,
  'hip flexor stretch': null,
  'hamstring stretch': null,
  'foam roll calves it band': null,
  'long steady run bike': null,
  'standing hamstring stretch': null,
  'quad stretch': null,
  'calf stretch': null,
  'doorway chest stretch': null,
  'cross body shoulder stretch': null,
  'thoracic extension stretch': null,
  'seated spinal twist': null,
  'cat cow flow': null,
  'full body flow sequence': null,
  'standing forward fold': null,
  'single leg hamstring stretch': null,
  'child s pose': null,
  'long held passive stretch sequence': null,
  'diaphragmatic breathing': null,
  'rest reflect': null,
};

// Normalized map for fast lookup
function normalize(name = '') {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

const ALIAS_MAP = new Map();
for (const [k, v] of Object.entries(ALIAS_MAP_RAW)) {
  ALIAS_MAP.set(normalize(k), v);
}

export function getExerciseSlug(name) {
  if (!name) return null;
  const slug = ALIAS_MAP.get(normalize(name));
  if (slug !== undefined) return slug; // may be null (explicit untracked)
  // fallback: try to match label or id directly
  const n = normalize(name);
  for (const opt of WORKOUT_OPTIONS_META) {
    if (normalize(opt.label) === n || normalize(opt.id) === n) return opt.id;
  }
  return null;
}

export function isTrackedExercise(nameOrSlug) {
  const slug = TRACKED_SLUGS.has(nameOrSlug) ? nameOrSlug : getExerciseSlug(nameOrSlug);
  return slug != null && TRACKED_SLUGS.has(slug);
}

export function getExerciseMeta(slug) {
  return WORKOUT_OPTIONS_META.find(o => o.id === slug) || null;
}

// Re-export for components that need full list without circular import
export const WORKOUT_OPTIONS = WORKOUT_OPTIONS_META;

export const UNTRACKED_LABEL = 'Mobility / Rest';
