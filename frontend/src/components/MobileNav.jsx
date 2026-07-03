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
    <nav
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '1rem 1rem 0 0',
      }}
      className="md:hidden fixed bottom-0 left-0 right-0 h-17 backdrop-blur-xl border-t border-(--border-light) flex justify-around items-center px-2 z-70"
    >
      {items.map((item) => {
        const key = item.label || item.name;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={key}
            onClick={() => handleNavClick(item.path)}
            className={`relative flex flex-col items-center justify-center gap-1.5 bg-transparent border-none cursor-pointer transition-all duration-300 outline-none h-full w-full ${
              isActive ? 'text-(--accent)' : 'text-(--text-muted)'
            }`}
          >
            <div
              className={`relative flex items-center justify-center transition-transform duration-300 ${
                isActive ? 'scale-110' : 'scale-100'
              }`}
            >
              <Icon
                name={item.icon}
                className="text-[20px] min-w-5 shrink-0"
                fill={isActive ? 1 : 0}
              />
              {isActive && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-(--accent) rounded-full animate-pulse" />
              )}
            </div>
            {isActive && (
              <div className="absolute bottom-2 w-5 h-0.5 bg-(--accent) rounded-full" />
            )}
          </button>
        );
      })}

      {/* Feedback button */}
      {onFeedback && (
        <button
          onClick={onFeedback}
          className="relative flex flex-col items-center justify-center gap-1.5 bg-transparent border-none cursor-pointer transition-all duration-300 outline-none h-full w-full text-(--text-muted) hover:text-(--accent)"
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
  );
};

export default MobileNav;