export const navList = [
  { name: "Dashboard",      icon: "speed",             path: "/dashboard" },
  { name: "Sleep Stats",    icon: "monitoring",         path: "/dashboard/analytics" },
  { name: "Jogging",        icon: "directions_run",     path: "/dashboard/activity-map" },
  { name: "Workouts",       icon: "exercise",           path: "/dashboard/workouts" },
  { name: "Logs",           icon: "history",            path: "/dashboard/logs" },
];

export const NAV_ITEMS = [
  { icon: 'dashboard',         label: 'Overview',   path: '/dashboard' },
  { icon: 'monitor_heart',     label: 'Metrics',    path: '/dashboard/analytics' },
  { icon: 'book',              label: 'Plans',      path: '/dashboard/plans' },
  { icon: 'chat',              label: 'Community',  path: '/dashboard/messenger' },
];

export const getSettingsItems = (navigate, notify) => [
  { icon: 'person',        label: 'Profile',        accent: true, action: () => navigate('/dashboard/profile') },
  { icon: 'tune',          label: 'Preferences',                  action: () => notify?.('Preferences are coming soon', 'info') },
  { icon: 'notifications', label: 'Notifications',               action: () => notify?.('Notification settings are coming soon', 'info') },
  { icon: 'help_outline',  label: 'Help & Support',              action: () => window.open('https://support.vitalis.app', '_blank') },
];