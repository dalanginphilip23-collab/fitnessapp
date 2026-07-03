import { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/port';

const AuthContext = createContext({
  user: null,
  loading: true,
  refreshAuth: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Rehydrate from localStorage so avatar survives hard refreshes
    // before the /me fetch completes
    try {
      const cached = localStorage.getItem('vitalis_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Keep localStorage in sync whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('vitalis_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('vitalis_user');
    }
  }, [user]);

  const refreshAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.user) {
        setUser(null);
        return;
      }

      // Merge so that avatar_url saved via profile update is never lost.
      // The /me endpoint must return avatar_url — if your backend doesn't
      // yet, add it to the SELECT in the auth/me handler.
      setUser(prev => ({
        ...prev,          // keep any optimistic fields set via setUser()
        ...data.user,     // server is source of truth for everything else
        // Prefer the server avatar; fall back to whatever was cached
        avatar: data.user.avatar_url || data.user.avatar || prev?.avatar || null,
      }));
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('vitalis_user');
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshAuth, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);