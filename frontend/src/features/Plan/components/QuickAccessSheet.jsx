import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { QUICK_ACCESS_ITEMS, QUICK_SPRING, QUICK_X, QUICK_Y } from '../constants';

// QUICK ACCESS SHEET — a springy popup dome that rises out of the top of the
// mobile bottom nav when the "+" is tapped, holding the two quick features.
export default function QuickAccessSheet({ open, onClose }) {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(null);
  const navTimer = useRef(null);

  // Reset closing state when a fresh sheet opens — render-time adjustment
  // instead of synchronous setState inside the effect body.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setClosing(false);
  }

  useEffect(() => {
    if (open) {
      clearTimeout(closeTimer.current);
      clearTimeout(navTimer.current);
    }
  }, [open]);

  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    clearTimeout(navTimer.current);
  }, []);

  const close = () => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setClosing(false);
      onClose();
    }, 180);
  };

  const handleSelect = path => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setClosing(false);
      onClose();
    }, 150);
    navTimer.current = setTimeout(() => navigate(path), 140);
  };

  if (!open && !closing) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[90]" onClick={close}>
      <div
        className="absolute left-1/2 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] flex items-end gap-7"
        style={{ transform: 'translateX(-50%)' }}
        onClick={e => e.stopPropagation()}
      >
        {QUICK_ACCESS_ITEMS.map((item, idx) => (
          <button
            key={item.path}
            onClick={() => handleSelect(item.path)}
            aria-label={item.label}
            className="flex flex-col items-center gap-1.5 border-none bg-transparent cursor-pointer outline-none select-none"
            style={{
              animation: `${closing ? 'popOut' : 'popIn'} 0.4s ${QUICK_SPRING} both`,
              animationDelay: closing ? '0s' : `${0.04 + idx * 0.05}s`,
              '--dx': `${idx === 0 ? QUICK_X : -QUICK_X}px`,
              '--dy': `${QUICK_Y}px`,
            }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center border shadow-lg active:scale-90 transition-transform duration-150"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2, var(--accent)))',
                borderColor: 'rgba(255,255,255,0.35)',
                color: '#fff',
                boxShadow: '0 6px 18px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.12)',
              }}
            >
              <Icon name={item.icon} className="text-[20px]" fill={1} />
            </div>
            <span
              className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: 'rgba(0,0,0,0.18)',
                backdropFilter: 'blur(4px)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}