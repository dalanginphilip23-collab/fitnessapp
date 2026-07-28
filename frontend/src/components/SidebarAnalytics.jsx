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
      <aside
        onMouseEnter={() => toggle(true)}
        onMouseLeave={() => toggle(false)}
        className={`hidden md:flex flex-col py-8 border-r border-(--border-light) bg-(--bg-secondary) transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] sticky top-0 h-screen z-[100] ${
          isExpanded ? "w-64" : "w-20"
        }`}
      >
        <div className="px-6 mb-12 flex items-center gap-4 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-(--accent) flex items-center justify-center flex-shrink-0 shadow-lg shadow-(--accent)/20">
            <Icon name="fitness_center" className="text-[#0a0a0a] text-lg" fill={1} />
          </div>
          <div className={`transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
            <p className="text-(--accent) font-black font-['Manrope'] tracking-tighter uppercase whitespace-nowrap">Vitalis</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-2">
          {navList.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group cursor-pointer border-none ${
                  isActive
                    ? "text-(--accent) bg-(--accent-bg)"
                    : "text-(--text-muted) hover:text-(--text-secondary) hover:bg-(--bg-hover)"
                }`}
              >
                <div className="relative">
                  <Icon name={item.icon} fill={isActive ? 1 : 0} className="text-[20px]" />
                  {isActive && <span className="absolute -right-1 -top-1 w-2 h-2 bg-(--accent) rounded-full animate-ping-slow" />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap ${isExpanded ? "opacity-100" : "opacity-0"}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <MobileNav items={navList} />
    </>
  );
}