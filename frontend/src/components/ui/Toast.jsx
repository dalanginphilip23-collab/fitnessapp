// Lightweight centered-pill toast. Callers control visibility by only
// rendering it while a message is present (see MealTracker / Profile).
export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 bg-(--accent) text-[#131313] text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg z-50 whitespace-nowrap">
      {message}
    </div>
  );
}
