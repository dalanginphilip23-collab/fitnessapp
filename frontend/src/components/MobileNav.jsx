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
    // Docked bottom bar: flush to left/right/bottom edges, no floating
    // inset, no rounded pill. Safe-area folded into the bar's own height
    // so the background still reaches the very bottom edge on iOS.
    <nav
      className="md:hidden fixed left-0 right-0 bottom-0 z-[70] border-t border-(--border-light) flex items-center"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center w-full h-16 px-1">
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