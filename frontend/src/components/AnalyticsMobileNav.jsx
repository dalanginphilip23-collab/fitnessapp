import { useLocation } from "react-router-dom";
import { navList } from "../constants/nav";
import Icon from "./Icon";

export default function AnalyticsMobileNav({ navigate }) {
  const location = useLocation();

  const handleNav = (path) => {
    localStorage.setItem("vitalis_activePath", path);
    navigate(path);
  };

  return (
    // Docked bottom bar: flush to left/right/bottom edges, no floating
    // inset, safe-area padding folded into the bar's own height so the
    // background still reaches the very bottom of the screen on iOS.
    <nav
      className="md:hidden fixed left-0 right-0 bottom-0 z-[70] border-t border-[var(--border-light)] flex items-center"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center w-full h-16 px-1">
        {navList.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => handleNav(item.path)}
              className={`relative flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer transition-all duration-[300ms] outline-none h-full flex-1 min-w-11 ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <div className={`relative flex items-center justify-center transition-transform duration-300 ${
                isActive ? 'scale-110' : 'scale-100'
              }`}>
                {isActive && (
                  <span
                    className="absolute inset-[-6px] rounded-full"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}
                  />
                )}
                <Icon
                  name={item.icon}
                  className="relative text-[20px] min-w-[20px] shrink-0"
                  fill={isActive ? 1 : 0}
                />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}