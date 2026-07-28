import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Icon from './Icon';
import { NAV_ITEMS } from '../constants/nav';
import FeedbackModal from './FeedbackModal';
import MobileNav from './MobileNav';

const Sidebar = ({ onClick, expanded, setExpanded, onFeedback }) => {
  const location = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('activePath', location.pathname);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => { setExpanded(false); setHoveredItem(null); }}
        className="hidden md:flex fixed left-0 top-0 h-full flex-col bg-(--bg-secondary) border-r border-(--border-light) py-6 z-60 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ width: expanded ? 240 : 72 }}
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
                onClick={handleNavClick}
                className={`flex items-center gap-4 px-3 h-11 rounded-xl whitespace-nowrap overflow-hidden text-[11px] uppercase tracking-[0.12em] no-underline transition-all duration-200 ${
                  isActive
                    ? 'text-(--accent) bg-(--accent-bg) font-bold'
                    : 'text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-secondary)'
                }`}
              >
                <div className="relative">
                  <Icon
                    name={item.icon}
                    className={`text-[20px] min-w-5 shrink-0 transition-transform duration-200 ${isHovered && !isActive ? 'scale-110' : ''}`}
                    fill={isActive ? 1 : 0}
                  />
                  {isActive && (
                    <span className="absolute -right-1 -top-1 w-2 h-2 bg-(--accent) rounded-full" />
                  )}
                </div>
                <span className={`transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
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
            <span className={`transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>Feedback</span>
          </button>
          <button
            onClick={onClick}
            className="w-full flex items-center gap-4 px-3 h-10 rounded-xl text-[11px] uppercase tracking-[0.12em] text-(--text-muted) hover:text-(--text-secondary) hover:bg-(--bg-hover) whitespace-nowrap overflow-hidden transition-all duration-200 border-none bg-transparent cursor-pointer"
          >
            <Icon name="logout" className="text-[20px] min-w-5 shrink-0" />
            <span className={`transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[2000]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-(--bg-secondary) border-r border-(--border-light) animate-slide-in-right shadow-2xl flex flex-col py-6">
            <div className="flex items-center justify-between px-4 mb-8">
              <div className="flex items-center gap-3.5">
                <div className="min-w-8 h-8 bg-(--accent) flex items-center justify-center rounded-lg shrink-0 shadow-lg shadow-(--accent)/20">
                  <Icon name="fitness_center" fill={1} weight={400} className="text-[#0a0a0a] text-[18px]" />
                </div>
                <span className="font-['Manrope'] font-black tracking-[0.15em] text-[14px] text-(--accent) whitespace-nowrap">VITALIS</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-(--bg-hover) flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) transition-all border-none cursor-pointer"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1 px-3">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3.5 px-3 h-12 rounded-xl text-[12px] uppercase tracking-[0.1em] no-underline transition-all duration-200 ${
                      isActive
                        ? 'text-(--accent) bg-(--accent-bg) font-bold'
                        : 'text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-secondary)'
                    }`}
                  >
                    <Icon name={item.icon} className="text-[22px] min-w-5 shrink-0" fill={isActive ? 1 : 0} />
                    <span>{item.label}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-(--accent)" />}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-(--border-light) pt-2 px-3">
              <button
                onClick={() => { setShowFeedback(true); setMobileOpen(false); }}
                className="w-full flex items-center gap-3.5 px-3 h-12 rounded-xl text-[12px] uppercase tracking-[0.1em] text-(--text-muted) hover:text-(--accent) hover:bg-(--accent-bg) transition-all duration-200 border-none bg-transparent cursor-pointer"
              >
                <Icon name="feedback" className="text-[22px] min-w-5 shrink-0" />
                <span>Feedback</span>
              </button>
              <button
                onClick={() => { onClick?.(); setMobileOpen(false); }}
                className="w-full flex items-center gap-3.5 px-3 h-12 rounded-xl text-[12px] uppercase tracking-[0.1em] text-(--text-muted) hover:text-(--text-secondary) hover:bg-(--bg-hover) transition-all duration-200 border-none bg-transparent cursor-pointer"
              >
                <Icon name="logout" className="text-[22px] min-w-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <MobileNav items={NAV_ITEMS} onFeedback={() => setShowFeedback(true)} />
    </>
  );
};

export default Sidebar;