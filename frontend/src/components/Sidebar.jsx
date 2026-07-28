import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Icon from './Icon';
import { NAV_ITEMS } from '../constants/nav';
import FeedbackModal from './FeedbackModal';
import MobileNav from './MobileNav';

const Sidebar = ({ onClick, expanded, setExpanded }) => {
  const location = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    localStorage.setItem('activePath', location.pathname);
  }, [location.pathname]);

  return (
    <>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => { setExpanded(false); setHoveredItem(null); }}
        className={`
          hidden md:flex fixed left-0 top-0 h-full flex-col
          bg-(--bg-secondary) border-r border-(--border-light)
          py-6 z-60 overflow-hidden
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${expanded ? 'w-60' : 'w-18'}
        `}
      >
        <div className="flex items-center gap-3.5 px-5 mb-8 overflow-hidden">
          <div className="min-w-8 h-8 bg-(--accent) flex items-center justify-center rounded-lg shrink-0 shadow-lg shadow-(--accent)/20">
            <Icon name="fitness_center" fill={1} weight={400} className="text-[#0a0a0a] text-[18px]" />
          </div>
          <span className={`font-['Manrope'] font-black tracking-[0.15em] text-[14px] text-(--accent) whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
            VITALIS
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === item.label;
            return (
              <Link
                key={item.label}
                to={item.path}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  flex items-center gap-4 px-3 h-11 rounded-xl whitespace-nowrap overflow-hidden
                  text-[11px] uppercase tracking-[0.12em] no-underline transition-all duration-200
                  ${isActive
                    ? 'text-(--accent) bg-(--accent-bg) font-bold'
                    : 'text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-secondary)'
                  }
                `}
              >
                <div className="relative">
                  <Icon
                    name={item.icon}
                    className={`text-[20px] min-w-5 shrink-0 transition-all duration-200 ${isHovered && !isActive ? 'scale-110' : ''}`}
                    fill={isActive ? 1 : 0}
                  />
                  {isActive && (
                    <span className="absolute -right-1 -top-1 w-2 h-2 bg-(--accent) rounded-full animate-ping-slow" />
                  )}
                </div>
                <span className={`transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                  {isActive && <span className="ml-2 text-[8px] opacity-60">•</span>}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-(--border-light) pt-2 px-2">
          <button
            onClick={() => setShowFeedback(true)}
            className="w-full flex items-center gap-4 px-3 h-10 rounded-xl text-[11px] uppercase tracking-[0.12em] text-(--text-muted) hover:text-(--accent) hover:bg-(--accent-bg) whitespace-nowrap overflow-hidden transition-all duration-200 border-none bg-transparent cursor-pointer"
          >
            <Icon name="feedback" className="text-[20px] min-w-5 shrink-0" />
            <span className={`transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
              Feedback
            </span>
          </button>
          <button
            onClick={onClick}
            className="w-full flex items-center gap-4 px-3 h-10 rounded-xl text-[11px] uppercase tracking-[0.12em] text-(--text-muted) hover:text-(--text-secondary) hover:bg-(--bg-hover) whitespace-nowrap overflow-hidden transition-all duration-200 border-none bg-transparent cursor-pointer"
          >
            <Icon name="logout" className="text-[20px] min-w-5 shrink-0" />
            <span className={`transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      <MobileNav items={NAV_ITEMS} onFeedback={() => setShowFeedback(true)} />
    </>
  );
};

export default Sidebar;