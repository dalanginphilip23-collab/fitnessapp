import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';
import { API_BASE_URL } from '../config/port';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationSystem';
import { getSettingsItems } from '../constant/nav';
import { createPortal } from 'react-dom';
import ThemeToggle from './ThemeToggle';
import FeedbackModal from './FeedbackModal';

const NAV_LINKS = [
  { name: 'Overview',       path: '/dashboard',               icon: 'grid_view' },
  { name: 'Meal Tracker',   path: '/dashboard/meal-tracker',   icon: 'restaurant' },
  { name: 'Virtual Clinic', path: '/dashboard/virtual-clinic', icon: 'medical_services' },
];

/* ══════════════════════════════════════════════════════════════
   NOTIFICATION OVERLAY
══════════════════════════════════════════════════════════════ */
function NotificationOverlay({ notifications, onMarkRead, onMarkAllRead, onClose }) {
  const [filter, setFilter] = useState('recent');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isMobile]);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayed = filter === 'recent' ? notifications.slice(0, 10) : notifications;

  const innerContent = (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--border-light) bg-(--surface)">
        <div className="flex items-center gap-2">
          <Icon name="notifications" className="text-(--accent) text-[16px]" />
          <span className="text-[13px] font-bold text-(--text-primary) tracking-tight">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-black bg-(--accent) text-[#131313] px-1.5 py-0.5 rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onMarkAllRead} className="text-[11px] text-(--accent)/80 hover:text-(--accent) transition-colors bg-transparent border-none cursor-pointer font-medium whitespace-nowrap px-1">
            Mark all read
          </button>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg bg-(--bg-hover) hover:bg-(--bg-active) transition-colors border-none cursor-pointer">
            <Icon name="close" className="text-(--text-muted) text-[14px]" />
          </button>
        </div>
      </div>

      <div className="flex bg-(--bg-tertiary) border-b border-(--border-light)">
        {['recent', 'all'].map(tab => (
          <button
            key={tab}
            onClick={(e) => { e.stopPropagation(); setFilter(tab); }}
            className={`flex-1 py-2.5 text-[12px] font-semibold transition-all border-none cursor-pointer
              ${filter === tab ? 'text-(--accent) border-b-2 border-(--accent) bg-(--accent-bg)' : 'text-(--text-muted) hover:text-(--text-secondary) bg-transparent'}`}
          >
            {tab === 'recent' ? 'Recent' : `All (${notifications.length})`}
          </button>
        ))}
      </div>

      <div
        className="overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{
          maxHeight: isMobile ? '55dvh' : '340px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="material-icons text-[40px] text-(--text-disabled)">notifications_none</span>
            <p className="text-[12px] text-(--text-muted) m-0 font-medium">No notifications yet</p>
          </div>
        ) : (
          displayed.map((notif) => (
            <div
              key={notif.id}
              onClick={(e) => { e.stopPropagation(); if (!notif.is_read) onMarkRead(notif.id); }}
              className={`flex items-start gap-3 px-4 py-3.5 border-b border-(--border-light) transition-all duration-150
                ${notif.is_read ? 'bg-(--bg-card) cursor-default' : 'bg-(--accent-bg) active:bg-(--accent-border) hover:bg-(--accent-bg) cursor-pointer'}`}
            >
              <div className="mt-1.5 shrink-0">
                {notif.is_read
                  ? <div className="w-1.5 h-1.5 rounded-full bg-(--text-muted) border border-(--border-medium)" />
                  : <div className="w-2 h-2 rounded-full bg-(--accent) shadow-[0_0_6px_var(--accent)] animate-pulse" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] leading-relaxed m-0 wrap-break-word font-medium ${notif.is_read ? 'text-(--text-muted)' : 'text-(--text-secondary)'}`}>{notif.message}</p>
                <p className={`text-[10px] mt-1 m-0 font-medium ${notif.is_read ? 'text-(--text-disabled)' : 'text-(--text-muted)'}`}>
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>
              {!notif.is_read
                ? <span className="shrink-0 mt-1 text-[9px] font-black bg-(--accent)/20 text-(--accent) px-1.5 py-0.5 rounded-full whitespace-nowrap border border-(--accent-border)">NEW</span>
                : <span className="shrink-0 mt-1 text-[9px] font-medium text-(--text-disabled) whitespace-nowrap">read</span>
              }
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-(--border-light) bg-(--bg-tertiary) flex items-center justify-between">
        <span className="text-[11px] font-medium">
          {unreadCount > 0
            ? <span className="text-(--accent)/70">{unreadCount} unread</span>
            : <span className="text-(--text-disabled)">All caught up ✓</span>
          }
        </span>
        <span className="text-[10px] text-(--text-disabled)">{notifications.length} total</span>
      </div>
    </>
  );

  if (isMobile) {
    return createPortal(
      <div
        id="notif-portal"
        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          style={{ width: '100%', maxWidth: '400px', maxHeight: '80dvh', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {innerContent}
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="absolute right-0 top-[calc(100%+10px)] w-95 bg-(--bg-secondary) border border-(--border-medium) rounded-2xl shadow-(--shadow-lg) overflow-hidden z-9999">
      {innerContent}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TOPBAR
══════════════════════════════════════════════════════════════ */
const Topbar = ({ sidebarExpanded, userId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useNotification();
  const { logout, user } = useAuth();

  const SETTINGS_ITEMS = getSettingsItems(navigate);

  const [activePath, setActivePath] = useState(
    localStorage.getItem('activeNavPath') || window.location.pathname
  );
  const [userData, setUserData] = useState({
    name:       user?.name   || 'Guest',
    avatar_url: user?.avatar || '',
  });

  const [notifCount,     setNotifCount]     = useState(0);
  const [notifications,  setNotifications]  = useState([]);
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [, setSearchResults]                = useState([]);
  const [settingsOpen,   setSettingsOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFeedback,   setShowFeedback]   = useState(false);

  const settingsRef = useRef(null);
  const notifRef    = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (user?.name || user?.avatar) {
      setUserData(prev => ({
        name:       user.name   || prev.name,
        avatar_url: user.avatar || prev.avatar_url,
      }));
    }
  }, [user?.name, user?.avatar]);

  const handleNavClick = (path) => {
    setActivePath(path);
    localStorage.setItem('activeNavPath', path);
    setMobileMenuOpen(false);
    navigate(path);
  };

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res  = await fetch(`${API_BASE_URL}/api/notifications/${userId}`, { credentials: 'include' });
      const data = await res.json();
      setNotifCount(data.count || 0);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Notif fetch error:', err);
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const portalEl = document.getElementById('notif-portal');
      if (portalEl) return;
      if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchTopbarData = async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/api/dashboard/${userId}`, { credentials: 'include' });
        const data = await res.json();
        if (data.profile) {
          setUserData(prev => ({
            name:       user?.name   || data.profile.name       || prev.name,
            avatar_url: user?.avatar || data.profile.avatar_url || prev.avatar_url,
          }));
        }
      } catch (err) {
        console.error('Topbar fetch error:', err);
      }
    };
    fetchTopbarData();
    fetchNotifications();
  }, [userId, user?.name, user?.avatar, fetchNotifications]);

  useEffect(() => {
    if (!userId) return;

    let es = null;
    let retryTimer = null;
    let retryDelay = 3000;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;

      es = new EventSource(
        `${API_BASE_URL}/api/notifications/stream/${userId}`,
        { withCredentials: true }
      );

      es.onopen = () => {
        retryDelay = 3000;
      };

      es.onmessage = (e) => {
        try {
          const notif = JSON.parse(e.data);
          setNotifCount(prev => prev + 1);
          addToast(notif.message, notif.type);
          fetchNotifications();
        } catch {
          // Ignore malformed SSE payloads
        }
      };

      es.onerror = () => {
        es.close();
        if (!destroyed) {
          retryTimer = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 1.5, 30000);
            connect();
          }, retryDelay);
        }
      };
    };

    connect();

    return () => {
      destroyed = true;
      clearTimeout(retryTimer);
      es?.close();
    };
    // addToast and fetchNotifications are intentionally omitted: this effect
    // manages the SSE connection lifecycle and should only reconnect when the
    // userId changes, not on every re-render of these callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        try {
          const res     = await fetch(`${API_BASE_URL}/api/search?q=${searchQuery}`, { credentials: 'include' });
          const results = await res.json();
          setSearchResults(Array.isArray(results) ? results : []);
        } catch (err) {
          console.error('Search failed', err);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMarkRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'PUT', credentials: 'include' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setNotifCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read failed', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all/${userId}`, { method: 'PUT', credentials: 'include' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setNotifCount(0);
    } catch (err) {
      console.error('Mark all read failed', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

  const avatarSrc = userData.avatar_url
    || user?.avatar
    || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`;

  const handleAvatarError = (e) => {
    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`;
  };

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setSettingsOpen(false);
    setNotifOpen(false);
    setMobileMenuOpen(false);
    localStorage.setItem('activeNavPath', '/dashboard/profile');
    navigate('/dashboard/profile');
  };

  return (
    <>
      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}

      {/* ── Topbar ── */}
      <header
        className={
          'fixed top-0 right-0 h-14 sm:h-15 z-1001 ' +
          'bg-(--bg-secondary)/90 backdrop-blur-xl ' +
          'border-b border-(--border-light) ' +
          'flex items-center justify-between px-3 sm:px-4 md:px-6 ' +
          'transition-all duration-400 ease-in-out ' +
          'left-0 ' + (sidebarExpanded ? 'md:left-64' : 'md:left-18')
        }
      >
        {/* ── Left ── */}
        <div className="flex items-center gap-2 md:gap-9">
          <button
            className="md:hidden p-1 text-(--text-primary) bg-transparent border-none cursor-pointer"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              // Close dropdowns when opening mobile menu
              setNotifOpen(false);
              setSettingsOpen(false);
            }}
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} className="text-[22px] sm:text-[24px]" />
          </button>

          <span className="font-[Manrope] text-[15px] sm:text-[18px] md:pl-6 font-extrabold tracking-tight text-(--text-primary)">
            Vitalis
          </span>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex gap-7 items-center">
            {NAV_LINKS.map((item, i) => (
              <button
                key={i}
                onClick={() => handleNavClick(item.path)}
                className={
                  'font-[Manrope] text-[13px] transition-colors duration-200 border-none bg-transparent cursor-pointer ' +
                  (activePath === item.path ? 'text-(--accent) font-bold' : 'text-(--text-muted) hover:text-(--accent)')
                }
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* Search */}
          <div className="relative hidden sm:flex items-center gap-2 bg-(--bg-hover) border border-(--border-light) rounded-full px-3 sm:px-3.5 py-1.5 focus-within:border-(--accent)/40 focus-within:bg-(--bg-active) transition-all">
            <Icon name="search" className="text-(--text-disabled) text-[14px] sm:text-[15px]" />
            <input
              placeholder="Search stats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-(--text-primary) text-[11px] sm:text-[12px] w-14 sm:w-16 lg:w-36 placeholder-(--text-disabled)"
            />
          </div>

          {/* Notification Bell */}
          <div className="relative flex items-center justify-center" ref={notifRef}>
            <button
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl cursor-pointer group bg-transparent border-none transition-all duration-200 hover:bg-(--bg-hover)"
              onClick={() => {
                // Close mobile menu when opening notification
                if (mobileMenuOpen) setMobileMenuOpen(false);
                setNotifOpen(prev => !prev);
                fetchNotifications();
              }}
            >
              <Icon name="notifications" className={`text-[20px] sm:text-[21px] transition-colors ${notifOpen ? 'text-(--accent)' : 'text-(--text-muted) group-hover:text-(--accent)'}`} />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-(--accent) rounded-full border-[1.5px] border-(--bg-secondary) animate-pulse shadow-[0_0_6px_var(--accent)]" />
              )}
            </button>
            {notifOpen && !mobileMenuOpen && (
              <NotificationOverlay
                notifications={notifications}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
            <ThemeToggle />
          </div>

          {/* Settings */}
          <div className="relative hidden md:flex items-center justify-center" ref={settingsRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Close mobile menu when opening settings
                if (mobileMenuOpen) setMobileMenuOpen(false);
                setSettingsOpen(prev => !prev);
              }}
              className={
                'w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer border-none ' +
                (settingsOpen ? 'bg-(--accent) text-[#131313]' : 'text-(--text-muted) hover:text-(--accent) hover:bg-(--bg-hover) bg-transparent')
              }
            >
              <Icon name="settings" className="text-[20px] sm:text-[21px]" />
            </button>

            {settingsOpen && !mobileMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-52.5 sm:w-55 bg-(--bg-secondary) border border-(--border-medium) rounded-2xl shadow-(--shadow-lg) overflow-hidden z-9999">
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-(--border-light) bg-(--surface)">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-(--accent)/20 bg-(--bg-tertiary) shrink-0">
                    <img src={avatarSrc} alt="User" className="w-full h-full object-cover" onError={handleAvatarError} />
                  </div>
                  <div>
                    <p className="text-[12px] sm:text-[13px] font-bold text-(--text-primary) leading-tight m-0">{userData.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-(--accent)/50 m-0 font-medium">Pro Member</p>
                  </div>
                </div>
                <div className="p-1.5 flex flex-col gap-0.5">
                  {SETTINGS_ITEMS.map(({ icon, label, accent, action }) => (
                    <button
                      key={label}
                      onClick={() => { action(); setSettingsOpen(false); }}
                      className={'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] sm:text-[12px] transition-colors duration-150 text-left cursor-pointer border-none bg-transparent ' + (accent ? 'text-(--accent) hover:bg-(--accent-bg)' : 'text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-hover)')}
                    >
                      <Icon name={icon} className="text-[14px] sm:text-[15px]" />
                      {label}
                    </button>
                  ))}
                  <div className="border-t border-(--border-light) mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] sm:text-[12px] text-[#e05050] hover:bg-[#e05050]/10 transition-colors duration-150 cursor-pointer border-none bg-transparent"
                    >
                      <Icon name="logout" className="text-[14px] sm:text-[15px]" /> Log out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div
            className="flex items-center gap-2 sm:gap-2.5 ml-1 pl-2.5 border-l border-(--border-light) cursor-pointer hover:opacity-75 transition-opacity relative z-999"
            onClick={handleAvatarClick}
          >
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[11px] sm:text-[12px] font-semibold text-(--text-secondary)">{userData.name}</span>
              <span className="text-[9px] sm:text-[10px] text-(--accent)/40 font-medium">Pro Member</span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-(--accent)/20 bg-(--bg-tertiary) shrink-0 ring-1 ring-white/5">
              <img src={avatarSrc} alt="User" className="w-full h-full object-cover" onError={handleAvatarError} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-999 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => {
              setMobileMenuOpen(false);
              setNotifOpen(false);
              setSettingsOpen(false);
            }}
          />
          {/* Drawer panel */}
          <div 
            className="fixed top-14 sm:top-15 left-0 w-60 sm:w-64 h-[calc(100vh-56px)] sm:h-[calc(100vh-60px)] bg-(--bg-secondary) border-r border-(--border-light) z-1000 md:hidden overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col p-3 sm:p-4 gap-1 sm:gap-1.5">

              {/* Section: Menu */}
              <p className="px-3 sm:px-4 pt-1 pb-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-(--text-disabled)">
                Menu
              </p>
              {NAV_LINKS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-medium transition-colors border-none bg-transparent text-left cursor-pointer ${activePath === item.path ? 'bg-(--accent-bg) text-(--accent)' : 'text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-hover)'}`}
                >
                  <Icon
                    name={item.icon}
                    className="text-[16px] sm:text-[17px]"
                    fill={activePath === item.path ? 1 : 0}
                  />
                  {item.name}
                </button>
              ))}

              <div className="h-px bg-(--border-light) my-3 mx-1" />

              {/* Section: Account */}
              <p className="px-3 sm:px-4 pt-1 pb-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-(--text-disabled)">
                Account
              </p>
              

              {SETTINGS_ITEMS.map(({ icon, label, action }) => (
                <button
                  key={label}
                  onClick={() => { action(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-(--text-muted) hover:text-(--text-primary) text-[13px] sm:text-[14px] border-none bg-transparent cursor-pointer rounded-xl hover:bg-(--bg-hover) transition-colors"
                >
                  <Icon name={icon} className="text-[16px] sm:text-[17px]" /> {label}
                </button>
              ))}
              
              {/* Feedback button */}
              <button
                onClick={() => { setShowFeedback(true); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-(--text-muted) hover:text-(--accent) text-[13px] sm:text-[14px] border-none bg-transparent cursor-pointer rounded-xl hover:bg-(--accent-bg) transition-colors"
              >
                <Icon name="feedback" className="text-[16px] sm:text-[17px]" /> Feedback
              </button>

              <div className="h-px bg-(--border-light) my-3 mx-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-[#e05050] text-[13px] sm:text-[14px] border-none bg-transparent cursor-pointer rounded-xl hover:bg-[#e05050]/10 transition-colors"
              >
                <Icon name="logout" className="text-[16px] sm:text-[17px]" /> Logout
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default Topbar;