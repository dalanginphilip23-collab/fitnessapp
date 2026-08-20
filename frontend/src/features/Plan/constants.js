export const REST_ACTIVITY_TYPES = new Set(['Recovery', 'Mobility', 'Flexibility']);

export const INTENSITY_OPTIONS = ['All', 'Beginner', 'Moderate', 'Advanced', 'Extreme'];
export const FOCUS_OPTIONS     = ['All', 'Strength', 'Cardio', 'Flexibility', 'Recovery', 'Fat Loss', 'Hypertrophy'];
export const DURATION_OPTIONS  = ['All', '1 Week', '2 Weeks', '4 Weeks', '8 Weeks', '12 Weeks'];

export const CATEGORIES = [
  { label: 'All',         icon: 'grid_view',             tag: null },
  { label: 'Strength',    icon: 'fitness_center',        tag: 'Strength' },
  { label: 'Fat Loss',    icon: 'local_fire_department', tag: 'Fat Loss' },
  { label: 'Recovery',    icon: 'spa',                   tag: 'Recovery' },
  { label: 'Cardio',      icon: 'directions_run',        tag: 'Cardio' },
  { label: 'Flexibility', icon: 'self_improvement',      tag: 'Flexibility' },
];

export const TABS = [
  { id: 'my-plans', label: 'My Plans',  icon: 'bookmarks' },
  { id: 'find',     label: 'Find Plan', icon: 'search'    },
  { id: 'explore',  label: 'Explore',   icon: 'explore'   },
];

export const QUICK_ACCESS_ITEMS = [
  { label: 'Meal Tracker',   icon: 'restaurant',       path: '/dashboard/meal-tracker' },
  { label: 'Virtual Clinic', icon: 'medical_services', path: '/dashboard/virtual-clinic' },
];

export const QUICK_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
export const QUICK_X = 36;   // horizontal distance from FAB center to each icon
export const QUICK_Y = 72;   // vertical rise from the FAB to the resting row