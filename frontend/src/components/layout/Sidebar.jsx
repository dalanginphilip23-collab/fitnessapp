import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Icon from "../ui/Icon";
import { NAV_ITEMS } from "../../constants/nav";
import FeedbackModal from "../ui/FeedbackModal";
import MobileNav from "./MobileNav";
import logo from "../../assets/logo.png";

const Sidebar = ({ onClick, expanded, setExpanded }) => {
  const location = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    localStorage.setItem("activePath", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    window.__openMobileSidebar = () => setMobileOpen(true);
    return () => {
      delete window.__openMobileSidebar;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      {/* ── Desktop Sidebar ── */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => {
          setExpanded(false);
          setHoveredItem(null);
        }}
        className={`
          hidden md:flex fixed left-0 top-0 h-full flex-col
          bg-(--bg-secondary) border-r border-(--border-light)
          py-7 z-60 overflow-hidden mesh-gradient-warm
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${expanded ? "w-60" : "w-18"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3.5 px-5 mb-9 overflow-hidden">
          <img
            src={logo}
            alt="Vitalis"
            className="min-w-8 h-8 w-8 rounded-lg shrink-0 shadow-lg shadow-(--accent)/25 object-cover"
          />
          <div
            className={`whitespace-nowrap transition-all duration-300 ${expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
          >
            <span className="font-['Manrope'] font-black tracking-[0.2em] text-[13px] text-(--accent) block leading-tight">
              VITALIS
            </span>
            <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-(--text-muted) block">
              Fitness OS
            </span>
          </div>
        </div>

        {/* Primary nav */}
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
                  group flex items-center gap-4 px-3 h-11 rounded-xl whitespace-nowrap overflow-hidden
                  text-[11px] uppercase tracking-[0.12em] no-underline transition-all duration-200
                  ${
                    isActive
                      ? "text-(--accent) bg-(--accent-bg) font-bold shadow-[0_0_12px_var(--accent-bg)]"
                      : "text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-secondary)"
                  }
                `}
              >
                <div className="relative flex items-center justify-center w-5 h-5">
                  <Icon
                    name={item.icon}
                    className={`text-[20px] min-w-5 shrink-0 transition-all duration-200 ${isHovered && !isActive ? "scale-110 text-(--accent)" : ""}`}
                    fill={isActive ? 1 : 0}
                  />
                  {isActive && (
                    <>
                      <span className="absolute -right-1 -top-0.5 w-2 h-2 bg-(--accent) rounded-full shadow-[0_0_8px_var(--accent)] animate-energy-pulse" />
                    </>
                  )}
                </div>
                <span
                  className={`transition-all duration-200 font-semibold ${
                    expanded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="border-t border-(--border-light) pt-2 px-2">
          <button
            onClick={() => setShowFeedback(true)}
            className="w-full flex items-center gap-4 px-3 h-10 rounded-xl text-[11px] uppercase tracking-[0.12em] text-(--text-muted) hover:text-(--accent-warm) hover:bg-(--accent-warm-bg) whitespace-nowrap overflow-hidden transition-all duration-200 border-none bg-transparent cursor-pointer font-semibold"
          >
            <Icon name="feedback" className="text-[20px] min-w-5 shrink-0" />
            <span
              className={`transition-all duration-200 ${
                expanded ? "opacity-100" : "opacity-0"
              }`}
            >
              Feedback
            </span>
          </button>
          <button
            onClick={onClick}
            className="w-full flex items-center gap-4 px-3 h-10 rounded-xl text-[11px] uppercase tracking-[0.12em] text-(--text-muted) hover:text-(--text-secondary) hover:bg-(--bg-hover) whitespace-nowrap overflow-hidden transition-all duration-200 border-none bg-transparent cursor-pointer font-semibold"
          >
            <Icon name="logout" className="text-[20px] min-w-5 shrink-0" />
            <span
              className={`transition-all duration-200 ${
                expanded ? "opacity-100" : "opacity-0"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[2000]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-(--bg-secondary) border-r border-(--border-light) animate-slide-in-right shadow-2xl flex flex-col py-6 mesh-gradient-warm">
            <div className="flex items-center justify-between px-4 mb-8">
              <div className="flex items-center gap-3.5">
                <img
                  src={logo}
                  alt="Vitalis"
                  className="min-w-8 h-8 w-8 rounded-lg shrink-0 shadow-lg shadow-(--accent)/25 object-cover"
                />
                <div>
                  <span className="font-['Manrope'] font-black tracking-[0.2em] text-[13px] text-(--accent) block leading-tight">
                    VITALIS
                  </span>
                  <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-(--text-muted) block">
                    Fitness OS
                  </span>
                </div>
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
                        ? "text-(--accent) bg-(--accent-bg) font-bold"
                        : "text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-secondary)"
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      className="text-[22px] min-w-5 shrink-0"
                      fill={isActive ? 1 : 0}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-(--accent) shadow-[0_0_6px_var(--accent)]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-(--border-light) pt-2 px-3">
              <button
                onClick={() => {
                  setShowFeedback(true);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3.5 px-3 h-12 rounded-xl text-[12px] uppercase tracking-[0.1em] text-(--text-muted) hover:text-(--accent) hover:bg-(--accent-bg) transition-all duration-200 border-none bg-transparent cursor-pointer"
              >
                <Icon
                  name="feedback"
                  className="text-[22px] min-w-5 shrink-0"
                />
                <span>Feedback</span>
              </button>
              <button
                onClick={() => {
                  onClick?.();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3.5 px-3 h-12 rounded-xl text-[12px] uppercase tracking-[0.1em] text-(--text-muted) hover:text-(--text-secondary) hover:bg-(--bg-hover) transition-all duration-200 border-none bg-transparent cursor-pointer"
              >
                <Icon name="logout" className="text-[22px] min-w-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <MobileNav items={NAV_ITEMS} onFeedback={() => setShowFeedback(true)} />
    </>
  );
};

export default Sidebar;
