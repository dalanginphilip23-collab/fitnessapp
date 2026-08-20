import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import { NAV_ITEMS } from '../../constants/nav';

const MobileNav = ({ items = NAV_ITEMS, onFeedback, onFABClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('activeNavPath', location.pathname);
  }, [location.pathname]);

  const handleNavClick = (path) => {
    localStorage.setItem('activeNavPath', path);
    navigate(path);
  };

  const midIndex = Math.floor(items.length / 2);

  const renderedItems = [];
  for (let i = 0; i < items.length; i++) {
    if (i === midIndex && onFABClick) {
      renderedItems.push(
        <button
          key="fab"
          onClick={onFABClick}
          className="relative flex flex-col items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-200 outline-none h-full flex-1 min-w-12"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-[-6px] rounded-full bg-(--accent)/15 animate-pulse-ring" />
            <div className="w-11 h-11 bg-(--accent) rounded-full flex items-center justify-center shadow-lg shadow-(--accent)/25 transition-transform duration-200 active:scale-90">
              <span className="material-symbols-outlined text-[#131313] text-[28px] font-bold">add</span>
            </div>
          </div>
        </button>
      );
    }

    const item = items[i];
    const key = item.label || item.name;
    const isActive = location.pathname === item.path;
    renderedItems.push(
      <button
        key={key}
        onClick={() => handleNavClick(item.path)}
        className={`relative flex flex-col items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-200 outline-none h-full flex-1 min-w-12 ${
          isActive ? 'text-(--accent)' : 'text-(--text-muted)'
        }`}
      >
        <div
          className={`relative flex items-center justify-center transition-all duration-200 ${
            isActive ? 'scale-110' : 'scale-100'
          }`}
        >
          {isActive && (
            <span
              className="absolute inset-[-8px] rounded-full animate-energy-pulse"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}
            />
          )}
          <Icon
            name={item.icon}
            className="relative text-[22px] min-w-5 shrink-0"
            fill={isActive ? 1 : 0}
          />
        </div>
        {isActive && (
          <span className="absolute top-0 w-6 h-0.5 rounded-full bg-(--accent) shadow-[0_0_8px_var(--accent)]" />
        )}
      </button>
    );
  }

  return (
    <nav
      className="md:hidden fixed left-0 right-0 bottom-0 z-70 border-t border-(--border-light) flex items-center"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center w-full h-[68px] px-1">
        {renderedItems}

        {onFeedback && (
          <button
            onClick={onFeedback}
            className="relative flex flex-col items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-200 outline-none h-full flex-1 min-w-12 text-(--text-muted) hover:text-(--accent-warm)"
          >
            <div className="relative flex items-center justify-center transition-transform duration-200 scale-100">
              <Icon
                name="feedback"
                className="text-[22px] min-w-5 shrink-0"
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
