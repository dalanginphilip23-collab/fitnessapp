import { useState, useEffect } from "react";
import Icon from "./Icon";
import { useNavigate, useLocation } from "react-router-dom";
import { navList } from "../constants/nav";
import MobileNav from "./MobileNav";

export default function SidebarAnalytics({ onExpandChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggle = (val) => {
    setIsExpanded(val);
    onExpandChange?.(val);
  };

  useEffect(() => {
    localStorage.setItem("activePath", location.pathname);
  }, [location.pathname]);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        onMouseEnter={() => toggle(true)}
        onMouseLeave={() => toggle(false)}
        className={`hidden md:flex flex-col py-8 border-r border-[var(--border-light)] bg-[var(--bg-secondary)] transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] sticky top-0 h-screen z-[100] ${
          isExpanded ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="px-6 mb-12 flex items-center gap-4 overflow-hidden">
          <div className="w-8 h-8 rounded bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <Icon name="bolt" className="text-[#161f00] text-lg" fill={1} />
          </div>
          <div className={`transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
            <p className="text-[var(--accent)] font-black font-['Manrope'] tracking-tighter uppercase whitespace-nowrap">Vitalis Fit</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-2">
          {navList.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-6 px-7 py-4 transition-all relative group ${
                  isActive
                    ? "text-[var(--accent)] bg-[var(--bg-active)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <Icon name={item.icon} fill={isActive ? 1 : 0} />
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity duration-300 whitespace-nowrap ${isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[var(--accent)] rounded-l-full shadow-[0_0_15px_var(--accent)]" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <MobileNav items={navList} />
    </>
  );
}