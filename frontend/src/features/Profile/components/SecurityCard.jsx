// components/SecurityCard.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const DEVICE_ICONS = {
  desktop: 'laptop_mac',
  mobile: 'smartphone',
  tablet: 'tablet_mac',
};

function getDeviceIcon(deviceType) {
  return DEVICE_ICONS[deviceType?.toLowerCase()] ?? 'devices';
}

function formatLastActive(timestamp, isCurrent) {
  if (isCurrent) return null;
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

const SessionItem = ({ session, onRevoke }) => {
  const icon = getDeviceIcon(session.device_type);
  const lastActive = formatLastActive(session.last_active, session.is_current);
  const location =
    [session.city, session.country].filter(Boolean).join(', ') || 'Unknown location';
  const label = `${session.browser} on ${session.os}`;

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2.5 rounded-xl border transition-all
        ${session.is_current
          ? 'bg-[#c7f248]/[0.04] border-[#c7f248]/10'
          : 'border-transparent hover:bg-[var(--bg-hover)] hover:border-[var(--border-light)]'
        }`}
    >
      {/* Device icon */}
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0
          ${session.is_current
            ? 'bg-[#c7f248]/10 text-[#c7f248]'
            : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
          }`}
      >
        <span className="material-symbols-outlined text-[15px] sm:text-[17px]">{icon}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] sm:text-[12px] font-semibold text-[var(--text-primary)] truncate">{label}</p>
        <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {session.is_current ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c7f248] inline-block animate-pulse flex-shrink-0" />
              <span className="truncate">Active now · {location}</span>
            </>
          ) : (
            <span className="truncate">{lastActive} · {location}</span>
          )}
        </p>
      </div>

      {/* Badge / action */}
      {session.is_current ? (
        <span className="flex-shrink-0 text-[8px] font-black tracking-[0.12em] uppercase
          bg-[#c7f248]/10 text-[#c7f248] border border-[#c7f248]/20 px-1.5 sm:px-2 py-0.5 rounded-md whitespace-nowrap">
          Current
        </span>
      ) : (
        <button
          onClick={() => onRevoke?.(session.id)}
          className="flex-shrink-0 text-[9px] font-bold uppercase tracking-widest
            text-red-400/60 hover:text-red-400 border border-transparent
            hover:border-red-500/25 hover:bg-red-500/[0.08]
            px-2 sm:px-2.5 py-1 rounded-lg transition-all whitespace-nowrap"
        >
          Revoke
        </button>
      )}
    </div>
  );
};

const SecurityCard = ({ sessions = [], onRevoke }) => {
  const current = sessions.find((s) => s.is_current);
  const others = sessions.filter((s) => !s.is_current);

  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl p-4 sm:p-6">
      <p className="text-[9px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)] mb-4 sm:mb-5">
        Active sessions
      </p>

      {sessions.length === 0 && (
        <p className="text-[11px] text-[var(--text-disabled)] py-4 text-center">
          No active sessions found.
        </p>
      )}

      {/* Current device */}
      {current && (
        <div className="mb-3 sm:mb-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-disabled)] mb-2 pl-1">
            This device
          </p>
          <SessionItem session={current} onRevoke={onRevoke} />
        </div>
      )}

      {/* Other devices */}
      {others.length > 0 && (
        <>
          <div className="h-px bg-[var(--border-light)] mb-3 sm:mb-4" />
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-disabled)] mb-2 pl-1">
            Other devices
          </p>
          <div className="space-y-1 max-h-56 sm:max-h-64 overflow-y-auto pr-1
            scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-transparent">
            {others.map((session) => (
              <SessionItem key={session.id} session={session} onRevoke={onRevoke} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default SecurityCard;