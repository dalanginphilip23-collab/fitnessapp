import { API_BASE_URL } from '../config/port';

export const handleLogout = async () => {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', 
    });
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    window.location.href = '/login'; 
  }
};