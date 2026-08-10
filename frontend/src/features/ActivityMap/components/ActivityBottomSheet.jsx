import React, { useState, useEffect } from 'react';

// Mobile bottom sheet for the Strava-style layout. Holds the finished-run
// summary / activity detail. Toggles between a compact peek and an expanded
// panel via the drag handle. Content scrolls when expanded.

const ActivityBottomSheet = ({ open, onClose, children, label = 'Activity' }) => {
  const [expanded, setExpanded] = useState(false);

  // Reset to collapsed whenever a new activity opens
  useEffect(() => {
    if (open) setExpanded(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[950] pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div
        className={`pointer-events-auto bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-medium)] shadow-2xl transition-[max-height,height] duration-300 ease-out ${
          expanded ? 'h-[72vh]' : 'h-auto'
        }`}
        style={{ borderRadius: '24px 24px 0 0' }}
      >
        {/* Drag handle */}
        <div className="flex flex-col items-center pt-2.5 pb-1 cursor-pointer select-none" onClick={() => setExpanded(e => !e)}>
          <div className="w-10 h-1 rounded-full bg-[var(--border-heavy)]" />
          <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] mt-1.5">
            {expanded ? 'Tap to collapse' : label}
          </p>
        </div>

        {/* Content */}
        <div className={`px-4 pb-6 ${expanded ? 'overflow-y-auto max-h-[calc(72vh-44px)] no-scrollbar' : 'overflow-hidden'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ActivityBottomSheet;
