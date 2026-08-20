export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Formats an ISO-ish logged_at timestamp into "12:15 PM". Falls back to the
// raw string if it isn't parseable, so we never hide/lose real data.
export function formatMealTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}