import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';
import { NAV_ITEMS } from '../constant/nav';

const MobileNav = ({ items = NAV_ITEMS, onFeedback }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('activeNavPath', location.pathname);
  }, [location.pathname]);

  const handleNavClick = (path) => {
    localStorage.setItem('activeNavPath', path);
    navigate(path);
  };

  return (
    // Floating pill bar: inset from all edges with its own rounded card
    // and shadow (matches reference), instead of a flush docked bar.
    // Safe-area handled as bottom margin so the pill never sits under
    // the iOS home indicator.
    <nav
      className="md:hidden fixed left-3 right-3 bottom-3 z-70"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="flex justify-around items-center w-full h-16 px-2 rounded-[28px] border border-(--border-light) shadow-(--shadow-lg)"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {items.map((item) => {
          const key = item.label || item.name;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={key}
              onClick={() => handleNavClick(item.path)}
              className="relative flex flex-col items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-300 outline-none h-full flex-1 min-w-11"
            >
              <div
                className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-(--accent) scale-105' : 'scale-100'
                }`}
              >
                <Icon
                  name={item.icon}
                  className={`relative text-[20px] min-w-5 shrink-0 transition-colors duration-300 ${
                    isActive ? 'text-[#161f00]' : 'text-(--text-muted)'
                  }`}
                  fill={isActive ? 1 : 0}
                />
              </div>
            </button>
          );
        })}

        {/* Feedback button */}
        {onFeedback && (
          <button
            onClick={onFeedback}
            className="relative flex flex-col items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-300 outline-none h-full flex-1 min-w-11 text-(--text-muted) hover:text-(--accent)"
          >
            <div className="relative flex items-center justify-center w-11 h-11">
              <Icon
                name="feedback"
                className="text-[20px] min-w-5 shrink-0"
                fill={0}
              />
            </div>
          </button>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;