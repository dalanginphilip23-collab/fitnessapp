import { handleLogout } from './../utils/logout';

export const navList = [
  { name: "Dashboard",   icon: "speed",          path: "/dashboard" },
  { name: "Sleep Stats", icon: "monitoring",      path: "/dashboard/analytics" },
  { name: "Jogging",     icon: "directions_run",  path: "/dashboard/activity-map" },
  { name: "Workouts",    icon: "exercise",        path: "/dashboard/workouts" },
  { name: "Logs",        icon: "history",         path: "/dashboard/logs" },
];

export const NAV_ITEMS = [
  { icon: 'dashboard',     label: 'Overview',   path: '/dashboard' },
  { icon: 'monitor_heart', label: 'Biometrics', path: '/dashboard/analytics' },
  { icon: 'calculate',     label: 'BMI',        path: '/dashboard/bmi' },
  { icon: 'book',          label: 'Plans',      path: '/dashboard/plans' },
  { icon: 'chat',          label: 'Community',  path: '/dashboard/messenger' },
];

// `notify` is an optional toast callback, e.g. (message) => addToast(message, 'info').
// Preferences/Notifications don't have real pages yet, so instead of navigating to a
// route that doesn't exist (which silently bounces the user to "/"), we surface a
// "coming soon" toast. Once those pages ship, swap the action back to navigate(...).
export const getSettingsItems = (navigate, notify) => [
  { icon: 'person',        label: 'Profile',        accent: true, action: () => navigate('/dashboard/profile') },
  { icon: 'tune',          label: 'Preferences',                  action: () => notify?.('Preferences are coming soon') },
  { icon: 'notifications', label: 'Notifications',               action: () => notify?.('Notification settings are coming soon') },
  { icon: 'help_outline',  label: 'Help & Support',              action: () => window.open('https://support.vitalis.app', '_blank') },
];