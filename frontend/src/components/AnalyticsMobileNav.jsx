import { useLocation } from "react-router-dom";
import { navList } from "../constant/nav";
import Icon from "./Icon";

export default function AnalyticsMobileNav({ navigate }) {
  const location = useLocation();

  const handleNav = (path) => {
    localStorage.setItem("vitalis_activePath", path);
    navigate(path);
  };

  return (
    <nav
      style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '1rem 1rem 0 0' }}
      className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] backdrop-blur-xl border-t border-[var(--border-light)] flex justify-around items-center px-2 z-[70]"
    >
      {navList.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.name}
            onClick={() => handleNav(item.path)}
            className={`relative flex flex-col items-center justify-center gap-1.5 bg-transparent border-none cursor-pointer transition-all duration-[300ms] outline-none h-full w-full ${
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <div className={`relative flex items-center justify-center transition-transform duration-300 ${
              isActive ? 'scale-110' : 'scale-100'
            }`}>
              <Icon
                name={item.icon}
                className="text-[20px] min-w-[20px] shrink-0"
                fill={isActive ? 1 : 0}
              />
              {isActive && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
              )}
            </div>
            {isActive && (
              <div className="absolute bottom-2 w-5 h-[2px] bg-[var(--accent)] rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}