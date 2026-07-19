import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Icon from './Icon';
import { NAV_ITEMS } from '../constant/nav';
import FeedbackModal from './FeedbackModal';
import MobileNav from './MobileNav';

const Sidebar = ({ onClick, expanded, setExpanded }) => {
  const location = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    localStorage.setItem('activePath', location.pathname);
  }, [location.pathname]);

  return (
    <>
      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}

      {/* ── Desktop Sidebar ── */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`
          hidden md:flex fixed left-0 top-0 h-full flex-col
          bg-(--bg-secondary) border-r border-(--border-light)
          py-7 z-60 overflow-hidden
          transition-all duration-400 ease-in-out
          ${expanded ? 'w-60' : 'w-18'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3.5 px-5 mb-9 overflow-hidden">
          <div className="min-w-8 h-8 bg-(--accent) flex items-center justify-center rounded-md shrink-0">
            <Icon name="pulse_alert" fill={1} weight={400} className="text-[#161f00] text-[18px]" />
          </div>
          <span
            className={`font-['Manrope'] font-black tracking-[0.2em] text-[13px] text-(--accent) whitespace-nowrap transition-opacity duration-200 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            VITALIS
          </span>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                title={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-4.5 px-5 h-11 whitespace-nowrap overflow-hidden
                  text-[11px] uppercase tracking-[0.15em] no-underline transition-all duration-200
                  ${
                    isActive
                      ? 'text-(--accent) border-r-2 border-(--accent) bg-(--bg-active)'
                      : 'text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-secondary)'
                  }
                `}
              >
                <Icon
                  name={item.icon}
                  className="text-[20px] min-w-5 shrink-0"
                  fill={isActive ? 1 : 0}
                />
                <span
                  className={`transition-opacity duration-200 ${
                    expanded ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="border-t border-(--border-light) pt-2">
          <button
            onClick={() => setShowFeedback(true)}
            title="Feedback"
            aria-label="Feedback"
            className="w-full flex items-center gap-4.5 px-5 h-11 text-[11px] uppercase tracking-[0.15em] text-(--text-muted) hover:text-(--accent) hover:bg-(--accent-bg) whitespace-nowrap overflow-hidden transition-colors duration-200 border-none bg-transparent cursor-pointer"
          >
            <Icon name="feedback" className="text-[20px] min-w-5 shrink-0" />
            <span
              className={`transition-opacity duration-200 ${
                expanded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Feedback
            </span>
          </button>
          <button
            onClick={onClick}
            title="Logout"
            aria-label="Logout"
            className="w-full flex items-center gap-4.5 px-5 h-11 text-[11px] uppercase tracking-[0.15em] text-(--text-muted) hover:text-(--text-secondary) whitespace-nowrap overflow-hidden transition-colors duration-200 border-none bg-transparent cursor-pointer"
          >
            <Icon name="logout" className="text-[20px] min-w-5 shrink-0" />
            <span
              className={`transition-opacity duration-200 ${
                expanded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <MobileNav items={NAV_ITEMS} onFeedback={() => setShowFeedback(true)} />
    </>
  );
};

export default Sidebar;