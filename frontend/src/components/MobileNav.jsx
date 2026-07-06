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
    // Outer wrapper handles the "floating" positioning: inset from the
    // screen edges instead of pinned flush to them, plus safe-area padding
    // so it clears the home-indicator on iOS.
    <div
      className="md:hidden fixed left-3 right-3 z-70"
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <nav
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '9999px',
          boxShadow:
            '0 8px 30px rgb(0 0 0 / 0.12), 0 2px 8px rgb(0 0 0 / 0.08)',
        }}
        className="h-16 backdrop-blur-xl border border-(--border-light) flex justify-around items-center px-2 mx-auto max-w-md"
      >
        {items.map((item) => {
          const key = item.label || item.name;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={key}
              onClick={() => handleNavClick(item.path)}
              className={`relative flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer transition-all duration-300 outline-none h-full w-full ${
                isActive ? 'text-(--accent)' : 'text-(--text-muted)'
              }`}
            >
              <div
                className={`relative flex items-center justify-center transition-transform duration-300 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute inset-[-6px] rounded-full"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}
                  />
                )}
                <Icon
                  name={item.icon}
                  className="relative text-[20px] min-w-5 shrink-0"
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
            className="relative flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer transition-all duration-300 outline-none h-full w-full text-(--text-muted) hover:text-(--accent)"
          >
            <div className="relative flex items-center justify-center transition-transform duration-300 scale-100">
              <Icon
                name="feedback"
                className="text-[20px] min-w-5 shrink-0"
                fill={0}
              />
            </div>
          </button>
        )}
      </nav>
    </div>
  );
};

export default MobileNav;